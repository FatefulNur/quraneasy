## ADDED Requirements

### Requirement: Article hero section
The article page SHALL render a hero band above the prose with: category badge, large Fraunces title, description, and a meta row showing date and read time.

#### Scenario: Hero renders title in Fraunces
- **WHEN** user views `/blog/[slug]`
- **THEN** the article title is rendered in `--font-heading` (Fraunces Variable) at a large size (≥ 2rem on mobile, ≥ 3rem on desktop)

#### Scenario: Hero shows description
- **WHEN** post has `description` frontmatter
- **THEN** description is visible below the title in the hero

#### Scenario: Hero shows meta row
- **WHEN** post has `date` frontmatter
- **THEN** a meta row shows formatted date and estimated read time, styled as muted text, separated by an ornament (·)

#### Scenario: Hero has parchment+grain background
- **WHEN** article page renders
- **THEN** the hero band uses `--parchment` background with the `.grain` texture overlay

### Requirement: Reading progress bar
The article page SHALL display a fixed progress bar at the top of the viewport that fills as the user scrolls.

#### Scenario: Progress bar at zero on page load
- **WHEN** user loads an article page at the top
- **THEN** the progress bar has zero width (or minimal, not full)

#### Scenario: Progress bar fills on scroll
- **WHEN** user scrolls to the bottom of the article
- **THEN** the progress bar is at full width (100%)

#### Scenario: Progress bar color matches primary
- **WHEN** progress bar is visible
- **THEN** it uses `--primary` (deep emerald) color

### Requirement: Back navigation
The article page SHALL provide a "← Articles" link back to `/blog`.

#### Scenario: Back link visible
- **WHEN** user views any article
- **THEN** a "← Articles" link is visible above the hero

#### Scenario: Back link navigates to index
- **WHEN** user clicks "← Articles"
- **THEN** browser navigates to `/blog`

### Requirement: Prose typography
Article body SHALL use standard prose styling with Fraunces headings and Geist body text, with Arabic text rendered in Amiri font with RTL direction.

#### Scenario: Headings use serif font
- **WHEN** article markdown contains `## Heading`
- **THEN** rendered heading uses `--font-heading` (Fraunces Variable)

#### Scenario: Arabic blockquote styled correctly
- **WHEN** article markdown contains a blockquote with Arabic text
- **THEN** text renders in `--font-arabic` (Amiri), right-to-left, with a left border accent

### Requirement: Module linkback section
When a post has `modules` frontmatter, the article page SHALL render a "Related modules" section at the bottom linking to each module's learn page.

#### Scenario: Module linkback renders
- **WHEN** post has `modules: ["module-1-basics-of-tilawat"]`
- **THEN** a "Related modules" section appears at the bottom with a link to `/learn/module-1-basics-of-tilawat`

#### Scenario: Module title resolved from JSON
- **WHEN** a module JSON exists with matching `id`
- **THEN** the link text shows the module's English title, not the raw ID

#### Scenario: No linkback section when modules empty
- **WHEN** post has no `modules` frontmatter or empty array
- **THEN** no "Related modules" section is rendered

### Requirement: Tags display
When a post has `tags`, the article page SHALL render them as pill badges below the prose.

#### Scenario: Tags rendered as pills
- **WHEN** post has `tags: ["wudu", "purity"]`
- **THEN** two pill badges appear at the bottom of the article body

#### Scenario: No tags section when empty
- **WHEN** post has no `tags` frontmatter
- **THEN** no tags section is rendered

### Requirement: Article page mobile layout
The article page SHALL be readable at 360px with comfortable line length and tap targets.

#### Scenario: Readable at 360px
- **WHEN** viewport width is 360px
- **THEN** prose text has max-width constrained and horizontal padding ≥ 16px

#### Scenario: Constrained max-width on desktop
- **WHEN** viewport width is ≥ 768px
- **THEN** prose content is centered with max-width ≤ 768px
