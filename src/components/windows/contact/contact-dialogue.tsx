import { Faded } from "../../window";
import { keepLastWordsTogether } from "./contact.utils";

export const ContactDialogue = ({
  dialogueText,
  visibleDialogue,
  fullDialogue,
  reservedDialogueLines,
}: {
  dialogueText: string;
  visibleDialogue: string;
  fullDialogue: string;
  reservedDialogueLines: string[];
}) => {
  const quotedDialogue = `“${keepLastWordsTogether(fullDialogue)}”`;

  // Show the opening quote with the first letter and the closing quote at completion.
  const visibleCharacterCount = visibleDialogue
    ? visibleDialogue.length + 1 + (visibleDialogue === fullDialogue ? 1 : 0)
    : 0;

  const dialogueClassName =
    "col-start-1 row-start-1 pl-[0.4em] -indent-[0.4em] font-heading text-lg leading-snug";

  return (
    <Faded className="grid min-w-0 flex-1">
      {/* Reserve dialogue height before typing starts. */}
      {reservedDialogueLines.map((text) => (
        <div
          key={text}
          aria-hidden="true"
          inert
          className={`invisible ${dialogueClassName}`}
        >
          “{keepLastWordsTogether(text)}”
        </div>
      ))}

      <div className={dialogueClassName}>
        <span aria-hidden="true">
          {quotedDialogue.slice(0, visibleCharacterCount)}

          <span className="invisible">
            {quotedDialogue.slice(visibleCharacterCount)}
          </span>
        </span>
      </div>

      {/* Announce the full dialogue to screen readers. */}
      <p
        role="status"
        className="sr-only"
      >
        {dialogueText}
      </p>
    </Faded>
  );
};
