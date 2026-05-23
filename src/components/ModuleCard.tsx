import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { Module } from "@/lib/content/types";

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

interface Props {
  module: Module;
  doneSubs: number;
}

export default function ModuleCard({ module, doneSubs }: Props) {
  const { pick, t, dir, locale } = useLocale();
  const total = module.submodules.length;
  const pct = total > 0 ? Math.round((doneSubs / total) * 100) : 0;
  const arabicTitle = module.title.ar ?? "";
  const submoduleNoun =
    total === 1 ? t("wordSubmodule") : t("wordSubmodules");

  return (
    <a
      href={`/learn/${module.id}`}
      className="group relative flex flex-col gap-5 rounded-2xl border border-border/70 bg-card/70 p-7 shadow-[0_1px_0_oklch(1_0_0_/_0.6)_inset,0_20px_50px_-30px_oklch(0.18_0.08_160_/_0.45)] backdrop-blur transition-all duration-500 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_1px_0_oklch(1_0_0_/_0.6)_inset,0_40px_90px_-40px_oklch(0.18_0.08_160_/_0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:p-8"
      dir={dir}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:from-primary/[0.04] group-hover:via-transparent group-hover:to-gold/[0.05] group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Recommended order badge */}
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-semibold text-primary">
            {module.recommendedOrder}
          </span>
          <span className="h-px w-6 bg-border" />
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {total} {submoduleNoun}
          </span>
        </div>

        <span className={`flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background/80 text-primary transition-all duration-500 group-hover:border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground ${dir === "rtl" ? "group-hover:-rotate-45" : "group-hover:rotate-45"}`}>
          {dir === "rtl"
            ? <ArrowUpLeft className="size-4" aria-hidden="true" />
            : <ArrowUpRight className="size-4" aria-hidden="true" />}
        </span>
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
          <span className="uppercase tracking-[0.2em]">{t("moduleProgress").replace("{done}", String(doneSubs)).replace("{total}", String(total))}</span>
          {pct > 0 && (
            <span className="font-serif text-primary">{pct}%</span>
          )}
        </div>
        <Progress value={pct} className="h-1" />
      </div>

      <div className="relative flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-primary">
        <span className="relative inline-flex items-center">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="absolute size-1.5 animate-ping rounded-full bg-primary/60" />
        </span>
        <span>{t("cardTapHint")}</span>
      </div>
    </a>
  );
}
