import { useState } from "react";
import { useWindowFade } from "@/lib/menu/window-fade";
import { projects } from "./projects.data";

// Track the hovered, selected, and previewed projects and the expanded gallery.
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

  // Preview the pointed project.
  const pointAtProject = (projectIndex: number) => {
    setHoveredProjectIndex(projectIndex);
    setLastPreviewedIndex(projectIndex);
  };

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
    pointAtProject,
    selectProject,
  };
};
