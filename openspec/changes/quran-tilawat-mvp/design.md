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

---

## Expansion Decisions (curriculum buildout)

### D8: Schema reshape — submodule as content unit

Old shape (deprecated): `module → slides[] → submodules[] (= checkboxes)`

New shape:

```json
{
  "id": "module-3-arabic-reading",
  "order": 3,
  "recommendedOrder": 3,
  "title":   { "en": "...", "bn": "...", "ar": "..." },
  "summary": { "en": "...", "bn": "...", "ar": "..." },
  "submodules": [
    {
      "id": "harakat-fatha",
      "title":      { "en": "Fatha", "bn": "ফাতহা", "ar": "الفتحة" },
      "definition": { "en": "...", "bn": "...", "ar": "..." },
      "subtopics": [
        {
          "id": "fatha-on-ba",
          "title": { "en": "Fatha on ب", "bn": "...", "ar": "..." },
          "letterExamples": [
            { "arabic": "بَ", "translit": "ba" }
          ]
        }
      ],
      "letterExamples": [
        { "arabic": "بَ", "translit": "ba" },
        { "arabic": "تَ", "translit": "ta" }
      ],
      "wordExamples": [
        {
          "arabic": "قَالَ",
          "translit": "qāla",
          "meaning": { "en": "he said", "bn": "সে বলল", "ar": "" }
        }
      ],
      "ayahExamples": [
        {
          "reference": "73:4",
          "arabic": "وَرَتِّلِ ٱلْقُرْءَانَ تَرْتِيلًا",
          "translation": { "en": "...", "bn": "..." }
        }
      ],
      "checkItem": { "en": "I practiced these examples", "bn": "...", "ar": "..." },
      "blogSlug": "fatha-deeper"
    }
  ]
}
```

Field semantics:

- `definition` — required locale map; the one-sentence beginner explanation.
- `subtopics[]` — optional; used when a submodule has named sub-sections (e.g. "Lower throat / Middle throat / Upper throat" under Throat). Each subtopic carries its own `title` plus any of `letterExamples` / `wordExamples` / `ayahExamples`. Subtopics do NOT introduce their own `checkItem` — completion stays at the submodule level.
- `letterExamples[]` — bare-token examples (single letter or letter-with-harakat). `arabic` required; `translit` optional. No `meaning` field.
- `wordExamples[]` — full-word examples. `arabic` required; `translit` optional; `meaning` optional locale map.
- `ayahExamples[]` — unchanged from MVP shape (`reference` + `arabic` + `translation` locale map excluding `ar`).
- `checkItem` — locale map for the single "mark complete" checkbox label. Defaults to UI string `markComplete` if omitted.
- `blogSlug` — optional, unchanged.

**Why**: matches the mental model in `QURAN_EASY.md` (Module → Submodule → Definition + Examples). Letter / word / ayah examples have genuinely different shapes and renderings, so splitting them is cleaner than overloading a single `examples[]`.

**Migration**: existing `tilawat-rules.json` is renamed `module-2-preparation.json`; each old "slide" becomes a "submodule"; each old per-slide submodule (checkbox sentence) collapses into the new submodule's `definition` (joined as a paragraph) or is dropped if redundant. A single `checkItem` per new submodule replaces the old multi-checkbox list.

### D9: Free-roam progression with recommended-order highlight

- Within a module: Prev/Next traverse submodules freely. The `checkItem` is the only completion signal; navigation is never blocked by an unchecked item.
- Across modules: no unlock gate. All 14 modules are openable from the landing page at any time.
- Module ordering: each module declares `recommendedOrder` (1–14, matches `QURAN_EASY.md` Module 14 list). The landing renders modules sorted by `recommendedOrder` with a numbered badge and a connecting visual cue ("Recommended path"). A free-roam toggle (or just a secondary sort) lets users re-order alphabetically.

**Why**: beginners need structure; returning learners need flexibility. Free-roam respects experienced users; visible recommended order guides beginners.

**Trade-off**: removes the "you can't skip" guarantee from MVP. Acceptable — `QURAN_EASY.md` Module 14 already publishes the suggested order, so guidance is editorial, not enforced.

### D10: Per-module and overall progress

- Module progress = `checkedSubmodules / totalSubmodules`.
- Persisted under existing key `qe:progress` but the keying scheme generalizes to `${moduleId}:${submoduleId}` (the old triplet's third component drops because there is now only one check per submodule).
- **Migration**: an `MVP_PROGRESS_RESET` flag in `src/lib/progress.ts` causes a one-time `localStorage` purge on first load after the expansion ships. We accept losing MVP users' progress because the schema is incompatible and the user base is effectively zero pre-launch.
- Landing card shows progress badge + bar; "complete" state earns a checkmark.

### D11: Audio explicitly deferred to v2

Makharij (Module 4), Ghunna (Module 9), Qalqalah (Module 11), Madd (Module 10) are inherently auditory. We acknowledge the gap rather than paper over it: each affected submodule's `definition` includes a one-line "best learned with a teacher / audio reference" hint in all three locales. No audio player, no waveform, no recording capture in this update.

### D12: Authoring tooling — Claude skills

Three skills live in `.claude/skills/` (project-local, checked into the repo):

- `tajweed-author` — guides authoring a new module: prompts for definition, letter/word/ayah examples, subtopics; enforces the schema; checks Arabic harakat are present where the example calls for them.
- `trilingual-translator` — produces consistent en/bn/ar translations for a given content payload, holding terminology (e.g. always "tajweed", "makharij", "ghunna" as proper nouns; consistent Bangla spellings like "তাজবীদ", "মাখারিজ").
- `curriculum-validator` — validates a module JSON against the new schema, reports missing locales / malformed example shapes / unreferenced `blogSlug`s.

**Why**: 14 modules × ~5 submodules × 3 locales × multiple example fields = hundreds of locale strings. Skills keep ongoing additions schema-compliant without re-reading the spec each time.

**Out of scope**: a runtime validator on the loader. The loader keeps its existing soft-validation (skip-with-warning). Strict validation is an authoring-time concern.

### D13: IndexedDB as the persistence layer (replaces localStorage for progress)

- Progress (`qe:progress`) moves to **IndexedDB** — database `quraneasy`, object store `progress` (key: `${moduleId}:${submoduleId}`, value: `boolean`).
- Locale preference (`qe:locale`) stays in **localStorage** — it must be read synchronously during hydration before React mounts.
- A thin async wrapper `src/lib/db.ts` handles IDB open/upgrade/CRUD; `src/lib/progress.ts` exposes an **in-memory cache** seeded by an async `initProgress()` call, so all downstream callers stay synchronous after init.
- One-time migration on `initProgress()`: if old localStorage `qe:progress` key exists, import its entries into IDB, then remove the localStorage key.
- IDB is not available in SSR (Astro build); all IDB calls are guarded by `typeof indexedDB !== "undefined"`. Fallback for rare browsers without IDB: no-op (progress not saved, no crash).

**Why over localStorage:**
- Async — writes never block the main thread.
- Storage quota: IDB gets ≥ 50 MB vs localStorage's ~5 MB (room for future audio caches, offline data).
- Structured: can add `updatedAt` timestamp per entry without schema churn.
- Future-proof: Service Worker / offline sync can read the same IDB.

**Trade-off:** Init is now async — components must await `initProgress()` before rendering progress-dependent UI. Handled via `useEffect` with a loading flag; UI renders immediately with empty progress then fills in.
