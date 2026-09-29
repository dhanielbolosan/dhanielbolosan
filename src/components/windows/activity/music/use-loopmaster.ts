import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { playSound } from "@/lib/audio";
import { discSpinMs, fadeMs } from "@/lib/motion";
import { useMedia } from "@/lib/use-media";
import { playFromStack } from "./music.utils";

// Disc positions for the lift out of the player and the drop back in.
const seated = { transform: "none", opacity: 1, boxShadow: "none" };
const lifted = {
  transform: "scale(1.04)",
  opacity: 1,
  boxShadow: "3px 5px 0 var(--text-shadow)",
};
const away = {
  ...lifted,
  transform: "translateX(-190px) scale(1.04)",
  opacity: 0,
};

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

// Slide the open switch along its tilted slot.
const switchOpen = "translate(-4.4px, -2.35px)";

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

  // Mirror the order in a ref so the running swap always reads the latest value.
  const orderRef = useRef({ current, stack });

  const knobRef = useRef<HTMLImageElement>(null);
  const discRef = useRef<HTMLSpanElement>(null);
  const faceRef = useRef<HTMLSpanElement>(null);
  const lidRef = useRef<HTMLSpanElement>(null);
  const rowsRef = useRef(new Map<number, HTMLLIElement>());

  // Share one spin animation and track whether a swap is running.
  const spinRef = useRef<Animation>(null);
  const rampRef = useRef({ id: 0, frame: 0 });
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
    signal?.addEventListener("abort", () => animation.cancel(), { once: true });

    return animation.finished;
  };

  const wait = (ms: number) =>
    new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, ms);

      aliveRef.current?.signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(new Error("stopped"));
        },
        { once: true },
      );
    });

  // Ease the motor to a new speed; the newest ramp takes over any older one.
  const ramp = (to: number, ms: number) =>
    new Promise<void>((resolve) => {
      const spin = spinRef.current;
      const id = ++rampRef.current.id;
      const from = spin?.playbackRate ?? 0;
      const start = performance.now();

      cancelAnimationFrame(rampRef.current.frame);

      const step = (time: number) => {
        if (!spin || id !== rampRef.current.id) return resolve();

        const progress = Math.min(1, (time - start) / ms);
        spin.playbackRate = from + (to - from) * (1 - (1 - progress) ** 2);

        if (progress < 1) rampRef.current.frame = requestAnimationFrame(step);
        else resolve();
      };

      rampRef.current.frame = requestAnimationFrame(step);
    });

  const commit = (next: { current: number; stack: number[] }) => {
    orderRef.current = next;
    flushSync(() => {
      setCurrent(next.current);
      setStack(next.stack);
    });
  };

  // Fade a row's text out, then close its height so the rows below glide up.
  const closeRow = async (row: HTMLLIElement | undefined) => {
    if (!row) return;

    const { height, paddingTop, paddingBottom } = getComputedStyle(row);
    row.style.overflow = "hidden";

    await Promise.all(
      [...row.children].map((child) =>
        run(child, [{ opacity: 1 }, { opacity: 0 }], { duration: fadeMs }),
      ),
    );
    await run(
      row,
      [
        { height, paddingTop, paddingBottom },
        {
          height: "0px",
          paddingTop: "0px",
          paddingBottom: "0px",
          borderTopWidth: "0px",
        },
      ],
      { duration: fadeMs * 2, easing: "ease" },
    );
  };

  // Open a new row at the top, then fade its text in.
  const openRow = async (row: HTMLLIElement | undefined) => {
    if (!row) return;

    const { height, paddingTop, paddingBottom } = getComputedStyle(row);
    row.style.overflow = "hidden";

    await Promise.all([
      run(
        row,
        [
          { height: "0px", paddingTop: "0px", paddingBottom: "0px" },
          { height, paddingTop, paddingBottom },
        ],
        { duration: fadeMs * 2, easing: "ease", fill: "none" },
      ),
      ...[...row.children].map((child) =>
        run(child, [{ opacity: 0 }, { opacity: 1 }], {
          duration: fadeMs,
          delay: fadeMs * 2,
          fill: "backwards",
        }),
      ),
    ]);

    row.style.overflow = "";
  };

  // Stop, open the lid, trade the discs, and update the stack in step with them.
  const swap = async (picked: number) => {
    const previous = orderRef.current;
    const next = playFromStack(previous.current, previous.stack, picked);

    if (reducedMotion) return commit(next);

    const disc = discRef.current;
    const lid = lidRef.current;
    const knob = knobRef.current;

    await ramp(0, fadeMs * 3);

    // Each physical step gets its own sound: the switch, the lid pop, the disc seating.
    playSound("switch");
    await run(knob, [{ transform: "none" }, { transform: switchOpen }], {
      duration: fadeMs,
      easing: "ease-out",
    });
    playSound("lid");
    await run(
      lid,
      [{ transform: "rotateX(0)" }, { transform: "rotateX(98deg)" }],
      {
        duration: fadeMs * 2,
        easing: "cubic-bezier(.3, 1.3, .5, 1)",
      },
    );

    // Lift and slide are one motion, so there is no hitch between them.
    await run(
      disc,
      [
        seated,
        { ...lifted, offset: 1 / 3, easing: "ease-in" },
        { ...lifted, offset: 0.8 },
        away,
      ],
      {
        duration: fadeMs * 3,
        easing: "ease-out",
      },
    );

    // Hold the list's height through the swap, so the window never resizes as rows trade places.
    const list = rowsRef.current.get(picked)?.parentElement;
    if (list) list.style.height = `${list.offsetHeight}px`;

    // The picked row leaves the stack while its disc goes into the player.
    const leaving = closeRow(rowsRef.current.get(picked));

    // Mark the rejection handled now; the swap still awaits it below.
    leaving.catch(() => undefined);

    await waitForCover(picked);
    orderRef.current = { current: picked, stack: previous.stack };
    flushSync(() => setCurrent(picked));
    if (spinRef.current)
      spinRef.current.currentTime = Math.random() * discSpinMs;

    await run(
      disc,
      [away, { ...lifted, offset: 2 / 3, easing: "ease-in" }, seated],
      {
        duration: fadeMs * 3,
        easing: "ease-out",
      },
    );
    playSound("disc");

    // Only once that row is gone does the old disc land on top of the stack.
    await leaving;
    commit(next);

    playSound("lid");
    await Promise.all([
      openRow(rowsRef.current.get(previous.current)),
      run(lid, [{ transform: "rotateX(98deg)" }, { transform: "rotateX(0)" }], {
        duration: fadeMs,
        easing: "ease-in",
      }),
    ]);
    if (list) list.style.height = "";
    await run(knob, [{ transform: switchOpen }, { transform: "none" }], {
      duration: fadeMs,
      easing: "ease-in",
    });
  };

  // Read the disc briefly, then spin up to full speed.
  const spinUp = async () => {
    void ramp(0.25, fadeMs * 2);
    await wait(fadeMs * 3);

    setPlaying(true);
    await ramp(1, fadeMs * 4);
  };

  // Play a disc from the stack; picks are ignored until the new disc is back at full speed.
  const play = async (picked: number) => {
    if (busyRef.current || !orderRef.current.stack.includes(picked)) return;

    busyRef.current = true;
    setSwapping(true);

    try {
      await swap(picked);
      if (!reducedMotion) await spinUp();
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
    play,
    togglePlaying,
    registerRow,
    parts: { knobRef, discRef, faceRef, lidRef },
  };
};
