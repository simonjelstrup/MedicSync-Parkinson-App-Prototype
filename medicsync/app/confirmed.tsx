import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radii } from '../lib/theme';
import { useScheduleStore } from '../stores/scheduleStore';

function CheckRing() {
  return (
    <View style={styles.checkRing}>
      <Svg width={32} height={32} viewBox="0 0 32 32">
        <Path
          d="M7 16L13 22L25 10"
          stroke="white"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

export default function ConfirmedScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { doseId, method, eatTime } = useLocalSearchParams<{ doseId: string; method: 'nfc' | 'manual'; eatTime: string }>();

  const doses = useScheduleStore((s) => s.doses);
  const dose = doses.find((d) => d.id === doseId);

  const isNFC = method === 'nfc';
  const showEatHint = !!eatTime;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <CheckRing />

        <Text style={styles.title}>{t('confirmed.title')}</Text>

        <Text style={styles.meds}>
          {dose ? dose.medications.map(m => `${m.name} ${m.dosage}`).join('\n') : ''}
        </Text>

        <View style={[styles.tag, isNFC ? styles.tagNFC : styles.tagManual]}>
          <Text style={[styles.tagText, isNFC ? styles.tagTextNFC : styles.tagTextManual]}>
            {isNFC ? t('confirmed.viaPillbox') : t('confirmed.manually')}
          </Text>
        </View>

        {showEatHint && (
          <View style={styles.eatHint}>
            <Text style={styles.eatHintText}>
              {t('confirmed.youCanEat')} <Text style={styles.eatHintTime}>{eatTime}</Text>.{'\n'}
              {t('confirmed.wellLetYouKnow')}
            </Text>
          </View>
        )}

        <Pressable
          style={styles.okBtn}
          onPress={() => router.dismissAll()}
        >
          <Text style={styles.okBtnText}>{t('action.ok')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenEdge,
    paddingBottom: 40,
  },
  checkRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.positive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Manrope_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  meds: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radii.badge,
    marginBottom: spacing.xl,
  },
  tagNFC: {
    backgroundColor: colors.bgPositive,
  },
  tagManual: {
    backgroundColor: colors.bgNeutral,
  },
  tagText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
  },
  tagTextNFC: {
    color: colors.positiveDark,
  },
  tagTextManual: {
    color: colors.textMuted,
  },
  eatHint: {
    backgroundColor: colors.bgSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.cardPadding,
    marginBottom: spacing.xl,
    width: '100%',
  },
  eatHintText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  eatHintTime: {
    fontFamily: 'Manrope_700Bold',
    color: colors.textPrimary,
  },
  okBtn: {
    width: '100%',
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okBtnText: {
    ...typography.buttonPrimary,
    color: colors.primaryTextOn,
  },
});
