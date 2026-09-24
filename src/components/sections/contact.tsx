import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldGroup } from "../imports/field";
import { Input } from "../imports/input";
import { Textarea } from "../imports/textarea";
import { PixelHand } from "../pixel-hand";
import { toast } from "sonner";

const links = [
  { label: "GitHub", href: "https://github.com/dhanielbolosan" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/dhaniel-bolosan/" },
  { label: "Email", href: "mailto:dhanielb808@gmail.com" },
];

const field =
  "h-11 rounded-[3px] border-frame/50 bg-black/30 font-heading text-base placeholder:text-base placeholder:text-muted-foreground md:text-base";

// Hover or focus shows the hand beside a menu option.
const menuHand =
  "invisible absolute top-1/2 left-0 w-6 -translate-y-1/2 group-hover:visible group-focus-visible:visible";

const contactSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 characters"),
  email: z.email("Enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const Contact = () => {
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(data: z.infer<typeof contactSchema>) {
    const toastId = toast.loading("Sending...");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast.success("Message Sent! Will get back to you soon.", {
        id: toastId,
      });
      form.reset();
    } catch {
      toast.error("Something went wrong. Try again.", { id: toastId });
    }
  }

  function onError(errors: typeof form.formState.errors) {
    const messages = Object.values(errors)
      .map((err) => err?.message)
      .filter(Boolean) as string[];

    toast.error("Please fix the following:", {
      description: (
        <ul className="list-disc pl-4 space-y-0.5">
          {messages.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      ),
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed">
        I'm always open to discussing new projects, opportunities, or just
        talking. Feel free to reach out and I'll get back to you.
      </p>

      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="group relative inline-block py-0.5 pl-7 font-heading text-base font-semibold outline-none hover:text-foreground"
            >
              <PixelHand className={menuHand} />
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <form
        id="contact-form"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field: props }) => (
              <Field>
                <Input
                  {...props}
                  placeholder="Name"
                  className={field}
                />
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field: props }) => (
              <Field>
                <Input
                  {...props}
                  placeholder="Email"
                  className={field}
                />
              </Field>
            )}
          />

          <Controller
            name="message"
            control={form.control}
            render={({ field: props }) => (
              <Field>
                <Textarea
                  {...props}
                  placeholder="Message"
                  rows={4}
                  className={`${field} h-auto min-h-24 py-2`}
                />
              </Field>
            )}
          />
          <button
            type="submit"
            className="group window relative h-11 cursor-pointer pl-4 font-heading text-base font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PixelHand className={`${menuHand} left-3`} />
            Send
          </button>
        </FieldGroup>
      </form>
    </section>
  );
};
