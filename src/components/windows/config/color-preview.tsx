import { PixelHand } from "../../pixel-hand";
import { cn } from "@/lib/utils";
import {
  corners,
  textColors,
  cornerHandPositions,
  type Setting,
  type ColorKey,
  type Corner,
} from "./config.data";
import { rgbToHex } from "./config.utils";
import type { ConfigState } from "./use-config";

export const ColorPreview = ({
  id,
  config,
}: {
  id: Setting;
  config: ConfigState;
}) => {
  const {
    colors,
    openSetting,
    selectedColorKey,
    hoveredColorKey,
    setHoveredColorKey,
    lastColorKeys,
    selectColor,
  } = config;

  // Overlay a selectable radio button on a corner or color swatch.
  const renderColorButton = (
    key: ColorKey,
    label: string,
    className: string,
  ) => (
    <button
      key={key}
      type="button"
      role="radio"
      aria-checked={selectedColorKey === key}
      aria-label={label}
      onClick={() => {
        selectColor(key);
      }}
      onMouseEnter={() => setHoveredColorKey(key)}
      onFocus={() => setHoveredColorKey(key)}
      onBlur={() => setHoveredColorKey(undefined)}
      className={cn(
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    />
  );

  // Bob while choosing a color; keep the hand still on the selected color.
  const renderColorHand = (className: string) => (
    <PixelHand
      className={cn(
        "pointer-events-none absolute z-10",
        className,
        (!selectedColorKey ||
          (hoveredColorKey && hoveredColorKey !== selectedColorKey)) &&
          "motion-safe:animate-bob",
      )}
    />
  );

  const active = openSetting === id;

  // Point at hover first, then the selected color, then the last used color.
  const handAt = hoveredColorKey ?? selectedColorKey ?? lastColorKeys[id];

  if (id === "window")
    return (
      <>
        <div
          role={active ? "radiogroup" : undefined}
          aria-label={active ? "Window corner" : undefined}
          onMouseLeave={() => setHoveredColorKey(undefined)}
          className="window-bg bevel h-9 w-25 shrink-0 @min-[21rem]:w-21"
        >
          {/* Invisible buttons use t/b and l/r keys to cover each gradient corner. */}
          {active &&
            corners.map((corner) =>
              renderColorButton(
                corner.key,
                `${corner.label} corner`,
                cn(
                  "absolute h-1/2 w-1/2",
                  corner.key[0] === "t" ? "top-0" : "bottom-0",
                  corner.key[1] === "l" ? "left-0" : "right-0",
                ),
              ),
            )}

          {active && renderColorHand(cornerHandPositions[handAt as Corner])}
        </div>

        {active && selectedColorKey && (
          <span
            aria-hidden="true"
            className="bevel size-9 shrink-0"
            style={{ background: rgbToHex(colors[selectedColorKey]) }}
          />
        )}
      </>
    );

  if (id === "reset") return null;

  return (
    <div
      role={active ? "radiogroup" : undefined}
      aria-label={active ? "Text color" : undefined}
      onMouseLeave={() => setHoveredColorKey(undefined)}
      className="grid grid-cols-2 gap-x-7 gap-y-3 @min-[21rem]:grid-cols-4 @min-[21rem]:gap-x-3"
    >
      {textColors.map((colorDefinition) => (
        <span
          key={colorDefinition.key}
          title={colorDefinition.label}
          className="bevel relative size-9 shrink-0"
          style={{ background: rgbToHex(colors[colorDefinition.key]) }}
        >
          {active &&
            renderColorButton(
              colorDefinition.key,
              `${colorDefinition.label} color`,
              "absolute inset-0",
            )}

          {active &&
            handAt === colorDefinition.key &&
            renderColorHand("inset-y-0 right-full my-auto mr-2")}
        </span>
      ))}
    </div>
  );
};
