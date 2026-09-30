import { listenbrainzUsername } from "../../src/lib/site";
import {
  toListen,
  withPlayingNow,
  withoutPlayingNow,
  type Listen,
  type ListenBrainzListen,
} from "../lib/listens";

// Match the player's disc plus the four songs in its stack.
const listenCount = 5;

// Give up on a slow ListenBrainz quickly, and keep the last good answer for a week to fall back on.
const upstreamTimeoutMs = 5000;
const lastGoodSeconds = 60 * 60 * 24 * 7;

// Keep a Deezer cover for a month, and a miss for a day in case the song gets art later.
const deezerCoverSeconds = 60 * 60 * 24 * 30;
const deezerMissSeconds = 60 * 60 * 24;

// The part of a ListenBrainz response the player reads.
type Payload = { payload?: { listens?: ListenBrainzListen[] } };

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

// Compare names by their words, ignoring case, punctuation, and "(feat. …)" credits.
const normalizeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s*[([].*?[)\]]/g, "")
    .replace(/\s+(feat|ft)\..*$/, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

// Match whole words only
const sameName = (a: string, b: string) => {
  const [x, y] = [normalizeName(a), normalizeName(b)];

  return (
    !!x && !!y && (` ${x} `.includes(` ${y} `) || ` ${y} `.includes(` ${x} `))
  );
};

// Search Deezer for a cover when the Cover Art Archive has none, caching each answer per song.
const findDeezerCover = async (
  origin: string,
  { artist, track }: Listen,
  waitUntil: (promise: Promise<unknown>) => void,
) => {
  const query = `${artist} ${track}`;
  const cacheKey = new Request(
    `${origin}/api/recent-listens/cover?q=${encodeURIComponent(query)}`,
  );

  const cached = await caches.default.match(cacheKey);
  if (cached)
    return ((await cached.json()) as { coverUrl: string | null }).coverUrl;

  const params = new URLSearchParams({ q: query, limit: "1" });
  const response = await fetch(`https://api.deezer.com/search?${params}`, {
    signal: AbortSignal.timeout(2000),
  });
  
  // Leave failures uncached so the next request tries again.
  if (!response.ok) return null;

  const { data } = (await response.json()) as {
    data?: {
      title?: string;
      artist?: { name?: string };
      album?: { cover_medium?: string };
    }[];
  };
  const song = data?.[0];

  // A text search can land on another song, so both the artist and title must match; otherwise leave it blank.
  const coverUrl =
    song?.album?.cover_medium &&
    sameName(song.artist?.name ?? "", artist) &&
    sameName(song.title ?? "", track)
      ? song.album.cover_medium
      : null;

  waitUntil(
    caches.default.put(
      cacheKey,
      new Response(JSON.stringify({ coverUrl }), {
        headers: {
          "Cache-Control": `public, s-maxage=${coverUrl ? deezerCoverSeconds : deezerMissSeconds}`,
          "Content-Type": "application/json; charset=utf-8",
        },
      }),
    ),
  );

  return coverUrl;
};

// Proxy ListenBrainz recent listens; the edge cache absorbs repeat visits and covers outages.
export const onRequestGet: PagesFunction = async ({ request, waitUntil }) => {
  const { origin, searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim() ?? "";

  // Serve the site owner's listens only, so new names can't bypass the edge cache.
  if (username !== listenbrainzUsername) {
    return json(
      { error: "Only this site's ListenBrainz account is served." },
      400,
    );
  }

  // Key both caches on the validated username alone, so extra query parameters can't bypass them.
  const query = `username=${encodeURIComponent(username)}`;
  const cacheKey = new Request(`${origin}/api/recent-listens?${query}`);
  const lastGoodKey = new Request(
    `${origin}/api/recent-listens/last-good?${query}`,
  );

  const cachedResponse = await caches.default.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  // Serve the saved listens when ListenBrainz fails, or an error if there are none yet.
  const fallback = async () => {
    // A broken cache read still answers with JSON, since callers return this without awaiting it.
    try {
      const saved = await caches.default.match(lastGoodKey);
      if (!saved) return json({ error: "Unable to load recent listens." }, 502);

      const { listens } = (await saved.json()) as { listens: Listen[] };

      return new Response(
        JSON.stringify({ listens: withoutPlayingNow(listens) }),
        {
          headers: {
            "Cache-Control": "no-store",
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    } catch (error) {
      console.error("Recent listens fallback error", error);

      return json({ error: "Unable to load recent listens." }, 502);
    }
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

    const result = (await response.json()) as Payload;
    // Playing-now is optional, so a malformed body is ignored rather than failing the response.
    const playing = playingResponse?.ok
      ? ((await playingResponse.json().catch(() => ({}))) as Payload).payload
          ?.listens?.[0]
      : undefined;

    // Fill covers the Cover Art Archive lacks from Deezer; a failed lookup just leaves the cover blank.
    const listens = await Promise.all(
      withPlayingNow(
        (result.payload?.listens ?? []).map((listen) => toListen(listen)),
        playing && toListen(playing, true),
      )
        .slice(0, listenCount)
        .map(async (listen) =>
          listen.coverUrl
            ? listen
            : {
                ...listen,
                coverUrl: await findDeezerCover(
                  origin,
                  listen,
                  waitUntil,
                ).catch(() => null),
              },
        ),
    );

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
