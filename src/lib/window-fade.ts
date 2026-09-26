import { createContext, useContext } from "react";

// Share each window's fade state, running callbacks immediately outside a provider.
export const WindowFade = createContext({
  fading: false,
  fadeTo: (change: () => void, after?: () => void) => {
    change();
    after?.();
  },
});

// Read the nearest window's fade state and transition controls.
export const useWindowFade = () => useContext(WindowFade);
