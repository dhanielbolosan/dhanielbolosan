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
