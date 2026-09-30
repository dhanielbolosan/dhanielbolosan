import * as z from "zod";

// Field messages become the missing-information dialogue in the contact form.
export const contactErrors = {
  name: "your name",
  email: "a\u00a0valid email",
  message: "a\u00a0longer message",
};

// Share contact validation between the browser form and server endpoint.
export const contactSchema = z.object({
  name: z.string().trim().min(1, contactErrors.name).max(100, "a shorter name"),
  email: z.email(contactErrors.email).max(254, contactErrors.email),
  message: z
    .string()
    .min(10, contactErrors.message)
    .max(5000, "a shorter message"),
});

export type ContactFields = z.infer<typeof contactSchema>;
