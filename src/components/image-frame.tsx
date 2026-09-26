import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Shared bevel and square image area for portraits and project previews.
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
