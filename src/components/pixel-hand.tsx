import hand from "@/assets/ff7-hand.png";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

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
      className={cn("h-auto w-5 translate-y-[25%]", className)}
    />
  );
};

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
