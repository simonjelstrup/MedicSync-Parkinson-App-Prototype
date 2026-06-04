import { useEffect, useRef } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import type { AlarmProfile, AlarmSound } from '../stores/settingsStore';

export const SOUND_ASSETS: Record<AlarmSound, number> = {
  gentleChime: require('../assets/sounds/gentle-chime.wav'),
  softBells: require('../assets/sounds/soft-bells.wav'),
  morningBirds: require('../assets/sounds/morning-birds.wav'),
  windBells: require('../assets/sounds/wind-bells.wav'),
  strongTone: require('../assets/sounds/strong-tone.wav'),
};

// Filename used in lock-screen notifications (must match expo-notifications plugin sounds config)
export const NOTIFICATION_SOUND_FILE: Record<AlarmSound, string> = {
  gentleChime: 'gentle-chime.wav',
  softBells: 'soft-bells.wav',
  morningBirds: 'morning-birds.wav',
  windBells: 'wind-bells.wav',
  strongTone: 'strong-tone.wav',
};

const ESCALATION_MS: Record<AlarmProfile['escalation'], number> = {
  slow: 5 * 60 * 1000,
  medium: 3 * 60 * 1000,
  fast: 60 * 1000,
};

export async function initAudioMode(): Promise<void> {
  await setAudioModeAsync({
    playsInSilentMode: true,    // alarm plays even when iOS ringer is off
    interruptionMode: 'doNotMix',
  });
}

/**
 * Plays the alarm sound for the given profile while the alarm screen is mounted.
 * Handles pattern (constant / intervals / every30 / everyMin) and volume escalation.
 * Pass the same startTimeRef that drives the visual volume bars so they stay in sync.
 */
export function useAlarmSound(
  profile: AlarmProfile,
  silenced: boolean,
  startTimeRef: React.MutableRefObject<number>
): void {
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    if (silenced) return;

    let active = true;
    let patternTimer: ReturnType<typeof setInterval> | null = null;
    let volumeTimer: ReturnType<typeof setInterval> | null = null;

    async function start() {
      await initAudioMode();

      const player = createAudioPlayer(SOUND_ASSETS[profile.sound]);
      player.volume = 0.1;
      player.loop = false;

      if (!active) {
        player.remove();
        return;
      }
      playerRef.current = player;

      const escalationMs = ESCALATION_MS[profile.escalation];

      // Ramp volume from 0.1 → 1.0 over the escalation period (checked every 2 s)
      volumeTimer = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        playerRef.current!.volume = Math.min(1.0, 0.1 + (elapsed / escalationMs) * 0.9);
      }, 2000);

      if (profile.pattern === 'constant') {
        player.loop = true;
        player.play();

      } else if (profile.pattern === 'intervals') {
        // 5 seconds on, 5 seconds off
        player.loop = true;
        player.play();
        let muted = false;
        patternTimer = setInterval(() => {
          muted = !muted;
          if (muted) {
            playerRef.current?.pause();
          } else {
            playerRef.current?.play();
          }
        }, 5000);

      } else {
        // every30 or everyMin — single chime, then repeat at interval
        const intervalMs = profile.pattern === 'every30' ? 30_000 : 60_000;
        player.loop = false;
        player.play();
        patternTimer = setInterval(async () => {
          const p = playerRef.current;
          if (!p) return;
          try {
            p.pause();
            await p.seekTo(0);
            p.play();
          } catch {}
        }, intervalMs);
      }
    }

    start().catch(console.error);

    return () => {
      active = false;
      if (patternTimer) clearInterval(patternTimer);
      if (volumeTimer) clearInterval(volumeTimer);
      const p = playerRef.current;
      playerRef.current = null;
      if (p) {
        p.pause();
        p.remove();
      }
    };
  }, [profile.sound, profile.pattern, profile.escalation, silenced]);
}
