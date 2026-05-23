## ADDED Requirements

### Requirement: Supported locales
The system SHALL support three locales: English (`en`), Bangla (`bn`), and Arabic (`ar`). No other locales are valid in MVP.

#### Scenario: Unknown locale defaults to English
- **WHEN** the app receives a locale identifier that is not `en`, `bn`, or `ar`
- **THEN** it falls back to `en` and does not throw

### Requirement: Locale persists across sessions
The selected locale MUST be persisted to `localStorage` under the key `qe:locale` and restored on next visit.

#### Scenario: Locale survives reload
- **WHEN** the user selects Bangla and reloads the page
- **THEN** the app renders in Bangla without requiring a second selection

### Requirement: RTL handling for Arabic
When the active locale is `ar`, the app root MUST set `dir="rtl"` and `lang="ar"`. Layout MUST use logical CSS properties so spacing and alignment mirror correctly.

#### Scenario: Arabic flips layout
- **WHEN** the user switches the UI locale to Arabic
- **THEN** navigation, slide controls, and content alignment mirror to a right-to-left layout

#### Scenario: Switching back to English restores LTR
- **WHEN** the user switches from Arabic back to English
- **THEN** `dir` becomes `ltr` and the layout returns to left-to-right

### Requirement: Translation fallback chain
When a localized string is missing for the active locale, the renderer SHALL fall back in this order: active locale → `en` → first available locale. The renderer MUST NOT emit an empty string for a missing translation.

#### Scenario: Bangla missing, English present
- **WHEN** the active locale is `bn` and a string has only `en` and `ar` defined
- **THEN** the rendered text is the `en` value
