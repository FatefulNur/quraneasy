import { Loader2, Volume2 } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useAudio } from "@/lib/useAudio";
import type { WordExample } from "@/lib/content/types";

interface Props {
  example: WordExample;
}

export default function WordCard({ example }: Props) {
  const { pick, t } = useLocale();
  const meaning = example.meaning ? pick(example.meaning) : undefined;
  const bd = example.breakdown;
  const audio = useAudio({
    type: "speech",
    text: example.arabic,
    audio: example.audio,
  });
  const active = audio.state !== "idle";

  const word = (
    <>
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
    </>
  );

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-primary/20 bg-gradient-to-b from-primary/[0.09] to-transparent px-4 py-3 shadow-[0_4px_20px_-6px_oklch(0.42_0.115_162_/_0.18)]">
      {audio.supported ? (
        <button
          type="button"
          onClick={audio.toggle}
          aria-label={t("playPronunciation")}
          aria-pressed={active}
          className="flex min-h-11 cursor-pointer flex-col items-center gap-1 rounded-lg transition-colors hover:bg-primary/5"
        >
          {word}
          {audio.state === "loading" ? (
            <Loader2
              className="mt-1 size-3.5 animate-spin text-primary"
              aria-hidden="true"
            />
          ) : (
            <Volume2
              className={`mt-1 size-3.5 transition-colors ${
                active ? "animate-pulse text-primary" : "text-muted-foreground/60"
              }`}
              aria-hidden="true"
            />
          )}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-1">{word}</div>
      )}
      {bd && (
        <div className="mt-2 border-t border-primary/10 pt-2 text-left text-[11px] text-muted-foreground space-y-1">
          {bd.original && (
            <p>
              <span className="font-semibold text-foreground/60">Original: </span>
              <span dir="rtl" lang="ar" className="font-['Scheherazade_New','Amiri',serif] text-base">
                {bd.original}
              </span>
            </p>
          )}
          <ol className="list-decimal list-inside space-y-0.5">
            {bd.stepByStep.map((step, i) => (
              <li key={i}>{pick(step)}</li>
            ))}
          </ol>
          <p className="italic text-primary/70">
            <span className="not-italic font-semibold text-foreground/60">Pronunciation: </span>
            {pick(bd.phoneticHint)}
          </p>
        </div>
      )}
    </div>
  );
}
