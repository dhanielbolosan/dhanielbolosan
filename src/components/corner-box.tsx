import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSwap } from "@/lib/use-swap";
import { fadeMs } from "@/lib/motion";
import { useWindowFade } from "@/lib/window-fade";
import { cn } from "@/lib/utils";

export const CornerBox = <View,>({
  view,
  id,
  render,
  className,
}: {
  view: View;
  id: string;
  render: (view: View) => ReactNode;
  className?: string;
}) => {
  const { fading: windowFading } = useWindowFade();

  // Swap immediately during the parent fade instead of starting a second fade-out.
  const swap = useSwap(id, view, windowFading);

  const content = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number }>();
  const [animated, setAnimated] = useState(false);

  useLayoutEffect(() => {
    const element = content.current;

    if (!element) return;

    let wasShown = false;
    let animationFrame = 0;

    const observer = new ResizeObserver(() => {
      // Hidden tabs have no size; animate only after their first visible measurement.
      if (!element.offsetWidth) {
        wasShown = false;
        setAnimated(false);

        return;
      }

      setSize({ width: element.offsetWidth, height: element.offsetHeight });

      if (!wasShown)
        animationFrame = requestAnimationFrame(() => setAnimated(true));

      wasShown = true;
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Keep the new content hidden until the box has resized to fit it.
  const [settledId, setSettledId] = useState(swap.shownId);

  const settled = settledId === swap.shownId;

  useEffect(() => {
    if (settled) return;

    const timer = setTimeout(() => setSettledId(swap.shownId), fadeMs);

    return () => clearTimeout(timer);
  }, [settled, swap.shownId]);

  return (
    <div
      className={cn(
        "window-title box-content",
        animated &&
          "motion-safe:transition-[width,height] motion-safe:duration-(--fade-duration)",
        className,
      )}
      style={
        size ? { width: size.width, height: size.height } : { width: "auto" }
      }
    >
      {/* Measure the content while the outer box animates to fit. */}
      <div
        ref={content}
        className={cn(
          "w-max min-w-[4.5rem] motion-safe:transition-opacity motion-safe:duration-(--fade-duration)",
          swap.fading || !settled || windowFading ? "opacity-0" : "opacity-100",
        )}
      >
        {render(swap.view)}
      </div>
    </div>
  );
};
