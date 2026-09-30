import { formatTime, formatShortDate } from "@/lib/dates";
import { timeZone } from "@/lib/site";
import { Stats } from "../../stats";
import { TextLink } from "../../text-link";
import { profileStats } from "./status.data";
import { StatusProfile } from "./status-profile";
import { useStatus } from "./use-status";

export const Status = () => {
  const { now, level, experienceProgress, latestPush } = useStatus();

  return (
    <section className="flex grow flex-col justify-between gap-3">
      {/* Profile, birthday progress, and interactive HP/Limit gauges */}
      <StatusProfile
        level={level}
        experienceProgress={experienceProgress}
      />

      {/* Personal details and the resume link */}
      <Stats
        pairs={[
          ...profileStats,
          [
            "Resume",
            <TextLink href="/Dhaniel_Bolosan_Resume.pdf">View</TextLink>,
          ],
        ]}
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
              {latestPush && (
                <span className="sr-only"> to {latestPush.repo}</span>
              )}
            </span>,
          ],
        ]}
        valueClassName="text-right tabular-nums"
      />
    </section>
  );
};
