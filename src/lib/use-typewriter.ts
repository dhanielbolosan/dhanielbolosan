import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useMedia } from "./use-media";
import { typingIntervalMs } from "./motion";
import { advanceTypewriter } from "./typewriter";

export const TypewriterReady = createContext(true);

export const useTypewriter = (
  target: string,
  speed = typingIntervalMs,
  scene = "",
) => {
  const ready = useContext(TypewriterReady);
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");

  const [state, setState] = useState({ text: "", line: target, scene });
  const currentState = useRef(state);

  useEffect(() => {
    // Wait for the entrance animation; reduced motion shows text immediately.
    if (!ready || reducedMotion) return;

    let lastUpdateMs = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const { state: next, consumedMs } = advanceTypewriter(
        currentState.current,
        target,
        scene,
        now - lastUpdateMs,
        speed,
      );

      // Preserve unused time so character timing stays consistent between frames.
      lastUpdateMs += consumedMs;

      if (next !== currentState.current) {
        currentState.current = next;
        setState(next);
      }

      // Stop requesting frames once the text and scene match.
      if (next.text !== target || next.scene !== scene)
        frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [target, speed, scene, ready, reducedMotion]);

  // Return visible text and the full line used to reserve layout space.
  return reducedMotion
    ? [target, target]
    : state.scene !== scene
      ? ["", target]
      : [state.text, state.line];
};
