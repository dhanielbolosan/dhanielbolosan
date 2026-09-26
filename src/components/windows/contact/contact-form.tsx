import type { FormEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ContactFields } from "@/lib/contact";

const field =
  "w-full min-w-0 rounded-[4px] border border-frame/50 bg-input/30 px-2 font-heading text-base transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export const ContactForm = ({
  form,
  onSubmit,
}: {
  form: UseFormReturn<ContactFields>;
  onSubmit: FormEventHandler<HTMLFormElement>;
}) => (
  // Use schema validation so errors appear in dialogue instead of browser popups.
  <form
    id="contact-form"
    noValidate
    onSubmit={onSubmit}
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
);
