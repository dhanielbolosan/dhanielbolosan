import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { playSound } from "@/lib/audio";
import { discSpinMs, enterEasing, exitEasing, fadeMs } from "@/lib/motion";
import { reducedMotionQuery, useMedia } from "@/lib/use-media";
import { playFromStack } from "./music.utils";

// Disc positions for the lift out of the player and the drop back in; transform only, so the compositor runs them.
const seated = { transform: "none" };
const lifted = { transform: "scale(1.04)" };
const away = (x: number) => ({ transform: `translateX(${x}px) scale(1.04)` });

// The lifted disc's shadow fades on its own layer, so the lift never repaints a box-shadow.
const shadowOff = { opacity: 0 };
const shadowOn = { opacity: 1 };

// How far the disc turns per millisecond at full speed.
const degreesPerMs = 360 / discSpinMs;

// Turn covered by progress p of a ramp whose speed eases out from `from` to `to`, in full-speed milliseconds per ramp millisecond.
const rampTurn = (from: number, to: number, p: number) =>
  from * p + (to - from) * (p - (1 - (1 - p) ** 3) / 3);

// The face's share of a ramp, with the spinner's steady `under` speed taken out, is a cubic in p, and a
// cubic-bezier with x handles at 1/3 and 2/3 traces any cubic exactly, so Core Animation can run it off the main thread.
const rampEasing = (from: number, to: number, under: number) => {
  const total = rampTurn(from, to, 1) - under;
  if (!total) return "linear";
  const y1 = (from - under) / (3 * total);
  const y2 = (from + to - 2 * under) / (3 * total);

  return `cubic-bezier(${1 / 3}, ${y1}, ${2 / 3}, ${y2})`;
};

const turned = (degrees: number) => ({ transform: `rotate(${degrees}deg)` });

// One stretch of a move: the speed eases from `from` to `to` over `ms`.
type Stage = { from: number; to: number; ms: number };
const stageTurn = ({ from, to, ms }: Stage, p: number) =>
  degreesPerMs * ms * rampTurn(from, to, p);

// The motor: the spinner turns steadily at `to` from the start, and the face adds the move's stages on top of it.
type Motor = {
  ramp?: Animation;
  spin?: Animation;
  angle: number;
  stages: Stage[];
  to: number;
};

// Slide the open switch along its tilted slot, and swing the lid up past upright.
const switchOpen = "translate(-3.168px, -1.692px)";
const lidOpen = "rotateX(98deg)";

// Clear the clipped window edge by a few pixels; the fallback covers an unmeasured player.
const offscreenMarginPx = 8;
const offscreenFallbackPx = -200;

// Keep the committed order of each set of listens for this visit.
const savedOrders = new Map<string, { current: number; stack: number[] }>();

// Run the disc swap, the spin, and the stack's LIFO order for the Music screen.
export const useLoopmaster = ({
  count,
  id,
  waitForCover,
}: {
  count: number;
  id: string;
  waitForCover: (index: number) => Promise<void>;
}) => {
  const reducedMotion = useMedia(reducedMotionQuery);

  // The disc in the player plus the stack beneath it, newest on top.
  const [current, setCurrent] = useState(
    () => savedOrders.get(id)?.current ?? 0,
  );
  const [stack, setStack] = useState(
    () =>
      savedOrders.get(id)?.stack ??
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
  const spinRef = useRef<HTMLSpanElement>(null);
  const faceRef = useRef<HTMLSpanElement>(null);
  const lidRef = useRef<HTMLSpanElement>(null);
  const rowsRef = useRef(new Map<number, HTMLLIElement>());

  // Drive the spin as compositor animations, and track whether a swap is running.
  const motorRef = useRef<Motor>({ angle: 0, stages: [], to: 0 });
  const shadowRef = useRef<HTMLSpanElement>(null);
  const busyRef = useRef(false);
  const aliveRef = useRef<AbortController>(null);

  // Read where the disc is and how fast it turns right now: the face's stages plus the spinner's steady turn after them.
  const motorNow = () => {
    const { ramp, spin, angle, stages, to } = motorRef.current;
    let elapsed = Number(ramp?.currentTime ?? 0);
    let turn = angle;
    let speed = to;

    for (const stage of stages) {
      const p = Math.min(1, elapsed / stage.ms);
      turn += stageTurn(stage, p);
      if (p < 1) {
        speed = stage.from + (stage.to - stage.from) * (1 - (1 - p) ** 2);
        break;
      }
      elapsed -= stage.ms;
    }

    const moveMs = stages.reduce((sum, stage) => sum + stage.ms, 0);
    const spun = Math.max(0, Number(spin?.currentTime ?? 0) - moveMs);

    return { angle: turn + ((spun * degreesPerMs * to) % 360), speed };
  };

  // Run a move of one or more speed changes, then keep turning; every animation is set up at once, so the compositor runs the whole move.
  const drive = (
    angle: number,
    from: number,
    steps: { to: number; ms: number }[],
  ) => {
    const face = faceRef.current;
    const spinner = spinRef.current;
    motorRef.current.ramp?.cancel();
    motorRef.current.spin?.cancel();
    angle %= 360;

    // Chain the steps into stages, each starting at the speed the last one ended on.
    let speed = from;
    let stages = steps.map(({ to, ms }) => {
      const stage = { from: speed, to, ms };
      speed = to;
      return stage;
    });
    const moveMs = stages.reduce((sum, stage) => sum + stage.ms, 0);
    const turn = stages.reduce((sum, stage) => sum + stageTurn(stage, 1), 0);
    if (!turn) stages = [];

    const next: Motor = { angle, stages, to: speed };

    // Start at this frame's time, the moment the angle was read, so a new move neither waits a frame nor snaps back.
    const now = document.timeline.currentTime;

    // The resting angle lives in the style, so the disc stays put between moves.
    if (face) face.style.transform = turned(angle).transform;

    // One keyframe per stage, each easing along its speed change minus the spinner's steady turn,
    // so the face simply stops when the move ends and nothing starts mid-spin.
    if (face && stages.length) {
      let at = angle;
      let elapsed = 0;
      const keyframes: Keyframe[] = stages.map((stage) => {
        const keyframe = {
          ...turned(at),
          offset: elapsed / moveMs,
          easing: rampEasing(stage.from, stage.to, speed),
        };
        at += stageTurn(stage, 1) - degreesPerMs * speed * stage.ms;
        elapsed += stage.ms;
        return keyframe;
      });

      next.ramp = face.animate([...keyframes, turned(at)], {
        duration: moveMs,
        fill: "forwards",
      });
      next.ramp.startTime = now;
    }

    // The steady spin runs from the start at the speed the move ends on.
    if (spinner && speed) {
      next.spin = spinner.animate([turned(0), turned(360)], {
        duration: discSpinMs / speed,
        iterations: Infinity,
      });
      next.spin.startTime = now;
    }

    motorRef.current = next;

    return next.ramp;
  };

  // Hold the disc still at an angle, or spin it at a constant speed from there.
  const setMotor = (angle: number, speed: number) =>
    void drive(angle, speed, []);

  // Start the spin and stop all motion when the screen unmounts.
  useEffect(() => {
    const alive = new AbortController();
    aliveRef.current = alive;

    // Reduced motion starts paused; the listener can still press play.
    drive(0, matchMedia(reducedMotionQuery).matches ? 0 : 1, []);

    const motor = motorRef;

    return () => {
      alive.abort();
      motor.current.ramp?.cancel();
      motor.current.spin?.cancel();
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

  // Ease the motor to a new speed; the newest ramp takes over, and a replaced or unmounted one settles quietly.
  const ramp = async (...steps: { to: number; ms: number }[]) => {
    const { angle, speed } = motorNow();
    await drive(angle, speed, steps)?.finished.catch(() => undefined);
  };

  // Render the new order synchronously, so the swap can measure rows in their new slots.
  const commit = (next: { current: number; stack: number[] }) => {
    // The picked row unmounts; if it had focus, move it to the disc that just landed on top.
    const hadFocus = rowsRef.current
      .get(next.current)
      ?.contains(document.activeElement);

    orderRef.current = next;
    savedOrders.set(id, next);
    flushSync(() => {
      setCurrent(next.current);
      setStack(next.stack);
    });

    if (hadFocus)
      rowsRef.current.get(next.stack[0])?.querySelector("button")?.focus();
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
      setMotor(0, motorNow().speed);
      return commit(next);
    }

    const disc = discRef.current;
    const lid = lidRef.current;
    const knob = knobRef.current;

    // Travel far enough to clear the window's clipped edge, wherever the player sits.
    const clip = disc?.closest("[data-player-clip]");
    const offscreen =
      disc && clip
        ? clip.getBoundingClientRect().left -
          disc.getBoundingClientRect().right -
          offscreenMarginPx
        : offscreenFallbackPx;

    // The disc slows for a beat before the switch flips, and the lid pops open as it stops.
    const stopped = ramp({ to: 0, ms: fadeMs * 3 });
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
      run(
        shadowRef.current,
        [
          { ...shadowOff, easing: enterEasing },
          { ...shadowOn, offset: 0.25 },
          shadowOn,
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
    setMotor(0, 0);

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
      run(
        shadowRef.current,
        [
          shadowOn,
          { ...shadowOn, offset: 0.75, easing: exitEasing },
          shadowOff,
        ],
        { duration: fadeMs * 4 },
      ),
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

  // Read the disc briefly, then spin up to full speed, as one move so nothing restarts partway.
  const spinUp = async () => {
    const running = ramp(
      { to: 0.25, ms: fadeMs * 2 },
      { to: 0.25, ms: fadeMs },
      { to: 1, ms: fadeMs * 4 },
    );
    await wait(fadeMs * 3);

    setPlaying(true);
    await running;
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
    void ramp({ to: nextPlaying ? 1 : 0, ms: reducedMotion ? 1 : fadeMs * 3 });
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
    parts: { knobRef, discRef, shadowRef, spinRef, faceRef, lidRef },
  };
};
