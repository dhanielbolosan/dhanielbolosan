import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Window } from "@/components/window";
import { attachMenuSounds } from "@/lib/audio";
import { getEntryDelay } from "@/lib/menu/entrance";
import { columns } from "@/lib/menu/layout";
import { useMenuEntrance } from "@/lib/menu/use-menu-entrance";
import { readChoice, saveChoice } from "@/lib/saved-choice";
import { TypewriterReady } from "@/lib/typewriter/use-typewriter";
import { useMedia } from "@/lib/use-media";
import { cn } from "@/lib/utils";

// Remember the tab by its label, so reordering tabs never restores the wrong one.
const tabStorageKey = "active-tab";
const tabLabels = columns.map((column) => column.label);

export const App = () => {
  // Listen once for menu interaction sounds, including controls in portals.
  useEffect(attachMenuSounds, []);
  const isTabletOrWider = useMedia("(min-width: 48rem)");

  // Reopen the tab the visitor last left on.
  const [activeTabIndex, setActiveTabIndex] = useState(() =>
    tabLabels.indexOf(readChoice(tabStorageKey, tabLabels, tabLabels[0])),
  );

  // Switch tabs and remember the choice for the next visit.
  const selectTab = (index: number) => {
    setActiveTabIndex(index);
    saveChoice(tabStorageKey, tabLabels[index]);
  };

  // Tablet keeps Status visible while tabs select the right column.
  const rightColumnIndex = activeTabIndex === 0 ? 1 : activeTabIndex;
  const selectedTabIndex = isTabletOrWider ? rightColumnIndex : activeTabIndex;
  const entering = useMenuEntrance(
    activeTabIndex,
    isTabletOrWider,
    rightColumnIndex,
  );

  return (
    <TypewriterReady.Provider value={!entering}>
      <div
        className="flex h-dvh flex-col gap-3 overflow-clip p-3"
        inert={entering}
      >
        <Navbar
          selectedTabIndex={selectedTabIndex}
          onSelectTab={selectTab}
          entering={entering}
        />

        {/* One column on mobile, two on tablet, four on desktop. */}
        <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((column, columnIndex) => (
            <div
              key={column.label}
              className={cn(
                columnIndex === activeTabIndex ? "flex" : "hidden",
                columnIndex === 0 || columnIndex === rightColumnIndex
                  ? "md:flex"
                  : "md:hidden",
                "min-h-0 flex-col gap-3 xl:flex",
                entering
                  ? "overflow-visible"
                  : "overflow-y-auto [scrollbar-gutter:stable]",
              )}
            >
              {column.windows.map(
                ({ Component, direction, raised }, windowIndex) => (
                  <div
                    key={windowIndex}
                    className={cn(
                      "flex shrink-0 flex-col last:grow",
                      column.split && "md:basis-0 md:grow",
                      entering && "menu-enter",
                      entering && raised && "relative z-10",
                    )}
                    data-enter={direction}
                    style={{
                      animationDelay: `${getEntryDelay(columnIndex, windowIndex)}ms`,
                    }}
                  >
                    <Window
                      className={cn(
                        column.split &&
                          windowIndex === 0 &&
                          "md:min-h-128 xl:min-h-0",
                      )}
                    >
                      <Component />
                    </Window>
                  </div>
                ),
              )}
            </div>
          ))}
        </main>
      </div>
    </TypewriterReady.Provider>
  );
};
