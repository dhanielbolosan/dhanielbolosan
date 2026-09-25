import { useEffect, useRef, useState } from "react";
import { Popover } from "radix-ui";
import { cn } from "@/lib/utils";
import { PixelHand } from "../pixel-hand";

// FF7 colors each window corner separately. Each corner is a CSS custom property every
// window reads (see the window-bg utility).
const corners = [
  { key: "tl", label: "Top left", fallback: "#4a3f6b" },
  { key: "tr", label: "Top right", fallback: "#2f284a" },
  { key: "bl", label: "Bottom left", fallback: "#2f284a" },
  { key: "br", label: "Bottom right", fallback: "#15112a" },
] as const;

// The site keeps text to two colors so both can be customized: primary text is
// --foreground, the teal accent is --label. Highlight (--gold) is the link color, and
// the Activity graph's ramp is derived from it (see index.css).
const textColors = [
  { key: "text", label: "Text", cssVar: "--foreground", fallback: "#f3f1f7" },
  { key: "accent", label: "Accent", cssVar: "--label", fallback: "#6fd6e8" },
  {
    key: "highlight",
    label: "Highlight",
    cssVar: "--gold",
    fallback: "#f4d35e",
  },
] as const;

type Corner = (typeof corners)[number]["key"];
type TextColor = (typeof textColors)[number]["key"];
type ColorKey = Corner | TextColor;
type Rgb = [number, number, number];
type Colors = Record<ColorKey, Rgb>;

const storageKey = "window-colors";

const toRgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const toHex = (rgb: Rgb) =>
  `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`;

const all = [
  ...corners.map((c) => ({ ...c, cssVar: `--window-${c.key}` })),
  ...textColors,
];

const defaults = Object.fromEntries(
  all.map((c) => [c.key, toRgb(c.fallback)]),
) as Colors;

// Saved choices for this visitor, key by key; storage can be blocked or hold junk (or
// an older format missing some keys), so each missing key falls back to its default.
const load = (): Colors => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    return Object.fromEntries(
      all.map((c) => [
        c.key,
        saved?.[c.key]?.length === 3 ? saved[c.key] : defaults[c.key],
      ]),
    ) as Colors;
  } catch {
    return defaults;
  }
};

// Where the hand sits for each corner, 8px from the corner like every other hand and
// its target: left corners point in from outside the box, right corners from inside.
const handPosition: Record<Corner, string> = {
  tl: "top-0 right-full mr-2",
  tr: "top-0 right-2",
  bl: "bottom-0 right-full mr-2",
  br: "bottom-0 right-2",
};

const channels = [
  { name: "R", className: "text-[#ff6b6b]" },
  { name: "G", className: "text-[#6bdc7a]" },
  { name: "B", className: "text-[#6b9bff]" },
];

const settings = [
  { id: "window", label: "Window color" },
  { id: "text", label: "Text color" },
  { id: "accent", label: "Accent color" },
  { id: "highlight", label: "Highlight color" },
  { id: "reset", label: "Reset to default" },
] as const;

type Setting = (typeof settings)[number]["id"];

// Settings that edit a color with the slider popover.
const isColor = (id: Setting | undefined) =>
  id === "window" || id === "text" || id === "accent" || id === "highlight";

const labelFor = (key: ColorKey) =>
  all.find((c) => c.key === key)!.label.toLowerCase();

// FF7 Config menu, step by step like the game:
// 1. Hover a setting to show the hand; click it to pin the hand there.
// 2. Window color only: a second hand appears on the preview rectangle; point at a
//    corner and click it, and its swatch appears beside the rectangle.
// 3. A popover opens with only the R/G/B sliders, where another hand follows the
//    channel being edited. Text and Accent color go straight here.
// Hands left behind at earlier steps idle-bob; the active one holds still. Escape (or
// clicking away) steps back. Everything recolors live. Reset to default restores all.
export const Config = () => {
  const [colors, setColors] = useState(load);
  const [hovered, setHovered] = useState<Setting>();
  const [open, setOpen] = useState<Setting>();
  const [corner, setCorner] = useState<Corner>();
  const [pointedCorner, setPointedCorner] = useState<Corner>();
  // The last corner picked; the hand returns there when the picker reopens.
  const [lastCorner, setLastCorner] = useState<Corner>("tl");
  const [channel, setChannel] = useState(0);
  const windowRow = useRef<HTMLLIElement>(null);

  useEffect(() => {
    for (const c of all)
      document.documentElement.style.setProperty(
        c.cssVar,
        toHex(colors[c.key]),
      );
    try {
      localStorage.setItem(storageKey, JSON.stringify(colors));
    } catch {
      // Storage unavailable: the colors still apply for this visit.
    }
  }, [colors]);

  // The color the sliders edit, once a step has chosen one.
  const editing: ColorKey | undefined =
    open === "window"
      ? corner
      : isColor(open)
        ? (open as TextColor)
        : undefined;

  const setValue = (key: ColorKey, i: number, value: number) =>
    setColors((current) => {
      const next = [...current[key]] as Rgb;
      next[i] = value;
      return { ...current, [key]: next };
    });

  const close = () => {
    setOpen(undefined);
    setCorner(undefined);
  };

  const stepBack = () => {
    if (open === "window" && corner) setCorner(undefined);
    else close();
  };

  // Escape steps back one step at a time, wherever focus is. The popover's own Escape
  // is turned off, since it would close first and this would then step back twice.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") stepBack();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  // While picking a corner, pressing anywhere outside the row steps back, like the
  // popover does one step later. (With the popover open, Radix handles that press.)
  useEffect(() => {
    if (open !== "window" || corner) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!windowRow.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, corner]);

  const handCorner = pointedCorner ?? corner ?? lastCorner;

  const sliders = (key: ColorKey) =>
    channels.map((c, i) => (
      <label
        key={c.name}
        onMouseEnter={() => setChannel(i)}
        className="relative grid grid-cols-[1rem_2.25rem_1fr] items-center gap-2 text-sm"
      >
        {i === channel && (
          <PixelHand className="absolute inset-y-0 right-full my-auto mr-2" />
        )}
        <span className={cn("font-semibold", c.className)}>{c.name}</span>
        <span className="text-right tabular-nums">
          {String(colors[key][i]).padStart(3, "0")}
        </span>
        <input
          type="range"
          min={0}
          max={255}
          value={colors[key][i]}
          onFocus={() => setChannel(i)}
          onChange={(event) => setValue(key, i, Number(event.target.value))}
          aria-label={`${c.name} for the ${labelFor(key)} color`}
          className="ff7-slider"
        />
      </label>
    ));

  // What sits after each label: the window's four-corner preview (a corner picker once
  // open, then the picked corner's swatch), or a text color's swatch.
  const preview = (id: Setting) => {
    if (id === "window")
      return (
        <>
          <div
            role={open === "window" ? "radiogroup" : undefined}
            aria-label={open === "window" ? "Window corner" : undefined}
            onMouseLeave={() => setPointedCorner(undefined)}
            className="window-bg h-9 w-24 shrink-0 rounded-[4px] [box-shadow:var(--frame-bevel)]"
          >
            {open === "window" &&
              corners.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  role="radio"
                  aria-checked={corner === c.key}
                  aria-label={`${c.label} corner`}
                  onClick={() => {
                    setCorner(c.key);
                    setLastCorner(c.key);
                  }}
                  onMouseEnter={() => setPointedCorner(c.key)}
                  onFocus={() => setPointedCorner(c.key)}
                  onBlur={() => setPointedCorner(undefined)}
                  className={cn(
                    "absolute h-1/2 w-1/2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    c.key[0] === "t" ? "top-0" : "bottom-0",
                    c.key[1] === "l" ? "left-0" : "right-0",
                  )}
                />
              ))}
            {open === "window" && (
              <PixelHand
                className={cn(
                  "pointer-events-none absolute",
                  handPosition[handCorner],
                  corner && !pointedCorner && "motion-safe:animate-bob",
                )}
              />
            )}
          </div>
          {open === "window" && corner && (
            <span
              aria-hidden="true"
              className="size-9 shrink-0 rounded-[4px] [box-shadow:var(--frame-bevel)]"
              style={{ background: toHex(colors[corner]) }}
            />
          )}
        </>
      );
    if (id === "reset") return null;
    return (
      <span
        aria-hidden="true"
        className="size-9 shrink-0 rounded-[4px] [box-shadow:var(--frame-bevel)]"
        style={{ background: toHex(colors[id]) }}
      />
    );
  };

  return (
    // Labels share one column so every preview lines up.
    <ul className="grid grid-cols-[auto_1fr] gap-y-2 font-heading">
      {settings.map(({ id, label }) => (
        // The whole row points and clicks, like a History entry. The label button
        // stays for keyboard use; its click bubbles up here.
        <li
          key={id}
          ref={id === "window" ? windowRow : undefined}
          data-setting={id}
          onMouseEnter={() => setHovered(id)}
          onMouseLeave={() => setHovered(undefined)}
          onClick={(event) => {
            const target = event.target as Element;
            // Corner picks belong to the picker, and popover clicks bubble here
            // through the React portal without being inside the row.
            if (
              !event.currentTarget.contains(target) ||
              target.closest('[role="radio"]')
            )
              return;
            if (id === "reset") {
              setColors(defaults);
              close();
            } else if (open === id) close();
            else {
              setCorner(undefined);
              setOpen(id);
            }
          }}
          className="col-span-2 grid min-h-9 cursor-pointer grid-cols-subgrid items-center"
        >
          <button
            type="button"
            aria-expanded={isColor(id) ? open === id : undefined}
            onFocus={() => setHovered(id)}
            onBlur={() => setHovered(undefined)}
            className="relative cursor-pointer py-0.5 pl-11 text-left text-base outline-none"
          >
            <PixelHand
              className={cn(
                "absolute inset-y-0 left-0 my-auto",
                !(hovered === id || open === id) && "invisible",
                open === id && "motion-safe:animate-bob",
              )}
            />
            <span className="text-label">{label}</span>
          </button>

          {!isColor(id) && preview(id)}
          {isColor(id) && (
            <Popover.Root
              open={open === id && editing !== undefined}
              onOpenChange={(next) => !next && stepBack()}
            >
              <Popover.Anchor className="ml-11 flex items-center gap-3">
                {preview(id)}
              </Popover.Anchor>

              <Popover.Portal>
                <Popover.Content
                  side="bottom"
                  align="start"
                  sideOffset={6}
                  collisionPadding={12}
                  // Presses inside this row are the row's (switching corners, or
                  // toggling it closed); they must not also dismiss the popover.
                  onEscapeKeyDown={(event) => event.preventDefault()}
                  onInteractOutside={(event) =>
                    (event.target as Element).closest(
                      `[data-setting="${id}"]`,
                    ) && event.preventDefault()
                  }
                  aria-label={`${label} sliders`}
                  className="window z-50 flex w-72 max-w-[calc(100vw-24px)] flex-col gap-2 p-4 font-heading"
                >
                  {editing && sliders(editing)}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          )}
        </li>
      ))}
    </ul>
  );
};
