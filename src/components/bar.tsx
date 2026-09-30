import { cn } from "@/lib/utils";

// An FF7 gauge, such as HP or project progress, filled from 0 to 1.
export const Bar = ({
  value,
  label,
  className,
  fillClassName,
}: {
  value: number;
  label: string;
  className?: string;
  fillClassName?: string;
}) => {
  const progress = Number.isFinite(value) ? Math.max(0, Math.min(value, 1)) : 0;
  const full = progress === 1;

  return (
    <span
      role="meter"
      aria-label={label}
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "block overflow-hidden rounded-[2px] border-2 border-(--track-border) bg-(--track) shadow-[0_0_0_1px_var(--track-outline)]",
        className,
      )}
    >
      {/* A full bar cycles the FF7 limit colors; cap its fill at 100%. */}
      <span
        className={cn(
          "block h-full bg-[linear-gradient(to_bottom,#da9b99_0%,#964746_15%,#ba8889_38%,#ecc3c5_52%,#d18a8b_64%,#bf7f81_82%,#b49797_100%)]",
          fillClassName,
          full && !fillClassName && "motion-safe:animate-limit",
        )}
        style={{ width: `${progress * 100}%` }}
      />
    </span>
  );
};
