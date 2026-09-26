import { githubUsername } from "./site";

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
  from: string;
  to: string;
  asOf: string;
}

export interface ContributionCalendarData {
  range: ContributionRange;
  totalContributions: number;
  weeks: ContributionWeek[];
}

// Fetch through the server endpoint so the GitHub token stays private.
export const fetchContributionCalendar = async (
  range: Pick<ContributionRange, "from" | "to">,
  signal: AbortSignal,
) => {
  const params = new URLSearchParams({ ...range, username: githubUsername });
  const response = await fetch(`/api/github-contributions?${params}`, {
    signal,
  });

  // Return no data on an HTTP failure so the caller keeps its fallback calendar.
  if (!response.ok) return;

  const result = (await response.json()) as {
    calendar?: ContributionCalendarData;
  };

  return result.calendar;
};

// Fetch recent public events to find the latest available push.
export const fetchLatestPush = async (signal: AbortSignal) => {
  const response = await fetch(
    `https://api.github.com/users/${githubUsername}/events/public?per_page=30`,
    { signal },
  );

  // Return no data on an HTTP failure so the caller keeps its last-save placeholder.
  if (!response.ok) return;

  const events = (await response.json()) as {
    type: string;
    created_at: string;
    repo: { name: string };
  }[];

  // Use a recent public push as the portfolio's last-save timestamp.
  const push = events.find((event) => event.type === "PushEvent");
  if (push) return { at: new Date(push.created_at), repo: push.repo.name };
};
