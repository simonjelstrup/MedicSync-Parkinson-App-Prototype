import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radii, shadows } from '../../lib/theme';
import { useComputedDoses } from '../../lib/scheduleUtils';
import type { DoseTime } from '../../lib/mockData';
import { useSilence } from '../../contexts/SilenceContext';
import { DoseSilenceBell } from '../../components/DoseSilenceBell';

const DOSE_LABEL_KEYS: Record<string, string> = {
  Morning: 'dose.morning',
  Lunch: 'dose.lunch',
  Afternoon: 'dose.afternoon',
  Night: 'dose.night',
};

function anchorLabel(dose: DoseTime, t: ReturnType<typeof useTranslation>['t']): string {
  if (dose.timingMode === 'fixed') return t('schedule.anchorAt', { time: dose.fixedTime });
  const { meal, relation, minutes } = dose.mealAnchor;
  const mealName = t(`doseEditor.${meal}Meal`);
  if (minutes === 0) return t('doseEditor.withMeal');
  const rel = t(`doseEditor.${relation}`);
  if (minutes === 60) return `${t('doseEditor.oneHour')} ${rel} ${mealName}`;
  return `${minutes} min ${rel} ${mealName}`;
}

export default function ScheduleScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { toggleSilence, isSilenced } = useSilence();
  const doses = useComputedDoses();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greeting}>
          <Text style={styles.greetingName}>{t('schedule.title')}</Text>
          <Text style={styles.greetingDate}>{t('schedule.subtitle')}</Text>
        </View>

        <Text style={styles.sectionLabel}>{t('schedule.dailyDoses')}</Text>

        {doses.map((dose) => {
          const silenced = isSilenced(dose.id);
          return (
            <View key={dose.id} style={styles.routineCard}>
              <View style={styles.routineCardHeader}>
                <View style={styles.routineTimeBlock}>
                  <Text style={styles.routineTime}>{dose.scheduledTime}</Text>
                  <Text style={styles.routineLabel}>
                    {DOSE_LABEL_KEYS[dose.label] ? t(DOSE_LABEL_KEYS[dose.label]) : dose.label}
                  </Text>
                </View>
                <View style={styles.routineHeaderRight}>
                  <Text style={styles.routineAnchor}>{anchorLabel(dose, t)}</Text>
                  <DoseSilenceBell
                    silenced={silenced}
                    onToggle={() => toggleSilence(dose.id)}
                    accessibilityLabel={`Silence ${dose.label} dose`}
                  />
                </View>
              </View>

              <Text style={styles.routineMeds}>
                {dose.medications.map((m) => `${m.name} ${m.dosage}`).join('\n')}
              </Text>
            </View>
          );
        })}

        <Text style={styles.footerNote}>{t('schedule.toChange')}</Text>
        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenEdge,
  },
  greeting: {
    paddingTop: 18,
    paddingBottom: 8,
  },
  greetingName: {
    fontSize: 28,
    fontFamily: 'Manrope_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  greetingDate: {
    ...typography.helper,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
    marginTop: 20,
    marginBottom: 10,
  },
  routineCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
    ...shadows.card,
    position: 'relative',
  },
  routineCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  routineHeaderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  routineTimeBlock: {
    gap: 2,
  },
  routineTime: {
    fontSize: 24,
    fontFamily: 'Manrope_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  routineLabel: {
    ...typography.helper,
    color: colors.textSecondary,
  },
  routineAnchor: {
    ...typography.helper,
    color: colors.primary,
    backgroundColor: colors.bgSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.badge,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    marginTop: 4,
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
  },
  routineMeds: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 24,
    fontSize: 15,
  },
  footerNote: {
    ...typography.helper,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  bottomPad: {
    height: 20,
  },
});
