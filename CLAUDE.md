# QuranEasy

Beginner-focused Quran learning app. MVP: trilingual (en / bn / ar-RTL) slide course on Rules of Tilawat.

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
  content/        modules/*.json, i18n/*.json, blog/*.md (added per MVP)
openspec/
  changes/quran-tilawat-mvp/   active proposal: proposal.md, design.md, specs/, tasks.md
  specs/                       archived/canonical specs
```

## Commands

| cmd | action |
| --- | --- |
| `npm run dev` | dev server `localhost:4321` |
| `npm run build` | static build → `dist/` |
| `npm run preview` | preview built site |

## OpenSpec workflow

Active spec-driven change: `quran-tilawat-mvp`. Implementation steps live in `openspec/changes/quran-tilawat-mvp/tasks.md`.

- Read `proposal.md` for **why**, `design.md` for **how**, `specs/**/spec.md` for **what** (testable requirements).
- Use `/opsx:apply` to work through tasks. Tick checkboxes as work lands.
- Use `/opsx:archive` once the change ships.
- Don't edit archived specs directly — create a new change.

## Project rules

- **Mobile-first**: design at 360px baseline. Tap targets ≥ 44×44.
- **Theme**: green (primary, ~green-600/700) on white/neutral-50. Defined via shadcn CSS vars in `src/styles/global.css` — do not hardcode colors in components.
- **i18n**: every user-visible string is a locale map `{ en, bn, ar }`. Use `pick(map, locale)` with fallback chain `locale → en → first available`. Never render an empty string.
- **RTL**: when locale is `ar`, set `dir="rtl"` + `lang="ar"` on the relevant root. Use Tailwind logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`) — not directional ones — so layouts mirror. Arabic ayah text is **always** RTL regardless of UI locale.
- **Fonts**: Arabic ayah uses a Quran-appropriate font (Amiri / Scheherazade New). Bangla uses Noto Sans Bengali. Wire via `@fontsource` in `global.css`.
- **Progression gating is strict**: Next is disabled until every submodule on the current slide is checked. Bypass attempts (ArrowRight, swipe, deep-link URL) MUST fail. Deep-link to a later slide redirects to the earliest incomplete slide.
- **Beginner-friendly content**: submodule text = one short sentence. Show at most 2 ayah examples up-front; rest behind "Load more". Deeper detail belongs in a blog article linked via `blogSlug`.
- **Persistence**: locale at `localStorage["qe:locale"]`, progress at `localStorage["qe:progress"]` keyed `${moduleId}:${slideId}:${submoduleId}`. Always guard with `typeof window !== "undefined"`.
- **No backend, no auth, no analytics in MVP.** Don't add them speculatively.

## When making changes

- Edit the JSON in `src/content/modules/` to change course content — no code change needed.
- Add new shadcn primitives via `npx shadcn@latest add <name>`; they land under `src/components/ui/`.
- Use Astro components for static surfaces (landing, blog). Use React islands (`client:load`) only where interactivity is required (slide viewer, language switcher).
- Keep the slide viewer in one React island; don't split it across hydration boundaries — progression state must stay coherent.

## Out of scope (do not add unless asked)

Audio recitation, user accounts, cross-device sync, quizzes/scoring, search, CMS, multi-module beyond Tilawat Rules in MVP.
