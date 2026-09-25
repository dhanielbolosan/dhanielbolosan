import { localDate, shortDate } from "@/lib/dates";
import { useContributions, type ContributionDay } from "@/lib/github";
import { Stats } from "../stats";
import { ActivityCalendar } from "./activity-calendar";

// Yearly stats, from the full year of contributions.
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

  // Busiest calendar month by contributions.
  const perMonth = new Map<string, number>();
  for (const day of days) {
    const key = day.date.slice(0, 7);
    perMonth.set(key, (perMonth.get(key) ?? 0) + day.contributionCount);
  }
  const [busiest] = [...perMonth].reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0],
  );

  // Today may have no commits yet, so the current streak can end yesterday.
  let i = days.length - 1;
  if (days[i]?.contributionCount === 0) i--;
  let current = 0;
  while (i >= 0 && days[i].contributionCount > 0) {
    current++;
    i--;
  }

  // No contributions (still loading, empty, or failed): fixed placeholder values.
  const none = !best || best.contributionCount === 0;

  // The 2 x 2 grid fills row by row: left column Longest over Current Streak,
  // right column Best Day over Busiest Month.
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

export const Activity = () => {
  const calendar = useContributions();

  // Stats and the month calendar both cover the full year.
  const days = calendar.weeks.flatMap((week) => week.contributionDays);
  const stats = getStats(days);

  return (
    <section className="flex flex-col gap-3">
      {/* Same 2 x 2 stat grid as the Projects info window. */}
      <Stats
        pairs={stats}
        columns={4}
      />

      <ActivityCalendar calendar={calendar} />

      {/* Yearly total on the left, legend for the day colors on the right. */}
      {/* The caption never wraps; on narrow screens the legend drops below it instead. */}
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
              className="size-3 rounded-[2px]"
              style={{ background: `var(--github-contribution-${level})` }}
            />
          ))}
          More
        </span>
      </div>
    </section>
  );
};
