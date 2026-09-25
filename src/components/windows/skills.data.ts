import { orbs } from "@/lib/materia";

// Each skill category is a materia type, wearing that type's orb.
export const groups = [
  {
    label: "Languages",
    orb: orbs.language,
    skills: ["Python", "TypeScript", "Java", "HTML", "CSS", "Solidity"],
  },
  {
    label: "Frameworks",
    orb: orbs.framework,
    skills: [
      "React",
      "Svelte",
      "Next.js",
      "Tailwind CSS",
      "FastAPI",
      "Capacitor",
    ],
  },
  {
    label: "Libraries",
    orb: orbs.library,
    skills: [
      "LangChain",
      "Shadcn UI",
      "Bootstrap",
      "Prisma ORM",
      "Drizzle ORM",
      "HyperFrames",
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
      "Vercel",
      "Cloudflare",
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
