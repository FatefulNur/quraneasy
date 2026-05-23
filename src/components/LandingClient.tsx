import { useEffect, useMemo, useState } from "react";
import { LocaleProvider, useLocale } from "@/components/i18n/LocaleProvider";
import LanguageMenu from "@/components/i18n/LanguageMenu";
import ModuleCard from "@/components/ModuleCard";
import { initProgress, getProgress, progressKey } from "@/lib/progress";
import type { Module } from "@/lib/content/types";

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function useScrollHeader() {
  const [visible, setVisible] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let last = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setAtTop(y < 10);
      if (y < 80) {
        setVisible(false);
      } else if (y < last) {
        setVisible(true);  // scrolling up
      } else if (y > last + 4) {
        setVisible(false); // scrolling down
      }
      last = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { visible, atTop };
}

function useDoneMap(modules: Module[]): Record<string, number> {
  const [doneMap, setDoneMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    initProgress().then(() => {
      const progress = getProgress();
      const map: Record<string, number> = {};
      for (const m of modules) {
        map[m.id] = m.submodules.filter(
          (sm) => !!progress[progressKey(m.id, sm.id)],
        ).length;
      }
      setDoneMap(map);
    });
  }, [modules]);

  return doneMap;
}

function Inner({ modules }: { modules: Module[] }) {
  const { t, locale, dir } = useLocale();
  const [mounted, setMounted] = useState(false);
  const sorted = useMemo(
    () => [...modules].sort((a, b) => a.recommendedOrder - b.recommendedOrder),
    [modules],
  );
  const doneMap = useDoneMap(sorted);
  const { visible, atTop } = useScrollHeader();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <span className="size-10 animate-spin rounded-full border-2 border-border border-t-primary" />
          <span className="font-serif text-sm tracking-widest text-muted-foreground">Loading…</span>
        </div>
      </div>
    );
  }
  const totalSubmodules = sorted.reduce((n, m) => n + m.submodules.length, 0);
  const moduleNoun = sorted.length === 1 ? t("wordModule") : t("wordModules");
  const modulesLabel = t("modulesCountLabel")
    .replace("{n}", pad2(sorted.length))
    .replace("{noun}", moduleNoun);

  return (
    <div dir={dir} lang={locale} className="relative grain min-h-dvh overflow-hidden">
      {/* Decorative top wash */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center">
        <svg viewBox="0 0 1200 800" className="w-[140%] max-w-none opacity-[0.07]" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="g1" cx="50%" cy="0%" r="60%">
              <stop offset="0%" stopColor="oklch(0.42 0.115 162)" />
              <stop offset="100%" stopColor="oklch(0.42 0.115 162 / 0)" />
            </radialGradient>
          </defs>
          <circle cx="600" cy="0" r="500" fill="url(#g1)" />
        </svg>
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Inline top nav — always visible at page top, fades when sticky kicks in */}
        <div
          className={`flex items-center justify-between gap-4 pt-6 transition-opacity duration-300 sm:pt-8 ${visible ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <a href="/" className="group inline-flex items-center gap-2.5" aria-label={t("appName")}>
            <span className="flex size-9 items-center justify-center rounded-full border border-primary/30 bg-primary/5 font-serif text-base font-semibold text-primary transition-transform duration-500 group-hover:rotate-12" aria-hidden="true">
              Q
            </span>
            <span className="font-serif text-lg tracking-tight text-foreground">{t("appName")}</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
            <a href="#course" className="hover:text-foreground">{t("navCourse")}</a>
            <a href="#approach" className="hover:text-foreground">{t("navApproach")}</a>
            <a href="/blog/purity-before-recitation" className="hover:text-foreground">{t("navBlog")}</a>
          </nav>
          <LanguageMenu />
        </div>

        {/* Sticky nav — slides in on scroll-up, hides on scroll-down */}
        <header
          className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out
            ${visible
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"}
            ${!atTop
              ? "border-b border-border/60 bg-background/85 shadow-[0_1px_20px_-8px_oklch(0_0_0_/_0.15)] backdrop-blur-md"
              : "bg-transparent"}`}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <a href="/" className="group inline-flex items-center gap-2.5" aria-label={t("appName")}>
              <span className="flex size-9 items-center justify-center rounded-full border border-primary/30 bg-primary/5 font-serif text-base font-semibold text-primary transition-transform duration-500 group-hover:rotate-12" aria-hidden="true">
                Q
              </span>
              <span className="font-serif text-lg tracking-tight text-foreground">{t("appName")}</span>
            </a>

            <nav className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
              <a href="#course" className="hover:text-foreground">{t("navCourse")}</a>
              <a href="#approach" className="hover:text-foreground">{t("navApproach")}</a>
              <a href="/blog/purity-before-recitation" className="hover:text-foreground">{t("navBlog")}</a>
            </nav>

            <LanguageMenu />
          </div>
        </header>

        {/* HERO */}
        <section className="relative grid gap-10 pb-16 pt-16 sm:pt-24 lg:grid-cols-12 lg:gap-14 lg:pb-24 lg:pt-32">
          <div className="lg:col-span-8">
            <div className="anim-rise mb-7 inline-flex items-center gap-3 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur" style={{ animationDelay: "40ms" }}>
              <span className="size-1.5 rounded-full bg-[var(--gold)]" />
              <span>{t("heroEyebrow")}</span>
            </div>

            <h1 className="anim-rise font-serif text-[clamp(2.5rem,8vw,5.5rem)] font-medium leading-[0.98] tracking-[-0.02em] text-balance text-foreground" style={{ animationDelay: "120ms" }}>
              {t("heroHeadlinePre")}{" "}
              <span className="relative inline-block">
                <span className="italic text-primary">{t("heroHeadlineAccent")}</span>
                <svg aria-hidden="true" className="absolute -bottom-2 left-0 w-full text-[var(--gold)]" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8 Q 50 1, 100 6 T 198 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
                </svg>
              </span>
              {t("heroHeadlinePost")}
            </h1>

            <p className="anim-rise mt-7 max-w-xl text-[17px] leading-relaxed text-muted-foreground sm:text-lg" style={{ animationDelay: "220ms" }}>
              {t("heroSubtitle")}
            </p>

            <div className="anim-rise mt-10 flex flex-wrap items-center gap-5" style={{ animationDelay: "320ms" }}>
              <a href="#course" className="group inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.42_0.115_162_/_0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_oklch(0.42_0.115_162_/_0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                {t("ctaBegin")}
                <svg className={`size-4 transition-transform duration-300 group-hover:translate-x-1 ${dir === "rtl" ? "rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              <a href="/blog/purity-before-recitation" className="text-sm text-foreground/80 underline decoration-border underline-offset-[6px] transition-colors hover:decoration-primary hover:text-foreground">
                {t("ctaSample")}
              </a>
            </div>

            <dl className="anim-rise mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-8" style={{ animationDelay: "420ms" }}>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("statsModules")}</dt>
                <dd className="mt-1 font-serif text-3xl text-foreground">{sorted.length}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("statsLanguages")}</dt>
                <dd className="mt-1 font-serif text-3xl text-foreground">3</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("statsCost")}</dt>
                <dd className="mt-1 font-serif text-3xl text-foreground">{t("statsCostValue")}</dd>
              </div>
            </dl>
          </div>

          {/* Hero side: ornamental ayah card */}
          <aside className="anim-rise relative lg:col-span-4 lg:pl-8" style={{ animationDelay: "520ms" }}>
            <div className="relative rounded-3xl border border-border bg-[var(--parchment)] p-8 shadow-[0_30px_80px_-40px_oklch(0.18_0.08_160_/_0.5)]">
              <div className="ornament mb-5 text-[10px] uppercase tracking-[0.3em]">
                <span>{t("sampleAyahLabel")}</span>
              </div>
              <p dir="rtl" lang="ar" className="font-arabic text-[1.7rem] leading-[2.2] text-foreground">
                فَإِذَا قَرَأْتَ ٱلْقُرْءَانَ فَٱسْتَعِذْ بِٱللَّهِ مِنَ ٱلشَّيْطَـٰنِ ٱلرَّجِيمِ
              </p>
              <div className="ornament my-6 text-primary/60">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l2.39 7.36H22l-6.19 4.5L18.2 21 12 16.5 5.8 21l2.39-7.14L2 9.36h7.61z" />
                </svg>
              </div>
              <p className="font-serif text-base italic leading-relaxed text-foreground/80">
                &ldquo;{t("sampleAyahTranslation")}&rdquo;
              </p>
              <div className="mt-6 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span>{t("sampleAyahFooter")}</span>
                <span className="font-serif italic">{t("sampleVolume")}</span>
              </div>
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-4 size-24 rounded-full bg-[var(--gold)]/10 blur-2xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 -left-4 size-32 rounded-full bg-primary/10 blur-3xl" />
          </aside>
        </section>

        {/* Section divider */}
        <div className="ornament my-4 text-[10px] uppercase tracking-[0.32em]">
          <span className="font-serif italic tracking-normal text-foreground/70">{t("sectionCourse")}</span>
        </div>

        {/* COURSE / MODULES */}
        <section id="course" className="pb-12 pt-12 sm:pb-20 sm:pt-16">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{modulesLabel}</p>
              <h2 className="mt-2 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
                {t("chooseHeadline")}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t("chooseSub")}</p>
          </div>

          {/* Recommended path label */}
          <div className="mb-6 flex items-center gap-3">
            <span className="size-2 rounded-full bg-primary" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-primary">{t("recommendedPath")}</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Module grid with recommended-order rail */}
          <div className="relative">
            {/* Left rail connector (desktop) */}
            <div
              aria-hidden="true"
              className="absolute start-[1.75rem] top-0 hidden h-full w-px bg-gradient-to-b from-primary/30 via-border to-transparent md:block"
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {sorted.map((m) => (
                <ModuleCard
                  key={m.id}
                  module={m}
                  doneSubs={doneMap[m.id] ?? 0}
                />
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            {totalSubmodules} {t("wordSubmodules")} · {t("freeRoam")}
          </p>
        </section>

        {/* APPROACH */}
        <section id="approach" className="grid gap-12 border-t border-border py-20 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{t("approachEyebrow")}</p>
            <h2 className="mt-3 font-serif text-4xl font-medium tracking-tight text-foreground">
              {t("approachTitlePre")}{" "}
              <span className="italic text-primary">{t("approachTitleAccent")}</span>
            </h2>
          </div>
          <div className="grid gap-10 lg:col-span-8 lg:grid-cols-3">
            {[
              { n: "01", title: t("stepOneTitle"), body: t("stepOneBody") },
              { n: "02", title: t("stepTwoTitle"), body: t("stepTwoBody") },
              { n: "03", title: t("stepThreeTitle"), body: t("stepThreeBody") },
            ].map((s) => (
              <article key={s.n} className="group relative">
                <span className="font-serif text-sm tracking-[0.25em] text-[var(--gold)]">{s.n}</span>
                <h3 className="mt-3 font-serif text-xl text-foreground">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="flex flex-col items-start justify-between gap-6 border-t border-border py-10 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full border border-primary/30 font-serif text-xs text-primary">Q</span>
            <span className="font-serif">{t("appName")} · {t("footerYear")}</span>
          </div>
          <div className="flex items-center gap-6">
            <span>{t("footerNote")}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function LandingClient({ modules }: { modules: Module[] }) {
  return (
    <LocaleProvider>
      <Inner modules={modules} />
    </LocaleProvider>
  );
}
