import { useState } from "react";
import { LocaleProvider, useLocale } from "@/components/i18n/LocaleProvider";
import SiteNavBar from "@/components/SiteNavBar";
import type { LocaleMap } from "@/lib/content/types";

export interface CardData {
  slug: string;
  title: LocaleMap;
  description: LocaleMap;
  date: string | null;
  readTime: number;
  category?: string;
  coverImage?: string;
}

interface Props {
  cards: CardData[];
}

const categoryGradients: Record<string, string> = {
  Tilawat: "from-emerald-600/30 to-emerald-200/20",
  Tajweed: "from-teal-600/30 to-cyan-200/20",
  Adab: "from-amber-500/30 to-yellow-200/20",
};

function gradientFor(category?: string): string {
  return categoryGradients[category ?? ""] ?? "from-stone-400/20 to-stone-200/10";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogIndexClient({ cards }: Props) {
  return (
    <LocaleProvider>
      <BlogIndexInner cards={cards} />
    </LocaleProvider>
  );
}

function BlogIndexInner({ cards }: Props) {
  const { pick, t, dir } = useLocale();
  const [activeFilter, setActiveFilter] = useState("all");

  const categories = [
    ...new Set(cards.map((c) => c.category).filter(Boolean)),
  ] as string[];

  const visible = cards.filter(
    (c) => activeFilter === "all" || c.category === activeFilter
  );

  return (
    <div className="min-h-screen">
      <SiteNavBar />

      {/* Page header — pt-20 offsets fixed nav */}
      <header className="mx-auto max-w-4xl px-4 pb-8 pt-20 anim-rise" dir={dir}>
        <a
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={dir === "rtl" ? "rotate-180" : ""}>
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t("appName")}
        </a>
        <h1 className="font-serif text-4xl font-semibold text-foreground sm:text-5xl">
          {t("blogHeading")}
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground leading-relaxed">
          {t("blogSubtitle")}
        </p>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  activeFilter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Post grid */}
      <main className="mx-auto max-w-4xl px-4 pb-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {visible.map((card) => (
            <a
              key={card.slug}
              href={`/blog/${card.slug}`}
              className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
            >
              {/* Cover / gradient */}
              <div
                className={`h-36 w-full bg-gradient-to-br ${gradientFor(card.category)}`}
              >
                {card.coverImage && (
                  <img
                    src={card.coverImage}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>

              {/* Card body */}
              <div className="p-5">
                {card.category && (
                  <span className="mb-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/20">
                    {card.category}
                  </span>
                )}
                <h2 className="mt-1 font-serif text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {pick(card.title)}
                </h2>
                {pick(card.description) && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {pick(card.description)}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  {card.date && <span>{formatDate(card.date)}</span>}
                  {card.date && <span aria-hidden="true">·</span>}
                  <span>{card.readTime} min read</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
