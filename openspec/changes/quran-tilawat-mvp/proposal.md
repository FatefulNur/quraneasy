## Why

Beginners learning Quran recitation need a focused, mobile-first reference that teaches the rules of Tilawat (rules of Quranic recitation) in small, digestible steps. Existing resources overwhelm new learners with dense theory and too many examples. QuranEasy MVP delivers the Tilawat rules as a guided, slide-based course with strict progression so a beginner finishes one concept before the next is unlocked.

## What Changes

- Add landing page that showcases the app and lists available modules as cards (mobile-first, green/white theme via shadcn/ui).
- Add module detail entry that opens a presentation-style slide viewer with prev/next navigation.
- Add **strict progression gating**: each slide represents one module; the Next control is disabled until every submodule in the current slide is acknowledged/completed.
- Add submodule rendering within slides as a dotted or numbered nested list, derived from JSON content.
- Add i18n for three languages: English, Bangla, and Arabic (Arabic uses RTL layout); language is user-switchable.
- Add the first content module — "Rules of Tilawat" (Bangla: কোরআন তেলাওয়াতের জন্য কি কি প্রয়োজন / rules and prerequisites of Quranic recitation) — authored as JSON with nested submodules.
- Add a small number of curated Quranic Ayah examples per rule, with a "Load more" affordance so beginners are not overloaded up-front.
- Add lightweight blog/article surface (read-only) linked from slides for learners who want deeper detail beyond the beginner slide.
- Content is sourced from static JSON files (no backend) and rendered through Astro + React (shadcn/ui).

## Capabilities

### New Capabilities
- `content-model`: JSON schema for modules, submodules, slides, ayah examples, and per-language strings.
- `landing`: Landing page with hero and module cards listing available learning modules.
- `slide-viewer`: Presentation-style viewer with prev/next, progression gating, and submodule completion tracking.
- `i18n`: Language switching for English, Bangla, Arabic; RTL handling for Arabic.
- `tilawat-module`: First content module covering the rules/prerequisites of Quran Tilawat with submodules and Ayah examples.
- `blog`: Optional long-form article surface linked from slides for deeper exploration.

### Modified Capabilities
<!-- None — greenfield MVP, no existing specs. -->

## Impact

- New Astro pages: landing (`/`), module slide route (e.g. `/learn/[module]`), optional blog routes.
- New React components: `ModuleCard`, `SlideViewer`, `SubmoduleChecklist`, `AyahExample`, `LoadMore`, `LanguageSwitcher`.
- New content directory: `src/content/` (JSON per module + i18n strings).
- Tailwind theme tokens updated for green/white palette; RTL utilities for Arabic.
- Dependencies: stays within current stack (Astro, React, shadcn/ui, Tailwind). No backend, no DB.
- Accessibility: keyboard nav for slides, focus management, sufficient contrast on green/white.
