import {
  createContext,
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

export function LocaleProvider({
  children,
  initialLocale = "en",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored !== locale) setLocaleState(stored);
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = dirFor(locale);
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    storeLocale(l);
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
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
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

export function useT() {
  return useLocale().t;
}
