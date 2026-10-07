// Age drives LV; the interval between birthdays drives next-level progress.
export const birthday = { year: 2004, month: 3, day: 26 };

// Aerith's level brackets store [base, gradient] pairs for HP and MP.
// Source: https://gamefaqs.gamespot.com/ps/197341-final-fantasy-vii/faqs/36775
export const aerithGrowth = [
  { maxLevel: 11, health: [160, 17], mana: [16, 70] },
  { maxLevel: 21, health: [0, 36], mana: [0, 84] },
  { maxLevel: 31, health: [-560, 65], mana: [-30, 99] },
  { maxLevel: 41, health: [-1400, 93], mana: [-68, 112] },
  { maxLevel: 51, health: [-2240, 114], mana: [-116, 124] },
  { maxLevel: 61, health: [-2880, 126], mana: [-96, 120] },
  { maxLevel: 81, health: [-2080, 113], mana: [-6, 105] },
  { maxLevel: 99, health: [-400, 93], mana: [188, 82] },
] as const;

// The game's Limit gauge becomes usable at 255 units.
export const maxLimit = 255;

// Render personal details through the shared label/value grid.
export const profileStats: [string, string][] = [
  ["OS", "CachyOS"],
  ["Role", "Full-Stack Engineer"],
  ["Base", "Maui, Hawaiʻi"],
  ["Avail", "Open to Work"],
];
