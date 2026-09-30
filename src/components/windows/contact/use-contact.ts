import { useCallback, useEffect, useState } from "react";
import { useWindowFade } from "@/lib/menu/window-fade";
import { redirectDelayMs, redirectResetMs } from "@/lib/motion";
import { useTypewriter } from "@/lib/typewriter/use-typewriter";
import type { Choice } from "../../choices";
import {
  contactLinks,
  dialogueLines,
  type ContactAction,
  type ContactMode,
} from "./contact.data";
import { getContactTransitionPhase } from "./contact.utils";
import { useContactForm } from "./use-contact-form";

// Coordinate form submission, dialogue, and faded screen changes.
export const useContact = () => {
  const [mode, setMode] = useState<ContactMode>("menu");
  const [dialogueText, setDialogueText] = useState(dialogueLines.menu);

  const [visibleDialogue, fullDialogue] = useTypewriter(
    dialogueText,
    undefined,
    mode,
  );

  const [pendingAction, setPendingAction] = useState<ContactAction>();
  const [pendingHref, setPendingHref] = useState<string>();

  const { fading, fadeTo } = useWindowFade();

  // Swap screens during fade-out, then start dialogue after fade-in finishes.
  const transitionToMode = useCallback(
    (next: ContactMode) =>
      fadeTo(
        () => {
          setMode(next);
          setDialogueText("");
        },
        () => setDialogueText(dialogueLines[next]),
      ),
    [fadeTo],
  );

  const { form, handleFormSubmit, turnstileRef } = useContactForm({
    active: mode === "form",
    setDialogueText,
    onSent: () => transitionToMode("sent"),
  });

  // Open queued links after the redirect dialogue, then restore the menu.
  useEffect(() => {
    const href = pendingHref;

    // Wait for the redirect dialogue to finish before starting the link timers.
    if (
      !href ||
      dialogueText !== dialogueLines.redirect ||
      visibleDialogue !== dialogueText
    )
      return;

    const openTimer = setTimeout(() => {
      const tab = window.open(href, "_blank");
      if (tab) tab.opener = null;
      // Fall back to this page when the browser blocks the new tab.
      else window.location.href = href;
    }, redirectDelayMs);

    // Restore the menu after opening the link.
    const resetTimer = setTimeout(() => {
      setPendingHref(undefined);
      setDialogueText(dialogueLines.menu);
    }, redirectResetMs);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(resetTimer);
    };
  }, [dialogueText, visibleDialogue, pendingHref]);

  // Queue navigation; Back starts erasing immediately because it has no menu choices.
  const queueAction = (action: ContactAction) => {
    setPendingAction(action);
    if (action.type === "back") setDialogueText("");
  };

  const backChoice: Choice = {
    label: "Back",
    onSelect: () => queueAction({ type: "back" }),
  };

  // Route link selections through the dialogue sequence.
  const menuChoices: Choice[] = [
    {
      label: "Leave a message",
      onSelect: () => queueAction({ type: "form" }),
    },
    ...contactLinks.map(({ label, href }) => ({
      label,
      href,
      onSelect: () => queueAction({ type: "redirect", href }),
    })),
  ];

  // Type menu choices only after the opening dialogue and fades have finished.
  const menuReady =
    mode === "menu" &&
    dialogueText === dialogueLines.menu &&
    visibleDialogue === dialogueText &&
    !pendingAction &&
    !fading;
  const [visibleResponses] = useTypewriter(
    menuReady ? menuChoices.map((item) => item.label).join("\n") : "",
  );

  // Advance queued actions through choice erasure, dialogue erasure, and navigation.
  useEffect(() => {
    // Erase choices before dialogue, then fade to the next screen.
    const phase = getContactTransitionPhase(
      pendingAction,
      visibleResponses,
      dialogueText,
      visibleDialogue,
    );

    if (!phase || !pendingAction) return;

    if (phase === "erase-dialogue") {
      const frame = requestAnimationFrame(() => setDialogueText(""));

      return () => cancelAnimationFrame(frame);
    }

    const frame = requestAnimationFrame(() => {
      setPendingAction(undefined);
      if (pendingAction.type === "form") transitionToMode("form");
      else if (pendingAction.type === "back") transitionToMode("menu");
      else {
        setPendingHref(pendingAction.href);
        setDialogueText(dialogueLines.redirect);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [
    pendingAction,
    visibleResponses,
    visibleDialogue,
    dialogueText,
    transitionToMode,
  ]);

  const commands: Choice[] | undefined = {
    menu: undefined,
    form: [{ label: "Send", submit: "contact-form" }, backChoice],
    sent: [backChoice],
  }[mode];

  // Reserve space for every message that can appear in the current screen.
  const reservedDialogueLines =
    dialogueText === dialogueLines.redirect
      ? [dialogueLines.redirect]
      : {
          menu: [dialogueLines.menu],
          form: [
            dialogueLines.form,
            dialogueLines.sending,
            dialogueLines.failed,
            dialogueLines.allErrors,
          ],
          sent: [dialogueLines.sent],
        }[mode];

  // Enable commands only after dialogue finishes, with no pending transition.
  const choicesReady =
    !!dialogueText &&
    visibleDialogue === dialogueText &&
    !pendingAction &&
    !form.formState.isSubmitting &&
    !fading;

  return {
    mode,
    dialogueText,
    visibleDialogue,
    fullDialogue,
    reservedDialogueLines,
    form,
    handleFormSubmit,
    turnstileRef,
    commands,
    choicesReady,
    menuChoices,
    menuReady,
    visibleResponses,
  };
};
