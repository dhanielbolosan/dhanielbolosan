import type { ReactNode, Ref } from "react";
import { WindowFade, useWindowFade } from "@/lib/menu/window-fade";
import { useWindowTransition } from "@/lib/menu/use-window-transition";
import { cn } from "@/lib/utils";

// The help line and title tab across the top of a window.
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
  const { fading } = useWindowFade();

  return (
    <div
      ref={ref}
      className="relative -mx-4.5 -mt-4.5 h-10 shrink-0"
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-(--fade-duration)",
          fading && "opacity-0",
          !help && "invisible",
        )}
      >
        <p className="window flex size-full items-center py-0 px-4.5 pr-32 font-heading text-sm">
          <span className="min-w-0 truncate">{help}</span>
        </p>
      </div>

      {title && <h2 className="window-title window-corner">{title}</h2>}

      {children}
    </div>
  );
};

// A menu window that fades its contents while they change.
export const Window = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  const { fading, fadeTo } = useWindowTransition();

  return (
    <WindowFade.Provider value={{ fading, fadeTo }}>
      <div
        className={cn(
          "relative isolate flex grow flex-col gap-3 p-4.5 [text-shadow:2px_2px_0_var(--text-shadow)]",
          className,
        )}
      >
        {/* Fade the frame separately from its content. */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 -z-10 transition-opacity duration-(--fade-duration)",
            fading && "opacity-0",
          )}
        >
          <div className="window size-full" />
        </div>

        <div className="@container flex grow flex-col">{children}</div>
      </div>
    </WindowFade.Provider>
  );
};

// Fade content out with its window while the view changes.
export const Faded = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { fading } = useWindowFade();

  return (
    <div
      className={cn(
        "transition-opacity duration-(--fade-duration)",
        fading && "opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
};
