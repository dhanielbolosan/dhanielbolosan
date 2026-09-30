import type { FormEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ContactFields } from "@/lib/integrations/contact";
import { cn } from "@/lib/utils";

const field =
  "w-full min-w-0 rounded-[4px] border border-frame/50 bg-input/30 px-3 font-heading text-base transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

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
    aria-busy={form.formState.isSubmitting}
    onSubmit={onSubmit}
    className="mt-3 grid min-h-0 grow grid-cols-[auto_1fr] grid-rows-[auto_auto_minmax(0,1fr)] items-center gap-3 font-heading"
  >
    {/* Keep the submitted fields unchanged while the request is pending. */}
    <label
      htmlFor="contact-name"
      className="text-label"
    >
      Name
    </label>

    <input
      id="contact-name"
      autoComplete="name"
      readOnly={form.formState.isSubmitting}
      placeholder="John Doe"
      aria-invalid={!!form.formState.errors.name}
      className={cn("h-10 py-0.5", field)}
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
      readOnly={form.formState.isSubmitting}
      placeholder="example@gmail.com"
      aria-invalid={!!form.formState.errors.email}
      className={cn("h-10 py-0.5", field)}
      {...form.register("email")}
    />

    <label
      htmlFor="contact-message"
      className="self-start pt-1.5 text-label"
    >
      Message
    </label>

    <textarea
      id="contact-message"
      readOnly={form.formState.isSubmitting}
      placeholder="Enter your message here"
      aria-invalid={!!form.formState.errors.message}
      className={cn(
        "max-h-76 min-h-24 resize-none self-start overflow-y-auto py-1.5 field-sizing-content",
        field,
      )}
      {...form.register("message")}
    />
  </form>
);
