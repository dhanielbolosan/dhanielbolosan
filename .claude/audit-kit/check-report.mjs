// Checks audit/audit-report.html at 390 and 1280 wide: page overflow, elements past the viewport, broken #links.
// Usage: node .claude/audit-kit/check-report.mjs [anchor ...]   (anchors, e.g. "top pick", also save screenshots to audit/reporter/)
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("../../audit/", import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9960 + Math.floor(Math.random() * 30);
const chrome = spawn(
  "chromium",
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${process.env.TMPDIR ?? "/tmp"}/report-chrome-${port}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

// ---- Chromium over CDP ----
let ws;
for (let i = 0; i < 100 && !ws; i++) {
  try {
    const page = (
      await (await fetch(`http://127.0.0.1:${port}/json`)).json()
    ).find((t) => t.type === "page");
    if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
  } catch {}
  await sleep(200);
}
await new Promise((r) =>
  ws.readyState === 1 ? r() : ws.addEventListener("open", r),
);
let id = 0;
const waiting = new Map();
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  waiting.get(message.id)?.(message.result ?? message.error);
  waiting.delete(message.id);
});
const send = (method, params = {}) =>
  new Promise(
    (r) => (
      waiting.set(++id, r),
      ws.send(JSON.stringify({ id, method, params }))
    ),
  );
const evaluate = async (expression) =>
  (await send("Runtime.evaluate", { expression, returnByValue: true })).result
    .value;

// ---- Measure each width ----
const anchors = process.argv.slice(2);
if (anchors.length) mkdirSync(`${dir}reporter`, { recursive: true });
const report = {};
for (const width of [390, 1280]) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 1400,
    deviceScaleFactor: 1,
    mobile: width < 600,
  });
  await send("Page.navigate", { url: `file://${dir}audit-report.html` });
  await sleep(800);
  report[width] = await evaluate(`({
    pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    wide: [...document.querySelectorAll('main *')].filter((el) => el.getBoundingClientRect().right > innerWidth + 1 && !el.closest('pre, .scroll')).slice(0, 5).map((el) => el.tagName + ' ' + (el.id || el.textContent.slice(0, 40))),
    brokenLinks: [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href').slice(1)).filter((target) => target && !document.getElementById(target)),
  })`);
  for (const anchor of anchors) {
    await evaluate(
      `(a => { const el = a === 'top' ? document.body : document.getElementById(a); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 8); })(${JSON.stringify(anchor)})`,
    );
    await sleep(200);
    const shot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      `${dir}reporter/report-${width}-${anchor}.png`,
      Buffer.from(shot.data, "base64"),
    );
  }
}
console.log(JSON.stringify(report));
chrome.kill();
process.exit(
  Object.values(report).some(
    (r) => r.pageOverflow > 0 || r.wide.length || r.brokenLinks.length,
  )
    ? 1
    : 0,
);
