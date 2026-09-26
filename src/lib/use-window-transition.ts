import { useCallback, useEffect, useRef, useState } from "react";
import { fadeMs } from "./motion";
import { useMedia } from "./use-media";

export const useWindowTransition = () => {
  const [fading, setFading] = useState(false);

  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");

  const pending = useRef({ change: 0, after: 0, frame: 0 });

  const cancelPending = useCallback(() => {
    clearTimeout(pending.current.change);
    clearTimeout(pending.current.after);
    cancelAnimationFrame(pending.current.frame);
  }, []);

  // Cancel queued timers and frames when the window unmounts.
  useEffect(() => cancelPending, [cancelPending]);

  const fadeTo = useCallback(
    (change: () => void, after?: () => void) => {
      // Cancel the previous transition so its callbacks cannot overwrite this one.
      cancelPending();
      if (reducedMotion) {
        change();
        setFading(false);
        after?.();

        return;
      }

      setFading(true);

      // Swap content after the fade-out finishes.
      pending.current.change = window.setTimeout(() => {
        change();

        // Fade in on the next frame, then run the follow-up once it finishes.
        pending.current.frame = requestAnimationFrame(() => {
          setFading(false);
          if (after) pending.current.after = window.setTimeout(after, fadeMs);
        });
      }, fadeMs);
    },
    [cancelPending, reducedMotion],
  );

  return { fading, fadeTo };
};
