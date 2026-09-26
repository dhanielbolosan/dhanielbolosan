import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Bar } from "../bar";
import { Choices } from "../choices";
import { CornerBox } from "../corner-box";
import { useWindowFade } from "@/lib/window-fade";
import { Faded, WindowHeader } from "../window";
import { orbs } from "@/lib/materia";
import { canHoverQuery, useMedia } from "@/lib/use-media";
import { IconItem } from "../icon-item";
import { ImageFrame } from "../image-frame";
import { PixelHand } from "../pixel-hand";
import { Stats } from "../stats";
import { projects, type Project } from "./projects.data";

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

const Thumbnail = ({
  project,
  active,
  className,
  expanded = false,
}: {
  project: Project;
  active: boolean;
  className: string;
  expanded?: boolean;
}) => {
  const images =
    !expanded && project.thumbnail ? [project.thumbnail] : project.images;
  const index = useSlideshow(images.length, active);
  return (
    <ImageFrame className={className}>
      {images.length === 0 && (
        <span className="absolute inset-0 grid place-items-center p-1 text-center font-heading text-xs">
          {project.name}
        </span>
      )}
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-[450ms]",
            expanded ? "object-contain" : "object-cover",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </ImageFrame>
  );
};

export const Projects = () => {
  const [hovered, setHovered] = useState<number>();
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const { fading, fadeTo } = useWindowFade();
  const open = (next: boolean) => fadeTo(() => setExpanded(next));
  const current = projects[selected];
  const [last, setLast] = useState(0);
  const info = projects[expanded ? selected : (hovered ?? last)];

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

    const follow = () => {
      const rect = target.getBoundingClientRect();
      setHandAt(rect.width ? rect : undefined);
    };

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
      onKeyDown={(event) => event.key === "Escape" && expanded && open(false)}
    >
      <WindowHeader
        help={
          expanded
            ? "Select Back to return to projects"
            : "Select entry to view more info"
        }
      >
        <CornerBox
          view={expanded}
          id={expanded ? "back" : "title"}
          className="window-corner"
          render={(back) =>
            back ? (
              <>
                <h2 className="sr-only">Projects</h2>
                <Choices
                  boxed
                  items={[{ label: "Back", onSelect: () => open(false) }]}
                />
              </>
            ) : (
              <h2>Projects</h2>
            )
          }
        />
      </WindowHeader>

      <Faded className="shrink-0">
        {expanded ? (
          <div className="h-63 shrink-0 py-3">
            <button
              type="button"
              aria-label={`Close ${current.name}`}
              onClick={() => open(false)}
              className="block size-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Thumbnail
                project={current}
                active
                expanded
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
                    open(true);
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
      </Faded>

      {!expanded &&
        !fading &&
        (hovered !== undefined || resting) &&
        handAt &&
        createPortal(
          <span
            aria-hidden="true"
            className="pointer-events-none fixed z-50 flex items-center"
            style={{
              top: handAt.top,
              left: Math.max(4, handAt.left - 28),
              height: handAt.height,
            }}
          >
            <PixelHand className="motion-safe:animate-bob" />
          </span>,
          document.body,
        )}

      <Faded className="-mx-5 -mb-5 flex flex-1 flex-col">
        <div className="window flex flex-1 flex-col gap-1.5 px-5 py-3.5">
          <h3 className="font-heading text-base font-semibold">{info.name}</h3>
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
      </Faded>
    </section>
  );
};
