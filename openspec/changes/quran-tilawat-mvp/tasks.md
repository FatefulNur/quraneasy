## 1. Project Setup

- [x] 1.1 Confirm Astro + React + Tailwind v4 + shadcn/ui boots cleanly (`npm run dev` renders default page).
- [x] 1.2 Install shadcn primitives needed: `button`, `card`, `checkbox`, `dropdown-menu` (for language switcher), `progress` (slide counter).
- [x] 1.3 Add Bangla + Arabic fonts via `@fontsource` (e.g. `@fontsource-variable/noto-sans-bengali`, an Arabic Quran font like `@fontsource/amiri` or `scheherazade-new`); wire them in `src/styles/globals.css`.
- [x] 1.4 Configure Tailwind theme tokens for green/white palette (primary green-600/700, background white/neutral-50) in `globals.css` via shadcn CSS vars.
- [x] 1.5 Set HTML `lang` and `dir` from a top-level Astro layout based on locale (default `en`, `ltr`).

## 2. Content Model

- [x] 2.1 Define a TypeScript type `Module` in `src/lib/content/types.ts` matching the JSON shape in design.md (D2).
- [x] 2.2 Add a JSON loader `src/lib/content/loadModules.ts` that imports all `src/content/modules/*.json`, validates required fields (`id`, `slides[]`, non-empty submodules), and skips invalid files with a console error.
- [x] 2.3 Add `src/lib/content/i18n.ts` exporting a `t(key, locale)` helper and a `pick(localeMap, locale)` helper that implements the fallback chain (locale → en → first available, never empty).
- [x] 2.4 Create UI string files `src/content/i18n/en.json`, `bn.json`, `ar.json` with keys for: `next`, `prev`, `loadMore`, `readMore`, `completeAllFirst`, `startLearning`, `languageEnglish`, `languageBangla`, `languageArabic`, `resetProgress`.

## 3. Tilawat Rules Content Authoring

- [x] 3.1 Create `src/content/modules/tilawat-rules.json` with `id`, `order: 1`, trilingual `title` & `summary`.
- [x] 3.2 Author slides: `purity`, `intention`, `qiblah-posture`, `taawwudh-basmalah`, `tajweed-basics`, `tartil` — each with its `submodules[]` (short bullets in en/bn/ar).
- [x] 3.3 Add ayah examples to relevant slides — minimum 1 ayah on `taawwudh-basmalah` (16:98), `tartil` (73:4); each with Arabic + `en`/`bn` translations + reference.
- [x] 3.4 Set `blogSlug` on slides where a deeper article will exist (at minimum on `purity` → `purity-before-recitation`).
- [x] 3.5 Verify JSON parses and `pick()` returns non-empty for every string in every supported locale (script or manual check).

## 4. i18n & Locale Context

- [x] 4.1 Implement `LocaleProvider` (React context) in `src/components/i18n/LocaleProvider.tsx` storing `locale` and persisting to `localStorage` key `qe:locale`; default to `en` when unknown.
- [x] 4.2 Implement `useLocale()` and `useT()` hooks returning current locale + `t(key)` bound to that locale.
- [x] 4.3 In the slide viewer root, set `dir="rtl"` and `lang="ar"` when locale is `ar`; otherwise `ltr`.
- [x] 4.4 Build `LanguageSwitcher` component using shadcn `dropdown-menu` showing En / বাংলা / العربية; selecting updates context + persists.

## 5. Landing Page

- [x] 5.1 Create `src/pages/index.astro` with a hero (app name, one-line pitch in current locale) and a grid of module cards.
- [x] 5.2 Implement `ModuleCard.tsx` React component (or Astro component if no interactivity needed) showing localized `title`, `summary`, and a CTA button linking to `/learn/<moduleId>`.
- [x] 5.3 Mount `<LanguageSwitcher client:load />` in the landing header.
- [x] 5.4 Verify mobile layout at 360px: no horizontal scroll, tap targets ≥ 44px, cards stack vertically.
- [x] 5.5 Smoke test switching to Arabic flips the page to RTL.

## 6. Slide Viewer (Core MVP)

- [x] 6.1 Create the route `src/pages/learn/[module].astro` that loads the module JSON and renders `<SlideViewer client:load module={...} />`.
- [x] 6.2 Implement `SlideViewer.tsx` holding state: `currentIndex`, `progress` map keyed by `${moduleId}:${slideId}:${submoduleId}`, hydrated from `localStorage` key `qe:progress`.
- [x] 6.3 Implement `SubmoduleChecklist.tsx` rendering shadcn `<Checkbox>` per submodule; toggling updates progress + persists.
- [x] 6.4 Compute `allSubmodulesComplete(slide)` from current progress; bind it to Next button `disabled` + `aria-disabled`.
- [x] 6.5 Wire Prev/Next buttons: Prev disabled on index 0, otherwise always enabled; Next disabled when gating active OR on last slide.
- [x] 6.6 Add keyboard handlers: ArrowLeft → prev (if enabled), ArrowRight → next (only if not gated).
- [x] 6.7 Implement deep-link guard: on mount, if any earlier slide has incomplete submodules, redirect to the earliest incomplete slide.
- [x] 6.8 On slide transition, move focus to the slide `<h2>` heading for screen-reader announcement.
- [x] 6.9 Show a small progress indicator (e.g. `3 / 6`) and a tooltip/inline hint on the disabled Next button reading the `completeAllFirst` UI string.

## 7. Ayah Examples

- [x] 7.1 Implement `AyahExample.tsx`: Arabic text rendered with `dir="rtl"` and an Arabic font; reference + localized translation below.
- [x] 7.2 Implement `AyahList.tsx`: initially renders the first 2 examples; "Load more" button reveals the rest inline; hide the button when none remain.
- [x] 7.3 Verify Arabic block stays RTL even when ambient UI is `en` (LTR).

## 8. Blog Surface

- [x] 8.1 Add Astro content collection or static MDX route at `src/pages/blog/[slug].astro` reading from `src/content/blog/*.md(x)`.
- [x] 8.2 Author one sample article `src/content/blog/purity-before-recitation.md` aligned with the purity slide.
- [x] 8.3 In `SlideViewer`, render a "Read more" link when the current slide has `blogSlug`; opens `/blog/<slug>` in the same tab.
- [x] 8.4 Confirm visiting/not visiting blog has zero effect on progression gating.
- [x] 8.5 Confirm an unknown slug returns the Astro 404 page.

## 9. Persistence & Reset

- [x] 9.1 Implement `src/lib/progress.ts` with `getProgress()`, `setSubmoduleDone(...)`, `clearProgress()` against `localStorage` key `qe:progress`.
- [x] 9.2 Guard all `localStorage` access for SSR (check `typeof window !== "undefined"`).
- [x] 9.3 Add a "Reset progress" item inside the `LanguageSwitcher` dropdown that calls `clearProgress()` and reloads.
- [x] 9.4 Verify progress survives full page reload and module re-entry.

## 10. Accessibility & Polish

- [x] 10.1 Verify color contrast for green-on-white meets WCAG AA for body and button text.
- [x] 10.2 Verify all interactive elements have focus rings visible on keyboard focus.
- [x] 10.3 Verify Bangla and Arabic text render with appropriate font-family fallback chain (no tofu, no Latin fallback).
- [x] 10.4 Run Lighthouse on landing + a slide route on mobile profile; target Performance ≥ 90, Accessibility ≥ 95.

## 11. QA Pass

- [x] 11.1 Manual run-through of the full Tilawat Rules module in `en`, `bn`, and `ar` — all submodules checkable, all slides reachable in order, Next never enabled prematurely.
- [x] 11.2 Attempt to bypass gating via ArrowRight, swipe, and direct URL; confirm all bypass attempts fail.
- [x] 11.3 Reload mid-module; confirm progress restored and viewer opens at the correct slide.
- [x] 11.4 Toggle locale mid-slide; confirm content + UI strings re-render without losing progress.
- [x] 11.5 Build production bundle (`npm run build`) and preview (`npm run preview`); smoke test on a real mobile device or 360px viewport emulation.

---

# Expansion: 14-module Tajweed curriculum

## 12. Authoring skills (create first — used by content tasks)

- [x] 12.1 Create `tajweed-author` skill via skills-creator (.claude/skills/tajweed-author/). Skill drives a guided flow: prompt for module id + recommendedOrder, then for each submodule prompt for `definition` (en/bn/ar), `subtopics`, `letterExamples`, `wordExamples`, `ayahExamples`, `checkItem`, optional `blogSlug`. Skill emits valid JSON per the new schema. Skill MUST reference `QURAN_EASY.md` as the canonical source.
- [x] 12.2 Create `trilingual-translator` skill (.claude/skills/trilingual-translator/). Skill takes a payload (object with locale maps where some locales are filled) and returns the same payload with missing locales translated, keeping a glossary file (`glossary.md`) for stable terminology: tajweed → তাজবীদ / التجويد, makharij → মাখারিজ / المخارج, etc.
- [x] 12.3 Create `curriculum-validator` skill (.claude/skills/curriculum-validator/). Skill walks `src/content/modules/*.json`, validates schema (required fields, locale-map completeness for en/bn/ar, example shape per type, blogSlug references existing blog), and reports pass/fail with file:line where possible.

## 13. Content model migration

- [x] 13.1 Update TS types in `src/lib/content/types.ts`: rename `slides` to `submodules`; add `Submodule` shape with `definition`, `subtopics?`, `letterExamples?`, `wordExamples?`, `ayahExamples?`, `checkItem?`; add `LetterExample`, `WordExample`, and `Subtopic` types; add `recommendedOrder` to `Module`.
- [x] 13.2 Update `loadModules.ts` validation: required fields are now `id`, `order`, `recommendedOrder`, `title`, `summary`, non-empty `submodules[]`; each submodule requires `id`, `title`, `definition`; soft-warn (skip module) on shape failure.
- [x] 13.3 Update `src/lib/progress.ts`: progress key shape becomes `${moduleId}:${submoduleId}` (drop third component). Add a one-time migration that purges the old `qe:progress` value on first read of a value with the old triplet shape; record a `qe:progress:schema = "v2"` sentinel after migration.
- [x] 13.4 Add `src/content/i18n/*` UI strings: `markComplete`, `recommendedPath`, `moduleProgress`, `freeRoam`, plus any new copy used by the landing redesign.

## 14. Content authoring (14 modules, trilingual)

Use the `tajweed-author` skill per module; invoke `trilingual-translator` to fill missing locales; run `curriculum-validator` before marking each task complete.

- [x] 14.1 Migrate existing `tilawat-rules.json` → `src/content/modules/module-2-preparation.json` under the new schema. Preserve all six original topics as submodules (purity, intention, qiblah-posture, taawwudh-basmalah, tajweed-basics, tartil). Convert each old slide's submodule sentences into a single `definition` paragraph + one `checkItem`. Preserve existing ayah examples (16:98 on ta'awwudh, 73:4 on tartil).
- [x] 14.2 Author `module-1-introduction.json` covering "What is Tajweed?" and "Why Tajweed is Important", with word examples قَلْبُ / كَلْبُ / عِلْمٌ / نُورٌ / رَحْمَةٌ.
- [x] 14.3 Author `module-3-arabic-reading.json` with submodules `harakat` (subtopics fatha/kasra/damma), `sukoon`, `shaddah`, `tanween` (subtopics fathatan/kasratan/dammatan); letter and word examples per `QURAN_EASY.md` §3.
- [x] 14.4 Author `module-4-makharij.json` with submodules `jawf`, `throat` (subtopics lower/middle/upper), `tongue`, `lips`, `nasal`; letter sets + word examples per §4.
- [x] 14.5 Author `module-5-sifaat.json` with submodules `tafkheem` (heavy) and `tarqeeq` (light); letter sets + word examples per §5.
- [x] 14.6 Author `module-6-allah-raa.json` with submodules `lam-in-allah` (subtopics heavy/light) and `rules-of-raa` (subtopics heavy/light); word examples per §6.
- [x] 14.7 Author `module-7-noon-saakin.json` with submodules `izhar`, `idgham`, `ikhfa`, `iqlab`; letter sets + word examples per §7.
- [x] 14.8 Author `module-8-meem-saakin.json` with submodules `idgham-shafawi`, `ikhfa-shafawi`, `izhar-shafawi`; word examples per §8.
- [x] 14.9 Author `module-9-ghunna.json` with one submodule `ghunna-definition`; word examples per §9.
- [x] 14.10 Author `module-10-madd.json` with submodules for all seven Madd types per §10.
- [x] 14.11 Author `module-11-qalqalah.json` with submodules `small-qalqalah` and `big-qalqalah`; letter set + word examples per §11.
- [x] 14.12 Author `module-12-tafkheem-tarqeeq.json` (reinforces §5 via deeper examples); word examples per §12.
- [x] 14.13 Author `module-13-waqf.json` with one submodule per stop sign (mandatory م / better-not-to-stop لا / optional ج / better-to-stop ط / pause ص), each with the symbol as a letter example and the rule as the `definition`.
- [x] 14.14 Author `module-14-learning-order.json` as a meta module: one submodule per item in §14's numbered list (1–14), each `definition` summarizing why that step comes next, linking forward to its module via `blogSlug` or in-prose reference.

## 15. UI updates

- [x] 15.1 Update `loadModules.ts` callers and Astro pages to use `submodules` instead of `slides`. Rename internal variables (`currentSlide` → `currentSubmodule`, etc.) in `SlideViewer.tsx`. Keep the file named `SlideViewer.tsx` (it's still a "slide"-style presentation viewer) but update prop names.
- [x] 15.2 Update `SubmoduleChecklist.tsx` → renamed to `SubmoduleCompletion.tsx`: renders one shadcn `<Checkbox>` per submodule using `checkItem` (with `markComplete` fallback). Remove the multi-item checklist behavior.
- [x] 15.3 Remove hard gating on Next: Next is enabled whenever a next submodule exists; Prev whenever a previous one exists. Remove the deep-link guard / earliest-incomplete-redirect logic from `SlideViewer`. Keep the `completeAllFirst` UI string but stop using it on Next (repurpose only if needed elsewhere; otherwise mark deprecated).
- [x] 15.4 Render submodule content in this order: title → definition → subtopics (each with its own examples) → top-level letterExamples → wordExamples → ayahExamples (using existing `AyahList`'s "Load more" affordance) → completion check → blog link.
- [x] 15.5 Add `LetterTile.tsx` rendering a single letter example (large Arabic, small translit caption); add `WordCard.tsx` rendering a word example (Arabic, optional translit, optional meaning in current locale).
- [x] 15.6 Update landing (`src/pages/index.astro` + `ModuleCard.tsx`):
  - render all 14 cards sorted by `recommendedOrder` ascending
  - show numbered badge (1–14)
  - show per-module progress (`checked / total` submodules) and a thin shadcn `Progress` bar
  - render a "Recommended path" label/connector between cards (a left rail, a chevron, or numbered chips connected by a line)
- [x] 15.7 Update `LandingClient.tsx` to compute progress per module from `qe:progress` (post-migration); ensure SSR-safe (`typeof window !== "undefined"`).

## 16. Migration & cleanup

- [x] 16.1 Delete `src/content/modules/tilawat-rules.json` after Module 2 file is authored and verified.
- [x] 16.2 Run a search for any remaining references to the old `slides` field in source code, comments, and i18n files; update or remove.
- [x] 16.3 Update `CLAUDE.md` project rules: replace "single Tilawat Rules module" wording with the 14-module curriculum; update progression rules to free-roam-with-single-check.

## 17. QA pass (expansion)

- [x] 17.1 Run `curriculum-validator` skill on `src/content/modules/*.json`; resolve every reported issue.
- [ ] 17.2 Manual walkthrough of each of the 14 modules in en, bn, ar — verify definition + examples render correctly, the single completion check works, Prev/Next move freely, ayah "Load more" expands as expected.
- [ ] 17.3 Verify landing shows 14 cards in recommended order with badges and progress bars in all three locales (RTL flip on ar).
- [x] 17.4 Verify a returning user with pre-expansion `qe:progress` data has it purged once and lands on a clean state without errors.
- [x] 17.5 Build (`npm run build`) and preview (`npm run preview`); smoke test on a 360px viewport.
- [ ] 17.6 Accessibility: confirm Arabic letter tiles + word cards have sufficient contrast and that all interactive elements (Prev/Next, completion checkbox, module cards) reach focus via Tab in correct order.

## 18. IndexedDB persistence layer

- [x] 18.1 Create `src/lib/db.ts`: async IDB wrapper (`openDB`, `dbGetAllProgress`, `dbSet`, `dbDelete`, `dbClear`, `dbGetSetting`, `dbSetSetting`). DB name `quraneasy`, version 1, stores `progress` + `settings`.
- [x] 18.2 Rewrite `src/lib/progress.ts`: add `initProgress(): Promise<void>` that opens IDB, migrates any old localStorage `qe:progress` entries, seeds in-memory cache. `getProgress()` returns cache (sync). `setSubmoduleDone()` updates cache + fires async IDB write. `clearProgress()` clears cache + IDB.
- [x] 18.3 Update `SlideViewer.tsx`: await `initProgress()` in the mount `useEffect`; set hydrated only after init resolves.
- [x] 18.4 Update `LandingClient.tsx` `useDoneMap`: await `initProgress()` before computing per-module done counts.
- [x] 18.5 Keep `qe:locale` in localStorage (sync read needed at hydration). Update `curriculum-validator` skill note re: IDB.
- [x] 18.6 Build and smoke-test: progress persists across hard reload; migration from old localStorage data works; IDB entries visible in DevTools → Application → IndexedDB → quraneasy.

## 19. Locale propagation bug fix

- [x] 19.1 Remove nested `LocaleProvider` from `LanguageSwitcher.tsx` — render `<LanguageMenu />` directly. Fixes: (a) selected bn/ar locale not propagating to Viewer content, (b) language dropdown not responding on landing page.
