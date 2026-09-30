import { useCallback, useSyncExternalStore } from "react";

// Share the reduced-motion query, so every animation checks the same preference.
export const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

// Track a media query and re-render when it starts or stops matching.
export const useMedia = (query: string) => {
  // Subscribe to the query's change events and release the listener on cleanup.
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);

      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  // Keep React in sync with browser media-query changes.
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
  );
};
