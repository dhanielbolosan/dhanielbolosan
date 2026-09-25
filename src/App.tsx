import { useState, useSyncExternalStore } from "react";
import { Tabs } from "radix-ui";
import { Hero } from "./components/sections/hero";
import { Activity } from "./components/sections/activity";
import { History } from "./components/sections/history";
import { Config } from "./components/sections/config";
import { Projects } from "./components/sections/projects";
import { Skills } from "./components/sections/skills";
import { Contact } from "./components/sections/contact";
import { PixelHand } from "./components/pixel-hand";
import { cn } from "./lib/utils";

// title: omitted when the section floats its own title so content can wrap around it.
// split: from md up, the column's windows share its height equally when both fit;
// otherwise each grows to its content and the column scrolls.
const columns = [
  {
    label: "Status",
    split: true,
    windows: [
      { title: undefined, Section: Hero },
      { title: undefined, Section: Contact },
    ],
  },
  {
    label: "History",
    windows: [{ title: undefined, Section: History }],
  },
  {
    label: "Materia",
    split: true,
    windows: [
      { title: undefined, Section: Projects },
      { title: undefined, Section: Skills },
    ],
  },
  {
    label: "Extras",
    split: true,
    windows: [
      { title: "Activity", Section: Activity },
      { title: "Config", Section: Config },
    ],
  },
];

// Matches Tailwind's md breakpoint, where About is pinned left and the tabs pick the right column.
const twoColumns = window.matchMedia("(min-width: 48rem)");
const subscribe = (onChange: () => void) => {
  twoColumns.addEventListener("change", onChange);
  return () => twoColumns.removeEventListener("change", onChange);
};

function App() {
  const wide = useSyncExternalStore(subscribe, () => twoColumns.matches);
  const [active, setActive] = useState(0);
  // The nav hand only shows while a tab is hovered or focused; text color marks the active tab.
  const [pointed, setPointed] = useState<number>();
  // About is always visible on two columns, so the right column falls back to History.
  const right = active === 0 ? 1 : active;
  const selected = wide ? right : active;

  return (
    <div className="flex h-dvh flex-col gap-3 p-3">
      <Tabs.Root
        value={String(selected)}
        onValueChange={(v) => setActive(Number(v))}
        className="window shrink-0 xl:hidden"
      >
        <Tabs.List
          className="flex h-12 -translate-x-3.5 items-stretch justify-center gap-2 md:-translate-x-[1.375rem] md:gap-10"
          onMouseLeave={() => setPointed(undefined)}
        >
          {columns.map((column, i) => (
            <Tabs.Trigger
              key={column.label}
              value={String(i)}
              onMouseEnter={() => setPointed(i)}
              onFocus={() => setPointed(i)}
              onBlur={() => setPointed(undefined)}
              className={cn(
                "relative flex cursor-pointer items-center pl-7 font-heading text-xs font-semibold text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground data-[state=active]:text-foreground md:pl-11 md:text-base",
                i === 0 && "md:hidden",
              )}
            >
              {/* Each tab reserves its hand's space plus the 8px gap: 28px on phones
                  (20px hand), 44px from md up (36px hand), like the menus. That space
                  sits left of every label, so the row shifts left by half of it
                  (the translate on the list) to center the labels themselves. Phone
                  labels are 12px and tabs 8px apart, so all four fit with every hand
                  clear of the label before it and inside the frame. */}
              {i === pointed && (
                <span className="absolute inset-y-0 left-0 flex items-center">
                  <PixelHand className="w-5 motion-safe:animate-bob md:w-9" />
                </span>
              )}
              {column.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((column, i) => (
          <div
            key={column.label}
            className={cn(
              i === active ? "flex" : "hidden",
              i === 0 || i === right ? "md:flex" : "md:hidden",
              "min-h-0 flex-col gap-3 overflow-y-auto xl:flex",
            )}
          >
            {column.windows.map(({ title, Section }, j) => (
              // The last window grows so every column reaches the bottom of the screen.
              <div
                key={j}
                className={cn(
                  "flex shrink-0 flex-col last:grow",
                  column.split && "md:basis-0 md:grow",
                )}
              >
                <div
                  className={cn(
                    "window flex grow flex-col gap-3 px-5 pb-5",
                    !title && "pt-5",
                    // Split columns scroll independently, so their windows can't share a
                    // row height. A shared minimum for each split column's top window keeps
                    // the dividing lines level on shorter tablet screens. It sits on the
                    // window, not the wrapper, so the wrapper still grows to fit taller
                    // content instead of clipping it.
                    column.split && j === 0 && "md:min-h-128 xl:min-h-0",
                  )}
                >
                  {title && <h2 className="window-title">{title}</h2>}
                  <div className="@container flex grow flex-col">
                    <Section />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
