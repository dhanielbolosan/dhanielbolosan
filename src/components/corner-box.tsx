import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { useSwap } from "@/lib/use-swap";
import { useWindowFade } from "@/lib/window-fade";

const resizeMs = 200;

// An FF7 corner window whose content swaps: a title, or a command menu that takes the
// title's place. On a swap the old content fades out, the box resizes to fit the new
// content (growing for a bigger menu, shrinking back for the title), and only once it
// has finished resizing does the new content fade in. The first render just appears.
//
// `view` is what to show and `id` names it; `render` draws a view.
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
  // While its window fades between screens, the box hides its text too, and then
  // swaps without fading it again.
  const { fading: windowFading } = useWindowFade();
  const swap = useSwap(id, view, windowFading);

  // The box follows its content's size. Transitions only switch on after the first
  // measurement, so the box's initial size isn't animated.
  const content = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number }>();
  const [animated, setAnimated] = useState(false);
  useLayoutEffect(() => {
    const element = content.current;
    if (!element) return;
    // A box in a hidden tab (phones) measures 0x0. Ignore that, and when it next shows
    // up, snap to its size before animating, instead of growing from nothing.
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

  // After a swap, the new content stays hidden until the resize is done (plus a frame
  // for the resize to start).
  const [settledId, setSettledId] = useState(swap.shownId);
  const settled = settledId === swap.shownId;
  useEffect(() => {
    if (settled) return;
    const timer = setTimeout(() => setSettledId(swap.shownId), resizeMs + 30);
    return () => clearTimeout(timer);
  }, [settled, swap.shownId]);

  return (
    <div
      className={cn(
        "window-title box-content",
        animated &&
          "motion-safe:transition-[width,height] motion-safe:duration-200",
        className,
      )}
      // Content-sized until measured (the title utility's fixed width would otherwise
      // show for a frame).
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
