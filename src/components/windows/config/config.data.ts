import { hexToRgb } from "./config.utils";

export const corners = [
  { key: "tl", label: "Top left", fallback: "#4a3f6b" },
  { key: "tr", label: "Top right", fallback: "#2f284a" },
  { key: "bl", label: "Bottom left", fallback: "#2f284a" },
  { key: "br", label: "Bottom right", fallback: "#15112a" },
] as const;

export const textColors = [
  { key: "text", label: "Text", cssVar: "--foreground", fallback: "#f3f1f7" },
  { key: "accent", label: "Accent", cssVar: "--label", fallback: "#6fd6e8" },

  {
    key: "highlight",
    label: "Highlight",
    cssVar: "--gold",
    fallback: "#e0c13b",
  },

  {
    key: "shadow",
    label: "Shadow",
    cssVar: "--text-shadow",
    fallback: "#15121a",
  },
] as const;

export type Corner = (typeof corners)[number]["key"];
export type TextColor = (typeof textColors)[number]["key"];
export type ColorKey = Corner | TextColor;
export type Rgb = [number, number, number];
export type Colors = Record<ColorKey, Rgb>;

export const storageKey = "window-colors";

// Combine window corners and text colors with their corresponding CSS variables.
export const colorDefinitions = [
  ...corners.map((definition) => ({
    ...definition,
    cssVar: `--window-${definition.key}`,
  })),
  ...textColors,
];

// Derive the initial RGB palette from the fallback hex colors.
export const defaultColors = Object.fromEntries(
  colorDefinitions.map((definition) => [
    definition.key,
    hexToRgb(definition.fallback),
  ]),
) as Colors;

export const cornerHandPositions: Record<Corner, string> = {
  tl: "top-0 right-full mr-2",
  tr: "top-0 right-2",
  bl: "bottom-0 right-full mr-2",
  br: "bottom-0 right-2",
};

export const channels = [
  { name: "R", className: "text-[#ff6b6b]" },
  { name: "G", className: "text-[#6bdc7a]" },
  { name: "B", className: "text-[#6b9bff]" },
];

export const settings = [
  { id: "window", label: "Window color" },
  { id: "text", label: "Text colors" },
  { id: "reset", label: "Reset to default" },
] as const;

export type Setting = (typeof settings)[number]["id"];

export const settingHelp: Record<Setting, string> = {
  window: "Select colors for each corner of the window",
  text: "Select colors for each text type",
  reset: "Select to reset configs to default",
};

// Look up a color's label for the slider's accessible name.
export const getColorLabel = (key: ColorKey) =>
  colorDefinitions
    .find((definition) => definition.key === key)!
    .label.toLowerCase();
