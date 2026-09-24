import { cn } from "@/lib/utils";

// FF7-style gauge: light frame, dark track, red-pink fill with a vertical shine.
// A full gauge cycles colors like FF7's Limit bar when a Limit Break is ready.
export const Bar = ({
  value,
  label,
  className,
}: {
  /** 0 to 1. */
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
