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
  initialChoiceIndex = 0,
}: {
  items: Choice[];
  boxed?: boolean;
  onPoint?: (index: number) => void;
  ready?: boolean;
  typedChars?: number;
  initialChoiceIndex?: number;
}) => {
  const [activeChoiceIndex, setActiveChoiceIndex] =
    useState(initialChoiceIndex);

  // Enable choices only when the parent is ready and all labels have finished typing.
  const isInteractive =
    ready &&
    (typedChars === undefined ||
      typedChars >= items.map((item) => item.label).join("\n").length);

  // Move focus with arrow keys, wrapping between the first and last choices.
  const handleArrowNavigation = (event: KeyboardEvent<HTMLUListElement>) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (!step) return;

    event.preventDefault();
    const options =
      event.currentTarget.querySelectorAll<HTMLElement>("a, button");
    options[
      (activeChoiceIndex + step + options.length) % options.length
    ]?.focus();
  };

  // Keep modified clicks native; route ordinary clicks through the choice action.
  const onLinkClick = (event: MouseEvent, item: Choice) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
      return;

    event.preventDefault();
    item.onSelect?.();
  };

  return (
    <ul
      className="flex flex-col"
      onKeyDown={handleArrowNavigation}
      inert={!isInteractive}
    >
      {items.map((item, choiceIndex) => {
        // Count preceding labels and newlines within the combined typewriter text.
        const labelCharacterOffset = items
          .slice(0, choiceIndex)
          .reduce((count, prior) => count + prior.label.length + 1, 0);

        // Convert the combined character count into this label's visible portion.
        const visibleCharacterCount =
          typedChars === undefined
            ? item.label.length
            : Math.max(
                0,
                Math.min(item.label.length, typedChars - labelCharacterOffset),
              );

        const props = {
          onMouseEnter: () => {
            setActiveChoiceIndex(choiceIndex);
            onPoint?.(choiceIndex);
          },
          onFocus: () => {
            setActiveChoiceIndex(choiceIndex);
            onPoint?.(choiceIndex);
          },
          className: `relative flex w-fit cursor-pointer items-center font-heading text-lg leading-snug text-foreground outline-none ${boxed ? "" : "pl-7"}`,
        };

        const body = (
          <>
            {/* Show the hand after the choices finish typing. */}
            {boxed ? (
              isInteractive &&
              choiceIndex === activeChoiceIndex && (
                <PixelHand className="absolute right-full mr-2 motion-safe:animate-bob" />
              )
            ) : (
              <RowHand
                show={isInteractive && choiceIndex === activeChoiceIndex}
                bob
              />
            )}

            {item.label.slice(0, visibleCharacterCount)}

            {/* Keep untyped text in place to prevent layout shifts. */}
            {visibleCharacterCount < item.label.length && (
              <span className="invisible">
                {item.label.slice(visibleCharacterCount)}
              </span>
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
};
