import { useEffect, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Choices, type Choice } from "../choices";
import { CornerBox } from "../corner-box";
import { useWindowFade } from "@/lib/window-fade";
import { Faded } from "../window";
import { useTypewriter } from "@/lib/use-typewriter";

// What the NPC still needs, per field; joined into one line by `missingLine`.
// "a" is joined to its word with a non-breaking space (\u00a0) so balanced wrapping
// never leaves it alone at the end of a line.
const errors = {
  name: "your name",
  email: "a\u00a0valid email",
  // Short on purpose: the all-errors line must wrap no taller than the form's line,
  // or it leaves a gap above the form (the dialogue reserves its longest line).
  message: "a\u00a0longer message",
};

const contactSchema = z.object({
  name: z.string().min(1, errors.name),
  email: z.email(errors.email),
  message: z.string().min(10, errors.message), // 10+ characters
});

// "your name" / "your name and a valid email" / "your name, a valid email, and a message…"
const missingLine = (parts: string[]) =>
  `Hold on, I still need ${
    parts.length < 3
      ? parts.join(" and ")
      : `${parts.slice(0, -1).join(", ")}, and ${parts.at(-1)}`
  }!`;

type ContactForm = z.infer<typeof contactSchema>;

// Joins a line's last two words with a non-breaking space so it never ends on a lone
// word ("out?”" by itself). Same length, so typing progress lines up either way.
const keepLastPair = (text: string) => text.replace(/ (?=\S+$)/, "\u00a0");

const lines = {
  menu: "I'm always open to discussing new projects, opportunities, or just talking. How would you like to reach out?",
  form: "Leave your name, email, and a\u00a0message. I'll get back to you ASAP!",
  sending: "Sending…",
  sent: "Message sent, I'll get back to you soon!",
  failed: "Something went wrong. Try again?",
  redirect: "Got it, redirecting now!",
  // Longest possible error line; only used to reserve the dialogue's height.
  allErrors: missingLine(Object.values(errors)),
};

// Shared look of the form's text fields.
const field =
  "w-full min-w-0 rounded-[4px] border border-frame/50 bg-input/30 px-2 font-heading text-base transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export const Contact = () => {
  const [mode, setMode] = useState<"menu" | "form" | "sent">("menu");
  const [line, setLine] = useState(lines.menu);
  const [shown, typingLine] = useTypewriter(line, undefined, mode);
  const [pendingHref, setPendingHref] = useState<string>();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  // Changing screens fades the window out and back in (all but its corner box).
  const { fadeTo } = useWindowFade();
  const go = (next: typeof mode) =>
    fadeTo(() => {
      setMode(next);
      setLine(lines[next]);
    });

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

  // What each screen reserves room for. The redirect line gets its own, so once the
  // question erases the box shrinks to it and the choices move up, like the form does.
  const reserved =
    line === lines.redirect
      ? [lines.redirect]
      : {
          menu: [lines.menu],
          form: [lines.form, lines.sending, lines.failed, lines.allErrors],
          sent: [lines.sent],
        }[mode];

  // Top-right corner, FF7-style: the title box, which the command box temporarily
  // replaces while there are commands. Flush with the frame, in its own column: the
  // dialogue stays beside it and never wraps underneath.
  const cornerFor = (items?: Choice[]) => (
    // 12px from the dialogue: room for the part of the command box's hand that sticks
    // out past the box's left edge, and no more.
    <div className="-mt-5 ml-3 shrink-0">
      <CornerBox
        view={items}
        id={items ? items.map((item) => item.label).join() : "title"}
        render={(view) =>
          view ? (
            <>
              <h2 className="sr-only">Contact</h2>
              <Choices
                boxed
                items={view}
              />
            </>
          ) : (
            <h2>Contact</h2>
          )
        }
      />
    </div>
  );

  // The line being typed or erased, with its quotes, and how much of it shows: the
  // opening quote with the first letter, the closing one once the line is complete.
  const full = `“${keepLastPair(typingLine)}”`;
  const typed = shown ? shown.length + 1 + (shown === typingLine ? 1 : 0) : 0;

  const dialogue =
    "col-start-1 row-start-1 pl-[0.4em] -indent-[0.4em] font-heading text-lg leading-snug";

  return (
    <section className="flex grow flex-col">
      <div className="flex items-start">
        {/* Every line this screen can show is laid out invisibly in the same grid cell,
          so the box is as tall as its longest line and typing never shifts what's
          below. */}
        <Faded className="grid min-w-0 flex-1">
          {reserved.map((text) => (
            <div
              key={text}
              aria-hidden="true"
              inert
              className={`invisible ${dialogue}`}
            >
              “{keepLastPair(text)}”
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
        </Faded>
        {cornerFor(commands)}
      </div>

      <Faded className="flex min-h-0 grow flex-col">
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
            <input
              id="contact-name"
              autoComplete="name"
              placeholder="John Doe"
              className={`h-10 py-0.5 ${field}`}
              {...form.register("name")}
            />
            <label
              htmlFor="contact-email"
              className="text-label"
            >
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              placeholder="example@gmail.com"
              className={`h-10 py-0.5 ${field}`}
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
            <textarea
              id="contact-message"
              placeholder="Enter your message here"
              className={`max-h-76 min-h-24 resize-none self-start overflow-y-auto py-2 field-sizing-content ${field}`}
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
                link(
                  "LinkedIn",
                  "https://www.linkedin.com/in/dhaniel-bolosan/",
                ),
                link("Email", "mailto:dhanielb808@gmail.com"),
              ]}
            />
          </div>
        )}
      </Faded>
    </section>
  );
};
