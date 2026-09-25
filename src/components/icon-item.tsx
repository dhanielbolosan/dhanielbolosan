import type { ReactNode } from "react";

// One entry in an icon list (Skills, a project's stack): a 16px icon and a one-line
// name that ends in "…" when it's too long for its column.
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
