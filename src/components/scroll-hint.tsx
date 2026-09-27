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

  // Measure the active column until the hint first appears.
  useEffect(() => {
    const column = columnRef.current;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Show the hint for overflow and keep its first display on one timer.
    const update = () => {
      if (timer !== undefined) return;
      const overflowing =
        enabled && !!column && column.scrollHeight > column.clientHeight + 8;
      setVisible(overflowing);

      // Start the full display duration only once the hint can be shown.
      if (overflowing) {
        observer?.disconnect();
        timer = setTimeout(() => setVisible(false), scrollHintDurationMs);
      }
    };

    // Observe size changes only while the mobile hint is eligible.
    const observer = enabled && column ? new ResizeObserver(update) : undefined;
    const frame = requestAnimationFrame(update);
    if (!observer || !column) return () => cancelAnimationFrame(frame);

    // Watch column and window heights so late content can reveal overflow.
    observer.observe(column);
    for (const child of Array.from(column.children)) observer.observe(child);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      observer.disconnect();
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
