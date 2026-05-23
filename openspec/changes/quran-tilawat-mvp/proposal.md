## Why

Beginners learning Quran recitation need a focused, mobile-first reference that teaches the **full path of Tajweed** — from Arabic letters and harakat through makharij, sifaat, noon/meem rules, madd, qalqalah, and waqf — in small, digestible steps. Existing resources overwhelm new learners with dense theory and too many examples. QuranEasy delivers a progressive 14-module curriculum derived from `QURAN_EASY.md`, where each module is a self-contained topic, each submodule pairs one definition with concrete letter/word/ayah examples, and learners can roam freely while the recommended learning order is visibly highlighted.

The original MVP (single "Rules of Tilawat" module covering manners + a brief tajweed mention) ships as Module 2 of the expanded curriculum. This expansion repositions the app from "etiquette reference" to "complete beginner Tajweed course".

## What Changes

### Already shipped (MVP baseline — Module 2 / "Preparation")
- Landing page with module cards (mobile-first, green/white shadcn theme).
- Slide viewer with prev/next, per-slide gating, submodule checklist.
- Trilingual i18n (en / bn / ar-RTL) with persisted locale.
- Lightweight blog surface linked from slides via `blogSlug`.
- `localStorage` progress under `qe:progress`.

### Expansion (this update)
- **Restructure content schema**: `module → submodule → { definition, letterExamples[], wordExamples[], ayahExamples[], subtopics[], checkItem }`. The unit formerly called a "slide" is renamed `submodule`; the unit formerly called "submodule" (the gating checkbox) collapses to a single `checkItem` per submodule.
- **Add example sub-types**: `letterExamples` (bare Arabic letter/harakat token, optional transliteration), `wordExamples` (Arabic word + optional translation + optional transliteration), `ayahExamples` (full verse with reference + translation locale map) — distinct shapes, each rendered with its own card.
- **Author 14 modules** trilingual (en / bn / ar) following `QURAN_EASY.md`: (1) Intro to Tajweed, (2) Preparation Before Recitation — repurposes existing Tilawat Rules content, (3) Arabic Reading Foundations, (4) Makharij, (5) Sifaat, (6) Rules of Allah Word & Raa, (7) Noon Saakin & Tanween, (8) Meem Saakin, (9) Ghunna, (10) Madd, (11) Qalqalah, (12) Tafkheem & Tarqeeq, (13) Waqf & Ibtida, (14) Recommended Learning Order (meta-module / index).
- **Free-roam progression + recommended order**: gating *within* a submodule (single check to mark complete) remains; gating *across* modules is removed. Landing displays modules in `order` and visually highlights the recommended learning sequence (badge / numbered path).
- **Module-level completion**: a module is "complete" when every submodule's `checkItem` is checked. Landing card shows per-module progress (e.g. `3 / 7`).
- **New skills (authoring tools, not runtime)**: `tajweed-author`, `trilingual-translator`, `curriculum-validator` skills under `.claude/skills/` to keep ongoing content additions schema-compliant.

### Not in this update (deferred to v2)
- Audio recitation playback — makharij/ghunna/qalqalah ideally need audio; text-only acceptable for first ship.
- User accounts / cross-device sync.
- Quiz / recognition micro-tasks.

## Capabilities

### New Capabilities
- `content-model`: JSON schema for modules, submodules, definitions, letter/word/ayah examples, subtopics, and per-language strings.
- `landing`: Landing page with hero and module cards listing all curriculum modules with per-module progress and recommended-order highlighting.
- `slide-viewer`: Presentation-style viewer with prev/next, per-submodule completion checkbox, free intra-module navigation.
- `i18n`: Language switching for English, Bangla, Arabic; RTL handling for Arabic.
- `tilawat-curriculum`: Full 14-module beginner Tajweed curriculum derived from `QURAN_EASY.md`.
- `blog`: Optional long-form article surface linked from submodules for deeper exploration.

### Modified Capabilities
- `content-model`: schema reshaped — `slides[]` renamed to `submodules[]`; per-submodule structure introduces `definition`, split `letterExamples` / `wordExamples` / `ayahExamples`, optional nested `subtopics[]`, and a single `checkItem` for completion.
- `slide-viewer`: progression model relaxed — within-submodule check still required to mark complete, but Next/Prev are no longer hard-gated across submodules; deep-link guard removed.
- `tilawat-module` capability renamed to `tilawat-curriculum` to reflect 14-module scope; the original Tilawat Rules content becomes Module 2 of the new curriculum.

## Impact

- New Astro pages: landing (`/`), module slide route (e.g. `/learn/[module]`), optional blog routes.
- New React components: `ModuleCard`, `SlideViewer`, `SubmoduleChecklist`, `AyahExample`, `LoadMore`, `LanguageSwitcher`.
- New content directory: `src/content/` (JSON per module + i18n strings).
- Tailwind theme tokens updated for green/white palette; RTL utilities for Arabic.
- Dependencies: stays within current stack (Astro, React, shadcn/ui, Tailwind). No backend, no DB.
- Accessibility: keyboard nav for slides, focus management, sufficient contrast on green/white.
