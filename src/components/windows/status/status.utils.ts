import { aerithGrowth, birthday } from "./status.data.ts";

// ponytail: use Aerith's growth baselines; simulate level-up rolls only for save-file stats.
export const calculatePortraitResources = (level: number) => {
  // Bound age to the growth curves; their first baseline matches her starting HP/MP.
  const growthLevel = Math.min(99, Math.max(2, Math.floor(level)));
  const curve = aerithGrowth.find(({ maxLevel }) => growthLevel <= maxLevel)!;

  return {
    maxHealth: Math.min(
      9999,
      curve.health[0] + (growthLevel - 1) * curve.health[1],
    ),
    maxMana: Math.min(
      999,
      curve.mana[0] + Math.floor(((growthLevel - 1) * curve.mana[1]) / 10),
    ),
  };
};

// ponytail: fixed attack power and 5% critical chance; add combat stats only for a full battle.
export const calculateHit = (
  health: number,
  variation = Math.random(),
  criticalRoll = Math.random(),
) => {
  const critical = criticalRoll < 0.05;
  // Original FF7 varies damage by 3841..4096 / 4096, after the critical multiplier.
  const damage = Math.floor(
    (150 * (critical ? 2 : 1) * (3841 + Math.floor(variation * 256))) / 4096,
  );
  return { damage, critical, health: Math.max(0, health - damage) };
};

// Mark KO at zero HP and near-death status at one-quarter of the maximum.
export const healthStatus = (health: number, maximum: number) =>
  health === 0 ? "ko" : health <= maximum / 4 ? "critical" : "normal";

// Aerith's level-one Limit: 255 units, with the game's two rounding steps.
export const limitGain = (damage: number, maximum: number) =>
  Math.floor((Math.floor((300 * damage) / maximum) * 256) / 200);

// Use age as level and time between birthdays as EXP.
export const calculateLevelProgress = (today = new Date()) => {
  // Midnight in Hawaiʻi is 10:00 UTC throughout the year.
  const birthdayInYear = (year: number) =>
    new Date(Date.UTC(year, birthday.month - 1, birthday.day, 10));

  // Find the birthdays surrounding today to measure this level's progress.
  const hasBirthdayOccurred = birthdayInYear(today.getFullYear()) <= today;
  const previousBirthday = birthdayInYear(
    today.getFullYear() - (hasBirthdayOccurred ? 0 : 1),
  );
  const nextBirthday = birthdayInYear(previousBirthday.getFullYear() + 1);
  const elapsed = today.getTime() - previousBirthday.getTime();
  const isBirthday = elapsed < 24 * 60 * 60 * 1000;

  return {
    level: previousBirthday.getFullYear() - birthday.year,
    // Keep the EXP bar full for the entire birthday.
    experienceProgress: isBirthday
      ? 1
      : elapsed / (nextBirthday.getTime() - previousBirthday.getTime()),
  };
};
