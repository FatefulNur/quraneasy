import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ArrowRight, BookOpen, X } from "lucide-react";
import SubmoduleCompletion from "@/components/SubmoduleCompletion";
import AyahList from "@/components/AyahList";
import LetterTile from "@/components/LetterTile";
import WordCard from "@/components/WordCard";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import {
  LocaleProvider,
  useLocale,
} from "@/components/i18n/LocaleProvider";
import type { Module, Submodule } from "@/lib/content/types";
import {
  initProgress,
  getProgress,
  progressKey,
  setSubmoduleDone,
  type ProgressMap,
} from "@/lib/progress";

function submoduleComplete(
  moduleId: string,
  sm: Submodule,
  progress: ProgressMap,
): boolean {
  return !!progress[progressKey(moduleId, sm.id)];
}

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function SubmoduleBody({ moduleId, sm, isCurrent, progress, onToggle }: {
  moduleId: string;
  sm: Submodule;
  isCurrent: boolean;
  progress: ProgressMap;
  onToggle: (submoduleId: string, done: boolean) => void;
}) {
  const { pick, t } = useLocale();
  const checked = submoduleComplete(moduleId, sm, progress);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
      {/* Definition */}
      {sm.definition && (
        <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground">
          {pick(sm.definition)}
        </p>
      )}

      {/* Subtopics */}
      {sm.subtopics && sm.subtopics.length > 0 && (
        <div className="mt-8 space-y-8">
          {sm.subtopics.map((st) => (
            <div key={st.id}>
              <h3 className="mb-3 font-serif text-lg font-medium text-foreground">
                {pick(st.title)}
              </h3>
              {st.letterExamples && st.letterExamples.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {st.letterExamples.map((le, i) => (
                    <LetterTile key={i} example={le} />
                  ))}
                </div>
              )}
              {st.wordExamples && st.wordExamples.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {st.wordExamples.map((we, i) => (
                    <WordCard key={i} example={we} />
                  ))}
                </div>
              )}
              {st.ayahExamples && st.ayahExamples.length > 0 && (
                <div className="mt-3">
                  <AyahList ayahs={st.ayahExamples} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Top-level letter examples */}
      {sm.letterExamples && sm.letterExamples.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {sm.letterExamples.map((le, i) => (
            <LetterTile key={i} example={le} />
          ))}
        </div>
      )}

      {/* Top-level word examples */}
      {sm.wordExamples && sm.wordExamples.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {sm.wordExamples.map((we, i) => (
            <WordCard key={i} example={we} />
          ))}
        </div>
      )}

      {/* Ayah examples */}
      {sm.ayahExamples && sm.ayahExamples.length > 0 && (
        <div className="mt-10">
          <AyahList ayahs={sm.ayahExamples} />
        </div>
      )}

      {/* Completion checkbox */}
      <div className={`mt-10 ${isCurrent ? "" : "pointer-events-none opacity-60"}`}>
        <SubmoduleCompletion
          moduleId={moduleId}
          submodule={sm}
          progress={progress}
          onToggle={onToggle}
          checkLabel={pick(sm.checkItem) || t("markComplete")}
          checked={checked}
        />
      </div>

      {/* Blog link */}
      {sm.blogSlug && (
        <div className="mt-10 border-t border-border pt-6">
          <a
            href={`/blog/${sm.blogSlug}`}
            className="group inline-flex items-center gap-3 text-sm font-medium text-primary"
          >
            <BookOpen className="size-4" aria-hidden="true" />
            <span className="underline decoration-primary/30 underline-offset-[6px] transition-colors group-hover:decoration-primary">
              {t("readMore")}
            </span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      )}

      <div className="h-12" />
    </div>
  );
}

function Viewer({ module }: { module: Module }) {
  const { t, pick, dir, locale } = useLocale();
  const [progress, setProgress] = useState<ProgressMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [index, setIndex] = useState(0);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const trackViewportRef = useRef<HTMLElement | null>(null);
  const total = module.submodules.length;

  useEffect(() => {
    initProgress().then(() => {
      setProgress(getProgress());
      setIndex(0);
      setHydrated(true);
    });
  }, [module.id]);

  const submodule = module.submodules[index];
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const goPrev = useCallback(() => {
    if (isFirst) return;
    setIndex((i) => Math.max(0, i - 1));
  }, [isFirst]);

  const goNext = useCallback(() => {
    if (isLast) return;
    setIndex((i) => Math.min(total - 1, i + 1));
  }, [isLast, total]);

  useEffect(() => {
    if (!hydrated) return;
    headingRef.current?.focus({ preventScroll: true });
    if (trackViewportRef.current) {
      trackViewportRef.current.scrollLeft = 0;
      trackViewportRef.current.scrollTop = 0;
    }
  }, [index, hydrated]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable)
          return;
      }
      const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
      if (e.key === forward && !isLast) {
        e.preventDefault();
        goNext();
      } else if (e.key === back && !isFirst) {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        if (typeof window !== "undefined") window.location.href = "/";
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFirst, isLast, goNext, goPrev, dir]);

  const onToggle = (submoduleId: string, done: boolean) => {
    const next = setSubmoduleDone(module.id, submoduleId, done);
    setProgress({ ...next });
  };

  const doneSubs = useMemo(
    () => module.submodules.filter((sm) => progress[progressKey(module.id, sm.id)]).length,
    [module, progress],
  );
  const overallPct = (doneSubs / Math.max(1, total)) * 100;

  const slideOfStr = t("slideOf")
    .replace("{current}", pad2(index + 1))
    .replace("{total}", pad2(total));

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
            <span className="text-foreground">{slideOfStr}</span>
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

      {/* Submodule strip */}
      <div className="relative z-10 flex items-center gap-3 overflow-x-auto border-b border-border/60 bg-background/50 px-5 py-3 backdrop-blur sm:px-8">
        {module.submodules.map((sm, i) => {
          const complete = submoduleComplete(module.id, sm, progress);
          const isCurrent = i === index;
          return (
            <button
              key={sm.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`group flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all ${
                isCurrent
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card/60 text-foreground/80 hover:border-primary/40 hover:text-foreground"
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className="font-serif tracking-[0.15em]">{pad2(i + 1)}</span>
              <span className="max-w-[10rem] truncate">{pick(sm.title)}</span>
              {complete && !isCurrent && (
                <span className="size-1.5 rounded-full bg-[var(--gold)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* SUBMODULE TRACK */}
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
          {module.submodules.map((sm, i) => (
            <section
              key={sm.id}
              aria-hidden={i !== index}
              className="h-full shrink-0 overflow-y-auto"
              style={{ width: `${100 / total}%` }}
            >
              {/* Eyebrow + title */}
              <div className="mx-auto max-w-3xl px-5 pt-10 sm:px-8 sm:pt-16">
                <div className="mb-6 flex items-center gap-3">
                  <span className="font-serif text-sm tracking-[0.25em] text-[var(--gold)]">
                    {pad2(i + 1)}
                  </span>
                  <span className="h-px w-8 bg-border" />
                  <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                    {pick(module.title)}
                  </span>
                </div>

                <h2
                  ref={i === index ? headingRef : undefined}
                  tabIndex={-1}
                  className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-foreground text-balance outline-none sm:text-6xl"
                >
                  {pick(sm.title)}
                </h2>

                <div className="mt-6 flex items-center gap-4">
                  <span className="h-px w-12 bg-primary" />
                  <span className="font-serif text-xs italic tracking-wider text-muted-foreground">
                    {t("topicLabel")}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
              </div>

              <SubmoduleBody
                moduleId={module.id}
                sm={sm}
                isCurrent={i === index}
                progress={progress}
                onToggle={onToggle}
              />
            </section>
          ))}
        </div>
      </main>

      {/* FOOTER nav — free roam, no gating */}
      <nav
        className="relative z-10 flex items-center justify-between gap-3 border-t border-border/70 bg-background/85 px-5 py-4 backdrop-blur sm:px-8"
        aria-label="Submodule navigation"
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
            {t("freeRoam")}
          </p>
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={isLast}
          aria-disabled={isLast}
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
