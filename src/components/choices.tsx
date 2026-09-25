import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { PixelHand, RowHand } from "./pixel-hand";

export type Choice = {
  label: string;
  href?: string;
  onSelect?: () => void;
  /** Id of the form this option submits. */
  submit?: string;
};

// FF7 dialogue choices: the hand marks the hovered or focused option; arrow keys move it.
// The menu is always waiting for input, so its hand always bobs.
// Rows use the dialogue's own line spacing, so choices read as its continuation.
// `boxed` is for choices inside a command window (a CornerBox): the hand points in from
// outside the box's left edge instead of taking room inside it. `onPoint` hears which
// option the hand moves to (for help text).
export const Choices = ({
  items,
  boxed,
  onPoint,
}: {
  items: Choice[];
  boxed?: boolean;
  onPoint?: (index: number) => void;
}) => {
  const [active, setActive] = useState(0);

  const move = (event: KeyboardEvent<HTMLUListElement>) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const options =
      event.currentTarget.querySelectorAll<HTMLElement>("a, button");
    options[(active + step + options.length) % options.length]?.focus();
  };

  // Plain left clicks go through onSelect; modified clicks keep normal link behavior.
  const onLinkClick = (event: MouseEvent, item: Choice) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
      return;
    event.preventDefault();
    item.onSelect?.();
  };

  const list = (
    <ul
      className="flex flex-col"
      onKeyDown={move}
    >
      {items.map((item, i) => {
        const props = {
          onMouseEnter: () => {
            setActive(i);
            onPoint?.(i);
          },
          onFocus: () => {
            setActive(i);
            onPoint?.(i);
          },
          className: `relative flex w-fit cursor-pointer items-center font-heading text-lg leading-snug text-foreground outline-none ${boxed ? "" : "pl-7"}`,
        };
        const body = (
          <>
            {boxed ? (
              i === active && (
                <PixelHand className="absolute right-full mr-2 motion-safe:animate-bob" />
              )
            ) : (
              <RowHand
                show={i === active}
                bob
              />
            )}
            {item.label}
          </>
        );
        return (
          <li key={item.label}>
            {item.href ? (
              <a
                {...props}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => onLinkClick(event, item)}
              >
                {body}
              </a>
            ) : (
              <button
                {...props}
                type={item.submit ? "submit" : "button"}
                form={item.submit}
                onClick={item.onSelect}
              >
                {body}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );

  return list;
};
