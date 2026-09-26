import { createContext, useContext } from "react";

export const WindowFade = createContext({
  fading: false,
  fadeTo: (change: () => void, after?: () => void) => {
    change();
    after?.();
  },
});

export const useWindowFade = () => useContext(WindowFade);
