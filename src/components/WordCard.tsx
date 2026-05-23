import { useLocale } from "@/components/i18n/LocaleProvider";
import type { WordExample } from "@/lib/content/types";

interface Props {
  example: WordExample;
}

export default function WordCard({ example }: Props) {
  const { pick } = useLocale();
  const meaning = example.meaning ? pick(example.meaning) : undefined;

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-primary/20 bg-gradient-to-b from-primary/[0.09] to-transparent px-4 py-3 shadow-[0_4px_20px_-6px_oklch(0.42_0.115_162_/_0.18)]">
      <span
        dir="rtl"
        lang="ar"
        className="font-['Scheherazade_New','Amiri',serif] text-2xl leading-tight text-foreground"
      >
        {example.arabic}
      </span>
      {example.translit && (
        <span className="text-[11px] italic tracking-wide text-muted-foreground">
          {example.translit}
        </span>
      )}
      {meaning && (
        <span className="mt-0.5 text-[12px] text-foreground/70">{meaning}</span>
      )}
    </div>
  );
}
