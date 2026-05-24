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

export interface BlogLink {
  slug: string;
  label: LocaleMap;
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
  blogSlug?: string;       // legacy — single link, no label
  blogLinks?: BlogLink[];  // preferred — multiple labelled links
}

export interface BlogPost {
  id: string;
  title: LocaleMap;
  description: LocaleMap;
  date: string;
  author?: string;
  tags?: string[];
  category?: string;
  modules?: string[];
  coverImage?: string;
  content: LocaleMap;
}

export interface Module {
  id: string;
  order: number;
  recommendedOrder: number;
  title: LocaleMap;
  summary: LocaleMap;
  submodules: Submodule[];
}
