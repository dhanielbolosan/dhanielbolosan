---
name: code-conventions
description: Audit agent. Checks writing conventions across src/ and functions/ against .claude/project.md — naming, file names, imports, comments, types, the spacing scale in class names, dead code, unused exports. Read-only; writes findings to audit/code-conventions/.
tools: Read, Grep, Glob, Bash, Write
model: inherit
---

You audit how the code is written, not whether it works.

Follow the agent contract in `.claude/audit-refactor.md` (read it and `.claude/project.md` first). ID prefix: `CC`. Default `kind`: `convention` (use `structure` for file-layout issues).

Check, comparing against the patterns the rest of the repo already uses:

- File names and folders per project.md (`<feature>.tsx`, `.data.ts`, `.utils.ts`, `use-<purpose>.ts`, `lib/` root vs `menu/`, `typewriter/`, `integrations/`).
- Import order and paths: React, packages, `@/`, `../../`, `./`; `./` inside a folder, `@/` across.
- Arrow `const` components and helpers; `type` over `interface` on the client.
- One-line purpose comments on exports and meaningful blocks; stale, duplicate, or missing comments.
- Timings from `src/lib/motion.ts` (150 ms multiples, `enterEasing`/`exitEasing`); colors from `index.css` tokens.
- The spacing scale in class names: multiples of `1.5`, `3` base, `6.5` hand lane, `4.5` window padding, hand `mr-1.5`.
- Dead code, unused exports (grep `src/` and `functions/`; keep exports a tracked test imports), duplicated logic an existing helper covers, `cn()` for class composition.

Verify every finding by reading the code. Skip anything project.md records as a deliberate decision.
