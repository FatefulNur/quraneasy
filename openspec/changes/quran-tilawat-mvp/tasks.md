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
