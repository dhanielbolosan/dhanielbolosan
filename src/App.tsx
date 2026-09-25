import { useEffect, useState } from "react";
import { Tabs } from "radix-ui";
import { Status } from "./components/windows/status";
import { Activity } from "./components/windows/activity";
import { History } from "./components/windows/history";
import { Config } from "./components/windows/config";
import { Projects } from "./components/windows/projects";
import { Skills } from "./components/windows/skills";
import { Contact } from "./components/windows/contact";
import { PixelHand } from "./components/pixel-hand";
import { Window } from "./components/window";
import { useMedia } from "./lib/use-media";
import { TypewriterReady } from "./lib/use-typewriter";
import { cn } from "./lib/utils";

// Change these to "left", "right", "top", or "bottom" to set each entrance.
const entryDirections = {
  Navbar: "bottom",
  Status: "left",
  Contact: "right",
  History: "top",
  Projects: "left",
  Skills: "bottom",
  Activity: "top",
  Config: "right",
} as const;

// These windows pass in front of the default layer while entering.
const raisedEntryWindows = new Set([Contact, Projects]);

// title: omitted when the section floats its own title so content can wrap around it.
// split: from md up, the column's windows share its height equally when both fit;
// otherwise each grows to its content and the column scrolls.
const columns = [
  {
    label: "Status",
    split: true,
    windows: [
      { title: undefined, Section: Status, direction: entryDirections.Status },
      {
        title: undefined,
        Section: Contact,
        direction: entryDirections.Contact,
      },
    ],
  },
  {
    label: "History",
    windows: [
      {
        title: undefined,
        Section: History,
        direction: entryDirections.History,
      },
    ],
  },
  {
    label: "Materia",
    split: true,
    windows: [
      {
        title: undefined,
        Section: Projects,
        direction: entryDirections.Projects,
      },
      { title: undefined, Section: Skills, direction: entryDirections.Skills },
    ],
  },
  {
    label: "Extras",
    split: true,
    windows: [
      {
        title: undefined,
        Section: Activity,
        direction: entryDirections.Activity,
      },
      { title: undefined, Section: Config, direction: entryDirections.Config },
    ],
  },
];

function App() {
  // Tailwind's md breakpoint, where Status is pinned left and the tabs pick the right column.
  const wide = useMedia("(min-width: 48rem)");
  const [active, setActive] = useState(0);
  const [entering, setEntering] = useState(
    () => window.matchMedia("(prefers-reduced-motion: no-preference)").matches,
  );
  useEffect(() => {
    if (!entering) return;
    // Wait for the last window visible at this breakpoint, plus a short buffer.
    const lastStart = window.matchMedia("(min-width: 80rem)").matches
      ? 165
      : window.matchMedia("(min-width: 48rem)").matches
        ? 45
        : 30;
    const timer = setTimeout(() => setEntering(false), 450 + lastStart + 40);
    return () => clearTimeout(timer);
  }, [entering]);
  // The nav hand only shows while a tab is hovered or focused; text color marks the active tab.
  const [pointed, setPointed] = useState<number>();
  // About is always visible on two columns, so the right column falls back to History.
  const right = active === 0 ? 1 : active;
  const selected = wide ? right : active;

  return (
    <TypewriterReady.Provider value={!entering}>
      <div
        className="flex h-dvh flex-col gap-3 overflow-clip p-3"
        inert={entering}
      >
        <Tabs.Root
          value={String(selected)}
          onValueChange={(v) => setActive(Number(v))}
          className={cn(
            "window shrink-0 xl:hidden",
            entering && "menu-enter relative z-20",
          )}
          data-enter={entryDirections.Navbar}
        >
          <Tabs.List
            className="flex h-12 -translate-x-3.5 items-stretch justify-center gap-2 md:gap-10"
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
                  "relative flex cursor-pointer items-center pl-7 font-heading text-xs font-semibold text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground data-[state=active]:text-foreground md:text-base",
                  i === 0 && "md:hidden",
                )}
              >
                {/* Each tab reserves its hand's space plus the 8px gap (28px), like the
                  menus. That space sits left of every label, so the row shifts left by
                  half of it (the translate on the list) to center the labels themselves.
                  Phone labels are 12px and tabs 8px apart, so all four fit with every
                  hand clear of the label before it and inside the frame. */}
                {i === pointed && (
                  <span className="absolute inset-y-0 left-0 flex items-center">
                    <PixelHand className="motion-safe:animate-bob" />
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
                "min-h-0 flex-col gap-3 xl:flex",
                entering ? "overflow-visible" : "overflow-y-auto",
              )}
            >
              {column.windows.map(({ title, Section, direction }, j) => (
                // The last window grows so every column reaches the bottom of the screen.
                <div
                  key={j}
                  className={cn(
                    "flex shrink-0 flex-col last:grow",
                    column.split && "md:basis-0 md:grow",
                    entering && "menu-enter",
                    entering &&
                      raisedEntryWindows.has(Section) &&
                      "relative z-10",
                  )}
                  data-enter={direction}
                  style={{ animationDelay: `${i * 45 + j * 30}ms` }}
                >
                  <Window
                    title={title}
                    // Split columns scroll independently, so their windows can't share a
                    // row height. A shared minimum for each split column's top window keeps
                    // the dividing lines level on shorter tablet screens. It sits on the
                    // window, not the wrapper, so the wrapper still grows to fit taller
                    // content instead of clipping it.
                    className={cn(
                      column.split && j === 0 && "md:min-h-128 xl:min-h-0",
                    )}
                  >
                    <Section />
                  </Window>
                </div>
              ))}
            </div>
          ))}
        </main>
      </div>
    </TypewriterReady.Provider>
  );
}

export default App;
