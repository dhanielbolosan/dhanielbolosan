import {
  isCalendarDate,
  getRangeFromDates,
  getContributionRange,
} from "../lib/github-dates";

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

// Cache successful JSON for one browser hour and 12 edge hours; never cache errors.
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control":
        status === 200 ? "public, max-age=3600, s-maxage=43200" : "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

// Fetch contribution calendars with a server-only token and reuse cached responses.
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

  // Require a username with valid characters, length, and non-hyphen ends.
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) {
    return json({ error: "A valid GitHub username is required." }, 400);
  }

  // Custom ranges need both real calendar dates in chronological order.
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
    // Use explicit dates when supplied, otherwise resolve the requested preset.
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

    // GraphQL can return errors even when the HTTP request succeeds.
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

    // Write the cache in the background without delaying the response.
    waitUntil(caches.default.put(request, calendarResponse.clone()));

    return calendarResponse;
  } catch (error) {
    console.error("GitHub contributions function error", error);

    return json({ error: "Unable to load GitHub contributions." }, 502);
  }
};
