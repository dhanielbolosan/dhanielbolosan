import hand from "@/assets/ff7-hand.png";
import { cn } from "@/lib/utils";

// FF7 menu cursor sprite (48x24). Keep widths at 48px or 24px so pixels scale evenly.
export const PixelHand = ({ className }: { className?: string }) => (
  <img
    src={hand}
    alt=""
    aria-hidden="true"
    draggable={false}
    className={cn("h-auto w-12 [image-rendering:pixelated]", className)}
  />
);
