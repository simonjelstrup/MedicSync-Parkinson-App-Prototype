import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radii } from '../lib/theme';
import { useScheduleStore } from '../stores/scheduleStore';
import { confirmDose } from '../lib/confirmationService';
import { BackArrowIcon, CheckIcon } from '../components/svg/Icons';

export default function ManualConfirmScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { doseId } = useLocalSearchParams<{ doseId: string }>();

  const doses = useScheduleStore((s) => s.doses);
  const dose = doses.find((d) => d.id === doseId);

  const handleConfirm = async () => {
    if (!doseId) return;
    const { eatTime } = await confirmDose(doseId, 'manual');
    router.replace({ pathname: '/confirmed', params: { doseId, method: 'manual', eatTime: eatTime ?? '' } });
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backRow} onPress={handleGoBack}>
          <BackArrowIcon color={colors.textPrimary} size={20} />
          <Text style={styles.backLabel}>{t('manual.backToAlarm')}</Text>
        </Pressable>

        <Text style={styles.question}>{t('manual.question')}</Text>
        <Text style={styles.hint}>{t('manual.hint')}</Text>

        <View style={styles.checklist}>
          {(dose?.medications ?? []).map(med => (
            <View key={med.id} style={styles.checkRow}>
              <View style={styles.checkCircle}>
                <CheckIcon color={colors.positiveDark} size={14} />
              </View>
              <Text style={styles.checkName}>{med.name} {med.dosage}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.primaryBtn} onPress={handleConfirm}>
          <Text style={styles.primaryBtnText}>{t('manual.yesIDid')}</Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={handleGoBack}>
          <Text style={styles.secondaryBtnText}>{t('manual.notYet')}</Text>
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
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 54,
    marginBottom: spacing.xl,
  },
  backLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  question: {
    fontSize: 24,
    fontFamily: 'Manrope_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  hint: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  checklist: {
    backgroundColor: colors.bgPositive,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.positiveSoft,
    padding: spacing.cardPadding,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgPositive,
    borderWidth: 2,
    borderColor: colors.positiveMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkName: {
    ...typography.body,
    color: colors.positiveText,
  },
  primaryBtn: {
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  primaryBtnText: {
    ...typography.buttonPrimary,
    color: colors.primaryTextOn,
  },
  secondaryBtn: {
    height: spacing.tapMin,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    ...typography.button,
    color: colors.textSecondary,
  },
});
