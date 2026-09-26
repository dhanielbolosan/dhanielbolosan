import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { contactSchema, type ContactFields } from "@/lib/contact";
import type { Choice } from "../../choices";
import { useWindowFade } from "@/lib/window-fade";
import { useTypewriter } from "@/lib/use-typewriter";
import {
  dialogueLines,
  redirectDelayMs,
  redirectResetMs,
  type ContactAction,
  type ContactMode,
} from "./contact.data";
import {
  formatMissingFields,
  getContactTransitionPhase,
} from "./contact.utils";

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

  const form = useForm<ContactFields>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const { fading, fadeTo } = useWindowFade();

  // Swap screens during fade-out, then start dialogue after fade-in finishes.
  const transitionToMode = useCallback(
    (next: typeof mode) =>
      fadeTo(
        () => {
          setMode(next);
          setDialogueText("");
        },
        () => setDialogueText(dialogueLines[next]),
      ),
    [fadeTo],
  );

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

  // Submit the validated message, then show confirmation or retry dialogue.
  async function submitMessage(data: ContactFields) {
    setDialogueText(dialogueLines.sending);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();

      form.reset();
      transitionToMode("sent");
    } catch {
      setDialogueText(dialogueLines.failed);
    }
  }

  // Turn field errors into one dialogue line.
  const handleValidationErrors = (fieldErrors: typeof form.formState.errors) =>
    setDialogueText(
      formatMissingFields(
        Object.values(fieldErrors).flatMap((error) =>
          error?.message ? [error.message] : [],
        ),
      ),
    );

  // Queue navigation; Back starts erasing immediately because it has no menu choices.
  const queueAction = (action: ContactAction) => {
    setPendingAction(action);
    if (action.type === "back") setDialogueText("");
  };

  // Route ordinary link selections through the dialogue sequence.
  const createLinkChoice = (label: string, href: string): Choice => ({
    label,
    href,
    onSelect: () => queueAction({ type: "redirect", href }),
  });

  const menuChoices: Choice[] = [
    {
      label: "Leave a message",
      onSelect: () => queueAction({ type: "form" }),
    },
    createLinkChoice("GitHub", "https://github.com/dhanielbolosan"),
    createLinkChoice(
      "LinkedIn",
      "https://www.linkedin.com/in/dhaniel-bolosan/",
    ),
    createLinkChoice("Email", "mailto:dhanielb808@gmail.com"),
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

  const formCommands: Choice[] = [
    { label: "Send", submit: "contact-form" },
    { label: "Back", onSelect: () => queueAction({ type: "back" }) },
  ];
  const commands: Choice[] | undefined =
    mode === "form"
      ? formCommands
      : mode === "sent"
        ? [{ label: "Back", onSelect: () => queueAction({ type: "back" }) }]
        : undefined;

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
    !fading;

  return {
    mode,
    dialogueText,
    visibleDialogue,
    fullDialogue,
    reservedDialogueLines,
    form,
    handleFormSubmit: form.handleSubmit(submitMessage, handleValidationErrors),
    commands,
    choicesReady,
    menuChoices,
    menuReady,
    visibleResponses,
  };
};
