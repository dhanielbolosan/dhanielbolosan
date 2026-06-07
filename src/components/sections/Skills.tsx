import { Marquee } from "@/components/imports/marquee";
import { Avatar, AvatarFallback } from "@/components/imports/avatar";
import {
  Python,
  TypeScript,
  JavaScript,
  Java,
  PostgresSQL,
  HTML,
  CSS,
  Solidity,
  ReactSVG,
  NextJS,
  NodeJS,
  TailwindCSS,
  Flask,
  FastAPI,
  Git,
  GitHub,
  VSCode,
  Docker,
  Vercel,
  GoogleCloud,
  OpenAI,
  Intellij,
  Ollama,
  LangChain,
  Prisma,
  Drizzle,
  Shadcn,
  Bootstrap,
} from "@/components/svg";

type Skill = {
  name: string;
  avatar: React.ComponentType<React.SVGProps<SVGSVGElement>> | null;
};

const skills: Record<string, Skill[]> = {
  languages: [
    { name: "Python", avatar: Python },
    { name: "TypeScript", avatar: TypeScript },
    { name: "JavaScript", avatar: JavaScript },
    { name: "Java", avatar: Java },
    { name: "PostgreSQL", avatar: PostgresSQL },
    { name: "HTML", avatar: HTML },
    { name: "CSS", avatar: CSS },
    { name: "Solidity", avatar: Solidity },
  ],
  frameworks: [
    { name: "React", avatar: ReactSVG },
    { name: "Next.js", avatar: NextJS },
    { name: "Node.js", avatar: NodeJS },
    { name: "Tailwind CSS", avatar: TailwindCSS },
    { name: "Flask", avatar: Flask },
    { name: "FastAPI", avatar: FastAPI },
  ],
  tools: [
    { name: "Git", avatar: Git },
    { name: "GitHub", avatar: GitHub },
    { name: "VSCode", avatar: VSCode },
    { name: "Docker", avatar: Docker },
    { name: "Vercel", avatar: Vercel },
    { name: "Google Cloud", avatar: GoogleCloud },
    { name: "OpenAI", avatar: OpenAI },
    { name: "Intellij", avatar: Intellij },
    { name: "Ollama", avatar: Ollama },
  ],
  libraries: [
    { name: "LangChain", avatar: LangChain },
    { name: "Prisma ORM", avatar: Prisma },
    { name: "Drizzle ORM", avatar: Drizzle },
    { name: "Shadcn", avatar: Shadcn },
    { name: "Bootstrap", avatar: Bootstrap },
  ],
};

const allSkills = Object.values(skills).flat();
const firstRow = allSkills.slice(0, Math.ceil(allSkills.length / 2));
const secondRow = allSkills.slice(Math.ceil(allSkills.length / 2));

function SkillBadge({ name, avatar: Icon }: Skill) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2">
      <Avatar size="sm">
        <AvatarFallback>
          {Icon ? (
            <Icon className="size-4" />
          ) : (
            <span className="text-[10px] font-medium">{name.slice(0, 2)}</span>
          )}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium whitespace-nowrap">{name}</span>
    </div>
  );
}

export function SkillsMarquee() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee
        pauseOnHover
        className="[--duration:60s]"
      >
        {firstRow.map((skill) => (
          <SkillBadge
            key={skill.name}
            {...skill}
          />
        ))}
      </Marquee>
      <Marquee
        reverse
        pauseOnHover
        className="[--duration:60s]"
      >
        {secondRow.map((skill) => (
          <SkillBadge
            key={skill.name}
            {...skill}
          />
        ))}
      </Marquee>
    </div>
  );
}
