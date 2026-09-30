---
description: Run the audit agents — all of them, or only the ones named
argument-hint: "[agent ...]  (empty = full audit)"
---

Run an audit following `.claude/audit-refactor.md` ("Agents and run modes"), with `.claude/project.md` as the standard.

Requested agents: $ARGUMENTS

- No agents named: run the **full audit** — setup, the seven finder agents in parallel, `verifier`, `fixer`, `reporter` — then show me the report and wait for my picks before applying anything.
- One agent named: run it as a **single-agent** run, then `reporter`.
- Several named: run them as a **targeted audit**, then `verifier`, `fixer`, `reporter`.

Agents are defined in `.claude/agents/`. Use the kit in `.claude/audit-kit/`. Test servers go on port 8799, never 8788, and are stopped at the end.
