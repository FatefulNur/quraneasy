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
