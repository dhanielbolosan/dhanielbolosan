import { useContext, useState, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/utils";
import { WindowFade } from "@/lib/window-fade";
import { fadeMs } from "@/lib/use-swap";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// An FF7 menu window. Its frame is a separate layer behind the content so that, on a
// screen change, the frame and content can fade while the corner title box stays.
export const Window = ({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children: ReactNode;
}) => {
  const [fading, setFading] = useState(false);
  const fadeTo = (change: () => void) => {
    if (reducedMotion.matches) return change();
    setFading(true);
    setTimeout(() => {
      change();
      // One frame later, so the corner box sees its new view while the window is
      // still hidden and swaps it without a fade of its own.
      requestAnimationFrame(() => setFading(false));
    }, fadeMs);
  };

  return (
    <WindowFade.Provider value={{ fading, fadeTo }}>
      <div
        className={cn(
          "relative isolate flex grow flex-col gap-3 px-5 pb-5 [text-shadow:2px_2px_0_var(--text-shadow)]",
          !title && "pt-5",
          className,
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 -z-10 transition-opacity duration-150",
            fading && "opacity-0",
          )}
        >
          <div className="window size-full" />
        </div>
        {title && <h2 className="window-title">{title}</h2>}
        <div className="@container flex grow flex-col">{children}</div>
      </div>
    </WindowFade.Provider>
  );
};

// Window content that fades with the window's frame on a screen change. Everything in
// a window except its corner title box goes in one.
export const Faded = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { fading } = useContext(WindowFade);
  return (
    <div
      className={cn(
        "transition-opacity duration-150",
        fading && "opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
};

// A window's top row, 40px tall, with its content 12px below (the caller's gap-3). The
// title box sits top right: a plain `title`, or `children` placed with `window-corner`.
// Behind it runs FF7's help window, a long bar saying what the cursor is on, whose right
// end the title box covers. The bar shows instantly while there's help text and is gone
// without any; it only fades with the window on a screen change.
export const WindowHeader = ({
  help = "",
  title,
  children,
  ref,
}: {
  help?: string;
  title?: string;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}) => {
  const { fading } = useContext(WindowFade);

  return (
    <div
      ref={ref}
      className="relative -mx-5 -mt-5 h-10 shrink-0"
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-150",
          fading && "opacity-0",
          !help && "invisible",
        )}
      >
        {/* One line where the window is wide; narrower, two lines of 12px text (which
            fit its 40px height). Ends in "…" before the title box if still too long. */}
        <p className="window flex size-full items-center pr-32 pl-5 font-heading text-sm">
          <span className="min-w-0 truncate @max-[26rem]:line-clamp-2 @max-[26rem]:text-xs @max-[26rem]:leading-4 @max-[26rem]:whitespace-normal">
            {help}
          </span>
        </p>
      </div>
      {title && <h2 className="window-title window-corner">{title}</h2>}
      {children}
    </div>
  );
};
