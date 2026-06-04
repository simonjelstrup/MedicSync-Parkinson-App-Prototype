import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { createAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { colors, typography, spacing, radii, shadows } from '../lib/theme';
import { useSettingsStore, type AlarmSound, type AlarmEscalation, type AlarmPattern, type AlarmProfile } from '../stores/settingsStore';
import { SOUND_ASSETS, initAudioMode } from '../lib/soundManager';
import { BackArrowIcon, PlayIcon } from '../components/svg/Icons';

const SOUNDS: AlarmSound[] = ['gentleChime', 'softBells', 'morningBirds', 'windBells', 'strongTone'];
const ESCALATIONS: { key: AlarmEscalation; labelKey: string; timeKey: string }[] = [
  { key: 'slow', labelKey: 'profile.slow', timeKey: 'profile.over5min' },
  { key: 'medium', labelKey: 'profile.medium', timeKey: 'profile.over3min' },
  { key: 'fast', labelKey: 'profile.fast', timeKey: 'profile.over1min' },
];
const PATTERNS: { key: AlarmPattern; labelKey: string; subKey: string }[] = [
  { key: 'constant', labelKey: 'profile.patternConstant', subKey: 'profile.patternConstantSub' },
  { key: 'intervals', labelKey: 'profile.patternIntervals', subKey: 'profile.patternIntervalsSub' },
  { key: 'every30', labelKey: 'profile.patternEvery30', subKey: 'profile.patternEvery30Sub' },
  { key: 'everyMin', labelKey: 'profile.patternEveryMin', subKey: 'profile.patternEveryMinSub' },
];

export default function ProfileEditorScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { profile } = useLocalSearchParams<{ profile: 'home' | 'outdoors' }>();

  const profiles = useSettingsStore((s) => s.profiles);
  const setProfile = useSettingsStore((s) => s.setProfile);

  const profileId = profile === 'outdoors' ? 'outdoors' : 'home';
  const current = profiles[profileId];

  const [selectedSound, setSelectedSound] = useState<AlarmSound>(current.sound);
  const [escalation, setEscalation] = useState<AlarmEscalation>(current.escalation);
  const [pattern, setPattern] = useState<AlarmPattern>(current.pattern);
  const [playingSound, setPlayingSound] = useState<AlarmSound | null>(null);

  const playerRef = useRef<AudioPlayer | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const patternTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rampTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (patternTimerRef.current) clearInterval(patternTimerRef.current);
      if (rampTimerRef.current) clearInterval(rampTimerRef.current);
      playerRef.current?.pause();
      playerRef.current?.remove();
    };
  }, []);

  const stopAudio = () => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (patternTimerRef.current) { clearInterval(patternTimerRef.current); patternTimerRef.current = null; }
    if (rampTimerRef.current) { clearInterval(rampTimerRef.current); rampTimerRef.current = null; }
    playerRef.current?.pause();
    playerRef.current?.remove();
    playerRef.current = null;
    setPlayingSound(null);
  };

  const handlePreview = async (sound: AlarmSound) => {
    stopAudio();
    if (playingSound === sound) return;
    try {
      await initAudioMode();
      const player = createAudioPlayer(SOUND_ASSETS[sound]);
      player.volume = 0.85;
      player.loop = true;
      player.play();
      playerRef.current = player;
      setPlayingSound(sound);
      timeoutRef.current = setTimeout(() => { stopAudio(); }, 3500);
    } catch {
      setPlayingSound(null);
    }
  };

  const handleEscalationPreview = async (esc: AlarmEscalation) => {
    stopAudio();
    setEscalation(esc);
    try {
      await initAudioMode();
      const player = createAudioPlayer(SOUND_ASSETS[selectedSound]);
      player.loop = true;
      player.volume = 0.1;
      player.play();
      playerRef.current = player;
      // Compressed ramp: Fast=1s, Medium=2s, Slow=3.5s to reach full volume
      const rampMs = esc === 'fast' ? 1000 : esc === 'medium' ? 2000 : 3500;
      const steps = 20;
      const stepMs = rampMs / steps;
      let step = 0;
      rampTimerRef.current = setInterval(() => {
        step++;
        if (playerRef.current) playerRef.current.volume = Math.min(1.0, 0.1 + (step / steps) * 0.9);
        if (step >= steps && rampTimerRef.current) { clearInterval(rampTimerRef.current); rampTimerRef.current = null; }
      }, stepMs);
      timeoutRef.current = setTimeout(() => { stopAudio(); }, 4000);
    } catch {}
  };

  const handlePatternPreview = async (pat: AlarmPattern) => {
    stopAudio();
    setPattern(pat);
    try {
      await initAudioMode();
      const player = createAudioPlayer(SOUND_ASSETS[selectedSound]);
      player.volume = 0.85;
      playerRef.current = player;
      if (pat === 'constant') {
        player.loop = true;
        player.play();
        timeoutRef.current = setTimeout(() => { stopAudio(); }, 4000);
      } else if (pat === 'intervals') {
        // Compressed demo: 1.5s on, 1.5s off
        player.loop = true;
        player.play();
        let muted = false;
        patternTimerRef.current = setInterval(() => {
          muted = !muted;
          muted ? playerRef.current?.pause() : playerRef.current?.play();
        }, 1500);
        timeoutRef.current = setTimeout(() => { stopAudio(); }, 6000);
      } else {
        // every30 / everyMin — single chime
        player.loop = false;
        player.play();
        timeoutRef.current = setTimeout(() => { stopAudio(); }, 4000);
      }
    } catch {}
  };

  const eyebrow = profileId === 'home' ? t('profile.indoorLabel') : t('profile.outdoorLabel');
  const title = profileId === 'home' ? t('profile.home') : t('profile.outdoors');

  const handleSave = () => {
    const updated: AlarmProfile = { id: profileId, sound: selectedSound, escalation, pattern };
    setProfile(profileId, updated);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <BackArrowIcon color={colors.textPrimary} size={20} />
            <Text style={styles.backLabel}>{t('common.settings')}</Text>
          </Pressable>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>

        <Text style={styles.subLabel}>{t('profile.sound')}</Text>
        <View style={styles.soundList}>
          {SOUNDS.map((sound) => (
            <Pressable key={sound} style={styles.soundItem} onPress={() => setSelectedSound(sound)}>
              <View
                style={[styles.soundRadio, selectedSound === sound && styles.soundRadioSelected]}
              >
                {selectedSound === sound && <View style={styles.soundRadioInner} />}
              </View>
              <View style={styles.soundInfo}>
                <Text style={styles.soundName}>{t(`sound.${sound}`)}</Text>
              </View>
              <Pressable
                style={[styles.previewBtn, playingSound === sound && styles.previewBtnPlaying]}
                hitSlop={8}
                onPress={() => handlePreview(sound)}
                accessibilityLabel={`Preview ${t(`sound.${sound}`)}`}
              >
                <PlayIcon
                  color={playingSound === sound ? colors.primaryTextOn : colors.primary}
                  size={14}
                />
              </Pressable>
            </Pressable>
          ))}
        </View>

        <Text style={styles.subLabel}>{t('profile.escalationLabel')}</Text>
        <View style={styles.escalationCard}>
          <Text style={styles.escalationHelp}>{t('profile.escalationHelp')}</Text>
          <View style={styles.escalationOptions}>
            {ESCALATIONS.map(({ key, labelKey, timeKey }) => (
              <Pressable
                key={key}
                style={[styles.escalationOpt, escalation === key && styles.escalationOptActive]}
                onPress={() => handleEscalationPreview(key)}
              >
                <Text
                  style={[
                    styles.escalationOptLabel,
                    escalation === key && styles.escalationOptLabelActive,
                  ]}
                >
                  {t(labelKey)}
                </Text>
                <Text
                  style={[
                    styles.escalationOptTime,
                    escalation === key && styles.escalationOptTimeActive,
                  ]}
                >
                  {t(timeKey)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.subLabel}>{t('profile.patternLabel')}</Text>
        <View style={styles.escalationCard}>
          <Text style={styles.escalationHelp}>{t('profile.patternHelp')}</Text>
          <View style={styles.patternOptions}>
            {PATTERNS.map(({ key, labelKey, subKey }) => (
              <Pressable
                key={key}
                style={[styles.patternOpt, pattern === key && styles.patternOptActive]}
                onPress={() => handlePatternPreview(key)}
              >
                <Text
                  style={[
                    styles.patternOptLabel,
                    pattern === key && styles.patternOptLabelActive,
                  ]}
                >
                  {t(labelKey)}
                </Text>
                <Text
                  style={[styles.patternOptSub, pattern === key && styles.patternOptSubActive]}
                >
                  {t(subKey)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{t('profile.save')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.screenEdge,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 12,
    marginBottom: spacing.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 44,
    alignSelf: 'flex-start',
  },
  backLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  titleRow: {
    marginBottom: 24,
  },
  eyebrow: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Manrope_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subLabel: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
    marginBottom: 10,
    marginTop: 4,
  },
  soundList: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.cardPadding,
    height: spacing.tapMin,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDividerSoft,
  },
  soundRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundRadioSelected: {
    borderColor: colors.primary,
  },
  soundRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  soundInfo: {
    flex: 1,
  },
  soundName: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
  },
  previewBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewBtnPlaying: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  escalationCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.cardPadding,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  escalationHelp: {
    ...typography.helper,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  escalationOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  escalationOpt: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  escalationOptActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  escalationOptLabel: {
    ...typography.helper,
    color: colors.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
  },
  escalationOptLabelActive: {
    color: colors.primaryTextOn,
  },
  escalationOptTime: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: colors.textSecondary,
    marginTop: 2,
  },
  escalationOptTimeActive: {
    color: colors.primaryTextOn,
    opacity: 0.85,
  },
  patternOptions: {
    gap: spacing.sm,
  },
  patternOpt: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  patternOptActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  patternOptLabel: {
    ...typography.helper,
    color: colors.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
  },
  patternOptLabelActive: {
    color: colors.primaryTextOn,
  },
  patternOptSub: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: colors.textSecondary,
    marginTop: 2,
  },
  patternOptSubActive: {
    color: colors.primaryTextOn,
    opacity: 0.85,
  },
  saveBtn: {
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  saveBtnText: {
    ...typography.buttonPrimary,
    color: colors.primaryTextOn,
  },
});
