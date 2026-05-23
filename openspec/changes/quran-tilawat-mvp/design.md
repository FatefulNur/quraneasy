## Context

QuranEasy is a greenfield Astro 6 + React 19 app using Tailwind v4 and shadcn/ui (per package.json). The MVP teaches "Rules of Tilawat" — prerequisites and rules for Quran recitation — to absolute beginners. Content is static JSON shipped with the app. The first authored module is the Bangla source: "কোরআন তেলাওয়াতের জন্য কি কি প্রয়োজন" (what is required for Quran recitation), but content is structured so English and Arabic translations slot in by `locale` key. There is no backend, no auth, no analytics in MVP.

## Goals / Non-Goals

**Goals:**
- Mobile-first slide course with strict per-slide gating.
- Trilingual content (en, bn, ar) with RTL support for ar.
- JSON-only content authoring; non-engineers can add modules by editing JSON.
- Beginner-friendly slides: small text load, 1–3 Ayah examples visible, "Load more" expands the rest.
- Clean green/white shadcn-themed UI.

**Non-Goals:**
- Audio recitation playback (defer to v2).
- User accounts / sync progress across devices (use `localStorage` only for MVP).
- Authoring CMS — JSON files only.
- Search across content.
- Quiz scoring / certificates.
- Full blog CMS — MVP blog is static MDX/markdown pages linked from slides (optional, may be a single placeholder article).

## Decisions

### D1: Astro pages + React islands for interactivity
- Landing and blog are static Astro pages.
- Slide viewer is a single React island (`client:load`) — needs progression state, keyboard nav, language switching.
- **Why**: Astro keeps JS payload minimal for landing/blog; React only where state matters.
- **Alternative considered**: Full SPA — rejected, overkill, hurts first-paint on mobile.

### D2: Content as JSON in `src/content/`
- One JSON file per module: `src/content/modules/<id>.json`.
- Module shape:
  ```json
  {
    "id": "tilawat-rules",
    "order": 1,
    "title": { "en": "...", "bn": "...", "ar": "..." },
    "summary": { "en": "...", "bn": "...", "ar": "..." },
    "slides": [
      {
        "id": "purity",
        "title": { "en": "...", "bn": "...", "ar": "..." },
        "submodules": [
          { "id": "wudu", "text": { "en": "...", "bn": "...", "ar": "..." } }
        ],
        "ayahExamples": [
          {
            "reference": "56:79",
            "arabic": "...",
            "translation": { "en": "...", "bn": "..." }
          }
        ],
        "blogSlug": "purity-before-recitation"
      }
    ]
  }
  ```
- UI strings (buttons, nav labels) live in `src/content/i18n/<locale>.json`.
- **Why**: JSON is diffable, easy to translate, no build step for content authors.
- **Alternative**: Astro content collections — viable but adds schema layer; deferred since data is simple and we render via React island.

### D3: Strict progression gating
- Each slide carries a `submodules[]` array. Each submodule has a checkbox in the slide.
- "Next" button is **disabled** until every submodule on the current slide is checked.
- Completion state per `(moduleId, slideId, submoduleId)` persisted to `localStorage` (key: `qe:progress`).
- Prev is always enabled (review allowed).
- **Why**: Forces engagement with each rule; matches the spec ("strictly disabled until all submodules complete").
- **Alternative**: Auto-mark on scroll-to-bottom — rejected, too easy to skim past.

### D4: Beginner-friendly ayah display
- Show first 2 Ayah examples by default.
- "Load more examples" reveals the rest inline.
- Each Ayah card: Arabic (large, RTL, serif), translation in current locale, reference (Surah:Ayah).
- **Why**: Prevents cognitive overload; user controls depth.

### D5: i18n via lightweight context
- Locale state lives in React context inside the slide viewer; for static Astro pages a `?lang=` query or HTML `lang` attribute set in the layout works.
- RTL: when `locale === 'ar'`, set `dir="rtl"` on the viewer root; Tailwind's logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`) handle flips.
- Selected locale persisted to `localStorage` (`qe:locale`).
- Arabic ayah text is **always** rendered RTL regardless of UI locale.
- **Why**: No i18n library needed for this scope; keep bundle small.
- **Alternative**: `react-i18next` — overkill, defer if/when interpolation/plurals appear.

### D6: Blog as optional, secondary surface
- A `blogSlug` on a slide renders a "Read more" link → `/blog/<slug>`.
- Blog pages are static Astro MDX/markdown. MVP may ship 1 article (purity / makharij) as proof of pattern, others stubbed.
- Slide content remains self-contained — blog is never required to progress.

### D7: Theming
- Tailwind v4 tokens: primary = green-600/700 family; backgrounds white/neutral-50; text neutral-900.
- shadcn components themed via CSS variables in `src/styles/globals.css`.
- Mobile-first: design at 360px width baseline; tablet/desktop progressive enhancement.

## Risks / Trade-offs

- **Bangla typography on small screens** → use a Bangla-capable font (system fallback `Noto Sans Bengali` or `@fontsource` Bangla variable); test line-height for combined characters.
- **Arabic shaping in slide layout** → use a proper Arabic font (e.g. `Amiri`/`Scheherazade` for Ayah), large base size, generous line-height.
- **localStorage as only progress store** → user loses progress on a new device. Acceptable for MVP; document in README.
- **Strict gating frustrating** → mitigate with clear visual cue (checkbox count + tooltip on disabled Next: "Complete all items first").
- **JSON content scale** → for >20 modules, JSON-only authoring will get painful. Defer content-collections migration to v2.
- **Translation completeness** → if a string is missing for a locale, fall back to `en`, then to the first available locale; never render an empty node.

## Migration Plan

Greenfield — no migration. Deployment is Astro static build → Cloudflare (wrangler.toml present). Rollback = redeploy previous build.

## Open Questions

- Should the blog be in scope for MVP launch, or stub-only? (Working assumption: stub + 1 sample article.)
- Final ayah translation source per language (license-clear): English (Saheeh International?), Bangla (Mujibur Rahman?). Decide before authoring full content.
- Do we want a global "Reset progress" affordance in MVP? (Working assumption: yes, small button in language switcher menu.)
