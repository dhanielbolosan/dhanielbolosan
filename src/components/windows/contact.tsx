import { useCallback, useEffect, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Choices, type Choice } from "../choices";
import { CornerBox } from "../corner-box";
import { useWindowFade } from "@/lib/window-fade";
import { Faded } from "../window";
import { useTypewriter } from "@/lib/use-typewriter";

const errors = {
  name: "your name",
  email: "a\u00a0valid email",
  message: "a\u00a0longer message",
};

const contactSchema = z.object({
  name: z.string().min(1, errors.name),
  email: z.email(errors.email),
  message: z.string().min(10, errors.message),
});

const missingLine = (parts: string[]) =>
  `Hold on, I still need ${parts.length < 3
    ? parts.join(" and ")
    : `${parts.slice(0, -1).join(", ")}, and ${parts.at(-1)}`
  }!`;

type ContactForm = z.infer<typeof contactSchema>;
type ContactAction =
  | { type: "form" }
  | { type: "redirect"; href: string }
  | { type: "back" };

const keepLastPair = (text: string) => text.replace(/ (?=\S+$)/, "\u00a0");

const lines = {
  menu: "I'm always open to discussing new projects, opportunities, or just talking. How would you like to reach out?",
  form: "Leave your name, email, and a\u00a0message. I'll get back to you ASAP!",
  sending: "Sending…",
  sent: "Message sent, I'll get back to you soon!",
  failed: "Something went wrong. Try again?",
  redirect: "Got it, redirecting now!",
  allErrors: missingLine(Object.values(errors)),
};

const field =
  "w-full min-w-0 rounded-[4px] border border-frame/50 bg-input/30 px-2 font-heading text-base transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export const Contact = () => {
  const [mode, setMode] = useState<"menu" | "form" | "sent">("menu");
  const [line, setLine] = useState(lines.menu);
  const [shown, typingLine] = useTypewriter(line, undefined, mode);
  const [pendingChoice, setPendingChoice] = useState<ContactAction>();
  const [pendingHref, setPendingHref] = useState<string>();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const { fading, fadeTo } = useWindowFade();

  const go = useCallback(
    (next: typeof mode) =>
      fadeTo(
        () => {
          setMode(next);
          setLine("");
        },
        () => setLine(lines[next]),
      ),
    [fadeTo],
  );

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

  const onError = (fieldErrors: typeof form.formState.errors) =>
    setLine(
      missingLine(
        Object.values(fieldErrors).flatMap((error) =>
          error?.message ? [error.message] : [],
        ),
      ),
    );

  const choose = (choice: ContactAction) => {
    setPendingChoice(choice);
    if (choice.type === "back") setLine("");
  };

  const link = (label: string, href: string): Choice => ({
    label,
    href,
    onSelect: () => choose({ type: "redirect", href }),
  });

  const menuChoices: Choice[] = [
    {
      label: "Leave a message",
      onSelect: () => choose({ type: "form" }),
    },
    link("GitHub", "https://github.com/dhanielbolosan"),
    link("LinkedIn", "https://www.linkedin.com/in/dhaniel-bolosan/"),
    link("Email", "mailto:dhanielb808@gmail.com"),
  ];
  const menuReady =
    mode === "menu" &&
    line === lines.menu &&
    shown === line &&
    !pendingChoice &&
    !fading;
  const [typedResponses] = useTypewriter(
    menuReady ? menuChoices.map((item) => item.label).join("\n") : "",
  );

  useEffect(() => {
    if (!pendingChoice || typedResponses) return;

    if (line && pendingChoice.type !== "back") {
      const frame = requestAnimationFrame(() => setLine(""));
      return () => cancelAnimationFrame(frame);
    }

    if (shown) return;

    const frame = requestAnimationFrame(() => {
      setPendingChoice(undefined);
      if (pendingChoice.type === "form") go("form");
      else if (pendingChoice.type === "back") go("menu");
      else {
        setPendingHref(pendingChoice.href);
        setLine(lines.redirect);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pendingChoice, typedResponses, shown, line, go]);

  const formCommands: Choice[] = [
    { label: "Send", submit: "contact-form" },
    { label: "Back", onSelect: () => choose({ type: "back" }) },
  ];
  const commands: Choice[] | undefined =
    mode === "form"
      ? formCommands
      : mode === "sent"
        ? [{ label: "Back", onSelect: () => choose({ type: "back" }) }]
        : undefined;

  const reserved =
    line === lines.redirect
      ? [lines.redirect]
      : {
        menu: [lines.menu],
        form: [lines.form, lines.sending, lines.failed, lines.allErrors],
        sent: [lines.sent],
      }[mode];

  const cornerFor = (items?: Choice[]) => (
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
                ready={!!line && shown === line && !pendingChoice && !fading}
              />
            </>
          ) : (
            <h2>Contact</h2>
          )
        }
      />
    </div>
  );

  const full = `“${keepLastPair(typingLine)}”`;
  const typed = shown ? shown.length + 1 + (shown === typingLine ? 1 : 0) : 0;

  const dialogue =
    "col-start-1 row-start-1 pl-[0.4em] -indent-[0.4em] font-heading text-lg leading-snug";

  return (
    <section className="flex grow flex-col">
      <div className="flex items-start">
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
            <span aria-hidden="true">
              {full.slice(0, typed)}
              <span className="invisible">{full.slice(typed)}</span>
            </span>
          </div>
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
            <textarea
              id="contact-message"
              placeholder="Enter your message here"
              className={`max-h-76 min-h-24 resize-none self-start overflow-y-auto py-2 field-sizing-content ${field}`}
              {...form.register("message")}
            />
          </form>
        )}

        {mode === "menu" && (
          <div className="mt-2">
            <Choices
              items={menuChoices}
              ready={menuReady}
              typedChars={typedResponses.length}
            />
          </div>
        )}
      </Faded>
    </section>
  );
};
