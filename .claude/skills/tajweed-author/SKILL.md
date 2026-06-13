---
name: tajweed-author
description: Guide authoring a new QuranEasy curriculum module JSON. Enforces the content-model schema (definition + subtopics + letterExamples + wordExamples + ayahExamples + checkItem). Use when adding or editing a module in src/content/modules/.
license: MIT
metadata:
  author: quraneasy
  version: "1.0"
---

You are the **tajweed-author** skill for QuranEasy. Your job is to guide the user through authoring a well-formed module JSON file that conforms to the curriculum content-model schema.

## Source of truth

Read the existing module files in `src/content/modules/` for style and structure reference. Every module, submodule, letter set, and example you emit MUST be grounded in established Tajweed curriculum content. If content is ambiguous or unclear, ask the user before inventing it.

## Schema reference

```jsonc
{
  "id": "module-N-slug",          // e.g. "module-3-arabic-reading"
  "order": N,
  "recommendedOrder": N,          // 1–14
  "title":   { "en": "", "bn": "", "ar": "" },
  "summary": { "en": "", "bn": "", "ar": "" },
  "submodules": [
    {
      "id": "slug",
      "title":      { "en": "", "bn": "", "ar": "" },
      "definition": { "en": "", "bn": "", "ar": "" },  // one sentence, beginner-friendly
      "subtopics": [                                    // optional
        {
          "id": "slug",
          "title": { "en": "", "bn": "", "ar": "" },
          "letterExamples": [ { "arabic": "", "translit": "" } ],
          "wordExamples":   [ { "arabic": "", "translit": "", "meaning": { "en": "", "bn": "" } } ],
          "ayahExamples":   [ { "reference": "S:A", "arabic": "", "translation": { "en": "", "bn": "" } } ]
        }
      ],
      "letterExamples": [],   // bare letter/harakat tokens
      "wordExamples":   [],   // full words with optional translit + meaning
      "ayahExamples":   [],   // full verses
      "checkItem": { "en": "", "bn": "", "ar": "" },   // optional; omit to use default
      "blogSlug": ""          // optional
    }
  ]
}
```

### Example shape rules

| Field | `arabic` | `translit` | `meaning` |
|---|---|---|---|
| `letterExamples` | required (letter/harakat token) | optional | MUST NOT have |
| `wordExamples` | required (full word with harakat) | optional | optional locale map (en, bn) |
| `ayahExamples` | required | — | `translation` locale map (en, bn), NO `ar` |

Arabic text MUST include full harakat (تشكيل) where the curriculum shows them.

### Audio annotations (`audio` field on letter/word examples)

Optional `audio` field selects real-recitation playback (TTS is the fallback and must never be relied on for tajweed accuracy):

- `"s:a:w"` — word-by-word clip from Quran.com's CDN (`https://audio.qurancdn.com/wbw/SSS_AAA_WWW.mp3`). Use for single words whose rule lives **inside** the word, when the displayed harakat match the Quranic occurrence.
- `{ "url": ..., "start": ms, "end": ms }` — continuous slice of an ayah recitation (AbdulBaset Murattal, `audio.qurancdn.com/AbdulBaset/Murattal/mp3/SSSAAA.mp3`). **Required** when the rule spans a word junction (idgham/ikhfa/iqlab between words, lam of الله after a vowel, madd munfasil) — isolated word clips destroy the junction.
- `{ "url": ..., "start": ms }` (no `end`) — play to end of file. Use for pausal forms (madd arid, madd leen, qalqalah kubra) at an **ayah-final** occurrence so the qari's actual stop is heard.
- `false` — disable audio (waqf signs and other non-pronounceable symbols).
- Omit the field for non-Quranic words (dictionary terms) — speech-synthesis fallback applies.

Use `scripts/find-word-locations.py` to locate candidate occurrences and `scripts/apply-word-audio.py` as the reference for resolving locations to verified annotations.

## Authoring flow

When invoked, ask the user:
1. Which module number and slug (e.g. "3 / arabic-reading") — or offer to author all modules not yet present in `src/content/modules/`.
2. Confirm `order` and `recommendedOrder` (same value, 1–14).

Then for each submodule in that module:
- Extract the definition from the document's **Definition** block (if present) or infer a one-sentence beginner explanation.
- List all letter examples from the document's **Examples** list as `letterExamples` (when they are bare letters/harakat) or `wordExamples` (when they are full words).
- Use `subtopics` when the document has named sub-sections (e.g. "Lower throat / Middle throat / Upper throat").
- Include `ayahExamples` only when the document references a full Quranic verse.
- Set `checkItem` to a encouraging completion phrase in all three locales.

After generating the JSON, remind the user to:
- Run `/curriculum-validator` to check locale completeness and schema conformance.
- Run `/trilingual-translator` if any locale maps have empty strings.

## Bangla + Arabic terminology glossary (use consistently)

| English | Bangla | Arabic |
|---|---|---|
| Tajweed | তাজবীদ | التجويد |
| Makharij | মাখারিজ | المخارج |
| Sifaat | সিফাত | الصفات |
| Harakat | হারাকাত | الحركات |
| Fatha | ফাতহা | الفتحة |
| Kasra | কাসরাহ | الكسرة |
| Damma | দাম্মাহ | الضمة |
| Sukoon | সুকুন | السكون |
| Shaddah | শাদ্দাহ | الشدة |
| Tanween | তানবীন | التنوين |
| Ghunna | গুন্নাহ | الغنة |
| Qalqalah | ক্বলক্বলাহ | القلقلة |
| Madd | মাদ্দ | المد |
| Waqf | ওয়াকফ | الوقف |
| Ibtida | ইবতিদা | الابتداء |
| Noon Saakin | নুন সাকিন | النون الساكنة |
| Meem Saakin | মীম সাকিন | الميم الساكنة |
| Tafkheem | তাফখীম | التفخيم |
| Tarqeeq | তারক্বীক | الترقيق |
| Izhar | ইযহার | الإظهار |
| Idgham | ইদগাম | الإدغام |
| Ikhfa | ইখফা | الإخفاء |
| Iqlab | ইক্বলাব | الإقلاب |
| Tilawat | তিলাওয়াত | التلاوة |
| Tartil | তারতীল | الترتيل |

## Output

Emit the complete module JSON. Validate mentally before output: every locale map must have non-empty `en`, `bn`, `ar`. Every `arabic` string in examples must have harakat where the source curriculum shows them. Every `reference` in ayahExamples must follow `S:A` format (e.g. `73:4`).
