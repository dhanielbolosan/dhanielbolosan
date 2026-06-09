import { Marquee } from "@/components/imports/marquee";
import { Avatar, AvatarFallback } from "@/components/imports/avatar";
import {
  PythonSvg,
  TypeScriptSvg,
  JavaScriptSvg,
  JavaSvg,
  PostgresSQLSvg,
  HTMLSvg,
  CSSSvg,
  SoliditySvg,
  ReactSvg,
  NextJSSvg,
  NodeJSSvg,
  TailwindCSSSvg,
  FlaskSvg,
  FastAPISvg,
  GitSvg,
  GitHubSvg,
  VSCodeSvg,
  DockerSvg,
  VercelSvg,
  GoogleCloudSvg,
  OpenAISvg,
  IntellijSvg,
  OllamaSvg,
  LangChainSvg,
  PrismaSvg,
  DrizzleSvg,
  ShadcnSvg,
  BootstrapSvg,
  MagicUISvg,
  ScaffoldETHSvg,
  HardhatSvg,
  PinataSvg,
  DaisyUISvg,
} from "@/components/svg";

type Skill = {
  name: string;
  avatar: React.ComponentType<React.SVGProps<SVGSVGElement>> | null;
};

const skills: Record<string, Skill[]> = {
  languages: [
    { name: "Python", avatar: PythonSvg },
    { name: "TypeScript", avatar: TypeScriptSvg },
    { name: "JavaScript", avatar: JavaScriptSvg },
    { name: "Java", avatar: JavaSvg },
    { name: "PostgreSQL", avatar: PostgresSQLSvg },
    { name: "HTML", avatar: HTMLSvg },
    { name: "CSS", avatar: CSSSvg },
    { name: "Solidity", avatar: SoliditySvg },
  ],
  frameworks: [
    { name: "React", avatar: ReactSvg },
    { name: "Next.js", avatar: NextJSSvg },
    { name: "Node.js", avatar: NodeJSSvg },
    { name: "Tailwind CSS", avatar: TailwindCSSSvg },
    { name: "Flask", avatar: FlaskSvg },
    { name: "FastAPI", avatar: FastAPISvg },
    { name: "Scaffold-ETH 2", avatar: ScaffoldETHSvg },
    { name: "Hardhat", avatar: HardhatSvg },
  ],
  tools: [
    { name: "Git", avatar: GitSvg },
    { name: "GitHub", avatar: GitHubSvg },
    { name: "VSCode", avatar: VSCodeSvg },
    { name: "Docker", avatar: DockerSvg },
    { name: "Vercel", avatar: VercelSvg },
    { name: "Google Cloud", avatar: GoogleCloudSvg },
    { name: "OpenAI", avatar: OpenAISvg },
    { name: "Intellij", avatar: IntellijSvg },
    { name: "Ollama", avatar: OllamaSvg },
    { name: "Pinata", avatar: PinataSvg },
  ],
  libraries: [
    { name: "LangChain", avatar: LangChainSvg },
    { name: "Prisma ORM", avatar: PrismaSvg },
    { name: "Drizzle ORM", avatar: DrizzleSvg },
    { name: "Shadcn UI", avatar: ShadcnSvg },
    { name: "Bootstrap", avatar: BootstrapSvg },
    { name: "Magic UI", avatar: MagicUISvg },
    { name: "Daisy UI", avatar: DaisyUISvg }
  ],
};

const allSkills = Object.values(skills).flat();
const firstRow = allSkills.slice(0, Math.ceil(allSkills.length / 2));
const secondRow = allSkills.slice(Math.ceil(allSkills.length / 2));

const SkillBadge = ({ name, avatar: Icon }: Skill) => {
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
};

export const Skills = () => {
  return (
    <section className="flex flex-col w-full gap-5 pb-10">

      <div className="w-full max-w-4xl mx-auto px-5">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Skills
        </h2>
      </div>

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

    </section>
  );
};
