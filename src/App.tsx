import { useEffect, useState } from "react";
import { useMedia } from "./lib/use-media";
import { TypewriterReady } from "./lib/use-typewriter";
import { Tabs } from "radix-ui";
import { Window } from "./components/window";
import { PixelHand } from "./components/pixel-hand";
import { Status } from "./components/windows/status";
import { Contact } from "./components/windows/contact";
import { History } from "./components/windows/history";
import { Projects } from "./components/windows/projects";
import { Skills } from "./components/windows/skills";
import { Activity } from "./components/windows/activity";
import { Config } from "./components/windows/config";
import { cn } from "./lib/utils";

const entryDirections = {
  Navbar: "top",
  Status: "left",
  Contact: "right",
  History: "bottom",
  Projects: "left",
  Skills: "bottom",
  Activity: "top",
  Config: "right",
} as const;

const raisedEntryWindows = new Set([Contact, Projects]);

const columns = [
  {
    label: "Status",
    split: true,
    windows: [
      {
        title: undefined,
        Section: Status,
        direction: entryDirections.Status
      },
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
      {
        title: undefined,
        Section: Skills,
        direction: entryDirections.Skills
      },
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
      {
        title: undefined,
        Section: Config,
        direction: entryDirections.Config
      },
    ],
  },
];

function App() {
  const wide = useMedia("(min-width: 48rem)");
  const [active, setActive] = useState(0);
  const [entering, setEntering] = useState(
    () => window.matchMedia("(prefers-reduced-motion: no-preference)").matches,
  );

  // Setting a timeout for the animation to finish
  useEffect(() => {
    if (!entering) return;

    const lastStart = window.matchMedia("(min-width: 80rem)").matches
      ? 165
      : window.matchMedia("(min-width: 48rem)").matches
        ? 45
        : 30;

    const timer = setTimeout(() => setEntering(false), 450 + lastStart + 40);
    return () => clearTimeout(timer);
  }, [entering]);

  const [pointed, setPointed] = useState<number>();
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
