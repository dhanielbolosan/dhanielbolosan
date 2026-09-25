import { useLayoutEffect, useRef } from "react";
import hand from "@/assets/ff7-hand.png";
import { cn } from "@/lib/utils";

// FF7 menu cursor sprite (48x24), shown at 20px everywhere. Smooth scaling keeps its shading intact
// at a non-integer size. The fingertip sits in the sprite's top rows, so shift it down
// to point at the middle of the text beside it, as in the game.
// Every hand's bob is anchored to the page's shared animation clock (start time 0), so
// all bobbing hands on screen move in step no matter when each appeared.
export const PixelHand = ({ className }: { className?: string }) => {
  const img = useRef<HTMLImageElement>(null);
  useLayoutEffect(() => {
    for (const animation of img.current?.getAnimations() ?? [])
      animation.startTime = 0;
  }, [className]);
  return (
    <img
      ref={img}
      src={hand}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={cn("h-auto w-5 translate-y-[25%]", className)}
    />
  );
};

// The hand for a menu row that reserves the hand's space on its left (pl-7: the
// 20px hand plus an 8px gap), vertically centered on the row. Hidden rather than
// removed when inactive, so it never shifts the layout; `bob` is the idle bob for a
// hand left behind at an earlier step.
export const RowHand = ({
  show,
  bob,
  className,
}: {
  show: boolean;
  bob?: boolean;
  className?: string;
}) => (
  <PixelHand
    className={cn(
      "absolute inset-y-0 left-0 my-auto",
      !show && "invisible",
      bob && "motion-safe:animate-bob",
      className,
    )}
  />
);
