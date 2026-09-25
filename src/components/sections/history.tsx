import { useState } from "react";
import { Popover } from "radix-ui";
import { cn } from "@/lib/utils";
import { PixelHand } from "../pixel-hand";
import { experience } from "./experience";
import { education } from "./education";

export type Entry = {
  name: string;
  subtitle: string;
  date: string;
  description: string[];
};

const groups = [
  { label: "Experience", entries: experience },
  { label: "Education", entries: education },
];

// FF7 Materia-menu style: a details window opens over the list below the entry without
// moving anything. Hover previews it only while the pointer is on the entry; a click (or
// Enter) pins it until you click elsewhere, press Escape, or click the entry again.
export const History = () => {
  const [hovered, setHovered] = useState<string>();
  const [pinned, setPinned] = useState<string>();
  const open = pinned ?? hovered;

  return (
    <section className="flow-root">
      <h2 className="window-title float-right -mt-5 mb-1 ml-3">History</h2>

      {groups.map((group) => (
        <div
          key={group.label}
          className="not-first-of-type:pt-5"
        >
          <h3 className="mb-2 font-heading text-base text-label">
            {group.label}
          </h3>
          <ul className="flex flex-col gap-2">
            {group.entries.map((entry) => (
              <li key={entry.name}>
                <Popover.Root
                  open={open === entry.name}
                  onOpenChange={(isOpen) => {
                    // Radix calls this for outside clicks and Escape.
                    if (!isOpen) {
                      setPinned(undefined);
                      setHovered(undefined);
                    }
                  }}
                >
                  <Popover.Trigger
                    onMouseEnter={() => setHovered(entry.name)}
                    onMouseLeave={() => setHovered(undefined)}
                    // preventDefault skips Radix's own toggle, which would close it again.
                    onClick={(event) => {
                      event.preventDefault();
                      setPinned((current) =>
                        current === entry.name ? undefined : entry.name,
                      );
                    }}
                    className="group relative flex w-full cursor-pointer items-start py-1.5 pl-11 text-left font-heading outline-none"
                  >
                    {/* Shown for the open entry, and for keyboard focus so Tab users see
                        where Enter will act. Centered on the whole entry, like the others. */}
                    <PixelHand
                      className={cn(
                        "absolute inset-y-0 left-0 my-auto group-focus-visible:visible",
                        open !== entry.name && "invisible",
                      )}
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="text-base font-semibold">
                        {entry.name}
                      </span>
                      <span className="text-sm">{entry.subtitle}</span>
                      <span className="text-sm">
                        {entry.date}
                      </span>
                    </span>
                  </Popover.Trigger>

                  <Popover.Portal>
                    <Popover.Content
                      side="bottom"
                      align="start"
                      sideOffset={2}
                      collisionPadding={12}
                      // Opening on hover must not steal focus from the list.
                      onOpenAutoFocus={(event) => event.preventDefault()}
                      // Returning focus to the entry on close would look like a fresh hover.
                      onCloseAutoFocus={(event) => event.preventDefault()}
                      className={cn(
                        "window z-50 w-(--radix-popover-trigger-width) max-w-[calc(100vw-24px)] p-4",
                        // A hover preview lets the pointer pass through to the entries it
                        // covers, so moving down the list previews each in turn.
                        pinned !== entry.name && "pointer-events-none",
                      )}
                    >
                      <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-frame">
                        {entry.description.map((point) => (
                          <li
                            key={point}
                            className="text-sm leading-relaxed"
                          >
                            {point}
                          </li>
                        ))}
                      </ul>
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
};
