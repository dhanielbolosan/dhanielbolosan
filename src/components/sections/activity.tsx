import { useEffect, useState } from "react";

import {
  GithubContributionCalendar,
  type ContributionCalendarData,
} from "../github-contribution-calendar";

const githubUsername = "dhanielbolosan";

const toLocalDateString = (date: Date) => date.toLocaleDateString("en-CA");

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

  return (
    <section className="mb-5">
      <div className="mx-auto mb-5 w-full max-w-4xl px-5">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          Activity
        </h2>
      </div>

      <GithubContributionCalendar
        allowScroll={false}
        calendar={calendar}
        cellSize="lg"
        dateFormat="MM-DD-YYYY"
        isLoading={!calendar}
        showWeekLabel={false}
        username={githubUsername}
      />
    </section>
  );
};
