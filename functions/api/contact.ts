interface Env {
    RESEND_API_KEY: string;
}

interface ContactPayload {
    name: string;
    email: string;
    message: string;
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const { name, email, message } = await request.json<ContactPayload>();

        if (!name || !email || !message) {
            return new Response(JSON.stringify({ error: "Missing fields" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "Portfolio <onboarding@resend.dev>",
                to: ["dhanielb808@gmail.com"],
                reply_to: email,
                subject: `Portfolio contact from ${name}`,
                html: `
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong><br/>${message}</p>
                `,
            }),
        });

        if (!res.ok) {
            const errorBody = await res.text();
            console.error("Resend API error:", res.status, errorBody);
            return new Response(
                JSON.stringify({ error: "Email service error", details: errorBody }),
                {
                    status: 502,
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                },
            );
        }

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    } catch (err) {
        console.error("Contact function error:", err);
        return new Response(
            JSON.stringify({ error: "Server error", message: String(err) }),
            {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            },
        );
    }
};