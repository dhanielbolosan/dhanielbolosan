import { createContext, useContext } from "react";

// FF7 menus fade the whole window between screens. A window provides `fadeTo`: it fades
// the window out, applies `change` while it's invisible, then fades back in. `fading`
// is true for that whole time. The corner title box isn't faded; it runs its own swap.
export const WindowFade = createContext({
  fading: false,
  fadeTo: (change: () => void) => change(),
});

export const useWindowFade = () => useContext(WindowFade);
