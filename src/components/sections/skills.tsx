import { Marquee } from "@/components/imports/marquee";
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
  SvelteSvg,
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
  CloudflareSvg,
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
  CesiumSvg,
  CapacitorSvg,
  AndroidStudioSvg,
  XcodeSvg,
  RedisSvg,
  NeonSvg,
  JupyterSvg,
  ApifySvg,
  ClaudeCodeSvg,
  CodexSvg,
  JestSvg,
  NestJSSvg,
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
    { name: "HTML", avatar: HTMLSvg },
    { name: "CSS", avatar: CSSSvg },
    { name: "Solidity", avatar: SoliditySvg },
  ],
  databases: [
    { name: "PostgreSQL", avatar: PostgresSQLSvg },
    { name: "Redis", avatar: RedisSvg },
    { name: "Neon", avatar: NeonSvg },
  ],
  frameworks: [
    { name: "React", avatar: ReactSvg },
    { name: "Svelte", avatar: SvelteSvg },
    { name: "Next.js", avatar: NextJSSvg },
    { name: "Node.js", avatar: NodeJSSvg },
    { name: "NestJS", avatar: NestJSSvg },
    { name: "Tailwind CSS", avatar: TailwindCSSSvg },
    { name: "Flask", avatar: FlaskSvg },
    { name: "FastAPI", avatar: FastAPISvg },
    { name: "Scaffold-ETH 2", avatar: ScaffoldETHSvg },
    { name: "Hardhat", avatar: HardhatSvg },
    { name: "Capacitor", avatar: CapacitorSvg },
    { name: "Jest", avatar: JestSvg },
  ],
  tools: [
    { name: "Git", avatar: GitSvg },
    { name: "GitHub", avatar: GitHubSvg },
    { name: "VSCode", avatar: VSCodeSvg },
    { name: "Claude Code", avatar: ClaudeCodeSvg },
    { name: "Codex", avatar: CodexSvg },
    { name: "Docker", avatar: DockerSvg },
    { name: "Vercel", avatar: VercelSvg },
    { name: "Google Cloud", avatar: GoogleCloudSvg },
    { name: "Cloudflare", avatar: CloudflareSvg },
    { name: "OpenAI", avatar: OpenAISvg },
    { name: "Intellij", avatar: IntellijSvg },
    { name: "Ollama", avatar: OllamaSvg },
    { name: "Pinata", avatar: PinataSvg },
    { name: "Android Studio", avatar: AndroidStudioSvg },
    { name: "Xcode", avatar: XcodeSvg },
    { name: "Jupyter Notebook", avatar: JupyterSvg },
    { name: "Apify", avatar: ApifySvg },
  ],
  libraries: [
    { name: "LangChain", avatar: LangChainSvg },
    { name: "Prisma ORM", avatar: PrismaSvg },
    { name: "Drizzle ORM", avatar: DrizzleSvg },
    { name: "Shadcn UI", avatar: ShadcnSvg },
    { name: "Bootstrap", avatar: BootstrapSvg },
    { name: "Magic UI", avatar: MagicUISvg },
    { name: "Daisy UI", avatar: DaisyUISvg },
    { name: "Cesium", avatar: CesiumSvg },
  ],
};

const allSkills = Object.values(skills).flat();
const firstRow = allSkills.slice(0, Math.ceil(allSkills.length / 2));
const secondRow = allSkills.slice(Math.ceil(allSkills.length / 2));

const SkillChip = ({ name, avatar: Icon }: Skill) => (
  <div className="flex items-center gap-2 rounded-[3px] border border-frame/40 bg-black/25 px-2.5 py-1.5 font-heading text-sm whitespace-nowrap">
    {Icon && <Icon className="size-4 shrink-0" />}
    {name}
  </div>
);

export const Skills = () => {
  return (
    <section className="flex flex-col gap-4">
      {/* Mask fades the rows into the window edges instead of painting over the gradient. */}
      <div className="flex flex-col [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {[firstRow, secondRow].map((row, i) => (
          <Marquee
            key={i}
            reverse={i === 1}
            pauseOnHover
            className="p-1 [--duration:60s] [--gap:0.5rem]"
          >
            {row.map((skill) => (
              <SkillChip
                key={skill.name}
                {...skill}
              />
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
};
