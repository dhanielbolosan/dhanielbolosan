import { useRef, type SubmitEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { playSound } from "@/lib/audio";
import { contactSchema, type ContactFields } from "@/lib/integrations/contact";
import { dialogueLines } from "./contact.data";
import { formatMissingFields } from "./contact.utils";
import { useTurnstile } from "./use-turnstile";

// Validate and send the message form, reporting progress through the dialogue.
export const useContactForm = ({
  active,
  setDialogueText,
  onSent,
}: {
  active: boolean;
  setDialogueText: (text: string) => void;
  onSent: () => void;
}) => {
  const form = useForm<ContactFields>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });
  const submitting = useRef(false);
  const turnstile = useTurnstile(active);

  // Submit the validated message, then show confirmation or retry dialogue.
  const submitMessage = async (data: ContactFields) => {
    playSound("select");
    setDialogueText(dialogueLines.sending);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token: turnstile.token() }),
      });
      if (!response.ok) throw new Error();

      playSound("fanfare");
      form.reset();
      onSent();
    } catch {
      playSound("error");
      setDialogueText(dialogueLines.failed);
    } finally {
      turnstile.reset();
    }
  };

  // Turn field errors into one dialogue line.
  const handleValidationErrors = (
    fieldErrors: typeof form.formState.errors,
  ) => {
    playSound("error");
    setDialogueText(
      formatMissingFields(
        Object.values(fieldErrors).flatMap((error) =>
          error?.message ? [error.message] : [],
        ),
      ),
    );
  };

  // Block repeat submits, including implicit Enter, until validation and sending finish.
  const handleFormSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;

    try {
      await form.handleSubmit(submitMessage, handleValidationErrors)(event);
    } finally {
      submitting.current = false;
    }
  };

  return { form, handleFormSubmit, turnstileRef: turnstile.ref };
};
