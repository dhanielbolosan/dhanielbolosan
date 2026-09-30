// Runs Lighthouse 3x per preset against the test server and prints the medians and every failing audit.
// Usage: node .claude/audit-kit/run-lighthouse.mjs            (runs, then summarizes)
//        node .claude/audit-kit/run-lighthouse.mjs --summary  (summarizes the reports already in audit/lighthouse/)
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("../../audit/lighthouse/", import.meta.url));
const presets = ["mobile", "desktop"];
const runs = 3;
mkdirSync(dir, { recursive: true });

if (!process.argv.includes("--summary")) {
  for (const preset of presets) {
    for (let run = 1; run <= runs; run++) {
      execFileSync(
        "npx",
        [
          "--yes",
          "lighthouse",
          "http://localhost:8799/",
          "--quiet",
          "--output=json",
          "--output=html",
          `--output-path=${dir}${preset}-${run}`,
          "--chrome-flags=--headless=new",
          ...(preset === "desktop" ? ["--preset=desktop"] : []),
        ],
        {
          stdio: "inherit",
          env: {
            ...process.env,
            CHROME_PATH: process.env.CHROME_PATH ?? "/usr/bin/chromium",
          },
        },
      );
    }
  }
}

// Medians of the scores and core metrics, plus audits that failed in most runs.
const median = (values) =>
  values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
const metrics = [
  "first-contentful-paint",
  "largest-contentful-paint",
  "total-blocking-time",
  "cumulative-layout-shift",
  "speed-index",
];
const summary = {};
for (const preset of presets) {
  const reports = Array.from({ length: runs }, (_, i) =>
    JSON.parse(readFileSync(`${dir}${preset}-${i + 1}.report.json`, "utf8")),
  );
  const failing = {};
  for (const report of reports) {
    for (const [id, audit] of Object.entries(report.audits)) {
      if (
        audit.score !== null &&
        audit.score < 0.9 &&
        audit.scoreDisplayMode !== "informative"
      ) {
        failing[id] ??= {
          title: audit.title,
          runs: 0,
          display: audit.displayValue ?? "",
        };
        failing[id].runs++;
      }
    }
  }
  summary[preset] = {
    scores: Object.fromEntries(
      Object.keys(reports[0].categories).map((c) => [
        c,
        median(reports.map((r) => Math.round(r.categories[c].score * 100))),
      ]),
    ),
    runScores: reports.map((r) =>
      Math.round(r.categories.performance.score * 100),
    ),
    metrics: Object.fromEntries(
      metrics.map((m) => [
        m,
        median(reports.map((r) => r.audits[m].numericValue)).toFixed(
          m.includes("shift") ? 3 : 0,
        ),
      ]),
    ),
    requests: median(
      reports.map(
        (r) => r.audits["network-requests"].details?.items?.length ?? 0,
      ),
    ),
    transferKiB: median(
      reports.map((r) =>
        Math.round(r.audits["total-byte-weight"].numericValue / 1024),
      ),
    ),
    failing: Object.entries(failing)
      .filter(([, f]) => f.runs > runs / 2)
      .map(([id, f]) => `${id}: ${f.title} ${f.display}`.trim()),
  };
}
writeFileSync(`${dir}summary.json`, JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary, null, 1));
