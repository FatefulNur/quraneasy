## Why

The blog section exists but is unpolished and missing industry-standard structure: no listing page, no metadata beyond title/description, no SEO, and bare prose styling that doesn't match the app's existing design quality. As the content library grows (multiple posts per module, 14+ modules), the blog needs proper discoverability and visual identity.

## What Changes

- **New** `/blog` index page — card grid listing all posts, sorted by date, filterable by category
- **Redesign** `/blog/[slug]` article page — Mintlify-inspired hero, reading progress bar, meta row, module linkback CTA, tags, ornament dividers
- **New** `BlogLayout.astro` — extends BaseLayout with full SEO: OG tags, Twitter card, JSON-LD Article schema, canonical URL
- **Expand** blog frontmatter schema — add `date` (required), `author`, `tags`, `category`, `modules[]`, `coverImage`
- **Update** existing `purity-before-recitation.md` to use new frontmatter fields

## Capabilities

### New Capabilities

- `blog-index`: Card grid listing page at `/blog` — sorted by date, category filter, cover image with gradient fallback
- `blog-article`: Redesigned article page with hero band, reading progress bar, SEO metadata, module linkback
- `blog-seo`: Full SEO layer — OG, Twitter card, JSON-LD Article schema, canonical URL via BlogLayout

### Modified Capabilities

*(none — no existing specs affected)*

## Impact

- `src/pages/blog/index.astro` — new file
- `src/pages/blog/[slug].astro` — rewritten
- `src/layouts/BlogLayout.astro` — new file
- `src/layouts/BaseLayout.astro` — minor: add OG/canonical slot support
- `src/content/blog/*.md` — frontmatter schema expanded (backwards-compatible; all new fields optional except `date`)
- No new dependencies required — uses existing Tailwind, shadcn, Fraunces/Amiri fonts, and design tokens
