import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { PixelHand, RowHand } from "./pixel-hand";

export type Choice = {
  label: string;
  href?: string;
  onSelect?: () => void;
  submit?: string;
};

export const Choices = ({
  items,
  boxed,
  onPoint,
  ready = true,
  typedChars,
}: {
  items: Choice[];
  boxed?: boolean;
  onPoint?: (index: number) => void;
  ready?: boolean;
  typedChars?: number;
}) => {
  const [active, setActive] = useState(0);
  const available =
    ready &&
    (typedChars === undefined ||
      typedChars >= items.map((item) => item.label).join("\n").length);

  const move = (event: KeyboardEvent<HTMLUListElement>) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const options =
      event.currentTarget.querySelectorAll<HTMLElement>("a, button");
    options[(active + step + options.length) % options.length]?.focus();
  };

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
      inert={!available}
    >
      {items.map((item, i) => {
        const start = items
          .slice(0, i)
          .reduce((count, prior) => count + prior.label.length + 1, 0);

        const visible =
          typedChars === undefined
            ? item.label.length
            : Math.max(0, Math.min(item.label.length, typedChars - start));

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
              available &&
              i === active && (
                <PixelHand className="absolute right-full mr-2 motion-safe:animate-bob" />
              )
            ) : (
              <RowHand
                show={available && i === active}
                bob
              />
            )}
            {item.label.slice(0, visible)}
            {visible < item.label.length && (
              <span className="invisible">{item.label.slice(visible)}</span>
            )}
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
