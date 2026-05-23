## ADDED Requirements

### Requirement: Tilawat Rules module exists
The system SHALL ship a content module with `id: "tilawat-rules"` covering prerequisites and rules of Quranic Tilawat (recitation), authored in all three locales.

#### Scenario: Module appears on landing
- **WHEN** the user opens `/`
- **THEN** the module card for "Rules of Tilawat" (or its Bangla/Arabic equivalent) is visible

### Requirement: Core slides cover beginner prerequisites
The module SHALL contain slides for at least these beginner topics, each with its own submodule checklist: purity (tahara), intention (niyyah), facing qiblah and posture, ta'awwudh and basmalah, tajweed basics (makharij/sifaat overview), and tartil (slow, measured recitation).

#### Scenario: All MVP slides present
- **WHEN** the user opens the Tilawat Rules module
- **THEN** the module exposes slides for purity, intention, qiblah/posture, ta'awwudh & basmalah, tajweed basics, and tartil — at minimum

### Requirement: Beginner-friendly content depth
Each slide's submodule entries MUST be short (single sentence or short bullet), and the slide MUST link to a blog article via `blogSlug` when a deeper explanation exists.

#### Scenario: Slide does not overflow
- **WHEN** any slide is rendered at 360px width
- **THEN** the visible content (title + submodule list + initial 2 ayah examples) fits without requiring more than one screen of scroll on a typical mobile device

### Requirement: Quranic ayah examples on relevant slides
Slides that benefit from Quranic evidence (e.g. ta'awwudh, tartil) MUST include at least one ayah example with reference, Arabic text, and translations for `en` and `bn`.

#### Scenario: Tartil slide cites An-Naml or Al-Muzzammil
- **WHEN** the user views the tartil slide
- **THEN** at least one ayah example is visible referencing tartil (e.g. 73:4) with Arabic and translation
