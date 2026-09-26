import { useState } from "react";
import { Tabs } from "radix-ui";
import { PixelHand } from "@/components/pixel-hand";
import { cn } from "@/lib/utils";
import { columns, entryDirections } from "./layout";

export const Navbar = ({
  selectedTabIndex,
  onSelectTab,
  entering,
}: {
  selectedTabIndex: number;
  onSelectTab: (index: number) => void;
  entering: boolean;
}) => {
  const [pointedTabIndex, setPointedTabIndex] = useState<number>();

  return (
    <Tabs.Root
      value={String(selectedTabIndex)}
      onValueChange={(value) => onSelectTab(Number(value))}
      className={cn(
        "window shrink-0 xl:hidden",
        entering && "menu-enter relative z-20",
      )}
      data-enter={entryDirections.Navbar}
    >
      <Tabs.List
        className="flex h-12 -translate-x-3.5 items-stretch justify-center gap-2 md:gap-10"
        onMouseLeave={() => setPointedTabIndex(undefined)}
      >
        {columns.map((column, columnIndex) => (
          <Tabs.Trigger
            key={column.label}
            value={String(columnIndex)}
            onMouseEnter={() => setPointedTabIndex(columnIndex)}
            onFocus={() => setPointedTabIndex(columnIndex)}
            onBlur={() => setPointedTabIndex(undefined)}
            className={cn(
              "relative flex cursor-pointer items-center pl-7 font-heading text-xs font-semibold text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground data-[state=active]:text-foreground md:text-base",
              columnIndex === 0 && "md:hidden",
            )}
          >
            {columnIndex === pointedTabIndex && (
              <span className="absolute inset-y-0 left-0 flex items-center">
                <PixelHand className="motion-safe:animate-bob" />
              </span>
            )}

            {column.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
};
