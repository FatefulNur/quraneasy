## ADDED Requirements

### Requirement: Blog article route
The system SHALL serve static blog articles at `/blog/<slug>` rendered from markdown/MDX files in `src/content/blog/`.

#### Scenario: Article renders by slug
- **WHEN** the user opens `/blog/purity-before-recitation`
- **THEN** the corresponding markdown file is rendered as an HTML page with a heading and body

#### Scenario: Unknown slug returns 404
- **WHEN** the user opens `/blog/does-not-exist`
- **THEN** the app responds with a 404 page

### Requirement: Slide links to blog when blogSlug is set
When a slide JSON includes `blogSlug`, the viewer MUST render a "Read more" link to `/blog/<slug>` that opens in the same tab.

#### Scenario: Read more visible when slug present
- **WHEN** a slide defines `blogSlug: "purity-before-recitation"`
- **THEN** the slide displays a "Read more" link pointing to `/blog/purity-before-recitation`

#### Scenario: No link when slug absent
- **WHEN** a slide has no `blogSlug`
- **THEN** no "Read more" affordance is rendered for that slide

### Requirement: Blog is non-blocking for progression
The blog MUST be a secondary surface — visiting or not visiting a blog article MUST NOT affect submodule completion or Next-button gating.

#### Scenario: Skipping blog still allows progression
- **WHEN** the user checks all submodules on a slide but never opens the linked blog article
- **THEN** the Next button is enabled and the user can advance
