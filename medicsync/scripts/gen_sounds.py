#!/usr/bin/env python3
"""
Generate alarm sounds for MedicSync.
5 sounds, each 10 seconds, 44100 Hz mono 16-bit WAV.
"""
import numpy as np
import wave, os

SR     = 44100
DUR    = 10.0
N      = int(SR * DUR)
TAU    = 2 * np.pi
OUT    = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sounds')

# ── helpers ─────────────────────────────────────────────────────────────────

def save(path, sig, target=0.88):
    peak = np.max(np.abs(sig))
    if peak > 0:
        sig = sig / peak * target
    # 300 ms fade-out so looping doesn't click
    fade = int(0.30 * SR)
    sig[-fade:] *= np.linspace(1, 0, fade)
    data = np.clip(sig * 32767, -32767, 32767).astype(np.int16)
    with wave.open(path, 'w') as f:
        f.setnchannels(1); f.setsampwidth(2)
        f.setframerate(SR); f.writeframes(data.tobytes())
    print(f"  {os.path.basename(path)}  {os.path.getsize(path)//1024} KB")

def bell(t_off, freq, amp, tau_s):
    """Inharmonic bell tone – 3 partials with separate decay rates."""
    i0 = int(t_off * SR)
    if i0 >= N:
        return np.zeros(N)
    lt = np.arange(N - i0) / SR
    # 8 ms linear attack
    atk = int(0.008 * SR)
    env_atk = np.ones(len(lt))
    env_atk[:atk] = np.linspace(0, 1, atk)
    # Bell partials: fundamental, minor-third overtone, tierce
    p = (  np.sin(TAU * freq         * lt) * np.exp(-lt / tau_s)        * 1.00
         + np.sin(TAU * freq * 2.756 * lt) * np.exp(-lt / (tau_s*0.45)) * 0.55
         + np.sin(TAU * freq * 5.404 * lt) * np.exp(-lt / (tau_s*0.25)) * 0.22
    ) * env_atk * amp
    out = np.zeros(N)
    out[i0:] = p
    return out

def chirp(t_off, f0, f1, dur, amp, vibr_hz=0, vibr_d=0):
    """Bird chirp – frequency sweep from f0→f1, optional vibrato."""
    i0 = int(t_off * SR)
    if i0 >= N:
        return np.zeros(N)
    n  = min(int(dur * SR), N - i0)
    lt = np.arange(n) / SR
    freq = f0 + (f1 - f0) * (lt / dur)
    if vibr_hz > 0:
        freq *= 1 + vibr_d * np.sin(TAU * vibr_hz * lt)
    phase = TAU * np.cumsum(freq) / SR
    env   = np.exp(-lt / (dur * 1.3)) * np.minimum(lt / max(dur * 0.08, 1/SR), 1.0)
    out   = np.zeros(N)
    out[i0:i0+n] = np.sin(phase) * env * amp
    return out

def pulse(t_off, freq, dur, amp):
    """Clean tone burst with short attack + release, 3 harmonics."""
    i0 = int(t_off * SR)
    if i0 >= N:
        return np.zeros(N)
    n   = min(int(dur * SR), N - i0)
    lt  = np.arange(n) / SR
    atk = int(0.006 * SR); rel = int(0.04 * SR)
    env = np.ones(n)
    env[:atk] = np.linspace(0, 1, atk)
    env[-rel:] = np.linspace(1, 0, rel)
    tone = (  np.sin(TAU * freq     * lt)
            + np.sin(TAU * freq * 2 * lt) * 0.35
            + np.sin(TAU * freq * 3 * lt) * 0.12) * env * amp * 0.70
    out = np.zeros(N)
    out[i0:i0+n] = tone
    return out

# ── 1. Gentle Chime ─────────────────────────────────────────────────────────
# C major triad (C5·E5·G5) struck as a soft rolling chord every 3 s.
# Very warm, long decay — the most peaceful option.
print("1  Gentle chime …")
sig = np.zeros(N)
for t0 in [0.05, 3.0, 6.0, 9.0]:
    for i, (f, a) in enumerate(zip([523.25, 659.25, 783.99], [0.56, 0.50, 0.44])):
        sig += bell(t0 + i*0.07, f, a, tau_s=2.6)
save(os.path.join(OUT, 'gentle-chime.wav'), sig)

# ── 2. Soft Bells ───────────────────────────────────────────────────────────
# G-major pentatonic ascending arpeggio (G4·B4·D5·G5), music-box feel.
# Notes spaced 220 ms apart; phrase repeats every 3.4 s.
print("2  Soft bells …")
sig = np.zeros(N)
for t0 in [0.0, 3.4, 6.8]:
    for i, (f, a) in enumerate(zip([392.00, 493.88, 587.33, 783.99],
                                    [0.60,   0.54,   0.50,   0.46])):
        sig += bell(t0 + i*0.22, f, a, tau_s=1.8)
save(os.path.join(OUT, 'soft-bells.wav'), sig)

# ── 3. Morning Birds ────────────────────────────────────────────────────────
# FM-synthesis bird phrases (robin + blackbird + wren) that repeat every 3.5 s.
# Organic, cheerful; the "nature alarm".
print("3  Morning birds …")
sig = np.zeros(N)
def phrase(t0):
    s = np.zeros(N)
    s += chirp(t0+0.00, 2200, 2850, 0.12, 0.50, vibr_hz=9,  vibr_d=0.022)
    s += chirp(t0+0.18, 2500, 3100, 0.10, 0.48, vibr_hz=9,  vibr_d=0.022)
    s += chirp(t0+0.55, 1900, 2700, 0.18, 0.42, vibr_hz=6,  vibr_d=0.030)
    s += chirp(t0+0.80, 2700, 1800, 0.22, 0.42, vibr_hz=6,  vibr_d=0.030)
    for i in range(4):
        f = 3000 + (i % 2) * 280
        s += chirp(t0+1.20+i*0.10, f, f+(-200 if i%2 else 200), 0.08, 0.34)
    return s
for t0 in [0.0, 3.5, 7.0]:
    sig += phrase(t0)
save(os.path.join(OUT, 'morning-birds.wav'), sig)

# ── 4. Wind Bells ───────────────────────────────────────────────────────────
# F-pentatonic chimes (F4·A4·C5·D5·F5) with very long decay (4 s).
# Bells overlap and shimmer — meditative, like Japanese wind chimes.
print("4  Wind bells …")
sig = np.zeros(N)
notes = [349.23, 440.00, 523.25, 587.33, 698.46]
for t0, idx, a in [
    (0.10,0,.50),(0.45,2,.47),(0.90,4,.44),(1.50,1,.50),(2.10,3,.47),
    (2.70,0,.50),(3.30,2,.47),(3.90,4,.44),(4.45,1,.50),(5.05,3,.47),
    (5.55,0,.50),(6.05,2,.47),(6.60,4,.44),(7.15,1,.50),(7.70,3,.47),
    (8.10,0,.48),(8.50,2,.45),(8.85,4,.42),(9.15,1,.40),(9.45,3,.37),
]:
    sig += bell(t0, notes[idx], a, tau_s=4.0)
save(os.path.join(OUT, 'wind-bells.wav'), sig)

# ── 5. Strong Tone ──────────────────────────────────────────────────────────
# A5 (880 Hz) long + F#5 (740 Hz) short — classic two-note alert figure.
# Harmonics give it body; crisp and unmissable.
print("5  Strong tone …")
sig = np.zeros(N)
for i in range(8):
    t0 = i * 1.22
    sig += pulse(t0,      880.00, 0.32, amp=0.78)
    sig += pulse(t0+0.43, 739.99, 0.17, amp=0.62)
save(os.path.join(OUT, 'strong-tone.wav'), sig)

print("\nDone.")
