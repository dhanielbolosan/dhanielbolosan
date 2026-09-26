import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fadeMs, useSwap } from "@/lib/use-swap";
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
  const swap = useSwap(id, view, windowFading);
  const content = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number }>();
  const [animated, setAnimated] = useState(false);

  useLayoutEffect(() => {
    const element = content.current;

    if (!element) return;

    let wasShown = false;

    const observer = new ResizeObserver(() => {
      if (!element.offsetWidth) {
        wasShown = false;
        setAnimated(false);
        return;
      }

      setSize({ width: element.offsetWidth, height: element.offsetHeight });

      if (!wasShown) requestAnimationFrame(() => setAnimated(true));
      wasShown = true;
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
        "motion-safe:transition-[width,height] motion-safe:duration-150",
        className,
      )}
      style={
        size ? { width: size.width, height: size.height } : { width: "auto" }
      }
    >
      <div
        ref={content}
        className={cn(
          "w-max min-w-[4.5rem] motion-safe:transition-opacity motion-safe:duration-150",
          swap.fading || !settled || windowFading ? "opacity-0" : "opacity-100",
        )}
      >
        {render(swap.view)}
      </div>
    </div>
  );
};
