import { useEffect, useState } from "react";
import { Popover } from "radix-ui";
import { cn } from "@/lib/utils";
import { PixelHand, RowHand } from "../pixel-hand";
import { canHoverQuery, useMedia } from "@/lib/use-media";
import { WindowHeader } from "../window";

const corners = [
  { key: "tl", label: "Top left", fallback: "#4a3f6b" },
  { key: "tr", label: "Top right", fallback: "#2f284a" },
  { key: "bl", label: "Bottom left", fallback: "#2f284a" },
  { key: "br", label: "Bottom right", fallback: "#15112a" },
] as const;

const textColors = [
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

const load = (): Colors => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");

    if (
      ["[244,211,94]", "[254,254,90]", "[212,175,55]"].includes(
        JSON.stringify(saved?.highlight),
      )
    )
      saved.highlight = defaults.highlight;

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

const help: Record<Setting, string> = {
  window: "Select colors for each corner of the window",
  text: "Select colors for each text type",
  reset: "Select to reset configs to default",
};

const labelFor = (key: ColorKey) =>
  all.find((c) => c.key === key)!.label.toLowerCase();

export const Config = () => {
  const [colors, setColors] = useState(load);
  const [hovered, setHovered] = useState<Setting>();
  const [open, setOpen] = useState<Setting>();
  const [part, setPart] = useState<ColorKey>();
  const [pointedPart, setPointedPart] = useState<ColorKey>();
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

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") stepBack();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

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
          <PixelHand className="absolute inset-y-0 right-full my-auto mr-2 motion-safe:animate-bob" />
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

  const partHand = (className: string) => (
    <PixelHand
      className={cn(
        "pointer-events-none absolute z-10",
        className,
        (!part || (pointedPart && pointedPart !== part)) &&
        "motion-safe:animate-bob",
      )}
    />
  );

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
            className="window-bg bevel h-9 w-25 shrink-0 @min-[21rem]:w-21"
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
              className="bevel size-9 shrink-0"
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
        className="grid grid-cols-2 gap-x-7 gap-y-3 @min-[21rem]:grid-cols-4 @min-[21rem]:gap-x-3"
      >
        {textColors.map((c) => (
          <span
            key={c.key}
            title={c.label}
            className="bevel relative size-9 shrink-0"
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

  const canHover = useMedia(canHoverQuery);
  const resting = !canHover && !hovered && !open ? "window" : undefined;
  const pointed = hovered ?? open;

  return (
    <section className="flex flex-col gap-3">
      <WindowHeader
        title="Config"
        help={pointed ? help[pointed] : "Select option to customize site"}
      />
      <ul className="grid grid-cols-[auto_1fr] gap-y-2 font-heading">
        {settings.map(({ id, label }) => (
          <li
            key={id}
            data-setting={id}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(undefined)}
            onClick={(event) => {
              const target = event.target as Element;
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
              className={cn(
                "relative cursor-pointer py-0.5 pl-7 text-left text-base outline-none",
                id === "reset" && "col-span-2",
              )}
            >
              <RowHand
                show={hovered === id || open === id || resting === id}
                bob={(hovered === id && open !== id) || resting === id}
              />
              <span className="text-label">{label}</span>
            </button>

            {id !== "reset" && (
              <Popover.Root
                open={open === id && part !== undefined}
                onOpenChange={(next) => !next && stepBack()}
              >
                <Popover.Anchor className="ml-7 flex flex-wrap items-center gap-x-7 gap-y-3 @min-[21rem]:gap-x-3">
                  {preview(id)}
                </Popover.Anchor>

                <Popover.Portal>
                  <Popover.Content
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    collisionPadding={12}
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
    </section>
  );
};
