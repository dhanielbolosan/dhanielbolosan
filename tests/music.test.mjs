import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import {
  formatDuration,
  formatPlayedAgo,
  playFromStack,
} from "../src/components/windows/activity/music/music.utils.ts";
import {
  getCoverUrl,
  toListen,
  withPlayingNow,
  withoutPlayingNow,
} from "../functions/lib/listens.ts";

// Functions import siblings without extensions, as Cloudflare's bundler allows; resolve them to .ts here.
registerHooks({
  resolve: (specifier, context, next) => {
    try {
      return next(specifier, context);
    } catch (error) {
      if (!specifier.startsWith(".")) throw error;
      return next(`${specifier}.ts`, context);
    }
  },
});

test("playing a disc puts the one it replaces on top of the stack", () => {
  // Disc 0 plays; picking 2 then 0 again must keep every disc exactly once.
  const first = playFromStack(0, [1, 2, 3], 2);
  assert.deepEqual(first, { current: 2, stack: [0, 1, 3] });

  const second = playFromStack(first.current, first.stack, 0);
  assert.deepEqual(second, { current: 0, stack: [2, 1, 3] });
  assert.deepEqual([second.current, ...second.stack].sort(), [0, 1, 2, 3]);
});

test("durations and covers are shaped safely for the Music screen", () => {
  assert.equal(formatDuration(132822), "2:13");
  assert.equal(formatDuration(null), "—");
  assert.equal(formatDuration(0), "0:00");

  const release = "1d37edd1-8c01-407f-8821-c015fe6f3688";
  assert.equal(
    getCoverUrl({ caa_release_mbid: release, caa_id: 24459966920 }),
    `https://coverartarchive.org/release/${release}/24459966920-250.jpg`,
  );

  // Malformed ids never become URLs.
  assert.equal(getCoverUrl({ caa_release_mbid: "../x", caa_id: 1 }), null);
  assert.equal(getCoverUrl(undefined), null);

  const listen = toListen({ track_metadata: { track_name: " Location " } });
  assert.deepEqual(listen, {
    track: "Location",
    artist: "Unknown artist",
    album: "",
    durationMs: null,
    coverUrl: null,
    listenedAt: null,
    playingNow: false,
  });
});

test("a song playing now leads the stack without repeating its scrobble", () => {
  const listen = (track, playingNow = false) => ({
    ...toListen(
      { track_metadata: { track_name: track, artist_name: "LUCKI" } },
      playingNow,
    ),
  });
  const recent = [listen("Widebody"), listen("Bad Man")];

  // The same song already scrobbled is replaced, not duplicated.
  assert.deepEqual(
    withPlayingNow(recent, listen("Widebody", true)).map((l) => [
      l.track,
      l.playingNow,
    ]),
    [
      ["Widebody", true],
      ["Bad Man", false],
    ],
  );
  assert.equal(withPlayingNow(recent, listen("New Song", true)).length, 3);
  assert.equal(withPlayingNow(recent, undefined), recent);

  // A saved fallback never claims a song is still playing.
  assert.deepEqual(
    withoutPlayingNow([listen("Widebody", true)]).map((l) => l.playingNow),
    [false],
  );

  const now = 1_790_650_622_000;
  assert.equal(formatPlayedAgo(now / 1000 - 30, now), "Just now");
  assert.equal(formatPlayedAgo(now / 1000 - 7200, now), "2 hr. ago");
  assert.equal(formatPlayedAgo(now / 1000 - 86400, now), "Yesterday");
});

test("the function caches by username, tolerates playing-now, and falls back when ListenBrainz fails", async () => {
  const { onRequestGet } = await import("../functions/api/recent-listens.ts");
  const store = new Map();
  const background = [];
  const cacheKey =
    "https://site.test/api/recent-listens?username=dhanielbolosan";

  // Stand in for Cloudflare's cache, and count calls to ListenBrainz.
  globalThis.caches = {
    default: {
      match: async (key) => store.get(key.url ?? key)?.clone(),
      put: async (key, response) => void store.set(key.url ?? key, response),
    },
  };
  let upstreamCalls = 0;
  const call = async (query = "") => {
    const response = await onRequestGet({
      request: new Request(`${cacheKey}${query}`),
      waitUntil: (work) => background.push(work),
    });
    await Promise.all(background);
    return response;
  };
  const listens = (track) =>
    Response.json({
      payload: {
        listens: [
          { track_metadata: { track_name: track, artist_name: "LUCKI" } },
        ],
      },
    });

  const realFetch = globalThis.fetch;
  const realTimeout = AbortSignal.timeout;
  try {
    // Time out in 10 ms instead of the real 5 seconds.
    AbortSignal.timeout = () => realTimeout.call(AbortSignal, 10);

    // A good answer with a song playing now is served and saved.
    globalThis.fetch = async (url) => {
      upstreamCalls++;
      return String(url).endsWith("/playing-now")
        ? listens("Tokyo")
        : listens("Widebody");
    };
    const first = await (await call()).json();
    assert.deepEqual(
      first.listens.map((l) => [l.track, l.playingNow]),
      [
        ["Tokyo", true],
        ["Widebody", false],
      ],
    );

    // Extra query parameters still hit the cache instead of ListenBrainz.
    const calls = upstreamCalls;
    assert.equal((await call("&bust=1")).status, 200);
    assert.equal(upstreamCalls, calls);

    // A malformed playing-now body is ignored; the recent listens still come through fresh.
    store.delete(cacheKey);
    globalThis.fetch = async (url) =>
      String(url).endsWith("/playing-now")
        ? new Response("not json")
        : listens("Widebody");
    const tolerant = await call();
    assert.equal(tolerant.status, 200);
    assert.equal((await tolerant.json()).listens[0].track, "Widebody");

    // ListenBrainz now hangs past the timeout; the saved listens come back, marked stale.
    store.delete(cacheKey);
    globalThis.fetch = async (url, { signal }) =>
      new Promise((_, reject) =>
        signal.addEventListener("abort", () => reject(signal.reason)),
      );
    const fallback = await call();
    const body = await fallback.json();

    assert.equal(fallback.status, 200);
    assert.equal(body.stale, true);
    assert.equal(body.listens[0].track, "Widebody");
    assert.equal(body.listens[0].playingNow, false);
  } finally {
    globalThis.fetch = realFetch;
    AbortSignal.timeout = realTimeout;
  }
});
