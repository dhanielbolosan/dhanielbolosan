import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Wrap an image in the beveled FF7 frame.
export const ImageFrame = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("bevel p-1.5", className)}>
    <div className="relative size-full overflow-hidden bg-black/20">
      {children}
    </div>
  </div>
);
