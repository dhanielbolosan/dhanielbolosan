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
- Reusable tools live in `.claude/audit-kit/` so the fresh start never deletes them: `browser.mjs` (the headless Chromium harness and its scenarios, including `probe` for one-off page scripts), `make-report.py` (merges every agent's findings into the report), `check-report.mjs` (the report's layout and link check at 390 and 1280), `scan-conventions.mjs` (the free pattern pass for `code-conventions`), and `run-lighthouse.mjs` (3 runs per preset, medians in `audit/lighthouse/summary.json`). Agents treat them as read-only; improvements are proposed, then applied by the orchestrator.
- The report is `audit/audit-report.html` by default. Write findings and proposals before refactoring; after fixes, add the final changes and validation, keeping the original findings marked resolved or outstanding.

## Agents and run modes

Audit agents live in `.claude/agents/`. The main thread is the orchestrator: it sets up, starts agents, applies fixes, and talks to the user. Agents never edit source.

| Agent                | Job                                                       | Needs the browser | Model  |
| -------------------- | --------------------------------------------------------- | ----------------- | ------ |
| `code-conventions`   | writing conventions against project.md                    | no                | sonnet |
| `bug-hunter`         | static correctness                                        | no                | opus   |
| `security`           | Functions, secrets, dependencies, headers                 | no                | sonnet |
| `stress-tester`      | breaking state in the running app                         | yes               | sonnet |
| `ui-consistency`     | measured visual consistency at every breakpoint           | yes               | sonnet |
| `accessibility`      | keyboard, focus, screen readers, contrast, reduced motion | yes               | sonnet |
| `lighthouse`         | Lighthouse, bundle size, network                          | yes               | sonnet |
| `verifier`           | confirms or rejects high and medium findings              | sometimes         | opus   |
| `fixer`              | optional: before/after diffs for the picked findings      | no                | sonnet |
| `reporter`           | optional: diagnoses a report the kit scripts fail on      | yes               | haiku  |
| `regression-checker` | re-runs affected checks after fixes                       | yes               | sonnet |

Models are set in each agent's frontmatter; judgment-heavy agents keep the session model (`inherit`), the rest run on cheaper ones.

### Choosing finders from the changed files

List the scope with `git diff --name-only <base>...HEAD` plus `git status --porcelain`, then run only the finders it touches:

| Changed                                                                           | Finders                                               |
| --------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `functions/`, `src/lib/integrations/`, `package.json`, `public/_headers`          | `security`, `bug-hunter`                              |
| `src/**/*.ts`, `src/**/*.tsx` logic (hooks, `use-*.ts`, `src/lib/`)               | `bug-hunter`, `code-conventions`, `stress-tester`     |
| `src/**/*.tsx` markup or class names, `src/index.css`                             | `code-conventions`, `ui-consistency`, `accessibility` |
| `public/`, `src/assets/`, `index.html`, `vite.config.ts`, fonts, new dependencies | `lighthouse`                                          |
| only `.claude/`, docs, or `audit/`                                                | none: say so and stop                                 |

### Run modes

- **Scoped audit** (`/audit` with no agents, the default):
  1. Setup (orchestrator): start fresh, record the starting revision and scope (diff vs the base, default `main`, plus the working tree) in `audit/baseline.log`, run the baseline checks (lint, build, tests, Prettier, `git diff --check`), and start the test server only if a chosen finder needs the browser.
  2. Find, in parallel: the finders the table above picks.
  3. `verifier` when there are any high or medium findings. Then the orchestrator builds the report itself: `python3 .claude/audit-kit/make-report.py` and `node .claude/audit-kit/check-report.mjs`; start `reporter` only if the check fails. Show the user the report and wait for their picks.
  4. Apply the picked fixes (orchestrator, one thread, so changes across files stay coherent), or hand them to another tool with `/handoff <picks and decisions>`, which writes `audit/handoff-prompt.md` for a tool that can't run these agents (such as Codex). Run `fixer` first only when the user wants Claude-written diffs, and only for the picked IDs. Then `regression-checker`, and rebuild the report with the scripts. Stop the test server.
- **Full audit** (`/audit full`, before merging a big branch): the same steps with all seven finders.
- **Single agent** (`/audit <agent>`, or "run ui-consistency"): empty only `audit/<agent>/`, start the test server if the agent needs it, run that agent, then build the report with the scripts. Add `verifier` when it finds anything high or medium.
- **Targeted audit** (`/audit <agent> <agent>…`): the named agents, then `verifier` (as above) and the report scripts.

### Agent contract

- Read `.claude/project.md` and this file first. Work within the scope in `audit/baseline.log`.
- Write only inside `audit/<agent>/`. Findings go in `audit/<agent>/findings.json`:
  `{ "agent": "<name>", "base": "main", "scope": "…", "findings": [{ "id": "<PREFIX>-1", "kind": "bug|a11y|performance|security|ux|visual|convention|structure|uncertain|proposal", "sev": "high|medium|low", "title": "…", "where": "path:line", "evidence": "…", "impact": "…", "fix": "…", "screens": ["audit/<agent>/shots/….png"] }] }`
- Verify every finding before writing it; anything unproven is `uncertain`. Skip what project.md records as deliberate.
- Browser agents share one test server that the orchestrator starts: `npx wrangler pages dev dist --compatibility-date=2026-08-08 --port 8799 --inspector-port 9441` after `npm run build`. Never use port 8788 (the user's `npm run dev:pages`), never stop a process you did not start, and confirm each page loaded before trusting a result. Run the harness with `AUDIT_OUT=audit/<agent>`.
- Return only a short summary to the orchestrator, at most 10 lines: counts by severity, the top three findings, and what could not be checked. Never paste findings JSON into the reply; the details stay in your folder.
- If the Write tool refuses a file inside `audit/<agent>/` (the background-session worktree guard), write it with a shell heredoc to the same path instead. The user does not use worktrees here. Never write outside `audit/<agent>/` this way.
- Cost: the last full audit ran ten agents and used about 1.1M subagent tokens, most on the session model. Default to the scoped audit, keep `/audit full` for big branches, and turn deterministic checks into kit scripts instead of agent work.
