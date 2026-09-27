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

const luminance = (rgb: Rgb) =>
  rgb.reduce((sum, channel, index) => {
    const value = channel / 255;

    return (
      sum +
      [0.2126, 0.7152, 0.0722][index] *
        (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    );
  }, 0);

// Use the faintest light or dark tint that keeps small text readable.
export const getMutedCreditColor = (background: Rgb) => {
  const backgroundLuminance = luminance(background);
  // Start with whichever of white or black has the greater contrast.
  const foreground = backgroundLuminance < Math.sqrt(0.0525) - 0.05 ? 255 : 0;

  for (let percent = 50; percent <= 100; percent += 5) {
    const color = background.map((channel) =>
      Math.round(channel + (foreground - channel) * (percent / 100)),
    ) as Rgb;
    const textLuminance = luminance(color);
    const contrast =
      (Math.max(textLuminance, backgroundLuminance) + 0.05) /
      (Math.min(textLuminance, backgroundLuminance) + 0.05);

    if (contrast >= 4.5) return rgbToHex(color);
  }

  return foreground === 255 ? "#ffffff" : "#000000";
};

// Contrast the outline with the text so mixed backgrounds cannot hide the letters.
export const getMutedCreditOutline = (color: string) =>
  luminance(hexToRgb(color)) < Math.sqrt(0.0525) - 0.05 ? "#ffffff" : "#000000";

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
