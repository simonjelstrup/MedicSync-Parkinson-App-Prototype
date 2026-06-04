#!/usr/bin/env python3
"""
Generate piano melody alarm sounds for MedicSync.
5 tunes, 10 seconds each, 44100 Hz mono 16-bit WAV.

Each sound replaces one of the five existing alarm files.
The piano model uses inharmonic partials + per-harmonic decay,
giving a warm, realistic piano timbre without any sample files.
"""
import numpy as np
import wave, os

SR    = 44100
DUR   = 10.0
N     = int(SR * DUR)
TAU   = 2 * np.pi
OUT   = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sounds')

# ── note helper ─────────────────────────────────────────────────────────────

_ST = {'C':-9,'C#':-8,'Db':-8,'D':-7,'D#':-6,'Eb':-6,'E':-5,
       'F':-4,'F#':-3,'Gb':-3,'G':-2,'G#':-1,'Ab':-1,'A':0,'A#':1,'Bb':1,'B':2}

def F(name, oct):
    """Return Hz for a note name + octave (A4 = 440 Hz)."""
    return 440.0 * 2 ** ((_ST[name] + (oct - 4) * 12) / 12)

# ── piano synthesis ──────────────────────────────────────────────────────────

def piano_note(t_off, freq, dur, vel=0.62):
    """
    One piano note placed at t_off seconds.
    Warm, round tone: few quiet upper partials, slow raised-cosine attack,
    gentle release. Prioritises smoothness over brightness.
    """
    i0 = int(t_off * SR)
    if i0 >= N:
        return np.zeros(N)

    release_s = 0.35
    total_n   = min(int((dur + release_s) * SR), N - i0)
    lt        = np.arange(total_n) / SR

    # Very mild inharmonicity — keeps the tone round, not edgy
    B = 0.00006
    # Only 5 partials; upper ones kept very quiet for warmth not brightness
    parts = [(1, 1.00), (2, 0.28), (3, 0.08), (4, 0.025), (5, 0.008)]

    tone = np.zeros(total_n)
    for h, h_amp in parts:
        h_freq = freq * h * np.sqrt(1.0 + B * h * h)
        h_tau  = max(0.30, 5.0 / h * (261.63 / max(freq, 80)) ** 0.20)
        tone  += np.sin(TAU * h_freq * lt) * np.exp(-lt / h_tau) * h_amp

    # 22 ms raised-cosine (Hann) attack — smooth, no click
    atk_n = int(0.022 * SR)
    atk_n = min(atk_n, total_n)
    hann  = 0.5 * (1.0 - np.cos(np.pi * np.arange(atk_n) / atk_n))
    tone[:atk_n] *= hann

    # Gentle curved release
    s_end = int(dur * SR)
    if s_end < total_n:
        rel_n = total_n - s_end
        tone[s_end:] *= np.linspace(1.0, 0.0, rel_n) ** 1.8

    tone *= vel
    out = np.zeros(N)
    out[i0 : i0 + total_n] = tone
    return out

def seq(notes, sig=None):
    """
    Play a sequence of (note_freq, duration_s, velocity) tuples consecutively.
    Accumulates into 'sig' (creates a new buffer if None).
    Returns (sig, final_time).
    """
    if sig is None:
        sig = np.zeros(N)
    t = 0.0
    for entry in notes:
        if len(entry) == 3:
            f, d, v = entry
        else:
            f, d = entry; v = 0.72
        sig += piano_note(t, f, d, v)
        t   += d
    return sig, t

def add_reverb(sig, delay1=0.05, d1=0.22, delay2=0.11, d2=0.10):
    """Two-reflection room reverb for warmth and depth."""
    n1, n2 = int(delay1 * SR), int(delay2 * SR)
    rev = np.zeros(N)
    rev[n1:] += sig[:-n1] * d1
    rev[n2:] += sig[:-n2] * d2
    return sig + rev

def save(path, sig, target=0.72):   # lower ceiling = gentler overall level
    peak = np.max(np.abs(sig))
    if peak > 0:
        sig = sig / peak * target
    fade = int(0.35 * SR)
    sig[-fade:] *= np.linspace(1.0, 0.0, fade)
    data = np.clip(sig * 32767, -32767, 32767).astype(np.int16)
    with wave.open(path, 'w') as wf:
        wf.setnchannels(1); wf.setsampwidth(2)
        wf.setframerate(SR); wf.writeframes(data.tobytes())
    print(f"  {os.path.basename(path)}  {os.path.getsize(path)//1024} KB")

# ════════════════════════════════════════════════════════════════════════════
# 1. Gentle Chime  →  "Daggry" (Dawn)
#    C major · 80 BPM · soft and floating
#    Rises and falls like a slow breath — the most peaceful option.
# ════════════════════════════════════════════════════════════════════════════
print("1  Gentle chime — Daggry (Dawn) …")
melody = [
    (F('E',5), 0.75, 0.58),
    (F('G',5), 0.75, 0.54),
    (F('C',5), 1.50, 0.65),
    (F('B',4), 0.75, 0.54),
    (F('D',5), 0.75, 0.52),
    (F('G',4), 1.50, 0.62),
    (F('A',4), 0.75, 0.58),
    (F('C',5), 0.75, 0.54),
    (F('E',5), 1.25, 0.63),
]
# total: 0.75×6 + 1.5×2 + 1.25 = 4.5 + 3.0 + 1.25 = 8.75 s  → last note held until fade
sig, _ = seq(melody)
sig = add_reverb(sig)
save(os.path.join(OUT, 'gentle-chime.wav'), sig)

# ════════════════════════════════════════════════════════════════════════════
# 2. Soft Bells  →  "Krusning" (Ripple)
#    G major · 84 BPM · lyrical, song-like
#    A simple melody that goes up, turns, and comes back home.
# ════════════════════════════════════════════════════════════════════════════
print("2  Soft bells — Krusning (Ripple) …")
melody = [
    (F('G',4), 0.71, 0.62),
    (F('B',4), 0.71, 0.58),
    (F('D',5), 0.71, 0.56),
    (F('G',5), 0.71, 0.60),
    (F('F#',5),0.71, 0.56),
    (F('D',5), 0.71, 0.54),
    (F('B',4), 0.71, 0.56),
    (F('G',4), 0.71, 0.58),
    (F('A',4), 0.71, 0.56),
    (F('C',5), 0.71, 0.54),
    (F('E',5), 0.71, 0.58),
    (F('D',5), 0.71, 0.54),
    (F('G',4), 1.50, 0.64),
]
# total: 12×0.71 + 1.50 = 8.52 + 1.50 = 10.02 s ✓
sig, _ = seq(melody)
sig = add_reverb(sig)
save(os.path.join(OUT, 'soft-bells.wav'), sig)

# ════════════════════════════════════════════════════════════════════════════
# 3. Morning Birds  →  "Lysning" (Clearing)
#    D major · 96 BPM · bright and cheerful
#    Ascending energy — the most uplifting option.
# ════════════════════════════════════════════════════════════════════════════
print("3  Morning birds — Lysning (Clearing) …")
melody = [
    (F('D',5), 0.625, 0.60),
    (F('F#',5),0.625, 0.58),
    (F('A',5), 0.625, 0.60),
    (F('D',5), 0.625, 0.56),
    (F('E',5), 0.625, 0.58),
    (F('G',5), 0.625, 0.56),
    (F('F#',5),0.625, 0.60),
    (F('D',5), 0.625, 0.54),
    (F('A',4), 0.625, 0.58),
    (F('B',4), 0.625, 0.56),
    (F('D',5), 0.625, 0.60),
    (F('F#',5),0.625, 0.58),
    (F('E',5), 0.625, 0.56),
    (F('D',5), 0.625, 0.54),
    (F('A',4), 0.625, 0.52),
    (F('D',5), 0.625, 0.62),
]
# total: 16×0.625 = 10.0 s ✓
sig, _ = seq(melody)
sig = add_reverb(sig, delay1=0.04, d1=0.16, delay2=0.09, d2=0.08)
save(os.path.join(OUT, 'morning-birds.wav'), sig)

# ════════════════════════════════════════════════════════════════════════════
# 4. Wind Bells  →  "Bølge" (Wave)
#    D minor arpeggios · 84 BPM · meditative, flowing
#    Broken chords cascade upward then resolve — very calm.
# ════════════════════════════════════════════════════════════════════════════
print("4  Wind bells — Bølge (Wave) …")
q = 0.40   # fast arpeggio eighth notes

melody = [
    # Dm
    (F('D',4), q, 0.52), (F('F',4), q, 0.49), (F('A',4), q, 0.47), (F('D',5), q, 0.52),
    # C
    (F('C',4), q, 0.50), (F('E',4), q, 0.47), (F('G',4), q, 0.45), (F('C',5), q, 0.50),
    # Bb
    (F('Bb',3),q, 0.48), (F('D',4), q, 0.45), (F('F',4), q, 0.43), (F('Bb',4),q, 0.48),
    # Am
    (F('A',3), q, 0.50), (F('C',4), q, 0.47), (F('E',4), q, 0.45), (F('A',4), q, 0.52),
    # Gm
    (F('G',3), q, 0.48), (F('Bb',3),q, 0.45), (F('D',4), q, 0.43), (F('G',4), q, 0.50),
    # Dm final — hold last note
    (F('D',4), q, 0.52), (F('F',4), q, 0.49), (F('A',4), q, 0.47), (F('D',5), 1.00, 0.62),
]
# total: 23×0.40 + 1.00 = 9.20 + 1.00 = 10.2 s (last note fades out)
sig, _ = seq(melody)
sig = add_reverb(sig, delay1=0.06, d1=0.24, delay2=0.12, d2=0.12)
save(os.path.join(OUT, 'wind-bells.wav'), sig)

# ════════════════════════════════════════════════════════════════════════════
# 5. Strong Tone  →  "Klarhed" (Clarity)
#    E major · 100 BPM · assertive, clear, unmissable
#    Rises to a high B then descends confidently back to E.
# ════════════════════════════════════════════════════════════════════════════
print("5  Strong tone — Klarhed (Clarity) …")
melody = [
    (F('E',4), 0.60, 0.65),
    (F('G#',4),0.60, 0.62),
    (F('B',4), 0.60, 0.65),
    (F('E',5), 0.60, 0.68),
    (F('F#',5),0.60, 0.65),
    (F('G#',5),0.60, 0.66),
    (F('B',5), 0.60, 0.68),
    (F('G#',5),0.60, 0.65),
    (F('F#',5),0.60, 0.63),
    (F('E',5), 0.60, 0.65),
    (F('B',4), 0.60, 0.62),
    (F('G#',4),0.60, 0.60),
    (F('E',4), 0.60, 0.58),
    (F('F#',4),0.60, 0.60),
    (F('G#',4),0.60, 0.62),
    (F('E',4), 0.625,0.65),
]
# total: 15×0.60 + 0.625 = 9.0 + 0.625 = 9.625 s ✓
sig, _ = seq(melody)
sig = add_reverb(sig, delay1=0.04, d1=0.16, delay2=0.08, d2=0.08)
save(os.path.join(OUT, 'strong-tone.wav'), sig)

print("\nDone.")
