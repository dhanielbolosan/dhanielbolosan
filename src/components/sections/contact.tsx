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
  message: "a message of at least 10 characters",
};

const contactSchema = z.object({
  name: z.string().min(1, errors.name),
  email: z.email(errors.email),
  message: z.string().min(10, errors.message),
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
  menu: "I'm always open to discussing new projects, opportunities, or just talking.\nHow would you like to reach out?",
  form: "Leave your name, email, and a message. I'll get back to you ASAP!",
  sending: "Sending…",
  sent: "Message sent, I'll get back to you soon!",
  failed: "Something went wrong. Try again?",
  redirect: "Got it, redirecting now!",
  // Longest possible error line; only used to reserve the dialogue's height.
  allErrors: missingLine(Object.values(errors)),
};

const field =
  "rounded-[3px] border-frame/50 bg-black/30 font-heading text-base placeholder:text-muted-foreground/70 md:text-base";

export const Contact = () => {
  const [mode, setMode] = useState<"menu" | "form" | "sent">("menu");
  const [line, setLine] = useState(lines.menu);
  const shown = useTypewriter(line);
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
  // replaces while there are commands. Flush with the frame; the dialogue wraps it.
  const cornerFor = (items?: Choice[]) => (
    // The command box's hand points in from its left, so leave room for it there.
    <div
      className={`float-right -mt-5 mb-1 indent-0 ${items ? "ml-11" : "ml-3"}`}
    >
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

  const dialogue =
    "col-start-1 row-start-1 pl-[0.4em] -indent-[0.4em] font-heading text-lg leading-snug whitespace-pre-line";

  return (
    <section className="flex grow flex-col">
      {/* Every line this screen can show is laid out invisibly in the same grid cell,
          wrapped around this screen's corner, so the box is as tall as its longest line
          and typing never shifts what's below. */}
      <div className="grid">
        {reserved[mode].map((text) => (
          <div
            key={text}
            aria-hidden="true"
            inert
            className={`invisible ${dialogue}`}
          >
            {cornerFor(commands)}“{text}”
          </div>
        ))}
        <div className={dialogue}>
          {cornerFor(commands)}
          <span aria-hidden="true">
            {shown && `“${shown}${shown === line ? "”" : ""}`}
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
