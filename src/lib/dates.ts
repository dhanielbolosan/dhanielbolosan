export const localDate = (date: string) => new Date(`${date}T00:00`);

export const shortDate = (date: Date, timeZone?: string) =>
  date.toLocaleDateString("en-US", {
    timeZone,
    month: "short",
    day: "2-digit",
  });

export const clock = (date: Date, timeZone?: string) =>
  date.toLocaleTimeString("en-GB", { timeZone, hour12: false });
