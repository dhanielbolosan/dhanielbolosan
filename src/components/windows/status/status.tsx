import { useEffect, useRef } from "react";
import { formatTime, formatShortDate } from "@/lib/dates";
import { avatarUrl, displayName, timeZone } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Bar } from "../../bar";
import { ImageFrame } from "../../image-frame";
import { PixelHand } from "../../pixel-hand";
import { Stats } from "../../stats";
import { profileStats, maxHealth, maxMana } from "./status.data";
import { healthStatus } from "./status.utils";
import { useStatus } from "./use-status";

export const Status = () => {
  const {
    now,
    level,
    experienceProgress,
    latestPush,
    health,
    hit,
    attack,
    limit,
    useLimit,
  } = useStatus();
  const portraitRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (hit && !hit.recovery)
      portraitRef.current?.getAnimations().forEach((animation) => {
        animation.currentTime = 0;
        animation.play();
      });
  }, [hit]);

  return (
    <section className="flex grow flex-col justify-between gap-3">
      <div className="flow-root font-heading">
        <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] items-start gap-x-2 gap-y-1 @min-[22rem]:gap-x-3">
          <div className="row-span-2 flex flex-col items-center gap-1">
            <button
              type="button"
              data-sound="none"
              aria-label={
                health ? "Attack Dhaniel's portrait" : "Dhaniel is knocked out"
              }
              aria-disabled={!health}
              title={health ? "Attack" : "KO"}
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
                    className={cn(
                      "size-full object-cover",
                      !health && "grayscale opacity-50",
                    )}
                  />
                </ImageFrame>
              </div>
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

          <div className="flow-root min-w-0">
            <h2 className="window-title-float">Status</h2>
            <h1 className="text-xl leading-tight font-semibold tracking-wide">
              {displayName}
            </h1>
          </div>

          <div className="col-start-2 grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-end gap-x-1 gap-y-0.5 self-end text-sm leading-4 @min-[22rem]:gap-x-2">
            <div className="row-span-3 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-subgrid items-end gap-x-1 self-stretch">
              <span className="text-label leading-none">LV</span>
              <span className="text-lg leading-none font-semibold tabular-nums">
                {level}
              </span>
              <span className="text-label leading-none">HP</span>
              <span className="block text-right leading-4 font-semibold whitespace-nowrap tabular-nums">
                <span
                  className={cn(
                    healthStatus(health, maxHealth) === "critical" &&
                      "text-[#ffff60]",
                    !health && "text-[#ff6060]",
                  )}
                >
                  {health}
                </span>
                <span> / {maxHealth}</span>
                <Bar
                  value={health / maxHealth}
                  label="HP remaining"
                  className="mt-1 h-0.5 rounded-none border-0 shadow-none"
                  fillClassName="bg-[linear-gradient(to_right,#4f8fd4,#c6cded)]"
                />
              </span>
              <span className="text-label leading-none">MP</span>
              <span className="block text-right leading-4 font-semibold whitespace-nowrap tabular-nums">
                <span>
                  {maxMana} / {maxMana}
                </span>
                <Bar
                  value={1}
                  label="MP remaining"
                  className="mt-1 h-0.5 rounded-none border-0 shadow-none"
                  fillClassName="bg-[linear-gradient(to_right,#63d9c1,#c6cded)]"
                />
              </span>
            </div>

            <div className="col-start-2 row-span-2 row-start-2 ml-7 grid min-w-0 grid-rows-subgrid items-end self-stretch">
              <div className="min-w-0 space-y-1">
                <span className="block text-xs leading-none">next level</span>
                <Bar
                  value={experienceProgress}
                  label="EXP to next birthday"
                  className="h-2.5"
                />
              </div>
              <button
                type="button"
                data-sound="none"
                aria-label="Restore full HP with Limit"
                disabled={limit < 255}
                title={
                  limit === 255
                    ? "Restore full HP, including from KO"
                    : "Take damage to charge Limit"
                }
                onClick={useLimit}
                className={cn(
                  "min-w-0 space-y-1 text-left outline-none enabled:hover:brightness-125 focus-visible:ring-2 focus-visible:ring-ring",
                  limit === 255 && "cursor-pointer",
                )}
              >
                <span className="block text-xs leading-none">
                  Limit level <span className="font-semibold">4</span>
                </span>
                <span className="relative block">
                  <Bar
                    value={limit / 255}
                    label="Limit gauge"
                    className="h-2.5"
                  />
                  {limit === 255 && (
                    <PixelHand className="pointer-events-none absolute top-1/2 right-full mr-2 -translate-y-1/2 motion-safe:animate-bob" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
        <p
          role="status"
          className="sr-only"
        >
          {health} of {maxHealth} HP
          {!health && ". Knocked out."}
          {limit === 255
            ? ". Limit is ready. Activate it to restore full HP."
            : !health
              ? " Refresh to reset HP."
              : ""}
        </p>
      </div>

      <Stats
        pairs={profileStats}
        className="text-base"
        valueClassName="text-right font-semibold"
      />

      <p className="text-lg leading-relaxed">
        Aloha! I'm a full-stack software engineer based in Maui, Hawaiʻi with a
        passion for building impactful applications and tools utilizing modern
        technologies across AI, Cloud, and Web3.
      </p>

      {/* Local clock and latest GitHub push */}
      <Stats
        pairs={[
          ["Local time", `${formatTime(now, timeZone)} HST`],

          [
            "Last saved",
            <span title={latestPush?.repo}>
              {latestPush
                ? `${formatShortDate(latestPush.at, timeZone)} ${formatTime(latestPush.at, timeZone)}`
                : "Jan 01 00:00:00"}{" "}
              HST
            </span>,
          ],
        ]}
        valueClassName="text-right tabular-nums"
      />
    </section>
  );
};
