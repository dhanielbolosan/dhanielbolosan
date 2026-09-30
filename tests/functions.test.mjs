import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "../src/lib/integrations/contact.ts";

// Pages resolves extensionless TypeScript imports; give Node the same resolution for these tests.
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (error.code !== "ERR_MODULE_NOT_FOUND" || !specifier.startsWith("."))
        throw error;
      return nextResolve(`${specifier}.ts`, context);
    }
  },
});
const { onRequestPost: contact } = await import("../functions/api/contact.ts");
const { onRequestGet: calendar } =
  await import("../functions/api/github-contributions.ts");
const { onRequestGet: listens } =
  await import("../functions/api/recent-listens.ts");
const { onRequestGet: latest } =
  await import("../functions/api/latest-push.ts");
hooks.deregister();

test("Pages rejects unrelated accounts, long ranges and foreign contact origins before fetching", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error("Unexpected upstream request");
  };
  try {
    const env = { GITHUB_TOKEN: "test" };
    assert.equal(
      (
        await contact({
          request: new Request("https://site.test/api/contact", {
            method: "POST",
            headers: { Origin: "https://other.test" },
          }),
          env,
        })
      ).status,
      403,
    );
    for (const query of [
      "username=other",
      "username=dhanielbolosan&from=2024-01-01&to=2026-01-01",
    ]) {
      assert.equal(
        (
          await calendar({
            request: new Request(
              `https://site.test/api/github-contributions?${query}`,
            ),
            env,
          })
        ).status,
        400,
      );
    }
    assert.equal(
      (
        await listens({
          request: new Request(
            "https://site.test/api/recent-listens?username=other",
          ),
        })
      ).status,
      400,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("calendar cache ignores extra query parameters and account casing", async () => {
  const original = globalThis.caches;
  const keys = [];
  globalThis.caches = {
    default: {
      match: async (key) => {
        keys.push(key.url);
        return new Response("{}");
      },
    },
  };
  try {
    for (const query of [
      "username=dhanielbolosan",
      "username=DHANIELBOLOSAN&extra=ignored",
    ]) {
      await calendar({
        request: new Request(
          `https://site.test/api/github-contributions?${query}`,
        ),
        env: { GITHUB_TOKEN: "test" },
      });
    }
    assert.equal(keys[0], keys[1]);
  } finally {
    globalThis.caches = original;
  }
});

test("a broken last-good cache still returns a JSON 502", async () => {
  const originalFetch = globalThis.fetch;
  const originalCaches = globalThis.caches;
  const originalError = console.error;
  globalThis.fetch = async () => new Response("{}", { status: 502 });
  globalThis.caches = {
    default: {
      match: async (key) =>
        key.url.includes("last-good") ? new Response("broken JSON") : undefined,
    },
  };
  console.error = () => {};
  try {
    const response = await listens({
      request: new Request(
        "https://site.test/api/recent-listens?username=dhanielbolosan",
      ),
    });
    assert.equal(response.status, 502);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(await response.json(), {
      error: "Unable to load recent listens.",
    });
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.caches = originalCaches;
    console.error = originalError;
  }
});

test("latest push uses the server token and returns only public push data", async () => {
  const originalFetch = globalThis.fetch;
  const originalCaches = globalThis.caches;
  const writes = [];
  globalThis.caches = {
    default: {
      match: async () => undefined,
      put: async (key, response) => {
        writes.push(await response.json());
      },
    },
  };
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.Authorization, "Bearer test-secret");
    assert.ok(options.signal instanceof AbortSignal);
    assert.ok(url.includes("/users/dhanielbolosan/events/public"));
    return Response.json([
      {
        type: "PushEvent",
        created_at: "2026-09-29T12:00:00Z",
        repo: { name: "owner/repo" },
      },
    ]);
  };
  try {
    const pending = [];
    const response = await latest({
      request: new Request("https://site.test/api/latest-push?extra=ignored"),
      env: { GITHUB_TOKEN: "test-secret" },
      waitUntil: (promise) => pending.push(promise),
    });
    const body = await response.json();
    assert.deepEqual(body, {
      push: { at: "2026-09-29T12:00:00Z", repo: "owner/repo" },
    });
    await Promise.all(pending);
    assert.deepEqual(writes, [body]);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.caches = originalCaches;
  }
});

test("zod mini preserves schema validation and the form resolver", async () => {
  const resolve = zodResolver(contactSchema);
  const valid = await resolve(
    {
      name: " Visitor ",
      email: "visitor@example.com",
      message: "A valid message.",
    },
    {},
    {},
  );
  assert.equal(valid.values.name, "Visitor");
  assert.deepEqual(valid.errors, {});
  const invalid = await resolve(
    { name: " ", email: "invalid", message: "short" },
    {},
    {},
  );
  assert.deepEqual(Object.keys(invalid.errors).sort(), [
    "email",
    "message",
    "name",
  ]);
});

// Keep a full four-disc stack whether playing-now duplicates the newest scrobble or adds a song.
test("recent listens returns one playing disc and four queued discs", async () => {
  const originalFetch = globalThis.fetch;
  const originalCaches = globalThis.caches;
  const recent = Array.from({ length: 5 }, (_, i) => ({
    track_metadata: { track_name: `Song ${i}`, artist_name: "Artist" },
  }));
  globalThis.caches = {
    default: { match: async () => undefined, put: async () => {} },
  };
  try {
    for (const track of ["Song 0", "New song"]) {
      globalThis.fetch = async (url) => {
        if (url.includes("/listens?")) {
          assert.equal(new URL(url).searchParams.get("count"), "5");
          return Response.json({ payload: { listens: recent } });
        }
        return Response.json({
          payload: {
            listens: [
              {
                track_metadata: { track_name: track, artist_name: "Artist" },
              },
            ],
          },
        });
      };
      const pending = [];
      const response = await listens({
        request: new Request(
          "https://site.test/api/recent-listens?username=dhanielbolosan",
        ),
        waitUntil: (promise) => pending.push(promise),
      });
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.listens.length, 5);
      assert.equal(body.listens[0].track, track);
      assert.equal(body.listens[0].playingNow, true);
      assert.deepEqual(
        body.listens.slice(1).map((listen) => listen.track),
        track === "Song 0"
          ? ["Song 1", "Song 2", "Song 3", "Song 4"]
          : ["Song 0", "Song 1", "Song 2", "Song 3"],
      );
      await Promise.all(pending);
    }
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.caches = originalCaches;
  }
});

test("contact sends only after Turnstile verifies, and fails closed without a secret", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  let verified = false;
  globalThis.fetch = async (url, options) => {
    calls.push(String(url));
    if (String(url).includes("siteverify"))
      return Response.json({ success: verified });
    return Response.json({ id: "sent" });
  };
  const send = (env, token) =>
    contact({
      request: new Request("https://site.test/api/contact", {
        method: "POST",
        headers: { Origin: "https://site.test" },
        body: JSON.stringify({
          name: "Audit Bot",
          email: "audit@example.com",
          message: "This is an audit test message.",
          token,
        }),
      }),
      env,
    });
  try {
    const env = { RESEND_API_KEY: "test", TURNSTILE_SECRET_KEY: "test" };
    assert.equal((await send({ RESEND_API_KEY: "test" }, "t")).status, 503);
    assert.equal((await send(env, "bad")).status, 403);
    assert.ok(!calls.some((url) => url.includes("resend")));
    verified = true;
    assert.equal((await send(env, "good")).status, 200);
    assert.ok(calls.at(-1).includes("resend"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
