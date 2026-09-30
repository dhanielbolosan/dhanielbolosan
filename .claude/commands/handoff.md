---
description: Write a prompt that hands the audit's fixes to another tool (Codex or any addresser)
argument-hint: "[picks and decisions, e.g. all confirmed; skip PERF-4; CC-10 keep; UI-2 A]"
---

Write a self-contained prompt for an outside tool that cannot run `.claude/agents/`, so it can apply the fixes from the last audit. Main thread only: start no agents and no browser.

Picks and decisions: $ARGUMENTS

1. Read every `audit/<agent>/findings.json`, plus `audit/verifier/findings.json` if it exists. `audit/fixer/findings.json` is optional: without it, each finding's own `fix` is the proposal. If there are no findings at all, stop and say to run `/audit` first.
2. Collect:
   - the IDs to apply: every finding that is `confirmed` (or unverified low) and not rejected, plus any `TEST-*` and `KIT-*` items, then apply my picks (for example "skip X" or "also Y");
   - the "lands with" groups among those IDs;
   - every proposal marked `decision`;
   - the high-risk and visible changes that need a preview.
3. Every `decision` item needs my answer. If one is missing from the arguments, ask for it before writing, listing each item's options in one line. For ambiguous answers, pick the closest option, say which you picked, and note it in the prompt.
4. Write `audit/handoff-prompt.md` from the template below, filled in, then print it in a code block so I can paste it. Add up to three lines on anything I should double-check.

Template (keep the checks and port rules word for word):

```
Apply the fixes from the audit in audit/. Read .claude/project.md (the standard) and
.claude/audit-refactor.md first. The agents in .claude/agents/ are not for you; ignore them.

Sources:
- audit/<agent>/findings.json: findings with evidence and a suggested fix
- audit/fixer/findings.json (if present): before/after diffs, risk, "lands with" groups
- audit/verifier/findings.json: verdicts; apply only what is listed below
- audit/audit-report.html: readable version of both
<the drafted test files under audit/fixer/tests/ and where each goes in tests/>

Apply: <IDs>. Skip everything else.
Treat each diff as a suggestion: check it against the current code and apply the smallest
correct change. Must land together: <groups>.

My decisions:
<one line per decision item: ID, the chosen option in plain words, any preview step>
Record in project.md under "Recorded decisions" only these: <decisions that set a lasting rule>.
Add nothing else to project.md.

Preview first, before committing: <high-risk and visible changes, with what to look at>.

Afterwards run npm run lint, npm run build, and npm test (confirm tests actually ran), then
Prettier on changed files and git diff --check. Browser-check the affected windows at 390, 768
and 1440 wide, plus keyboard and reduced motion, using
`npx wrangler pages dev dist --compatibility-date=2026-08-08 --port 8799 --inspector-port 9441`.
Never use port 8788. Stop the server when done.
Commit in small groups on the current branch. Don't push.
```
