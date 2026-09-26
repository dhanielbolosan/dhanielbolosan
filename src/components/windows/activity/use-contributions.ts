import { useEffect, useState } from "react";
import { fetchContributionCalendar } from "@/lib/github";
import { createEmptyCalendar } from "./activity.utils";

export const useContributions = () => {
  // Keep a complete empty calendar visible until contribution data arrives.
  const [calendar, setCalendar] = useState(() => createEmptyCalendar());

  const { from, to } = calendar.range;

  useEffect(() => {
    const controller = new AbortController();

    // Replace the fallback only on success, preserving it if the request fails.
    void fetchContributionCalendar({ from, to }, controller.signal)
      .then((result) => {
        if (result) setCalendar(result);
      })
      .catch(() => undefined);

    // Cancel the request when the range changes or the window unmounts.
    return () => controller.abort();
  }, [from, to]);

  return calendar;
};
