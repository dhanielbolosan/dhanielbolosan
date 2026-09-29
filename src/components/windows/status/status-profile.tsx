import { useEffect, useRef } from "react";
import { avatarUrl, displayName } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Bar } from "../../bar";
import { ImageFrame } from "../../image-frame";
import { PixelHand } from "../../pixel-hand";
import { maxLimit } from "./status.data";
import { calculatePortraitResources, healthStatus } from "./status.utils";
import { usePortrait } from "./use-portrait";

export const StatusProfile = ({
  level,
  experienceProgress,
}: {
  level: number;
  experienceProgress: number;
}) => {
  // Use age for LV and Aerith's corresponding resource growth for HP and MP.
  const { maxHealth, maxMana } = calculatePortraitResources(level);
  const { health, hit, attack, limit, useLimit } = usePortrait(maxHealth);
  const condition = healthStatus(health, maxHealth);
  const portraitRef = useRef<HTMLDivElement>(null);

  // Restart the frame animation without remounting its image.
  useEffect(() => {
    if (hit && !hit.recovery)
      portraitRef.current?.getAnimations().forEach((animation) => {
        animation.currentTime = 0;
        animation.play();
      });
  }, [hit]);

  return (
    <div className="flow-root font-heading">
      <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] items-start gap-x-2 gap-y-1 @min-[22rem]:gap-x-3">
        {/* Portrait */}
        <div className="row-span-2 flex flex-col items-center gap-1">
          <button
            type="button"
            data-sound="none"
            aria-label={
              health ? "Attack Dhaniel's portrait" : "Dhaniel is knocked out"
            }
            aria-disabled={!health}
            title={health ? "Hit Me!" : "x_x"}
            onClick={attack}
            className="relative block size-27 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div
              ref={portraitRef}
              className={cn(
                "size-full",
                hit && !hit.recovery && "portrait-hit",
              )}
            >
              <ImageFrame className="size-full">
                <img
                  src={avatarUrl}
                  alt="Dhaniel"
                  width={108}
                  height={108}
                  className={cn(
                    "size-full object-cover",
                    !health && "grayscale opacity-50",
                  )}
                />
              </ImageFrame>
            </div>

            {/* Damage and recovery numbers */}
            {hit && (
              <span
                key={hit.id}
                aria-hidden="true"
                className={cn(
                  "damage-number pointer-events-none absolute top-1 left-1/2 z-10 -translate-x-1/2 text-2xl font-bold tabular-nums [text-shadow:2px_2px_0_#000]",
                  hit.recovery ? "text-[#70ff80]" : "text-white",
                )}
              >
                {hit.amount}
              </span>
            )}
          </button>
        </div>

        {/* Header */}
        <div className="flow-root min-w-0">
          <h2 className="window-title-float">Status</h2>
          <h1 className="text-xl leading-tight font-semibold tracking-wide">
            {displayName}
          </h1>
        </div>

        {/* Combat stats and progression */}
        <div className="col-start-2 grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-end gap-x-1 gap-y-0.5 self-end text-sm leading-4 @min-[22rem]:grid-cols-[minmax(7rem,1fr)_minmax(0,1.2fr)] @min-[22rem]:gap-x-2">
          {/* LV, HP, and MP */}
          <div className="row-span-3 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-subgrid items-end gap-x-1 self-stretch">
            {/* Age level */}
            <span className="text-label leading-none">LV</span>
            <span className="text-lg leading-none font-semibold tabular-nums">
              {level}
            </span>

            {/* Health total and meter */}
            <span className="text-label leading-none">HP</span>
            <span className="block text-right leading-4 font-semibold whitespace-nowrap tabular-nums">
              <span
                className={cn(
                  condition === "critical" && "text-[#ffff60]",
                  !health && "text-[#ff6060]",
                )}
              >
                {health}
              </span>
              <span className="@max-[22rem]:sr-only"> / {maxHealth}</span>
              <Bar
                value={health / maxHealth}
                label="HP remaining"
                className="mt-1 h-0.5 rounded-none border-0 shadow-none"
                fillClassName="bg-[linear-gradient(to_right,#4f8fd4,#c6cded)]"
              />
            </span>

            {/* Magic total and meter */}
            <span className="text-label leading-none">MP</span>
            <span className="block text-right leading-4 font-semibold whitespace-nowrap tabular-nums">
              <span>
                {maxMana}
                <span className="@max-[22rem]:sr-only"> / {maxMana}</span>
              </span>
              <Bar
                value={1}
                label="MP remaining"
                className="mt-1 h-0.5 rounded-none border-0 shadow-none"
                fillClassName="bg-[linear-gradient(to_right,#63d9c1,#c6cded)]"
              />
            </span>
          </div>

          {/* Shared grid rows align birthday and Limit bars with HP and MP. */}
          <div className="col-start-2 row-span-2 row-start-2 ml-7 grid min-w-0 grid-rows-subgrid items-end self-stretch">
            {/* Birthday progress */}
            <div className="min-w-0 space-y-1">
              <span className="block text-xs leading-none">next level</span>
              <Bar
                value={experienceProgress}
                label="EXP to next birthday"
                className="h-2.5"
              />
            </div>

            {/* Full-heal Limit */}
            <button
              type="button"
              data-sound="none"
              aria-label="Restore full HP with Limit"
              disabled={limit < maxLimit}
              title={
                limit === maxLimit
                  ? "Restore full HP, including from KO"
                  : "Take damage to charge Limit"
              }
              onClick={useLimit}
              className={cn(
                "min-w-0 space-y-1 text-left outline-none enabled:hover:brightness-125 focus-visible:ring-2 focus-visible:ring-ring",
                limit === maxLimit && "cursor-pointer",
              )}
            >
              <span className="block text-xs leading-none">
                Limit level <span className="font-semibold">1</span>
              </span>
              <span className="relative block">
                <Bar
                  value={limit / maxLimit}
                  label="Limit gauge"
                  className="h-2.5"
                />

                {/* Full Limit pointer */}
                {limit === maxLimit && (
                  <PixelHand className="pointer-events-none absolute top-1/2 right-full mr-2 -translate-y-1/2 motion-safe:animate-bob" />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Announce health and Limit readiness without reading each animation frame. */}
      <p
        role="status"
        className="sr-only"
      >
        {health} of {maxHealth} HP
        {!health && ". Knocked out."}
        {limit === maxLimit
          ? ". Limit is ready. Activate it to restore full HP."
          : !health
            ? " Refresh to reset HP."
            : ""}
      </p>
    </div>
  );
};
