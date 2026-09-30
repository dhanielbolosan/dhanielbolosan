---
description: Run the audit agents — only those the changed files need, all of them, or the ones named
argument-hint: "[full | agent ...]  (empty = scoped to the changed files)"
---

Run an audit following `.claude/audit-refactor.md` ("Agents and run modes"), with `.claude/project.md` as the standard.

Requested agents: $ARGUMENTS

- Nothing named: run the **scoped audit**. Pick the finders from the changed files with the table in "Choosing finders from the changed files", tell me which ones and why in one line, then setup, those finders in parallel, `verifier` if anything is high or medium, and the report scripts. Show me the report and wait for my picks before applying anything.
- `full`: the **full audit** with all seven finders, then the same steps.
- One agent named: a **single-agent** run, then the report scripts.
- Several named: a **targeted audit**, then `verifier` (if anything is high or medium) and the report scripts.

Agents are defined in `.claude/agents/`. Use the kit in `.claude/audit-kit/`. Test servers go on port 8799, never 8788, and are stopped at the end. The `fixer` runs only when I ask for Claude-written diffs; otherwise `/handoff` passes the finders' fixes on.
