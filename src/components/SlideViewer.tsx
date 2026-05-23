import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ArrowRight, BookOpen, X } from "lucide-react";
import SubmoduleChecklist from "@/components/SubmoduleChecklist";
import AyahList from "@/components/AyahList";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import {
  LocaleProvider,
  useLocale,
} from "@/components/i18n/LocaleProvider";
import type { Module, Slide } from "@/lib/content/types";
import {
  getProgress,
  progressKey,
  setSubmoduleDone,
  type ProgressMap,
} from "@/lib/progress";

function slideComplete(
  moduleId: string,
  slide: Slide,
  progress: ProgressMap,
): boolean {
  return slide.submodules.every(
    (sm) => progress[progressKey(moduleId, slide.id, sm.id)],
  );
}

function earliestIncomplete(
  moduleId: string,
  slides: Slide[],
  progress: ProgressMap,
): number {
  for (let i = 0; i < slides.length; i++) {
    if (!slideComplete(moduleId, slides[i], progress)) return i;
  }
  return slides.length - 1;
}

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function Viewer({ module }: { module: Module }) {
  const { t, pick, dir, locale } = useLocale();
  const [progress, setProgress] = useState<ProgressMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [index, setIndex] = useState(0);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const trackViewportRef = useRef<HTMLElement | null>(null);
  const total = module.slides.length;

  useEffect(() => {
    const p = getProgress();
    setProgress(p);

    let desiredId: string | null = null;
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      desiredId = url.searchParams.get("slide");
      if (!desiredId && url.hash.startsWith("#slide=")) {
        desiredId = url.hash.slice("#slide=".length);
      }
    }
    let target = 0;
    if (desiredId) {
      const desiredIdx = module.slides.findIndex((s) => s.id === desiredId);
      if (desiredIdx >= 0) target = desiredIdx;
    } else {
      target = earliestIncomplete(module.id, module.slides, p);
    }
    const earliest = earliestIncomplete(module.id, module.slides, p);
    if (target > earliest) target = earliest;
    setIndex(target);
    setHydrated(true);
  }, [module.id, module.slides]);

  const slide = module.slides[index];
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const canGoNext = useMemo(
    () => slideComplete(module.id, slide, progress) && !isLast,
    [module.id, slide, progress, isLast],
  );

  const goPrev = useCallback(() => {
    if (isFirst) return;
    setIndex((i) => Math.max(0, i - 1));
  }, [isFirst]);

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    setIndex((i) => Math.min(total - 1, i + 1));
  }, [canGoNext, total]);

  useEffect(() => {
    if (!hydrated) return;
    // preventScroll: browser would otherwise nudge ancestor scrollLeft to bring
    // the (mid-transition, off-screen) heading into view, displacing the track.
    headingRef.current?.focus({ preventScroll: true });
    if (trackViewportRef.current) {
      trackViewportRef.current.scrollLeft = 0;
      trackViewportRef.current.scrollTop = 0;
    }
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("slide", slide.id);
      window.history.replaceState({}, "", url.toString());
    }
  }, [index, slide.id, hydrated]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable)
          return;
      }
      const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
      if (e.key === forward) {
        if (canGoNext) {
          e.preventDefault();
          goNext();
        }
      } else if (e.key === back) {
        if (!isFirst) {
          e.preventDefault();
          goPrev();
        }
      } else if (e.key === "Escape") {
        if (typeof window !== "undefined") window.location.href = "/";
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canGoNext, isFirst, goNext, goPrev, dir]);

  const onToggle = (submoduleId: string, done: boolean) => {
    const next = setSubmoduleDone(module.id, slide.id, submoduleId, done);
    setProgress({ ...next });
  };

  const slideOf = t("slideOf")
    .replace("{current}", pad2(index + 1))
    .replace("{total}", pad2(total));

  const totalSubs = module.slides.reduce(
    (n, s) => n + s.submodules.length,
    0,
  );
  const doneSubs = module.slides.reduce(
    (n, s) =>
      n +
      s.submodules.filter(
        (sm) => progress[progressKey(module.id, s.id, sm.id)],
      ).length,
    0,
  );
  const overallPct = (doneSubs / Math.max(1, totalSubs)) * 100;

  const step = 100 / total;
  const trackTransform =
    dir === "rtl"
      ? `translateX(${index * step}%)`
      : `translateX(-${index * step}%)`;

  return (
    <div
      dir={dir}
      lang={locale}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Decorative top wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-64 bg-gradient-to-b from-primary/[0.06] via-transparent to-transparent"
      />

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between gap-3 border-b border-border/70 bg-background/70 px-5 py-4 backdrop-blur sm:px-8">
        <a
          href="/"
          className="group inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Back to library"
        >
          <span className="flex size-9 items-center justify-center rounded-full border border-border bg-card transition-all group-hover:border-primary/40 group-hover:text-primary">
            <X className="size-4" strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="hidden font-serif text-base text-foreground sm:inline">
            {pick(module.title)}
          </span>
        </a>

        <div className="hidden items-center gap-6 sm:flex">
          <p className="font-serif text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <span className="text-foreground">{slideOf}</span>
          </p>
        </div>

        <LanguageSwitcher />
      </header>

      {/* Overall progress rail */}
      <div className="relative h-[2px] w-full bg-border/60">
        <div
          className="h-full bg-gradient-to-r from-primary via-primary to-[var(--gold)] transition-[width] duration-500 ease-out"
          style={{ width: `${overallPct}%` }}
        />
      </div>

      {/* Chapter strip */}
      <div className="relative z-10 flex items-center gap-3 overflow-x-auto border-b border-border/60 bg-background/50 px-5 py-3 backdrop-blur sm:px-8">
        {module.slides.map((s, i) => {
          const complete = slideComplete(module.id, s, progress);
          const reachable = i <= earliestIncomplete(module.id, module.slides, progress);
          const isCurrent = i === index;
          return (
            <button
              key={s.id}
              type="button"
              disabled={!reachable}
              onClick={() => reachable && setIndex(i)}
              className={`group flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all ${
                isCurrent
                  ? "border-primary bg-primary text-primary-foreground"
                  : reachable
                    ? "border-border bg-card/60 text-foreground/80 hover:border-primary/40 hover:text-foreground"
                    : "cursor-not-allowed border-border/50 text-muted-foreground/50"
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className="font-serif tracking-[0.15em]">
                {pad2(i + 1)}
              </span>
              <span className="max-w-[10rem] truncate">{pick(s.title)}</span>
              {complete && !isCurrent && (
                <span className="size-1.5 rounded-full bg-[var(--gold)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* SLIDE TRACK — horizontal sliding viewport */}
      <main
        ref={trackViewportRef}
        className="relative flex-1 overflow-hidden overscroll-contain"
      >
        <div
          className="flex h-full will-change-transform"
          style={{
            width: `${total * 100}%`,
            transform: trackTransform,
            transition: hydrated
              ? "transform 650ms cubic-bezier(0.7, 0, 0.2, 1)"
              : "none",
          }}
          aria-live="polite"
        >
          {module.slides.map((s, i) => (
            <section
              key={s.id}
              aria-hidden={i !== index}
              className="h-full shrink-0 overflow-y-auto"
              style={{ width: `${100 / total}%` }}
            >
              <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
                {/* Eyebrow */}
                <div className="mb-6 flex items-center gap-3">
                  <span className="font-serif text-sm tracking-[0.25em] text-[var(--gold)]">
                    {pad2(i + 1)}
                  </span>
                  <span className="h-px w-8 bg-border" />
                  <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                    {pick(module.title)}
                  </span>
                </div>

                {/* Title */}
                <h2
                  ref={i === index ? headingRef : undefined}
                  tabIndex={-1}
                  className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-foreground text-balance outline-none sm:text-6xl"
                >
                  {pick(s.title)}
                </h2>

                {/* Decorative rule */}
                <div className="mt-8 flex items-center gap-4">
                  <span className="h-px w-12 bg-primary" />
                  <span className="font-serif text-xs italic tracking-wider text-muted-foreground">
                    {s.submodules.length}{" "}
                    {s.submodules.length === 1 ? t("stepSingular") : t("stepPlural")}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                {/* Checklist (only interactive for current slide) */}
                <div className={`mt-8 ${i === index ? "" : "pointer-events-none opacity-60"}`}>
                  <SubmoduleChecklist
                    moduleId={module.id}
                    slide={s}
                    progress={progress}
                    onToggle={onToggle}
                  />
                </div>

                {s.ayahExamples && s.ayahExamples.length > 0 && (
                  <div className="mt-12">
                    <AyahList ayahs={s.ayahExamples} />
                  </div>
                )}

                {s.blogSlug && (
                  <div className="mt-12 border-t border-border pt-6">
                    <a
                      href={`/blog/${s.blogSlug}`}
                      className="group inline-flex items-center gap-3 text-sm font-medium text-primary"
                    >
                      <BookOpen className="size-4" aria-hidden="true" />
                      <span className="underline decoration-primary/30 underline-offset-[6px] transition-colors group-hover:decoration-primary">
                        {t("readMore")}
                      </span>
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </a>
                  </div>
                )}

                <div className="h-12" />
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* FOOTER nav */}
      <nav
        className="relative z-10 flex items-center justify-between gap-3 border-t border-border/70 bg-background/85 px-5 py-4 backdrop-blur sm:px-8"
        aria-label="Slide navigation"
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={isFirst}
          aria-disabled={isFirst}
          className="group inline-flex min-h-11 items-center gap-3 rounded-full border border-border bg-card/70 px-4 py-2.5 text-sm text-foreground/80 transition-all hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground/80 sm:px-5"
        >
          {dir === "rtl" ? (
            <ArrowRight className="size-4 transition-transform group-enabled:group-hover:-translate-x-0.5" aria-hidden="true" />
          ) : (
            <ArrowLeft className="size-4 transition-transform group-enabled:group-hover:-translate-x-0.5" aria-hidden="true" />
          )}
          <span>{t("prev")}</span>
        </button>

        <div className="hidden flex-col items-center sm:flex">
          <p className="font-serif text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            {!canGoNext && !isLast ? t("completeAllFirst") : t("pressArrowHint")}
          </p>
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          aria-disabled={!canGoNext}
          title={canGoNext ? undefined : t("completeAllFirst")}
          className="group relative inline-flex min-h-11 items-center gap-3 overflow-hidden rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.42_0.115_162_/_0.7)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_oklch(0.42_0.115_162_/_0.7)] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:hover:translate-y-0 sm:px-6"
        >
          <span>{isLast ? t("finished") : t("next")}</span>
          {dir === "rtl" ? (
            <ArrowLeft className="size-4 transition-transform group-enabled:group-hover:-translate-x-0.5" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4 transition-transform group-enabled:group-hover:translate-x-0.5" aria-hidden="true" />
          )}
        </button>
      </nav>
    </div>
  );
}

export default function SlideViewer({ module }: { module: Module }) {
  return (
    <LocaleProvider>
      <Viewer module={module} />
    </LocaleProvider>
  );
}
