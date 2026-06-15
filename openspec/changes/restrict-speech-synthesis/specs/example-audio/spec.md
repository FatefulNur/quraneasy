## ADDED Requirements

### Requirement: Audio source resolution for examples

The system SHALL resolve the audio source of a letter, word, or ayah example from its `audio` field with a fixed precedence, and SHALL never play speech synthesis (TTS) except when explicitly opted in via `audio: "speech"`.

Resolution precedence for word and letter examples:
1. `audio` is a word-location string (`"s:a:w"` / `"s:a:w1-w2"`) → play word-by-word recitation clip(s).
2. `audio` is an object `{ url, start?, end? }` → play that continuous AbdulBaset recitation segment.
3. `audio` is the literal `"speech"` → play Web Speech (TTS).
4. `audio` is `false` → no playback (explicitly silent).
5. `audio` is absent → no playback (silent; no speaker affordance rendered).

For ayah examples, an absent `audio` field SHALL play the full-verse AbdulBaset recitation parsed from `reference`; ayah examples SHALL never use TTS.

#### Scenario: Absent audio on a letter or word example is silent

- **WHEN** a letter or word example has no `audio` field
- **THEN** the system renders no speaker button and plays nothing (it does NOT fall back to speech synthesis)

#### Scenario: Explicit speech opt-in plays TTS

- **WHEN** a word or letter example has `audio: "speech"`
- **THEN** the system plays the Arabic text via Web Speech (`ar-SA`) when the browser supports it

#### Scenario: Word-location string plays real recitation

- **WHEN** an example has `audio` matching `"s:a:w"` or `"s:a:w1-w2"`
- **THEN** the system plays the corresponding word-by-word recitation clip(s) and never TTS

#### Scenario: Segment object plays a recitation slice

- **WHEN** an example has `audio` of the form `{ url, start?, end? }`
- **THEN** the system plays that continuous AbdulBaset segment and never TTS

#### Scenario: Ayah without explicit audio plays full recitation

- **WHEN** an ayah example has no `audio` field and a parseable `reference`
- **THEN** the system plays the full-verse AbdulBaset recitation and never TTS

### Requirement: Speech synthesis forbidden for tajweed and Qur'anic content

The system SHALL NOT use speech synthesis for any ayah, nor for any example whose purpose is to demonstrate a tajweed articulation (makharij, sifaat, qalqalah, noon-saakin, meem-saakin, ghunna, madd, or a tajweed-rule word). The `audio: "speech"` opt-in SHALL be applied only to non-tajweed reading drills and vocabulary terms where articulation accuracy is not the lesson.

#### Scenario: Tajweed letter has no speech fallback

- **WHEN** a makharij/sifaat/qalqalah/noon-saakin/madd letter example has no real-recitation source
- **THEN** the example is silent (no `"speech"` opt-in is applied to it)

#### Scenario: Qur'anic word uses real recitation, not speech

- **WHEN** an example word also occurs in the Qur'an (e.g. a word from Al-Fātiḥah)
- **THEN** it is annotated with a word-by-word clip or recitation segment rather than `audio: "speech"`

### Requirement: Graceful absence of audio affordance

When an example resolves to no playable audio source (absent audio, `audio: false`, or `"speech"` on a browser without speech support), the system SHALL render the example content without a speaker button and SHALL NOT present a broken or non-functional control.

#### Scenario: Silent example renders without speaker button

- **WHEN** an example has no playable audio source
- **THEN** the tile/card renders its content normally with no play control and no error state
