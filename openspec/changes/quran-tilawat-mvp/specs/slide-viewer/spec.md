## ADDED Requirements

### Requirement: Slide viewer presents one slide at a time
The system SHALL render exactly one slide at a time in a presentation-style viewer with the slide title, submodule checklist, and any ayah examples for that slide.

#### Scenario: First slide on entry
- **WHEN** the user opens a module
- **THEN** the viewer displays the first slide (index 0) of that module

### Requirement: Prev and Next controls
The viewer MUST provide visible Prev and Next controls. Prev is disabled on the first slide; Next is disabled on the last slide once all submodules are complete (no further navigation).

#### Scenario: Prev disabled on first slide
- **WHEN** the current slide is the first
- **THEN** the Prev control is disabled and non-interactive

#### Scenario: Prev is always allowed for review
- **WHEN** the user is on any slide after the first
- **THEN** Prev is enabled regardless of submodule completion state, so the user can review earlier slides

### Requirement: Strict progression gating
The Next control SHALL be disabled until every submodule on the current slide is marked complete by the user. The user MUST NOT be able to advance via keyboard, swipe, or URL while gating is active.

#### Scenario: Next disabled with incomplete submodules
- **WHEN** at least one submodule on the current slide is unchecked
- **THEN** the Next button is visually disabled, has `aria-disabled="true"`, and clicking/tapping it does nothing

#### Scenario: Next enabled after all submodules checked
- **WHEN** the user checks the final remaining submodule on the current slide
- **THEN** the Next button becomes enabled within the same render

#### Scenario: Keyboard ArrowRight respects gating
- **WHEN** the user presses ArrowRight while submodules are incomplete
- **THEN** the slide does not advance

#### Scenario: Direct URL deep-link respects gating
- **WHEN** the user navigates directly to a slide whose previous slides have incomplete submodules
- **THEN** the viewer redirects to the earliest incomplete slide instead of honoring the deep link

### Requirement: Submodule completion is persistent
The viewer SHALL persist submodule completion to `localStorage` under the key `qe:progress` and restore it on subsequent visits.

#### Scenario: Progress restored after reload
- **WHEN** the user completes submodules on slide 2, reloads the page, and reopens the module
- **THEN** the previously checked submodules remain checked and the user can resume from slide 2

### Requirement: Ayah examples shown sparingly
The viewer MUST initially display at most two ayah examples per slide. Remaining examples MUST be hidden behind a "Load more" control.

#### Scenario: Load more reveals remaining examples
- **WHEN** a slide has five ayah examples and the user activates "Load more"
- **THEN** all five examples become visible inline without navigation away from the slide

### Requirement: Arabic Ayah text is always RTL
Every ayah's Arabic verse MUST render with `dir="rtl"` regardless of the current UI locale.

#### Scenario: Arabic verse in English UI
- **WHEN** the UI locale is `en` and an ayah is displayed
- **THEN** the Arabic verse text renders right-to-left while the surrounding English UI remains left-to-right

### Requirement: Keyboard accessibility
The viewer MUST support ArrowLeft/ArrowRight for Prev/Next navigation when those controls are enabled, and MUST manage focus so screen readers announce the new slide on transition.

#### Scenario: ArrowLeft moves to previous slide
- **WHEN** the user is on slide 3 and presses ArrowLeft
- **THEN** the viewer renders slide 2 and focus moves to the slide heading
