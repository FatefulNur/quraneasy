import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { clearProgress } from "@/lib/progress";
import type { Locale } from "@/lib/content/types";

export default function LanguageMenu() {
  const { locale, setLocale, t } = useLocale();
  const onReset = () => {
    clearProgress();
    if (typeof window !== "undefined") window.location.reload();
  };
  const items: { key: Locale; label: string; short: string }[] = [
    { key: "en", label: t("languageEnglish"), short: "EN" },
    { key: "bn", label: t("languageBangla"), short: "বাং" },
    { key: "ar", label: t("languageArabic"), short: "ع" },
  ];
  const current = items.find((i) => i.key === locale)!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("language")}
        className="group inline-flex min-h-11 items-center gap-2.5 rounded-full border border-border bg-card/70 px-3.5 py-2 text-xs font-medium tracking-wide text-foreground/80 backdrop-blur transition-all hover:border-primary/40 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Languages
          className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
        <span className="font-serif tracking-[0.18em]">{current.short}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="min-w-52 rounded-xl border border-border bg-card/95 p-2 backdrop-blur"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {t("language")}
          </DropdownMenuLabel>
          {items.map((i) => (
            <DropdownMenuItem
              key={i.key}
              onClick={() => setLocale(i.key)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm ${
                locale === i.key ? "bg-primary/[0.08] text-foreground" : ""
              }`}
            >
              <span lang={i.key} dir={i.key === "ar" ? "rtl" : "ltr"}>
                {i.label}
              </span>
              {locale === i.key && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-1.5" />
        <DropdownMenuItem
          onClick={onReset}
          className="cursor-pointer rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          ↺ {t("resetProgress")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
