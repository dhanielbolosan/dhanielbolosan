import { useContext, type ReactNode, type Ref } from "react";
import { WindowFade } from "@/lib/window-fade";
import { useWindowTransition } from "@/lib/use-window-transition";
import { cn } from "@/lib/utils";

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
          "absolute inset-0 transition-opacity duration-(--fade-duration)",
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
          "relative isolate flex grow flex-col gap-3 px-5 pt-5 pb-5 [text-shadow:2px_2px_0_var(--text-shadow)]",
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
        "transition-opacity duration-(--fade-duration)",
        fading && "opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
};
