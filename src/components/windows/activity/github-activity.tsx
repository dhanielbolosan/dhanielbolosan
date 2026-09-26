import { Stats } from "../../stats";
import { ActivityCalendar } from "./activity-calendar";
import { getContributionStats } from "./activity.utils";
import { useContributions } from "./use-contributions";

export const GithubActivity = () => {
  const calendar = useContributions();

  const days = calendar.weeks.flatMap((week) => week.contributionDays);
  const stats = getContributionStats(days);

  return (
    <>
      <Stats
        pairs={stats}
        columns={4}
      />

      <ActivityCalendar calendar={calendar} />

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-heading text-sm">
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
