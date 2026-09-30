import type { ReactNode } from "react";
import { RowHand } from "./pixel-hand";

// A gold link that opens in a new tab; the hand points at it on hover and focus, like every row.
export const TextLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="group relative text-gold underline underline-offset-2 outline-none"
  >
    {/* Sit where a row's hand sits: one hand lane (26px) left of the text, bobbing. */}
    <RowHand
      show={false}
      bob
      className="-left-6.5 group-hover:visible group-focus-visible:visible"
    />
    {children}
  </a>
);
