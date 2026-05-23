import type { LetterExample } from "@/lib/content/types";

interface Props {
  example: LetterExample;
}

export default function LetterTile({ example }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-primary/20 bg-gradient-to-b from-primary/[0.09] to-transparent px-3 py-2 shadow-[0_4px_20px_-6px_oklch(0.42_0.115_162_/_0.18)]">
      <span
        dir="rtl"
        lang="ar"
        className="font-['Scheherazade_New','Amiri',serif] text-3xl leading-none text-foreground"
      >
        {example.arabic}
      </span>
      {example.translit && (
        <span className="text-[11px] tracking-wide text-muted-foreground">
          {example.translit}
        </span>
      )}
    </div>
  );
}
