import { Loader2, Volume2 } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useAudio } from "@/lib/useAudio";
import type { LetterExample } from "@/lib/content/types";

interface Props {
  example: LetterExample;
}

export default function LetterTile({ example }: Props) {
  const { t } = useLocale();
  const audio = useAudio({
    type: "speech",
    text: example.arabic,
    audio: example.audio,
  });
  const active = audio.state !== "idle";

  const content = (
    <>
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
    </>
  );

  const frame =
    "flex flex-col items-center gap-1 rounded-lg border border-primary/20 bg-gradient-to-b from-primary/[0.09] to-transparent px-3 py-2 shadow-[0_4px_20px_-6px_oklch(0.42_0.115_162_/_0.18)]";

  if (!audio.supported) {
    return <div className={frame}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={audio.toggle}
      aria-label={t("playPronunciation")}
      aria-pressed={active}
      className={`${frame} min-h-11 min-w-11 cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5`}
    >
      {content}
      {audio.state === "loading" ? (
        <Loader2 className="size-3 animate-spin text-primary" aria-hidden="true" />
      ) : (
        <Volume2
          className={`size-3 transition-colors ${
            active ? "animate-pulse text-primary" : "text-muted-foreground/50"
          }`}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
