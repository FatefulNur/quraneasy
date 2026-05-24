# QuranEasy

Beginner-focused Quran learning app. Full 14-module Tajweed curriculum, trilingual (en / bn / ar-RTL), free-roam with single completion checkbox per topic.

## Stack

- Astro 6 (`output: 'static'`) + React 19 islands.
- Tailwind v4 via `@tailwindcss/vite`.
- shadcn/ui (style `base-nova`, neutral base, lucide icons). Components live under `@/components`.
- Path alias `@` → `src/`.
- Deploy target: Cloudflare (`wrangler.toml`).
- No backend. Content = static JSON. Progress = `localStorage`.

## Layout

```
src/
  pages/          Astro routes
  components/     React + Astro components (ui/ for shadcn)
  lib/            utilities, content loader, i18n, progress
  styles/         global.css (Tailwind + shadcn CSS vars)
  content/        modules/*.json, i18n/*.json, blog/*.md
openspec/
  changes/quran-tilawat-mvp/   active proposal: proposal.md, design.md, specs/, tasks.md
  specs/                       archived/canonical specs
.claude/skills/
  tajweed-author/    author module JSON files
  trilingual-translator/  fill missing locale strings
  curriculum-validator/   validate all module JSON files
```

## Commands

| cmd | action |
| --- | --- |
| `npm run dev` | dev server `localhost:4321` |
| `npm run build` | static build → `dist/` |
| `npm run preview` | preview built site |
| `npm run notify -- "<Module Name>"` | broadcast new-module announcement to Telegram |

## Broadcasting new modules

### First-time setup

1. Open Telegram → search `@BotFather` → send `/newbot` → follow prompts → copy the token.
2. Add the bot as an **administrator** of `@quraneasyguide` (channel Settings → Administrators → Add).
3. Put these in `.env` (never commit this file):
   ```
   TELEGRAM_BOT_TOKEN=your_token_here
   PUBLIC_SITE_URL=https://quraneasy.com
   ```

### Sending a notification

When a new module ships, pass the display name and the module ID (filename slug from `src/content/modules/`):

```bash
npm run notify -- "Tajweed Basics" module-1-tajweed-basics
```

This sends:
```
🕌 New module added on QuranEasy!
📖 Module: Tajweed Basics
👉 Start learning: https://quraneasy.com/learn/module-1-tajweed-basics
```

Expected output:
```
Announced "Tajweed Basics" to @quraneasyguide.
```

Or directly without npm:

```bash
npx tsx --env-file=.env scripts/notify.ts "Tajweed Basics" module-1-tajweed-basics
```

Module IDs match the JSON filenames in `src/content/modules/` (without `.json`), e.g. `module-1-tajweed-basics.json` → `module-1-tajweed-basics`.

### Troubleshooting

| Error | Cause | Fix |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN is not set` | Missing or empty token in `.env` | Add real token to `.env` |
| `PUBLIC_SITE_URL is not set` | Missing site URL in `.env` | Add `PUBLIC_SITE_URL=https://quraneasy.com` to `.env` |
| `Telegram error 403` | Bot not admin in channel | Add bot as administrator in channel settings |
| `Telegram error 404` | Invalid token | Regenerate token via `@BotFather → /revoke` |
| `Usage: tsx scripts/notify.ts` | Missing name or module ID | Pass both: `-- "Name" module-id` |

## OpenSpec workflow

Active spec-driven change: `quran-tilawat-mvp`. Implementation steps live in `openspec/changes/quran-tilawat-mvp/tasks.md`.

- Read `proposal.md` for **why**, `design.md` for **how**, `specs/**/spec.md` for **what** (testable requirements).
- Use `/opsx:apply` to work through tasks. Tick checkboxes as work lands.
- Use `/opsx:archive` once the change ships.
- Don't edit archived specs directly — create a new change.

## Content model

Each file in `src/content/modules/` is a `Module`:

```jsonc
{
  "id": "module-N-slug",
  "order": N,
  "recommendedOrder": N,
  "title": { "en": "...", "bn": "...", "ar": "..." },
  "summary": { "en": "...", "bn": "...", "ar": "..." },
  "submodules": [
    {
      "id": "submodule-slug",
      "title": { "en": "...", "bn": "...", "ar": "..." },
      "definition": { "en": "...", "bn": "...", "ar": "..." },
      "subtopics": [],        // optional
      "letterExamples": [],   // optional: { arabic, translit? }
      "wordExamples": [],     // optional: { arabic, translit?, meaning?: { en, bn } }
      "ayahExamples": [],     // optional: { reference, arabic, translation: { en, bn } }
      "checkItem": { "en": "...", "bn": "...", "ar": "..." }, // optional, falls back to markComplete
      "blogSlug": "slug"      // optional
    }
  ]
}
```

Progress key: `${moduleId}:${submoduleId}` (v2 — 2 segments). One-time migration from v1 (3-segment) runs on first `getProgress()` call.

## Project rules

- **Mobile-first**: design at 360px baseline. Tap targets ≥ 44×44.
- **Theme**: green (primary, ~green-600/700) on white/neutral-50. Defined via shadcn CSS vars in `src/styles/global.css` — do not hardcode colors in components.
- **i18n**: every user-visible string is a locale map `{ en, bn, ar }`. Use `pick(map, locale)` with fallback chain `locale → en → first available`. Never render an empty string.
- **RTL**: when locale is `ar`, set `dir="rtl"` + `lang="ar"` on the relevant root. Use Tailwind logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`) — not directional ones — so layouts mirror. Arabic ayah text is **always** RTL regardless of UI locale.
- **Fonts**: Arabic ayah uses a Quran-appropriate font (Amiri / Scheherazade New). Bangla uses Noto Sans Bengali. Wire via `@fontsource` in `global.css`.
- **Free-roam progression**: No cross-module gating, no within-module gating. Prev/Next always enabled (when not at boundary). One `checkItem` checkbox per submodule for tracking completion. `recommendedOrder` drives landing card sort and numbered badges.
- **Beginner-friendly content**: definition = short paragraph. Show at most 2 ayah examples up-front; rest behind "Load more". Deeper detail belongs in a blog article linked via `blogSlug`.
- **Persistence**: locale at `localStorage["qe:locale"]` (sync, needed at hydration). Progress in **IndexedDB** — database `quraneasy`, store `progress`, key `${moduleId}:${submoduleId}`, value `true`. Access via `src/lib/db.ts` (raw IDB) and `src/lib/progress.ts` (cache + async init). Call `await initProgress()` in `useEffect` before reading progress. Always guard IDB with `typeof indexedDB !== "undefined"`.
- **No backend, no auth, no analytics in MVP.** Don't add them speculatively.

## When making changes

- Edit JSON in `src/content/modules/` to change course content — no code change needed.
- Add new shadcn primitives via `npx shadcn@latest add <name>`; they land under `src/components/ui/`.
- Use Astro components for static surfaces (landing, blog). Use React islands (`client:load`) only where interactivity is required (slide viewer, language switcher).
- Keep the slide viewer in one React island; don't split it across hydration boundaries.

## Out of scope (do not add unless asked)

Audio recitation, user accounts, cross-device sync, quizzes/scoring, search, CMS.
