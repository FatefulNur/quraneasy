import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale, LocaleMap } from "@/lib/content/types";
import { pick, t as tFn } from "@/lib/content/i18n";
import { getStoredLocale, storeLocale, dirFor } from "@/lib/locale";

interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  pick: (m: LocaleMap | undefined) => string;
  dir: "rtl" | "ltr";
}

const LocaleContext = createContext<Ctx | null>(null);

function readInitialLocale(fallback: Locale): Locale {
  if (typeof window === "undefined") return fallback;
  try {
    const attr = document.documentElement.dataset.locale;
    if (attr === "en" || attr === "bn" || attr === "ar") return attr;
  } catch { }
  return getStoredLocale();
}

export function LocaleProvider({
  children,
  initialLocale = "en",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    readInitialLocale(initialLocale)
  );

  // Remove the hide style injected by the inline blocking script
  useEffect(() => {
    const el = document.getElementById("qe-locale-hide");
    if (el) el.remove();
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = dirFor(locale);
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    storeLocale(l);
    startTransition(() => setLocaleState(l));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => tFn(key, locale),
      pick: (m: LocaleMap | undefined) => pick(m, locale),
      dir: dirFor(locale),
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>
      <div className="locale-island">{children}</div>
    </LocaleContext.Provider>
  );
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Safe default for islands rendered outside a provider.
    return {
      locale: "en",
      setLocale: () => {},
      t: (k: string) => tFn(k, "en"),
      pick: (m: LocaleMap | undefined) => pick(m, "en"),
      dir: "ltr",
    };
  }
  return ctx;
}
