import { useLocale } from "@/components/i18n/LocaleProvider";
import type { AyahExample as Ayah } from "@/lib/content/types";

export default function AyahExample({ ayah }: { ayah: Ayah }) {
  const { locale, t } = useLocale();
  const transLocale = locale === "ar" ? "en" : locale;
  const translation =
    ayah.translation[transLocale as "en" | "bn"] ?? ayah.translation.en ?? "";

  return (
    <article className="relative overflow-hidden rounded-2xl border border-border bg-[var(--parchment)] p-7 sm:p-9">
      {/* Corner ornaments */}
      <span
        aria-hidden="true"
        className="absolute left-4 top-4 size-3 border-l border-t border-[var(--gold)]/60"
      />
      <span
        aria-hidden="true"
        className="absolute right-4 top-4 size-3 border-r border-t border-[var(--gold)]/60"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-4 left-4 size-3 border-b border-l border-[var(--gold)]/60"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-4 right-4 size-3 border-b border-r border-[var(--gold)]/60"
      />

      <div className="ornament mb-6 text-[10px] uppercase tracking-[0.3em]">
        <span>{t("wordQuran")} · {ayah.reference}</span>
      </div>

      <p
        dir="rtl"
        lang="ar"
        className="font-arabic text-[1.8rem] leading-[2.2] tracking-wide text-foreground sm:text-[2rem]"
      >
        {ayah.arabic}
      </p>

      {translation && (
        <>
          <div className="ornament my-6 text-primary/50">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2l2.39 7.36H22l-6.19 4.5L18.2 21 12 16.5 5.8 21l2.39-7.14L2 9.36h7.61z" />
            </svg>
          </div>
          <p className="font-serif text-[17px] italic leading-relaxed text-foreground/80">
            &ldquo;{translation}&rdquo;
          </p>
        </>
      )}
    </article>
  );
}
