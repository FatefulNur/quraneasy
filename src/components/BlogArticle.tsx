import {
  LocaleProvider,
  useLocale,
} from "@/components/i18n/LocaleProvider";
import SiteNavBar from "@/components/SiteNavBar";
import type { BlogPost, LocaleMap } from "@/lib/content/types";
import { wordCountFromHtml } from "@/lib/blog";

interface Props {
  post: BlogPost;
  moduleMap: Record<string, LocaleMap>;
}

const categoryGradients: Record<string, string> = {
  Tilawat: "from-emerald-600/20 via-emerald-400/10 to-transparent",
  Tajweed: "from-teal-600/20 via-cyan-400/10 to-transparent",
  Adab: "from-amber-500/20 via-yellow-300/10 to-transparent",
};

function heroGradientFor(category?: string): string {
  return (
    categoryGradients[category ?? ""] ??
    "from-stone-300/30 via-stone-100/10 to-transparent"
  );
}

export default function BlogArticle({ post, moduleMap }: Props) {
  return (
    <LocaleProvider>
      <BlogArticleInner post={post} moduleMap={moduleMap} />
    </LocaleProvider>
  );
}

function BlogArticleInner({ post, moduleMap }: Props) {
  const { locale, pick, t, dir } = useLocale();

  const title = pick(post.title) ?? "";
  const description = pick(post.description) ?? "";
  const html = pick(post.content) ?? "";
  const isRtl = dir === "rtl";

  const readTime = Math.max(
    1,
    Math.ceil(wordCountFromHtml(post.content?.en ?? "") / 200)
  );

  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : null;

  const linkedModules = (post.modules ?? []).map((id) => ({
    id,
    title: pick(moduleMap[id]),
    href: `/learn/${id}`,
  }));

  const gradient = heroGradientFor(post.category);

  return (
    <div className="min-h-screen">
      <SiteNavBar />

      {/* Back nav — pt-16 offsets the fixed nav height */}
      <div className="mx-auto max-w-4xl px-4 pt-20">
        <a
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className={isRtl ? "rotate-180" : ""}
          >
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("navBlog")}
        </a>
      </div>

      {/* Hero band */}
      <div className="grain mt-4 mx-auto max-w-4xl overflow-hidden rounded-xl px-4">
        <div
          className={`relative rounded-xl px-6 py-10 sm:px-10 sm:py-14 bg-gradient-to-br ${gradient}`}
          style={{ backgroundColor: "var(--parchment)" }}
        >
          {post.category && (
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
              {post.category}
            </span>
          )}
          <h1
            className="font-serif text-balance text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl"
            dir={isRtl ? "rtl" : undefined}
            lang={locale}
          >
            {title}
          </h1>
          {description && (
            <p
              className="mt-4 max-w-xl text-base text-muted-foreground leading-relaxed"
              dir={isRtl ? "rtl" : undefined}
              lang={locale}
            >
              {description}
            </p>
          )}
          {(formattedDate || readTime) && (
            <div className="ornament mt-6 text-xs text-muted-foreground">
              {formattedDate && <span>{formattedDate}</span>}
              {formattedDate && <span aria-hidden="true">·</span>}
              <span>{readTime} min read</span>
            </div>
          )}
        </div>
      </div>

      {/* Article body */}
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div
          dir={dir}
          lang={locale}
          className={[
            "prose prose-neutral max-w-none",
            "prose-headings:font-serif prose-headings:font-semibold",
            "prose-h2:text-2xl prose-h3:text-xl",
            "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
            "prose-blockquote:not-italic prose-blockquote:border-primary/40",
            "prose-p:leading-relaxed prose-p:text-base",
            isRtl ? "text-right" : "",
            locale === "ar" ? "font-arabic prose-headings:font-arabic" : "",
            locale === "bn" ? "[font-family:var(--font-bangla)]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Module linkbacks */}
        {linkedModules.length > 0 && (
          <div className="mt-10">
            <div className="hairline mb-6" />
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t("relatedModules")}
            </p>
            <ul className="flex flex-wrap gap-2">
              {linkedModules.map((m) => (
                <li key={m.id}>
                  <a
                    href={m.href}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                      className={`shrink-0 text-muted-foreground transition-colors group-hover:text-primary${isRtl ? " rotate-180" : ""}`}
                    >
                      <path
                        d="M3 7h8M8 4l3 3-3 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {m.title || m.id}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10">
          <a
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className={isRtl ? "rotate-180" : ""}
            >
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("navBlog")}
          </a>
        </div>
      </div>
    </div>
  );
}
