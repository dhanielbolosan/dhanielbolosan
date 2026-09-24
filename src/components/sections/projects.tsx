import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Bar } from "../bar";
import { Choices } from "../choices";
import { orbs, type MateriaType } from "./skill-groups";
import { PixelHand } from "../pixel-hand";

type ProjectData = {
  name: string;
  images: string[];
  description: string;
  stack: { name: string; type: MateriaType }[];
  type?: string;
  date?: string;
  /** 0-100; a full bar flashes like FF7's Limit bar. */
  progress?: number;
  link?: { label: string; href: string };
};

const projects: ProjectData[] = [
  {
    name: "Kumu",
    images: [],
    description:
      "Human-in-the-loop Claude Code skill that researches a topic, writes a script, and renders a narrated infographic video with captions and music.",
    stack: [
      { name: "Claude Code", type: "tool" },
      { name: "HyperFrames", type: "library" },
      { name: "HTML/CSS", type: "language" },
      { name: "FFmpeg", type: "tool" },
      { name: "Kokoro TTS", type: "library" },
      { name: "whisper.cpp", type: "tool" },
    ],
    type: "Personal",
    date: "Sep 2026",
    progress: 75,
    link: {
      label: "Repo",
      href: "https://github.com/blockchain-in-paradise/kumu",
    },
  },
  {
    name: "Geospatial Mobile Dashboard",
    images: [],
    description:
      "Capacitor mobile app for SENTINEL, pairing a Cesium 3D globe of live wildfire, seismic, weather, and aviation feeds with Starlink orbits and a FastAPI backend.",
    stack: [
      { name: "Capacitor", type: "framework" },
      { name: "React", type: "framework" },
      { name: "TypeScript", type: "language" },
      { name: "Cesium", type: "library" },
      { name: "FastAPI", type: "framework" },
      { name: "TanStack Query", type: "library" },
    ],
    type: "Internship",
    date: "June - July 2026",
    progress: 100,
  },
  {
    name: "KopeChain",
    images: [
      "/projects/kopechain1.png",
      "/projects/kopechain2.png",
      "/projects/kopechain3.png",
    ],
    description:
      "Decentralized supply chain tracker on Base Sepolia Testnet to verify the origin of local Hawaiian coffee, with QR codes, 3D mapping, and NFT minting.",
    stack: [
      { name: "Scaffold-ETH 2", type: "framework" },
      { name: "Solidity", type: "language" },
      { name: "Hardhat", type: "framework" },
      { name: "Pinata", type: "tool" },
      { name: "DaisyUI", type: "library" },
      { name: "Next.js", type: "framework" },
    ],
    type: "Internship",
    date: "Jan – May 2026",
    progress: 100,
    link: { label: "Site", href: "https://kope-chain.vercel.app/" },
  },
  {
    name: "Legislative Cloud Platform",
    images: ["/projects/uhgro1.png", "/projects/uhgro2.png"],
    description:
      "Backend service powering AI bill summarization and automated notifications for university officials, helping UH staff track legislation that affects the university.",
    stack: [
      { name: "FastAPI", type: "framework" },
      { name: "Google Cloud", type: "tool" },
      { name: "Docker", type: "tool" },
      { name: "Apify", type: "tool" },
      { name: "SMTP", type: "tool" },
      { name: "Python", type: "language" },
    ],
    type: "Internship",
    date: "Aug – Dec 2025",
    progress: 100,
    link: {
      label: "Org",
      href: "https://github.com/orgs/engr401-groot-ai/repositories",
    },
  },
  {
    name: "VENOM-RAG",
    images: ["/projects/venomrag1.png", "/projects/venomrag2.png"],
    description:
      "Security research demonstrating adversarial data poisoning and retrieval manipulation in RAG pipelines through vector manipulation and PDF font poisoning.",
    stack: [
      { name: "Python", type: "language" },
      { name: "Jupyter Notebook", type: "tool" },
      { name: "LangChain", type: "library" },
      { name: "FAISS", type: "library" },
      { name: "Ollama", type: "tool" },
      { name: "FastAPI", type: "framework" },
    ],
    type: "Research",
    date: "Jan – May 2026",
    progress: 100,
  },
  {
    name: "Pathfinity",
    images: ["/projects/pathfinity1.png", "/projects/pathfinity2.png"],
    description:
      "Full-stack semantic search interface enabling students to query university course data via natural language, with GitHub and Google sign-in.",
    stack: [
      { name: "Next.js", type: "framework" },
      { name: "OpenAI", type: "tool" },
      { name: "Shadcn UI", type: "library" },
      { name: "Neon Postgres", type: "database" },
      { name: "TypeScript", type: "language" },
      { name: "Drizzle ORM", type: "library" },
    ],
    type: "Hackathon",
    date: "Oct – Nov 2025",
    progress: 100,
    link: { label: "Repo", href: "https://github.com/HACC25/Pathfinity" },
  },
];

type Project = ProjectData;

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
    <div
      className={cn(
        "rounded-[5px] p-1.5 [box-shadow:var(--frame-bevel)]",
        className,
      )}
    >
      <div className="relative size-full overflow-hidden rounded-[2px] bg-black/30">
        {project.images.length === 0 && (
          <span className="absolute inset-0 grid place-items-center p-1 text-center font-heading text-xs text-muted-foreground">
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
        <div className="h-60 shrink-0 py-1.5">
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
          className="grid h-60 shrink-0 grid-cols-3 place-content-evenly place-items-center gap-y-3 py-1.5"
          onMouseLeave={() => setHovered(undefined)}
        >
          {projects.map((project, i) => (
            <li key={project.name}>
              <button
                type="button"
                aria-label={project.name}
                aria-pressed={i === selected}
                onClick={() => {
                  setSelected(i);
                  setExpanded(true);
                  setHovered(undefined);
                }}
                onMouseEnter={() => {
                  setHovered(i);
                  setLast(i);
                }}
                onFocus={() => {
                  setHovered(i);
                  setLast(i);
                }}
                onBlur={() => setHovered(undefined)}
                className="relative block cursor-pointer outline-none"
              >
                {i === hovered && (
                  <PixelHand className="absolute inset-y-0 -left-7 z-10 my-auto motion-safe:animate-bob" />
                )}
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

      {/* Bottom half: info window flush with the frame's sides and bottom. It fills the
          leftover space but never shrinks below its content, so on short screens the
          window grows and the column scrolls instead of cutting it off. */}
      <div className="window -mx-5 -mb-5 flex flex-1 flex-col gap-1.5 px-5 py-3.5">
        <h3 className="font-heading text-lg font-semibold">{info.name}</h3>

        {/* Status-card style stats, two pairs per row to fit the window. */}
        <dl className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-3 font-heading text-sm">
          <dt className="text-label">Type</dt>
          <dd>{info.type ?? "—"}</dd>
          <dt className="text-label">Date</dt>
          <dd>{info.date ?? "—"}</dd>
          <dt className="text-label">Progress</dt>
          <dd className="flex items-center">
            <Bar
              value={(info.progress ?? 0) / 100}
              label="Progress"
              className="h-2.5 w-full"
            />
          </dd>
          {/* Link row only appears when the project has one. */}
          {info.link?.href && (
            <>
              <dt className="text-label">Link</dt>
              <dd>
                <a
                  href={info.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold underline underline-offset-2 hover:text-foreground"
                >
                  {info.link.label}
                </a>
              </dd>
            </>
          )}
        </dl>

        <p className="text-sm leading-relaxed">{info.description}</p>

        {/* Stack as materia, right under the description: each tech wears its type's orb. */}
        <ul className="mt-1.5 grid grid-cols-3 gap-x-3 gap-y-1 font-heading text-sm">
          {info.stack.map(({ name: tech, type }) => (
            <li
              key={tech}
              className="flex min-w-0 items-center gap-1.5"
            >
              <img
                src={orbs[type]}
                alt=""
                className="size-4 shrink-0 [image-rendering:pixelated]"
              />
              <span className="truncate">{tech}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
