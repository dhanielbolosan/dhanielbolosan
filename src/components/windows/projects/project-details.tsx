import { Bar } from "../../bar";
import { Faded } from "../../window";
import { Stats } from "../../stats";
import { IconItem } from "../../icon-item";
import { orbs } from "@/lib/materia";
import type { Project } from "./projects.data";

export const ProjectDetails = ({ project }: { project: Project }) => (
  <Faded className="-mx-5 -mb-5 flex flex-1 flex-col">
    <div className="window flex flex-1 flex-col gap-1.5 px-5 py-3.5">
      <h3 className="font-heading text-base font-semibold">{project.name}</h3>

      <Stats
        columns={4}
        pairs={[
          ["Type", project.type ?? "—"],

          ["Date", project.date ?? "—"],

          [
            "Progress",
            <span className="flex h-full items-center">
              <Bar
                value={(project.progress ?? 0) / 100}
                label="Progress"
                className="h-2.5 w-full"
              />
            </span>,
          ],
          ...(project.link?.href
            ? ([
                [
                  "Link",
                  <a
                    href={project.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gold underline underline-offset-2 hover:text-foreground"
                  >
                    {project.link.label}
                  </a>,
                ],
              ] as const)
            : []),
        ]}
      />

      <p className="text-sm leading-relaxed">{project.description}</p>

      <ul className="mt-1.5 grid grid-cols-3 gap-x-3 gap-y-1 font-heading text-sm">
        {project.stack.map(({ name: tech, type }) => (
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
);
