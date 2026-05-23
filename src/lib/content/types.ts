export type Locale = "en" | "bn" | "ar";
export const LOCALES: Locale[] = ["en", "bn", "ar"];

export type LocaleMap = Partial<Record<Locale, string>>;
export type TranslationMap = Partial<Record<Exclude<Locale, "ar">, string>>;

export interface Submodule {
  id: string;
  text: LocaleMap;
}

export interface AyahExample {
  reference: string;
  arabic: string;
  translation: TranslationMap;
}

export interface Slide {
  id: string;
  title: LocaleMap;
  submodules: Submodule[];
  ayahExamples?: AyahExample[];
  blogSlug?: string;
}

export interface Module {
  id: string;
  order: number;
  title: LocaleMap;
  summary: LocaleMap;
  slides: Slide[];
}
