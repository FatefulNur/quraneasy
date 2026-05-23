import type { Locale, LocaleMap } from "./types";
import { LOCALES } from "./types";

import en from "@/content/i18n/en.json";
import bn from "@/content/i18n/bn.json";
import ar from "@/content/i18n/ar.json";

const STRINGS: Record<Locale, Record<string, string>> = {
  en: en as Record<string, string>,
  bn: bn as Record<string, string>,
  ar: ar as Record<string, string>,
};

export function pick(map: LocaleMap | undefined, locale: Locale): string {
  if (!map) return "";
  const direct = map[locale];
  if (direct && direct.trim()) return direct;
  if (map.en && map.en.trim()) return map.en;
  for (const l of LOCALES) {
    const v = map[l];
    if (v && v.trim()) return v;
  }
  return "";
}

export function t(key: string, locale: Locale): string {
  const direct = STRINGS[locale]?.[key];
  if (direct) return direct;
  return STRINGS.en?.[key] ?? key;
}

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "bn" || v === "ar";
}
