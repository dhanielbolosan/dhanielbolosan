import { useEffect, useState } from "react";
import { useTypewriter } from "@/lib/use-typewriter";

// LV and the EXP bar are derived from this.
const birthday = { year: 2004, month: 3, day: 26 };

const name = "Dhaniel Bolosan";

const githubUsername = "dhanielbolosan";

const stats = [
  ["Role", "Full-Stack Engineer"],
  ["Origin", "Bacarra, Philippines"],
  ["OS", "CachyOS"],
  ["Device", "ROG Zephyrus G16"],
  ["GPU", "RTX 5070 Ti"],
  ["Status", "Open to Work"],
];

const DAY = 24 * 60 * 60 * 1000;

// LV is your age; EXP is how far you are from your last birthday to your next.
const getLevel = (today = new Date()) => {
  const at = (year: number) => new Date(year, birthday.month - 1, birthday.day);
  const passed = at(today.getFullYear()) <= today;
  const last = at(today.getFullYear() - (passed ? 0 : 1));
  const next = at(last.getFullYear() + 1);
  return {
    level: last.getFullYear() - birthday.year,
    exp: (today.getTime() - last.getTime()) / (next.getTime() - last.getTime()),
    daysLeft: Math.ceil((next.getTime() - today.getTime()) / DAY),
    // Total EXP: days lived.
    daysLived: Math.floor(
      (today.getTime() - at(birthday.year).getTime()) / DAY,
    ),
  };
};

// Latest public push, from GitHub's events feed (no token needed, CORS allowed).
const useLastSaved = () => {
  const [saved, setSaved] = useState<{ at: Date; repo: string }>();

  useEffect(() => {
    const controller = new AbortController();
    void fetch(
      `https://api.github.com/users/${githubUsername}/events/public?per_page=30`,
      { signal: controller.signal },
    )
      .then((response) => (response.ok ? response.json() : []))
      .then(
        (
          events: {
            type: string;
            created_at: string;
            repo: { name: string };
          }[],
        ) => {
          const push = events.find((event) => event.type === "PushEvent");
          if (push)
            setSaved({ at: new Date(push.created_at), repo: push.repo.name });
        },
      )
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return saved;
};

const useNow = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  return now;
};

export const Hero = () => {
  const now = useNow();
  const { level, exp, daysLeft, daysLived } = getLevel(now);
  const saved = useLastSaved();
  const typedName = useTypewriter(name, 75);

  return (
    <section className="flex grow flex-col justify-between gap-4">
      <div className="flex items-start gap-4">
        {/* Same bevel as the windows; an img can't show inset shadows, so it gets a wrapper. */}
        <div className="shrink-0 rounded-[5px] p-1.5 [box-shadow:var(--frame-bevel)]">
          <img
            src="https://github.com/dhanielbolosan.png"
            alt="Dhaniel"
            className="size-24 rounded-[2px] object-cover"
          />
        </div>
        {/* Block (not flex) so the floated title wraps this column's content: the name
            flows around it, and anything past its bottom edge gets the full width. */}
        <div className="flow-root min-w-0 grow space-y-1.5 font-heading">
          <h2 className="window-title float-right -mt-5 mb-1 ml-3">Status</h2>
          {/* The untyped rest stays in place invisibly, so the name keeps its final
              width and wrapping while it types. */}
          <h1 className="text-2xl leading-tight font-semibold tracking-wide">
            <span aria-hidden="true">
              {typedName}
              <span className="invisible">{name.slice(typedName.length)}</span>
            </span>
            <span className="sr-only">{name}</span>
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
          {/* FF7 EXP bar: light frame, dark track, red-pink fill with a vertical shine. */}
          <span
            role="meter"
            aria-label="EXP to next level"
            aria-valuenow={Math.round(exp * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="block h-3.5 overflow-hidden rounded-[2px] border-2 border-[#c9c7dc] bg-[#1a1730] shadow-[0_0_0_1px_#15121a]"
          >
            <span
              className="block h-full bg-[linear-gradient(to_bottom,#da9b99_0%,#964746_15%,#ba8889_38%,#ecc3c5_52%,#d18a8b_64%,#bf7f81_82%,#b49797_100%)]"
              style={{ width: `${exp * 100}%` }}
            />
          </span>
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span>next level:</span>
            <span className="font-semibold tabular-nums">{daysLeft}d</span>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 font-heading text-base">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="contents"
          >
            <dt className="text-label">{label}</dt>
            <dd className="text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-base leading-relaxed">
        Aloha! I'm a full-stack software engineer based in Maui, Hawaiʻi with a
        passion for building impactful applications and tools utilizing modern
        technologies across AI, Cloud, and Web3.
      </p>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-frame/30 pt-3 font-heading text-sm">
        {/* Always Hawaiʻi time, not the visitor's; refreshes with useNow each minute. */}
        <dt className="text-label">Time</dt>
        <dd className="text-right font-semibold tabular-nums">
          {now.toLocaleTimeString("en-US", {
            timeZone: "Pacific/Honolulu",
            hour: "numeric",
            minute: "2-digit",
          })}{" "}
          HST
        </dd>
        <dt className="text-label">Last saved</dt>
        <dd
          className="text-right font-semibold"
          title={saved?.repo}
        >
          {saved
            ? saved.at.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : "—"}
        </dd>
      </dl>
    </section>
  );
};
