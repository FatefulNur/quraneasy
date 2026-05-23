import { isLocale } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";

const KEY = "qe:locale";

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const v = window.localStorage.getItem(KEY);
    if (isLocale(v)) return v;
  } catch {
    // ignore
  }
  return "en";
}

export function storeLocale(loc: Locale): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, loc);
  } catch {
    // ignore
  }
}

export function dirFor(loc: Locale): "rtl" | "ltr" {
  return loc === "ar" ? "rtl" : "ltr";
}
