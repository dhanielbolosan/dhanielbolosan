# Audit, refactor, and cleanup

## General rules

### Scope and workflow

- Audit first. Inspect the changes and report findings before editing application code. An audit-only request produces a report; it does not authorize fixes. If the user already requested an audit followed by refactoring, present the findings first, then continue the authorized work without asking for the same permission again.
- For a branch audit, compare against the requested base (default `main`). Include every changed file, additions, deletions, renames, and staged, unstaged, and untracked work. Read the surrounding code and callers to understand the complete behavior.
- Use the repository as the reference for structure, naming, imports, formatting, spacing, component patterns, and comments. Separate confirmed bugs, convention mismatches, optional improvements, and deliberate product choices.
- Preserve the user's existing work and latest decisions. Do not expand cleanup into a redesign, unrelated feature work, or publishing changes.

### Code consistency and simplicity

- Keep a consistent visual style in the code: grouping, blank lines, imports, naming, and concise one-line comments explaining meaningful blocks of components, variables, functions, or logic. Comments should explain purpose or a constraint without repeating obvious syntax.
- Reuse existing helpers and components first, then standard library and browser features, then installed dependencies. Add a new helper or file when it gives the code a clear responsibility or removes meaningful duplication.
- Keep feature-specific components, hooks, data, and utilities together. Put shared UI in the existing component directory and shared logic in the existing library directory. Follow the repo's actual conventions rather than introducing a parallel structure.
- Prefer the smallest correct change. Remove dead code and unnecessary work; avoid speculative abstractions, configurable values with no real variation, new dependencies, and wrapper layers with no benefit.
- Fix root causes in the shared path after checking callers. Preserve validation, error handling, security, and accessibility when simplifying.

### Correctness and UI review

- Check algorithms, rounding and bounds, state transitions, asynchronous races, duplicate actions, persistence, and failure paths. Inspect effect dependencies and cleanup for timers, animation frames, observers, listeners, and queued work.
- Evaluate actual performance costs: repeated calculations, unnecessary renders, resource loading, and work performed while hidden. Do not claim an optimization without explaining what work it removes.
- Compare typography, colors, padding, gaps, alignment, borders, pointers, bars, focus states, transitions, and responsive behavior against existing UI. Preserve intentional visual and interaction choices.

### Validation and browser playtesting

- Run the relevant lint, typecheck/build, and existing tests. Check formatting on changed files and whitespace errors. Work must comply with the configured rules and finish without unresolved errors caused by the changes; do not suppress diagnostics or weaken checks to make them pass.
- Confirm the test runner discovers and executes the intended checks. A successful exit with zero tests does not establish test coverage.
- Investigate reported editor errors even when CLI checks pass. Compare the diagnostic with the actual TypeScript configuration and code path. Clearly distinguish application errors, pre-existing failures, and toolchain warnings.
- Playtest affected flows in a real browser and inspect their appearance, console errors, and relevant network failures. Include narrow mobile, tablet, and desktop sizes, short viewports, breakpoint boundaries, keyboard interaction, and reduced motion where relevant.
- Stress-test affected stateful interactions: rapid repeated input, switching views mid-animation, resizing, scrolling, timeout boundaries, persisted settings after reload, and delayed or failed requests. Mock external writes such as contact submissions rather than sending real messages.
- Verify actual geometry when alignment matters, and inspect screenshots when code or assertions cannot establish visual quality. State which browsers and sizes were checked; do not claim coverage that was not run.
- Add a small runnable regression check for nontrivial new logic or a confirmed bug when it tests observable behavior. Reuse the existing test setup; avoid tests that merely duplicate implementation or check wording and formatting.
- If a required check cannot run, report the limitation. Do not describe untested behavior as verified.

### Reporting

- Lead with actionable findings, ordered by impact, with file locations, triggers, consequences, and a concrete remedy. Mark uncertainty and optional improvements clearly.
- Produce the audit report as a standalone HTML file unless the user requests another format. Include the compared base and revision, working-tree scope, findings, proposed changes, validation results, and limitations. Give each finding its severity, file and line, evidence, practical impact, and proposed remedy; include a small before/after example when it clarifies the change. Clearly separate proposed work from completed fixes.
- Use a readable, responsive layout with semantic headings, a short overview, and links between findings and their proposals. Include relevant screenshots or measurements when available. Keep styles inline and use native HTML; avoid external assets, dependencies, or a separate report app. Escape repository content before embedding it in HTML.
- Save all audit outputs in `audit/` at the repository root: HTML reports, screenshots, measurements, logs, and audit-specific check scripts. Do not place these outputs in `/tmp/`, `previews.local/`, or `preview.local/`. Keep them outside production assets and respect a different output location when the user explicitly requests one. Open the report in the browser to verify readability at mobile and desktop sizes. Return a clickable file link and a concise summary in chat; the report must be understandable without the conversation.
- After authorized fixes, give the requested thorough rundown: what changed, why, how it follows repository conventions, what was tested, and remaining risks or limitations. Distinguish pre-existing work from edits made during this audit.

## This project: FF7-inspired portfolio

These constraints apply to this repository. Treat them as recorded user decisions, and follow newer instructions when they change.

### File structure

Use this directory layout as the project reference. Inspect the current tree before an audit so intentional additions or newer user decisions take precedence.

```text
.
├── .claude/
├── audit/
├── functions/
│   ├── api/
│   └── lib/
├── public/
│   ├── audio/
│   │   └── unused/
│   └── projects/
│       └── <project>/
└── src/
    ├── assets/
    │   └── materia/
    ├── components/
    │   └── windows/
    │       ├── activity/
    │       ├── config/
    │       ├── contact/
    │       ├── history/
    │       ├── projects/
    │       ├── skills/
    │       └── status/
    └── lib/
```

- Keep application composition in `src/App.tsx`, startup in `src/main.tsx`, and global tokens and utilities in `src/index.css`.
- Put shared UI in `src/components/`. Keep each window's rendering, child components, hooks, data, and pure helpers together under `src/components/windows/<feature>/`.
- Follow existing filenames: `<feature>.tsx` for the window, `<feature>.data.ts` for static data, `<feature>.utils.ts` for pure feature helpers, `use-<purpose>.ts` for hooks, and kebab-case `.tsx` names for child components. Create only the files a feature actually needs.
- Put shared client logic, hooks, timing, layout definitions, and integrations in `src/lib/`. Keep server endpoints under `functions/api/` and server helpers under `functions/lib/`; do not mix server-only code into client modules.
- Keep imported UI assets in `src/assets/`, URL-served media in `public/`, project screenshots under `public/projects/<project>/`, and audio in `public/audio/` with unused clips in `unused/`.
- When auditing new or moved files, check placement, naming, responsibility, and imports against this structure. Propose consolidation when it removes real duplication; do not add parallel `app/`, global `hooks/`, or generic `helpers/` directories for responsibilities already covered here.
- Keep generated builds out of source and put audit artifacts in the ignored root `audit/` directory, outside production assets. This output directory is created when needed and is not part of the production application.

### Visual language

- This is a React, TypeScript, Tailwind, and Radix portfolio.
- Use `src/index.css` tokens, existing window and bar components, `PixelHand`/row pointer conventions, `src/lib/utils.ts`, and `src/lib/motion.ts`. Preserve the established spacing, text sizes, pointer direction, size, and gap. Avoid another app-level directory for these responsibilities.
- Prefer animation rhythms based on 150 ms or 15 ms where appropriate. This is a preference, not a requirement for every delay: retain the approved 10 ms typing cadence and erase multiplier of 2.
- Keep credits and the mobile scroll hint on the shared adaptive `muted-credit` styling, including the contrasting outline for mixed backgrounds. Keep `--muted-foreground` fixed at `#8a8895`; it is used for inactive navigation and contact placeholders and must not become adaptive by association.
- Preserve the Config credit's current wording, bottom-right placement, and underlined FINAL FANTASY VII wiki link unless the user requests a wording or placement change.

### Status and game interactions

- LV represents age and Next level represents birthday progress in `Pacific/Honolulu`. HP and MP use Aerith/Aeris growth baselines at that level; distinguish deterministic baselines from the game's randomized stat growth.
- Limit level is 1. Physical portrait attacks consume HP and charge Limit; MP remains unchanged. Preserve the documented damage, critical-hit, rounding, and charge behavior unless changes are requested.
- A full Limit heals to maximum HP, including revival from KO, and consumes the gauge. KO retains accumulated Limit. These are intentional portfolio adaptations; do not remove them to enforce exact FF7 rules.
- If checking game accuracy, consult primary mechanics references and distinguish verified game behavior, approximations, and deliberate adaptations in the audit report. The audio README was intentionally deleted; do not require or recreate it.
- Keep the portrait square, with the whole frame and image shaking together. Rapid attacks must respect cooldowns without duplicating or stacking the image.
- Preserve fixed portrait and font sizes and stats beside the portrait. In narrow windows, compact HP/MP totals by hiding the maximum visually while retaining accessible totals; do not drop stats beneath the portrait.
- Keep LV/HP/MP on the left and Next level/Limit on the right. Pair HP with Next level and MP with Limit so bar bottoms align. Maintain label gaps and right-side headings aligned to their bar starts. Right-side bar thickness matches project progress bars.
- Keep the full-Limit pointer to the left, pointing right, using shared sizing and spacing. Do not restore Phoenix Down, a separate heal link, EXP day text, or days-remaining text.

### Config, navigation, audio, and contact

- Reset to default is the last settings row, not pinned to the window bottom. The separate credit can remain at the bottom.
- Volume uses the existing slider style and is the same width as the four-swatch row at the applicable breakpoint. Volume, Low, and High use the established label size. Default volume is 20%; zero mutes, with no separate sound toggle.
- Preserve native audio caching, user-gesture unlocking, volume persistence, duplicate/stale sound guards, and cleanup. Playback errors must not block interactions. Keep unused clips in `public/audio/unused/`.
- Keep the piercing Back sound removed. Preserve the selected sounds: Delete on KO, Limit when the gauge becomes full, Heal on recovery, and Fanfare when contact submission is accepted. Fanfare does not wait for the typewriter.
- Contact must prevent duplicate submissions and handle failure without losing entered data. Test submissions with a mocked endpoint.
- Focused project images close through Back only. Preserve their image proportions and sizing behavior.
- Project thumbnails overlapping in narrow windows is an accepted design choice. Do not flag that overlap as a defect or propose resizing/reflowing the grid to remove it unless the user changes this preference.
- The mobile scroll hint can appear on any tab when its active column actually overflows, including tabs with a single window. Start its full 4.5-second duration when it first appears; scrolling does not dismiss it. Keep its 150 ms fade-in/out, vertical bob, reduced-motion behavior, text-only presentation, and established bottom spacing. No dark gradient overlay.

### Project checks

- Run `npm run lint`, `npm run build`, and `npm test` for application changes, plus Prettier checks on changed text files and `git diff --check`. Document toolchain warnings separately from errors.
- Browser-check affected windows across mobile, tablet, and desktop layouts. For Status changes, exercise rapid hits, critical HP, KO, retained Limit, revival, and level/birthday boundaries. For Config or hint changes, check contrasting palettes, overflow, fades, resizing, persistence, and reduced motion.
- Keep review screenshots, standalone previews, measurements, and audit-specific checks in `audit/` so the user can inspect them in the workspace. Ensure `/audit/` is ignored by Git.
- Write the HTML audit report to `audit/audit-report.html` by default. Include detailed findings and proposed changes before refactoring; update the report after authorized fixes with the final changes and validation. Preserve the original findings and identify resolved and outstanding items.
