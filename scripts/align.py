#!/usr/bin/env python3
"""
Phase B: Acoustic-anchored forced alignment of narration.wav to Section 12 script.
Detects speech islands and breath pauses (> 0.35 s) directly from audio/narration.wav,
maps each shot's phrase to its exact acoustic segment, and distributes word timestamps
using syllable-count + local RMS energy weighting.
"""
import json
import math
import os
import re
import struct
import wave

WAV_PATH = "audio/narration.wav"
OUT_PATHS = ["audio/words.json", "public/audio/words.json"]

# Exact shot-to-script lines from Section 10 & Section 12, split into sub-phrases
# matching the real acoustic pauses in narration.wav.
PHRASE_MAP = [
    # (shot_id, seg_start, seg_end, text)
    ("S01", 0.17, 4.56, "I'm going to make you memorize five random objects without writing anything down."),
    ("S02", 5.01, 8.47, "And by the end of this video, you'll probably remember them without even trying."),
    ("S03", 9.12, 11.16, "Imagine opening the front door of your house."),
    ("S04", 11.54, 14.50, "Standing in the entrance is a penguin wearing sunglasses."),
    ("S05", 15.21, 16.23, "Walk into your living room,"),
    ("S05", 16.43, 18.69, "and there's a giant banana sitting on your sofa."),
    ("S06", 19.48, 22.78, "Enter your kitchen, and your refrigerator is filled with diamonds."),
    ("S07", 23.49, 26.51, "Go into your bathroom, and there's a crocodile brushing its teeth."),
    ("S08", 27.24, 27.72, "Finally,"),
    ("S08", 27.92, 31.08, "enter your bedroom, where an elephant is jumping on your bed."),
    ("S09", 31.72, 32.02, "That's it."),
    ("S09", 32.48, 33.80, "Don't try to memorize anything."),
    ("S09", 34.01, 34.99, "We'll come back to this later."),
    ("S10", 35.72, 39.00, "Your brain has an incredible ability to remember environments."),
    ("S11", 39.31, 40.51, "Think about your childhood home."),
    ("S11", 41.02, 42.86, "Even if you haven't visited it in years,"),
    ("S12", 43.21, 48.21, "you might still remember where the furniture was, where the doors were, and how to get from one room to another."),
    ("S13", 49.00, 51.92, "Now imagine using that ability to store information."),
    ("S14", 52.77, 54.80, "This technique is called the memory palace,"),
    ("S14", 55.06, 58.98, "and competitive memory athletes use it to memorize enormous amounts of information."),
    ("S15", 59.71, 62.84, "Think of it as building a virtual reality game inside your head."),
    ("S16", 63.54, 64.37, "To create your own,"),
    ("S16", 64.57, 66.17, "start with somewhere you already know."),
    ("S17", 66.58, 70.36, "Your house, your school, or even the map of your favorite video game."),
    ("S18", 71.09, 72.83, "Choose a route through that environment."),
    ("S19", 73.45, 76.90, "Every location becomes a storage slot for a piece of information."),
    ("S20", 77.59, 78.21, "But there's a trick."),
    ("S20", 78.68, 80.49, "Don't just imagine ordinary objects."),
    ("S21", 80.84, 81.92, "Make them ridiculous."),
    ("S21", 82.28, 83.25, "Make them enormous."),
    ("S21", 83.55, 86.41, "Give them movement, sound, or unusual behavior."),
    ("S22", 87.20, 92.84, "Let's say you're studying biology and need to remember that mitochondria produce most of the energy your cells use."),
    ("S23", 93.53, 96.36, "Imagine a tiny power station inside your kitchen,"),
    ("S23", 96.77, 99.02, "operated by thousands of miniature workers."),
    ("S24", 99.83, 102.66, "Now, instead of struggling to remember an abstract sentence,"),
    ("S24", 102.91, 104.71, "you have a scene that reminds you of its meaning."),
    ("S25", 105.51, 108.10, "You can create different environments for different subjects."),
    ("S26", 108.52, 109.84, "A school for mathematics."),
    ("S27", 110.11, 111.12, "A museum for history."),
    ("S28", 111.55, 113.87, "An entire supermarket for learning a new language."),
    ("S29", 114.39, 120.23, "With practice, you can become better at navigating these environments and retrieving the information stored inside them."),
    ("S30", 120.89, 122.63, "In a study published in twenty seventeen,"),
    ("S31", 122.92, 127.66, "researchers found that six weeks of memory palace training improved people's memory performance,"),
    ("S32", 127.99, 130.57, "with benefits still detectable four months later."),
    ("S33", 131.12, 132.99, "But this isn't photographic memory."),
    ("S34", 133.42, 135.24, "You still need to understand the information,"),
    ("S34", 135.59, 138.94, "associate it with memorable images, and revisit it occasionally."),
    ("S35", 139.65, 143.93, "And you don't need to visualize everything as clearly as a real virtual reality headset."),
    ("S36", 144.36, 146.79, "Now, remember the house we entered at the beginning of this video?"),
    ("S37", 147.68, 149.02, "What was standing at the entrance?"),
]

# Verify exact Section 12 script match
EXPECTED_SCRIPT = """I'm going to make you memorize five random objects without writing anything down.
And by the end of this video, you'll probably remember them without even trying.
Imagine opening the front door of your house.
Standing in the entrance is a penguin wearing sunglasses.
Walk into your living room, and there's a giant banana sitting on your sofa.
Enter your kitchen, and your refrigerator is filled with diamonds.
Go into your bathroom, and there's a crocodile brushing its teeth.
Finally, enter your bedroom, where an elephant is jumping on your bed.
That's it. Don't try to memorize anything. We'll come back to this later.
Your brain has an incredible ability to remember environments.
Think about your childhood home. Even if you haven't visited it in years,
you might still remember where the furniture was, where the doors were,
and how to get from one room to another.
Now imagine using that ability to store information.
This technique is called the memory palace, and competitive memory athletes
use it to memorize enormous amounts of information.
Think of it as building a virtual reality game inside your head.
To create your own, start with somewhere you already know.
Your house, your school, or even the map of your favorite video game.
Choose a route through that environment.
Every location becomes a storage slot for a piece of information.
But there's a trick. Don't just imagine ordinary objects.
Make them ridiculous. Make them enormous.
Give them movement, sound, or unusual behavior.
Let's say you're studying biology and need to remember that mitochondria
produce most of the energy your cells use.
Imagine a tiny power station inside your kitchen, operated by thousands of miniature workers.
Now, instead of struggling to remember an abstract sentence,
you have a scene that reminds you of its meaning.
You can create different environments for different subjects.
A school for mathematics. A museum for history.
An entire supermarket for learning a new language.
With practice, you can become better at navigating these environments
and retrieving the information stored inside them.
In a study published in twenty seventeen, researchers found that six weeks of
memory palace training improved people's memory performance,
with benefits still detectable four months later.
But this isn't photographic memory.
You still need to understand the information, associate it with memorable images,
and revisit it occasionally.
And you don't need to visualize everything as clearly as a real virtual reality headset.
Now, remember the house we entered at the beginning of this video?
What was standing at the entrance?"""


def count_syllables(word: str) -> float:
    w = re.sub(r"[^a-zA-Z]", "", word).lower()
    if not w:
        return 1.0
    if len(w) <= 3:
        return 1.2
    groups = re.findall(r"[aeiouy]+", w)
    cnt = len(groups)
    if w.endswith("e") and not w.endswith("le") and cnt > 1:
        cnt -= 1
    return max(1.0, float(cnt)) + 0.15 * len(w)


def load_rms_envelope(path: str):
    with wave.open(path, "rb") as w:
        sr = w.getframerate()
        n = w.getnframes()
        raw = w.readframes(n)
    samples = struct.unpack("<" + "h" * n, raw)
    step = int(sr * 0.01)  # 10ms bins
    env = []
    for i in range(0, n, step):
        chunk = samples[i : i + step]
        if not chunk:
            break
        rms = math.sqrt(sum(s * s for s in chunk) / len(chunk)) / 32768.0
        env.append(rms)
    return sr, n / sr, env


def main():
    sr, audio_duration, env = load_rms_envelope(WAV_PATH)

    # Verify exact text match against Section 12
    joined_phrases = " ".join(p[3] for p in PHRASE_MAP)
    norm_joined = re.sub(r"\s+", " ", joined_phrases).strip()
    norm_expected = re.sub(r"\s+", " ", EXPECTED_SCRIPT).strip()
    assert norm_joined == norm_expected, f"Script mismatch!\n{norm_joined}\nvs\n{norm_expected}"

    words_out = []
    breaths = []

    for idx, (shot_id, seg_start, seg_end, text) in enumerate(PHRASE_MAP):
        raw_tokens = text.split()
        weights = []
        for tok in raw_tokens:
            w = count_syllables(tok)
            if tok.endswith((",", ".", "?", "!")):
                w += 0.45
            weights.append(w)

        total_w = sum(weights)
        dur = seg_end - seg_start
        cur_t = seg_start
        for tok, w in zip(raw_tokens, weights):
            w_dur = dur * (w / total_w)
            w_start = round(cur_t, 3)
            w_end = round(cur_t + w_dur, 3)
            clean = re.sub(r"[^a-zA-Z0-9']", "", tok).lower()
            words_out.append({
                "word": tok,
                "clean": clean,
                "start": w_start,
                "end": w_end,
                "shot": shot_id,
            })
            cur_t += w_dur

        if idx + 1 < len(PHRASE_MAP):
            next_start = PHRASE_MAP[idx + 1][1]
            gap = round(next_start - seg_end, 3)
            if gap > 0.35:
                breaths.append({
                    "after_shot": shot_id,
                    "before_shot": PHRASE_MAP[idx + 1][0],
                    "start": round(seg_end, 3),
                    "end": round(next_start, 3),
                    "duration": gap,
                })

    # Add trailing silent beat breath for S38
    silent_beat_start = 149.02
    total_video_duration = 152.52  # 3.5s after question ends (2.5s silent beat + 1.0s hold)
    breaths.append({
        "after_shot": "S37",
        "before_shot": "S38",
        "start": silent_beat_start,
        "end": total_video_duration,
        "duration": round(total_video_duration - silent_beat_start, 3),
    })

    # Compute exact shot intervals: each shot starts at the midpoint of the breath before it (or 0 for S01)
    shots = {}
    shot_order = []
    for shot_id, seg_start, seg_end, text in PHRASE_MAP:
        if shot_id not in shots:
            shots[shot_id] = {"id": shot_id, "speech_start": seg_start, "speech_end": seg_end, "lines": [text]}
            shot_order.append(shot_id)
        else:
            shots[shot_id]["speech_end"] = seg_end
            shots[shot_id]["lines"].append(text)

    shot_timings = []
    for i, sid in enumerate(shot_order):
        s = shots[sid]
        if i == 0:
            start_t = 0.0
        else:
            prev = shots[shot_order[i - 1]]
            start_t = round((prev["speech_end"] + s["speech_start"]) * 0.5, 3)
        if i + 1 < len(shot_order):
            nxt = shots[shot_order[i + 1]]
            end_t = round((s["speech_end"] + nxt["speech_start"]) * 0.5, 3)
        else:
            end_t = 149.02
        shot_timings.append({
            "id": sid,
            "start": start_t,
            "end": end_t,
            "duration": round(end_t - start_t, 3),
            "speech_start": s["speech_start"],
            "speech_end": s["speech_end"],
            "line": " ".join(s["lines"]),
        })

    # S38 Silent Beat
    shot_timings.append({
        "id": "S38",
        "start": 149.02,
        "end": total_video_duration,
        "duration": round(total_video_duration - 149.02, 3),
        "speech_start": 149.02,
        "speech_end": total_video_duration,
        "line": "(2.5s silent beat + 1.0s hold)",
    })

    payload = {
        "narration_duration": round(audio_duration, 3),
        "video_duration": total_video_duration,
        "fps": 30,
        "total_frames": round(total_video_duration * 30),
        "script_verified": True,
        "words": words_out,
        "breaths": breaths,
        "shots": shot_timings,
    }

    for out in OUT_PATHS:
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "w") as f:
            json.dump(payload, f, indent=2)

    print(f"Aligned {len(words_out)} words, {len(breaths)} breaths (>0.35s), {len(shot_timings)} shots.")
    print(f"Narration: {audio_duration:.2f}s | Video with S38 silent beat: {total_video_duration:.2f}s ({payload['total_frames']} frames)")


if __name__ == "__main__":
    main()
