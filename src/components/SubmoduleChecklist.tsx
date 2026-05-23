import { Check } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { Slide } from "@/lib/content/types";
import { progressKey, type ProgressMap } from "@/lib/progress";

interface Props {
  moduleId: string;
  slide: Slide;
  progress: ProgressMap;
  onToggle: (submoduleId: string, done: boolean) => void;
}

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export default function SubmoduleChecklist({
  moduleId,
  slide,
  progress,
  onToggle,
}: Props) {
  const { pick } = useLocale();
  return (
    <ol className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur">
      {slide.submodules.map((sm, idx) => {
        const k = progressKey(moduleId, slide.id, sm.id);
        const checked = !!progress[k];
        return (
          <li key={sm.id}>
            <button
              type="button"
              onClick={() => onToggle(sm.id, !checked)}
              className={`group flex w-full items-start gap-5 px-5 py-5 text-start transition-colors duration-300 ${
                checked
                  ? "bg-primary/[0.04]"
                  : "hover:bg-accent/40 focus-visible:bg-accent/60"
              } focus:outline-none focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-7 sm:py-6`}
              aria-pressed={checked}
            >
              <span
                className={`relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border text-xs font-medium tracking-[0.18em] transition-all duration-300 ${
                  checked
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_oklch(0.42_0.115_162_/_0.6)]"
                    : "border-border bg-background text-muted-foreground group-hover:border-primary/40 group-hover:text-foreground"
                }`}
                aria-hidden="true"
              >
                <span
                  className={`absolute font-serif text-sm transition-opacity duration-200 ${
                    checked ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {pad2(idx + 1)}
                </span>
                <Check
                  className={`absolute size-4 transition-all duration-300 ${
                    checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
                  }`}
                  strokeWidth={3}
                />
              </span>

              <span
                className={`text-[17px] leading-relaxed transition-colors duration-300 ${
                  checked ? "text-foreground" : "text-foreground/85"
                }`}
              >
                {pick(sm.text)}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
