import { useEffect, useState } from "react";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Types toward `target` one character per tick, first erasing whatever doesn't match,
// so a new line reverse-types the old one away before typing itself. `speed` is ms per character.
export const useTypewriter = (target: string, speed = 18) => {
  const [text, setText] = useState("");

  useEffect(() => {
    const id = setInterval(
      () =>
        setText((current) =>
          !target.startsWith(current)
            ? current.slice(0, -1)
            : target.slice(0, current.length + 1),
        ),
      speed,
    );
    return () => clearInterval(id);
  }, [target, speed]);

  return reducedMotion.matches ? target : text;
};
