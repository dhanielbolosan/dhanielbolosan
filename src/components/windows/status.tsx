import { useEffect, useState } from "react";
import { clock, shortDate } from "@/lib/dates";
import { useLastSaved } from "@/lib/github";
import { avatarUrl, name, timeZone } from "@/lib/site";
import { Bar } from "../bar";
import { Stats } from "../stats";

// LV and the EXP bar are derived from this.
const birthday = { year: 2004, month: 3, day: 26 };

const stats: [string, string][] = [
  ["Role", "Full-Stack Engineer"],
  ["Origin", "Bacarra, Philippines"],
  ["Device", "ROG Zephyrus G16"],
  ["GPU", "RTX 5070 Ti"],
  ["OS", "CachyOS"],
  ["Avail", "Open to Work"],
];

const DAY = 24 * 60 * 60 * 1000;

// LV is your age; EXP is how far you are from your last birthday to your next. On
// the birthday itself the bar stays full all day, so its Limit Break plays.
const getLevel = (today = new Date()) => {
  const at = (year: number) => new Date(year, birthday.month - 1, birthday.day);
  const passed = at(today.getFullYear()) <= today;
  const last = at(today.getFullYear() - (passed ? 0 : 1));
  const next = at(last.getFullYear() + 1);
  const isBirthday =
    today.getMonth() === birthday.month - 1 && today.getDate() === birthday.day;
  return {
    level: last.getFullYear() - birthday.year,
    exp: isBirthday
      ? 1
      : (today.getTime() - last.getTime()) / (next.getTime() - last.getTime()),
    daysLeft: Math.ceil((next.getTime() - today.getTime()) / DAY),
    // Total EXP: days lived.
    daysLived: Math.floor(
      (today.getTime() - at(birthday.year).getTime()) / DAY,
    ),
  };
};

// Ticks every second so the clock's seconds count up like FF7's.
const useNow = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

export const Status = () => {
  const now = useNow();
  const { level, exp, daysLeft, daysLived } = getLevel(now);
  const saved = useLastSaved();

  return (
    <section className="flex grow flex-col justify-between gap-3">
      <div className="flex items-start gap-3">
        {/* Same bevel as the windows; an img can't show inset shadows, so it gets a wrapper. */}
        <div className="bevel shrink-0 p-1.5">
          <img
            src={avatarUrl}
            alt="Dhaniel"
            className="size-24 rounded-[2px] object-cover"
          />
        </div>
        {/* Block (not flex) so the floated title wraps this column's content: the name
            flows around it, and anything past its bottom edge gets the full width. */}
        <div className="flow-root min-w-0 grow space-y-1.5 font-heading">
          <h2 className="window-title-float">Status</h2>
          <h1 className="text-2xl leading-tight font-semibold tracking-wide">
            {name}
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
            value={exp}
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
        pairs={stats}
        className="text-base"
        valueClassName="text-right font-semibold"
      />

      <p className="text-lg leading-relaxed">
        Aloha! I'm a full-stack software engineer based in Maui, Hawaiʻi with a
        passion for building impactful applications and tools utilizing modern
        technologies across AI, Cloud, and Web3.
      </p>

      <Stats
        pairs={[
          ["Local time", `${clock(now, timeZone)} HST`],
          [
            "Last saved",
            // Hawaiʻi time like the row above (GitHub reports UTC; this converts). A
            // fixed placeholder until (or unless) the latest push loads.
            <span title={saved?.repo}>
              {saved
                ? `${shortDate(saved.at, timeZone)} ${clock(saved.at, timeZone)}`
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
