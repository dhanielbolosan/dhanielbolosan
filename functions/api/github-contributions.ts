interface Env {
  GITHUB_TOKEN: string;
}

interface GithubGraphqlResponse {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: unknown;
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
}

const contributionQuery = `
  query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            firstDay
            contributionDays {
              contributionCount
              contributionLevel
              date
              weekday
            }
          }
        }
      }
    }
  }
`;

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isCalendarDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    toDateString(new Date(`${value}T00:00:00.000Z`)) === value
  );
}

function getRangeFromDates(from: string, to: string, now: Date) {
  const asOf = toDateString(now);

  return {
    asOf,
    from,
    queryFrom: `${from}T00:00:00.000Z`,
    queryTo: to < asOf ? `${to}T23:59:59.999Z` : now.toISOString(),
    to,
  };
}

function getContributionRange(preset: "current-year" | "rolling-year") {
  const now = new Date();
  const year = now.getUTCFullYear();
  const asOf = toDateString(now);
  const from =
    preset === "current-year"
      ? `${year}-01-01`
      : toDateString(
        new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate() - 364)),
      );
  const to = preset === "current-year" ? `${year}-12-31` : asOf;

  return getRangeFromDates(from, to, now);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=43200",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async ({
  request,
  env,
  waitUntil,
}) => {
  if (!env.GITHUB_TOKEN) {
    return json({ error: "GitHub contributions are not configured." }, 503);
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim() ?? "";
  const customFrom = searchParams.get("from");
  const customTo = searchParams.get("to");
  const requestedRange = searchParams.get("range");
  const rangePreset =
    requestedRange === "current-year" ? "current-year" : "rolling-year";

  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) {
    return json({ error: "A valid GitHub username is required." }, 400);
  }

  if (
    (customFrom || customTo) &&
    (!customFrom ||
      !customTo ||
      !isCalendarDate(customFrom) ||
      !isCalendarDate(customTo) ||
      customFrom > customTo)
  ) {
    return json(
      { error: "Custom ranges require ordered YYYY-MM-DD from and to dates." },
      400,
    );
  }

  const cachedResponse = await caches.default.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const range =
      customFrom && customTo
        ? getRangeFromDates(customFrom, customTo, new Date())
        : getContributionRange(rangePreset);

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "dhanielbolosan-portfolio",
      },
      body: JSON.stringify({
        query: contributionQuery,
        variables: {
          from: range.queryFrom,
          login: username,
          to: range.queryTo,
        },
      }),
    });

    const result = (await response.json()) as GithubGraphqlResponse;

    if (!response.ok || result.errors?.length || !result.data?.user) {
      console.error("GitHub GraphQL error", response.status, result.errors);
      return json({ error: "Unable to load GitHub contributions." }, 502);
    }

    const calendarResponse = json({
      calendar: {
        ...(result.data.user.contributionsCollection
          .contributionCalendar as object),
        range: {
          asOf: range.asOf,
          from: range.from,
          to: range.to,
        },
      },
      username,
    });

    waitUntil(caches.default.put(request, calendarResponse.clone()));
    return calendarResponse;
  } catch (error) {
    console.error("GitHub contributions function error", error);
    return json({ error: "Unable to load GitHub contributions." }, 502);
  }
};
