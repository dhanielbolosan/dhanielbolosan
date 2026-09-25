import type {
  ContributionCalendarData,
  ContributionDay,
  ContributionLevel,
} from "@/lib/contributions";

const levelIndex: Record<ContributionLevel, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

// Parse YYYY-MM-DD as a local date so labels don't shift a day in negative UTC offsets.
const localDate = (date: string) => new Date(`${date}T00:00`);

// Group the calendar's days into its last 12 calendar months, oldest first.
const toMonths = (calendar: ContributionCalendarData) => {
  const months = new Map<string, ContributionDay[]>();
  for (const day of calendar.weeks.flatMap((week) => week.contributionDays)) {
    const key = day.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), day]);
  }
  return [...months].slice(-12).map(([key, days]) => ({
    key,
    name: localDate(`${key}-01`).toLocaleDateString("en-US", {
      month: "short",
    }),
    // Blank cells before day 1 so it lands on its weekday column (Sun first).
    offset: days[0].weekday,
    total: days.reduce((sum, day) => sum + day.contributionCount, 0),
    days,
  }));
};

// A year of contributions as a wall calendar: 12 month tiles in a 4 x 3 grid,
// each a small Sun-Sat day grid colored by contribution level.
export const ContributionMonths = ({
  calendar,
}: {
  calendar: ContributionCalendarData;
}) => (
  <ol className="grid grid-cols-4 gap-1.5">
    {toMonths(calendar).map((month) => (
      <li
        key={month.key}
        className="flex flex-col gap-1 rounded-[4px] bg-black/20 p-1.5"
      >
        <div className="flex items-baseline justify-between px-0.5 font-heading text-xs">
          <span className="text-label">{month.name}</span>
          <span className="font-semibold tabular-nums">{month.total}</span>
        </div>
        <div className="grid grid-cols-7 gap-[2px]">
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
      </li>
    ))}
  </ol>
);
