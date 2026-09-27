export type Sound =
  | "select"
  | "error"
  | "slash"
  | "crit"
  | "heal"
  | "delete"
  | "limit"
  | "fanfare";

export const defaultSoundSettings = { volume: 20 };
const storageKey = "sound-settings";
let settings = defaultSoundSettings;
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

const listeners = new Set<() => void>();
export const getSoundSettings = () => settings;
export const subscribeSound = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

let context: AudioContext | undefined;
let gain: GainNode | undefined;
const buffers = new Map<Sound, AudioBuffer>();
const loading = new Map<Sound, Promise<AudioBuffer>>();
const requests = new Map<Sound, number>();
const lastPlayed = new Map<Sound, number>();
const sounds: Sound[] = [
  "select",
  "error",
  "slash",
  "crit",
  "heal",
  "delete",
  "limit",
  "fanfare",
];

export const setSoundSettings = (next: Partial<typeof settings>) => {
  settings = { ...settings, ...next };
  settings.volume = Number.isFinite(settings.volume)
    ? Math.max(0, Math.min(100, settings.volume))
    : 20;
  if (!settings.volume)
    requests.forEach((request, sound) => requests.set(sound, request + 1));
  if (gain) gain.gain.value = settings.volume / 100;
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch {
    /* Keep the current setting in memory. */
  }
  listeners.forEach((listener) => listener());
};

const loadSound = (sound: Sound) => {
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

// Called from an actual press, never from hover or page load.
const unlockAudio = () => {
  if (!settings.volume) return;
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

export const playSound = (sound: Sound) => {
  if (!settings.volume || document.hidden) return;
  const now = performance.now();
  if (now - (lastPlayed.get(sound) ?? -Infinity) < 40) return;
  lastPlayed.set(sound, now);
  const request = (requests.get(sound) ?? 0) + 1;
  requests.set(sound, request);
  const ready = unlockAudio();
  if (!context || !gain) return;
  void Promise.all([ready, buffers.get(sound) ?? loadSound(sound)])
    .then(([, buffer]) => {
      if (
        !settings.volume ||
        document.hidden ||
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
  const point = (element: HTMLElement | null) => {
    // Drop hover sounds until audio is unlocked and decoded, avoiding a backlog.
    if (element && context?.state === "running" && buffers.has("select"))
      playSound("select");
  };
  const onPointerDown = () => {
    keyboardFocus = false;
    void unlockAudio()?.catch(() => undefined);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    keyboardFocus = event.key === "Tab" || event.key.startsWith("Arrow");
    void unlockAudio()?.catch(() => undefined);
  };
  const onPointerOver = (event: PointerEvent) => {
    const element = control(event.target);
    if (
      event.pointerType === "mouse" &&
      element &&
      !element.contains(event.relatedTarget as Node | null)
    )
      point(element);
  };
  const onFocus = (event: FocusEvent) => {
    if (keyboardFocus) point(control(event.target));
  };
  const onClick = (event: MouseEvent) => {
    const element = control(event.target);
    if (!element || element.matches("input, textarea")) return;
    const sound = element.closest<HTMLElement>("[data-sound]")?.dataset.sound;
    playSound(sounds.includes(sound as Sound) ? (sound as Sound) : "select");
  };
  const onChange = (event: Event) => {
    if (control(event.target)?.matches('input[type="range"]'))
      playSound("select");
  };
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
