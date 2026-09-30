import type { Listen } from "@/lib/integrations/listenbrainz";

// Show a track length as m:ss, or a dash when ListenBrainz has no duration.
export const formatDuration = (durationMs: number | null) => {
  if (durationMs === null) return "—";

  const seconds = Math.round(durationMs / 1000);

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

// Play the picked disc and put the one it replaces on top of the stack (LIFO).
export const playFromStack = (
  current: number,
  stack: readonly number[],
  picked: number,
) => ({
  current: picked,
  stack: [current, ...stack.filter((index) => index !== picked)],
});

// Say when the disc was last played in a few words, like "2 hrs ago", to fit the narrow details column.
export const formatPlayedAgo = (listenedAt: number, now = Date.now()) => {
  const seconds = Math.max(0, now / 1000 - listenedAt);
  const ago = (count: number, unit: string) =>
    `${count} ${unit}${count === 1 ? "" : "s"} ago`;

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return ago(Math.floor(seconds / 60), "min");
  if (seconds < 86400) return ago(Math.floor(seconds / 3600), "hr");
  return ago(Math.floor(seconds / 86400), "day");
};

// Identify a set of listens by what the player shows, so an unchanged refetch doesn't remount it.
export const signature = (listens: Listen[]) =>
  listens
    .map((listen) =>
      [listen.track, listen.artist, listen.playingNow].join("\u0000"),
    )
    .join("\u0001");
