// Free first pass for the code-conventions agent: greps src/ for the rules a pattern can catch.
// Usage: node .claude/audit-kit/scan-conventions.mjs [files...]   (default: every file in src/)
// Prints JSON hits as { rule, where, text }; the agent judges each hit instead of re-reading the repo.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files =
  process.argv.length > 2
    ? process.argv.slice(2)
    : execSync("git ls-files src", { encoding: "utf8" }).trim().split("\n");

// Spacing utilities must sit on the 1.5 scale; 6.5 is the hand lane and 8 the hand-between-controls gap (project.md).
const spacing =
  /(?<![\w-])-?(?:[a-z]+:)*-?(?:p[xytrbl]?|m[xytrbl]?|gap(?:-[xy])?|space-[xy])-(\d+(?:\.\d+)?)(?![\w.])/g;
const onScale = (value) =>
  value === 0 || (value * 2) % 3 === 0 || value === 6.5 || value === 8;
const rules = [
  ["bare-dash placeholder", /(?:return|\?|:)\s*["'`](?:—|–|-)["'`]/],
  ["hex color in a class (use an index.css token)", /\[#[0-9a-fA-F]{3,8}\]/],
  ["template-string className (use cn())", /className=\{`/],
];

const hits = [];
for (const file of files.filter((f) => /\.(tsx?|css)$/.test(f))) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, index) => {
      const where = `${file}:${index + 1}`;
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
      for (const [, value] of line.matchAll(spacing)) {
        if (!onScale(Number(value)))
          hits.push({
            rule: "spacing off the 1.5 scale",
            where,
            text: line.trim().slice(0, 140),
          });
      }
      for (const [rule, pattern] of rules) {
        if (pattern.test(line))
          hits.push({ rule, where, text: line.trim().slice(0, 140) });
      }
    });
}
console.log(JSON.stringify(hits, null, 1));
console.error(`${hits.length} hits in ${files.length} files`);
