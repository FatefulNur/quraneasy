## ADDED Requirements

### Requirement: JSON blog post format with trilingual content
Blog posts stored as `.json` files in `src/content/blog/` SHALL support `title`, `description`, and `content` as `LocaleMap` objects (`{ en?, bn?, ar? }`), where `content` values are HTML strings.

#### Scenario: JSON post loads with English content by default
- **WHEN** user navigates to `/blog/[slug]` for a JSON post
- **THEN** the page renders content in English (default locale, or stored locale from localStorage)

#### Scenario: JSON post fields match schema
- **WHEN** a JSON file exists at `src/content/blog/purity-before-recitation.json`
- **THEN** it contains `id`, `title: LocaleMap`, `description: LocaleMap`, `date`, and `content: LocaleMap`

### Requirement: BlogArticle React island renders locale-correct HTML
The article page for JSON posts SHALL render a `BlogArticle` React island that wraps in `LocaleProvider` and renders `content[locale]` as HTML.

#### Scenario: Content renders in current locale
- **WHEN** user views a JSON post and locale is "bn"
- **THEN** `content.bn` HTML is rendered in the article body

#### Scenario: Fallback to English when locale content missing
- **WHEN** a JSON post has no `content.bn` and locale is "bn"
- **THEN** `content.en` is rendered (using `pick()` fallback chain)

#### Scenario: Arabic content rendered RTL
- **WHEN** locale is "ar" and post has `content.ar`
- **THEN** the article body has `dir="rtl"` applied and uses Amiri font class

### Requirement: Language switcher on JSON blog articles
JSON blog article pages SHALL include the `LanguageMenu` component inside the `BlogArticle` island so users can switch locale without a page reload.

#### Scenario: Language menu visible on JSON post
- **WHEN** user views a JSON post article
- **THEN** the LanguageMenu dropdown is visible in the article area

#### Scenario: Switching language updates content without reload
- **WHEN** user clicks LanguageMenu and selects "বাং"
- **THEN** article body updates to Bengali content without a full page reload
- **AND** `localStorage["qe:locale"]` is set to "bn"

#### Scenario: Locale persists on reload
- **WHEN** user sets locale to "ar" on a blog post and reloads
- **THEN** the page renders Arabic content on load

### Requirement: Legacy Markdown posts unaffected
Existing `.md` blog posts SHALL continue to render as static English content with no locale switching.

#### Scenario: Markdown post renders normally
- **WHEN** user navigates to a `.md`-based blog post URL
- **THEN** English content renders without errors and without a language switcher

#### Scenario: Both post formats appear on blog index
- **WHEN** the blog index loads
- **THEN** both JSON and Markdown posts appear as cards, sorted by date

### Requirement: Read time computed from HTML
For JSON posts, estimated read time SHALL be computed by stripping HTML tags from `content.en` and dividing word count by 200 (ceil, min 1).

#### Scenario: Read time computed correctly
- **WHEN** a JSON post's `content.en` contains approximately 400 words of text
- **THEN** the displayed read time is "2 min read"

#### Scenario: Minimum read time is 1
- **WHEN** a JSON post's `content.en` is very short (< 200 words)
- **THEN** the displayed read time is "1 min read"

### Requirement: Blog index shows English titles for all post types
The blog index card grid SHALL display `title.en` and `description.en` for JSON posts, and `frontmatter.title` / `frontmatter.description` for Markdown posts.

#### Scenario: JSON post card shows English title
- **WHEN** a JSON post exists with `title.en: "Purity Before Reciting..."`
- **THEN** the card on the index page shows that English title regardless of stored locale

### Requirement: Module linkbacks respect current locale
In the `BlogArticle` island, related module link text SHALL use `pick(module.title, locale)` to display the module title in the current locale.

#### Scenario: Module title in Bengali
- **WHEN** locale is "bn" and post links to `module-2-preparation`
- **THEN** the "Related modules" link text shows the Bengali title of that module
