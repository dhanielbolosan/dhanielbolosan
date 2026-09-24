import { useEffect, useState } from "react";

import type {
  ContributionCalendarData,
  ContributionDay,
  ContributionLevel,
} from "../github-contribution-calendar";

const githubUsername = "dhanielbolosan";

const toLocalDateString = (date: Date) => date.toLocaleDateString("en-CA");

const levelIndex: Record<ContributionLevel, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

// Parse YYYY-MM-DD as a local date so labels don't shift a day in negative UTC offsets.
const localDate = (date: string) => new Date(`${date}T00:00`);

const getStats = (days: ContributionDay[], total: number) => {
  let longest = 0;
  let run = 0;
  for (const day of days) {
    run = day.contributionCount > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  // Today may have no commits yet, so the current streak can end yesterday.
  let i = days.length - 1;
  if (days[i]?.contributionCount === 0) i--;
  let current = 0;
  while (i >= 0 && days[i].contributionCount > 0) {
    current++;
    i--;
  }

  const best = days.reduce(
    (a, b) => (b.contributionCount > a.contributionCount ? b : a),
    days[0],
  );

  return [
    ["Total", total.toLocaleString()],
    ["Active days", days.filter((d) => d.contributionCount > 0).length],
    ["Current streak", `${current} days`],
    ["Longest streak", `${longest} days`],
    [
      "Best day",
      best
        ? `${best.contributionCount} · ${localDate(best.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        : "—",
    ],
  ];
};

// Last 12 calendar months, each padded so day 1 lands on its weekday column.
const getMonths = (days: ContributionDay[]) => {
  const months = new Map<string, ContributionDay[]>();
  for (const day of days) {
    const key = day.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), day]);
  }
  return [...months].slice(-12).map(([key, list]) => ({
    key,
    label: localDate(`${key}-01`).toLocaleDateString("en-US", {
      month: "short",
    }),
    offset: list[0].weekday,
    days: list,
  }));
};

export const Activity = () => {
  const [calendar, setCalendar] = useState<ContributionCalendarData>();

  useEffect(() => {
    const controller = new AbortController();

    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 364);

    const params = new URLSearchParams({
      from: toLocalDateString(from),
      to: toLocalDateString(to),
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
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  const days = calendar?.weeks.flatMap((week) => week.contributionDays) ?? [];

  return (
    <section className="flex flex-col gap-4">
      {!calendar ? (
        <p className="font-heading text-sm text-muted-foreground">
          Loading GitHub activity…
        </p>
      ) : (
        <>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-heading text-sm">
            {getStats(days, calendar.totalContributions).map(
              ([label, value]) => (
                <div
                  key={label}
                  className="contents"
                >
                  <dt className="text-label">{label}</dt>
                  <dd className="text-right font-semibold tabular-nums">
                    {value}
                  </dd>
                </div>
              ),
            )}
          </dl>

          <div className="grid grid-cols-3 gap-x-3 gap-y-4 @md:grid-cols-4">
            {getMonths(days).map((month) => (
              <div
                key={month.key}
                className="flex flex-col gap-1.5"
              >
                <span className="font-heading text-xs text-label">
                  {month.label}
                </span>
                <div className="grid grid-cols-7 gap-0.5">
                  {month.offset > 0 && (
                    <span style={{ gridColumn: `span ${month.offset}` }} />
                  )}
                  {month.days.map((day) => (
                    <span
                      key={day.date}
                      title={`${day.date}: ${day.contributionCount} contributions`}
                      className="aspect-square rounded-[1px]"
                      style={{
                        background: `var(--github-contribution-${levelIndex[day.contributionLevel]})`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <a
            href={`https://github.com/${githubUsername}`}
            target="_blank"
            rel="noreferrer"
            className="font-heading text-xs text-muted-foreground hover:text-foreground"
          >
            github.com/{githubUsername}
          </a>
        </>
      )}
    </section>
  );
};
