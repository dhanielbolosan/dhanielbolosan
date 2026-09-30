# Project: FF7-inspired portfolio

A React, TypeScript, Tailwind, and Radix portfolio styled after the FINAL FANTASY VII PS1 menus. These are the user's recorded preferences for all work here; newer instructions win.

## Look and consistency

Match what already exists before inventing anything new. When a value is not listed here, copy it from the closest existing component.

- **Fonts:** menu text, headings, and list items use `font-heading` (M PLUS Rounded 1c); paragraphs use Inter. No pixel fonts.
- **Text colors:** white for content, teal (`--label`) only for labels and section headings, gold (`--gold`) for a single highlight such as a link or key value. No gray content text; gray (`--muted-foreground`, fixed at `#8a8895`) only signals state, such as inactive tabs and placeholders.
- **Text sizes:** `text-base` semibold for item titles, `text-sm` for secondary lines, stats, and labels, `text-xs` only where space forces it. Do not introduce new sizes for one component.
- **Spacing:** a 12px scale built on 6px (`1.5`) steps, so any multiple of `1.5` fits. `3` (12px) is the base for every gap between items: blocks in a window, label to value in all stat grids, form label to field, swatches, and list rows (`py-1.5` rows with no gap, so rows sit 12px apart). `1.5` (6px) is the half step: icon to text and hand to text. `6.5` (26px) is the hand lane: 20px hand plus 6px, held by `pl-6.5`/`ml-6.5`; it is the half step plus the hand's own width. Where the hand sits between two things (Config's controls, right of their labels), the gap is half step + hand + half step: `ml-8` (32px), so the hand has 6px on each side. `6` (24px) is the double step for larger separations. Windows and popovers use `4.5` (18px) padding: the 6px bevel plus one base step, so content and resting hands start 12px inside the border (anything that bleeds to the frame uses the matching `-mx-4.5`/`-mt-4.5`). The RGB slider popover is the exception to the hand lane: as in FF7, its hand hangs outside the rows and overhangs the frame (`right-full mr-1.5`), so the popover gets no `pl-6.5` and the frame is never widened for the hand. Groups sit `pt-6` (24px) apart. The navbar keeps its wide tab gap. The hand may overlap a neighbor where a grid has no lane (Repo beside Link, the right-hand swatches), as long as it sits 6px from what it points at. Reuse these before adding new values.
- **Pointer:** the FF7 hand (`PixelHand`, `RowHand`) sits left of the item, pointing right, with rows at `pl-6.5`. The hand is the hover and focus indicator, including for links (`TextLink`); text does not change color on hover. The only exceptions are the nav tabs and the full Limit gauge, which brighten.
- **Surfaces:** use the `window`, `window-bg`, and `bevel` utilities, the 2px hard text shadow, and hard offset shadows. Colors come from `src/index.css` tokens.
- **Motion:** multiples of 150 ms from `src/lib/motion.ts`, and cubic-bezier values in steps of 0.15 (`enterEasing` and its mirror `exitEasing` in `motion.ts`; no overshoot); the typewriter keeps its 10 ms cadence and erase multiplier of 2. Respect reduced motion.
- **Avoid:** divider lines, dot separators, chevrons, filled or colored tab highlights, segmented controls, self-rated skill bars, pixelated logos, white-silhouette icons, and generic modern UI.
- **Placeholders:** loading or missing data shows value-shaped stand-ins in the real format (Song Title / Artist / Album, 0:00, 0 days, Jan 01 (0), Jan 2026, Jan 01 00:00:00), never a bare dash.
- **Content:** prefer real, personal data (age as LV, latest GitHub push, recent listens) over invented numbers. Preview or ask before large visual changes.

## File structure

```text
.
├── .claude/
├── audit/                  ignored: audit output, prototypes, one-off scripts
├── functions/
│   ├── api/                Cloudflare Pages endpoints
│   └── lib/                server-only helpers
├── public/
│   ├── audio/
│   │   └── unused/
│   └── projects/<project>/
├── src/
│   ├── assets/
│   │   ├── loopmaster/
│   │   └── materia/
│   ├── components/
│   │   └── windows/
│   │       ├── activity/
│   │       │   ├── github/
│   │       │   └── music/
│   │       ├── config/
│   │       ├── contact/
│   │       ├── history/
│   │       ├── projects/
│   │       ├── skills/
│   │       └── status/
│   └── lib/
│       ├── integrations/
│       ├── menu/
│       └── typewriter/
└── tests/
```

- Composition lives in `src/App.tsx`, startup in `src/main.tsx`, tokens and utilities in `src/index.css`.
- Shared UI goes in `src/components/`; shared client logic, hooks, timing, and integrations in `src/lib/`. Keep server code in `functions/`, never in client modules.
- `src/lib/` mirrors `components/`: general helpers (audio, dates, materia, motion, saved choices, site, media queries, `cn`) sit at its root; logic tied to one part of the site gets a subfolder: `menu/` for the window shell (layout, entrance, fades, swaps), `typewriter/` for dialogue, and `integrations/` for GitHub, ListenBrainz, and the contact schema shared with `functions/`.
- Imports: React, then packages, then `@/` paths, then `../../` shared components, then `./` files. Use `./` inside a folder and `@/` across folders.
- Each window keeps its rendering, hooks, data, and helpers under `src/components/windows/<feature>/`. A window with several screens gives each its own subfolder, as Activity does.
- Filenames: `<feature>.tsx`, `<feature>.data.ts`, `<feature>.utils.ts`, `use-<purpose>.ts`, and kebab-case child components. Create only files a feature needs; no `app/`, global `hooks/`, or `helpers/` folders.
- Prototype pages never stay in `public/`. Tests are `tests/*.test.mjs` on Node's built-in runner.

## Recorded decisions

- **Layout breakpoint:** keep four columns at xl (1280px); narrow windows reflow icon grids and stats without new text sizes.
- **Music stack order:** keep the committed order per set of listens for the visit, including when leaving Music and returning.
- **Status:** LV is age and Next level is birthday progress in `Pacific/Honolulu`; HP and MP use Aerith's baselines. Portrait hits cost HP and charge Limit (level 1); a full Limit heals to max, including from KO, and KO keeps its Limit. These are deliberate adaptations of FF7. Keep the square portrait that shakes as one piece, stats beside it, and the existing bar layout and alignment. Do not restore Phoenix Down, a heal link, or EXP day text.
- **Config:** Reset to default is the last row. Volume defaults to 20% and zero mutes, with no separate toggle. Keep the credit's wording, bottom-right placement, and wiki link.
- **Navigation:** the navbar tab and the Activity screen are remembered in `localStorage` (`src/lib/saved-choice.ts`); URLs never change for navigation.
- **Audio:** the menu and game sounds are FINAL FANTASY VII clips sourced from another FF7 portfolio repo. New clips match their format (44.1 kHz mono MP3, 64 kbps, peaking near -3 dB). Keep the Back sound removed; unused clips go in `public/audio/unused/`.
- **Contact:** no duplicate submissions, and a failure never loses entered text.
- **Projects:** thumbnails overlapping in narrow windows is intended. Focused images close through Back only.
- **Scroll hint:** removed on purpose; phone visitors scroll without a cue.
- **Music (Loopmaster):** a silver Pioneer Loopmaster (1998) playing the last four ListenBrainz listens; the device, the traced mechanism, and the lid details are approved, so do not redesign them. Discs without art are burned CD-Rs written in Permanent Marker. The list is a LIFO stack styled like History, with durations on the title line. A pick made during a swap waits its turn (the latest pick wins, and its row keeps the hand), then swaps straight in without spinning up first; the play/pause button stays locked until the disc is back at full speed. The function falls back to the last good response in the edge cache when ListenBrainz fails. Mechanical sounds stay realistic and bright, not pitched or gamey. Deferred: song previews and KV.

## Checks

- Run `npm run lint`, `npm run build`, `npm test`, Prettier on changed files, and `git diff --check`.
- Browser-check affected windows at mobile, tablet, and desktop sizes, including rapid input, reduced motion, and failed requests.
- Run test servers on port 8799, never 8788 (the user's `npm run dev:pages`), and stop them afterwards. `npm run dev` does not run Pages Functions.
