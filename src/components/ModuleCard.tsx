import { ArrowUpRight } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { Module } from "@/lib/content/types";

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export default function ModuleCard({ module }: { module: Module }) {
  const { pick, t, dir, locale } = useLocale();
  const slideCount = module.slides.length;
  const arabicTitle = module.title.ar ?? "";
  return (
    <a
      href={`/learn/${module.id}`}
      className="group relative flex flex-col gap-6 rounded-2xl border border-border/70 bg-card/70 p-7 shadow-[0_1px_0_oklch(1_0_0_/_0.6)_inset,0_20px_50px_-30px_oklch(0.18_0.08_160_/_0.45)] backdrop-blur transition-all duration-500 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_1px_0_oklch(1_0_0_/_0.6)_inset,0_40px_90px_-40px_oklch(0.18_0.08_160_/_0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:p-8"
      dir={dir}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:from-primary/[0.04] group-hover:via-transparent group-hover:to-gold/[0.05] group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-sm tracking-[0.25em] text-muted-foreground">
            {pad2(module.order)}
          </span>
          <span className="h-px w-8 bg-border" />
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {t("cardModuleSlides").replace("{n}", String(slideCount))}
          </span>
        </div>

        <span className="flex size-10 items-center justify-center rounded-full border border-border bg-background/80 text-primary transition-all duration-500 group-hover:rotate-45 group-hover:border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="relative space-y-3">
        {arabicTitle && locale !== "ar" && (
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic text-xl text-primary/80"
          >
            {arabicTitle}
          </p>
        )}
        <h3 className="font-serif text-3xl font-medium leading-[1.1] tracking-tight text-foreground text-balance sm:text-4xl">
          {pick(module.title)}
        </h3>
        <p className="max-w-prose text-[15px] leading-relaxed text-muted-foreground">
          {pick(module.summary)}
        </p>
      </div>

      <div className="relative mt-2 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-primary">
        <span className="relative inline-flex items-center">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="absolute size-1.5 animate-ping rounded-full bg-primary/60" />
        </span>
        <span>{t("cardTapHint")}</span>
      </div>
    </a>
  );
}
