import { useEffect, useState } from "react";
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

// The site keeps text to a small palette so it can all be customized: primary text
// (--foreground), the teal accent (--label), the highlight (--gold: links, and the
// Activity graph's ramp is derived from it, see index.css), and the hard text shadow.
const textColors = [
  { key: "text", label: "Text", cssVar: "--foreground", fallback: "#f3f1f7" },
  { key: "accent", label: "Accent", cssVar: "--label", fallback: "#6fd6e8" },
  {
    key: "highlight",
    label: "Highlight",
    cssVar: "--gold",
    fallback: "#f4d35e",
  },
  {
    key: "shadow",
    label: "Shadow",
    cssVar: "--text-shadow",
    fallback: "#15121a",
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
  { id: "window", label: "Window color", parts: corners },
  { id: "text", label: "Text colors", parts: textColors },
  { id: "reset", label: "Reset to default", parts: [] },
] as const;

type Setting = (typeof settings)[number]["id"];

const labelFor = (key: ColorKey) =>
  all.find((c) => c.key === key)!.label.toLowerCase();

// FF7 Config menu, step by step like the game:
// 1. Hover a setting to show the hand; click it to pin the hand there.
// 2. A second hand appears on its preview: a corner of the window rectangle, or one of
//    the text color swatches. Point at one and click it (a picked corner also gets its
//    swatch beside the rectangle).
// 3. A popover opens with only the R/G/B sliders, where another hand follows the
//    channel being edited.
// Hands left behind at earlier steps idle-bob; the active one holds still. Escape (or
// clicking away) steps back. Everything recolors live. Reset to default restores all.
export const Config = () => {
  const [colors, setColors] = useState(load);
  const [hovered, setHovered] = useState<Setting>();
  const [open, setOpen] = useState<Setting>();
  // The corner or swatch picked in step 2, and the one under the pointer.
  const [part, setPart] = useState<ColorKey>();
  const [pointedPart, setPointedPart] = useState<ColorKey>();
  // Each row's last pick; the hand returns there when the row reopens.
  const [lastPart, setLastPart] = useState<Record<string, ColorKey>>({
    window: "tl",
    text: "text",
  });
  const [channel, setChannel] = useState(0);

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

  const setValue = (key: ColorKey, i: number, value: number) =>
    setColors((current) => {
      const next = [...current[key]] as Rgb;
      next[i] = value;
      return { ...current, [key]: next };
    });

  const close = () => {
    setOpen(undefined);
    setPart(undefined);
  };

  const stepBack = () => {
    if (part) setPart(undefined);
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

  // While picking a part, pressing anywhere outside the row steps back, like the
  // popover does one step later. (With the popover open, Radix handles that press.)
  useEffect(() => {
    if (!open || part) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target as Element).closest(`[data-setting="${open}"]`))
        close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, part]);

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

  // A step-2 pick target: a corner quadrant of the rectangle, or a whole swatch.
  const pick = (key: ColorKey, label: string, className: string) => (
    <button
      key={key}
      type="button"
      role="radio"
      aria-checked={part === key}
      aria-label={label}
      onClick={() => {
        setPart(key);
        setLastPart((current) => ({ ...current, [open!]: key }));
      }}
      onMouseEnter={() => setPointedPart(key)}
      onFocus={() => setPointedPart(key)}
      onBlur={() => setPointedPart(undefined)}
      className={cn(
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    />
  );

  // The step-2 hand: bobs once its pick is made, holds still while pointing.
  const partHand = (className: string) => (
    <PixelHand
      className={cn(
        "pointer-events-none absolute z-10",
        className,
        part && !pointedPart && "motion-safe:animate-bob",
      )}
    />
  );

  // What sits after each label, on one grid of 36px columns. Where the window is wide
  // enough (23rem of content), that's one row 12px apart: the four text color swatches
  // in a row, the window rectangle spanning the first two columns, and the picked
  // corner's swatch above the third. Narrower (1280-1680 desktops, phones), the row
  // doesn't fit, so the palette is 2 x 2 with columns 44px apart, the rectangle spans
  // both, and the corner swatch wraps below. Swatch picks put the hand 8px to the left;
  // in the one-row layout it overlaps the neighboring swatch, drawn on top.
  const preview = (id: Setting) => {
    const active = open === id;
    const handAt = pointedPart ?? part ?? lastPart[id];
    if (id === "window")
      return (
        <>
          <div
            role={active ? "radiogroup" : undefined}
            aria-label={active ? "Window corner" : undefined}
            onMouseLeave={() => setPointedPart(undefined)}
            className="window-bg h-9 w-29 shrink-0 rounded-[4px] @min-[23rem]:w-21 [box-shadow:var(--frame-bevel)]"
          >
            {active &&
              corners.map((c) =>
                pick(
                  c.key,
                  `${c.label} corner`,
                  cn(
                    "absolute h-1/2 w-1/2",
                    c.key[0] === "t" ? "top-0" : "bottom-0",
                    c.key[1] === "l" ? "left-0" : "right-0",
                  ),
                ),
              )}
            {active && partHand(handPosition[handAt as Corner])}
          </div>
          {active && part && (
            <span
              aria-hidden="true"
              className="size-9 shrink-0 rounded-[4px] [box-shadow:var(--frame-bevel)]"
              style={{ background: toHex(colors[part]) }}
            />
          )}
        </>
      );
    if (id === "reset") return null;
    return (
      <div
        role={active ? "radiogroup" : undefined}
        aria-label={active ? "Text color" : undefined}
        onMouseLeave={() => setPointedPart(undefined)}
        className="grid grid-cols-2 gap-x-11 gap-y-3 @min-[23rem]:grid-cols-4 @min-[23rem]:gap-x-3"
      >
        {textColors.map((c) => (
          <span
            key={c.key}
            title={c.label}
            className="relative size-9 shrink-0 rounded-[4px] [box-shadow:var(--frame-bevel)]"
            style={{ background: toHex(colors[c.key]) }}
          >
            {active && pick(c.key, `${c.label} color`, "absolute inset-0")}
            {active &&
              handAt === c.key &&
              partHand("inset-y-0 right-full my-auto mr-2")}
          </span>
        ))}
      </div>
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
          data-setting={id}
          onMouseEnter={() => setHovered(id)}
          onMouseLeave={() => setHovered(undefined)}
          onClick={(event) => {
            const target = event.target as Element;
            // Picks belong to the picker, and popover clicks bubble here through the
            // React portal without being inside the row.
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
              setPart(undefined);
              setOpen(id);
            }
          }}
          className="col-span-2 grid min-h-9 cursor-pointer grid-cols-subgrid items-center"
        >
          <button
            type="button"
            aria-expanded={id === "reset" ? undefined : open === id}
            onFocus={() => setHovered(id)}
            onBlur={() => setHovered(undefined)}
            // Reset has no preview, so its label spans both columns and doesn't widen
            // the label column the previews line up against.
            className={cn(
              "relative cursor-pointer py-0.5 pl-11 text-left text-base outline-none",
              id === "reset" && "col-span-2",
            )}
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

          {id !== "reset" && (
            <Popover.Root
              open={open === id && part !== undefined}
              onOpenChange={(next) => !next && stepBack()}
            >
              <Popover.Anchor className="ml-11 flex flex-wrap items-center gap-x-11 gap-y-3 @min-[23rem]:gap-x-3">
                {preview(id)}
              </Popover.Anchor>

              <Popover.Portal>
                <Popover.Content
                  side="bottom"
                  align="start"
                  sideOffset={6}
                  collisionPadding={12}
                  // Presses inside this row are the row's (switching picks, or
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
                  {open === id && part && sliders(part)}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          )}
        </li>
      ))}
    </ul>
  );
};
