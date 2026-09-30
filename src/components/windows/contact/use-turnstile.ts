import { useEffect, useRef } from "react";
import { turnstileSiteKey } from "@/lib/site";

type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  getResponse: (widgetId: string) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let loading: Promise<Turnstile> | undefined;

// Load Cloudflare's script once, the first time the form opens, so page loads stay as they were.
const loadTurnstile = () =>
  (loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () =>
      window.turnstile
        ? resolve(window.turnstile)
        : reject(new Error("Turnstile did not load"));
    script.onerror = () => {
      // Let the next form open try again.
      loading = undefined;
      reject(new Error("Turnstile did not load"));
    };
    document.head.append(script);
  }));

// Run Turnstile while the form is open; it only shows itself when Cloudflare wants a human check.
export const useTurnstile = (active: boolean) => {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>(undefined);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !ref.current) return;
        // Cloudflare's widget is at least 300px wide, so shrink it to match the message box above it.
        // Measure that box, since this container is hidden (zero-width) until the widget fills it.
        const box = ref.current.previousElementSibling;
        ref.current.style.zoom = String(
          Math.min(1, (box?.getBoundingClientRect().width ?? 300) / 300),
        );
        widgetId.current = turnstile.render(ref.current, {
          sitekey: turnstileSiteKey,
          appearance: "interaction-only",
          theme: "dark",
          size: "flexible",
        });
      })
      // Without a token the server refuses the send, and the dialogue offers a retry.
      .catch(() => {});

    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [active]);

  // Tokens are single-use, so each send reads the current one and resets for the next.
  const token = () =>
    (widgetId.current && window.turnstile?.getResponse(widgetId.current)) || "";
  const reset = () => {
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  };

  return { ref, token, reset };
};
