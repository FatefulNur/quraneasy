## ADDED Requirements

### Requirement: Blog index page exists at /blog
The system SHALL render a `/blog` route listing all published blog posts.

#### Scenario: Index page renders
- **WHEN** user navigates to `/blog`
- **THEN** the page renders with a heading "Articles" and at least one post card visible

#### Scenario: Posts sorted by date descending
- **WHEN** multiple posts exist with different `date` frontmatter values
- **THEN** the most recent post appears first in the listing

#### Scenario: Post missing date sorts to bottom
- **WHEN** a post has no `date` frontmatter field
- **THEN** it appears after all dated posts

### Requirement: Post cards display required metadata
Each post card SHALL display: title, description (truncated at ~2 lines), date (human-readable), estimated read time, and category badge.

#### Scenario: Card shows title and description
- **WHEN** a post has `title` and `description` frontmatter
- **THEN** both are visible on the card

#### Scenario: Card shows read time
- **WHEN** a post body contains text
- **THEN** estimated read time (words ÷ 200, rounded up, minimum 1) is shown as "N min read"

#### Scenario: Card shows date
- **WHEN** a post has `date: "2026-05-22"`
- **THEN** card displays a human-readable date like "May 22, 2026"

#### Scenario: Card shows category badge
- **WHEN** a post has `category: "Tilawat"`
- **THEN** a badge with "Tilawat" text is visible on the card

#### Scenario: Card with no category shows no badge
- **WHEN** a post has no `category` frontmatter
- **THEN** no category badge is rendered

### Requirement: Cover image with gradient fallback
Each card SHALL display a cover image if `coverImage` is set, otherwise a CSS gradient keyed to the post's `category`.

#### Scenario: Cover image rendered when provided
- **WHEN** a post has `coverImage: "/blog/cover.jpg"`
- **THEN** card header displays that image

#### Scenario: Gradient fallback by category
- **WHEN** a post has no `coverImage` but has `category: "Tajweed"`
- **THEN** card header shows a teal/cyan CSS gradient

#### Scenario: Neutral gradient for no category
- **WHEN** a post has no `coverImage` and no `category`
- **THEN** card header shows a neutral parchment-toned gradient

### Requirement: Category filter controls
The index page SHALL render category filter buttons that show/hide cards by category.

#### Scenario: All posts visible by default
- **WHEN** user loads `/blog` with no filter active
- **THEN** all post cards are visible and "All" filter button is active

#### Scenario: Filter by category
- **WHEN** user clicks a category filter button (e.g., "Tilawat")
- **THEN** only cards with `category: "Tilawat"` remain visible; other cards are hidden

#### Scenario: Click All resets filter
- **WHEN** user clicks the "All" filter button after a category filter is active
- **THEN** all cards become visible again

#### Scenario: Filter buttons only show categories that exist
- **WHEN** the blog has posts with categories "Tilawat" and "Tajweed"
- **THEN** only "All", "Tilawat", and "Tajweed" filter buttons appear

### Requirement: Cards link to article pages
Each card SHALL be fully clickable and navigate to `/blog/[slug]`.

#### Scenario: Card click navigates to article
- **WHEN** user clicks anywhere on a post card
- **THEN** browser navigates to the corresponding `/blog/[slug]` URL

### Requirement: Index page mobile layout
The card grid SHALL be single-column at 360px and two-column at ≥ 640px.

#### Scenario: Single column on mobile
- **WHEN** viewport width is 360px
- **THEN** cards stack vertically, one per row

#### Scenario: Two columns on tablet/desktop
- **WHEN** viewport width is ≥ 640px
- **THEN** cards render in a two-column grid
