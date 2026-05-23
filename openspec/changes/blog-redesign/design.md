## Context

Blog currently: one `.md` file, one `[slug].astro` that wraps content in bare `prose` class, no index page, no SEO, no meta beyond title. The app has a mature design system (Fraunces heading font, Amiri Arabic font, parchment/emerald/gold palette, `.grain`, `.ornament`, `.hairline`, `.anim-rise` utilities) that the blog doesn't use at all. Content is growing — each of 14 modules can have multiple associated posts.

## Goals / Non-Goals

**Goals:**
- `/blog` index with card grid, date sort, category filter
- Article page with editorial hero (Fraunces title, parchment+grain bg), reading progress bar, meta row, module linkback, tags
- `BlogLayout.astro` encapsulating OG/Twitter/JSON-LD per article
- Frontmatter schema expansion: `date`, `author`, `tags`, `category`, `modules[]`, `coverImage`
- Mobile-first (360px baseline), tap targets ≥ 44px

**Non-Goals:**
- Pagination (< 50 posts expected; static build handles it)
- Search or full-text filtering
- Comments, likes, or any user-generated content
- CMS or headless backend
- Author profile pages
- Dark mode blog-specific overrides (global dark vars cover it)

## Decisions

### D1: BlogLayout extends BaseLayout

`BlogLayout.astro` accepts all BaseLayout props plus `{ date, author, coverImage, canonical }` and injects OG/Twitter/JSON-LD into `<head>` via a `<slot name="head">` addition to BaseLayout.

**Why not modify BaseLayout directly?** Blog-specific head tags (JSON-LD Article schema, og:type=article) don't belong in the global layout. Keeping them separate avoids leaking article metadata onto non-article pages.

**Alternative considered:** A single layout with an `isArticle` flag. Rejected — boolean props that toggle large blocks of markup are harder to maintain than a dedicated layout.

### D2: Static glob import for blog posts

Both the index and slug pages use `import.meta.glob("@/content/blog/*.md", { eager: true })`. No Astro Content Collections.

**Why not Content Collections?** The codebase already uses raw glob imports for blog. Migrating to Content Collections would add a `src/content/config.ts` schema step and change the import API — net complexity increase for no runtime benefit on a static site. Glob keeps it consistent with existing pattern.

**Trade-off:** No built-in Zod validation of frontmatter. Mitigated by the `curriculum-validator` skill pattern — the spec will define required fields and validation can be added later.

### D3: Cover image with gradient fallback

If `coverImage` is absent, the card and article hero render a CSS gradient keyed to `category`:
```
Tilawat  → emerald gradient (--primary)
Tajweed  → teal/cyan
Adab     → gold/amber (--gold)
General  → neutral parchment
```
Gradients use existing CSS variables, no new color additions.

**Why not a default image?** A static fallback image feels generic. Category-keyed gradients are on-brand and require zero additional assets.

### D4: Reading progress bar

A small `<script>` in BlogLayout calculates `window.scrollY / (document.body.scrollHeight - window.innerHeight)` and sets a CSS custom property on `:root`. A fixed `<div>` at top of viewport reads that property for its width.

**Why not a React island?** The progress bar is purely presentational with no state sharing needs. A vanilla `<script>` in BlogLayout keeps it zero-JS-framework overhead and avoids a hydration boundary.

### D5: Module linkback rendering

Posts with `modules: ["module-id", ...]` in frontmatter get a "Related modules" section at the bottom of the article. Module titles are resolved at build time by importing the module JSON files via `import.meta.glob("@/content/modules/*.json", { eager: true })` and matching by `id`.

**Why build-time?** No backend. Module data is static. Resolving at build time means zero client JS.

### D6: Category filter on index — client-side toggle

The `/blog` index renders all cards; category filter buttons show/hide cards via a small inline `<script>` toggling a `data-category` attribute. No React island needed.

**Alternative:** Generate separate `/blog/category/[cat]` routes. Rejected — overkill for < 50 posts; adds route complexity for marginal benefit.

## Risks / Trade-offs

- **Frontmatter `date` is required but existing post lacks it** → Migration: update `purity-before-recitation.md` as part of this change. Future posts without `date` will sort to bottom (fallback: `1970-01-01`).
- **No coverImage assets exist yet** → Gradient fallback covers this. Real images can be added later without code changes.
- **JSON-LD canonical URL hardcodes site origin** → Use `import.meta.env.SITE` (set in `astro.config.mjs`). If `SITE` is unset in dev, canonical is omitted rather than broken.
- **Prose styling may not cover all Markdown elements** → Tailwind's `prose` class covers standard elements. Custom Arabic blockquote style added via `@layer components` in global.css.

## Open Questions

- Site canonical domain: confirm `SITE` is set in `astro.config.mjs` (needed for canonical + JSON-LD)
- Author: single "QuranEasy Team" default sufficient, or per-post author names needed?
- OG image: use `coverImage` as OG image, or generate a separate OG card? (Default: use `coverImage` if set, else skip og:image for now)
