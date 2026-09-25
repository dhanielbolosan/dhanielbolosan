import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// FF7 status-card stats: teal labels, white values. Two columns (label, value) or four
// (two pairs per row, filling row by row).
export const Stats = ({
  pairs,
  columns = 2,
  className,
  valueClassName,
}: {
  pairs: readonly (readonly [label: string, value: ReactNode])[];
  columns?: 2 | 4;
  className?: string;
  valueClassName?: string;
}) => (
  <dl
    className={cn(
      "grid font-heading text-sm",
      columns === 4
        ? "grid-cols-[auto_1fr_auto_1fr] gap-x-3"
        : "grid-cols-[auto_1fr] gap-x-4",
      className,
    )}
  >
    {pairs.map(([label, value]) => (
      <div
        key={label}
        className="contents"
      >
        <dt className="text-label">{label}</dt>
        <dd className={valueClassName}>{value}</dd>
      </div>
    ))}
  </dl>
);
