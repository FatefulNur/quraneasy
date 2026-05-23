## ADDED Requirements

### Requirement: Landing page renders module cards
The system SHALL provide a landing page at `/` that displays a hero section and one card per available module, ordered by each module's `order` field ascending.

#### Scenario: Modules listed on landing
- **WHEN** the user opens `/`
- **THEN** they see a card for every module file in `src/content/modules/` showing its `title` and `summary` in the current locale

#### Scenario: Module card click opens slide viewer
- **WHEN** the user taps a module card
- **THEN** the app navigates to that module's slide route and opens the first slide

### Requirement: Landing is mobile-first
The landing page MUST be designed at a 360px minimum viewport width with no horizontal scroll, then enhance for larger viewports.

#### Scenario: No horizontal overflow on small screens
- **WHEN** the landing page is viewed at 360px width
- **THEN** all content fits without horizontal scrolling and tap targets are at least 44×44 px

### Requirement: Language switcher on landing
The landing page MUST expose a language switcher offering English, Bangla, and Arabic. Switching MUST persist the selection and re-render content in the chosen locale.

#### Scenario: Switching to Arabic flips direction
- **WHEN** the user selects Arabic from the language switcher
- **THEN** the page direction becomes `rtl` and module titles render in Arabic
