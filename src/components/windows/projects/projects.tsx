import { createPortal } from "react-dom";
import { Choices } from "../../choices";
import { CornerBox } from "../../corner-box";
import { Faded, WindowHeader } from "../../window";
import { PixelHand } from "../../pixel-hand";
import { projects } from "./projects.data";
import { ProjectPreview } from "./project-preview";
import { ProjectDetails } from "./project-details";
import { useProjects } from "./use-projects";

export const Projects = () => {
  const {
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
  } = useProjects();

  return (
    <section
      className="flex grow flex-col"
      onKeyDown={(event) =>
        event.key === "Escape" && isExpanded && setExpandedView(false)
      }
    >
      <WindowHeader
        help={isExpanded ? "Select Back to return" : "Select entry to focus"}
      >
        <CornerBox
          view={isExpanded}
          id={isExpanded ? "back" : "title"}
          className="window-corner"
          render={(back) =>
            back ? (
              <>
                <h2 className="sr-only">Projects</h2>

                <Choices
                  boxed
                  items={[
                    { label: "Back", onSelect: () => setExpandedView(false) },
                  ]}
                />
              </>
            ) : (
              <h2>Projects</h2>
            )
          }
        />
      </WindowHeader>

      {/* Switch between thumbnails and the expanded gallery. */}
      <Faded className="shrink-0">
        {isExpanded ? (
          <div className="h-63 shrink-0 py-3">
            <button
              type="button"
              aria-label={`Close ${selectedProject.name}`}
              onClick={() => setExpandedView(false)}
              className="block size-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ProjectPreview
                project={selectedProject}
                active
                expanded
                className="size-full"
              />
            </button>
          </div>
        ) : (
          <ul
            className="grid h-63 shrink-0 grid-cols-3 place-content-evenly place-items-center gap-y-3 py-3"
            onMouseLeave={() => setHoveredProjectIndex(undefined)}
          >
            {projects.map((project, projectIndex) => (
              <li key={project.name}>
                <button
                  type="button"
                  aria-label={project.name}
                  aria-pressed={projectIndex === selectedProjectIndex}
                  onClick={() => {
                    selectProject(projectIndex);
                  }}
                  onMouseEnter={(event) =>
                    pointAtProject(projectIndex, event.currentTarget)
                  }
                  onFocus={(event) =>
                    pointAtProject(projectIndex, event.currentTarget)
                  }
                  onBlur={() => setHoveredProjectIndex(undefined)}
                  className="relative block cursor-pointer outline-none"
                >
                  <ProjectPreview
                    project={project}
                    active={projectIndex === hoveredProjectIndex}
                    className="size-27"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Faded>

      {!isExpanded &&
        !fading &&
        hoveredProjectIndex !== undefined &&
        pointerBounds &&
        // Render the hand in a portal so the column cannot clip it.
        createPortal(
          <span
            aria-hidden="true"
            className="pointer-events-none fixed z-50 flex items-center"
            style={{
              top: pointerBounds.top,
              left: Math.max(4, pointerBounds.left - 28),
              height: pointerBounds.height,
            }}
          >
            <PixelHand className="motion-safe:animate-bob" />
          </span>,
          document.body,
        )}

      <ProjectDetails project={previewedProject} />
    </section>
  );
};
