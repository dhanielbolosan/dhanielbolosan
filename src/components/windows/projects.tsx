import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Bar } from "../bar";
import { Choices } from "../choices";
import { orbs } from "@/lib/materia";
import { canHoverQuery, useMedia } from "@/lib/use-media";
import { IconItem } from "../icon-item";
import { PixelHand } from "../pixel-hand";
import { Stats } from "../stats";
import { projects, type Project } from "./projects.data";

// Cycles a project's screenshots while `active`; resets to the first otherwise.
const useSlideshow = (count: number, active: boolean) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active || count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 1500);
    return () => {
      clearInterval(id);
      setIndex(0);
    };
  }, [active, count]);
  return index;
};

// Thumbnail framed like the Status portrait (6px bevel around the image); cycles through
// the project's screenshots while `active`.
const Thumbnail = ({
  project,
  active,
  className,
}: {
  project: Project;
  active: boolean;
  className: string;
}) => {
  const index = useSlideshow(project.images.length, active);
  return (
    <div className={cn("bevel p-1.5", className)}>
      <div className="relative size-full overflow-hidden rounded-[2px] bg-black/30">
        {project.images.length === 0 && (
          <span className="absolute inset-0 grid place-items-center p-1 text-center font-heading text-xs">
            {project.name}
          </span>
        )}
        {project.images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-500",
              i === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>
    </div>
  );
};

// FF7 party-select style: square project thumbnails fill the top half, and the info
// window below fills the bottom half. Hovering a thumbnail shows the hand and previews
// it in the info window. Clicking one enlarges it to fill the grid area, auto-cycling
// its screenshots; clicking it again (or Escape) returns to the grid.
export const Projects = () => {
  const [hovered, setHovered] = useState<number>();
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const current = projects[selected];
  // The info window shows the open project while enlarged; otherwise the one under the
  // hand, staying on the last one pointed at (the first project to start).
  const [last, setLast] = useState(0);
  const info = projects[expanded ? selected : (hovered ?? last)];

  // The hand sits 8px left of the pointed thumbnail like every other hand, but there's
  // no room for it between thumbnails (or before the first column), so it's drawn on
  // top of the page instead: a fixed layer placed from the thumbnail's position, which
  // the column's scroll edge can't clip. Scrolling or resizing moves it along. On touch
  // screens, with nothing pointed at, it rests on the first thumbnail, waiting for a tap.
  const canHover = useMedia(canHoverQuery);
  const resting = !canHover && hovered === undefined && !expanded;
  const pointed = useRef<HTMLElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  const [handAt, setHandAt] = useState<DOMRect>();
  const point = (i: number, element: HTMLElement) => {
    setHovered(i);
    setLast(i);
    pointed.current = element;
    setHandAt(element.getBoundingClientRect());
  };
  useEffect(() => {
    const target =
      hovered !== undefined ? pointed.current : resting ? first.current : null;
    if (!target) return;
    // A thumbnail that isn't laid out (its tab is hidden) has an empty box: no hand.
    const follow = () => {
      const rect = target.getBoundingClientRect();
      setHandAt(rect.width ? rect : undefined);
    };
    // The observer also fires when a hidden tab's grid appears, which no scroll or
    // resize event reports, and once on start (placing the resting hand).
    const observer = new ResizeObserver(follow);
    observer.observe(target);
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
    };
  }, [hovered, resting]);

  return (
    <section
      className="flex grow flex-col"
      onKeyDown={(event) => event.key === "Escape" && setExpanded(false)}
    >
      {/* Title box, which the Back command box replaces while a project is enlarged. */}
      <div className="-mt-5 -mr-5 flex h-10 items-start justify-end">
        {expanded ? (
          <>
            <h2 className="sr-only">Projects</h2>
            <Choices
              boxed
              items={[{ label: "Back", onSelect: () => setExpanded(false) }]}
            />
          </>
        ) : (
          <h2 className="window-title mr-0!">Projects</h2>
        )}
      </div>

      {expanded ? (
        <div className="h-63 shrink-0 py-3">
          <button
            type="button"
            aria-label={`Close ${current.name}`}
            onClick={() => setExpanded(false)}
            className="block size-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Thumbnail
              project={current}
              active
              className="size-full"
            />
          </button>
        </div>
      ) : (
        <ul
          className="grid h-63 shrink-0 grid-cols-3 place-content-evenly place-items-center gap-y-3 py-3"
          onMouseLeave={() => setHovered(undefined)}
        >
          {projects.map((project, i) => (
            <li key={project.name}>
              <button
                ref={i === 0 ? first : undefined}
                type="button"
                aria-label={project.name}
                aria-pressed={i === selected}
                onClick={() => {
                  setSelected(i);
                  setExpanded(true);
                  setHovered(undefined);
                }}
                onMouseEnter={(event) => point(i, event.currentTarget)}
                onFocus={(event) => point(i, event.currentTarget)}
                onBlur={() => setHovered(undefined)}
                className="relative block cursor-pointer outline-none"
              >
                <Thumbnail
                  project={project}
                  active={i === hovered}
                  className="size-27"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!expanded &&
        (hovered !== undefined || resting) &&
        handAt &&
        createPortal(
          <span
            aria-hidden="true"
            className="pointer-events-none fixed z-50 flex items-center"
            // 20px hand + 8px gap to the thumbnail's left edge.
            style={{
              top: handAt.top,
              // Phones: the first column is closer than that to the screen's edge, so
              // the hand stops 4px inside it rather than going off screen.
              left: Math.max(4, handAt.left - 28),
              height: handAt.height,
            }}
          >
            <PixelHand className="motion-safe:animate-bob" />
          </span>,
          document.body,
        )}

      {/* Bottom half: info window flush with the frame's sides and bottom. It fills the
          leftover space but never shrinks below its content, so on short screens the
          window grows and the column scrolls instead of cutting it off. */}
      <div className="window -mx-5 -mb-5 flex flex-1 flex-col gap-1.5 px-5 py-3.5">
        <h3 className="font-heading text-base font-semibold">{info.name}</h3>

        {/* Status-card style stats, two pairs per row to fit the window. The Link row
            only appears when the project has one. */}
        <Stats
          columns={4}
          pairs={[
            ["Type", info.type ?? "—"],
            ["Date", info.date ?? "—"],
            [
              "Progress",
              <span className="flex h-full items-center">
                <Bar
                  value={(info.progress ?? 0) / 100}
                  label="Progress"
                  className="h-2.5 w-full"
                />
              </span>,
            ],
            ...(info.link?.href
              ? ([
                  [
                    "Link",
                    <a
                      href={info.link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold underline underline-offset-2 hover:text-foreground"
                    >
                      {info.link.label}
                    </a>,
                  ],
                ] as const)
              : []),
          ]}
        />

        <p className="text-sm leading-relaxed">{info.description}</p>

        {/* Stack as materia, right under the description: each tech wears its type's orb. */}
        <ul className="mt-1.5 grid grid-cols-3 gap-x-3 gap-y-1 font-heading text-sm">
          {info.stack.map(({ name: tech, type }) => (
            <IconItem
              key={tech}
              icon={
                <img
                  src={orbs[type]}
                  alt=""
                  className="size-4 shrink-0 [image-rendering:pixelated]"
                />
              }
            >
              {tech}
            </IconItem>
          ))}
        </ul>
      </div>
    </section>
  );
};
