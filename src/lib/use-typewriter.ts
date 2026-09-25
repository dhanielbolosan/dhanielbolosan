import { useEffect, useState } from "react";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Types toward `target` one character every `speed` ms, first erasing whatever doesn't match,
// so a new line reverse-types the old one away before typing itself. `speed` is ms per
// character. Returns the typed text and the line it's part of (the old line while
// erasing, `target` once typing), so callers can lay the whole line out and keep its
// wrapping steady in both directions. A new `scene` clears the old line at once instead
// of erasing it (a screen change: the window already faded it out).
export const useTypewriter = (target: string, speed = 8, scene = "") => {
  const [state, setState] = useState({ text: "", line: target, scene });

  useEffect(() => {
    // Done returns the same object, so React skips the re-render.
    const step = (current: typeof state) =>
      current.scene !== scene
        ? { text: "", line: target, scene }
        : current.text === target
          ? current
          : !target.startsWith(current.text)
            ? { text: current.text.slice(0, -1), line: current.line, scene }
            : {
                text: target.slice(0, current.text.length + 1),
                line: target,
                scene,
              };

    // Driven by animation frames rather than a timer faster than the display: each
    // frame applies however many characters are due, so the pace stays even.
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const due = Math.floor((now - last) / speed);
      if (due > 0) {
        last += due * speed;
        setState((current) => {
          let next = current;
          for (let i = 0; i < due; i++) next = step(next);
          return next;
        });
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, speed, scene]);

  return reducedMotion.matches ? [target, target] : [state.text, state.line];
};
