import { useState, useSyncExternalStore } from "react";
import { Tabs } from "radix-ui";
import { motion } from "motion/react";
import { Hero } from "./components/sections/hero";
import { Activity } from "./components/sections/activity";
import { History } from "./components/sections/history";
import { Skills } from "./components/sections/skills";
import { Projects } from "./components/sections/projects";
import { Contact } from "./components/sections/contact";
import { BlurFade } from "./components/imports/blur-fade";
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
    label: "Item",
    windows: [
      { title: "Materia", Section: Skills },
      { title: "Item", Section: Projects },
    ],
  },
  { label: "Config", windows: [{ title: "Activity", Section: Activity }] },
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
        <Tabs.List className="flex h-12 items-stretch justify-center gap-2 px-2 md:gap-10">
          {columns.map((column, i) => (
            <Tabs.Trigger
              key={column.label}
              value={String(i)}
              className={cn(
                "relative flex cursor-pointer items-center pl-6 font-heading text-base font-semibold text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground data-[state=active]:text-foreground md:pl-11",
                i === 0 && "md:hidden",
              )}
            >
              {i === selected && (
                <motion.span
                  layoutId="tab-hand"
                  transition={{ duration: 0.15, ease: "linear" }}
                  className="absolute inset-y-0 left-0 flex items-center"
                >
                  {/* 24px on phones so four tabs fit; 36px like every other hand from md up. */}
                  <PixelHand className="w-6 motion-safe:animate-bob md:w-9" />
                </motion.span>
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
              <BlurFade
                key={j}
                delay={0.1 + (i + j) * 0.1}
                className={cn(
                  "flex shrink-0 flex-col last:grow",
                  column.split && "md:basis-0 md:grow",
                )}
              >
                <div
                  className={cn(
                    "window flex grow flex-col gap-3 px-5 pb-5",
                    !title && "pt-5",
                  )}
                >
                  {title && <h2 className="window-title">{title}</h2>}
                  <div className="@container flex grow flex-col">
                    <Section />
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
