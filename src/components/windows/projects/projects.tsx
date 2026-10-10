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
    isExpanded,
    setExpandedView,
    selectedProject,
    previewedProject,
    fading,
    pointAtProject,
    selectProject,
  } = useProjects();

  return (
    <section className="flex grow flex-col">
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
                    {
                      label: "Back",
                      onSelect: () => setExpandedView(false),
                    },
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
          <div
            role="img"
            aria-label={`${selectedProject.name} screenshots`}
            className="h-63 shrink-0 py-3"
          >
            <ProjectPreview
              project={selectedProject}
              active
              expanded
              className="size-full"
            />
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
                  title={project.name}
                  onClick={() => {
                    selectProject(projectIndex);
                  }}
                  onMouseEnter={() => pointAtProject(projectIndex)}
                  onFocus={() => pointAtProject(projectIndex)}
                  onBlur={() => setHoveredProjectIndex(undefined)}
                  className="relative block cursor-pointer outline-none"
                >
                  {/* The hand lives inside the button so it scrolls with the thumbnail. */}
                  {projectIndex === hoveredProjectIndex && !fading && (
                    <PixelHand className="pointer-events-none absolute inset-y-0 right-full z-10 my-auto mr-1.5 motion-safe:animate-bob" />
                  )}

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

      <ProjectDetails project={previewedProject} />
    </section>
  );
};
