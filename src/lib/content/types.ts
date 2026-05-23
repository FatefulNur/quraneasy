export type Locale = "en" | "bn" | "ar";
export const LOCALES: Locale[] = ["en", "bn", "ar"];

export type LocaleMap = Partial<Record<Locale, string>>;
export type TranslationMap = Partial<Record<Exclude<Locale, "ar">, string>>;

export interface LetterExample {
  arabic: string;
  translit?: string;
}

export interface WordExample {
  arabic: string;
  translit?: string;
  meaning?: TranslationMap;
}

export interface AyahExample {
  reference: string;
  arabic: string;
  translation: TranslationMap;
}

export interface Subtopic {
  id: string;
  title: LocaleMap;
  letterExamples?: LetterExample[];
  wordExamples?: WordExample[];
  ayahExamples?: AyahExample[];
}

export interface Submodule {
  id: string;
  title: LocaleMap;
  definition: LocaleMap;
  subtopics?: Subtopic[];
  letterExamples?: LetterExample[];
  wordExamples?: WordExample[];
  ayahExamples?: AyahExample[];
  checkItem?: LocaleMap;
  blogSlug?: string;
}

export interface Module {
  id: string;
  order: number;
  recommendedOrder: number;
  title: LocaleMap;
  summary: LocaleMap;
  submodules: Submodule[];
}
