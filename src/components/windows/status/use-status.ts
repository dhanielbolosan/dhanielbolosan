import { useEffect, useState } from "react";
import { fetchLatestPush } from "@/lib/github";
import { calculateLevelProgress } from "./status.utils";

export const useStatus = () => {
  const [now, setNow] = useState(() => new Date());

  // Refresh the clock every second while the window is mounted.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);

    return () => clearInterval(timer);
  }, []);

  const [latestPush, setLatestPush] = useState<{ at: Date; repo: string }>();

  // Fetch the latest public push once for the last-save display.
  useEffect(() => {
    const controller = new AbortController();

    void fetchLatestPush(controller.signal)
      .then((push) => {
        if (push) setLatestPush(push);
      })
      .catch(() => undefined);

    // Cancel the request when the window unmounts.
    return () => controller.abort();
  }, []);

  return { now, latestPush, ...calculateLevelProgress(now) };
};
