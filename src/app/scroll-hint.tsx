import { useEffect, useState, type RefObject } from "react";
import { scrollHintDurationMs } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const ScrollHint = ({
  columnRef,
  columnIndex,
  enabled,
}: {
  columnRef: RefObject<HTMLDivElement | null>;
  columnIndex: number;
  enabled: boolean;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const column = columnRef.current;
    if (!enabled || !column) return;

    let dismissed = false;
    const update = () =>
      setVisible(
        !dismissed &&
          column.scrollTop < 8 &&
          column.scrollHeight > column.clientHeight + 8,
      );
    const dismiss = () => {
      dismissed = true;
      setVisible(false);
    };

    const frame = requestAnimationFrame(update);
    const timer = setTimeout(dismiss, scrollHintDurationMs);
    const observer = new ResizeObserver(update);
    observer.observe(column);
    for (const window of column.children) observer.observe(window);
    column.addEventListener("scroll", dismiss, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      observer.disconnect();
      column.removeEventListener("scroll", dismiss);
    };
  }, [columnRef, columnIndex, enabled]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-6 z-30 text-center font-heading text-xs leading-relaxed text-(--muted-credit) transition-opacity duration-(--fade-duration) motion-reduce:transition-none md:hidden [text-shadow:none]",
        enabled && visible ? "opacity-100" : "opacity-0",
      )}
    >
      <span className="inline-block motion-safe:animate-scroll-hint">
        scroll down
      </span>
    </div>
  );
};
