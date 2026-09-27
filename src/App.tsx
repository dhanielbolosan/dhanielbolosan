import { useEffect, useRef, useState } from "react";
import { attachMenuSounds } from "./lib/audio";
import { useMedia } from "./lib/use-media";
import { TypewriterReady } from "./lib/use-typewriter";
import { Window } from "./components/window";
import { cn } from "./lib/utils";
import { columns } from "./app/layout";
import { Navbar } from "./app/navbar";
import { getEntryDelay } from "./app/entrance";
import { useMenuEntrance } from "./app/use-menu-entrance";
import { ScrollHint } from "./app/scroll-hint";

function App() {
  useEffect(attachMenuSounds, []);
  const isTabletOrWider = useMedia("(min-width: 48rem)");

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const activeColumnRef = useRef<HTMLDivElement>(null);

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
          onSelectTab={setActiveTabIndex}
          entering={entering}
        />

        {/* One column on mobile, two on tablet, four on desktop. */}
        <main className="relative grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((column, columnIndex) => (
            <div
              key={column.label}
              ref={columnIndex === activeTabIndex ? activeColumnRef : undefined}
              className={cn(
                columnIndex === activeTabIndex ? "flex" : "hidden",
                columnIndex === 0 || columnIndex === rightColumnIndex
                  ? "md:flex"
                  : "md:hidden",
                "min-h-0 flex-col gap-3 xl:flex",
                entering ? "overflow-visible" : "overflow-y-auto",
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
          <ScrollHint
            columnRef={activeColumnRef}
            columnIndex={activeTabIndex}
            enabled={
              !isTabletOrWider &&
              !entering &&
              columns[activeTabIndex].windows.length > 1
            }
          />
        </main>
      </div>
    </TypewriterReady.Provider>
  );
}

export default App;
