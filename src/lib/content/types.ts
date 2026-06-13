export type Locale = "en" | "bn" | "ar";
export const LOCALES: Locale[] = ["en", "bn", "ar"];

export type LocaleMap = Partial<Record<Locale, string>>;
export type TranslationMap = Partial<Record<Exclude<Locale, "ar">, string>>;

// Real-recitation audio for an example:
// - "s:a:w" / "s:a:w1-w2" — word-by-word clip(s) from audio.qurancdn.com
// - { url, start?, end? } — continuous segment of an ayah recitation (ms);
//   required when a tajweed rule spans a word boundary, since isolated
//   word clips would drop the junction (idgham/ikhfa/iqlab).
// - false — explicitly no audio (e.g. waqf signs, which are symbols).
// When absent, playback falls back to speech synthesis.
export type ExampleAudio =
  | string
  | { url: string; start?: number; end?: number }
  | false;

export interface LetterExample {
  arabic: string;
  translit?: string;
  audio?: ExampleAudio;
}

export interface WordBreakdown {
  original?: string;
  stepByStep: LocaleMap[];
  phoneticHint: LocaleMap;
}

export interface WordExample {
  arabic: string;
  translit?: string;
  meaning?: TranslationMap;
  breakdown?: WordBreakdown;
  audio?: ExampleAudio;
}

export interface AyahExample {
  reference: string;
  arabic: string;
  translation: TranslationMap;
  // When the displayed `arabic` is only part of the verse (e.g. a waqf
  // demonstration), `audio` plays just that span instead of the whole ayah.
  // Same shape as example audio: a timed segment, a word location, or false.
  audio?: ExampleAudio;
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
