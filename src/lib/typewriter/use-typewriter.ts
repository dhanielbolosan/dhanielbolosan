import { createContext, useContext, useEffect, useRef, useState } from "react";
import { reducedMotionQuery, useMedia } from "@/lib/use-media";
import { typingIntervalMs } from "@/lib/motion";
import { advanceTypewriter } from "./typewriter";

// Hold dialogue until the menu entrance finishes.
export const TypewriterReady = createContext(true);

// Type a line out after erasing back to what it shares with the last one; reduced motion shows it at once.
export const useTypewriter = (
  target: string,
  speed = typingIntervalMs,
  scene = "",
) => {
  const ready = useContext(TypewriterReady);
  const reducedMotion = useMedia(reducedMotionQuery);

  const [state, setState] = useState({ text: "", line: target, scene });
  const currentState = useRef(state);

  useEffect(() => {
    // Wait for the entrance animation; reduced motion shows text immediately.
    if (!ready || reducedMotion) return;

    // Advance or erase text using elapsed time between animation frames.
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
