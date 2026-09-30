import assert from "node:assert/strict";
import test from "node:test";
import { toListen, withoutPlayingNow } from "../functions/lib/listens.ts";
import {
  formatDuration,
  formatPlayedAgo,
} from "../src/components/windows/activity/music/music.utils.ts";

// A song saved while playing must not read "Now Playing" once served from the fallback.
test("a saved playing-now listen gets a played-ago time", () => {
  const [saved] = withoutPlayingNow([
    toListen({ track_metadata: { track_name: "Song" } }, true),
  ]);

  assert.equal(saved.playingNow, false);
  assert.equal(typeof saved.listenedAt, "number");
  assert.equal(formatPlayedAgo(saved.listenedAt), "Just now");
});

// Placeholders use the real format, never a bare dash.
test("a missing duration reads 0:00", () => {
  assert.equal(formatDuration(null), "0:00");
  assert.equal(formatDuration(185_400), "3:05");
});
