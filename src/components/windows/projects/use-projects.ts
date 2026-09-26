import { useEffect, useRef, useState } from "react";
import { useWindowFade } from "@/lib/window-fade";
import { projects } from "./projects.data";

export const useProjects = () => {
  const [hoveredProjectIndex, setHoveredProjectIndex] = useState<number>();
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [isExpanded, setExpanded] = useState(false);

  const { fading, fadeTo } = useWindowFade();

  // Fade between the thumbnail grid and expanded gallery.
  const setExpandedView = (next: boolean) => fadeTo(() => setExpanded(next));

  const selectedProject = projects[selectedProjectIndex];

  const [lastPreviewedIndex, setLastPreviewedIndex] = useState(0);

  // Show the selected gallery, otherwise keep the last preview after hover ends.
  const previewedProject =
    projects[
      isExpanded
        ? selectedProjectIndex
        : (hoveredProjectIndex ?? lastPreviewedIndex)
    ];

  const pointedElementRef = useRef<HTMLElement>(null);
  const [pointerBounds, setPointerBounds] = useState<DOMRect>();

  // Preview the pointed project and measure its thumbnail for the hand.
  const pointAtProject = (projectIndex: number, element: HTMLElement) => {
    setHoveredProjectIndex(projectIndex);
    setLastPreviewedIndex(projectIndex);
    pointedElementRef.current = element;
    setPointerBounds(element.getBoundingClientRect());
  };

  // Keep the hand aligned during resizing and scrolling, including nested columns.
  useEffect(() => {
    const target =
      hoveredProjectIndex !== undefined ? pointedElementRef.current : null;

    if (!target) return;

    const updatePointerBounds = () => {
      const bounds = target.getBoundingClientRect();
      setPointerBounds(bounds.width ? bounds : undefined);
    };

    const observer = new ResizeObserver(updatePointerBounds);
    observer.observe(target);
    window.addEventListener("scroll", updatePointerBounds, true);
    window.addEventListener("resize", updatePointerBounds);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updatePointerBounds, true);
      window.removeEventListener("resize", updatePointerBounds);
    };
  }, [hoveredProjectIndex]);

  // Open the selected gallery and clear the thumbnail pointer.
  const selectProject = (projectIndex: number) => {
    setSelectedProjectIndex(projectIndex);
    setExpandedView(true);
    setHoveredProjectIndex(undefined);
  };

  return {
    hoveredProjectIndex,
    setHoveredProjectIndex,
    selectedProjectIndex,
    isExpanded,
    setExpandedView,
    selectedProject,
    previewedProject,
    fading,
    pointerBounds,
    pointAtProject,
    selectProject,
  };
};
