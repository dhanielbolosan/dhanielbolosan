# Project: FF7-inspired portfolio

A React, TypeScript, Tailwind, and Radix portfolio styled after the FINAL FANTASY VII PS1 menus. These are the user's recorded preferences for all work here; newer instructions win.

## Look and consistency

Match what already exists before inventing anything new. When a value is not listed here, copy it from the closest existing component.

- **Fonts:** menu text, headings, and list items use `font-heading` (M PLUS Rounded 1c); paragraphs use Inter. No pixel fonts.
- **Text colors:** white for content, teal (`--label`) only for labels and section headings, gold (`--gold`) for a single highlight such as a link or key value. No gray content text; gray (`--muted-foreground`, fixed at `#8a8895`) only signals state, such as inactive tabs and placeholders.
- **Text sizes:** `text-base` semibold for item titles, `text-sm` for secondary lines, stats, and labels, `text-xs` only where space forces it. Do not introduce new sizes for one component.
- **Spacing:** windows use `px-5 pt-5 pb-5` with `gap-3` between blocks; lists use `gap-2` with `py-1.5` rows; stat grids use `gap-x-3` (four columns) or `gap-x-4` (two). Reuse these before adding new values.
- **Pointer:** the FF7 hand (`PixelHand`, `RowHand`) sits left of the item, pointing right, with rows at `pl-7`. The hand is the only hover and focus indicator; text does not change color on hover.
- **Surfaces:** use the `window`, `window-bg`, and `bevel` utilities, the 2px hard text shadow, and hard offset shadows. Colors come from `src/index.css` tokens.
- **Motion:** multiples of 150 ms from `src/lib/motion.ts`; the typewriter keeps its 10 ms cadence and erase multiplier of 2. Respect reduced motion.
- **Avoid:** divider lines, dot separators, chevrons, filled or colored tab highlights, segmented controls, self-rated skill bars, pixelated logos, white-silhouette icons, and generic modern UI.
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
└── tests/
```

- Composition lives in `src/App.tsx`, startup in `src/main.tsx`, tokens and utilities in `src/index.css`.
- Shared UI goes in `src/components/`; shared client logic, hooks, timing, and integrations in `src/lib/`. Keep server code in `functions/`, never in client modules.
- Each window keeps its rendering, hooks, data, and helpers under `src/components/windows/<feature>/`. A window with several screens gives each its own subfolder, as Activity does.
- Filenames: `<feature>.tsx`, `<feature>.data.ts`, `<feature>.utils.ts`, `use-<purpose>.ts`, and kebab-case child components. Create only files a feature needs; no `app/`, global `hooks/`, or `helpers/` folders.
- Prototype pages never stay in `public/`. Tests are `tests/*.test.mjs` on Node's built-in runner.

## Recorded decisions

- **Status:** LV is age and Next level is birthday progress in `Pacific/Honolulu`; HP and MP use Aerith's baselines. Portrait hits cost HP and charge Limit (level 1); a full Limit heals to max, including from KO, and KO keeps its Limit. These are deliberate adaptations of FF7. Keep the square portrait that shakes as one piece, stats beside it, and the existing bar layout and alignment. Do not restore Phoenix Down, a heal link, or EXP day text.
- **Config:** Reset to default is the last row. Volume defaults to 20% and zero mutes, with no separate toggle. Keep the credit's wording, bottom-right placement, and wiki link.
- **Navigation:** the navbar tab and the Activity screen are remembered in `localStorage` (`src/lib/saved-choice.ts`); URLs never change for navigation.
- **Audio:** the menu and game sounds are FINAL FANTASY VII clips sourced from another FF7 portfolio repo. New clips match their format (44.1 kHz mono MP3, 64 kbps, peaking near -3 dB). Keep the Back sound removed; unused clips go in `public/audio/unused/`.
- **Contact:** no duplicate submissions, and a failure never loses entered text.
- **Projects:** thumbnails overlapping in narrow windows is intended. Focused images close through Back only.
- **Scroll hint:** appears whenever the active column overflows, lasts 4.5 seconds, fades in 150 ms, and has no gradient overlay.
- **Music (Loopmaster):** a silver Pioneer Loopmaster (1998) playing the last four ListenBrainz listens; the device, the traced mechanism, and the lid details are approved, so do not redesign them. Discs without art are burned CD-Rs written in Permanent Marker. The list is a LIFO stack styled like History, with durations on the title line. Controls lock from a pick until the disc is back at full speed. The function falls back to the last good response in the edge cache when ListenBrainz fails. Mechanical sounds stay realistic and bright, not pitched or gamey. Deferred: song previews and KV.

## Checks

- Run `npm run lint`, `npm run build`, `npm test`, Prettier on changed files, and `git diff --check`.
- Browser-check affected windows at mobile, tablet, and desktop sizes, including rapid input, reduced motion, and failed requests.
- Run test servers on port 8799, never 8788 (the user's `npm run dev:pages`), and stop them afterwards. `npm run dev` does not run Pages Functions.
