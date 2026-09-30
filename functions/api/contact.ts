import { contactSchema } from "../../src/lib/integrations/contact";

interface Env {
  RESEND_API_KEY: string;
}

// Validate contact fields and send the message through the server's email service.
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Only accept the same-origin browser form.
  if (request.headers.get("Origin") !== new URL(request.url).origin) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Treat malformed JSON as invalid input using the same schema as the form.
    const payload = await request.json().catch(() => null);
    const parsed = contactSchema.safeParse(payload);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid contact fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { name, email, message } = parsed.data;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      // Give up on a hung email service; the catch below answers 500 and the form keeps the text.
      signal: AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio <onboarding@resend.dev>",
        to: ["dhanielb808@gmail.com"],
        // Reply to the visitor while sending from the service's verified address.
        reply_to: email,
        subject: `Portfolio contact from ${name}`,
        // Send visitor input as plain text so it cannot become email markup.
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      }),
    });

    // Keep email-provider error details in server logs, not the client response.
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Resend API error:", response.status, errorBody);

      return new Response(JSON.stringify({ error: "Email service error" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Return a generic response for unexpected failures.
    console.error("Contact function error:", error);

    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
