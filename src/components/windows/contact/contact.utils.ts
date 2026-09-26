import type { ContactAction } from "./contact.data";

// Join missing fields into a natural sentence with commas and a final "and".
export const formatMissingFields = (parts: string[]) =>
  `Hold on, I still need ${
    parts.length < 3
      ? parts.join(" and ")
      : `${parts.slice(0, -1).join(", ")}, and ${parts.at(-1)}`
  }!`;

// Replace the final space so the last two words wrap together.
export const keepLastWordsTogether = (text: string) =>
  text.replace(/ (?=\S+$)/, "\u00a0");

// Wait for choices to erase, then erase dialogue before allowing navigation.
export const getContactTransitionPhase = (
  action: ContactAction | undefined,
  visibleResponses: string,
  dialogueText: string,
  visibleDialogue: string,
) => {
  if (!action || visibleResponses) return;

  if (dialogueText && action.type !== "back") return "erase-dialogue";

  if (visibleDialogue) return;

  return "navigate";
};
