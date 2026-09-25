import { createContext, useContext } from "react";

// FF7 menus fade the whole window between screens. A window provides `fadeTo`: it fades
// the window out, applies `change` while it's invisible, then fades back in. `after`
// runs once the fade-in ends. The corner title box runs its own swap.
export const WindowFade = createContext({
  fading: false,
  fadeTo: (change: () => void, after?: () => void) => {
    change();
    after?.();
  },
});

export const useWindowFade = () => useContext(WindowFade);
