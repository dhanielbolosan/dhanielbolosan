import { birthday } from "./status.data";

const DAY = 24 * 60 * 60 * 1000;

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
    // Count partial remaining days, but only completed days lived.
    daysLeft: Math.ceil((nextBirthday.getTime() - today.getTime()) / DAY),
    daysLived: Math.floor(
      (today.getTime() - birthdayInYear(birthday.year).getTime()) / DAY,
    ),
  };
};
