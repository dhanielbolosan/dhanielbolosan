import { useCallback, useSyncExternalStore } from "react";

export const useMedia = (query: string) => {
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
