import { githubUsername } from "@/lib/site";

// The contribution calendar's shape, as the server endpoint returns it.
export type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

export type ContributionDay = {
  contributionCount: number;
  contributionLevel: ContributionLevel;
  date: string;
  weekday: number;
};

type ContributionWeek = {
  contributionDays: ContributionDay[];
  firstDay: string;
};

type ContributionRange = {
  from: string;
  to: string;
  asOf: string;
};

export type ContributionCalendarData = {
  range: ContributionRange;
  totalContributions: number;
  weeks: ContributionWeek[];
};

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

  const { calendar } = (await response.json()) as {
    calendar?: ContributionCalendarData;
  };

  // A body in the wrong shape (a stale cache, an upstream change) keeps the fallback instead of crashing the page.
  const valid =
    typeof calendar?.range?.from === "string" &&
    Array.isArray(calendar.weeks) &&
    calendar.weeks.every(
      (week) =>
        typeof week?.firstDay === "string" &&
        Array.isArray(week.contributionDays) &&
        week.contributionDays.every((day) => typeof day?.date === "string"),
    );

  return valid ? calendar : undefined;
};

// Fetch through the cached server endpoint so visitors do not spend their GitHub rate limit.
export const fetchLatestPush = async (signal: AbortSignal) => {
  const response = await fetch("/api/latest-push", { signal });
  if (!response.ok) return;

  const { push } = (await response.json()) as {
    push?: { at: string; repo: string };
  };
  if (push) return { at: new Date(push.at), repo: push.repo };
};
