import magic from "@/assets/materia/magic.png";
import command from "@/assets/materia/command.png";
import support from "@/assets/materia/support.png";
import independent from "@/assets/materia/independent.png";
import summon from "@/assets/materia/summon.png";

// Each skill category is a materia type, colored the way FF7 colors them. Orb sprites
// are from a fan-made sheet by JackTheRippa (The Spriters Resource), free to use.
export const groups = [
  {
    label: "Languages",
    orb: magic,
    skills: ["Python", "TypeScript", "Java", "HTML", "CSS", "Solidity"],
  },
  {
    label: "Frameworks",
    orb: command,
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
    orb: support,
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
    orb: independent,
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
    orb: summon,
    skills: ["PostgreSQL", "Redis", "SQLite"],
  },
];

// Materia type names for project stacks, one per Skills category.
export const orbs = {
  language: magic,
  framework: command,
  library: support,
  tool: independent,
  database: summon,
};

export type MateriaType = keyof typeof orbs;
