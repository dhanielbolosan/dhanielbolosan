import { useEffect, useRef, useState } from "react";

// FF7 menus fade between screens. How long each fade (out, then in) takes.
export const fadeMs = 150;

// Swapping from one view to another with a fade: while `id` differs from the view on
// screen, the old view stays (fading out); after `fadeMs` the new one takes its place.
// Only a new `id` restarts the fade, so callers may pass a fresh `view` every render.
// `instant` swaps right away, for content that's already hidden.
export const useSwap = <View>(id: string, view: View, instant = false) => {
  const [shown, setShown] = useState({ id, view });
  const fading = id !== shown.id;

  const latest = useRef(view);
  useEffect(() => {
    latest.current = view;
  });
  useEffect(() => {
    if (!fading) return;
    const timer = setTimeout(
      () => setShown({ id, view: latest.current }),
      instant ? 0 : fadeMs,
    );
    return () => clearTimeout(timer);
  }, [fading, id, instant]);

  // The live view once swapped in; the kept one only while fading out.
  return { view: fading ? shown.view : view, fading, shownId: shown.id };
};
