import { useState } from "react";
import { Popover } from "radix-ui";
import { cn } from "@/lib/utils";
import { canHoverQuery, useMedia } from "@/lib/use-media";
import { RowHand } from "../pixel-hand";
import { WindowHeader } from "../window";
import { groups } from "./history.data";

export const History = () => {
  const [hovered, setHovered] = useState<string>();
  const [pinned, setPinned] = useState<string>();
  const open = pinned ?? hovered;
  const canHover = useMedia(canHoverQuery);
  const resting =
    !canHover && open === undefined ? groups[0].entries[0].name : undefined;

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
                    open={open === entry.name}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setPinned(undefined);
                        setHovered(undefined);
                      }
                    }}
                  >
                    <Popover.Trigger
                      onMouseEnter={() => setHovered(entry.name)}
                      onMouseLeave={() => setHovered(undefined)}
                      onClick={(event) => {
                        event.preventDefault();
                        setPinned((current) =>
                          current === entry.name ? undefined : entry.name,
                        );
                      }}
                      className="group relative flex w-full cursor-pointer items-start py-1.5 pl-7 text-left font-heading outline-none"
                    >
                      <RowHand
                        show={open === entry.name || resting === entry.name}
                        bob={
                          (hovered === entry.name && pinned !== entry.name) ||
                          resting === entry.name
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
      </div>
    </section>
  );
};
