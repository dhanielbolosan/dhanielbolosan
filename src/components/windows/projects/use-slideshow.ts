import { useEffect, useState } from "react";
import { slideshowIntervalMs } from "@/lib/motion";

export const useSlideshow = (count: number, active: boolean) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Cycle only active previews with multiple images; wrap at the end.
    if (!active || count < 2) return;

    const timer = setInterval(
      () => setIndex((currentIndex) => (currentIndex + 1) % count),
      slideshowIntervalMs,
    );

    // Stop and reset when the preview becomes inactive or its image count changes.
    return () => {
      clearInterval(timer);
      setIndex(0);
    };
  }, [active, count]);

  return index;
};
