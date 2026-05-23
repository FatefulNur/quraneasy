import { useState } from "react";
import AyahExample from "@/components/AyahExample";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { AyahExample as Ayah } from "@/lib/content/types";

const INITIAL = 2;

export default function AyahList({ ayahs }: { ayahs: Ayah[] }) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  if (!ayahs || ayahs.length === 0) return null;
  const visible = expanded ? ayahs : ayahs.slice(0, INITIAL);
  const hasMore = ayahs.length > INITIAL && !expanded;
  return (
    <div className="space-y-5">
      <div className="ornament text-[10px] uppercase tracking-[0.3em]">
        <span>{t("quranicEvidence")}</span>
      </div>
      {visible.map((a) => (
        <AyahExample key={a.reference} ayah={a} />
      ))}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm text-foreground/80 transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
          >
            <span className="size-1.5 rounded-full bg-[var(--gold)]" />
            {t("loadMore")}
            <span className="text-muted-foreground transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
