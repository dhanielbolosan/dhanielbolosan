import { useEffect, useState } from "react";
import { reducedMotionQuery, useMedia } from "@/lib/use-media";
import { columns } from "./layout";
import { getEntranceDuration } from "./entrance";

// Play the opening entrance once, for the windows on screen, and report when it ends.
export const useMenuEntrance = (
  activeTabIndex: number,
  isTabletOrWider: boolean,
  rightColumnIndex: number,
) => {
  const isDesktop = useMedia("(min-width: 80rem)");
  const reducedMotion = useMedia(reducedMotionQuery);

  const [entering, setEntering] = useState(
    () => !window.matchMedia(reducedMotionQuery).matches,
  );

  useEffect(() => {
    if (!entering) return;

    // Wait only for columns visible at the current breakpoint.
    const visibleColumns = isDesktop
      ? columns.map((_, columnIndex) => columnIndex)
      : isTabletOrWider
        ? [0, rightColumnIndex]
        : [activeTabIndex];
    const duration = reducedMotion
      ? 0
      : getEntranceDuration(columns, visibleColumns);
    const timer = setTimeout(() => setEntering(false), duration);

    return () => clearTimeout(timer);
  }, [
    entering,
    isDesktop,
    isTabletOrWider,
    rightColumnIndex,
    activeTabIndex,
    reducedMotion,
  ]);

  return entering && !reducedMotion;
};
