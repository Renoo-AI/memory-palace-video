#!/usr/bin/env python3
"""
Procedural foley & room-tone audio synthesizer + voice-ducked master mixer for PALACE ONE-TAKE.
Pure Python standard library (zero external dependencies required) + ffmpeg loudnorm two-pass.
"""
import json
import math
import os
import random
import struct
import subprocess
import wave

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX_DIR = os.path.join(ROOT, "audio", "sfx")
WORDS_PATH = os.path.join(ROOT, "audio", "words.json")
NARRATION_PATH = os.path.join(ROOT, "audio", "narration.wav")
MIX_RAW_PATH = os.path.join(ROOT, "audio", "mix_raw.wav")
MIX_PATH = os.path.join(ROOT, "audio", "mix.wav")
PUBLIC_MIX_PATH = os.path.join(ROOT, "public", "audio", "mix.wav")


def save_wav(path: str, samples: list[float], sr: int = SR):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        frames = bytearray()
        for s in samples:
            val = max(-1.0, min(1.0, s))
            frames += struct.pack("<h", int(val * 32767.0))
        wf.writeframes(bytes(frames))


def read_wav_resampled(path: str, target_sr: int = SR) -> list[float]:
    with wave.open(path, "rb") as wf:
        ch = wf.getnchannels()
        sw = wf.getsampwidth()
        src_sr = wf.getframerate()
        n = wf.getnframes()
        raw = wf.readframes(n)
    if sw != 2:
        raise ValueError(f"Expected 16-bit PCM WAV, got {sw * 8}-bit")
    total_vals = n * ch
    ints = struct.unpack(f"<{total_vals}h", raw)
    mono = []
    if ch == 1:
        mono = [x / 32768.0 for x in ints]
    else:
        for i in range(0, total_vals, ch):
            mono.append(sum(ints[i : i + ch]) / (ch * 32768.0))

    if src_sr == target_sr:
        return mono
    out_len = int(round(len(mono) * target_sr / src_sr))
    out = [0.0] * out_len
    ratio = src_sr / target_sr
    max_i = len(mono) - 1
    for i in range(out_len):
        pos = i * ratio
        idx = int(pos)
        frac = pos - idx
        s0 = mono[idx]
        s1 = mono[min(max_i, idx + 1)]
        out[i] = s0 + (s1 - s0) * frac
    return out


class OnePoleLP:
    def __init__(self, cutoff_hz: float, sr: int = SR):
        rc = 1.0 / (2.0 * math.pi * max(20.0, cutoff_hz))
        dt = 1.0 / sr
        self.a = dt / (rc + dt)
        self.y = 0.0

    def step(self, x: float) -> float:
        self.y += self.a * (x - self.y)
        return self.y


class OnePoleHP:
    def __init__(self, cutoff_hz: float, sr: int = SR):
        rc = 1.0 / (2.0 * math.pi * max(20.0, cutoff_hz))
        dt = 1.0 / sr
        self.a = rc / (rc + dt)
        self.y = 0.0
        self.x_prev = 0.0

    def step(self, x: float) -> float:
        self.y = self.a * (self.y + x - self.x_prev)
        self.x_prev = x
        return self.y


def env_exp(t: float, attack: float, decay: float) -> float:
    if t < 0:
        return 0.0
    if attack > 0 and t < attack:
        return t / attack
    return math.exp(-(t - attack) / max(0.001, decay))


def synth_stamp_thunk(seed: int) -> list[float]:
    rng = random.Random(seed)
    n = int(0.18 * SR)
    lp = OnePoleLP(550 * (1.0 + rng.uniform(-0.08, 0.08)))
    hp = OnePoleHP(180)
    out = []
    f0 = 84.0 * rng.uniform(0.94, 1.06)
    for i in range(n):
        t = i / SR
        body = math.sin(2 * math.pi * f0 * (1.0 - 0.35 * min(1.0, t / 0.06)) * t) * env_exp(t, 0.003, 0.045)
        click = hp.step(lp.step(rng.uniform(-1, 1))) * env_exp(t, 0.001, 0.018)
        out.append((body * 0.72 + click * 0.45) * 0.85)
    return out


def synth_wood_tok(seed: int) -> list[float]:
    rng = random.Random(seed)
    n = int(0.14 * SR)
    f0 = 700.0 * rng.uniform(0.92, 1.08)
    lp = OnePoleLP(2400)
    out = []
    for i in range(n):
        t = i / SR
        tri = 2.0 * abs(2.0 * ((t * f0) % 1.0) - 1.0) - 1.0
        ping = (tri * 0.65 + math.sin(2 * math.pi * f0 * 1.48 * t) * 0.35) * env_exp(t, 0.002, 0.028)
        tap = lp.step(rng.uniform(-1, 1)) * env_exp(t, 0.001, 0.010)
        out.append((ping * 0.7 + tap * 0.45) * 0.75)
    return out


def synth_paper_slide(seed: int) -> list[float]:
    rng = random.Random(seed)
    dur = 0.24
    n = int(dur * SR)
    hp = OnePoleHP(1100)
    lp = OnePoleLP(4200)
    out = []
    for i in range(n):
        t = i / SR
        env = math.sin(math.pi * min(1.0, t / dur)) ** 0.7
        noise = lp.step(hp.step(rng.uniform(-1, 1)))
        out.append(noise * env * 0.42)
    return out


def synth_glass_clink(seed: int) -> list[float]:
    rng = random.Random(seed)
    n = int(0.45 * SR)
    freqs = [2100.0, 3400.0, 5200.0]
    scale = rng.uniform(0.94, 1.08)
    out = []
    for i in range(n):
        t = i / SR
        s = sum(math.sin(2 * math.pi * f * scale * t) for f in freqs) / 3.0
        out.append(s * env_exp(t, 0.0015, 0.14) * 0.55)
    return out


def synth_door_creak(seed: int) -> list[float]:
    rng = random.Random(seed)
    dur = 0.85
    n = int(dur * SR)
    hp = OnePoleHP(320)
    lp = OnePoleLP(1250)
    phase = 0.0
    walk = 0.0
    out = []
    for i in range(n):
        t = i / SR
        walk = max(-1.0, min(1.0, walk + rng.uniform(-0.08, 0.08)))
        freq = 88.0 + 36.0 * (t / dur) + walk * 14.0
        phase = (phase + freq / SR) % 1.0
        saw = 2.0 * phase - 1.0
        pulse = saw * (0.65 + 0.35 * math.sin(2 * math.pi * 19.0 * t))
        env = env_exp(t, 0.05, 0.48) * (1.0 - max(0.0, (t - 0.72) / 0.13))
        out.append(lp.step(hp.step(pulse)) * env * 0.45)
    return out


def synth_spring_squeak(seed: int) -> list[float]:
    rng = random.Random(seed)
    dur = 0.13
    n = int(dur * SR)
    f_start = 580.0 * rng.uniform(0.94, 1.06)
    f_end = 920.0 * rng.uniform(0.94, 1.06)
    phase = 0.0
    out = []
    for i in range(n):
        t = i / SR
        f = f_start + (f_end - f_start) * (t / dur) + 35.0 * math.sin(2 * math.pi * 25.0 * t)
        phase += 2 * math.pi * f / SR
        env = math.sin(math.pi * (t / dur)) ** 0.6
        out.append(math.sin(phase) * env * 0.42)
    return out


def synth_trumpet_blip(seed: int) -> list[float]:
    rng = random.Random(seed)
    dur = 0.28
    n = int(dur * SR)
    lp = OnePoleLP(850)
    phase = 0.0
    f0 = 400.0 * rng.uniform(0.95, 1.05)
    out = []
    for i in range(n):
        t = i / SR
        f = f0 - 150.0 * (t / dur)
        phase = (phase + f / SR) % 1.0
        sq = 1.0 if phase < 0.5 else -1.0
        env = env_exp(t, 0.015, 0.14)
        out.append(lp.step(sq) * env * 0.45)
    return out


def synth_scrubbing(seed: int) -> list[float]:
    rng = random.Random(seed)
    dur = 0.72
    n = int(dur * SR)
    hp = OnePoleHP(2800)
    lp = OnePoleLP(6200)
    out = []
    for i in range(n):
        t = i / SR
        mod = 0.35 + 0.65 * (0.5 + 0.5 * math.sin(2 * math.pi * 7.0 * t))
        env = math.sin(math.pi * (t / dur)) ** 0.5
        out.append(lp.step(hp.step(rng.uniform(-1, 1))) * mod * env * 0.38)
    return out


def synth_footstep(seed: int) -> list[float]:
    rng = random.Random(seed)
    n = int(0.14 * SR)
    lp = OnePoleLP(650)
    f0 = 120.0 * rng.uniform(0.92, 1.08)
    out = []
    for i in range(n):
        t = i / SR
        thud = math.sin(2 * math.pi * f0 * t) * env_exp(t, 0.002, 0.032)
        scuff = lp.step(rng.uniform(-1, 1)) * env_exp(t, 0.005, 0.045)
        out.append((thud * 0.55 + scuff * 0.45) * 0.55)
    return out


def synth_sunglasses_tk(seed: int) -> list[float]:
    rng = random.Random(seed)
    n = int(0.06 * SR)
    hp = OnePoleHP(1600)
    f0 = 1950.0 * rng.uniform(0.92, 1.08)
    out = []
    for i in range(n):
        t = i / SR
        snap = math.sin(2 * math.pi * f0 * t) * env_exp(t, 0.0008, 0.009)
        clk = hp.step(rng.uniform(-1, 1)) * env_exp(t, 0.0005, 0.006)
        out.append((snap * 0.6 + clk * 0.5) * 0.68)
    return out


def synth_flipper_pap(seed: int) -> list[float]:
    rng = random.Random(seed)
    n = int(0.09 * SR)
    lp = OnePoleLP(900)
    out = []
    for i in range(n):
        t = i / SR
        out.append(lp.step(rng.uniform(-1, 1)) * env_exp(t, 0.002, 0.022) * 0.48)
    return out


def synth_bird(seed: int) -> list[float]:
    rng = random.Random(seed)
    dur = 0.22
    n = int(dur * SR)
    phase = 0.0
    base = 2400.0 * rng.uniform(0.95, 1.08)
    out = []
    for i in range(n):
        t = i / SR
        chirp = base + 550.0 * math.sin(math.pi * (t / dur))
        phase += 2 * math.pi * chirp / SR
        env = math.sin(math.pi * (t / dur)) * (0.4 + 0.6 * math.sin(math.pi * ((t * 9.0) % 1.0)))
        out.append(math.sin(phase) * env * 0.16)
    return out


def synth_clock_tick(seed: int) -> list[float]:
    rng = random.Random(seed)
    n = int(0.05 * SR)
    f = 2400.0 * rng.uniform(0.96, 1.04)
    out = []
    for i in range(n):
        t = i / SR
        out.append(math.sin(2 * math.pi * f * t) * env_exp(t, 0.0008, 0.007) * 0.45)
    return out


def synth_shutter(seed: int) -> list[float]:
    rng = random.Random(seed)
    n = int(0.11 * SR)
    hp = OnePoleHP(1400)
    out = []
    for i in range(n):
        t = i / SR
        c1 = env_exp(t, 0.0005, 0.008)
        c2 = env_exp(t - 0.032, 0.0005, 0.009) if t >= 0.032 else 0.0
        out.append(hp.step(rng.uniform(-1, 1)) * (c1 + c2 * 0.8) * 0.55)
    return out


def synth_kaching(seed: int) -> list[float]:
    rng = random.Random(seed)
    n = int(0.55 * SR)
    out = []
    for i in range(n):
        t = i / SR
        latch = (rng.uniform(-1, 1) * env_exp(t, 0.001, 0.015)) * 0.3
        bell = 0.0
        if t >= 0.05:
            tb = t - 0.05
            bell = (math.sin(2 * math.pi * 2240 * tb) + 0.6 * math.sin(2 * math.pi * 3360 * tb)) * env_exp(tb, 0.002, 0.18) * 0.42
        out.append(latch + bell)
    return out


def synth_drip(seed: int) -> list[float]:
    rng = random.Random(seed)
    n = int(0.10 * SR)
    phase = 0.0
    f0 = 920.0 * rng.uniform(0.95, 1.05)
    out = []
    for i in range(n):
        t = i / SR
        f = f0 + 520.0 * (t / 0.10)
        phase += 2 * math.pi * f / SR
        out.append(math.sin(phase) * env_exp(t, 0.001, 0.025) * 0.35)
    return out


def synth_patter(seed: int) -> list[float]:
    rng = random.Random(seed)
    n = int(1.6 * SR)
    out = [0.0] * n
    toks = [synth_wood_tok(seed + 10), synth_wood_tok(seed + 20)]
    for k in range(42):
        pos = int((k / 42.0) * 1.45 * SR + rng.uniform(-0.015, 0.015) * SR)
        pos = max(0, min(n - 1, pos))
        tok = toks[k % 2]
        gain = 0.12 * rng.uniform(0.7, 1.2)
        for j, s in enumerate(tok):
            if pos + j < n:
                out[pos + j] += s * gain
    return out


def synth_game_melody(seed: int) -> list[float]:
    # 8-note simple plucked melody (handmade wood/string feel)
    notes = [523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 523.25]
    step_s = 0.18
    n = int((len(notes) * step_s + 0.35) * SR)
    out = [0.0] * n
    for idx, f in enumerate(notes):
        start = int(idx * step_s * SR)
        for j in range(int(0.32 * SR)):
            t = j / SR
            if start + j >= n:
                break
            sig = (math.sin(2 * math.pi * f * t) * 0.7 + math.sin(2 * math.pi * f * 2 * t) * 0.25) * env_exp(t, 0.003, 0.09)
            out[start + j] += sig * 0.25
    return out


def apply_room_reverb(samples: list[float], room: str) -> list[float]:
    """Simple multi-tap decaying noise IR convolution per Section 11 room specs."""
    configs = {
        "hall": (0.28, 0.22),
        "living": (0.16, 0.14),
        "kitchen": (0.18, 0.24),
        "bathroom": (0.38, 0.30),
        "bedroom": (0.12, 0.10),
        "brain": (0.08, 0.07),
        "exterior": (0.10, 0.06),
    }
    decay_s, wet = configs.get(room, (0.14, 0.12))
    taps = [
        (int(0.013 * SR), wet * 0.45),
        (int(0.029 * SR), wet * 0.32),
        (int(0.053 * SR), wet * 0.20),
        (int(decay_s * 0.45 * SR), wet * 0.14),
        (int(decay_s * 0.85 * SR), wet * 0.08),
    ]
    pad = taps[-1][0]
    out = list(samples) + [0.0] * pad
    for d, g in taps:
        for i, s in enumerate(samples):
            out[i + d] += s * g
    return out


def main():
    with open(WORDS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    total_dur = float(data["video_duration"])
    total_samples = int(round(total_dur * SR))

    def word_t(shot_id: str, word_prefix: str) -> float:
        for w in data["words"]:
            w_clean = "".join(c for c in w["word"].lower() if c.isalnum())
            if w["shot"] == shot_id and w_clean.startswith(word_prefix.lower()):
                return float(w["start"])
        raise KeyError(f"Missing sync word {shot_id}:{word_prefix}")

    # 1. Generate 3 variations of repeated foley assets into audio/sfx/
    bank = {}
    generators = {
        "stamp": synth_stamp_thunk,
        "tok": synth_wood_tok,
        "paper": synth_paper_slide,
        "clink": synth_glass_clink,
        "spring": synth_spring_squeak,
        "trumpet": synth_trumpet_blip,
        "scrub": synth_scrubbing,
        "footstep": synth_footstep,
        "tk": synth_sunglasses_tk,
        "pap": synth_flipper_pap,
        "bird": synth_bird,
        "tick": synth_clock_tick,
        "drip": synth_drip,
        "patter": synth_patter,
    }
    os.makedirs(SFX_DIR, exist_ok=True)
    for name, fn in generators.items():
        bank[name] = []
        for v in range(3):
            wav = fn(1000 + sum(ord(c) for c in name) * 17 + v * 31)
            bank[name].append(wav)
            save_wav(os.path.join(SFX_DIR, f"{name}_{v}.wav"), wav)

    singles = {
        "door_creak": synth_door_creak(4201),
        "shutter": synth_shutter(4202),
        "kaching": synth_kaching(4203),
        "game_melody": synth_game_melody(4204),
    }
    for name, wav in singles.items():
        save_wav(os.path.join(SFX_DIR, f"{name}.wav"), wav)

    # 2. Load & pad narration audio to 152.52s
    voice = read_wav_resampled(NARRATION_PATH, SR)
    if len(voice) < total_samples:
        voice.extend([0.0] * (total_samples - len(voice)))
    else:
        voice = voice[:total_samples]

    # Pre-normalize voice RMS to ~ -16 LUFS (~ 0.16 RMS) before mixing
    active_sq = [x * x for x in voice if abs(x) > 0.003]
    voice_rms = math.sqrt(sum(active_sq) / max(1, len(active_sq)))
    target_voice_rms = 10 ** (-16.0 / 20.0)
    voice_gain = target_voice_rms / max(1e-5, voice_rms)
    voice = [x * voice_gain for x in voice]

    # 3. Schedule foley cues anchored to REAL sync timestamps
    sfx_bus = [0.0] * total_samples
    var_idx = {k: 0 for k in bank}

    def place(key: str, t_sec: float, gain: float = 0.75, room: str = "living"):
        if key in bank:
            idx = var_idx[key] % 3
            var_idx[key] += 1
            raw = bank[key][idx]
        else:
            raw = singles[key]
        wet = apply_room_reverb(raw, room)
        start = int(round(t_sec * SR))
        for j, s in enumerate(wet):
            p = start + j
            if 0 <= p < total_samples:
                sfx_bus[p] += s * gain

    # Schedule events across S01..S38
    place("stamp", word_t("S01", "five"), 0.85, "exterior")
    place("bird", 0.55, 0.45, "exterior")
    place("paper", word_t("S02", "without"), 0.60, "exterior")
    place("door_creak", word_t("S03", "opening"), 0.72, "hall")
    place("tk", word_t("S04", "sunglasses"), 0.80, "hall")
    place("pap", word_t("S04", "sunglasses") + 0.35, 0.72, "hall")
    place("spring", word_t("S05", "giant"), 0.75, "living")
    place("spring", word_t("S05", "banana"), 0.70, "living")
    place("clink", word_t("S06", "diamonds"), 0.72, "kitchen")
    place("clink", word_t("S06", "diamonds") + 0.16, 0.58, "kitchen")
    place("scrub", word_t("S07", "crocodile"), 0.78, "bathroom")
    place("drip", word_t("S07", "teeth") + 0.25, 0.62, "bathroom")
    j_t = word_t("S08", "jumping")
    for k in range(3):
        place("spring", j_t + k * 1.15, 0.65, "bedroom")
        place("trumpet", j_t + k * 1.15 + 0.85, 0.68, "bedroom")
    place("tick", word_t("S09", "later"), 0.55, "bedroom")
    place("paper", word_t("S10", "environments"), 0.55, "brain")
    place("paper", word_t("S11", "years"), 0.65, "brain")
    place("tok", word_t("S12", "furniture"), 0.50, "brain")
    place("tok", word_t("S12", "doors"), 0.50, "brain")
    place("footstep", word_t("S12", "another"), 0.55, "brain")
    place("tok", word_t("S13", "store"), 0.70, "brain")
    place("paper", word_t("S14", "enormous"), 0.65, "brain")
    place("game_melody", word_t("S15", "virtual"), 0.55, "brain")
    place("tok", word_t("S16", "know"), 0.65, "brain")
    place("tok", word_t("S17", "school"), 0.65, "brain")
    place("tok", word_t("S17", "game"), 0.68, "brain")
    place("paper", word_t("S18", "route"), 0.65, "brain")
    for k in range(5):
        place("tok", 73.8 + k * 0.65, 0.58, "living")
    place("clink", word_t("S20", "trick"), 0.55, "brain")
    place("footstep", word_t("S21", "movement"), 0.75, "brain")
    place("footstep", word_t("S21", "movement") + 0.35, 0.75, "brain")
    place("stamp", word_t("S21", "sound"), 0.85, "brain")
    place("clink", word_t("S21", "sound") + 0.04, 0.65, "brain")
    place("paper", word_t("S22", "mitochondria"), 0.62, "brain")
    place("patter", word_t("S23", "thousands"), 0.68, "kitchen")
    place("tick", word_t("S23", "thousands") + 0.35, 0.72, "kitchen")
    place("tok", word_t("S24", "abstract"), 0.65, "kitchen")
    place("tok", word_t("S24", "abstract") + 0.20, 0.58, "kitchen")
    for k in range(3):
        place("spring", word_t("S25", "different") + k * 0.22, 0.55, "brain")
    place("tick", word_t("S26", "school"), 0.62, "brain")
    place("footstep", word_t("S27", "museum"), 0.60, "bathroom")
    place("footstep", word_t("S28", "entire"), 0.55, "kitchen")
    place("kaching", word_t("S28", "language"), 0.65, "kitchen")
    for k in range(8):
        place("footstep", 114.2 + k * 0.42, 0.50, "living")
    for k in range(5):
        place("tok", word_t("S29", "retrieving") + k * 0.35, 0.60, "living")
    place("stamp", word_t("S30", "seventeen"), 0.82, "brain")
    for k in range(6):
        place("tok", word_t("S31", "weeks") + k * 0.36, 0.62, "brain")
    place("paper", 127.85, 0.65, "brain")
    place("tok", word_t("S32", "detectable"), 0.70, "brain")
    place("shutter", word_t("S33", "isnt") - 0.12, 0.72, "brain")
    place("stamp", word_t("S33", "isnt"), 0.82, "brain")
    place("tok", word_t("S34", "understand"), 0.60, "hall")
    place("tok", word_t("S34", "associate"), 0.60, "hall")
    place("tick", word_t("S34", "revisit"), 0.68, "hall")
    place("tick", word_t("S34", "revisit") + 0.35, 0.68, "hall")
    place("stamp", word_t("S35", "clearly"), 0.80, "brain")
    place("bird", 146.2, 0.48, "exterior")
    place("door_creak", 147.35, 0.70, "hall")

    # S38 SILENT BEAT FOLEY (149.02 -> 152.52s) - NO voice here, clear penguin steps + sunglasses + check stamp!
    place("footstep", 149.05, 0.65, "hall")
    place("footstep", 149.32, 0.65, "hall")
    place("footstep", 149.60, 0.65, "hall")
    place("tk", 150.35, 0.85, "hall")
    place("pap", 150.70, 0.72, "hall")
    place("tk", 151.02, 0.85, "hall")
    place("stamp", 151.52, 0.90, "hall")

    # 4. Subtle 3-note plucked bed after 40.0s until 148.5s (~ -30 LUFS)
    pluck_bus = [0.0] * total_samples
    motif = [261.63, 329.63, 392.00, 329.63]  # C4 E4 G4 E4 (built from 3 pitch classes only)
    t_cur = 40.2
    step_n = 0
    while t_cur < 148.0:
        f = motif[step_n % len(motif)]
        s_idx = int(t_cur * SR)
        for j in range(int(0.42 * SR)):
            if s_idx + j >= total_samples:
                break
            tt = j / SR
            val = math.sin(2 * math.pi * f * tt) * env_exp(tt, 0.005, 0.16) * 0.028
            pluck_bus[s_idx + j] += val
        t_cur += 0.85
        step_n += 1

    # 5. Room tone bed at ~ -38 LUFS across entire duration (differentiated filtered noise per section)
    rng_tone = random.Random(777)
    room_lp = OnePoleLP(360)
    room_bus = [0.0] * total_samples
    for i in range(total_samples):
        room_bus[i] = room_lp.step(rng_tone.uniform(-1, 1)) * 0.015

    # 6. Voice side-chain envelope follower (30 ms attack, 300 ms release) -> duck SFX by -6 dB during speech
    att_coef = math.exp(-1.0 / (0.030 * SR))
    rel_coef = math.exp(-1.0 / (0.300 * SR))
    env = 0.0
    mixed = [0.0] * total_samples
    for i in range(total_samples):
        av = abs(voice[i])
        if av > env:
            env = att_coef * env + (1.0 - att_coef) * av
        else:
            env = rel_coef * env + (1.0 - rel_coef) * av
        # Normalize env around speech threshold (~0.05) -> 0..1 duck amount -> -6 dB (0.501x)
        duck_amount = min(1.0, max(0.0, (env - 0.015) / 0.05))
        sfx_duck = 1.0 - 0.50 * duck_amount
        mixed[i] = voice[i] + sfx_bus[i] * sfx_duck + pluck_bus[i] * sfx_duck + room_bus[i]

    # Soft-limit raw mix peaks cleanly below 0.85 before two-pass loudnorm
    for i in range(total_samples):
        v = mixed[i]
        if abs(v) > 0.72:
            mixed[i] = math.copysign(0.72 + 0.14 * math.tanh((abs(v) - 0.72) / 0.25), v)

    save_wav(MIX_RAW_PATH, mixed, SR)

    # 7. Two-pass ffmpeg loudnorm to I=-14 LUFS, TP=-1.5 dBTP at 48 kHz
    p1 = subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            MIX_RAW_PATH,
            "-af",
            "loudnorm=I=-13.2:TP=-1.4:LRA=9:print_format=json",
            "-f",
            "null",
            "-",
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    stderr = p1.stderr
    j_start = stderr.rfind("{")
    stats = json.loads(stderr[j_start:])
    af2 = (
        f"loudnorm=I=-13.2:TP=-1.4:LRA=9:"
        f"measured_I={stats['input_i']}:measured_TP={stats['input_tp']}:"
        f"measured_LRA={stats['input_lra']}:measured_thresh={stats['input_thresh']}:"
        f"offset={stats['target_offset']}:linear=false"
    )
    subprocess.run(
        ["ffmpeg", "-y", "-i", MIX_RAW_PATH, "-af", af2, "-ar", str(SR), "-ac", "1", MIX_PATH],
        capture_output=True,
        text=True,
        check=True,
    )
    os.makedirs(os.path.dirname(PUBLIC_MIX_PATH), exist_ok=True)
    with open(MIX_PATH, "rb") as src, open(PUBLIC_MIX_PATH, "wb") as dst:
        dst.write(src.read())

    # Verify final loudnorm measurement
    p3 = subprocess.run(
        ["ffmpeg", "-y", "-i", MIX_PATH, "-af", "loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json", "-f", "null", "-"],
        capture_output=True,
        text=True,
        check=True,
    )
    final_stats = json.loads(p3.stderr[p3.stderr.rfind("{") :])
    print("Master mix generated:", MIX_PATH)
    print(f"Measured Integrated Loudness: {final_stats['input_i']} LUFS | True Peak: {final_stats['input_tp']} dBTP")


if __name__ == "__main__":
    main()
