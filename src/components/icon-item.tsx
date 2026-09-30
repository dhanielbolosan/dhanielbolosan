import type { ReactNode } from "react";

// A list row with an icon and a label that truncates in narrow columns.
export const IconItem = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: string;
}) => (
  <li className="flex min-w-0 items-center gap-1.5">
    {icon}

    <span className="truncate">{children}</span>
  </li>
);
