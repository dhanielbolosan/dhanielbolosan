import { orbs } from "@/lib/materia";
import type { skillIcons } from "./skill-icons";

// Only skills with an icon, so a misspelled name fails the build.
type Skill = keyof typeof skillIcons;

export const groups: { label: string; orb: string; skills: Skill[] }[] = [
  {
    label: "Languages",
    orb: orbs.language,
    skills: ["Python", "TypeScript", "Java", "HTML", "CSS", "Solidity"],
  },

  {
    label: "Frameworks",
    orb: orbs.framework,
    skills: [
      "Next.js",
      "Svelte",
      "Tailwind CSS",
      "FastAPI",
      "Capacitor",
      "Bootstrap",
    ],
  },

  {
    label: "Libraries",
    orb: orbs.library,
    skills: [
      "React",
      "LangChain",
      "Shadcn UI",
      "Prisma ORM",
      "Drizzle ORM",
      "FFmpeg",
    ],
  },

  {
    label: "Tools",
    orb: orbs.tool,
    skills: [
      "Git",
      "Claude Code",
      "Codex",
      "Docker",
      "Google Cloud",
      "Cloudflare",
      "Vite",
      "Ollama",
      "Apify",
    ],
  },

  {
    label: "Databases",
    orb: orbs.database,
    skills: ["PostgreSQL", "Redis", "SQLite"],
  },
];
