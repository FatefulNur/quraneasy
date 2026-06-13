import { useCallback, useEffect, useRef, useState } from "react";
import {
  exampleAudioPlayable,
  parseAyahReference,
  playAyahSequence,
  playExampleAudio,
  primeVoices,
  speakArabic,
  speechSupported,
  stopPlayback,
  type AudioState,
} from "@/lib/audio";
import type { ExampleAudio } from "@/lib/content/types";

export type AudioSource =
  // `audio` (when set and not false) plays a specific span — used for waqf
  // demos where the shown text is only part of the verse. Falls back to the
  // full-ayah recitation parsed from `reference` when absent.
  | { type: "ayah"; reference: string; audio?: ExampleAudio }
  // `audio` (when set and not false) plays real recitation; speech synthesis
  // is only the fallback for unannotated examples. `audio: false` disables
  // playback entirely (e.g. waqf signs — symbols, not pronounceable text).
  | { type: "speech"; text: string; audio?: ExampleAudio };

export function useAudio(source: AudioSource) {
  const [state, setState] = useState<AudioState>("idle");
  // Starts false so SSR and first client render match; flips after mount.
  const [supported, setSupported] = useState(false);
  const mounted = useRef(true);
  const sourceRef = useRef(source);
  sourceRef.current = source;

  const sourceKey =
    source.type === "ayah"
      ? `ayah:${source.reference}:${JSON.stringify(source.audio ?? null)}`
      : `speech:${source.text}:${JSON.stringify(source.audio ?? null)}`;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const src = sourceRef.current;
    if (src.type === "ayah") {
      if (src.audio === false) setSupported(false);
      else if (exampleAudioPlayable(src.audio)) setSupported(true);
      else setSupported(parseAyahReference(src.reference) !== null);
      return;
    }
    if (src.audio === false) {
      setSupported(false);
      return;
    }
    if (exampleAudioPlayable(src.audio)) {
      setSupported(true);
      return;
    }
    const ok = speechSupported();
    setSupported(ok);
    if (ok) primeVoices();
  }, [sourceKey]);

  const toggle = useCallback(() => {
    if (state !== "idle") {
      stopPlayback();
      return;
    }
    const onState = (s: AudioState) => {
      if (mounted.current) setState(s);
    };
    const src = sourceRef.current;
    if (src.type === "ayah") {
      if (src.audio !== false && exampleAudioPlayable(src.audio)) {
        playExampleAudio(src.audio, onState);
      } else if (src.audio !== false) {
        void playAyahSequence(src.reference, onState);
      }
    } else if (src.audio !== false && exampleAudioPlayable(src.audio)) {
      playExampleAudio(src.audio, onState);
    } else if (src.audio !== false) {
      speakArabic(src.text, onState);
    }
  }, [state]);

  return { state, supported, toggle };
}
