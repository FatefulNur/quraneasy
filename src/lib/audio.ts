// Audio playback for Tajweed examples.
//
// Two sources, deliberately different:
// - Ayah examples play real recitation MP3s (AbdulBaset Murattal via the
//   audio.qurancdn.com CDN — slow, clear, well suited to beginners). TTS must
//   never be used for Quranic text — synthetic speech models the wrong
//   tajweed, which defeats the purpose of the app.
// - Words/letters use the browser's Web Speech API (Arabic voice). Free,
//   fully client-side, no network calls, so nothing to cache or rate-limit.
//
// Recitation MP3s are cached client-side via the Cache Storage API with a
// TTL stamp, on top of the CDN's own edge cache. Works on static Cloudflare
// Pages — no Worker or backend required.

import type { ExampleAudio } from "@/lib/content/types";

export type AudioState = "idle" | "loading" | "playing";
export type StateCallback = (state: AudioState) => void;

export interface AyahLocation {
  surah: number;
  ayah: number;
}

const RECITER_BASE = "https://audio.qurancdn.com/AbdulBaset/Murattal/mp3";
const WBW_BASE = "https://audio.qurancdn.com/wbw";
const CACHE_NAME = "qe-audio-v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHED_AT_HEADER = "qe-cached-at";
const MAX_RANGE = 10;

// Matches the trailing "surah:ayah" or "surah:start–end" of a reference,
// so both "16:98" and "Al-Baqarah 2:6" / "Al-Kahf 18:1–2" parse.
const REF_RE = /(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[–—-]\s*(\d{1,3}))?\s*$/;

export function parseAyahReference(reference: string): AyahLocation[] | null {
  const m = REF_RE.exec(reference);
  if (!m) return null;
  const surah = Number(m[1]);
  const start = Number(m[2]);
  const end = m[3] ? Number(m[3]) : start;
  if (surah < 1 || surah > 114 || start < 1 || end < start) return null;
  const locations: AyahLocation[] = [];
  for (let ayah = start; ayah <= end && ayah < start + MAX_RANGE; ayah++) {
    locations.push({ surah, ayah });
  }
  return locations;
}

const pad3 = (n: number) => String(n).padStart(3, "0");

export function ayahAudioUrl({ surah, ayah }: AyahLocation): string {
  return `${RECITER_BASE}/${pad3(surah)}${pad3(ayah)}.mp3`;
}

// "surah:ayah:word" or "surah:ayah:word1-word2" → word-by-word recitation
// clips from Quran.com's CDN (real qari, correct tajweed per isolated word).
const WORD_RE = /^(\d{1,3}):(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/;

export function wordAudioUrls(location: string): string[] | null {
  const m = WORD_RE.exec(location);
  if (!m) return null;
  const surah = Number(m[1]);
  const ayah = Number(m[2]);
  const start = Number(m[3]);
  const end = m[4] ? Number(m[4]) : start;
  if (surah < 1 || surah > 114 || ayah < 1 || start < 1 || end < start) {
    return null;
  }
  const urls: string[] = [];
  for (let w = start; w <= end && w < start + MAX_RANGE; w++) {
    urls.push(`${WBW_BASE}/${pad3(surah)}_${pad3(ayah)}_${pad3(w)}.mp3`);
  }
  return urls;
}

// Session-scoped blob URLs so repeated plays skip both network and IDB.
const blobUrls = new Map<string, string>();

async function cachedSrc(url: string): Promise<string> {
  const existing = blobUrls.get(url);
  if (existing) return existing;
  if (typeof caches === "undefined") return url;
  try {
    const cache = await caches.open(CACHE_NAME);
    let res = await cache.match(url);
    if (res) {
      const cachedAt = Number(res.headers.get(CACHED_AT_HEADER) ?? 0);
      if (Date.now() - cachedAt > CACHE_TTL_MS) {
        await cache.delete(url);
        res = undefined;
      }
    }
    if (!res) {
      const fetched = await fetch(url);
      if (!fetched.ok) return url;
      const blob = await fetched.blob();
      res = new Response(blob, {
        headers: {
          "Content-Type": blob.type || "audio/mpeg",
          [CACHED_AT_HEADER]: String(Date.now()),
        },
      });
      await cache.put(url, res.clone());
    }
    const blobUrl = URL.createObjectURL(await res.blob());
    blobUrls.set(url, blobUrl);
    return blobUrl;
  } catch {
    // CORS/network failure: hand the CDN URL straight to <audio>, which can
    // play cross-origin media without CORS (browser HTTP cache still applies).
    return url;
  }
}

// Only one thing plays at a time, across recitation and speech.
let activeStop: (() => void) | null = null;

export function stopPlayback(): void {
  const stop = activeStop;
  activeStop = null;
  stop?.();
}

function claim(stop: () => void): void {
  stopPlayback();
  activeStop = stop;
}

function release(stop: () => void): void {
  if (activeStop === stop) activeStop = null;
}

function playOnce(
  audio: HTMLAudioElement,
  src: string,
  onState: StateCallback,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    audio.src = src;
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("audio playback failed"));
    audio.play().then(() => onState("playing"), reject);
  });
}

async function playUrls(
  urls: string[],
  onState: StateCallback,
): Promise<void> {
  if (urls.length === 0) return;

  const audio = new Audio();
  audio.preload = "auto";
  let cancelled = false;
  const stop = () => {
    cancelled = true;
    audio.pause();
    audio.removeAttribute("src");
    onState("idle");
  };
  claim(stop);
  onState("loading");

  try {
    for (const directUrl of urls) {
      if (cancelled) return;
      // Never await before play(): Safari/iOS only allows play() while the
      // user-gesture token is live, and an awaited fetch consumes it. Play
      // from the in-memory blob if we already have one, otherwise straight
      // from the CDN, and warm the Cache Storage copy in the background.
      const src = blobUrls.get(directUrl) ?? directUrl;
      void cachedSrc(directUrl);
      try {
        await playOnce(audio, src, onState);
      } catch (err) {
        if (cancelled) return;
        if (src === directUrl) throw err;
        // Blob playback failed; retry straight from the CDN.
        await playOnce(audio, directUrl, onState);
      }
    }
  } catch {
    // Network down or file missing — fall through to idle.
  } finally {
    if (!cancelled) {
      release(stop);
      onState("idle");
    }
  }
}

export async function playAyahSequence(
  reference: string,
  onState: StateCallback,
): Promise<void> {
  const locations = parseAyahReference(reference);
  if (!locations || locations.length === 0) return;
  return playUrls(locations.map(ayahAudioUrl), onState);
}

export interface AudioSegment {
  url: string;
  start?: number; // ms
  end?: number; // ms; omitted = play to end of file
}

// Plays a continuous slice of an ayah recitation. Used when a tajweed rule
// spans a word boundary — isolated word clips would drop the junction.
export function playSegment(
  segment: AudioSegment,
  onState: StateCallback,
): void {
  const audio = new Audio();
  audio.preload = "auto";
  const startSec = (segment.start ?? 0) / 1000;
  const endSec = segment.end != null ? segment.end / 1000 : Infinity;

  let cancelled = false;
  let watcher = 0;
  const stop = () => {
    cancelled = true;
    clearInterval(watcher);
    audio.pause();
    audio.removeAttribute("src");
    onState("idle");
  };
  claim(stop);
  onState("loading");

  const finish = () => {
    if (cancelled) return;
    clearInterval(watcher);
    audio.pause();
    release(stop);
    onState("idle");
  };

  // A media-fragment src starts playback at the offset without waiting for
  // metadata, keeping play() inside the user-gesture window. CDN supports
  // range requests (verified), so the seek streams instantly.
  audio.src = startSec > 0 ? `${segment.url}#t=${startSec}` : segment.url;
  // Belt-and-braces for engines that ignore the fragment:
  audio.onloadedmetadata = () => {
    if (audio.currentTime < startSec - 0.1) {
      try {
        audio.currentTime = startSec;
      } catch {
        /* not seekable — play from 0 rather than fail */
      }
    }
  };
  audio.onended = finish;
  audio.onerror = finish;
  audio.play().then(
    () => {
      if (cancelled) return;
      onState("playing");
      if (endSec !== Infinity) {
        watcher = window.setInterval(() => {
          if (audio.currentTime >= endSec) finish();
        }, 50);
      }
    },
    finish,
  );
}

// Unified entry point for an example's `audio` field.
export function exampleAudioPlayable(
  audio: ExampleAudio | undefined,
): audio is Exclude<ExampleAudio, false> {
  if (audio === false || audio == null) return false;
  if (typeof audio === "string") return wordAudioUrls(audio) !== null;
  return typeof audio.url === "string" && audio.url.length > 0;
}

export function playExampleAudio(
  audio: Exclude<ExampleAudio, false>,
  onState: StateCallback,
): void {
  if (typeof audio === "string") {
    const urls = wordAudioUrls(audio);
    if (urls) void playUrls(urls, onState);
  } else {
    playSegment(audio, onState);
  }
}

export function speechSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined"
  );
}

// Voice lists load asynchronously in most browsers; calling getVoices() early
// (and re-querying on voiceschanged) warms them before first playback.
export function primeVoices(): void {
  if (!speechSupported()) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

function pickArabicVoice(): SpeechSynthesisVoice | undefined {
  return window.speechSynthesis
    .getVoices()
    .find((v) => v.lang.toLowerCase().startsWith("ar"));
}

// Chrome GCs utterances that are only referenced by the synth queue, which
// silently drops their onend/onerror callbacks mid-speech — the button would
// then be stuck in "playing". Retain the current one until it finishes.
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakArabic(text: string, onState: StateCallback): void {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ar-SA";
  const voice = pickArabicVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 0.85; // slightly slow for learners

  const stop = () => {
    if (currentUtterance === utterance) currentUtterance = null;
    synth.cancel();
    onState("idle");
  };
  claim(stop);
  currentUtterance = utterance;
  onState("loading");
  const finish = () => {
    clearTimeout(watchdog);
    if (currentUtterance === utterance) currentUtterance = null;
    release(stop);
    onState("idle");
  };
  // If the engine never starts speaking (no Arabic voice, dead engine),
  // give up instead of leaving the button stuck on "loading".
  const watchdog = setTimeout(() => {
    if (currentUtterance === utterance) {
      synth.cancel();
      finish();
    }
  }, 4000);
  utterance.onstart = () => {
    clearTimeout(watchdog);
    onState("playing");
  };
  utterance.onend = finish;
  utterance.onerror = finish;
  // Chrome can leave the engine stuck paused or with a dead queued utterance;
  // clearing and resuming before speak() makes repeated playback reliable.
  synth.cancel();
  synth.resume();
  synth.speak(utterance);
}
