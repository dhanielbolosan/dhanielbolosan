# Audit, refactor, and cleanup

My ground rules for reviewing code. Project conventions live in [project.md](project.md); audits check changes against them.

## Scope

- Audit before editing. An audit-only request gets a report, not fixes. If audit and refactor were both requested, show findings first, then continue without asking again.
- Branch audits compare against the requested base (default `main`) and cover every change: added, deleted, renamed, staged, unstaged, and untracked. Read surrounding code and callers.
- Use the repo as the reference for structure, naming, imports, formatting, spacing, patterns, and comments.
- Sort findings into confirmed bugs, convention mismatches, optional improvements, and deliberate product choices.
- Keep the user's work and latest decisions. No redesigns, unrelated features, or publishing.

## Code style

- Consistent grouping, blank lines, imports, and naming. One-line comments on meaningful blocks, explaining purpose or constraints, not syntax.
- Reuse in order: existing helpers and components, standard library and browser features, installed dependencies. Add a file or helper only for a clear responsibility or real deduplication.
- Keep feature code together; shared UI and logic go in the existing shared folders. No parallel structures.
- Smallest correct change. Remove dead code and wasted work. No speculative abstractions, pointless options, new dependencies, or empty wrappers.
- Fix root causes in the shared path after checking callers. Keep validation, error handling, security, and accessibility intact.

## Correctness and UI

- Check logic, rounding, bounds, state changes, async races, duplicate actions, persistence, and failure paths.
- Check effect dependencies and cleanup for timers, animation frames, observers, listeners, and queued work.
- Measure real performance costs (repeat work, extra renders, loading, hidden work). Name the work an optimization removes.
- Compare typography, colors, padding, gaps, alignment, borders, pointers, bars, focus, transitions, and responsiveness with existing UI. Keep intentional choices.

## Validation

- Run lint, typecheck/build, and tests; check formatting and whitespace on changed files. Finish with no new errors, and never suppress or weaken checks.
- Confirm the tests actually ran; zero tests passing is not coverage.
- Investigate editor errors even when the CLI passes, against the real TypeScript config. Separate app errors, pre-existing failures, and toolchain warnings.
- Playtest in a real browser: appearance, console, and network failures at mobile, tablet, and desktop, short viewports, breakpoint edges, keyboard, and reduced motion.
- Stress-test state: rapid input, switching mid-animation, resizing, scrolling, timeouts, reload persistence, and slow or failed requests. Mock external writes like contact submissions.
- Measure geometry when alignment matters; use screenshots when code can't prove it looks right. Say exactly which browsers and sizes were checked.
- Add a small runnable test for nontrivial new logic or a confirmed bug, using the existing setup. Test behavior, not implementation or wording.
- If a check can't run, say so. Never call untested behavior verified.

## Reporting

- Lead with actionable findings by impact: file and line, trigger, consequence, and a concrete fix. Mark uncertain and optional items.
- Write a standalone HTML report (unless asked otherwise) with the base and revision, working-tree scope, findings, proposals, validation, and limitations. Each finding gets severity, file and line, evidence, impact, fix, and a before/after when it helps. Keep proposed work separate from completed fixes.
- Make it readable and responsive: semantic headings, a short overview, and findings linked to their proposals, with screenshots or measurements when available. Inline styles and native HTML only; no external assets or report app. Escape embedded repo content.
- Open the report at mobile and desktop sizes to check it reads well. Reply with a clickable link and a short summary; the report must stand on its own without the chat.
- After fixes, explain what changed and why, how it follows the repo's conventions, what was tested, and what risks remain. Separate pre-existing work from audit edits.

## Output location

- Everything goes in the Git-ignored `audit/` folder at the repo root: reports, screenshots, previews, measurements, logs, and check scripts. Never `/tmp/`, `previews.local/`, `preview.local/`, or production assets, unless the user names another place.
- The report is `audit/audit-report.html` by default. Write findings and proposals before refactoring; after fixes, add the final changes and validation, keeping the original findings marked resolved or outstanding.
