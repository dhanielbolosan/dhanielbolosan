import { useState } from "react";
import { Popover } from "radix-ui";
import { cn } from "@/lib/utils";
import { RowHand } from "../../pixel-hand";
import { WindowHeader } from "../../window";
import { groups } from "./history.data";

export const History = () => {
  const [hoveredEntryName, setHoveredEntryName] = useState<string>();
  const [pinnedEntryName, setPinnedEntryName] = useState<string>();

  // A clicked entry stays open and takes priority over hover previews.
  const openEntryName = pinnedEntryName ?? hoveredEntryName;

  return (
    <section className="flex flex-col gap-3">
      <WindowHeader
        title="History"
        help="Select entry to view more info"
      />

      <div>
        {groups.map((group) => (
          <div
            key={group.label}
            className="not-first-of-type:pt-5"
          >
            <h3 className="group-heading">{group.label}</h3>

            <ul className="flex flex-col gap-2">
              {group.entries.map((entry) => (
                <li key={entry.name}>
                  <Popover.Root
                    open={openEntryName === entry.name}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setPinnedEntryName(undefined);
                        setHoveredEntryName(undefined);
                      }
                    }}
                  >
                    <Popover.Trigger
                      onMouseEnter={() => setHoveredEntryName(entry.name)}
                      onMouseLeave={() => setHoveredEntryName(undefined)}
                      onClick={(event) => {
                        event.preventDefault();
                        setPinnedEntryName((current) =>
                          current === entry.name ? undefined : entry.name,
                        );
                      }}
                      className="group relative flex w-full cursor-pointer items-start py-1.5 pl-7 text-left font-heading outline-none"
                    >
                      <RowHand
                        show={openEntryName === entry.name}
                        bob={
                          hoveredEntryName === entry.name &&
                          pinnedEntryName !== entry.name
                        }
                        className="group-focus-visible:visible"
                      />

                      <span className="flex min-w-0 flex-col">
                        <span className="text-base font-semibold">
                          {entry.name}
                        </span>

                        <span className="text-sm">{entry.subtitle}</span>

                        <span className="text-sm">{entry.date}</span>
                      </span>
                    </Popover.Trigger>

                    <Popover.Portal>
                      <Popover.Content
                        side="bottom"
                        align="start"
                        sideOffset={2}
                        collisionPadding={12}
                        onOpenAutoFocus={(event) => event.preventDefault()}
                        onCloseAutoFocus={(event) => event.preventDefault()}
                        className={cn(
                          "window z-50 w-(--radix-popover-trigger-width) max-w-[calc(100vw-24px)] p-4",
                          pinnedEntryName !== entry.name &&
                            "pointer-events-none",
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
      </div>
    </section>
  );
};
