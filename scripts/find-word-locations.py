#!/usr/bin/env python3
"""Find Quran locations (surah:ayah:word) for module word examples.

Queries the Quran.com search API for each wordExample, then fetches the
candidate verses word-by-word and matches by diacritic-stripped skeleton.
Outputs a JSON report for human review — it does NOT modify module files.
"""
import json
import glob
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request

API = "https://api.quran.com/api/v4"

# Strip harakat/quranic annotation marks; normalize letter variants so the
# plain-keyboard module text matches Uthmani script.
MARKS = re.compile(
    "[ً-ٰٟۖ-ۭـؐ-ؚ࣓-ࣿ]"
)
LETTER_MAP = str.maketrans({
    "ٱ": "ا",  # alif wasla -> alif
    "آ": "ا",  # alif madda -> alif
    "أ": "ا",  # alif hamza above -> alif
    "إ": "ا",  # alif hamza below -> alif
    "ة": "ه",  # ta marbuta -> ha (pausal)
    "ی": "ي",
    "ى": "ي",  # alif maqsura -> ya
})


def skeleton(text: str) -> str:
    t = unicodedata.normalize("NFC", text)
    # Uthmani dagger alif == plain-keyboard full alif (كِتَٰبًا vs كِتَابًا)
    t = t.replace("ٰ", "ا")
    t = MARKS.sub("", t)
    t = t.translate(LETTER_MAP)
    t = t.replace("ء", "")  # standalone hamza
    return t


def fetch(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "quraneasy-annotator"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


verse_cache = {}


def verse_words(key: str):
    if key not in verse_cache:
        d = fetch(f"{API}/verses/by_key/{key}?words=true&word_fields=text_uthmani")
        verse_cache[key] = [
            w for w in d["verse"]["words"] if w["char_type_name"] == "word"
        ]
        time.sleep(0.15)
    return verse_cache[key]


def search_candidates(text: str, tokens: list[str]):
    keys = []
    # Retry with a mark-stripped query when the diacritic-heavy one misses.
    for query in (text, MARKS.sub("", text)):
        q = urllib.parse.quote(query)
        try:
            d = fetch(f"{API}/search?q={q}&size=12")
            keys = [r["verse_key"] for r in d.get("search", {}).get("results", [])]
        except Exception:
            keys = []
        time.sleep(0.15)
        if keys:
            break
    out = []
    for key in keys:
        try:
            words = verse_words(key)
        except Exception:
            continue
        skels = [skeleton(w["text_uthmani"]) for w in words]
        n = len(tokens)
        for i in range(len(skels) - n + 1):
            if skels[i : i + n] == tokens:
                out.append({
                    "location": f"{key}:{i + 1}" + (f"-{i + n}" if n > 1 else ""),
                    "verse_key": key,
                    "uthmani": " ".join(w["text_uthmani"] for w in words[i : i + n]),
                })
        if len(out) >= 4:
            break
    return out[:4]


report = []
for path in sorted(glob.glob("src/content/modules/*.json")):
    mod = json.load(open(path))
    entries = []

    def walk(o, where):
        for idx, w in enumerate(o.get("wordExamples") or []):
            entries.append((where, idx, w))
        for st in o.get("subtopics") or []:
            walk(st, where + "/" + st["id"])

    for sm in mod["submodules"]:
        walk(sm, sm["id"])

    for where, idx, w in entries:
        if "audio" in w:
            continue
        text = w["arabic"]
        tokens = [skeleton(t) for t in text.split()]
        cands = search_candidates(text, tokens)
        report.append({
            "module": mod["id"],
            "path": where,
            "index": idx,
            "arabic": text,
            "candidates": cands,
        })
        print(f"{mod['id']} {text} -> {len(cands)} candidate(s)", file=sys.stderr)

json.dump(report, open("scripts/word-locations-report.json", "w"),
          ensure_ascii=False, indent=2)
print(f"\n{len(report)} entries written to scripts/word-locations-report.json",
      file=sys.stderr)
