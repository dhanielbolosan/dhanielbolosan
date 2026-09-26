import { IconItem } from "../../icon-item";
import { groups } from "./skills.data";
import { skillIcons } from "./skill-icons";

export const Skills = () => (
  <section className="flow-root">
    <h2 className="window-title-float">Skills</h2>

    {groups.map((group) => (
      <div
        key={group.label}
        className="not-first-of-type:pt-5"
      >
        <h3 className="group-heading flex items-center gap-2">
          <img
            src={group.orb}
            alt=""
            className="size-4 shrink-0 [image-rendering:pixelated]"
          />

          {group.label}
        </h3>

        <ul className="grid grid-cols-3 gap-x-3 gap-y-1 font-heading text-sm">
          {group.skills.map((skill) => {
            const icon = skillIcons[skill];

            return (
              <IconItem
                key={skill}
                icon={
                  icon ? (
                    <svg
                      viewBox={icon.viewBox ?? "0 0 24 24"}
                      aria-hidden="true"
                      className="size-4 shrink-0 fill-current drop-shadow-[2px_2px_0_var(--text-shadow)]"
                    >
                      <path d={icon.path} />
                    </svg>
                  ) : (
                    <span className="size-4 shrink-0" />
                  )
                }
              >
                {skill}
              </IconItem>
            );
          })}
        </ul>
      </div>
    ))}
  </section>
);
