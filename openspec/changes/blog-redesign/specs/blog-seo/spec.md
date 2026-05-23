## ADDED Requirements

### Requirement: BlogLayout emits Open Graph meta tags
The `BlogLayout.astro` SHALL emit OG meta tags for every article page.

#### Scenario: og:type is article
- **WHEN** any blog article page renders
- **THEN** `<meta property="og:type" content="article" />` is present in `<head>`

#### Scenario: og:title matches post title
- **WHEN** post has `title: "Purity Before Reciting the Qur'an"`
- **THEN** `<meta property="og:title" content="Purity Before Reciting the Qur'an · QuranEasy" />` is present

#### Scenario: og:description matches post description
- **WHEN** post has `description` frontmatter
- **THEN** `<meta property="og:description" content="..." />` is present with that value

#### Scenario: og:image when coverImage set
- **WHEN** post has `coverImage` frontmatter
- **THEN** `<meta property="og:image" content="..." />` is present with the absolute URL

#### Scenario: og:image omitted when no coverImage
- **WHEN** post has no `coverImage` frontmatter
- **THEN** no `og:image` meta tag is emitted

### Requirement: BlogLayout emits Twitter Card meta tags
The `BlogLayout.astro` SHALL emit Twitter Card meta tags.

#### Scenario: Twitter card type
- **WHEN** post has `coverImage`
- **THEN** `<meta name="twitter:card" content="summary_large_image" />` is present

#### Scenario: Twitter card summary without image
- **WHEN** post has no `coverImage`
- **THEN** `<meta name="twitter:card" content="summary" />` is present

#### Scenario: Twitter title and description
- **WHEN** any article page renders
- **THEN** `twitter:title` and `twitter:description` meta tags are present

### Requirement: BlogLayout emits canonical URL
The `BlogLayout.astro` SHALL emit a `<link rel="canonical">` for each article.

#### Scenario: Canonical URL on article page
- **WHEN** `SITE` env var is set and user views `/blog/purity-before-recitation`
- **THEN** `<link rel="canonical" href="https://<SITE>/blog/purity-before-recitation" />` is present

#### Scenario: Canonical omitted when SITE not set
- **WHEN** `import.meta.env.SITE` is empty or undefined
- **THEN** no `<link rel="canonical">` is emitted (avoids broken canonical)

### Requirement: BlogLayout emits JSON-LD Article schema
The `BlogLayout.astro` SHALL emit a `<script type="application/ld+json">` block with Article structured data.

#### Scenario: JSON-LD present on article page
- **WHEN** any article page renders
- **THEN** a `<script type="application/ld+json">` tag is present in `<head>`

#### Scenario: JSON-LD contains required Article fields
- **WHEN** post has `title`, `description`, and `date`
- **THEN** JSON-LD contains `"@type": "Article"`, `"headline"`, `"description"`, and `"datePublished"` with correct values

#### Scenario: JSON-LD author field
- **WHEN** post has `author: "QuranEasy Team"`
- **THEN** JSON-LD contains `"author": { "@type": "Person", "name": "QuranEasy Team" }`

#### Scenario: JSON-LD author defaults
- **WHEN** post has no `author` frontmatter
- **THEN** JSON-LD author defaults to `"QuranEasy Team"`

### Requirement: Frontmatter schema expanded
Blog post `.md` files SHALL support an expanded frontmatter schema. Only `title` and `date` are required; all other fields are optional.

#### Scenario: Valid post with all fields
- **WHEN** a post has title, date, description, author, tags, category, modules, coverImage
- **THEN** the page renders without errors and all metadata is used

#### Scenario: Valid post with only required fields
- **WHEN** a post has only `title` and `date`
- **THEN** the page renders without errors; optional metadata sections are omitted

#### Scenario: Date format
- **WHEN** `date` is set as an ISO date string `"2026-05-22"`
- **THEN** it is displayed as human-readable (e.g., "May 22, 2026") on card and article hero
