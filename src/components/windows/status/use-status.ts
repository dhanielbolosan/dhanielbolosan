import { useEffect, useRef, useState } from "react";
import { fetchLatestPush } from "@/lib/github";
import { playSound } from "@/lib/audio";
import {
  calculateLevelProgress,
  calculateHit,
  limitGain,
} from "./status.utils";
import { maxHealth } from "./status.data";

export const useStatus = () => {
  const [now, setNow] = useState(() => new Date());
  const [health, setHealth] = useState(maxHealth);
  const [limit, setLimit] = useState(0);
  const [hit, setHit] = useState<{
    id: number;
    amount: number;
    recovery: boolean;
  }>();
  const nextAttackAt = useRef(0);

  useEffect(() => {
    if (!hit) return;
    const timer = setTimeout(() => setHit(undefined), 650);
    return () => clearTimeout(timer);
  }, [hit]);

  const attack = () => {
    if (!health) {
      playSound("error");
      return;
    }
    const id = performance.now();
    if (id < nextAttackAt.current) return;
    nextAttackAt.current = id + 350;
    const result = calculateHit(health);
    const nextLimit = Math.min(
      255,
      limit + limitGain(health - result.health, maxHealth),
    );
    setHealth(result.health);
    setLimit(nextLimit);
    setHit({ id, amount: result.damage, recovery: false });
    playSound(!result.health ? "delete" : result.critical ? "crit" : "slash");
    if (limit < 255 && nextLimit === 255) playSound("limit");
  };

  const useLimit = () => {
    if (limit < 255) {
      playSound("error");
      return;
    }
    const id = performance.now();
    nextAttackAt.current = id + 350;
    // Portfolio adaptation: a full Limit restores HP, including from KO.
    setHealth(maxHealth);
    setLimit(0);
    setHit({ id, amount: maxHealth - health, recovery: true });
    playSound("heal");
  };

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

  return {
    now,
    latestPush,
    health,
    hit,
    attack,
    limit,
    useLimit,
    ...calculateLevelProgress(now),
  };
};
