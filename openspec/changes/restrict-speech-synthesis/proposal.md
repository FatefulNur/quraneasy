## Why

Web Speech (TTS) is currently the **automatic fallback** for any letter/word example with no `audio` field. In practice 84 examples ride that default, and ~70 of them are isolated tajweed letters (makharij, sifaat, qalqalah, noon-saakin, madd) — precisely the throat/emphatic sounds (ض ظ ط ص ق ع ح غ خ) a generic `ar-SA` synthetic voice mispronounces. The most tajweed-sensitive audio in a Tajweed-teaching app is its least accurate audio, and the wrong path is the one that happens by accident. TTS should never voice a tajweed articulation or Qur'anic ayah; it is acceptable only for plain reading drills and vocabulary where articulation is not the lesson.

## What Changes

- **BREAKING (content semantics):** Invert the audio default. A word/letter example with **no** `audio` field no longer falls back to TTS — it renders **silent** (no speaker button, already a graceful path in `LetterTile.tsx:39`). TTS becomes **opt-in**, not fallback.
- Add a new `ExampleAudio` value `"speech"` — the explicit, only way to enable TTS on an example. Permitted solely for non-tajweed reading drills and vocabulary.
- TTS is **banned** for: all ayah (unchanged — already always AbdulBaset), and all tajweed-articulation examples (makharij/sifaat/qalqalah/noon-saakin/madd letters and tajweed words).
- Tag the ~18 legitimate non-tajweed cases (arabic-reading harakah drills, preparation vocabulary) with `audio: "speech"` to retain their TTS playback.
- Annotate the ~6 Qur'anic words currently mis-tagged to TTS with real recitation (e.g. `عَلَيْهِمْ صِرَاطَ` → Al-Fātiḥah 1:7, `حَمْد` → 1:2, `شَمْس` → 91:1).
- The ~60 isolated tajweed letters / non-Qur'anic tajweed drills with no recitation source become **silent** under this rule (losing wrong audio, not correct audio).
- **Out of scope:** sourcing/recording a real ḥurūf (isolated-letter) audio set to restore correct audio for the silenced tajweed letters. Noted as a follow-on; this change does not depend on it.

## Capabilities

### New Capabilities
- `example-audio`: How letter/word/ayah examples resolve to an audio source — the precedence of real recitation (AbdulBaset segments, word-by-word clips), the opt-in `"speech"` TTS path, explicit-silent (`false`), and silent-by-absence; plus which contexts forbid TTS.

### Modified Capabilities
<!-- No existing canonical spec governs example audio resolution; introduced as a new capability above. -->

## Impact

- **Code:** `src/lib/useAudio.ts` (default no longer routes absent audio to `speakArabic`; new `"speech"` branch), `src/lib/content/types.ts` (`ExampleAudio` union gains `"speech"`), `src/lib/audio.ts` (`exampleAudioPlayable` / header comment), possibly `src/components/{LetterTile,WordCard,AyahExample}.tsx` (no logic change expected — they already hide the button when `supported` is false).
- **Content:** `src/content/modules/*.json` — tag ~18 examples `"speech"`, annotate ~6 Qur'anic words with real audio; ~60 tajweed letters/drills go silent.
- **Behavior:** ~60 isolated tajweed letters lose their play button until a recorded ḥurūf set lands (separate change). No backend, no dependency changes.
