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

// Say when the disc was last played in a few words, like "2 hr. ago", to fit the narrow details column.
export const formatPlayedAgo = (listenedAt: number, now = Date.now()) => {
  const seconds = Math.max(0, now / 1000 - listenedAt);
  const format = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
    style: "short",
  });

  const text =
    seconds < 60
      ? "just now"
      : seconds < 3600
        ? format.format(-Math.floor(seconds / 60), "minute")
        : seconds < 86400
          ? format.format(-Math.floor(seconds / 3600), "hour")
          : format.format(-Math.floor(seconds / 86400), "day");

  // Capitalize the label, so "yesterday" reads "Yesterday".
  return text[0].toUpperCase() + text.slice(1);
};
