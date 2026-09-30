import { Stats } from "../../../stats";
import { ActivityCalendar } from "./activity-calendar";
import { getContributionStats } from "./github.utils";
import { useContributions } from "./use-contributions";

// The GitHub screen: contribution stats, the year calendar, and its legend.
export const GithubActivity = () => {
  const calendar = useContributions();

  const days = calendar.weeks.flatMap((week) => week.contributionDays);
  const stats = getContributionStats(days);

  return (
    <>
      {/* Size every column to its content, so labels get room before values wrap. */}
      <Stats
        pairs={stats}
        columns={4}
        className="justify-between @min-[26rem]:grid-cols-[repeat(4,auto)]"
      />

      <ActivityCalendar calendar={calendar} />

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 font-heading text-sm">
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
              className="pixel-cell size-4"
              style={{ backgroundColor: `var(--github-contribution-${level})` }}
            />
          ))}
          More
        </span>
      </div>
    </>
  );
};
