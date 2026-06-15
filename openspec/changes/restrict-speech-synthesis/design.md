## Context

Audio for examples lives in `src/lib/audio.ts` (sources + playback) and `src/lib/useAudio.ts` (per-example resolution + React state). Three sources exist today:

1. **AbdulBaset Murattal** full-verse / timed segments — `RECITER_BASE`, real qari, correct tajweed.
2. **Word-by-word clips** — `WBW_BASE`, a separate per-word reciter for isolated Qur'anic words.
3. **Web Speech (TTS)** — `speakArabic()`, `ar-SA`, the automatic fallback when an example has no `audio` field.

`useAudio.ts:81-85` routes a word/letter example with no playable `audio` straight to `speakArabic`. An audit of `src/content/modules/*.json` found 84 examples on that TTS fallback: 70 isolated letters (mostly makharij/sifaat/qalqalah/noon-saakin/madd — the emphatic/throat letters a generic synthetic voice renders wrong) and 14 words. The Qur'an contains no isolated letters (except muqattaʿāt), so sources #1/#2 cannot supply audio for a bare letter — meaning TTS is currently the *only* audio for the app's most tajweed-critical content, and it is the least accurate.

`LetterTile.tsx:39` already renders a plain `div` (no button) when `audio.supported` is false, so "no audio" is a graceful, existing UI state.

## Goals / Non-Goals

**Goals:**
- Make TTS impossible-by-default: absent `audio` on word/letter examples = silent, not spoken.
- Provide one explicit opt-in (`audio: "speech"`) so TTS survives exactly where it's pedagogically fine (reading drills, vocabulary).
- Recover real recitation for the handful of Qur'anic words currently mis-tagged to TTS.
- Keep ayah behavior identical (always AbdulBaset, never TTS).

**Non-Goals:**
- Sourcing or recording an isolated-letter (ḥurūf) audio set to restore audio for the ~60 silenced tajweed letters. Separate future change.
- Touching the AbdulBaset / WBW playback paths, caching, or the segment decision table.
- Removing the speech-synthesis code itself — `speakArabic` stays, just reachable only via `"speech"`.

## Decisions

**D1 — Invert the default instead of tagging every tajweed example `false`.**
Two ways to stop TTS on tajweed letters: (a) keep default=TTS and add `audio: false` to all ~60 tajweed examples, or (b) change the default so absent audio = silent and add `audio: "speech"` to the ~18 that should speak. Chose (b): fewer edits, and — critically — it makes the dangerous path (TTS on a new tajweed example) the one that *cannot* happen by accident. Future content authored without an `audio` field is silent-safe rather than wrong-audio.

**D2 — New union member `"speech"` rather than a separate boolean field.**
`ExampleAudio` is already a discriminated-ish union (`string | {url} | false`). Adding the literal `"speech"` keeps a single field and a single resolution function. `"speech"` cannot collide with the word-location string form: `wordAudioUrls()` only matches `^\d+:\d+:\d+`, so `"speech"` falls through. We branch on it explicitly in `useAudio` before the WBW check. Alternative considered — `tts: true` sibling field — rejected as a second source of truth for one concept.

**D3 — `exampleAudioPlayable` stays "real recitation only".**
Keep `exampleAudioPlayable()` meaning "has a real-recitation source" (WBW or segment). `"speech"` is handled as its own branch in `useAudio` (sets `supported` from `speechSupported()`), so the `ayah`/`speech` resolution logic stays readable and the type guard keeps its current callers correct.

**D4 — Classification is editorial, encoded in content.**
Whether an example "teaches tajweed articulation" is a human judgment, not derivable from the JSON. It is applied per-example during content edits (see tasks), not by code. Module context decides: `module-3-arabic-reading` harakah drills and `module-2-preparation` terminology → `"speech"`; makharij/sifaat/qalqalah/noon-saakin/madd letters and tajweed words → real audio or silent.

## Risks / Trade-offs

- **~60 tajweed letters go silent** → Accepted: they lose *incorrect* audio, not correct audio; the ḥurūf-set follow-on restores them properly. Surfaced explicitly in the proposal.
- **Misclassifying a tajweed example as `"speech"`** → Mitigation: the tasks list enumerates every `"speech"` tag explicitly; default-silent means an *omission* is safe (silent), only an active wrong `"speech"` tag voices tajweed.
- **`"speech"` string mistaken for a word-location by a future regex change** → Mitigation: branch on `audio === "speech"` first, before `wordAudioUrls`; add a guarding test/comment.
- **A Qur'anic-word annotation picks the wrong verse/segment** → Mitigation: the annotation table lists reference + expected source per word; verify audibly in `npm run dev` before ticking.

## Migration Plan

1. Type: add `"speech"` to `ExampleAudio` in `src/lib/content/types.ts`; update the doc comment.
2. Logic: in `useAudio.ts`, add an `audio === "speech"` branch (resolve `supported` via `speechSupported()`, play via `speakArabic`); remove the implicit `speakArabic` fallback for absent audio on `speech`-type sources. Update `audio.ts` header comment (currently says "two sources / words use Web Speech").
3. Content: tag the ~18 reading/vocab examples `"speech"`; annotate the ~6 Qur'anic words with real audio. Leave the remaining tajweed letters/drills with no `audio` field (now silent).
4. Validate: run `curriculum-validator`; `npm run build`; spot-check in `npm run dev` that tajweed letters show no button, `"speech"` examples speak, and the annotated Qur'anic words play recitation.

Rollback: revert the `useAudio.ts` branch — absent audio returns to TTS fallback; content `"speech"` tags become harmless (still route to TTS).
