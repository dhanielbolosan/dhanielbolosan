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
- Write a standalone HTML report with the base and revision, working-tree scope, findings, proposals, validation, and limitations. Each finding gets severity, file and line, evidence, impact, and fix. Keep proposed work separate from completed fixes.
- Every fix and proposal shows how, as a before/after code comparison: a unified diff block (`-` before, `+` after, with the file path and line) of only the lines that change plus a little context. Completed fixes show the real `git diff` of the change; proposals show the suggested change and are labeled as such. Structural moves show the `git mv` list and one example import change.
- Make it readable and responsive: semantic headings, a short overview, and findings linked to their proposals, with screenshots or measurements when available. Inline styles and native HTML only; no external assets or report app. Escape embedded repo content.
- Open the report at mobile and desktop sizes to check it reads well. Reply with a clickable link and a short summary; the report must stand on its own without the chat.
- After fixes, explain what changed and why, how it follows the repo's conventions, what was tested, and what risks remain. Separate pre-existing work from audit edits.

## Output location

- Start fresh: at the start of a full run, if `audit/` exists, confirm it is Git-ignored (`git check-ignore audit`), then empty it. A single-agent run empties only `audit/<agent>/`. Never delete `audit/` if Git tracks it.
- Everything a run produces goes in the Git-ignored `audit/` folder at the repo root: reports, screenshots, previews, measurements, logs, and one-off scripts. Never `/tmp/`, `previews.local/`, `preview.local/`, or production assets, unless the user names another place.
- Reusable tools live in `.claude/audit-kit/` so the fresh start never deletes them: `browser.mjs` (the headless Chromium harness and its scenarios) and `make-report.py` (merges every agent's findings into the report). Agents treat them as read-only; improvements are proposed, then applied by the orchestrator.
- The report is `audit/audit-report.html` by default. Write findings and proposals before refactoring; after fixes, add the final changes and validation, keeping the original findings marked resolved or outstanding.

## Agents and run modes

Audit agents live in `.claude/agents/`. The main thread is the orchestrator: it sets up, starts agents, applies fixes, and talks to the user. Agents never edit source.

| Agent                | Job                                                       | Needs the browser        |
| -------------------- | --------------------------------------------------------- | ------------------------ |
| `code-conventions`   | writing conventions against project.md                    | no                       |
| `bug-hunter`         | static correctness                                        | no                       |
| `security`           | Functions, secrets, dependencies, headers                 | no                       |
| `stress-tester`      | breaking state in the running app                         | yes                      |
| `ui-consistency`     | measured visual consistency at every breakpoint           | yes                      |
| `accessibility`      | keyboard, focus, screen readers, contrast, reduced motion | yes                      |
| `lighthouse`         | Lighthouse, bundle size, network                          | yes                      |
| `verifier`           | confirms or rejects every finding                         | sometimes                |
| `fixer`              | before/after diffs for confirmed findings                 | no                       |
| `reporter`           | builds and checks `audit/audit-report.html`               | yes (report screenshots) |
| `regression-checker` | re-runs affected checks after fixes                       | yes                      |

### Run modes

- **Full audit** ("run an audit", `/audit`):
  1. Setup (orchestrator): start fresh, record the starting revision and scope (diff vs the base, default `main`, plus the working tree) in `audit/baseline.log`, run the baseline checks (lint, build, tests, Prettier, `git diff --check`), and start the test server.
  2. Find, in parallel: `code-conventions`, `bug-hunter`, `security`, `stress-tester`, `ui-consistency`, `accessibility`, `lighthouse`.
  3. `verifier`, then `fixer`, then `reporter`. Show the user the report and wait for their picks.
  4. Apply the picked fixes (orchestrator, one thread, so changes across files stay coherent), then `regression-checker`, then `reporter` again with final results. Stop the test server.
- **Single agent** (`/audit <agent>`, or "run ui-consistency"): empty only `audit/<agent>/`, start the test server if the agent needs it, run that agent, then `reporter`. Add `verifier` for agents that produce many findings.
- **Targeted audit** (`/audit <agent> <agent>…`): the named agents, then `verifier`, `fixer`, `reporter`.

### Agent contract

- Read `.claude/project.md` and this file first. Work within the scope in `audit/baseline.log`.
- Write only inside `audit/<agent>/`. Findings go in `audit/<agent>/findings.json`:
  `{ "agent": "<name>", "base": "main", "scope": "…", "findings": [{ "id": "<PREFIX>-1", "kind": "bug|a11y|performance|security|ux|visual|convention|structure|uncertain|proposal", "sev": "high|medium|low", "title": "…", "where": "path:line", "evidence": "…", "impact": "…", "fix": "…", "screens": ["audit/<agent>/shots/….png"] }] }`
- Verify every finding before writing it; anything unproven is `uncertain`. Skip what project.md records as deliberate.
- Browser agents share one test server that the orchestrator starts: `npx wrangler pages dev dist --compatibility-date=2026-08-08 --port 8799 --inspector-port 9441` after `npm run build`. Never use port 8788 (the user's `npm run dev:pages`), never stop a process you did not start, and confirm each page loaded before trusting a result. Run the harness with `AUDIT_OUT=audit/<agent>`.
- Return only a short summary to the orchestrator (counts by severity, the top three findings, what could not be checked); the details stay in your folder.
- Cost: a full audit runs about ten agents, several at once, and uses several times the tokens of a single-thread audit. Prefer a single or targeted run for small changes.
