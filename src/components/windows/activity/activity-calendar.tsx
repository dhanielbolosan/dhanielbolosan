import { groupContributionsByMonth } from "./activity.utils";
import type { ContributionCalendarData, ContributionLevel } from "@/lib/github";

const levelIndex: Record<ContributionLevel, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

export const ActivityCalendar = ({
  calendar,
}: {
  calendar: ContributionCalendarData;
}) => (
  <ol className="grid grid-cols-4 gap-1.5">
    {groupContributionsByMonth(calendar).map((month) => (
      <li
        key={month.key}
        className="flex flex-col gap-1 rounded-[4px] bg-black/20 p-1.5"
      >
        <div className="flex items-baseline justify-between px-0.5 font-heading text-xs">
          <span className="text-label">{month.name}</span>

          <span className="font-semibold tabular-nums">{month.total}</span>
        </div>

        <div className="grid grid-cols-7 gap-[2px]">
          {/* Align the first day with its weekday. */}
          {month.offset > 0 && (
            <span style={{ gridColumn: `span ${month.offset}` }} />
          )}

          {month.days.map((day) => (
            <span
              key={day.date}
              title={`${day.date}: ${day.contributionCount} contributions`}
              className="pixel-cell aspect-square"
              style={{
                backgroundColor: `var(--github-contribution-${levelIndex[day.contributionLevel]})`,
              }}
            />
          ))}
        </div>
      </li>
    ))}
  </ol>
);
