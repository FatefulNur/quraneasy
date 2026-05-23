## ADDED Requirements

### Requirement: Module JSON shape
The system SHALL load learning content from JSON files located at `src/content/modules/<module-id>.json`. Each module file MUST contain `id`, `order`, `title`, `summary`, and `slides[]`.

#### Scenario: Module file is loaded
- **WHEN** the app boots and reads `src/content/modules/tilawat-rules.json`
- **THEN** the file parses without error and exposes `id`, `order` (integer), `title` (locale map), `summary` (locale map), and a non-empty `slides[]` array

#### Scenario: Module without required fields is rejected
- **WHEN** a module file is missing `id` or `slides`
- **THEN** the loader logs an error and the module is excluded from the landing list

### Requirement: Slide and submodule structure
Each slide MUST have `id`, `title` (locale map), and a `submodules[]` array of at least one item. Each submodule MUST have `id` and `text` (locale map). Slides MAY include `ayahExamples[]` and an optional `blogSlug`.

#### Scenario: Slide has submodules used for gating
- **WHEN** a slide is rendered
- **THEN** each submodule entry produces one checkable item on the slide

#### Scenario: Submodule completion is keyed
- **WHEN** progress is persisted
- **THEN** the key combines `moduleId`, `slideId`, and `submoduleId` so renaming any one does not collide with another

### Requirement: Localized strings use locale maps
Any user-facing string in module JSON MUST be an object keyed by locale code (`en`, `bn`, `ar`). Missing locales SHALL fall back to `en`, then to the first available locale; the renderer MUST NOT emit empty strings.

#### Scenario: Locale fallback on missing translation
- **WHEN** the current locale is `bn` and a submodule's `text.bn` is missing
- **THEN** the renderer displays `text.en` (or the first available locale) instead of an empty string

### Requirement: Ayah example shape
Each ayah example MUST include `reference` (`<surah>:<ayah>`), `arabic` (the verse text in Arabic), and `translation` as a locale map (excluding `ar`, since the Arabic original serves that role).

#### Scenario: Ayah renders with Arabic and translation
- **WHEN** an ayah example is shown in `en` locale
- **THEN** the card shows the Arabic verse (RTL) plus `translation.en` and the `reference`

### Requirement: UI strings file per locale
The system SHALL store UI chrome strings (button labels, nav, errors) in `src/content/i18n/<locale>.json` separate from module content.

#### Scenario: UI strings loaded by locale
- **WHEN** the user switches locale to `ar`
- **THEN** UI labels are sourced from `src/content/i18n/ar.json`

## MODIFIED Requirements

### Requirement: Slide and submodule structure
Each module JSON file MUST expose a non-empty `submodules[]` array (the legacy `slides[]` key is removed). Each submodule MUST include:

- `id` — unique within the module
- `title` — locale map
- `definition` — locale map containing a one-sentence beginner explanation
- `checkItem` — OPTIONAL locale map for the completion checkbox label; when omitted the renderer SHALL fall back to the UI string `markComplete`

Each submodule MAY include any of:

- `subtopics[]` — array of `{ id, title (locale map), letterExamples?, wordExamples?, ayahExamples? }`. Subtopics MUST NOT carry their own `checkItem` or `definition`; completion stays at the submodule level.
- `letterExamples[]`, `wordExamples[]`, `ayahExamples[]` — see "Example shapes" requirement
- `blogSlug` — string slug referencing a blog article

#### Scenario: Submodule renders definition and a single check
- **WHEN** a submodule is rendered
- **THEN** the viewer displays the localized `definition` and one checkbox using `checkItem` (or the `markComplete` UI string if absent)

#### Scenario: Submodule with subtopics renders each subtopic section
- **WHEN** a submodule has a non-empty `subtopics[]`
- **THEN** each subtopic is rendered as a labelled section inside the submodule, with its own example cards, but only one checkbox exists for the whole submodule

#### Scenario: Submodule completion is keyed
- **WHEN** progress is persisted
- **THEN** the key combines `moduleId` and `submoduleId` only (`${moduleId}:${submoduleId}`), so renaming either does not collide with another

### Requirement: Ayah example shape
Each ayah example MUST include `reference` (`<surah>:<ayah>`), `arabic` (the verse text in Arabic), and `translation` as a locale map (excluding `ar`, since the Arabic original serves that role). Ayah examples render distinctly from letter and word examples — typically as a card with reference label, large Arabic block (RTL), and translation below.

#### Scenario: Ayah renders with Arabic and translation
- **WHEN** an ayah example is shown in `en` locale
- **THEN** the card shows the Arabic verse (RTL) plus `translation.en` and the `reference`

## ADDED Requirements

### Requirement: Letter example shape
A letter example MUST include `arabic` (a single Arabic letter or letter-with-harakat token) and MAY include `translit` (a Latin transliteration string, locale-agnostic). Letter examples MUST NOT carry a `meaning` field. The renderer SHALL display letter examples as compact tiles, sized for legibility at 360px width.

#### Scenario: Letter example renders without meaning
- **WHEN** a letterExample with `{ arabic: "بَ", translit: "ba" }` is shown
- **THEN** the tile shows `بَ` prominently with `ba` as a small caption, and no translation field is displayed

#### Scenario: Letter example without translit
- **WHEN** `translit` is absent
- **THEN** only the Arabic token is shown, with no caption row

### Requirement: Word example shape
A word example MUST include `arabic` (a full Arabic word with harakat) and MAY include `translit` (locale-agnostic Latin transliteration) and `meaning` (locale map keyed by `en` / `bn`). The Arabic original carries the `ar` rendering, so `meaning.ar` is not required. The renderer SHALL display word examples as cards larger than letter tiles but smaller than ayah cards.

#### Scenario: Word example shows arabic, translit, and meaning
- **WHEN** a wordExample with arabic + translit + meaning is shown in `bn` locale
- **THEN** the card displays the Arabic word (RTL), the transliteration, and `meaning.bn` (with fallback to `meaning.en` if missing)

#### Scenario: Word example with only arabic
- **WHEN** only `arabic` is provided
- **THEN** only the Arabic word renders, no caption row

### Requirement: Module recommended order
Each module file MUST include a `recommendedOrder` integer field (1-based) used by the landing page to render the recommended learning path. The `order` field is retained for general sorting and MAY equal `recommendedOrder`. When two modules share the same `recommendedOrder`, the landing falls back to `order` then to `id` for a stable display.

#### Scenario: Landing renders modules in recommended order
- **WHEN** the user opens `/` with default sort
- **THEN** modules appear sorted ascending by `recommendedOrder` with a numbered badge per card
