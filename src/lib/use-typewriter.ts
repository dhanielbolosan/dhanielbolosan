import { createContext, useContext, useEffect, useRef, useState } from "react";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

export const TypewriterReady = createContext(true);

export const useTypewriter = (target: string, speed = 10, scene = "") => {
  const ready = useContext(TypewriterReady);
  const [state, setState] = useState({ text: "", line: target, scene });
  const currentState = useRef(state);

  useEffect(() => {
    if (!ready) return;

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

    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      let next = currentState.current;

      while (true) {
        const interval =
          next.scene === scene && !target.startsWith(next.text)
            ? speed / 1.25
            : speed;

        if (now - last < interval) break;

        const stepped = step(next);

        if (stepped === next) break;
        last += interval;
        next = stepped;
      }

      if (next !== currentState.current) {
        currentState.current = next;
        setState(next);
      }

      frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [target, speed, scene, ready]);

  return reducedMotion.matches
    ? [target, target]
    : state.scene !== scene
      ? ["", target]
      : [state.text, state.line];
};
