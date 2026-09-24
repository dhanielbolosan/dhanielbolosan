import hand from "@/assets/ff7-hand.png";
import { cn } from "@/lib/utils";

// FF7 menu cursor sprite (48x24), shown at 36px. Smooth scaling keeps its shading intact
// at a non-integer size. The fingertip sits in the sprite's top rows, so shift it down
// to point at the middle of the text beside it, as in the game.
export const PixelHand = ({ className }: { className?: string }) => (
  <img
    src={hand}
    alt=""
    aria-hidden="true"
    draggable={false}
    className={cn("h-auto w-9 translate-y-[25%]", className)}
  />
);
