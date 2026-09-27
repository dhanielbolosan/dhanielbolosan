// Keep the clip names and their shared type in one place.
const sounds = [
  "select",
  "error",
  "slash",
  "crit",
  "heal",
  "delete",
  "limit",
  "fanfare",
] as const;

export type Sound = (typeof sounds)[number];

// Restore volume once, preserving the previous setting format's mute preference.
export const defaultSoundSettings = { volume: 20 };
const storageKey = "sound-settings";
let settings = defaultSoundSettings;

// Load saved volume and migrate the legacy disabled setting to mute.
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
  if (Number.isFinite(saved?.volume))
    settings = {
      volume:
        saved.enabled === false ? 0 : Math.max(0, Math.min(100, saved.volume)),
    };
} catch {
  // Sound remains usable when storage is unavailable.
}

// Give React a stable snapshot and subscription for the shared volume setting.
const listeners = new Set<() => void>();
export const getSoundSettings = () => settings;

// Register a volume subscriber and return its cleanup function.
export const subscribeSound = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Share one audio context and bounded caches across all mounted windows.
let context: AudioContext | undefined;
let gain: GainNode | undefined;
const buffers = new Map<Sound, AudioBuffer>();
const loading = new Map<Sound, Promise<AudioBuffer>>();
const requests = new Map<Sound, number>();
const lastPlayed = new Map<Sound, number>();

// Clamp volume, apply it immediately, and invalidate pending playback when muted.
export const setSoundSettings = (next: typeof settings) => {
  // Bound valid volume to 0–100 and use the default for invalid values.
  const volume = Number.isFinite(next.volume)
    ? Math.max(0, Math.min(100, next.volume))
    : defaultSoundSettings.volume;
  if (volume === settings.volume) return;

  // Apply volume immediately and cancel pending clips when muted.
  settings = { volume };
  if (!settings.volume)
    requests.forEach((request, sound) => requests.set(sound, request + 1));

  if (gain) gain.gain.value = settings.volume / 100;

  // Persist the setting and notify subscribed volume controls.
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch {
    // Keep the current setting in memory when storage is unavailable.
  }
  listeners.forEach((listener) => listener());
};

// Reuse decoded clips and in-flight loads instead of fetching again.
const loadSound = (sound: Sound) => {
  // Return an already decoded clip immediately.
  const buffer = buffers.get(sound);
  if (buffer) return Promise.resolve(buffer);

  // Share one fetch and decode operation between concurrent requests.
  let pending = loading.get(sound);
  if (!pending) {
    pending = fetch(`/audio/${sound}.mp3`)
      .then((response) => {
        if (!response.ok) throw new Error("Sound unavailable");
        return response.arrayBuffer();
      })
      .then((data) => context!.decodeAudioData(data))
      .then((buffer) => {
        buffers.set(sound, buffer);
        return buffer;
      })
      .finally(() => loading.delete(sound));
    loading.set(sound, pending);
  }
  return pending;
};

// Lazily create and resume one context, preloading the shared effect set.
const unlockAudio = () => {
  if (!settings.volume) return;

  // Handle unavailable or blocked audio without interrupting the interface.
  try {
    if (!context) {
      context = new AudioContext();
      gain = context.createGain();
      gain.gain.value = settings.volume / 100;
      gain.connect(context.destination);
      sounds.forEach((sound) => {
        void loadSound(sound).catch(() => undefined);
      });
    }
    if (context.state === "suspended") return context.resume();
  } catch {
    return;
  }
};

// Coalesce duplicate events and drop superseded or delayed playback requests.
export const playSound = (sound: Sound) => {
  if (!settings.volume || document.hidden) return;
  const now = performance.now();

  // Ignore repeated requests for the same clip within 40 ms.
  if (now - (lastPlayed.get(sound) ?? -Infinity) < 40) return;
  lastPlayed.set(sound, now);
  const request = (requests.get(sound) ?? 0) + 1;
  requests.set(sound, request);
  const ready = unlockAudio();

  // Wait for the context and clip, then play only a timely, current request.
  if (!context || !gain) return;
  void Promise.all([ready, buffers.get(sound) ?? loadSound(sound)])
    .then(([, buffer]) => {
      if (
        !settings.volume ||
        document.hidden ||
        performance.now() - now > 1000 ||
        context?.state !== "running" ||
        requests.get(sound) !== request
      )
        return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(gain!);
      source.start();
    })
    .catch(() => undefined); // Audio failures must never interrupt an action.
};

// Delegation also covers controls rendered in Radix portals.
export const attachMenuSounds = () => {
  let keyboardFocus = false;

  // Resolve interaction targets while honoring disabled and sound opt-outs.
  const control = (target: EventTarget | null) => {
    const element =
      target instanceof Element
        ? target.closest<HTMLElement>(
            "button, a[href], input, textarea, [data-sound]",
          )
        : null;
    return element?.closest(
      '[inert], :disabled, [aria-disabled="true"], [data-sound="none"]',
    )
      ? null
      : element;
  };

  // Preview available controls with the shared selection sound.
  const point = (element: HTMLElement | null) => {
    // Drop hover sounds until audio is unlocked and decoded, avoiding a backlog.
    if (element && context?.state === "running" && buffers.has("select"))
      playSound("select");
  };

  // Unlock audio on a pointer gesture and clear keyboard navigation state.
  const onPointerDown = () => {
    keyboardFocus = false;
    void unlockAudio()?.catch(() => undefined);
  };

  // Track keyboard navigation and unlock audio on key gestures.
  const onKeyDown = (event: KeyboardEvent) => {
    keyboardFocus = event.key === "Tab" || event.key.startsWith("Arrow");
    void unlockAudio()?.catch(() => undefined);
  };

  // Play hover feedback once per control, for mouse pointers only.
  const onPointerOver = (event: PointerEvent) => {
    const element = control(event.target);
    if (
      event.pointerType === "mouse" &&
      element &&
      !element.contains(event.relatedTarget as Node | null)
    )
      point(element);
  };

  // Play focus feedback when Tab or arrow navigation moves between controls.
  const onFocus = (event: FocusEvent) => {
    if (keyboardFocus) point(control(event.target));
  };

  // Play selection feedback for activated controls, excluding editable fields.
  const onClick = (event: MouseEvent) => {
    const element = control(event.target);
    if (!element || element.matches("input, textarea")) return;
    playSound("select");
  };

  // Provide selection feedback when a range value changes.
  const onChange = (event: Event) => {
    if (control(event.target)?.matches('input[type="range"]'))
      playSound("select");
  };

  // Attach delegated listeners once and remove them on cleanup.
  document.addEventListener("pointerdown", onPointerDown, true);
  document.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("pointerover", onPointerOver);
  document.addEventListener("focusin", onFocus);
  document.addEventListener("click", onClick, true);
  document.addEventListener("change", onChange);
  return () => {
    document.removeEventListener("pointerdown", onPointerDown, true);
    document.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("pointerover", onPointerOver);
    document.removeEventListener("focusin", onFocus);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("change", onChange);
  };
};
