import { useEffect, useRef, useState } from "react";
import { fadeMs } from "./motion";

export const useSwap = <View>(id: string, view: View, instant = false) => {
  const [shown, setShown] = useState({ id, view });

  const fading = id !== shown.id;

  const latest = useRef(view);

  // Keep the latest view without restarting the fade timer.
  useEffect(() => {
    latest.current = view;
  });

  useEffect(() => {
    if (!fading) return;

    // Keep the outgoing view until fade-out finishes, unless swapping instantly.
    const timer = setTimeout(
      () => setShown({ id, view: latest.current }),
      instant ? 0 : fadeMs,
    );

    // Cancel the old swap if the target changes mid-transition.
    return () => clearTimeout(timer);
  }, [fading, id, instant]);

  return { view: fading ? shown.view : view, fading, shownId: shown.id };
};
