import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { playSound } from "@/lib/audio";
import { discSpinMs, enterEasing, exitEasing, fadeMs } from "@/lib/motion";
import { reducedMotionQuery, useMedia } from "@/lib/use-media";
import { playFromStack } from "./music.utils";

// Disc positions for the lift out of the player and the drop back in.
const seated = { transform: "none", boxShadow: "none" };
const lifted = {
  transform: "scale(1.04)",
  boxShadow: "3px 5px 0 var(--text-shadow)",
};
const away = (x: number) => ({
  ...lifted,
  transform: `translateX(${x}px) scale(1.04)`,
});

// Slide the open switch along its tilted slot, and swing the lid up past upright.
const switchOpen = "translate(-4.4px, -2.35px)";
const lidOpen = "rotateX(98deg)";

// Clear the clipped window edge by a few pixels; the fallback covers an unmeasured player.
const offscreenMarginPx = 8;
const offscreenFallbackPx = -200;

export const useLoopmaster = ({
  count,
  waitForCover,
}: {
  count: number;
  waitForCover: (index: number) => Promise<void>;
}) => {
  const reducedMotion = useMedia(reducedMotionQuery);

  // The disc in the player plus the stack beneath it, newest on top.
  const [current, setCurrent] = useState(0);
  const [stack, setStack] = useState(() =>
    Array.from({ length: count - 1 }, (_, i) => i + 1),
  );
  const [playing, setPlaying] = useState(() => !reducedMotion);

  // Mirror the swap for rendering, so the controls read as unavailable while it runs.
  const [swapping, setSwapping] = useState(false);

  // The pick waiting for the current swap to finish, so its row can keep the hand.
  const [queued, setQueued] = useState<number | null>(null);
  const queuedRef = useRef<number | null>(null);

  // Mirror the order in a ref so the running swap always reads the latest value.
  const orderRef = useRef({ current, stack });

  const knobRef = useRef<HTMLImageElement>(null);
  const discRef = useRef<HTMLSpanElement>(null);
  const faceRef = useRef<HTMLSpanElement>(null);
  const lidRef = useRef<HTMLSpanElement>(null);
  const rowsRef = useRef(new Map<number, HTMLLIElement>());

  // Share one spin animation and track whether a swap is running.
  const spinRef = useRef<Animation>(null);
  const rampRef = useRef({ frame: 0, settle: () => {} });
  const busyRef = useRef(false);
  const aliveRef = useRef<AbortController>(null);

  // Start the spin and stop all motion when the screen unmounts.
  useEffect(() => {
    const alive = new AbortController();
    aliveRef.current = alive;

    const spin = faceRef.current?.animate(
      [{ rotate: "0deg" }, { rotate: "360deg" }],
      { duration: discSpinMs, iterations: Infinity },
    );

    // Reduced motion starts paused; the listener can still press play.
    if (spin)
      spin.playbackRate = matchMedia(reducedMotionQuery).matches ? 0 : 1;
    spinRef.current = spin ?? null;

    const ramp = rampRef.current;

    return () => {
      alive.abort();
      cancelAnimationFrame(ramp.frame);
      ramp.settle();
      spin?.cancel();
    };
  }, []);

  // Run a tracked animation that stops the swap when the screen unmounts.
  const run = (
    element: Element | null | undefined,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
  ) => {
    const signal = aliveRef.current?.signal;
    if (!element || signal?.aborted)
      return Promise.reject(new Error("stopped"));

    const animation = element.animate(keyframes, {
      fill: "forwards",
      ...options,
    });

    // Cancel on unmount, and drop the listener once the animation settles.
    const stop = () => animation.cancel();
    signal?.addEventListener("abort", stop, { once: true });

    return animation.finished.finally(() =>
      signal?.removeEventListener("abort", stop),
    );
  };

  // Pause for a moment; unmounting stops the wait and the swap with it.
  const wait = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      const signal = aliveRef.current?.signal;
      const stop = () => {
        clearTimeout(timer);
        reject(new Error("stopped"));
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener("abort", stop);
        resolve();
      }, ms);

      signal?.addEventListener("abort", stop, { once: true });
    });

  // Ease the motor to a new speed; the newest ramp takes over, settling the one it replaces.
  const ramp = (to: number, ms: number) =>
    new Promise<void>((resolve) => {
      const spin = spinRef.current;
      const from = spin?.playbackRate ?? 0;
      const start = performance.now();

      cancelAnimationFrame(rampRef.current.frame);
      rampRef.current.settle();
      rampRef.current.settle = resolve;

      const step = (time: number) => {
        if (!spin) return resolve();

        const progress = Math.min(1, (time - start) / ms);
        spin.playbackRate = from + (to - from) * (1 - (1 - progress) ** 2);

        if (progress < 1) rampRef.current.frame = requestAnimationFrame(step);
        else resolve();
      };

      rampRef.current.frame = requestAnimationFrame(step);
    });

  // Render the new order synchronously, so the swap can measure rows in their new slots.
  const commit = (next: { current: number; stack: number[] }) => {
    orderRef.current = next;
    flushSync(() => {
      setCurrent(next.current);
      setStack(next.stack);
    });
  };

  // Fade a row's text in or out without changing its height.
  const fadeRow = (row: HTMLLIElement | undefined, fadeIn: boolean) =>
    Promise.all(
      [...(row?.children ?? [])].map((child) =>
        run(
          child,
          fadeIn
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [{ opacity: 1 }, { opacity: 0 }],
          { duration: fadeMs, fill: fadeIn ? "backwards" : "forwards" },
        ),
      ),
    );

  // Stop, open the lid, trade the discs, and update the stack in step with them.
  const swap = async (picked: number) => {
    const previous = orderRef.current;
    const next = playFromStack(previous.current, previous.stack, picked);

    if (reducedMotion) {
      if (spinRef.current) spinRef.current.currentTime = 0;
      return commit(next);
    }

    const disc = discRef.current;
    const lid = lidRef.current;
    const knob = knobRef.current;

    // Travel far enough to clear the window's clipped edge, wherever the player sits.
    const clip = disc?.closest(".overflow-x-clip");
    const offscreen =
      disc && clip
        ? clip.getBoundingClientRect().left -
          disc.getBoundingClientRect().right -
          offscreenMarginPx
        : offscreenFallbackPx;

    // The disc slows for a beat before the switch flips, and the lid pops open as it stops.
    const stopped = ramp(0, fadeMs * 3);
    await wait(fadeMs);

    // Each physical step gets its own sound: the switch, the lid pop, the disc seating.
    playSound("switch");
    await run(knob, [{ transform: "none" }, { transform: switchOpen }], {
      duration: fadeMs,
      easing: enterEasing,
    });
    playSound("lid");
    await Promise.all([
      run(lid, [{ transform: "rotateX(0)" }, { transform: lidOpen }], {
        duration: fadeMs * 2,
        easing: enterEasing,
      }),
      stopped,
    ]);

    // Lift the old disc and slide it out of the window as one motion, while the picked row empties.
    await Promise.all([
      run(
        disc,
        [
          { ...seated, easing: enterEasing },
          { ...lifted, offset: 0.25, easing: exitEasing },
          away(offscreen),
        ],
        { duration: fadeMs * 4 },
      ),
      fadeRow(rowsRef.current.get(picked), false),
    ]);

    await waitForCover(picked);

    // Note each row's slot, so the reorder can glide rows from where they were.
    const before = new Map(
      [...rowsRef.current].map(([index, row]) => [
        index,
        row.getBoundingClientRect().top,
      ]),
    );

    // The old disc lands on top of the stack as the picked disc heads for the player, upright.
    commit(next);
    if (spinRef.current) spinRef.current.currentTime = 0;

    // Rows above the picked one slide down a slot; rows below it are already in place.
    const shifts = next.stack.slice(1).map((index) => {
      const row = rowsRef.current.get(index);
      const from =
        (before.get(index) ?? 0) - (row?.getBoundingClientRect().top ?? 0);

      return from
        ? run(row, [{ translate: `0 ${from}px` }, { translate: "0 0" }], {
            duration: fadeMs * 2,
            easing: enterEasing,
            fill: "none",
          })
        : undefined;
    });

    // The rows move with the stack right away; only the disc waits for its cover.
    const rows = Promise.all([
      ...shifts,
      fadeRow(rowsRef.current.get(previous.current), true),
    ]);

    // Mark the rejection handled now; the swap still awaits it below.
    rows.catch(() => undefined);

    // The disc no longer fades in, so let its new cover finish decoding before it shows.
    await disc
      ?.querySelector("img")
      ?.decode()
      .catch(() => undefined);

    await Promise.all([
      rows,
      run(
        disc,
        [
          { ...away(offscreen), easing: enterEasing },
          { ...lifted, offset: 0.75, easing: exitEasing },
          seated,
        ],
        { duration: fadeMs * 4 },
      ).then(() => playSound("disc")),
    ]);

    playSound("lid");
    await run(lid, [{ transform: lidOpen }, { transform: "rotateX(0)" }], {
      duration: fadeMs,
      easing: exitEasing,
    });
    await run(knob, [{ transform: switchOpen }, { transform: "none" }], {
      duration: fadeMs,
      easing: exitEasing,
    });
  };

  // Read the disc briefly, then spin up to full speed.
  const spinUp = async () => {
    void ramp(0.25, fadeMs * 2);
    await wait(fadeMs * 3);

    setPlaying(true);
    await ramp(1, fadeMs * 4);
  };

  // Play a disc from the stack; a pick made mid-swap waits its turn, and the latest one wins.
  const play = async (picked: number) => {
    if (busyRef.current) {
      queuedRef.current = picked;
      setQueued(picked);
      return;
    }
    if (!orderRef.current.stack.includes(picked)) return;

    busyRef.current = true;
    setSwapping(true);

    try {
      let next: number | null = picked;

      while (next !== null) {
        if (orderRef.current.stack.includes(next)) await swap(next);

        // Go straight into a waiting pick; otherwise bring the disc up to speed, then check again.
        if (queuedRef.current === null && !reducedMotion) await spinUp();

        next = queuedRef.current;
        queuedRef.current = null;
        setQueued(null);
      }
    } catch {
      // The screen unmounted mid-swap; its animations were already cancelled.
    } finally {
      busyRef.current = false;
      setSwapping(false);
    }
  };

  // Track each stack row's element so the swap can animate it.
  const registerRow = (index: number) => (row: HTMLLIElement | null) => {
    if (row) rowsRef.current.set(index, row);
    else rowsRef.current.delete(index);
  };

  // Pause or resume the disc; ignored while the discs are being traded.
  const togglePlaying = () => {
    if (busyRef.current) return;

    const nextPlaying = !playing;
    setPlaying(nextPlaying);
    void ramp(nextPlaying ? 1 : 0, reducedMotion ? 1 : fadeMs * 3);
  };

  return {
    current,
    stack,
    playing,
    swapping,
    queued,
    play,
    togglePlaying,
    registerRow,
    parts: { knobRef, discRef, faceRef, lidRef },
  };
};
