---
name: curriculum-validator
description: Validate all QuranEasy module JSON files against the content-model schema. Checks required fields, locale-map completeness (en/bn/ar), example shapes, and blogSlug references. Run before marking content tasks complete.
license: MIT
compatibility: QuranEasy project. Requires src/content/modules/ and src/content/blog/.
metadata:
  author: quraneasy
  version: "1.0"
---

You are the **curriculum-validator** skill for QuranEasy. Your job is to validate every module JSON file in `src/content/modules/` against the content-model schema and report errors with file + path context.

## Validation steps

### 1. Collect files

List all `.json` files in `src/content/modules/`. For each file, parse the JSON and run the checks below. Report the filename at the top of each file's result block.

### 2. Module-level checks

For each module:

| Check | Pass condition |
|---|---|
| `id` present | Non-empty string |
| `order` | Integer ≥ 1 |
| `recommendedOrder` | Integer ≥ 1 |
| `title` locale map | Non-empty `en`, `bn`, `ar` |
| `summary` locale map | Non-empty `en`, `bn`, `ar` |
| `submodules` | Array, length ≥ 1 |

### 3. Submodule-level checks

For each submodule:

| Check | Pass condition |
|---|---|
| `id` present | Non-empty string |
| `title` locale map | Non-empty `en`, `bn`, `ar` |
| `definition` locale map | Non-empty `en`, `bn`, `ar` |
| `checkItem` (if present) | Non-empty `en`, `bn`, `ar` |
| `blogSlug` (if present) | A file `src/content/blog/<blogSlug>.md` or `.mdx` exists |
| `letterExamples` shape | Each item has non-empty `arabic`; no `meaning` field |
| `wordExamples` shape | Each item has non-empty `arabic`; `meaning` (if present) has at least one non-empty locale |
| `ayahExamples` shape | Each item has non-empty `reference` matching `/^\d+:\d+$/`, non-empty `arabic`, and `translation` with at least one non-empty locale; `translation.ar` MUST be absent |
| Subtopics (if present) | Each subtopic has `id`, `title` locale map (en/bn/ar); no `definition`; no `checkItem` |

### 4. Arabic harakat check (advisory)

Flag any `arabic` string in `letterExamples` or `wordExamples` that contains no harakat characters (Unicode range U+064B–U+065F) as a **warning** (not an error), since some letters are correctly shown unvocalised.

### 5. Report format

```
## Validation Report — src/content/modules/

### module-3-arabic-reading.json  ✓ PASS
All checks passed. 4 submodules, 12 letter examples, 5 word examples.

### module-4-makharij.json  ✗ FAIL
- submodules[1].definition.ar: empty string
- submodules[2].ayahExamples[0].reference: "Surah16:98" does not match \d+:\d+
- submodules[2].ayahExamples[0].translation.ar: must be absent
- WARN: submodules[0].letterExamples[2].arabic "ع" has no harakat (may be intentional)

### Summary
PASS: 10/14 modules
FAIL: 4 modules — see details above
Total errors: 6  |  Warnings: 1
```

## After reporting

- Suggest running `/tajweed-author` to fix missing content.
- Suggest running `/trilingual-translator` to fix empty locale strings.
- If `blogSlug` references are missing, advise creating stub blog files.
- Do not auto-fix — report only. The user decides what to change.
