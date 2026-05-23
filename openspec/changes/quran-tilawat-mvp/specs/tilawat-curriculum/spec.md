## ADDED Requirements

### Requirement: Fourteen-module beginner Tajweed curriculum
The system SHALL ship a beginner Tajweed curriculum composed of fourteen modules derived from the curriculum, authored trilingual (en / bn / ar) at first publication. Each module file lives at `src/content/modules/<module-id>.json` and conforms to the content-model schema.

The fourteen modules and their canonical IDs:

| `recommendedOrder` | `id` | Topic |
| --- | --- | --- |
| 1 | `module-1-introduction` | Introduction to Tajweed |
| 2 | `module-2-preparation` | Preparation Before Recitation (replaces former `tilawat-rules.json`) |
| 3 | `module-3-arabic-reading` | Arabic Reading Foundations (Harakat, Sukoon, Shaddah, Tanween) |
| 4 | `module-4-makharij` | Makharij (Articulation Points) |
| 5 | `module-5-sifaat` | Sifaat (Characteristics of Letters) |
| 6 | `module-6-allah-raa` | Rules of Allah Word and Raa |
| 7 | `module-7-noon-saakin` | Noon Saakin and Tanween Rules |
| 8 | `module-8-meem-saakin` | Meem Saakin Rules |
| 9 | `module-9-ghunna` | Ghunna |
| 10 | `module-10-madd` | Madd (Lengthening Rules) |
| 11 | `module-11-qalqalah` | Qalqalah |
| 12 | `module-12-tafkheem-tarqeeq` | Tafkheem and Tarqeeq |
| 13 | `module-13-waqf` | Waqf and Ibtida |
| 14 | `module-14-learning-order` | Recommended Learning Order (meta / index) |

#### Scenario: All fourteen modules appear on the landing page
- **WHEN** the user opens `/` in any locale
- **THEN** fourteen module cards render, sorted ascending by `recommendedOrder`, each showing its localized `title`, `summary`, completion progress (`checked / total submodules`), and a recommended-order badge

#### Scenario: Each module is independently openable
- **WHEN** the user clicks any module card
- **THEN** the slide viewer opens for that module regardless of progress in earlier modules — no cross-module unlock gate exists

### Requirement: Each module covers its the curriculum topics as submodules
Every module file MUST include a `submodules[]` array whose entries cover the subsections listed under that module in the curriculum. Each submodule MUST include a localized `definition` and at least one example (letter / word / ayah) when the source curriculum provides one.

#### Scenario: Module 3 has Harakat, Sukoon, Shaddah, Tanween submodules
- **WHEN** the user opens `module-3-arabic-reading`
- **THEN** the submodule list contains entries for `harakat` (with subtopics Fatha/Kasra/Damma), `sukoon`, `shaddah`, and `tanween` (with subtopics Fathatan/Kasratan/Dammatan)

#### Scenario: Module 7 has Izhar, Idgham, Ikhfa, Iqlab submodules
- **WHEN** the user opens `module-7-noon-saakin`
- **THEN** the submodule list contains entries for `izhar`, `idgham`, `ikhfa`, and `iqlab`, each with letter sets and word examples per the curriculum

#### Scenario: Module 10 has the seven Madd types
- **WHEN** the user opens `module-10-madd`
- **THEN** the submodule list contains `madd-asli`, `madd-badal`, `madd-muttasil`, `madd-munfasil`, `madd-lazim`, `madd-arid-lis-sukoon`, and `madd-leen`

### Requirement: Trilingual completeness at first publication
At first publication, every locale map across the fourteen modules (titles, summaries, definitions, word `meaning`, ayah `translation` for `en` and `bn`, `checkItem`) MUST contain non-empty strings for `en`, `bn`, and `ar` (or for `en` and `bn` where Arabic is implicit, as for ayah translations).

#### Scenario: No empty user-visible string after build
- **WHEN** the curriculum validator runs against `src/content/modules/*.json`
- **THEN** it reports zero missing locale strings for required fields across all fourteen modules

### Requirement: Recommended learning path is visible on landing
The landing page SHALL render the recommended-order sequence as a visually connected path (numbered badges, a "Recommended path" label, or equivalent affordance) so beginners can follow the curriculum Module 14's order without having to read text instructions.

#### Scenario: Beginner sees the suggested route
- **WHEN** the landing page renders to a new user with no progress
- **THEN** module cards display sequential numbered badges (1–14) and a visible label or connector indicating the recommended order

### Requirement: Example-bearing submodules render letter/word/ayah cards distinctly
Submodules whose source curriculum contains letter-level examples (e.g. Makharij letter lists, Harakat) MUST render those as letter tiles. Submodules with word-level examples (e.g. Qalqalah examples like `أَحَدْ`) MUST render those as word cards. Submodules whose curriculum references full Quranic verses MUST render those as ayah cards with reference + translation.

#### Scenario: Makharij submodule shows letter tiles
- **WHEN** the user opens the `throat` submodule of Module 4
- **THEN** the letters ء ه ع ح غ خ render as letter tiles grouped by subtopic (Lower / Middle / Upper throat), with word examples (`أَحَد`, `هُدَى`, etc.) shown as separate word cards below

#### Scenario: Tartil submodule cites Ayah 73:4
- **WHEN** the user opens the `tartil` submodule (Module 2)
- **THEN** an ayah card displays reference `73:4`, the Arabic verse, and `translation.en` / `translation.bn` per the current locale

## REMOVED Requirements

### Requirement: Tilawat Rules module exists
**Reason**: superseded by the fourteen-module curriculum. The former content becomes Module 2 (`module-2-preparation`) under the new `tilawat-curriculum` capability.
**Migration**: `src/content/modules/tilawat-rules.json` is renamed to `src/content/modules/module-2-preparation.json` and restructured per the new content-model (`slides[]` → `submodules[]`; per-slide submodule checkboxes collapse into one `checkItem` per new submodule).

### Requirement: Core slides cover beginner prerequisites
**Reason**: replaced by "Each module covers its the curriculum topics as submodules". The original six topics (purity, intention, qiblah/posture, ta'awwudh & basmalah, tajweed basics, tartil) survive as submodules within `module-2-preparation`.

### Requirement: Beginner-friendly content depth
**Reason**: kept in spirit (one-sentence `definition` per submodule, "Load more" still applies to ayah examples) but the wording referenced "slides", which no longer exist. The new content-model spec covers the same intent at the schema level.

### Requirement: Quranic ayah examples on relevant slides
**Reason**: replaced by "Example-bearing submodules render letter/word/ayah cards distinctly", which generalizes to letter and word examples in addition to ayah examples.
