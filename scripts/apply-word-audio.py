#!/usr/bin/env python3
"""Apply reviewed audio annotations to module JSON files.

All recitation is AbdulBaset Murattal (reciter 2); Alafasy is not used.

Decision modes:
  wbw     "s:a:w"      word-by-word clip (isolated word; rule is inside the word)
  seg     "s:a:w1-w2"  continuous ayah segment (rule spans the word junction)
  seg2    "s:a:w1-w2"  alias of seg (kept for historical entries)
  segend  "s:a:w"      segment from word start to end of file (rule needs the
                       qari's actual pause: madd arid, madd leen, qalqalah kubra)
  *-find  locate word position(s) in the verse by skeleton instead of number

Every location is re-verified against the fetched verse text before writing.
"""
import json
import glob
import re
import sys
import time
import unicodedata
import urllib.request

API = "https://api.quran.com/api/v4"
AUDIO_BASE = "https://audio.qurancdn.com/"

MARKS = re.compile("[ً-ٰٟۖ-ۭـؐ-ؚ࣓-ࣿ]")
LETTER_MAP = str.maketrans({"ٱ": "ا", "آ": "ا", "أ": "ا", "إ": "ا",
                            "ة": "ه", "ی": "ي", "ى": "ي"})


def skeleton(text: str) -> str:
    t = unicodedata.normalize("NFC", text)
    t = t.replace("ٰ", "ا")
    t = MARKS.sub("", t)
    t = t.translate(LETTER_MAP)
    return t.replace("ء", "").strip()


def fetch(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "quraneasy-annotator"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


words_cache, audio_cache = {}, {}


def verse_words(key):
    if key not in words_cache:
        d = fetch(f"{API}/verses/by_key/{key}?words=true&word_fields=text_uthmani")
        words_cache[key] = [w for w in d["verse"]["words"]
                            if w["char_type_name"] == "word"]
        time.sleep(0.12)
    return words_cache[key]


def verse_audio(key, reciter=7):
    ck = (key, reciter)
    if ck not in audio_cache:
        d = fetch(f"{API}/verses/by_key/{key}?audio={reciter}")
        a = d["verse"]["audio"]
        segs = {int(s[1]): (int(s[2]), int(s[3])) for s in a["segments"]}
        audio_cache[ck] = (AUDIO_BASE + a["url"].lstrip("/"), segs)
        time.sleep(0.12)
    return audio_cache[ck]


def find_positions(key, skels, from_end=False):
    words = verse_words(key)
    ws = [skeleton(w["text_uthmani"]) for w in words]
    n = len(skels)
    rng = range(len(ws) - n, -1, -1) if from_end else range(len(ws) - n + 1)
    for i in rng:
        if ws[i:i + n] == skels:
            return i + 1, i + n
    raise SystemExit(f"FATAL: {skels} not found in {key}: {ws}")


def verify(key, w1, w2, expect_arabic):
    words = verse_words(key)
    got = " ".join(w["text_uthmani"] for w in words[w1 - 1:w2])
    exp = [skeleton(t) for t in expect_arabic.split()]
    act = [skeleton(w["text_uthmani"]) for w in words[w1 - 1:w2]]
    ok = "OK " if exp == act else "?? "
    return got, ok


# (module-id-suffix, arabic) -> decision
# fmt: off
D = {
 # module 1
 ("1-introduction", "نُورٌ"): ("wbw", "24:35:33"),
 ("1-introduction", "رَحْمَةٌ"): ("wbw", "18:98:3"),
 # module 3
 ("3-arabic-reading", "إِنَّ"): ("wbw", "4:58:16"),
 ("3-arabic-reading", "ثُمَّ"): ("wbw", "40:67:6"),
 ("3-arabic-reading", "رَبَّ"): ("wbw-find", "106:3", ["رب"]),
 ("3-arabic-reading", "أَمَّا"): ("wbw", "18:87:2"),
 # wbw (not segment) so its voice matches the other shaddah examples
 ("3-arabic-reading", "النَّاس"): ("wbw", "114:1:4"),
 ("3-arabic-reading", "كِتَابًا"): ("wbw", "43:21:3"),
 ("3-arabic-reading", "عَلِيمًا"): ("wbw", "33:1:12"),
 ("3-arabic-reading", "عَلِيمٍ"): ("wbw", "27:6:7"),
 ("3-arabic-reading", "غَفُورٍ"): ("wbw", "41:32:3"),
 ("3-arabic-reading", "عَلِيمٌ"): ("wbw", "24:18:6"),
 ("3-arabic-reading", "حَكِيمٌ"): ("wbw", "6:139:21"),
 # module 4
 ("4-makharij", "قَالَ"): ("wbw", "2:124:7"),
 ("4-makharij", "يَقُولُ"): ("wbw", "90:6:1"),
 ("4-makharij", "قِيلَ"): ("wbw", "58:11:5"),
 ("4-makharij", "نُوحِي"): ("wbw", "21:25:8"),
 ("4-makharij", "فِيهِ"): ("wbw", "9:108:3"),
 # wbw (not Alafasy segment) so its voice matches the other makharij words
 ("4-makharij", "أَحَد"): ("wbw", "112:1:4"),
 ("4-makharij", "هُدَى"): ("wbw", "2:120:12"),
 ("4-makharij", "غَفُور"): ("wbw", "3:155:20"),
 ("4-makharij", "خَيْر"): ("wbw", "23:72:8"),
 ("4-makharij", "قُلْ"): ("wbw", "6:19:1"),
 ("4-makharij", "نُور"): ("wbw", "24:35:2"),
 ("4-makharij", "رَب"): ("wbw-find", "106:3", ["رب"]),
 ("4-makharij", "بَاب"): ("wbw", "15:44:5"),
 ("4-makharij", "مُحَمَّد"): ("wbw", "33:40:3"),
 ("4-makharij", "وَعَدَ"): ("wbw", "5:9:1"),
 ("4-makharij", "إِنَّ"): ("wbw", "4:58:16"),
 ("4-makharij", "ثُمَّ"): ("wbw", "40:67:6"),
 ("4-makharij", "أَمَّا"): ("wbw", "18:87:2"),
 # module 5
 ("5-sifaat", "صَدَقَ"): ("wbw", "3:95:2"),
 ("5-sifaat", "قَالَ"): ("wbw", "2:124:7"),
 ("5-sifaat", "طَائِر"): ("wbw", "6:38:7"),
 ("5-sifaat", "غَفُور"): ("wbw", "3:155:20"),
 ("5-sifaat", "خَلَقَ"): ("wbw", "55:14:1"),
 ("5-sifaat", "بَاب"): ("wbw", "15:44:5"),
 ("5-sifaat", "نُور"): ("wbw", "24:35:2"),
 ("5-sifaat", "مَال"): ("wbw", "68:14:4"),
 # wbw, and 4:29 (رَحِيمًا, no initial shadda) rather than غفورٌ رّحيم
 # occurrences whose orthographic shadda comes from the preceding idgham
 ("5-sifaat", "رَحِيم"): ("wbw", "4:29:23"),
 # module 6 lam-in-Allah: connected recitation but NOT Alafasy -> AbdulBaset
 # Murattal (reciter 2) continuous segments. wbw was choppy (isolated words
 # can't merge at the junction); a continuous segment flows as real tilawah.
 ("6-allah-raa", "قَالَ اللَّهُ"): ("seg2", "12:66:19-20"),
 ("6-allah-raa", "نَصْرُ اللَّهِ"): ("seg2", "110:1:3-4"),
 ("6-allah-raa", "بِسْمِ اللَّهِ"): ("seg2", "1:1:1-2"),
 ("6-allah-raa", "فِي اللَّهِ"): ("seg2", "31:20:22-23"),
 ("6-allah-raa", "رَحْمَة"): ("wbw", "18:98:3"),
 ("6-allah-raa", "رُسُل"): ("wbw", "6:124:12"),
 ("6-allah-raa", "فِرْعَوْن"): ("wbw", "28:8:3"),
 ("6-allah-raa", "مِرْيَة"): ("wbw", "32:23:8"),
 # module 7 — noon saakin junction rules -> segments
 # izhar slide: connected recitation (AbdulBaset Murattal, seg2) — flows as
 # real tilawah rather than choppy isolated words; no merging at the junction
 ("7-noon-saakin", "مِنْ هَادٍ"): ("seg2", "39:36:14-15"),
 ("7-noon-saakin", "مِنْ عِلْمٍ"): ("seg2", "18:5:4-5"),
 ("7-noon-saakin", "مَنْ يَقُولُ"): ("seg", "2:8:3-4"),
 # segend: 13:11's segment data ends mid-word on the final phrase; the
 # ayah-final position makes play-to-end safe and complete
 ("7-noon-saakin", "مِنْ وَالٍ"): ("segend", "13:11:34"),
 ("7-noon-saakin", "مِنْ رَبِّهِمْ"): ("seg", "21:2:5-6"),
 ("7-noon-saakin", "هُدًى لِلْمُتَّقِينَ"): ("seg", "2:2:6-7"),
 ("7-noon-saakin", "مِنْ قَبْلِ"): ("seg", "30:43:5-6"),
 ("7-noon-saakin", "مِنْ تَحْتِ"): ("seg", "6:65:12-13"),
 # Alafasy single-word segments (not wbw) so the whole ikhfa slide is one
 # voice — its phrases must stay segments (ikhfa lives at the junction)
 ("7-noon-saakin", "أَنْصَار"): ("seg", "61:14:20-20"),
 ("7-noon-saakin", "أَنْذِرْهُمْ"): ("seg", "19:39:1-1"),
 ("7-noon-saakin", "عَذَابٌ شَدِيدٌ"): ("seg", "42:26:11-12"),
 ("7-noon-saakin", "مِنْ بَعْدِ"): ("seg", "30:54:8-9"),
 ("7-noon-saakin", "سَمِيعٌ بَصِيرٌ"): ("seg", "58:1:17-18"),
 ("7-noon-saakin", "أَنْبِئْهُمْ"): ("seg", "2:33:3-3"),  # one voice per slide
 ("7-noon-saakin", "مِنْ خَوْفٍ"): ("seg2", "106:4:6-7"),
 # was هُدًى عَظِيم (not in the Quran -> TTS); replaced with a real tanwin
 # izhar example so the whole izhar slide is consistent recitation
 ("7-noon-saakin", "سَمِيعٌ عَلِيمٌ"): ("seg2", "3:34:6-7"),
 # module 8 — meem saakin junction rules
 ("8-meem-saakin", "لَهُمْ مَغْفِرَة"): ("seg", "35:7:10-11"),
 ("8-meem-saakin", "عَلَيْهِمْ مِنْ"): ("seg", "19:58:5-6"),
 ("8-meem-saakin", "تَرْمِيهِمْ بِحِجَارَةٍ"): ("seg", "105:4:1-2"),
 # 28:52 (not 16:100) — clearer articulation of the ikhfa shafawi junction
 ("8-meem-saakin", "هُمْ بِهِ"): ("seg", "28:52:6-7"),
 ("8-meem-saakin", "أَنْعَمْتَ"): ("wbw", "1:7:3"),
 # module 9
 ("9-ghunna", "إِنَّ"): ("wbw", "4:58:16"),
 ("9-ghunna", "ثُمَّ"): ("wbw", "40:67:6"),
 ("9-ghunna", "النَّاسِ"): ("wbw", "40:57:7"),
 ("9-ghunna", "مَنْ يَقُولُ"): ("seg", "2:8:3-4"),
 ("9-ghunna", "مِنْ مَالٍ"): ("seg", "23:55:5-6"),
 # مِنْ خَوْفٍ was wrong here (ن+خ = izhar halqi, not ikhfa) — example
 # replaced in content with مِنْ شَرِّ (113:2, ن+ش = real ikhfa)
 ("9-ghunna", "مِنْ شَرِّ"): ("seg", "113:2:1-2"),
 ("9-ghunna", "أَنْصَارًا"): ("seg", "71:25:12-12"),  # one voice per slide
 ("9-ghunna", "مِنْ بَعْدُ"): ("seg", "33:52:5-6"),
 ("9-ghunna", "سَمِيعٌ بَصِيرٌ"): ("seg", "58:1:17-18"),
 # module 10 — madd
 ("10-madd", "قَالَ"): ("wbw", "2:124:7"),
 ("10-madd", "قِيلَ"): ("wbw", "58:11:5"),
 ("10-madd", "يَقُولُ"): ("wbw", "90:6:1"),
 ("10-madd", "فِيهِ"): ("wbw", "9:108:3"),
 ("10-madd", "آمَنُوا"): ("wbw", "4:137:3"),
 ("10-madd", "إِيمَان"): ("wbw-find", "74:31", ["ايمانا"]),
 ("10-madd", "أُوتُوا"): ("wbw", "5:5:7"),
 ("10-madd", "جَاءَ"): ("wbw", "28:84:2"),
 ("10-madd", "السَّمَاءِ"): ("wbw", "2:164:21"),
 ("10-madd", "سُوءٌ"): ("wbw", "3:174:8"),
 # madd munfasil exists only ACROSS the word gap -> segments
 ("10-madd", "فِي أَنْفُسِكُمْ"): ("seg", "57:22:8-9"),
 ("10-madd", "إِنَّا أَعْطَيْنَاكَ"): ("seg", "108:1:1-2"),
 ("10-madd", "الضَّالِّينَ"): ("wbw", "26:20:6"),
 ("10-madd", "الْحَاقَّةُ"): ("wbw", "69:1:1"),
 ("10-madd", "الصَّاخَّةُ"): ("wbw", "80:33:3"),
 # pausal forms need the qari's actual stop -> segment to end of file
 ("10-madd", "الْعَالَمِينْ"): ("segend", "1:2:4"),
 ("10-madd", "الرَّحِيمْ"): ("segend", "1:1:4"),
 # madd leen exists only at the stop; all three examples are Surah Quraysh
 # ayah-final stops. بَيْتْ/شَيْءْ were replaced in content with
 # الْبَيْتْ (106:3) and قُرَيْشْ (106:1) so real pausal audio exists.
 ("10-madd", "خَوْفْ"): ("segend-find", "106:4", ["خوف"]),
 ("10-madd", "الْبَيْتْ"): ("segend", "106:3:4"),
 ("10-madd", "قُرَيْشْ"): ("segend", "106:1:2"),
 # module 11 — qalqalah
 ("11-qalqalah", "يَجْعَلْ"): ("wbw", "105:2:2"),
 ("11-qalqalah", "اقْتَرَبَ"): ("wbw", "21:1:1"),
 # qalqalah kubra only happens at the stop -> segment to end
 ("11-qalqalah", "أَحَدْ"): ("segend", "112:1:4"),
 ("11-qalqalah", "الْفَلَقْ"): ("segend-find", "113:1", ["الفلق"]),
 ("11-qalqalah", "الصَّمَدْ"): ("segend", "112:2:2"),
}
# fmt: on

LOC_RE = re.compile(r"^(\d+):(\d+):(\d+)(?:-(\d+))?$")


def resolve(decision, arabic):
    mode = decision[0]
    if mode.endswith("-find"):
        _, verse, skels = decision
        from_end = mode.startswith("segend")
        w1, w2 = find_positions(verse, skels, from_end=from_end)
        mode = mode.replace("-find", "")
    else:
        m = LOC_RE.match(decision[1])
        verse = f"{m.group(1)}:{m.group(2)}"
        w1 = int(m.group(3))
        w2 = int(m.group(4)) if m.group(4) else w1

    got, ok = verify(verse, w1, w2, arabic)
    if mode == "wbw":
        loc = f"{verse}:{w1}" + (f"-{w2}" if w2 > w1 else "")
        value = loc
    else:
        # All segment recitation uses AbdulBaset Murattal (reciter 2). Alafasy
        # is no longer used anywhere. (seg/seg2/segend are kept as distinct
        # modes only to record whether a clip ends mid-ayah or plays to EOF.)
        reciter = 2
        url, segs = verse_audio(verse, reciter)
        # Segment lists sometimes merge adjacent words (a position is missing);
        # fall back to the neighbouring segment boundaries.
        if w1 in segs:
            start = segs[w1][0]
        else:
            prev_ends = [v[1] for k, v in segs.items() if k < w1]
            if not prev_ends:
                raise SystemExit(f"FATAL: cannot place word {w1} in {verse}")
            start = max(prev_ends)
        value = {"url": url, "start": start}
        if mode in ("seg", "seg2"):
            if w2 in segs:
                value["end"] = segs[w2][1]
            else:
                next_starts = [v[0] for k, v in segs.items() if k > w2]
                if next_starts:
                    value["end"] = min(next_starts)
                # else: ayah-final merged segment — play to end of file
    print(f"{ok}{arabic:<22} {mode:<7} {verse}:{w1}-{w2}  <- {got}")
    return value


changed = 0
for path in sorted(glob.glob("src/content/modules/*.json")):
    mod = json.load(open(path))
    suffix = mod["id"].replace("module-", "")

    def walk(o):
        global changed
        for w in o.get("wordExamples") or []:
            key = (suffix, w["arabic"])
            if key in D:  # overwrite: regenerate audio from the decision table
                w["audio"] = resolve(D[key], w["arabic"])
                changed += 1
        for st in o.get("subtopics") or []:
            walk(st)

    for sm in mod["submodules"]:
        walk(sm)

    # Waqf signs are symbols, not pronounceable text — disable audio.
    if suffix == "12-waqf":
        def disable(o):
            global changed
            for le in o.get("letterExamples") or []:
                if le.get("audio") is not False:
                    le["audio"] = False
                    changed += 1
            for st in o.get("subtopics") or []:
                disable(st)
        for sm in mod["submodules"]:
            disable(sm)

    with open(path, "w") as f:
        json.dump(mod, f, ensure_ascii=False, indent=2)
        f.write("\n")

print(f"\n{changed} annotations written", file=sys.stderr)
