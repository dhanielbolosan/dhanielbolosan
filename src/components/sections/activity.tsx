import { useEffect, useState } from "react";

import type {
  ContributionCalendarData,
  ContributionDay,
} from "../github-contribution-calendar";
import { ContributionMonths } from "../contribution-months";

const githubUsername = "dhanielbolosan";

const toLocalDateString = (date: Date) => date.toLocaleDateString("en-CA");

// Parse YYYY-MM-DD as a local date so labels don't shift a day in negative UTC offsets.
const localDate = (date: string) => new Date(`${date}T00:00`);

// The last year, Sunday-aligned weeks, every day at 0. Shown while loading and whenever
// the request fails, so the window never shows a spinner or an error.
const emptyCalendar = (): ContributionCalendarData => {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 364);

  const weeks: ContributionCalendarData["weeks"] = [];
  const day = new Date(from);
  day.setDate(day.getDate() - day.getDay());
  while (day <= to) {
    const contributionDays: ContributionDay[] = [];
    for (let i = 0; i < 7; i++, day.setDate(day.getDate() + 1)) {
      if (day < from || day > to) continue;
      contributionDays.push({
        date: toLocalDateString(day),
        weekday: day.getDay(),
        contributionCount: 0,
        contributionLevel: "NONE",
      });
    }
    weeks.push({ contributionDays, firstDay: contributionDays[0].date });
  }

  const range = { from: toLocalDateString(from), to: toLocalDateString(to) };
  return {
    range: { ...range, asOf: range.to },
    totalContributions: 0,
    weeks,
  };
};

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

  const monthDay = (date: string) =>
    localDate(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });

  // No contributions (still loading, empty, or failed): fixed placeholder values.
  const none = !best || best.contributionCount === 0;

  // The 2 x 2 grid fills row by row: left column Longest over Current Streak,
  // right column Best Day over Busiest Month.
  return [
    ["Longest Streak", `${longest} days`],
    [
      "Best Day",
      none
        ? "Jan 01 (0)"
        : `${monthDay(best.date)} (${best.contributionCount})`,
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
};

export const Activity = () => {
  // Starts empty and stays empty if the request fails; replaced only by real data.
  const [calendar, setCalendar] = useState(emptyCalendar);

  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams({
      from: calendar.range.from,
      to: calendar.range.to,
      username: githubUsername,
    });

    void fetch(`/api/github-contributions?${params}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json()) as {
          calendar?: ContributionCalendarData;
        };

        if (response.ok && result.calendar) setCalendar(result.calendar);
      })
      // Failures are transient: the empty calendar just stays up.
      .catch(() => undefined);

    return () => controller.abort();
    // Fetch once, for the range the empty calendar was built with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stats and the month calendar both cover the full year.
  const days = calendar.weeks.flatMap((week) => week.contributionDays);
  const stats = getStats(days);

  return (
    <section className="flex flex-col gap-3">
      {/* Same 2 x 2 stat grid as the Projects info window: teal labels, white values. */}
      <dl className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-3 font-heading text-sm">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="contents"
          >
            <dt className="text-label">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <ContributionMonths calendar={calendar} />

      {/* Yearly total on the left, legend for the day colors on the right. */}
      {/* The caption never wraps; on narrow screens the legend drops below it instead. */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-heading text-sm text-muted-foreground">
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
