import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useKeepAwake } from 'expo-keep-awake';
import Svg, { Rect, Line, Circle } from 'react-native-svg';
import { colors, typography, spacing, radii } from '../lib/theme';
import { useScheduleStore } from '../stores/scheduleStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTodayStore } from '../stores/todayStore';
import { useSilence } from '../contexts/SilenceContext';
import { computeEffectiveMealTime } from '../lib/scheduleUtils';
import { confirmDose } from '../lib/confirmationService';
import { useAlarmSound } from '../lib/soundManager';
import { isNfcSupported, scanForTag, cancelScan } from '../lib/nfcService';
import { SpeakerMuteIcon } from '../components/svg/Icons';

function PillRingIcon() {
  return (
    <View style={styles.pillRingOuter}>
      <View style={styles.pillRingInner}>
        <Svg width={48} height={20} viewBox="0 0 48 20">
          <Rect x={2} y={2} width={44} height={16} rx={8} fill={colors.primary} />
          <Line x1={24} y1={2} x2={24} y2={18} stroke={colors.primaryTextOn} strokeWidth={2} />
        </Svg>
      </View>
    </View>
  );
}

function PhoneIcon() {
  return (
    <Svg width={32} height={44} viewBox="0 0 32 44">
      <Rect x={3} y={1} width={26} height={42} rx={5} fill="none" stroke={colors.primary} strokeWidth={2} />
      <Circle cx={16} cy={38} r={2} fill={colors.primary} />
      <Rect x={10} y={1} width={12} height={3} rx={1.5} fill={colors.primary} />
    </Svg>
  );
}

function PillboxIcon() {
  return (
    <Svg width={44} height={32} viewBox="0 0 44 32">
      <Rect x={2} y={2} width={40} height={28} rx={6} fill="none" stroke={colors.primary} strokeWidth={2} />
      <Rect x={8} y={8} width={12} height={7} rx={2} fill={colors.primarySoft} />
      <Rect x={24} y={8} width={12} height={7} rx={2} fill={colors.primarySoft} />
      <Rect x={8} y={18} width={12} height={7} rx={2} fill={colors.primarySoft} />
      <Rect x={24} y={18} width={12} height={7} rx={2} fill={colors.primarySoft} />
    </Svg>
  );
}

function VolumeBar({ height, lit }: { height: number; lit: boolean }) {
  return (
    <View style={{ width: 6, height, borderRadius: 3, backgroundColor: lit ? colors.primary : colors.border }} />
  );
}

export default function AlarmScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { doseId } = useLocalSearchParams<{ doseId: string }>();

  // Keep screen awake while alarm is active
  useKeepAwake();

  const doses = useScheduleStore((s) => s.doses);
  const mealTimes = useSettingsStore((s) => s.mealTimes);
  const profiles = useSettingsStore((s) => s.profiles);
  const activeProfileId = useTodayStore((s) => s.activeProfile);
  const mealAdjustments = useTodayStore((s) => s.mealAdjustments);
  const { isSilenced } = useSilence();

  const dose = doses.find((d) => d.id === doseId);
  const profile = profiles[activeProfileId];
  const silenced = doseId ? isSilenced(doseId) : false;

  // Volume escalation — shared start time drives both visual bars and audio ramp
  const [litBars, setLitBars] = useState(1);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const escalationMs =
      profile.escalation === 'slow' ? 5 * 60 * 1000 :
      profile.escalation === 'medium' ? 3 * 60 * 1000 :
      60 * 1000;
    const barIntervalMs = escalationMs / 5;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setLitBars(Math.min(5, Math.floor(elapsed / barIntervalMs) + 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [profile.escalation]);

  // Alarm audio — plays the profile sound with escalation and pattern
  useAlarmSound(profile, silenced, startTimeRef);

  // Build the meal context line shown below medication names
  const contextLine = (() => {
    if (!dose) return '';
    if (dose.timingMode === 'fixed') return t('schedule.anchorAt', { time: dose.fixedTime });
    const { meal, relation, minutes } = dose.mealAnchor;
    const mealName = t(`settings.${meal}`).toLowerCase();
    const relText = t(`doseEditor.${relation}`);
    const minLabel = minutes >= 60 ? t('doseEditor.oneHour') : `${minutes} min`;
    const effectiveMealTime = computeEffectiveMealTime(meal, mealTimes, mealAdjustments);
    return `${minLabel} ${relText} ${mealName} · ${effectiveMealTime}`;
  })();

  // NFC scanning state
  const [nfcState, setNfcState] = useState<'scanning' | 'idle' | 'unsupported'>('idle');
  const nfcActiveRef = useRef(true);

  const startNfcScan = async () => {
    if (!nfcActiveRef.current) return;
    setNfcState('scanning');
    const read = await scanForTag(t('alarm.nfcScanPrompt'));
    if (!nfcActiveRef.current) return;
    if (read && doseId) {
      const { eatTime } = await confirmDose(doseId, 'nfc');
      router.replace({ pathname: '/confirmed', params: { doseId, method: 'nfc', eatTime: eatTime ?? '' } });
    } else {
      setNfcState('idle');
    }
  };

  useEffect(() => {
    nfcActiveRef.current = true;
    let timer: ReturnType<typeof setTimeout>;
    isNfcSupported().then((supported) => {
      if (!nfcActiveRef.current) return;
      if (!supported) { setNfcState('unsupported'); return; }
      // Small delay so alarm screen renders before iOS NFC sheet appears
      timer = setTimeout(startNfcScan, 1200);
    });
    return () => {
      nfcActiveRef.current = false;
      clearTimeout(timer);
      cancelScan();
    };
  }, []);

  const handleManual = () => {
    router.push({ pathname: '/manual-confirm', params: { doseId } });
  };

  if (!dose) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>{t('alarm.kicker')}</Text>
          <Pressable style={styles.manualBtn} onPress={() => router.back()}>
            <Text style={styles.manualBtnText}>{t('common.back')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PillRingIcon />

        <Text style={styles.kicker}>{t('alarm.kicker')}</Text>
        {dose.medications.map((med) => (
          <Text key={med.id} style={styles.medName}>{med.name} {med.dosage}</Text>
        ))}
        <Text style={styles.context}>{contextLine}</Text>

        {silenced && (
          <View style={styles.silentBadge}>
            <SpeakerMuteIcon color={colors.textMuted} size={14} />
            <Text style={styles.silentBadgeText}>{t('alarm.silentVibration')}</Text>
          </View>
        )}

        {/* NFC card — active when alarm is on screen */}
        <Pressable
          style={[styles.nfcCard, nfcState === 'scanning' && styles.nfcCardScanning]}
          onPress={nfcState === 'scanning' ? undefined : nfcState === 'unsupported' ? async () => {
            if (!doseId) return;
            const { eatTime } = await confirmDose(doseId, 'nfc');
            router.replace({ pathname: '/confirmed', params: { doseId, method: 'nfc', eatTime: eatTime ?? '' } });
          } : startNfcScan}
          disabled={nfcState === 'scanning'}
        >
          <View style={styles.nfcIconRow}>
            <PhoneIcon />
            <View style={styles.nfcWaves}>
              {[5, 9, 13].map((h, i) => (
                <View key={i} style={[styles.wave, { height: h, opacity: nfcState === 'scanning' ? 0.4 + i * 0.25 : 0.2 + i * 0.15 }]} />
              ))}
            </View>
            <PillboxIcon />
          </View>
          <Text style={styles.nfcMain}>
            {nfcState === 'scanning' ? t('alarm.nfcScanning') : t('alarm.nfcMain')}
          </Text>
          <Text style={styles.nfcSub}>
            {nfcState === 'idle' ? t('alarm.nfcTapRetry') : t('alarm.nfcSub')}
          </Text>
        </Pressable>

        {silenced ? (
          <View style={styles.volSection}>
            <Text style={styles.volText}>{t('alarm.silentVibration')}</Text>
          </View>
        ) : (
          <View style={styles.volSection}>
            <View style={styles.volRow}>
              {[5, 9, 13, 17, 22].map((h, i) => (
                <VolumeBar key={i} height={h} lit={i < litBars} />
              ))}
            </View>
            <Text style={styles.volText}>{t('alarm.volumeEscalating')}</Text>
          </View>
        )}

        <View style={styles.orDivider}>
          <View style={styles.orLine} />
          <Text style={styles.orLabel}>{t('alarm.notNearPillbox')}</Text>
          <View style={styles.orLine} />
        </View>

        <Pressable style={styles.manualBtn} onPress={handleManual}>
          <Text style={styles.manualBtnText}>{t('alarm.confirmWithoutPillbox')}</Text>
        </Pressable>

        <Text style={styles.contract}>{t('alarm.contract')}</Text>
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
    alignItems: 'center',
    paddingHorizontal: spacing.screenEdge,
    paddingBottom: 40,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenEdge,
    gap: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pillRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
    backgroundColor: colors.bgSoft,
  },
  pillRingInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
  },
  kicker: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  medName: {
    fontSize: 22,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
  },
  context: {
    ...typography.helper,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: 16,
  },
  silentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bgNeutral,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.badge,
    marginBottom: 16,
  },
  silentBadgeText: {
    ...typography.helper,
    color: colors.textMuted,
    fontFamily: 'Manrope_600SemiBold',
  },
  nfcCard: {
    width: '100%',
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.cardPadding,
    alignItems: 'center',
    marginBottom: 24,
  },
  nfcCardScanning: {
    backgroundColor: colors.primarySoft,
  },
  nfcIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: spacing.md,
  },
  nfcWaves: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  wave: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  nfcMain: {
    fontSize: 17,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  nfcSub: {
    ...typography.helper,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  volSection: {
    alignItems: 'center',
    marginBottom: 24,
    gap: spacing.sm,
  },
  volRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
  },
  volText: {
    ...typography.helper,
    color: colors.textSecondary,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: spacing.md,
    marginBottom: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderDivider,
  },
  orLabel: {
    ...typography.helper,
    color: colors.textMuted,
  },
  manualBtn: {
    width: '100%',
    height: spacing.tapMin,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: spacing.lg,
  },
  manualBtnText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  contract: {
    ...typography.helper,
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
  },
});
