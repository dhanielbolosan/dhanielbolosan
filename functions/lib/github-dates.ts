// Format server-side calendar dates as YYYY-MM-DD in UTC.
export const toDateString = (date: Date) => date.toISOString().slice(0, 10);

// Reject invalid dates that JavaScript would normalize into another month.
export const isCalendarDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isFinite(date.getTime()) && toDateString(date) === value;
};

// Keep the display range while limiting the query's end to the current instant.
export const getRangeFromDates = (from: string, to: string, now: Date) => {
  const asOf = toDateString(now);

  return {
    asOf,
    from,
    queryFrom: `${from}T00:00:00.000Z`,
    queryTo: to < asOf ? `${to}T23:59:59.999Z` : now.toISOString(),
    to,
  };
};

// Choose the current calendar year or the latest 365 days, including today.
export const getContributionRange = (
  preset: "current-year" | "rolling-year",
) => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const asOf = toDateString(now);
  const from =
    preset === "current-year"
      ? `${year}-01-01`
      : toDateString(
          new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate() - 364)),
        );
  const to = preset === "current-year" ? `${year}-12-31` : asOf;

  return getRangeFromDates(from, to, now);
};
