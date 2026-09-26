// Parse date-only strings at local midnight to avoid UTC shifting the day.
export const parseLocalDate = (date: string) => new Date(`${date}T00:00`);

// Format an abbreviated month and two-digit day in the requested timezone.
export const formatShortDate = (date: Date, timeZone?: string) =>
  date.toLocaleDateString("en-US", {
    timeZone,
    month: "short",
    day: "2-digit",
  });

// Format a 24-hour clock with seconds in the requested timezone.
export const formatTime = (date: Date, timeZone?: string) =>
  date.toLocaleTimeString("en-GB", { timeZone, hour12: false });
