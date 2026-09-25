import { groups } from "./skill-groups";
import {
  siBootstrap,
  siClaude,
  siCapacitor,
  siCloudflare,
  siCss,
  siDocker,
  siDrizzle,
  siFastapi,
  siGit,
  siGooglecloud,
  siHtml5,
  siLangchain,
  siSqlite,
  siNextdotjs,
  siOllama,
  siOpenjdk,
  siPostgresql,
  siPrisma,
  siPython,
  siReact,
  siRedis,
  siShadcnui,
  siSolidity,
  siSvelte,
  siTailwindcss,
  siTypescript,
  siVercel,
  type SimpleIcon,
} from "simple-icons";

// Brand icons from Simple Icons (CC0): one monochrome style on a shared 24x24 grid.
// Codex and Apify aren't in Simple Icons; theirs come from Devicon Plain (MIT), the
// same flat single-color style, drawn on a 128x128 grid.
const devicon = (path: string) => ({ path, viewBox: "0 0 128 128" });

type Icon = Pick<SimpleIcon, "path"> & { viewBox?: string };

const logos: Record<string, Icon> = {
  // HyperFrames symbol from its repo (docs/logo/symbol-light.svg), gradient dropped.
  HyperFrames: {
    path: "M10.1851 57.8021L33.1145 73.8313C36.2202 75.9978 41.5173 73.5433 42.4816 69.4984L51.7611 30.4271C52.7253 26.3822 48.5802 23.9277 44.4602 26.0942L13.917 42.1235C6.96677 45.7676 4.97564 54.1579 10.1851 57.8021Z M87.5129 57.5141L56.9696 73.5433C52.8371 75.7098 48.7046 73.2553 49.6688 69.2104L58.9483 30.1391C59.9125 26.0942 65.2097 23.6397 68.3154 25.8062L91.2447 41.8354C96.4668 45.4796 94.4631 53.8699 87.5129 57.5141Z",
    viewBox: "0 0 100 100",
  },
  Capacitor: siCapacitor,
  Apify: devicon(
    "M1.94 0A1.94 1.94 0 0 0 0 1.94v80.47c0 1.928 2.507 2.675 3.562 1.063L56.218 3c.844-1.289-.082-3-1.623-3Zm71.465 0c-1.541 0-2.467 1.711-1.624 3.002l52.657 80.47c1.055 1.613 3.562.866 3.562-1.062V1.94A1.94 1.94 0 0 0 126.06 0Zm-8.922 63.855a1.93 1.93 0 0 0-1.384.573L3.28 124.695C2.067 125.919 2.933 128 4.657 128h118.736c1.717 0 2.585-2.067 1.386-3.295L65.86 64.44a1.93 1.93 0 0 0-1.378-.584z",
  ),
  Codex: devicon(
    "M43.125 2.437A32.56 32.56 0 0 1 59.37.224q10.664 1.225 19.008 9.067a.62.62 0 0 0 .571.155q11.265-2.768 21.659 1.952l.336.16l.821.405c7.237 3.749 12.427 9.44 15.563 17.056a30 30 0 0 1 2.245 11.339a30.2 30.2 0 0 1-.96 8.699a.89.89 0 0 0 .213.827a31.9 31.9 0 0 1 8.416 15.419c2.053 10.139-.053 19.28-6.309 27.413l-.971 1.173a32.34 32.34 0 0 1-15.648 9.872a.86.86 0 0 0-.576.544c-1.36 3.925-2.725 7.275-5.264 10.624c-6.395 8.437-15.797 13.131-26.389 13.072q-12.663-.066-22.453-9.259a.77.77 0 0 0-.747-.171c-2.763.891-5.547 1.019-8.555.987a31.6 31.6 0 0 1-13.84-3.317a32.3 32.3 0 0 1-11.445-9.499c-1.083-1.435-2.155-2.784-2.939-4.379a41.3 41.3 0 0 1-2.64-6.843a32.6 32.6 0 0 1-.091-16.341a.9.9 0 0 0 .043-.395a.6.6 0 0 0-.197-.341a31.8 31.8 0 0 1-7.36-11.744a27.7 27.7 0 0 1-1.776-8.475a36.9 36.9 0 0 1 1.003-11.371q3.6-11.871 13.744-18.629c1.504-1.003 2.933-1.781 4.277-2.336a43 43 0 0 1 4.592-1.621a.69.69 0 0 0 .464-.464a32.1 32.1 0 0 1 5.888-11.483q5.44-6.77 13.072-9.883m-4.288 41.867a4.523 4.523 0 0 0-7.856 4.491l9.035 15.813l-9.003 15.189a4.528 4.528 0 0 0 7.787 4.608l10.347-17.451a4.53 4.53 0 0 0 .037-4.555zm29.045 33.28a4.528 4.528 0 0 0 0 9.04h25.856a4.528 4.528 0 0 0 0-9.045H67.882z",
  ),
  Python: siPython,
  TypeScript: siTypescript,
  Java: siOpenjdk,
  HTML: siHtml5,
  CSS: siCss,
  Solidity: siSolidity,
  React: siReact,
  Svelte: siSvelte,
  "Next.js": siNextdotjs,
  "Tailwind CSS": siTailwindcss,
  FastAPI: siFastapi,
  LangChain: siLangchain,
  "Shadcn UI": siShadcnui,
  Bootstrap: siBootstrap,
  Git: siGit,
  "Claude Code": siClaude,
  Docker: siDocker,
  "Google Cloud": siGooglecloud,
  Vercel: siVercel,
  Cloudflare: siCloudflare,
  Ollama: siOllama,
  PostgreSQL: siPostgresql,
  Redis: siRedis,
  SQLite: siSqlite,
  "Prisma ORM": siPrisma,
  "Drizzle ORM": siDrizzle,
};

// FF7 Materia list: each category header carries its materia orb; skills are logo + name.
export const Skills = () => (
  <section className="flow-root">
    <h2 className="window-title float-right -mt-5 mb-1 ml-3">Skills</h2>

    {groups.map((group) => (
      <div
        key={group.label}
        className="not-first-of-type:pt-5"
      >
        {/* One orb per category: the group is the materia type. 8px sprite at 2x. */}
        <h3 className="mb-2 flex items-center gap-2 font-heading text-base text-label">
          <img
            src={group.orb}
            alt=""
            className="size-4 shrink-0 [image-rendering:pixelated]"
          />
          {group.label}
        </h3>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1 font-heading text-sm @xs:grid-cols-3">
          {group.skills.map((skill) => {
            const Logo = logos[skill];
            return (
              <li
                key={skill}
                className="flex min-w-0 items-center gap-1.5"
              >
                {Logo ? (
                  <svg
                    viewBox={Logo.viewBox ?? "0 0 24 24"}
                    aria-hidden="true"
                    className="size-4 shrink-0 fill-current drop-shadow-[2px_2px_0_#15121a]"
                  >
                    <path d={Logo.path} />
                  </svg>
                ) : (
                  <span className="size-4 shrink-0" />
                )}
                {/* One line; names too long for the column end in "…", like the Projects stack. */}
                <span className="truncate">{skill}</span>
              </li>
            );
          })}
        </ul>
      </div>
    ))}
  </section>
);
