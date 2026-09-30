// Audit browser harness: drives the local Pages build (port 8799) in headless Chromium over CDP.
// Usage: AUDIT_OUT=audit/<agent> node .claude/audit-kit/browser.mjs <scenario>
// Results print as JSON; screenshots land in $AUDIT_OUT/shots/. Contact submissions are always mocked.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const scenario = process.argv[2];
const base = "http://localhost:8799/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = `${process.env.AUDIT_OUT ?? "audit"}/shots`;
mkdirSync(out, { recursive: true });

// ---- Chromium over CDP ----
const port = 9800 + Math.floor(Math.random() * 150);
const chrome = spawn(
  "chromium",
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${process.env.TMPDIR ?? "/tmp"}/audit-chrome-${port}-${Date.now()}`,
    "--autoplay-policy=no-user-gesture-required",
    "about:blank",
  ],
  { stdio: "ignore" },
);
let ws;
for (let i = 0; i < 100 && !ws; i++) {
  try {
    const p = (
      await (await fetch(`http://127.0.0.1:${port}/json`)).json()
    ).find((t) => t.type === "page");
    if (p) ws = new WebSocket(p.webSocketDebuggerUrl);
  } catch {}
  await sleep(200);
}
if (ws.readyState !== WebSocket.OPEN)
  await new Promise((r) => ws.addEventListener("open", r));

let id = 0;
const waiting = new Map();
const errors = [],
  failed = [],
  requests = [];
let intercept = null; // (url) => undefined | { status, body, delay } | "fail"
ws.addEventListener("message", async (e) => {
  const m = JSON.parse(e.data);
  if (waiting.has(m.id)) {
    waiting.get(m.id)(m.result ?? m.error);
    waiting.delete(m.id);
  }
  if (m.method === "Runtime.exceptionThrown")
    errors.push(
      m.params.exceptionDetails.exception?.description ??
        m.params.exceptionDetails.text,
    );
  if (
    m.method === "Runtime.consoleAPICalled" &&
    ["error", "warning"].includes(m.params.type)
  )
    errors.push(
      `${m.params.type}: ` +
        m.params.args.map((a) => a.value ?? a.description).join(" "),
    );
  if (m.method === "Log.entryAdded" && m.params.entry.level === "error")
    errors.push(`log: ${m.params.entry.text} ${m.params.entry.url ?? ""}`);
  if (m.method === "Network.requestWillBeSent")
    requests.push({
      url: m.params.request.url,
      method: m.params.request.method,
    });
  if (m.method === "Network.loadingFailed" && !m.params.canceled)
    failed.push(`${m.params.errorText} ${m.params.type}`);
  if (
    m.method === "Network.responseReceived" &&
    m.params.response.status >= 400
  )
    failed.push(`${m.params.response.status} ${m.params.response.url}`);
  if (m.method === "Fetch.requestPaused") {
    const { requestId, request } = m.params;
    const rule = intercept?.(request.url, request.method);
    if (!rule) return send("Fetch.continueRequest", { requestId });
    if (rule.delay) await sleep(rule.delay);
    if (rule === "fail" || rule.fail)
      return send("Fetch.failRequest", { requestId, errorReason: "Failed" });
    if (rule.passthrough) return send("Fetch.continueRequest", { requestId });
    send("Fetch.fulfillRequest", {
      requestId,
      responseCode: rule.status ?? 200,
      responseHeaders: [{ name: "Content-Type", value: "application/json" }],
      body: Buffer.from(rule.body ?? "{}").toString("base64"),
    });
  }
});
const send = (method, params = {}) =>
  new Promise((r) => {
    waiting.set(++id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });
const run = async (expression) => {
  const r = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r?.exceptionDetails)
    throw new Error(
      r.exceptionDetails.exception?.description ?? r.exceptionDetails.text,
    );
  return r?.result?.value;
};
const shot = async (name, full = false) => {
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: full,
  });
  writeFileSync(`${out}/${name}.png`, Buffer.from(data, "base64"));
  return `${out}/${name}.png`;
};
const size = (w, h) =>
  send("Emulation.setDeviceMetricsOverride", {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile: w < 768,
  });
const load = async (wait = 5000) => {
  await send("Page.navigate", { url: base });
  await sleep(wait);
};

await send("Runtime.enable");
await send("Log.enable");
await send("Network.enable");
await send("Page.enable");
await send("Fetch.enable", {
  patterns: [
    { urlPattern: "*/api/*" },
    { urlPattern: "https://api.github.com/*" },
  ],
});

// ---- page helpers (run in the page) ----
const helpers = `
  window.__w = (ms) => new Promise((r) => setTimeout(r, ms));
  window.__tab = async (name) => { const t = [...document.querySelectorAll("[role=tab]")].find((t) => t.textContent === name); if (!t) return false; t.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 })); t.click(); await __w(1200); return true; };
  window.__activity = () => document.querySelector("[aria-haspopup=menu]")?.closest("section");
  window.__screen = async (name) => { const s = __activity(); s.querySelector("[aria-haspopup=menu]").click(); await __w(700); [...s.querySelectorAll("button, a")].find((b) => b.textContent.trim() === name)?.click(); await __w(2500); };
  window.__music = () => { const s = __activity(); return s && { now: s.querySelector("h3")?.textContent, stack: [...s.querySelectorAll("ol li")].map((li) => li.querySelector("span.truncate")?.textContent) }; };
  window.__overflow = () => ({ page: document.documentElement.scrollWidth - innerWidth, offenders: [...document.querySelectorAll("body *")].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(e).position !== "fixed" && !e.closest(".overflow-x-clip, [class*=overflow-hidden], [class*=overflow-x-hidden], [class*=overflow-y-auto]"); }).slice(0, 5).map((e) => e.tagName + "." + String(e.className).slice(0, 60)) });
`;
const prep = () => run(helpers);

const scenarios = {
  // Every tab/column at a size: screenshot, overflow, errors.
  async layout() {
    const out = {};
    for (const [w, h, name] of [
      [360, 640, "360x640"],
      [390, 844, "390x844"],
      [767, 1024, "767x1024"],
      [768, 1024, "768x1024"],
      [820, 1180, "820x1180"],
      [1279, 800, "1279x800"],
      [1280, 800, "1280x800"],
      [1280, 600, "1280x600"],
      [1440, 900, "1440x900"],
      [1920, 1080, "1920x1080"],
    ]) {
      await size(w, h);
      await load();
      await prep();
      const tabs = await run(
        `[...document.querySelectorAll("[role=tab]")].filter((t) => t.offsetParent).map((t) => t.textContent)`,
      );
      const shots = [];
      if (tabs.length)
        for (const t of tabs) {
          await run(`__tab(${JSON.stringify(t)})`);
          shots.push(await shot(`layout-${name}-${t}`));
        }
      else shots.push(await shot(`layout-${name}`));
      out[name] = {
        loaded: await run(`document.title`),
        tabs,
        overflow: await run(`__overflow()`),
        shots,
      };
    }
    return out;
  },

  // Mash nav tabs and the Activity switcher mid-animation; state must settle to one visible column.
  async rapid() {
    await size(390, 844);
    await load();
    await prep();
    await run(
      `(async () => { const tabs = [...document.querySelectorAll("[role=tab]")]; for (let i = 0; i < 40; i++) { const t = tabs[i % tabs.length]; t.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 })); t.click(); await __w(40); } await __w(2000); })()`,
    );
    const phone = await run(
      `({ selected: [...document.querySelectorAll("[role=tab][aria-selected=true]")].map((t) => t.textContent), visibleColumns: [...document.querySelectorAll("main > div")].filter((d) => getComputedStyle(d).display !== "none").length, overflow: __overflow() })`,
    );
    await shot("rapid-phone");
    await size(1440, 900);
    await load();
    await prep();
    await run(
      `(async () => { for (let i = 0; i < 12; i++) { await __screen(i % 2 ? "GitHub" : "Music").catch(() => {}); } })()`,
    );
    const desktop = await run(
      `({ screen: __activity()?.querySelector("h2, [aria-haspopup=menu]")?.textContent, music: __music() })`,
    );
    await shot("rapid-desktop");
    // Leave Music mid-swap, then come back: the stack must be valid and no animation errors.
    await run(`__screen("Music")`);
    await run(
      `(async () => { __activity().querySelector("ol li:nth-child(2) button").click(); await __w(700); })()`,
    );
    await run(
      `(async () => { const s = __activity(); s.querySelector("[aria-haspopup=menu]").click(); await __w(300); [...s.querySelectorAll("button, a")].find((b) => b.textContent.trim() === "GitHub")?.click(); await __w(1500); })()`,
    );
    await run(`__screen("Music")`);
    await sleep(1000);
    const back = await run(`__music()`);
    await run(
      `(async () => { __activity().querySelector("ol li:nth-child(1) button").click(); await __w(4500); })()`,
    );
    const afterSwap = await run(`__music()`);
    return { phone, desktop, back, afterSwap };
  },

  // Resize across breakpoints during the entrance and during a swap.
  async resize() {
    await size(1440, 900);
    await send("Page.navigate", { url: base });
    for (const [w, h] of [
      [390, 844],
      [820, 1180],
      [1440, 900],
      [767, 900],
      [1280, 600],
    ]) {
      await sleep(150);
      await size(w, h);
    }
    await sleep(3000);
    await prep();
    await size(1440, 900);
    await sleep(1000);
    await run(`__screen("Music")`);
    await run(
      `__activity().querySelector("ol li:nth-child(2) button").click()`,
    );
    for (const [w, h] of [
      [820, 1180],
      [1440, 900],
      [1280, 800],
    ]) {
      await sleep(400);
      await size(w, h);
    }
    await sleep(4500);
    const music = await run(`__music()`);
    const overflow = await run(`__overflow()`);
    await shot("resize-after");
    return { music, overflow };
  },

  // Tab and Activity screen survive a reload; blocked storage falls back quietly.
  async persist() {
    await size(390, 844);
    await load();
    await prep();
    await run(`__tab("Extras")`);
    await run(`__screen("Music")`);
    await load();
    await prep();
    const phone = await run(
      `({ tab: document.querySelector("[role=tab][aria-selected=true]")?.textContent, music: !!__music()?.stack?.length })`,
    );
    await send("Emulation.setScriptExecutionDisabled", { value: false });
    // Block storage: throw from localStorage for the next load.
    await send("Page.addScriptToEvaluateOnNewDocument", {
      source: `Object.defineProperty(window, "localStorage", { get() { throw new DOMException("blocked", "SecurityError"); } });`,
    });
    await load();
    await prep();
    await run(`__tab("Projects")`);
    const blocked = await run(
      `({ tab: document.querySelector("[role=tab][aria-selected=true]")?.textContent })`,
    );
    return { phone, blocked };
  },

  // Every API down: windows keep a sane fallback and nothing throws uncaught.
  async offline() {
    intercept = (url) =>
      url.includes("/api/") || url.includes("api.github.com")
        ? "fail"
        : undefined;
    await size(1440, 900);
    await load(6000);
    await prep();
    await shot("offline-desktop");
    await run(`__screen("Music")`);
    const music = await run(`__music()`);
    await shot("offline-music");
    await run(
      `(async () => { __activity().querySelector("ol li:nth-child(2) button").click(); await __w(4500); })()`,
    );
    const swapped = await run(`__music()`);
    intercept = (url) =>
      url.includes("/api/")
        ? { status: 500, body: '{"error":"boom"}' }
        : undefined;
    await load(6000);
    await prep();
    await shot("http500-desktop");
    return { music, swapped };
  },

  // Slow listens: placeholders first, then real discs without breaking a swap in progress.
  async slow() {
    intercept = (url) =>
      url.includes("/api/recent-listens")
        ? { delay: 7000, passthrough: true }
        : undefined;
    await size(1440, 900);
    await load(1500);
    await prep();
    await run(`__screen("Music")`);
    const early = await run(`__music()`);
    await run(
      `__activity().querySelector("ol li:nth-child(2) button").click()`,
    );
    await sleep(8000);
    const late = await run(`__music()`);
    await shot("slow-music");
    return { early, late };
  },

  // Contact: failure keeps the text; double submit sends once. Submissions are mocked, never sent.
  async contact() {
    let posts = 0;
    let mode = "fail";
    intercept = (url, method) => {
      if (!url.includes("/api/contact")) return;
      if (method === "POST") posts++;
      return mode === "fail"
        ? { status: 500, body: '{"error":"x"}' }
        : { status: 200, body: '{"ok":true}', delay: 1500 };
    };
    await size(1440, 900);
    await load();
    await prep();
    const open = `(async () => { const b = [...document.querySelectorAll("button, a")].find((b) => b.textContent.trim() === "Leave a message"); b.click(); await __w(1500); })()`;
    const fill = `(async () => { const set = (sel, v) => { const el = document.querySelector(sel); const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v); el.dispatchEvent(new Event("input", { bubbles: true })); }; set("#contact-name", "Audit Bot"); set("#contact-email", "audit@example.com"); set("#contact-message", "This is an audit test message."); await __w(200); })()`;
    const submit = `(async () => { const f = document.getElementById("contact-form"); const btn = document.querySelector('button[form="contact-form"], #contact-form button[type=submit]'); return !!btn; })()`;
    await run(open);
    await run(fill);
    const hasButton = await run(submit);
    // Empty-field validation first.
    await run(
      `(async () => { document.getElementById("contact-form").requestSubmit(); await __w(1500); })()`,
    );
    await run(
      `(async () => { document.getElementById("contact-form").requestSubmit(); await __w(2500); })()`,
    );
    const afterFail = await run(
      `({ name: document.querySelector("#contact-name")?.value, message: document.querySelector("#contact-message")?.value, dialogue: document.querySelector("section")?.innerText.slice(0, 0) })`,
    );
    await shot("contact-failed");
    mode = "ok";
    posts = 0;
    await run(
      `(async () => { const f = document.getElementById("contact-form"); f.requestSubmit(); f.requestSubmit(); f.querySelector("#contact-message").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); f.requestSubmit(); await __w(3500); })()`,
    );
    const okPosts = posts;
    await shot("contact-sent");
    // Validation with empty fields.
    await load();
    await prep();
    await run(open);
    await run(
      `(async () => { document.getElementById("contact-form").requestSubmit(); await __w(1500); })()`,
    );
    await shot("contact-invalid");
    return { hasButton, afterFail, okPosts };
  },

  // Reduced motion: no entrance motion; swap is instant and consistent.
  async reduced() {
    await send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
    await size(1440, 900);
    await load(3000);
    await prep();
    const animating = await run(
      `document.getAnimations().filter((a) => a.playState === "running").map((a) => a.animationName ?? a.effect?.target?.className?.toString().slice(0, 40))`,
    );
    await run(`__screen("Music")`);
    const before = await run(`__music()`);
    await run(
      `(async () => { __activity().querySelector("ol li:nth-child(2) button").click(); await __w(200); })()`,
    );
    const after = await run(`__music()`);
    await shot("reduced-music");
    return { animating, before, after };
  },

  // Contact redirect: time from the click to window.open (Safari only honors popups shortly after a click).
  async redirect() {
    await size(1440, 900);
    await load();
    await prep();
    return await run(`(async () => {
      let openedAt; window.open = () => { openedAt = performance.now(); return { opener: 1 }; };
      const link = [...document.querySelectorAll("a, button")].find((b) => b.textContent.trim() === "GitHub");
      const t0 = performance.now(); link.click();
      for (let i = 0; i < 60 && !openedAt; i++) await __w(50);
      return { clickToOpenMs: openedAt && Math.round(openedAt - t0) };
    })()`);
  },

  // Activity stats at every width: overflow and a cropped screenshot.
  async stats() {
    const out = {};
    for (const [w, h] of [
      [360, 740],
      [390, 844],
      [767, 1024],
      [768, 1024],
      [1024, 800],
      [1279, 800],
      [1280, 800],
      [1440, 900],
      [1920, 1080],
    ]) {
      await size(w, h);
      await load();
      await prep();
      await run(`__tab("Extras")`);
      const box = await run(
        `(() => { const dl = __activity().querySelector("dl"); dl.scrollIntoView({ block: "center" }); const r = dl.getBoundingClientRect(); const cells = [...dl.children].flatMap((d) => [...d.children]); return { x: r.left - 8, y: r.top - 8, width: r.width + 16, height: r.height + 16, overflow: dl.scrollWidth - dl.clientWidth, tallestCellLines: Math.max(...cells.map((c) => Math.round(c.getBoundingClientRect().height / parseFloat(getComputedStyle(c).lineHeight)))), valuesClipped: cells.filter((c) => c.tagName === "DD" && c.getBoundingClientRect().right > r.right + 1).length }; })()`,
      );
      const { data } = await send("Page.captureScreenshot", {
        format: "png",
        clip: {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          scale: 1,
        },
      });
      writeFileSync(`${out}/stats-${w}.png`, Buffer.from(data, "base64"));
      out[w] = {
        overflow: box.overflow,
        tallestCellLines: box.tallestCellLines,
        valuesClipped: box.valuesClipped,
      };
    }
    return out;
  },

  // Links: hover each gold link, check the hand shows and clears its neighbors, and crop a screenshot.
  async links() {
    const out = {};
    await send("Emulation.setEmulatedMedia", {
      features: [
        { name: "hover", value: "hover" },
        { name: "pointer", value: "fine" },
      ],
    });
    for (const [w, h] of [
      [1440, 900],
      [1280, 800],
      [390, 844],
    ]) {
      await size(w, h);
      await load();
      await prep();
      for (const [tab, text] of [
        ["Status", "View"],
        ["Projects", "Repo"],
      ]) {
        await run(`__tab(${JSON.stringify(tab)})`);
        const r = await run(
          `(() => { const a = [...document.querySelectorAll("a")].find((a) => a.textContent.trim() === ${JSON.stringify(text)}); a.scrollIntoView({ block: "center" }); const b = a.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`,
        );
        await send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: r.x,
          y: r.y,
        });
        // Headless has no hover-capable pointer, so show the hand through keyboard focus instead.
        await run(
          `(() => { const a = [...document.querySelectorAll("a")].find((a) => a.textContent.trim() === ${JSON.stringify(text)}); a.focus({ focusVisible: true }); })()`,
        );
        // Control: a History row's hand under the same pointer emulation.
        out.hoverMedia = await run(`matchMedia("(hover: hover)").matches`);
        await sleep(300);
        const m = await run(
          `(() => { const a = [...document.querySelectorAll("a")].find((a) => a.textContent.trim() === ${JSON.stringify(text)}); const hand = a.querySelector("img"); const hb = hand.getBoundingClientRect(); const label = a.closest("dd")?.previousElementSibling; const range = document.createRange(); if (label) range.selectNodeContents(label); const lb = label && range.getBoundingClientRect(); return { handVisible: getComputedStyle(hand).visibility === "visible", bobbing: hand.getAnimations().length > 0, gapToText: Math.round(a.getBoundingClientRect().left - hb.right), color: getComputedStyle(a).color, handLeft: Math.round(hb.left), handRight: Math.round(hb.right), labelRight: lb && Math.round(lb.right), overlapsLabel: !!lb && hb.left < lb.right, clip: { x: Math.max(0, hb.left - 200), y: hb.top - 45, width: 320, height: hb.height + 60, scale: 1 } }; })()`,
        );
        const { data } = await send("Page.captureScreenshot", {
          format: "png",
          clip: m.clip,
        });
        writeFileSync(
          `${out}/link-${w}-${text}.png`,
          Buffer.from(data, "base64"),
        );
        delete m.clip;
        out[`${w}-${text}`] = m;
        await send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: 1,
          y: 1,
        });
      }
    }
    return out;
  },

  // Contact redirect timeline: when each dialogue stage finishes after the click.
  async timeline() {
    await size(1440, 900);
    await load();
    await prep();
    return await run(`(async () => {
      let openedAt; window.open = () => { openedAt = performance.now(); return { opener: 1 }; };
      const s = [...document.querySelectorAll("section")].find((x) => x.textContent.includes("Leave a message"));
      const link = [...s.querySelectorAll("a, button")].find((b) => b.textContent.trim() === "GitHub");
      const marks = {}; const t0 = performance.now();
      const mark = (k) => { if (!(k in marks)) marks[k] = Math.round(performance.now() - t0); };
      link.click();
      while (!openedAt && performance.now() - t0 < 4000) {
        await new Promise((r) => requestAnimationFrame(r));
        const text = s.innerText;
        if (!text.includes("GitHub")) mark("choicesErased");
        if (marks.choicesErased !== undefined && !text.includes("always open") && !text.includes("Got it")) mark("dialogueErased");
        if (text.includes("Got it, redirecting now!")) mark("redirectTyped");
      }
      marks.windowOpen = Math.round(openedAt - t0);
      return marks;
    })()`);
  },

  // Spacing pass: crops of every window the 12px scale touched.
  async spacing() {
    const crop = async (name, selector) => {
      const r = await run(
        `(() => { const e = ${selector}; if (!e) return null; e.scrollIntoView({ block: "center" }); const b = e.getBoundingClientRect(); return { x: Math.max(0, b.left - 8), y: Math.max(0, b.top - 8), width: Math.min(b.width + 16, innerWidth), height: Math.min(b.height + 16, innerHeight), scale: 1 }; })()`,
      );
      if (!r) return name + ": missing";
      const { data } = await send("Page.captureScreenshot", {
        format: "png",
        clip: r,
      });
      writeFileSync(`${out}/sp-${name}.png`, Buffer.from(data, "base64"));
      return name;
    };
    const sec = (text) =>
      `[...document.querySelectorAll("section")].find((s) => s.textContent.includes(${JSON.stringify(text)}))`;
    const done = [];
    for (const [w, h] of [
      [1440, 900],
      [1280, 800],
      [390, 844],
    ]) {
      await size(w, h);
      await load();
      await prep();
      const tab = async (t) => {
        if (w < 768) await run(`__tab(${JSON.stringify(t)})`);
        else if (w < 1280 && t !== "Status")
          await run(`__tab(${JSON.stringify(t)})`);
      };
      await tab("Status");
      done.push(await crop(`${w}-status`, sec("Resume")));
      await run(
        `(() => { const b = [...document.querySelectorAll("button, a")].find((b) => b.textContent.trim() === "Leave a message"); b?.click(); })()`,
      );
      await sleep(1800);
      done.push(await crop(`${w}-contact`, sec("Name")));
      await tab("History");
      done.push(
        await crop(`${w}-history`, `${sec("Experience")}.querySelector("ul")`),
      );
      await tab("Projects");
      await run(
        `(() => { const a = [...document.querySelectorAll("a")].find((a) => a.textContent.trim() === "Repo"); a?.focus({ focusVisible: true }); })()`,
      );
      await sleep(200);
      done.push(
        await crop(
          `${w}-project`,
          `[...document.querySelectorAll("a")].find((a) => a.textContent.trim() === "Repo")?.closest("div.window")`,
        ),
      );
      await tab("Extras");
      await run(`__screen("Music")`);
      done.push(await crop(`${w}-music`, `__activity()`));
      // Config: open Text colors and point at the top-right swatch.
      await run(
        `(async () => { const b = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Text colors"); b.click(); await __w(500); })()`,
      );
      const sw = await run(
        `(() => { const s = ${sec("Window color")}; const btn = s.querySelector('[aria-label="Accent color"]'); if (!btn) return null; btn.scrollIntoView({ block: "center" }); const b = btn.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`,
      );
      if (sw) {
        await send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: sw.x - 30,
          y: sw.y,
        });
        await send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: sw.x,
          y: sw.y,
        });
        await sleep(300);
      }
      done.push(await crop(`${w}-config`, sec("Window color")));
    }
    return done;
  },

  // Config: each setting open with its hand showing; gap from the hand to the label text.
  async config() {
    const out = {};
    const sec = `[...document.querySelectorAll("section")].find((s) => s.textContent.includes("Window color"))`;
    for (const [w, h] of [
      [1440, 900],
      [1280, 800],
      [390, 844],
    ]) {
      await size(w, h);
      await load();
      await prep();
      if (w < 1280) await run(`__tab("Extras")`);
      for (const [setting, target] of [
        ["Window color", '[aria-label="Top left corner"]'],
        ["Text colors", '[aria-label="Text color"]'],
        ["Volume", null],
      ]) {
        await run(
          `(async () => { document.activeElement?.blur(); const b = [...${sec}.querySelectorAll("button")].find((b) => b.textContent.trim() === ${JSON.stringify(setting)}); b.scrollIntoView({ block: "center" }); b.click(); await __w(500); })()`,
        );
        if (target) {
          const t = await run(
            `(() => { const e = ${sec}.querySelector('${target}'); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`,
          );
          if (t) {
            await send("Input.dispatchMouseEvent", {
              type: "mouseMoved",
              x: t.x + 5,
              y: t.y,
            });
            await send("Input.dispatchMouseEvent", {
              type: "mouseMoved",
              x: t.x,
              y: t.y,
            });
            await sleep(300);
          }
        }
        const m = await run(
          `(() => { const s = ${sec}; const label = [...s.querySelectorAll("button")].find((b) => b.textContent.trim() === ${JSON.stringify(setting)}); const r = document.createRange(); r.selectNodeContents(label.querySelector("span") ?? label); const lb = r.getBoundingClientRect(); const hands = [...s.querySelectorAll("img")].filter((i) => getComputedStyle(i).visibility === "visible" && i.getBoundingClientRect().width && i.getBoundingClientRect().left > lb.left + 5 && Math.abs(i.getBoundingClientRect().top - lb.top) < 60); const hb = hands[0]?.getBoundingClientRect(); const box = s.getBoundingClientRect(); return { handToLabelText: hb ? Math.round(hb.left - lb.right) : null, clip: { x: box.left, y: box.top, width: box.width, height: Math.min(box.height, innerHeight - box.top), scale: 1 } }; })()`,
        );
        const { data } = await send("Page.captureScreenshot", {
          format: "png",
          clip: m.clip,
        });
        writeFileSync(
          `${out}/cfg-${w}-${setting.split(" ")[0]}.png`,
          Buffer.from(data, "base64"),
        );
        out[`${w} ${setting}`] = m.handToLabelText;
        await send("Input.dispatchKeyEvent", {
          type: "keyDown",
          key: "Escape",
          code: "Escape",
          windowsVirtualKeyCode: 27,
        });
        await send("Input.dispatchKeyEvent", {
          type: "keyUp",
          key: "Escape",
          code: "Escape",
          windowsVirtualKeyCode: 27,
        });
        await send("Input.dispatchKeyEvent", {
          type: "keyDown",
          key: "Escape",
          code: "Escape",
          windowsVirtualKeyCode: 27,
        });
        await send("Input.dispatchKeyEvent", {
          type: "keyUp",
          key: "Escape",
          code: "Escape",
          windowsVirtualKeyCode: 27,
        });
        await sleep(300);
      }
    }
    return out;
  },

  // Every hand: gap to what it points at, and its leftmost bob position from the window's edge.
  async hands() {
    const measure = (label) => `(() => {
      const hands = [...document.querySelectorAll("img")].filter((i) => i.classList.contains("w-5") && i.classList.contains("h-auto") && getComputedStyle(i).visibility === "visible" && i.getBoundingClientRect().width > 0 && i.getBoundingClientRect().bottom > 0 && i.getBoundingClientRect().top < innerHeight);
      return hands.map((hand) => {
        const anims = hand.getAnimations();
        anims.forEach((a) => { a.pause(); a.currentTime = 0; });
        const h = hand.getBoundingClientRect();
        const bob = anims.length > 0;
        // What the hand points at: the active tab, the first text to its right, or its owner box.
        let target = null;
        if (hand.closest("nav, [role=tablist]") || hand.parentElement.closest("[role=tablist]")) target = document.querySelector("[role=tab][aria-selected=true]");
        let owner = target ?? hand.parentElement;
        let rect;
        for (let e = owner, i = 0; e && i < 4 && !rect; e = e.parentElement, i++) {
          const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.textContent.trim() && !n.parentElement.closest(".sr-only") ? 1 : 3 });
          for (let n = walker.nextNode(); n; n = walker.nextNode()) { const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); if (b.width && b.left >= h.right - 2 && b.bottom > h.top && b.top < h.bottom + 12) { rect = b; owner = e; break; } }
        }
        if (!rect) rect = hand.parentElement.getBoundingClientRect();
        // The nearest frame: a window box (its bevel is a background layer) or an inner window like a popover.
        let win = null; for (let e = hand.parentElement; e && e !== document.body && !win; e = e.parentElement) if (e.classList.contains("window") || e.querySelector(":scope > div > .window.size-full")) win = e;
        const inner = win;
        const w = win?.getBoundingClientRect();
        anims.forEach((a) => a.play());
        return { where: ${JSON.stringify(label)}, target: (owner.innerText || owner.getAttribute("aria-label") || owner.className.toString()).trim().split(String.fromCharCode(10))[0].slice(0, 28), handToTarget: Math.round(rect.left - h.right), bobs: bob, leftmostFromFrame: w ? Math.round(h.left - (bob ? 3 : 0) - w.left) : null, frame: win ? (win.querySelector("h2")?.textContent || win.className.toString().slice(0, 30)) : null, innerBox: inner !== win ? Math.round(h.left - (bob ? 3 : 0) - inner.getBoundingClientRect().left) : null };
      });
    })()`;
    const out = [];
    const origRun = run;
    const safe =
      (fn) =>
      async (...a) => {
        try {
          return await fn(...a);
        } catch (e) {
          out.push({
            where: "ERROR",
            target:
              String(e).slice(0, 160) + " :: " + String(a[0]).slice(0, 80),
          });
        }
      };
    const sec = (t) =>
      `[...document.querySelectorAll("section")].find((s) => s.textContent.includes(${JSON.stringify(t)}))`;
    const focus = safe(async (expr) => {
      await run(
        `(() => { const e = ${expr}; e?.scrollIntoView({ block: "center" }); e?.focus({ focusVisible: true }); })()`,
      );
      await sleep(250);
    });
    const hover = safe(async (expr) => {
      const r = await run(
        `(() => { const e = ${expr}; if (!e) return null; e.scrollIntoView({ block: "center" }); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()`,
      );
      if (r) {
        await send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: r.x + 4,
          y: r.y,
        });
        await send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: r.x,
          y: r.y,
        });
        await sleep(300);
      }
    });
    const away = () =>
      send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
    const escape = async () => {
      for (let i = 0; i < 2; i++) {
        await send("Input.dispatchKeyEvent", {
          type: "keyDown",
          key: "Escape",
          code: "Escape",
          windowsVirtualKeyCode: 27,
        });
        await send("Input.dispatchKeyEvent", {
          type: "keyUp",
          key: "Escape",
          code: "Escape",
          windowsVirtualKeyCode: 27,
        });
      }
      await sleep(300);
    };
    const take = safe(async (label) => {
      out.push(...(await run(measure(label))));
    });
    const act = safe((expr) => run(expr));

    await size(1440, 900);
    await load(6000);
    await prep();
    await take("Contact choice (default)");
    await hover(`${sec("Experience")}.querySelector("li button")`);
    await take("History entry");
    await away();
    await focus(
      `[...document.querySelectorAll("a")].find((a) => a.textContent.trim() === "View")`,
    );
    await take("Status link");
    await focus(
      `[...document.querySelectorAll("a")].find((a) => a.textContent.trim() === "Repo")`,
    );
    await take("Project link");
    await act(`document.activeElement?.blur()`);
    await focus(
      `[...${sec("Window color")}.querySelectorAll("button")].find((b) => b.textContent.trim() === "Window color")`,
    );
    await take("Config row");
    await act(`document.activeElement?.blur()`);
    await act(
      `(async () => { [...${sec("Window color")}.querySelectorAll("button")].find((b) => b.textContent.trim() === "Window color").click(); await __w(400); })()`,
    );
    await hover(
      `${sec("Window color")}.querySelector('[aria-label="Top left corner"]')`,
    );
    await take("Config window swatch");
    await act(
      `(async () => { ${sec("Window color")}.querySelector('[aria-label="Top left corner"]').click(); await __w(500); })()`,
    );
    await take("Config RGB slider");
    await escape();
    await escape();
    await act(
      `(async () => { [...${sec("Window color")}.querySelectorAll("button")].find((b) => b.textContent.trim() === "Text colors").click(); await __w(400); })()`,
    );
    await hover(
      `${sec("Window color")}.querySelector('[aria-label="Text color"]')`,
    );
    await take("Config text swatch (left)");
    await hover(
      `${sec("Window color")}.querySelector('[aria-label="Accent color"]')`,
    );
    await take("Config text swatch (right)");
    await escape();
    await away();
    await act(
      `(async () => { [...${sec("Window color")}.querySelectorAll("button")].find((b) => b.textContent.trim() === "Volume").click(); await __w(400); })()`,
    );
    await take("Config volume");
    await escape();
    await act(
      `(async () => { __activity().querySelector("[aria-haspopup=menu]").click(); await __w(600); })()`,
    );
    await focus(
      `[...document.querySelectorAll("[role=menuitem], [role=menu] button, [role=menu] a")].find((b) => b.textContent.trim() === "Music")`,
    );
    await take("Activity switcher");
    await act(
      `(async () => { [...document.querySelectorAll("[role=menuitem], [role=menu] button, [role=menu] a")].find((b) => b.textContent.trim() === "Music")?.click(); await __w(2500); })()`,
    );
    await escape();
    await act(`__screen("Music")`);
    await focus(`${sec("Recently Played")}?.querySelector("ol li button")`);
    await take("Music stack row");
    await act(`document.activeElement?.blur()`);
    // Limit: take hits until the gauge is full.
    for (let i = 0; i < 60; i++) {
      const full = await run(
        `!!document.querySelector('[aria-label="Limit level 1: restore full HP"]:not([disabled])')`,
      );
      if (full) break;
      await run(
        `(() => { const b = [...document.querySelectorAll("button")].find((b) => (b.getAttribute("aria-label") || "").includes("portrait")); b?.click(); })()`,
      );
      await sleep(500);
    }
    await take("Limit gauge (when full)");

    await size(390, 844);
    await load(6000);
    await prep();
    await act(`__tab("History")`);
    await act(`__tab("Status")`);
    await sleep(600);
    await take("Navbar tab (phone)");
    await take("Contact choice (phone)");
    await act(`__tab("History")`);
    await hover(`${sec("Experience")}.querySelector("li button")`);
    await take("History entry (phone)");
    await away();
    await act(`__tab("Extras")`);
    await focus(
      `[...${sec("Window color")}.querySelectorAll("button")].find((b) => b.textContent.trim() === "Window color")`,
    );
    await take("Config row (phone)");
    // Keep one entry per place (the first measurement of each).
    const seen = new Set();
    return out.filter((m) => {
      const k = m.where + "|" + m.target;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  },

  // Keyboard: tab order reaches every control with a visible focus style.
  async keyboard() {
    await size(1440, 900);
    await load();
    await prep();
    const stops = [];
    for (let i = 0; i < 60; i++) {
      await send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "Tab",
        code: "Tab",
        windowsVirtualKeyCode: 9,
      });
      await send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "Tab",
        code: "Tab",
        windowsVirtualKeyCode: 9,
      });
      await sleep(60);
      stops.push(
        await run(
          `(() => { const e = document.activeElement; if (!e || e === document.body) return "body"; const s = getComputedStyle(e); const visible = s.outlineStyle !== "none" && s.outlineWidth !== "0px" || s.boxShadow !== "none" || !!e.querySelector("svg, img:not([alt=''])") ; return (e.getAttribute("aria-label") || e.textContent.trim().slice(0, 24) || e.id || e.tagName) + (e.matches(":focus-visible") ? "" : " [no focus-visible]"); })()`,
        ),
      );
    }
    await shot("keyboard-last");
    return { stops };
  },
};

try {
  const result = await scenarios[scenario]();
  console.log(
    JSON.stringify(
      {
        scenario,
        result,
        errors: [...new Set(errors)],
        failed: [...new Set(failed)],
      },
      null,
      1,
    ),
  );
} catch (error) {
  console.log(
    JSON.stringify({ scenario, crash: String(error), errors, failed }),
  );
} finally {
  chrome.kill();
}
