import { useRef, useState } from "react";
import { Popover } from "radix-ui";
import { cn } from "@/lib/utils";
import { playSound } from "@/lib/audio";
import { RowHand } from "../../pixel-hand";
import { WindowHeader } from "../../window";
import { groups } from "./history.data";

export const History = () => {
  const [hoveredEntryName, setHoveredEntryName] = useState<string>();
  const [pinnedEntryName, setPinnedEntryName] = useState<string>();
  const focusedEntryNameRef = useRef<string | undefined>(undefined);
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
                        if (pinnedEntryName === entry.name) playSound("select");
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
                        show={
                          pinnedEntryName === entry.name ||
                          hoveredEntryName === entry.name
                        }
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
                        onOpenAutoFocus={(event) => {
                          if (pinnedEntryName !== entry.name)
                            event.preventDefault();
                        }}
                        onFocusCapture={() => {
                          focusedEntryNameRef.current = entry.name;
                        }}
                        onCloseAutoFocus={(event) => {
                          if (focusedEntryNameRef.current !== entry.name)
                            event.preventDefault();
                          else focusedEntryNameRef.current = undefined;
                        }}
                        aria-label={`${entry.name} details`}
                        className={cn(
                          "window z-50 max-h-(--radix-popover-content-available-height) w-(--radix-popover-trigger-width) max-w-[calc(100vw-24px)] overflow-y-auto overscroll-contain p-4",
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
