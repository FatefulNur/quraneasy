## 1. Type + resolution logic

- [x] 1.1 Add literal `"speech"` to the `ExampleAudio` union in `src/lib/content/types.ts`; update the doc comment to list it (explicit TTS opt-in) and clarify that absent audio = silent for letters/words.
- [x] 1.2 In `src/lib/useAudio.ts`, add an explicit `audio === "speech"` branch in the resolution effect: set `supported` from `speechSupported()` (and `primeVoices()`), independent of `exampleAudioPlayable`. Branch on `"speech"` BEFORE the WBW/`exampleAudioPlayable` check so the literal can't be parsed as a word-location.
- [x] 1.3 In `src/lib/useAudio.ts` `toggle`, route `audio === "speech"` to `speakArabic`, and REMOVE the implicit `speakArabic` fallback for `speech`-type sources with absent audio (absent audio → no playback, `supported` already false).
- [x] 1.4 Confirm `ayah`-type sources are unchanged: absent audio still plays full AbdulBaset recitation; `audio: false` still disables; never TTS.
- [x] 1.5 Update the stale header comment in `src/lib/audio.ts:3-9` ("two sources / words use Web Speech") to describe the three sources and the opt-in TTS rule.

## 2. Content — enable TTS where pedagogically valid (`audio: "speech"`)

- [x] 2.1 `module-3-arabic-reading.json` — tag all 15 harakah reading drills with `audio: "speech"`: fatha بَ تَ كَ قَ عَ · kasra بِ تِ نِ فِ مِ · damma بُ تُ قُ مُ رُ.
- [x] 2.2 `module-2-preparation.json` — tag the 5 vocabulary/terminology words with `audio: "speech"`: وُضُوء، مُصْحَف، طَاهِر (purity); مَخْرَج، صِفَة (tajweed-basics).

## 3. Content — recover real recitation for Qur'anic words

For each, add a WBW clip (`"s:a:w"`) or recitation segment; verify audibly in `npm run dev`. Drop back to silent (no `audio` field) if no clean isolated source exists.

- [x] 3.1 `module-4-makharij.json` → حَمْد — Al-Fātiḥah `1:2` (الْحَمْدُ). Annotate the الحمد word clip.
- [x] 3.2 `module-4-makharij.json` → شَمْس — e.g. `91:1` (وَالشَّمْسِ) or `81:1`. Annotate.
- [x] 3.3 `module-4-makharij.json` → عِلْم — pick a clean occurrence (e.g. بِعِلْمٍ / عِلْم); verify the isolated word reads correctly, else leave silent.
- [x] 3.4 `module-4-makharij.json` → كَلْب — Al-Kahf `18:18`/`18:22` (كَلْبُهُم). Verify; else leave silent. (Pairs with قلب for ك-vs-ق contrast — must NOT be TTS.)
- [x] 3.5 `module-8-meem-saakin.json` → عَلَيْهِمْ صِرَاطَ (izhar shafawi). Annotate as WBW word(s) from Al-Fātiḥah (عَلَيْهِمْ `1:7`, صِرَاطَ `1:6`/`1:7`) or a segment; verify the meem-saakin junction is audible, else leave silent.
- [x] 3.6 `module-1-introduction.json` → قَلْبُ، كَلْبُ، عِلْمٌ (ق-vs-ك makhraj contrast). Annotate with real recitation where a clean source exists; otherwise leave silent. Do NOT tag `"speech"` (tajweed contrast).

## 4. Content — confirm silenced tajweed examples

- [x] 4.1 Leave with NO `audio` field (now silent): all isolated tajweed letters in `module-4-makharij` (jawf/throat/tongue/lips), `module-5-sifaat`, `module-7-noon-saakin`, `module-10-madd`, `module-11-qalqalah`, plus non-Qur'anic drill فَم and any words from §3 that found no clean source.
- [x] 4.2 Grep `src/content/modules/*.json` to confirm NO remaining word/letter example relies on the old TTS-by-absence default except where intentionally silent — i.e. every `"speech"` tag is on a non-tajweed reading/vocab example, and no tajweed example carries `"speech"`.

## 5. Validate

- [x] 5.1 Run the `curriculum-validator` skill over all module JSON; fix any schema errors from the new `"speech"` value.
- [ ] 5.2 `npm run build` succeeds (type-checks the `ExampleAudio` union change).
- [ ] 5.3 In `npm run dev`, spot-check: (a) a makharij letter shows no speaker button; (b) a `"speech"`-tagged reading drill speaks; (c) an annotated Qur'anic word plays AbdulBaset/WBW recitation (not TTS); (d) ayah examples still play full recitation.
- [x] 5.4 Update `CLAUDE.md` Audio section + the content-model `audio` comment to document the `"speech"` opt-in and silent-by-absence default.
