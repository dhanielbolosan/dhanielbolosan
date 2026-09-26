import { parseLocalDate, formatShortDate } from "@/lib/dates";
import type { ContributionDay, ContributionCalendarData } from "@/lib/github";

// Summarize chronological contribution days into the displayed statistics.
export const getContributionStats = (days: ContributionDay[]) => {
  let longestStreak = 0;
  let runningStreak = 0;

  // Count consecutive active days, resetting the streak on an empty day.
  for (const day of days) {
    runningStreak = day.contributionCount > 0 ? runningStreak + 1 : 0;
    longestStreak = Math.max(longestStreak, runningStreak);
  }

  // Keep the earliest day when contribution totals tie.
  const bestDay = days.reduce(
    (bestSoFar, day) =>
      day.contributionCount > bestSoFar.contributionCount ? day : bestSoFar,
    days[0],
  );

  // Sum contributions by YYYY-MM to find the busiest month.
  const contributionsByMonth = new Map<string, number>();

  for (const day of days) {
    const key = day.date.slice(0, 7);
    contributionsByMonth.set(
      key,
      (contributionsByMonth.get(key) ?? 0) + day.contributionCount,
    );
  }

  const [busiestMonth] = [...contributionsByMonth].reduce(
    (busiestSoFar, month) =>
      month[1] > busiestSoFar[1] ? month : busiestSoFar,
    ["", 0],
  );

  let dayIndex = days.length - 1;

  // Today can still gain contributions; keep yesterday's streak alive.
  if (days[dayIndex]?.contributionCount === 0) dayIndex--;

  // Walk backward through active days to measure the current streak.
  let currentStreak = 0;

  while (dayIndex >= 0 && days[dayIndex].contributionCount > 0) {
    currentStreak++;
    dayIndex--;
  }

  const hasNoContributions = !bestDay || bestDay.contributionCount === 0;

  // Use placeholder dates when the calendar has no contributions.
  const pairs: [string, string][] = [
    ["Longest Streak", `${longestStreak} days`],

    [
      "Best Day",
      hasNoContributions
        ? "Jan 01 (0)"
        : `${formatShortDate(parseLocalDate(bestDay.date))} (${bestDay.contributionCount})`,
    ],

    ["Current Streak", `${currentStreak} days`],

    [
      "Busiest Month",
      hasNoContributions || !busiestMonth
        ? "Jan 01"
        : parseLocalDate(`${busiestMonth}-01`).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
    ],
  ];

  return pairs;
};

// Group the latest 12 months with totals and weekday offsets for the grid.
export const groupContributionsByMonth = (
  calendar: ContributionCalendarData,
) => {
  const months = new Map<string, ContributionDay[]>();

  for (const day of calendar.weeks.flatMap((week) => week.contributionDays)) {
    const key = day.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), day]);
  }

  return [...months].slice(-12).map(([key, days]) => ({
    key,
    name: parseLocalDate(`${key}-01`).toLocaleDateString("en-US", {
      month: "short",
    }),
    offset: days[0].weekday,
    total: days.reduce((sum, day) => sum + day.contributionCount, 0),
    days,
  }));
};

// Format calendar dates as YYYY-MM-DD in the browser's local timezone.
const toLocalDateString = (date: Date) => date.toLocaleDateString("en-CA");

// Build a zero-filled 365-day calendar while contribution data is unavailable.
export const createEmptyCalendar = (
  today = new Date(),
): ContributionCalendarData => {
  const to = new Date(today);
  const from = new Date(to);
  from.setDate(from.getDate() - 364);

  const weeks: ContributionCalendarData["weeks"] = [];
  const day = new Date(from);

  // Start at Sunday so each group follows GitHub's weekly structure.
  day.setDate(day.getDate() - day.getDay());

  while (day <= to) {
    const contributionDays: ContributionDay[] = [];

    for (
      let weekdayIndex = 0;
      weekdayIndex < 7;
      weekdayIndex++, day.setDate(day.getDate() + 1)
    ) {
      // Exclude padding days outside the requested range.
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
