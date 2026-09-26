import { cn } from "@/lib/utils";

export const Bar = ({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) => {
  const full = value >= 1;

  return (
    <span
      role="meter"
      aria-label={label}
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "block overflow-hidden rounded-[2px] border-2 border-[#c9c7dc] bg-[#1a1730] shadow-[0_0_0_1px_#15121a]",
        className,
      )}
    >
      {/* A full bar cycles the FF7 limit colors; cap its fill at 100%. */}
      <span
        className={cn(
          "block h-full bg-[linear-gradient(to_bottom,#da9b99_0%,#964746_15%,#ba8889_38%,#ecc3c5_52%,#d18a8b_64%,#bf7f81_82%,#b49797_100%)]",
          full && "motion-safe:animate-limit",
        )}
        style={{ width: `${Math.min(value, 1) * 100}%` }}
      />
    </span>
  );
};
