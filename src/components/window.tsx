import { useContext, useState, type ReactNode, type Ref } from "react";
import { WindowFade } from "@/lib/window-fade";
import { fadeMs } from "@/lib/use-swap";
import { cn } from "@/lib/utils";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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

  const fadeTo = (change: () => void, after?: () => void) => {
    if (reducedMotion.matches) {
      change();
      after?.();
      return;
    }

    setFading(true);
    setTimeout(() => {
      change();
      requestAnimationFrame(() => {
        setFading(false);
        if (after) setTimeout(after, fadeMs);
      });
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
