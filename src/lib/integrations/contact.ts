import * as z from "zod/mini";

// Field messages become the missing-information dialogue in the contact form.
export const contactErrors = {
  name: "your name",
  email: "a\u00a0valid email",
  message: "a\u00a0longer message",
};

// Share contact validation between the browser form and server endpoint.
export const contactSchema = z.object({
  name: z
    .string()
    .check(
      z.trim(),
      z.minLength(1, contactErrors.name),
      z.maxLength(100, "a shorter name"),
    ),
  email: z
    .email(contactErrors.email)
    .check(z.maxLength(254, contactErrors.email)),
  message: z
    .string()
    .check(
      z.minLength(10, contactErrors.message),
      z.maxLength(5000, "a shorter message"),
    ),
});

export type ContactFields = z.infer<typeof contactSchema>;
