## 1. Frontmatter & Content

- [x] 1.1 Update `purity-before-recitation.md` with full new frontmatter: `date`, `author`, `tags`, `category`, `modules`
- [x] 1.2 Verify build passes after frontmatter update (`npm run build`)

## 2. BlogLayout

- [x] 2.1 Create `src/layouts/BlogLayout.astro` accepting `{ title, description, date, author, coverImage, slug }` props
- [x] 2.2 Add OG meta tags: `og:type`, `og:title`, `og:description`, `og:image` (conditional on coverImage)
- [x] 2.3 Add Twitter Card tags: `twitter:card` (summary_large_image vs summary), `twitter:title`, `twitter:description`
- [x] 2.4 Add `<link rel="canonical">` — emit only when `import.meta.env.SITE` is defined
- [x] 2.5 Add JSON-LD `<script type="application/ld+json">` with Article schema (`@type`, `headline`, `description`, `datePublished`, `author`)
- [x] 2.6 Add reading progress bar: fixed `<div>` at top of viewport + inline `<script>` updating CSS custom property on scroll

## 3. Article Page Redesign

- [x] 3.1 Rewrite `src/pages/blog/[slug].astro` to use `BlogLayout` instead of `BaseLayout`
- [x] 3.2 Add helper: compute read time from word count (words ÷ 200, ceil, min 1)
- [x] 3.3 Build hero band: parchment+grain background, category badge, Fraunces title, description, ornament meta row (date · read time)
- [x] 3.4 Add "← Articles" back-link above hero
- [x] 3.5 Resolve module titles from `src/content/modules/*.json` and render "Related modules" link section (conditional on `modules` frontmatter)
- [x] 3.6 Render tags as pill badges below prose (conditional on `tags` frontmatter)
- [x] 3.7 Style Arabic blockquotes in prose: Amiri font, RTL, left border accent — add via `@layer components` in `global.css`

## 4. Blog Index Page

- [x] 4.1 Create `src/pages/blog/index.astro`
- [x] 4.2 Glob all posts, sort by `date` descending (no-date posts sort to end)
- [x] 4.3 Extract unique categories from posts for filter button generation
- [x] 4.4 Build card component (inline or extracted): cover image or gradient fallback by category, category badge, title, 2-line clamped description, date, read time
- [x] 4.5 Add category filter buttons with inline `<script>` toggling card visibility by `data-category` attribute
- [x] 4.6 Add page header: "Articles" heading (Fraunces) + subtitle, `.anim-rise` entrance animation
- [x] 4.7 Verify single-column at 360px, two-column at ≥ 640px

## 5. Visual Polish & QA

- [x] 5.1 Verify card hover state: shadow lift + slight translateY
- [x] 5.2 Verify reading progress bar fills correctly on scroll and resets on page load
- [x] 5.3 Verify module linkback renders correct title and URL for `purity-before-recitation.md`
- [x] 5.4 Check OG/Twitter/JSON-LD output in built HTML (`npm run build && grep -r "og:title" dist/blog/`)
- [ ] 5.5 Test on 360px viewport (Chrome DevTools mobile emulation) — card layout, hero, prose padding
- [x] 5.6 Run `npm run build` — confirm zero build errors

## 6. Trilingual HTML Blog Support

- [x] 6.1 Add `BlogPost` interface to `src/lib/content/types.ts` (`id`, `title: LocaleMap`, `description: LocaleMap`, `date`, `author?`, `tags?`, `category?`, `modules?`, `coverImage?`, `content: LocaleMap`)
- [x] 6.2 Create `src/lib/blog.ts` with `loadBlogPosts()` (glob JSON), `wordCountFromHtml()` (strip tags, count words, ceil/200 min 1)
- [x] 6.3 Create `src/components/BlogArticle.tsx` — React island wrapping `LocaleProvider`; renders `LanguageMenu`, HTML content via `dangerouslySetInnerHTML`, module linkbacks using `pick(title, locale)`, tags
- [x] 6.4 Create `src/content/blog/purity-before-recitation.json` — migrate from `.md`; add `bn` and `ar` translations for title, description, and content HTML
- [x] 6.5 Update `src/pages/blog/[slug].astro` — dual glob (`.json` + `.md`), branch rendering: JSON posts → `<BlogArticle client:load>`, MD posts → static `<Content />`
- [x] 6.6 Update `src/pages/blog/index.astro` — load both `.json` and `.md` posts; normalize to common card shape (`title.en` for JSON, `frontmatter.title` for MD)
- [x] 6.7 Run `npm run build` — confirm zero errors, both post types generate routes
- [ ] 6.8 Verify: JSON post loads in English, switch to Bengali → content updates without reload
- [ ] 6.9 Verify: switch to Arabic → RTL direction, Amiri font applied
- [ ] 6.10 Verify: locale persists after page reload
- [ ] 6.11 Verify: legacy `.md` post (if kept) renders without language switcher artifacts
- [ ] 6.12 Verify: blog index shows both post types with correct titles
