import {
  useEffect,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../imports/input";
import { Textarea } from "../imports/textarea";
import { PixelHand } from "../pixel-hand";
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
  `Hold on! I still need ${parts.length < 3
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

type Choice = {
  label: string;
  href?: string;
  onSelect?: () => void;
  submit?: boolean;
};

// FF7 dialogue choices: the hand marks the hovered or focused option; arrow keys move it.
// `boxed` renders them as an FF7 command window in the parent window's bottom-right
// corner, with the hand pointing in from outside its left edge.
const Choices = ({ items, boxed }: { items: Choice[]; boxed?: boolean }) => {
  const [active, setActive] = useState(0);

  const move = (event: KeyboardEvent<HTMLUListElement>) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const options =
      event.currentTarget.querySelectorAll<HTMLElement>("a, button");
    options[(active + step + options.length) % options.length]?.focus();
  };

  // Plain left clicks go through onSelect; modified clicks keep normal link behavior.
  const onLinkClick = (event: MouseEvent, item: Choice) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
      return;
    event.preventDefault();
    item.onSelect?.();
  };

  const list = (
    <ul
      className="flex flex-col gap-1"
      onKeyDown={move}
    >
      {items.map((item, i) => {
        const props = {
          onMouseEnter: () => setActive(i),
          onFocus: () => setActive(i),
          className: `relative flex w-fit cursor-pointer items-center py-0.5 font-heading text-lg text-foreground outline-none ${boxed ? "" : "pl-11"}`,
        };
        const body = (
          <>
            {i === active && (
              <PixelHand
                className={`absolute motion-safe:animate-bob ${boxed ? "right-full mr-2" : "left-0"}`}
              />
            )}
            {item.label}
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
                form={item.submit ? "contact-form" : undefined}
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

  // Flush with the Contact window's bottom-right corner (past its p-5 padding).
  return boxed ? (
    <div className="window mt-auto -mr-5 -mb-5 self-end py-3 pr-8 pl-6">
      {list}
    </div>
  ) : (
    list
  );
};

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

  const titleClass = "window-title float-right -mt-5 mb-1 ml-3 indent-0";
  const title = <span className={titleClass}>Contact</span>;

  const dialogue =
    "col-start-1 row-start-1 pl-[0.4em] -indent-[0.4em] font-heading text-lg leading-snug whitespace-pre-line";

  return (
    <section className="flex grow flex-col gap-4">
      {/* Every line is laid out invisibly in the same grid cell, so the box is always as
          tall as the longest one: typing never shifts what's below, and the menu choices
          and the form start at the same spot on every screen.
          The window title floats in each layer so every copy wraps around it the same way;
          only the visible layer's title shows. */}
      <div className="grid">
        {Object.values(lines).map((text) => (
          <div
            key={text}
            aria-hidden="true"
            className={`invisible ${dialogue}`}
          >
            {title}“{text}”
          </div>
        ))}
        <div className={dialogue}>
          <h2 className={titleClass}>Contact</h2>
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
          className="grid min-h-0 grow grid-cols-[auto_1fr] grid-rows-[auto_auto_1fr] items-center gap-x-4 gap-y-2 font-heading"
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
          {/* Fixed-size box that fills the window's leftover height and scrolls inside,
              so long messages never make the Contact window taller. */}
          <Textarea
            id="contact-message"
            placeholder="Enter your message here"
            className={`h-full min-h-20 self-stretch overflow-y-auto py-2 field-sizing-fixed ${field}`}
            {...form.register("message")}
          />
        </form>
      )}

      {mode === "menu" && (
        <Choices
          items={[
            { label: "Leave a message", onSelect: () => go("form") },
            link("GitHub", "https://github.com/dhanielbolosan"),
            link("LinkedIn", "https://www.linkedin.com/in/dhaniel-bolosan/"),
            link("Email", "mailto:dhanielb808@gmail.com"),
          ]}
        />
      )}
      {mode === "form" && (
        <Choices
          boxed
          items={[
            { label: "Send", submit: true },
            { label: "Back", onSelect: () => go("menu") },
          ]}
        />
      )}
      {mode === "sent" && (
        <Choices
          boxed
          items={[{ label: "Back", onSelect: () => go("menu") }]}
        />
      )}
    </section>
  );
};
