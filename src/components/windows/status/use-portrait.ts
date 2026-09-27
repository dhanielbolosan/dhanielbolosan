import { useEffect, useRef, useState } from "react";
import { playSound } from "@/lib/audio";
import { damageNumberMs, portraitAttackCooldownMs } from "@/lib/motion";
import { calculateHit, limitGain } from "./status.utils";
import { maxLimit } from "./status.data";

export const usePortrait = (maxHealth: number) => {
  // Keep combat state separate from the Status clock and GitHub data.
  const [currentHealth, setHealth] = useState(maxHealth);
  // Preserve current HP and KO when LV changes, while respecting the new maximum.
  const health = Math.min(currentHealth, maxHealth);
  const [limit, setLimit] = useState(0);
  const [hit, setHit] = useState<{
    id: number;
    amount: number;
    recovery: boolean;
  }>();
  const nextAttackAt = useRef(0);

  // Clear the floating number after its CSS animation finishes.
  useEffect(() => {
    if (!hit) return;
    const timer = setTimeout(() => setHit(undefined), damageNumberMs);
    return () => clearTimeout(timer);
  }, [hit]);

  // Apply one hit per cooldown and announce only new KO or full-Limit states.
  const attack = () => {
    if (!health) {
      playSound("error");
      return;
    }
    const id = performance.now();
    if (id < nextAttackAt.current) return;
    nextAttackAt.current = id + portraitAttackCooldownMs;
    const result = calculateHit(health);
    const nextLimit = Math.min(
      maxLimit,
      limit + limitGain(health - result.health, maxHealth),
    );
    setHealth(result.health);
    setLimit(nextLimit);
    setHit({ id, amount: result.damage, recovery: false });
    playSound(!result.health ? "delete" : result.critical ? "crit" : "slash");
    if (limit < maxLimit && nextLimit === maxLimit) playSound("limit");
  };

  // Spend a full gauge to restore all HP, including from KO.
  const useLimit = () => {
    if (limit < maxLimit) {
      playSound("error");
      return;
    }
    const id = performance.now();
    nextAttackAt.current = id + portraitAttackCooldownMs;
    setHealth(maxHealth);
    setLimit(0);
    setHit({ id, amount: maxHealth - health, recovery: true });
    playSound("heal");
  };

  return { health, hit, attack, limit, useLimit };
};
