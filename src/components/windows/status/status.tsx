import { formatTime, formatShortDate } from "@/lib/dates";
import { avatarUrl, displayName, timeZone } from "@/lib/site";
import { Bar } from "../../bar";
import { ImageFrame } from "../../image-frame";
import { Stats } from "../../stats";
import { profileStats } from "./status.data";
import { useStatus } from "./use-status";

export const Status = () => {
  const { now, level, experienceProgress, daysLeft, daysLived, latestPush } =
    useStatus();

  return (
    <section className="flex grow flex-col justify-between gap-3">
      {/* Profile and level progress */}
      <div className="flex items-start gap-3">
        <ImageFrame className="size-27 shrink-0">
          <img
            src={avatarUrl}
            alt="Dhaniel"
            className="size-full object-cover"
          />
        </ImageFrame>

        <div className="flow-root min-w-0 grow space-y-1.5 font-heading">
          <h2 className="window-title-float">Status</h2>

          <h1 className="text-2xl leading-tight font-semibold tracking-wide">
            {displayName}
          </h1>

          <div className="flex items-baseline justify-between gap-2">
            <span className="flex items-baseline gap-2">
              <span className="text-sm text-label">LV</span>

              <span className="text-2xl leading-none font-semibold">
                {level}
              </span>
            </span>

            <span className="text-sm">
              EXP:{" "}
              <span className="font-semibold tabular-nums">
                {daysLived.toLocaleString("en-US")}d
              </span>
            </span>
          </div>

          <Bar
            value={experienceProgress}
            label="EXP to next level"
            className="h-3.5"
          />

          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span>next level:</span>

            <span className="font-semibold tabular-nums">{daysLeft}d</span>
          </div>
        </div>
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
