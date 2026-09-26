import { useEffect, useRef, useState } from "react";
import { localDate, shortDate } from "@/lib/dates";
import { useContributions, type ContributionDay } from "@/lib/github";
import { Choices } from "../choices";
import { CornerBox } from "../corner-box";
import { PixelHand } from "../pixel-hand";
import { useWindowFade } from "@/lib/window-fade";
import { fadeMs } from "@/lib/use-swap";
import { Faded, WindowHeader } from "../window";
import { Stats } from "../stats";
import { ActivityCalendar } from "./activity-calendar";

const getStats = (days: ContributionDay[]) => {
  let longest = 0;
  let run = 0;
  for (const day of days) {
    run = day.contributionCount > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  const best = days.reduce(
    (a, b) => (b.contributionCount > a.contributionCount ? b : a),
    days[0],
  );

  const perMonth = new Map<string, number>();
  for (const day of days) {
    const key = day.date.slice(0, 7);
    perMonth.set(key, (perMonth.get(key) ?? 0) + day.contributionCount);
  }

  const [busiest] = [...perMonth].reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0],
  );

  let i = days.length - 1;
  if (days[i]?.contributionCount === 0) i--;
  let current = 0;
  while (i >= 0 && days[i].contributionCount > 0) {
    current++;
    i--;
  }

  const none = !best || best.contributionCount === 0;

  const pairs: [string, string][] = [
    ["Longest Streak", `${longest} days`],
    [
      "Best Day",
      none
        ? "Jan 01 (0)"
        : `${shortDate(localDate(best.date))} (${best.contributionCount})`,
    ],
    ["Current Streak", `${current} days`],
    [
      "Busiest Month",
      none || !busiest
        ? "Jan 01"
        : localDate(`${busiest}-01`).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
    ],
  ];
  return pairs;
};

const screens = ["GitHub", "Music", "Games"] as const;
type Screen = (typeof screens)[number];

const instruction = "Select Activity to view more";
const picking: Record<Screen, string> = {
  GitHub: "View my GitHub activity for the past year",
  Music: "View the music I've been listening to",
  Games: "View the games I've been playing",
};

const GitHub = () => {
  const calendar = useContributions();

  const days = calendar.weeks.flatMap((week) => week.contributionDays);
  const stats = getStats(days);

  return (
    <>
      <Stats
        pairs={stats}
        columns={4}
      />

      <ActivityCalendar calendar={calendar} />

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-heading text-sm">
        <span className="whitespace-nowrap">
          {calendar.totalContributions.toLocaleString()} contributions in the
          last year
        </span>
        <span className="flex items-center gap-1.5">
          Less
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              aria-hidden="true"
              className="pixel-cell size-4"
              style={{ backgroundColor: `var(--github-contribution-${level})` }}
            />
          ))}
          More
        </span>
      </div>
    </>
  );
};

export const Activity = () => {
  const [screen, setScreen] = useState<Screen>("GitHub");
  const [menu, setMenu] = useState(false);
  const { fadeTo } = useWindowFade();
  const [pointedOption, setPointedOption] = useState(0);
  const helpText = menu ? picking[screens[pointedOption]] : instruction;
  const header = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setMenu(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };

    const focus = setTimeout(
      () => header.current?.querySelector<HTMLElement>("a, button")?.focus(),
      fadeMs * 3,
    );

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(focus);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menu]);

  return (
    <section className="flex grow flex-col gap-3">
      <WindowHeader
        ref={header}
        help={helpText}
      >
        <CornerBox
          view={menu}
          id={menu ? "menu" : "title"}
          className="window-corner"
          render={(open) =>
            open ? (
              <>
                <h2 className="sr-only">Activity</h2>
                <Choices
                  boxed
                  onPoint={setPointedOption}
                  items={screens.map((label) => ({
                    label,
                    onSelect: () =>
                      label === screen
                        ? setMenu(false)
                        : fadeTo(() => {
                          setScreen(label);
                          setMenu(false);
                        }),
                  }))}
                />
              </>
            ) : (
              <h2>
                <button
                  type="button"
                  aria-haspopup="menu"
                  onClick={() => {
                    setPointedOption(0);
                    setMenu(true);
                  }}
                  className="group relative cursor-pointer outline-none"
                >
                  <PixelHand className="invisible absolute inset-y-0 right-full my-auto mr-2 group-hover:visible group-focus-visible:visible motion-safe:animate-bob" />
                  Activity
                </button>
              </h2>
            )
          }
        />
      </WindowHeader>

      <Faded className="flex flex-1 flex-col gap-3">
        {screen === "GitHub" && <GitHub />}
        {screen !== "GitHub" && (
          <p className="flex min-h-64 flex-1 items-center justify-center text-center font-heading text-base">
            WIP :)
          </p>
        )}
      </Faded>
    </section>
  );
};
