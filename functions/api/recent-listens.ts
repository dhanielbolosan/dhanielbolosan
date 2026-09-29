import {
  toListen,
  withPlayingNow,
  withoutPlayingNow,
  type Listen,
  type ListenBrainzListen,
} from "../lib/listens";

// Match the player's disc plus the three songs in its stack.
const listenCount = 4;

// Give up on a slow ListenBrainz quickly, and keep the last good answer for a week to fall back on.
const upstreamTimeoutMs = 5000;
const lastGoodSeconds = 60 * 60 * 24 * 7;

// Cache successful JSON for 30 browser seconds and one edge minute, so Now Playing stays fresh.
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control":
        status === 200 ? "public, max-age=30, s-maxage=60" : "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

// Proxy ListenBrainz recent listens; the edge cache absorbs repeat visits and covers outages.
export const onRequestGet: PagesFunction = async ({ request, waitUntil }) => {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim() ?? "";

  // Require a ListenBrainz-style username: letters, digits, dots, dashes, and underscores.
  if (!/^[\w.-]{1,64}$/.test(username)) {
    return json({ error: "A valid ListenBrainz username is required." }, 400);
  }

  // Key both caches on the validated username alone, so extra query parameters can't bypass them.
  const { origin } = new URL(request.url);
  const query = `username=${encodeURIComponent(username)}`;
  const cacheKey = new Request(`${origin}/api/recent-listens?${query}`);
  const lastGoodKey = new Request(
    `${origin}/api/recent-listens/last-good?${query}`,
  );

  const cachedResponse = await caches.default.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  // Serve the saved listens when ListenBrainz fails, or an error if there are none yet.
  const fallback = async () => {
    const saved = await caches.default.match(lastGoodKey);
    if (!saved) return json({ error: "Unable to load recent listens." }, 502);

    const { listens } = (await saved.json()) as { listens: Listen[] };

    return new Response(
      JSON.stringify({ listens: withoutPlayingNow(listens), stale: true }),
      {
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  };

  try {
    const user = `https://api.listenbrainz.org/1/user/${encodeURIComponent(username)}`;
    const headers = { "User-Agent": "dhanielbolosan-portfolio" };
    const signal = AbortSignal.timeout(upstreamTimeoutMs);

    // Load recent listens and anything playing right now in parallel; playing-now is optional.
    const [response, playingResponse] = await Promise.all([
      fetch(`${user}/listens?count=${listenCount}`, { headers, signal }),
      fetch(`${user}/playing-now`, { headers, signal }).catch(() => undefined),
    ]);

    if (!response.ok) {
      console.error("ListenBrainz error", response.status);

      return fallback();
    }

    type Payload = { payload?: { listens?: ListenBrainzListen[] } };
    const result = (await response.json()) as Payload;
    // Playing-now is optional, so a malformed body is ignored rather than failing the response.
    const playing = playingResponse?.ok
      ? ((await playingResponse.json().catch(() => ({}))) as Payload).payload
          ?.listens?.[0]
      : undefined;

    const listens = withPlayingNow(
      (result.payload?.listens ?? []).map((listen) => toListen(listen)),
      playing && toListen(playing, true),
    ).slice(0, listenCount);

    // An empty history is not worth saving over a good one.
    if (!listens.length) return fallback();

    const listensResponse = json({ listens });
    const lastGood = new Response(JSON.stringify({ listens }), {
      headers: {
        "Cache-Control": `public, s-maxage=${lastGoodSeconds}`,
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    // Write both caches in the background without delaying the response.
    waitUntil(
      Promise.all([
        caches.default.put(cacheKey, listensResponse.clone()),
        caches.default.put(lastGoodKey, lastGood),
      ]),
    );

    return listensResponse;
  } catch (error) {
    // Timeouts land here too, so a hung ListenBrainz still gets the saved listens.
    console.error("Recent listens function error", error);

    return fallback();
  }
};
