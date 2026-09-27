import { useEffect, useState, type RefObject } from "react";
import { scrollHintDurationMs } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const ScrollHint = ({
  columnRef,
  enabled,
}: {
  columnRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Measure only the active mobile column and its window wrappers.
    const column = columnRef.current;
    let dismissed = false;
    const update = () =>
      setVisible(
        enabled &&
          !!column &&
          !dismissed &&
          column.scrollTop < 8 &&
          column.scrollHeight > column.clientHeight + 8,
      );

    const frame = requestAnimationFrame(update);
    if (!enabled || !column) return () => cancelAnimationFrame(frame);

    const observer = new ResizeObserver(update);
    // Stop measuring once scrolling or the display timeout dismisses this cue.
    const dismiss = () => {
      dismissed = true;
      setVisible(false);
      observer.disconnect();
      column.removeEventListener("scroll", dismiss);
    };

    const timer = setTimeout(dismiss, scrollHintDurationMs);
    observer.observe(column);
    for (const child of Array.from(column.children)) observer.observe(child);
    column.addEventListener("scroll", dismiss, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      observer.disconnect();
      column.removeEventListener("scroll", dismiss);
    };
  }, [columnRef, enabled]);

  return (
    // Keep the cue mounted for opacity fades and pause its bob while hidden.
    <div
      aria-hidden="true"
      className={cn(
        "muted-credit pointer-events-none absolute inset-x-0 bottom-6 z-30 text-center font-heading text-xs leading-relaxed transition-opacity duration-(--fade-duration) motion-reduce:transition-none md:hidden",
        enabled && visible ? "opacity-100" : "opacity-0",
      )}
    >
      <span
        className="inline-block motion-safe:animate-scroll-hint"
        style={{
          animationPlayState: enabled && visible ? "running" : "paused",
        }}
      >
        scroll down
      </span>
    </div>
  );
};
