import { useCallback, useSyncExternalStore } from "react";

// Whether a CSS media query matches, updating live as it changes.
export const useMedia = (query: string) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
  );
};

// Touch screens can't hover, so hover-to-discover doesn't work there; these get a
// resting cursor on the first item instead.
export const canHoverQuery = "(hover: hover)";
