import { useEffect, useRef, useState } from "react";

export const fadeMs = 150;

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

  return { view: fading ? shown.view : view, fading, shownId: shown.id };
};
