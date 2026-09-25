import { useEffect, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../imports/input";
import { Textarea } from "../imports/textarea";
import { Choices, type Choice } from "../choices";
import { useTypewriter } from "@/lib/use-typewriter";

// What the NPC still needs, per field; joined into one line by `missingLine`.
const errors = {
  name: "your name",
  email: "a valid email",
  // Short on purpose: the all-errors line must wrap no taller than the form's line,
  // or it leaves a gap above the form (the dialogue reserves its longest line).
  message: "a longer message",
};

const contactSchema = z.object({
  name: z.string().min(1, errors.name),
  email: z.email(errors.email),
  message: z.string().min(10, errors.message), // 10+ characters
});

// "your name" / "your name and a valid email" / "your name, a valid email, and a message…"
const missingLine = (parts: string[]) =>
  `Hold on! I still need ${
    parts.length < 3
      ? parts.join(" and ")
      : `${parts.slice(0, -1).join(", ")}, and ${parts.at(-1)}`
  }.`;

type ContactForm = z.infer<typeof contactSchema>;

const lines = {
  menu: "I'm always open to discussing new projects, opportunities, or just talking. How would you like to reach out?",
  form: "Leave your name, email, and a message. I'll get back to you ASAP!",
  sending: "Sending…",
  sent: "Message sent, I'll get back to you soon!",
  failed: "Something went wrong. Try again?",
  redirect: "Got it, redirecting now!",
  // Longest possible error line; only used to reserve the dialogue's height.
  allErrors: missingLine(Object.values(errors)),
};

const field =
  "rounded-[4px] border-frame/50 bg-black/30 font-heading text-base placeholder:text-muted-foreground/70 md:text-base";

export const Contact = () => {
  const [mode, setMode] = useState<"menu" | "form" | "sent">("menu");
  const [line, setLine] = useState(lines.menu);
  const [shown, typingLine] = useTypewriter(line);
  const [pendingHref, setPendingHref] = useState<string>();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const go = (next: typeof mode) => {
    setMode(next);
    setLine(lines[next]);
  };

  const redirect = (href: string) => {
    setPendingHref(href);
    setLine(lines.redirect);
  };

  // Once "redirecting" finishes typing: open the link, then return to the default line.
  // Chrome and Firefox allow opening a tab this long after the click; if a browser
  // blocks it, fall back to navigating this tab.
  useEffect(() => {
    const href = pendingHref;
    if (!href || line !== lines.redirect || shown !== line) return;
    const open = setTimeout(() => {
      const tab = window.open(href, "_blank");
      if (tab) tab.opener = null;
      else window.location.href = href;
    }, 400);
    const reset = setTimeout(() => {
      setPendingHref(undefined);
      setLine(lines.menu);
    }, 1800);
    return () => {
      clearTimeout(open);
      clearTimeout(reset);
    };
  }, [line, shown, pendingHref]);

  async function onSubmit(data: ContactForm) {
    setLine(lines.sending);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      form.reset();
      go("sent");
    } catch {
      setLine(lines.failed);
    }
  }

  // Validation problems are spoken in the dialogue instead of a toast. The form uses
  // noValidate so the browser's own popups don't preempt this.
  const onError = (fieldErrors: typeof form.formState.errors) =>
    setLine(
      missingLine(
        Object.values(fieldErrors).flatMap((error) =>
          error?.message ? [error.message] : [],
        ),
      ),
    );

  const link = (label: string, href: string): Choice => ({
    label,
    href,
    onSelect: () => redirect(href),
  });

  const formCommands: Choice[] = [
    { label: "Send", submit: "contact-form" },
    { label: "Back", onSelect: () => go("menu") },
  ];
  const commands: Choice[] | undefined =
    mode === "form"
      ? formCommands
      : mode === "sent"
        ? [{ label: "Back", onSelect: () => go("menu") }]
        : undefined;

  const reserved = {
    menu: [lines.menu, lines.redirect],
    form: [lines.form, lines.sending, lines.failed, lines.allErrors],
    sent: [lines.sent],
  };

  // Top-right corner, FF7-style: the title box, which the command box temporarily
  // replaces while there are commands. Flush with the frame, in its own column: the
  // dialogue stays beside it and never wraps underneath.
  const cornerFor = (items?: Choice[]) => (
    // The command box's hand points in from its left, so leave room for it there.
    <div className={`-mt-5 shrink-0 ${items ? "ml-11" : "ml-3"}`}>
      {items ? (
        <>
          <h2 className="sr-only">Contact</h2>
          <Choices
            boxed
            items={items}
            className="-mr-5"
          />
        </>
      ) : (
        <h2 className="window-title">Contact</h2>
      )}
    </div>
  );

  // The line being typed or erased, with its quotes, and how much of it shows: the
  // opening quote with the first letter, the closing one once the line is complete.
  const full = `“${typingLine}”`;
  const typed = shown ? shown.length + 1 + (shown === typingLine ? 1 : 0) : 0;

  const dialogue =
    "col-start-1 row-start-1 pl-[0.4em] -indent-[0.4em] font-heading text-lg leading-snug text-balance";

  return (
    <section className="flex grow flex-col">
      <div className="flex items-start">
        {/* Every line this screen can show is laid out invisibly in the same grid cell,
          so the box is as tall as its longest line and typing never shifts what's
          below. */}
        <div className="grid min-w-0 flex-1">
          {reserved[mode].map((text) => (
            <div
              key={text}
              aria-hidden="true"
              inert
              className={`invisible ${dialogue}`}
            >
              “{text}”
            </div>
          ))}
          <div className={dialogue}>
            {/* The rest of the line is laid out but invisible, so words keep their
              places instead of jumping lines while typing or erasing. */}
            <span aria-hidden="true">
              {full.slice(0, typed)}
              <span className="invisible">{full.slice(typed)}</span>
            </span>
          </div>
          {/* Screen readers get each whole line once, not every typed character. */}
          <p
            role="status"
            className="sr-only"
          >
            {line}
          </p>
        </div>
        {cornerFor(commands)}
      </div>

      {mode === "form" && (
        <form
          id="contact-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="mt-2 grid min-h-0 grow grid-cols-[auto_1fr] grid-rows-[auto_auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 font-heading"
        >
          <label
            htmlFor="contact-name"
            className="text-label"
          >
            Name
          </label>
          <Input
            id="contact-name"
            autoComplete="name"
            placeholder="John Doe"
            className={`h-10 ${field}`}
            {...form.register("name")}
          />
          <label
            htmlFor="contact-email"
            className="text-label"
          >
            Email
          </label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="example@gmail.com"
            className={`h-10 ${field}`}
            {...form.register("email")}
          />
          <label
            htmlFor="contact-message"
            className="self-start pt-2 text-label"
          >
            Message
          </label>
          {/* Starts small and grows with the message up to 304px (what fits the window at
              1080p); past that it scrolls inside, so the Contact window stays put. */}
          <Textarea
            id="contact-message"
            placeholder="Enter your message here"
            className={`max-h-76 min-h-24 self-start overflow-y-auto py-2 field-sizing-content ${field}`}
            {...form.register("message")}
          />
        </form>
      )}

      {/* Answer choices sit right under the dialogue, like FF7's. */}
      {mode === "menu" && (
        <div className="mt-2">
          <Choices
            items={[
              { label: "Leave a message", onSelect: () => go("form") },
              link("GitHub", "https://github.com/dhanielbolosan"),
              link("LinkedIn", "https://www.linkedin.com/in/dhaniel-bolosan/"),
              link("Email", "mailto:dhanielb808@gmail.com"),
            ]}
          />
        </div>
      )}
    </section>
  );
};
