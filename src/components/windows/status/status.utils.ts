import { birthday } from "./status.data.ts";

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

export const healthStatus = (health: number, maximum: number) =>
  health === 0 ? "ko" : health <= maximum / 4 ? "critical" : "normal";

// Aerith's level-one Limit: 255 units, with the game's two rounding steps.
export const limitGain = (damage: number, maximum: number) =>
  Math.floor((Math.floor((300 * damage) / maximum) * 256) / 200);

// Use age as level and time between birthdays as EXP.
export const calculateLevelProgress = (today = new Date()) => {
  const birthdayInYear = (year: number) =>
    new Date(year, birthday.month - 1, birthday.day);

  // Find the birthdays surrounding today to measure this level's progress.
  const hasBirthdayOccurred = birthdayInYear(today.getFullYear()) <= today;
  const previousBirthday = birthdayInYear(
    today.getFullYear() - (hasBirthdayOccurred ? 0 : 1),
  );
  const nextBirthday = birthdayInYear(previousBirthday.getFullYear() + 1);
  const isBirthday =
    today.getMonth() === birthday.month - 1 && today.getDate() === birthday.day;

  return {
    level: previousBirthday.getFullYear() - birthday.year,
    // Keep the EXP bar full for the entire birthday.
    experienceProgress: isBirthday
      ? 1
      : (today.getTime() - previousBirthday.getTime()) /
        (nextBirthday.getTime() - previousBirthday.getTime()),
  };
};
