import { useEffect, useState } from "react";
import { githubUsername } from "./site";

// Shape of the GitHub contribution calendar returned by /api/github-contributions.
export type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

export interface ContributionDay {
  contributionCount: number;
  contributionLevel: ContributionLevel;
  date: string;
  weekday: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
  firstDay: string;
}

export interface ContributionRange {
  /** Inclusive calendar dates in YYYY-MM-DD format. */
  from: string;
  to: string;
  /** The last date for which contribution data was fetched. */
  asOf: string;
}

export interface ContributionCalendarData {
  range: ContributionRange;
  totalContributions: number;
  weeks: ContributionWeek[];
}

const toLocalDateString = (date: Date) => date.toLocaleDateString("en-CA");

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

// The last year of contributions. Starts empty and stays empty if the request fails;
// replaced only by real data.
export const useContributions = () => {
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

  return calendar;
};

// Latest public push, from GitHub's events feed (no token needed, CORS allowed).
export const useLastSaved = () => {
  const [saved, setSaved] = useState<{ at: Date; repo: string }>();

  useEffect(() => {
    const controller = new AbortController();
    void fetch(
      `https://api.github.com/users/${githubUsername}/events/public?per_page=30`,
      { signal: controller.signal },
    )
      .then((response) => (response.ok ? response.json() : []))
      .then(
        (
          events: {
            type: string;
            created_at: string;
            repo: { name: string };
          }[],
        ) => {
          const push = events.find((event) => event.type === "PushEvent");
          if (push)
            setSaved({ at: new Date(push.created_at), repo: push.repo.name });
        },
      )
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return saved;
};
