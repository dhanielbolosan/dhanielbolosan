import type { Colors, ColorKey, Rgb } from "./config.data";

// Split a six-digit hex color into its red, green, and blue channels.
export const hexToRgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

// Join RGB channels into a hex color, padding each channel to two digits.
export const rgbToHex = (rgb: Rgb) =>
  `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;

// Accept exactly three integer channels in the 0–255 range.
const isRgb = (value: unknown): value is Rgb =>
  Array.isArray(value) &&
  value.length === 3 &&
  value.every(
    (channel) => Number.isInteger(channel) && channel >= 0 && channel <= 255,
  );

// Restore known color keys, replacing missing or invalid values with defaults.
export const parseSavedColors = (saved: unknown, defaults: Colors): Colors => {
  const values =
    saved && typeof saved === "object"
      ? (saved as Record<string, unknown>)
      : {};

  return Object.fromEntries(
    (Object.keys(defaults) as ColorKey[]).map((key) => {
      let color = values[key];

      // Migrate highlights saved before the current materia palette.
      if (
        key === "highlight" &&
        ["[244,211,94]", "[254,254,90]", "[212,175,55]"].includes(
          JSON.stringify(color),
        )
      ) {
        color = defaults.highlight;
      }

      return [key, isRgb(color) ? color : defaults[key]];
    }),
  ) as Colors;
};

// Load saved colors, falling back when storage is unavailable or JSON is malformed.
export const loadSavedColors = (storageKey: string, defaults: Colors) => {
  try {
    return parseSavedColors(
      JSON.parse(localStorage.getItem(storageKey) ?? "null"),
      defaults,
    );
  } catch {
    return defaults;
  }
};
