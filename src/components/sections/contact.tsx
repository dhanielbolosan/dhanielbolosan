import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Card, CardContent } from "../imports/card";
import { Field, FieldGroup } from "../imports/field";
import { Input } from "../imports/input";
import { Textarea } from "../imports/textarea";
import { InteractiveHoverButton } from "../imports/interactive-hover-button";
import { Button } from "../imports/button";
import { toast } from "sonner";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
} from "@tabler/icons-react";

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

      toast.success("Message Sent! Will get back to you soon.", { id: toastId });
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
    <section className="flex flex-col w-full max-w-4xl mx-auto gap-5 pb-40 px-5">
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 px-8 py-4">
          <div className="flex flex-col pr-4 space-y-4">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Wanna Chat?
            </h2>
            <p className="text-base">
              I'm always open to discussing new projects, opportunities, or just talking. Feel free to reach out and I'll get back
              to you.
            </p>
            <div className="flex flex-row mt-auto gap-4">
              <a
                href="https://github.com/dhanielbolosan"
                target="_blank"
                rel="noreferrer"
              >
                <IconBrandGithub className="h-8 w-8" />
              </a>

              <a
                href="https://www.linkedin.com/in/dhaniel-bolosan/"
                target="_blank"
                rel="noreferrer"
              >
                <IconBrandLinkedin className="h-8 w-8" />
              </a>

              <a href="mailto:dhanielb808@gmail.com">
                <IconMail className="h-8 w-8" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 pl-4">
            <form
              id="contact-form"
              onSubmit={form.handleSubmit(onSubmit, onError)}
            >
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <Input
                        {...field}
                        placeholder="Name"
                        className="h-12 placeholder:text-base text-base"
                      />
                    </Field>
                  )}
                />

                <Controller
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <Input
                        {...field}
                        placeholder="Email"
                        className="h-12 placeholder:text-base text-base"
                      />
                    </Field>
                  )}
                />

                <Controller
                  name="message"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <Textarea
                        {...field}
                        placeholder="Message"
                        rows={4}
                        className="placeholder:text-base text-base"
                      />
                    </Field>
                  )}
                />
                <InteractiveHoverButton
                  type="submit"
                  className="h-12 text-base cursor-pointer"
                >
                  Submit
                </InteractiveHoverButton>
              </FieldGroup>
            </form>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
