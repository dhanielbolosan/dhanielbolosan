import { githubUsername } from "../../src/lib/site";

interface Env {
  GITHUB_TOKEN: string;
}

// Cache the answer for five browser minutes and ten edge minutes; never cache errors.
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control":
        status === 200 ? "public, max-age=300, s-maxage=600" : "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });

// Find the owner's latest public push, so visitors never spend their own GitHub rate limit.
export const onRequestGet: PagesFunction<Env> = async ({
  request,
  env,
  waitUntil,
}) => {
  if (!env.GITHUB_TOKEN)
    return json({ error: "GitHub events are not configured." }, 503);

  const cacheKey = new Request(
    `${new URL(request.url).origin}/api/latest-push`,
  );
  const cachedResponse = await caches.default.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  try {
    const response = await fetch(
      `https://api.github.com/users/${githubUsername}/events/public?per_page=30`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          "User-Agent": "dhanielbolosan-portfolio",
        },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok)
      return json({ error: "Unable to load GitHub events." }, 502);

    const events = (await response.json()) as {
      type: string;
      created_at: string;
      repo: { name: string };
    }[];
    const push = events.find((event) => event.type === "PushEvent");
    const result = json({
      push: push && { at: push.created_at, repo: push.repo.name },
    });

    waitUntil(caches.default.put(cacheKey, result.clone()));

    return result;
  } catch (error) {
    console.error("Latest push function error", error);

    return json({ error: "Unable to load GitHub events." }, 502);
  }
};
