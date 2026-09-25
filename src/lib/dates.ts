// Date formats shared across the windows: "Sep 24" dates (no comma) and an FF7-style
// zero-padded 24-hour HH:MM:SS clock.

// Parse YYYY-MM-DD as a local date so labels don't shift a day in negative UTC offsets.
export const localDate = (date: string) => new Date(`${date}T00:00`);

// "Sep 24". Without a time zone, in the date's own (local) calendar day.
export const shortDate = (date: Date, timeZone?: string) =>
  date.toLocaleDateString("en-US", {
    timeZone,
    month: "short",
    day: "2-digit",
  });

// "19:16:05"
export const clock = (date: Date, timeZone?: string) =>
  date.toLocaleTimeString("en-GB", { timeZone, hour12: false });
