import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PixelHand } from "../pixel-hand";
import { cn } from "@/lib/utils";

const projects = [
  {
    name: "KopeChain",
    images: [
      "/projects/kopechain1.png",
      "/projects/kopechain2.png",
      "/projects/kopechain3.png",
    ],
    description:
      "Decentralized supply chain tracker on Base Sepolia Testnet to verify the origin of local Hawaiian coffee.",
    stack: ["Scaffold-ETH 2", "Solidity", "Hardhat", "Pinata", "DaisyUI"],
  },
  {
    name: "Legislative Cloud Platform",
    images: ["/projects/uhgro1.png", "/projects/uhgro2.png"],
    description:
      "Backend service powering AI bill summarization and automated notifications for university officials.",
    stack: ["FastAPI", "Google Cloud", "Docker", "Apify", "SMTP"],
  },
  {
    name: "VENOM-RAG",
    images: ["/projects/venomrag1.png", "/projects/venomrag2.png"],
    description:
      "Security research demonstrating adversarial data poisoning and retrieval manipulation in RAG pipelines.",
    stack: ["Python", "Jupyter Notebook", "LangChain", "FAISS", "Ollama"],
  },
  {
    name: "Pathfinity",
    images: ["/projects/pathfinity1.png", "/projects/pathfinity2.png"],
    description:
      "Full-stack semantic search interface enabling students to query university course data via natural language.",
    stack: ["Hackathon", "Next.js", "OpenAI", "Shadcn UI", "Neon Postgres"],
  },
];

interface ProjectProps {
  name: string;
  images: string[];
  description: string;
  stack: string[];
}

const ProjectCard = ({ name, images, description, stack }: ProjectProps) => {
  const [currImage, setCurrImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!isHovering || images.length <= 1) {
      setCurrImage(0);
      return;
    }

    setCurrImage(1 % images.length);

    const interval = setInterval(() => {
      setCurrImage((prev) => (prev + 1) % images.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isHovering, images.length]);

  return (
    <article
      className="flex flex-col gap-3 rounded-[3px] border border-frame/40 bg-black/25 p-3"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-[3px] border border-frame/60">
        {images.map((src: string, i: number) => (
          <img
            key={src}
            src={src}
            alt={name}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${i === currImage ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
      <h3 className="font-heading text-base font-semibold">{name}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 font-heading text-sm">
        <dt className="text-label">Equip</dt>
        <dd>{stack.join(" · ")}</dd>
      </dl>
    </article>
  );
};

const step =
  "cursor-pointer rounded-[3px] p-1.5 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring";

export const Projects = () => {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (next: number) => {
    setDir(next > index ? 1 : -1);
    setIndex((next + projects.length) % projects.length);
  };

  return (
    <section className="flex flex-col gap-4">
      <motion.div
        key={index}
        initial={{ opacity: 0, x: dir * 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <ProjectCard {...projects[index]} />
      </motion.div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Previous project"
          className={step}
        >
          <PixelHand className="-scale-x-100" />
        </button>
        <div className="flex items-center gap-2">
          <span className="mr-1 font-heading text-sm text-label tabular-nums">
            {index + 1} / {projects.length}
          </span>
          {projects.map((project, i) => (
            <button
              key={project.name}
              type="button"
              onClick={() => go(i)}
              aria-label={project.name}
              aria-current={i === index || undefined}
              className={cn(
                "size-2.5 cursor-pointer rounded-[1px] border border-frame outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === index ? "bg-frame" : "bg-transparent hover:bg-frame/40",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Next project"
          className={step}
        >
          <PixelHand />
        </button>
      </div>
    </section>
  );
};
