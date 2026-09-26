import { contactErrors } from "@/lib/contact";
import { formatMissingFields } from "./contact.utils";

export type ContactMode = "menu" | "form" | "sent";
export type ContactAction =
  | { type: "form" }
  | { type: "redirect"; href: string }
  | { type: "back" };

export const redirectDelayMs = 400;
export const redirectResetMs = 1800;

export const dialogueLines = {
  menu: "I'm always open to discussing new projects, opportunities, or just talking. How would you like to reach out?",
  form: "Leave your name, email, and a\u00a0message. I'll get back to you ASAP!",
  sending: "Sending…",
  sent: "Message sent, I'll get back to you soon!",
  failed: "Something went wrong. Try again?",
  redirect: "Got it, redirecting now!",
  allErrors: formatMissingFields(Object.values(contactErrors)),
};
