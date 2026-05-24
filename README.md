# QuranEasy

Beginner-focused Quran learning app with a full 14-module Tajweed curriculum. Trilingual (English / বাংলা / العربية), free-roam, no login required.

## Stack

- [Astro 6](https://astro.build) (static output) + React 19 islands
- Tailwind v4 via `@tailwindcss/vite`
- shadcn/ui (style `base-nova`, lucide icons)
- Cloudflare Pages deploy (`wrangler.toml`)
- Progress stored in IndexedDB — no backend, no auth

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Static build → `dist/` |
| `npm run preview` | Preview built site locally |
| `npm run notify -- "<Module Name>" <module-id>` | Broadcast new module to Telegram |

## Project layout

```
src/
  pages/          Astro routes
  components/     React + Astro components (ui/ for shadcn)
  lib/            Utilities, content loader, i18n, progress
  styles/         global.css (Tailwind + shadcn CSS vars)
  content/
    modules/      JSON files — one per Tajweed module
    i18n/         Locale strings (en / bn / ar)
    blog/         Markdown blog articles
openspec/         Spec-driven change proposals and tasks
.claude/skills/   Project-specific Claude Code skills
```

## Content

Course content lives entirely in `src/content/modules/*.json`. Edit JSON to change copy — no code change needed.

Each module follows this schema:

```jsonc
{
  "id": "module-N-slug",
  "order": N,
  "title": { "en": "", "bn": "", "ar": "" },
  "summary": { "en": "", "bn": "", "ar": "" },
  "submodules": [
    {
      "id": "submodule-slug",
      "title": { "en": "", "bn": "", "ar": "" },
      "definition": { "en": "", "bn": "", "ar": "" },
      "checkItem": { "en": "", "bn": "", "ar": "" }
    }
  ]
}
```

## i18n

Three supported locales: `en`, `bn`, `ar`. Arabic UI is full RTL. Every user-visible string uses a locale map `{ en, bn, ar }` — never a bare string. Locale preference stored at `localStorage["qe:locale"]`.

## Progress

Stored in IndexedDB (database `quraneasy`, store `progress`). Key format: `${moduleId}:${submoduleId}`. One checkbox per submodule. No cross-module or within-module gating — fully free-roam.

## Deploying

Targets Cloudflare Pages. Push to `main` triggers deploy via `wrangler.toml` config.

## Broadcasting new modules

Requires a Telegram bot token in `.env`:

```
TELEGRAM_BOT_TOKEN=your_token_here
PUBLIC_SITE_URL=https://quraneasy.com
TELEGRAM_CHANNEL=@yourchannel
```

Then:

```sh
npm run notify -- "Module Name" module-id-slug
```
