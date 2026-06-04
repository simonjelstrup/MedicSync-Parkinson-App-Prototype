import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { createAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { colors, typography, spacing, radii, shadows } from '../lib/theme';
import { useSettingsStore } from '../stores/settingsStore';
import { SOUND_ASSETS, initAudioMode } from '../lib/soundManager';
import { BackArrowIcon, ShieldCheckIcon, SunLocationIcon, LocationPinIcon } from '../components/svg/Icons';
import { Toggle } from '../components/primitives';

const RADIUS_OPTIONS: Array<50 | 100 | 200 | 500> = [50, 100, 200, 500];

export default function PillboxLocationScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [leaveAlertEnabled, setLeaveAlertEnabled] = useState(true);
  const [soundPlaying, setSoundPlaying] = useState(false);

  const pillboxRadius = useSettingsStore((s) => s.pillboxRadius);
  const setPillboxRadius = useSettingsStore((s) => s.setPillboxRadius);

  const playerRef = useRef<AudioPlayer | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFindMy = async () => {
    const supported = await Linking.canOpenURL('findmy://');
    if (supported) {
      await Linking.openURL('findmy://');
    } else {
      await Linking.openURL('https://apps.apple.com/app/find-my/id1514836987');
    }
  };

  const handleMakeSound = async () => {
    if (soundPlaying) {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
      playerRef.current?.pause();
      playerRef.current?.remove();
      playerRef.current = null;
      setSoundPlaying(false);
      return;
    }
    try {
      await initAudioMode();
      const player = createAudioPlayer(SOUND_ASSETS['gentleChime']);
      player.volume = 1.0;
      player.loop = true;
      player.play();
      playerRef.current = player;
      setSoundPlaying(true);
      timeoutRef.current = setTimeout(() => {
        player.pause();
        player.remove();
        playerRef.current = null;
        setSoundPlaying(false);
      }, 10000);
    } catch {
      setSoundPlaying(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <BackArrowIcon color={colors.textPrimary} size={20} />
          </Pressable>
          <View>
            <Text style={styles.title}>{t('pillbox.title')}</Text>
            <Text style={styles.subtitle}>{t('pillbox.subtitle')}</Text>
          </View>
        </View>

        <View style={styles.spacer} />
        <Text style={styles.sectionLabel}>{t('pillbox.statusLabel')}</Text>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconCircle}>
              <ShieldCheckIcon color={colors.positive} size={22} />
            </View>
            <View style={styles.statusText}>
              <Text style={styles.statusTitle}>{t('pillbox.statusOk')}</Text>
              <Text style={styles.statusSub}>{t('pillbox.statusOkSub')}</Text>
            </View>
          </View>

          <Pressable
            style={[styles.findBtn, soundPlaying && styles.findBtnActive]}
            onPress={handleMakeSound}
          >
            <SunLocationIcon color="white" size={18} />
            <Text style={styles.findBtnText}>
              {soundPlaying ? t('pillbox.makeSoundStop') : t('pillbox.makeSound')}
            </Text>
          </Pressable>

          <Pressable style={styles.findMyBtn} onPress={handleFindMy}>
            <LocationPinIcon color={colors.primary} size={18} />
            <Text style={styles.findMyBtnText}>{t('pillbox.openFindMy')}</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>{t('pillbox.settingsLabel')}</Text>

        <View style={styles.toggleRow}>
          <View style={styles.toggleIconCircle}>
            <SunLocationIcon color="white" size={14} />
          </View>
          <Text style={styles.toggleLabel}>{t('pillbox.leaveAlert')}</Text>
          <Toggle value={leaveAlertEnabled} onValueChange={setLeaveAlertEnabled} activeColor={colors.primary} />
        </View>

        <View style={styles.radiusCard}>
          <View style={styles.radiusHeader}>
            <View style={styles.radiusIcon}>
              <LocationPinIcon color={colors.textSecondary} size={18} />
            </View>
            <View style={styles.radiusText}>
              <Text style={styles.radiusTitle}>{t('pillbox.radius')}</Text>
              <Text style={styles.radiusSub}>{t('pillbox.radiusSub', { count: pillboxRadius })}</Text>
            </View>
          </View>
          <View style={styles.radiusOptions}>
            {RADIUS_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={[styles.radiusOpt, pillboxRadius === opt && styles.radiusOptActive]}
                onPress={() => setPillboxRadius(opt)}
              >
                <Text style={[styles.radiusOptText, pillboxRadius === opt && styles.radiusOptTextActive]}>
                  {opt >= 1000 ? `${opt / 1000}km` : `${opt}m`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: 18,
    paddingBottom: 6,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Manrope_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.helper,
    color: colors.textSecondary,
    marginTop: 2,
  },
  spacer: {
    height: 14,
  },
  sectionLabel: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
    marginBottom: 10,
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.cardPadding,
  },
  statusIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgPositive,
    borderWidth: 1,
    borderColor: colors.positiveSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.textPrimary,
  },
  statusSub: {
    ...typography.helper,
    color: colors.textSecondary,
    marginTop: 2,
  },
  findBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: spacing.tapMin,
    backgroundColor: colors.primary,
    margin: spacing.cardPadding,
    marginTop: spacing.md,
    borderRadius: radii.md,
  },
  findBtnActive: {
    backgroundColor: colors.primaryDarkerText,
  },
  findBtnText: {
    ...typography.button,
    color: colors.primaryTextOn,
  },
  findMyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: spacing.tapMin,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginHorizontal: spacing.cardPadding,
    marginBottom: spacing.cardPadding,
    borderRadius: radii.md,
    backgroundColor: 'transparent',
  },
  findMyBtnText: {
    ...typography.button,
    color: colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.cardPadding,
    height: 60,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  toggleIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 15,
  },
  radiusCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  radiusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.cardPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  radiusIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusText: {
    flex: 1,
  },
  radiusTitle: {
    ...typography.helper,
    color: colors.textPrimary,
    fontFamily: 'Manrope_600SemiBold',
  },
  radiusSub: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: colors.textSecondary,
  },
  radiusOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.cardPadding,
    paddingTop: spacing.sm,
  },
  radiusOpt: {
    flex: 1,
    height: 38,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  radiusOptActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radiusOptText: {
    fontSize: 13,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.textSecondary,
  },
  radiusOptTextActive: {
    color: colors.primaryTextOn,
  },
});
