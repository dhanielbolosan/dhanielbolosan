import { useLayoutEffect, useRef } from "react";
import hand from "@/assets/ff7-hand.png";
import { cn } from "@/lib/utils";

// The FF7 glove pointer, kept in step with every other hand on the page.
export const PixelHand = ({ className }: { className?: string }) => {
  const imageRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    // Keep all pointer animations in phase.
    for (const animation of imageRef.current?.getAnimations() ?? [])
      animation.startTime = 0;
  }, [className]);

  return (
    <img
      ref={imageRef}
      src={hand}
      alt=""
      aria-hidden="true"
      draggable={false}
      // A bob that starts on hover joins the others' phase.
      onAnimationStart={(event) => {
        for (const animation of event.currentTarget.getAnimations())
          animation.startTime = 0;
      }}
      className={cn("h-auto w-5 translate-y-[25%]", className)}
    />
  );
};

// Place the hand left of a list row, hidden until the row is pointed at.
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
      // A hidden hand stays still, so it costs no style updates; it bobs once shown or revealed by its row.
      bob &&
        (show
          ? "motion-safe:animate-bob"
          : "group-hover:motion-safe:animate-bob group-focus-visible:motion-safe:animate-bob"),
      className,
    )}
  />
);
