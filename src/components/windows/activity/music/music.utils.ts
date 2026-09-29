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

// Describe when the disc was last played, like "Played 2 hours ago".
export const formatPlayedAgo = (listenedAt: number, now = Date.now()) => {
  const seconds = Math.max(0, now / 1000 - listenedAt);
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (seconds < 60) return "Played just now";
  if (seconds < 3600)
    return `Played ${format.format(-Math.floor(seconds / 60), "minute")}`;
  if (seconds < 86400)
    return `Played ${format.format(-Math.floor(seconds / 3600), "hour")}`;

  return `Played ${format.format(-Math.floor(seconds / 86400), "day")}`;
};
