import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { Module } from "@/lib/content/types";

interface Props {
  module: Module;
  doneSubs: number;
}

function CompleteSeal() {
  return (
    <span className="relative flex size-10 shrink-0 items-center justify-center">
      {/* Glow */}
      <span className="absolute inset-0 rounded-full bg-primary/30 blur-sm" />
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="relative"
      >
        <defs>
          <radialGradient id="seal-g" cx="38%" cy="28%" r="72%">
            <stop offset="0%" stopColor="oklch(0.56 0.15 162)" />
            <stop offset="100%" stopColor="oklch(0.36 0.10 162)" />
          </radialGradient>
        </defs>
        {/* Outer circle */}
        <circle cx="20" cy="20" r="19" fill="url(#seal-g)" />
        {/* Inner ring */}
        <circle cx="20" cy="20" r="15.5" fill="none" stroke="oklch(1 0 0 / 0.20)" strokeWidth="1" />
        {/* Tick marks around inner ring */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const r = (deg * Math.PI) / 180;
          const x1 = 20 + 13.5 * Math.cos(r);
          const y1 = 20 + 13.5 * Math.sin(r);
          const x2 = 20 + 15 * Math.cos(r);
          const y2 = 20 + 15 * Math.sin(r);
          return (
            <line
              key={deg}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="oklch(1 0 0 / 0.35)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          );
        })}
        {/* Checkmark */}
        <path
          d="M12 20.5l5.5 5.5 10.5-11"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function ModuleCard({ module, doneSubs }: Props) {
  const { pick, t, dir, locale } = useLocale();
  const total = module.submodules.length;
  const pct = total > 0 ? Math.round((doneSubs / total) * 100) : 0;
  const isComplete = total > 0 && doneSubs >= total;
  const arabicTitle = module.title.ar ?? "";
  const submoduleNoun = total === 1 ? t("wordSubmodule") : t("wordSubmodules");

  return (
    <a
      href={`/learn/${module.id}`}
      className={[
        "group relative flex flex-col gap-5 rounded-2xl border bg-card/70 p-7 backdrop-blur transition-all duration-500 ease-out",
        "shadow-[0_1px_0_oklch(1_0_0_/_0.6)_inset,0_20px_50px_-30px_oklch(0.18_0.08_160_/_0.45)]",
        "hover:-translate-y-1 active:-translate-y-1 hover:shadow-[0_1px_0_oklch(1_0_0_/_0.6)_inset,0_40px_90px_-40px_oklch(0.18_0.08_160_/_0.7)] active:shadow-[0_1px_0_oklch(1_0_0_/_0.6)_inset,0_40px_90px_-40px_oklch(0.18_0.08_160_/_0.7)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        "sm:p-8",
        isComplete
          ? "border-primary/40 hover:border-primary/60 active:border-primary/60"
          : "border-border/70 hover:border-primary/30 active:border-primary/30",
      ].join(" ")}
      dir={dir}
    >
      {/* Hover shimmer */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-active:opacity-100 bg-gradient-to-br group-hover:from-primary/[0.04] group-hover:via-transparent group-hover:to-[var(--gold)]/[0.05] group-active:from-primary/[0.04] group-active:via-transparent group-active:to-[var(--gold)]/[0.05]"
      />

      {/* Completed: subtle top wash */}
      {isComplete && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-2xl bg-gradient-to-b from-primary/[0.06] to-transparent"
        />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-semibold text-primary">
            {module.recommendedOrder}
          </span>
          <span className="h-px w-6 bg-border" />
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {total} {submoduleNoun}
          </span>
        </div>

        {isComplete ? (
          <CompleteSeal />
        ) : (
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background/80 text-primary transition-all duration-500 group-hover:border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground group-active:border-primary/40 group-active:bg-primary group-active:text-primary-foreground ${dir === "rtl" ? "group-hover:-rotate-45 group-active:-rotate-45" : "group-hover:rotate-45 group-active:rotate-45"}`}
          >
            {dir === "rtl"
              ? <ArrowUpLeft className="size-4" aria-hidden="true" />
              : <ArrowUpRight className="size-4" aria-hidden="true" />}
          </span>
        )}
      </div>

      <div className="relative space-y-2">
        {arabicTitle && locale !== "ar" && (
          <p dir="rtl" lang="ar" className="font-arabic text-xl text-primary/80">
            {arabicTitle}
          </p>
        )}
        <h3 className="font-serif text-2xl font-medium leading-[1.1] tracking-tight text-foreground text-balance sm:text-3xl">
          {pick(module.title)}
        </h3>
        <p className="max-w-prose text-[15px] leading-relaxed text-muted-foreground">
          {pick(module.summary)}
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="uppercase tracking-[0.2em]">
            {t("moduleProgress").replace("{done}", String(doneSubs)).replace("{total}", String(total))}
          </span>
          {pct > 0 && (
            <span className="font-serif text-primary">{pct}%</span>
          )}
        </div>
        <Progress value={pct} className="h-1" />
      </div>

      <div className="relative flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-primary">
        {isComplete ? (
          <>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="5.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" />
              <path d="M3.5 6l2 2 3-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t("moduleCompleteHint")}</span>
          </>
        ) : (
          <>
            <span className="relative inline-flex items-center">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="absolute size-1.5 animate-ping rounded-full bg-primary/60" />
            </span>
            <span>{t("cardTapHint")}</span>
          </>
        )}
      </div>
    </a>
  );
}
