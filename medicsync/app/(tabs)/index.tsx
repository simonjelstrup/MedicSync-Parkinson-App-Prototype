import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { confirmDose } from '../../lib/confirmationService';
import { colors, typography, spacing, radii, shadows } from '../../lib/theme';
import { useTodayStore } from '../../stores/todayStore';
import { useSettingsStore } from '../../stores/settingsStore';
import {
  useTodayDoses,
  computeEffectiveMealTime,
  addMinutes,
  timeUntil,
} from '../../lib/scheduleUtils';
import { useSilence } from '../../contexts/SilenceContext';
import { Badge } from '../../components/primitives';
import { DoseSilenceBell } from '../../components/DoseSilenceBell';
import { TimePickerSheet } from '../../components/TimePickerSheet';
import { TakenEarlySheet } from '../../components/TakenEarlySheet';
import { type BottomSheetRef } from '../../components/primitives';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  HomeProfileIcon,
  OutdoorsProfileIcon,
  BellIcon,
} from '../../components/svg/Icons';
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'greeting.morning';
  if (hour < 17) return 'greeting.afternoon';
  return 'greeting.evening';
}

const DOSE_LABEL_KEYS: Record<string, string> = {
  Morning: 'dose.morning',
  Lunch: 'dose.lunch',
  Afternoon: 'dose.afternoon',
  Night: 'dose.night',
};

function formatDate(language: string): string {
  const locale = language === 'da' ? 'da-DK' : 'en-GB';
  const d = new Date();
  const result = d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { toggleSilence, isSilenced } = useSilence();

  const [expanded, setExpanded] = useState(true);

  const timePickerRef = useRef<BottomSheetRef>(null);
  const takenEarlyRef = useRef<BottomSheetRef>(null);

  // Store values
  const mealTimes = useSettingsStore((s) => s.mealTimes);
  const mealAdjustments = useTodayStore((s) => s.mealAdjustments);
  const setMealAdjustment = useTodayStore((s) => s.setMealAdjustment);
  const activeProfile = useTodayStore((s) => s.activeProfile);
  const setActiveProfile = useTodayStore((s) => s.setActiveProfile);

  // Today's dose entries (live status)
  const todayEntries = useTodayDoses();
  const nextEntry = todayEntries.find((e) => e.status === 'upcoming');
  const nextDose = nextEntry?.dose ?? null;

  // Effective meal time / reminder time for the next dose
  const isMealRelative = nextDose?.timingMode !== 'fixed';
  const anchorMeal = nextDose?.mealAnchor.meal ?? 'lunch';
  const effectiveMealTime = computeEffectiveMealTime(anchorMeal, mealTimes, mealAdjustments);
  const adj = mealAdjustments[anchorMeal];
  const selectedShift = adj?.shiftMinutes && !adj.customTime ? adj.shiftMinutes : null;
  const shiftActive = !!adj;

  const reminderTime = nextDose
    ? nextDose.timingMode === 'fixed'
      ? nextDose.fixedTime
      : addMinutes(effectiveMealTime, nextDose.mealAnchor.relation === 'before' ? -nextDose.mealAnchor.minutes : nextDose.mealAnchor.minutes)
    : effectiveMealTime;

  const nextDoseSilenced = nextDose ? isSilenced(nextDose.id) : false;

  const handleShift = (shift: number) => {
    if (selectedShift === shift) {
      setMealAdjustment(anchorMeal, null);
    } else {
      setMealAdjustment(anchorMeal, { shiftMinutes: shift });
    }
  };

  const handleResetShift = () => {
    setMealAdjustment(anchorMeal, null);
  };

  const handleSaveMealTime = (time: string) => {
    setMealAdjustment(anchorMeal, { customTime: time });
  };

  const handleTakenEarly = async (time: string) => {
    if (!nextDose) return;
    const { eatTime } = await confirmDose(nextDose.id, 'manual', time);
    router.push({ pathname: '/confirmed', params: { doseId: nextDose.id, method: 'manual', eatTime: eatTime ?? '' } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greeting}>
          <Text style={styles.greetingEyebrow}>{t(getGreeting())}</Text>
          <Text style={styles.greetingName}>Kurt</Text>
          <Text style={styles.greetingDate}>{formatDate(i18n.language)}</Text>
        </View>

        <Text style={styles.sectionLabel}>{t('home.nextDose')}</Text>

        {nextDose ? (
          <View style={styles.nextCard}>
            <Pressable style={styles.nextCardHeader} onPress={() => setExpanded((e) => !e)}>
              <View style={styles.nextCardMeds}>
                <Text style={styles.nextCardEyebrow}>
                  {t('home.inTime', { time: timeUntil(reminderTime) })}
                </Text>
                {nextDose.medications.map((med) => (
                  <Text key={med.id} style={styles.nextCardMed}>
                    {med.name} {med.dosage}
                  </Text>
                ))}
                <Text style={styles.nextCardTime}>
                  {isMealRelative
                    ? t('home.reminderAt', {
                        remind: reminderTime,
                        meal: effectiveMealTime,
                        mealName: t(`settings.${anchorMeal}`).toLowerCase(),
                      })
                    : t('home.inTime', { time: timeUntil(reminderTime) })}
                </Text>
              </View>
              <View style={styles.chevronWrap}>
                {expanded ? (
                  <ChevronUpIcon color={colors.primary} size={14} />
                ) : (
                  <ChevronDownIcon color={colors.primary} size={14} />
                )}
              </View>
            </Pressable>

            <Pressable
              style={styles.takenEarlyBtn}
              onPress={() => takenEarlyRef.current?.present()}
            >
              <ClockIcon color={colors.primaryDarkerText} size={16} />
              <Text style={styles.takenEarlyText}>{t('home.doseTakenEarly')}</Text>
            </Pressable>

            {expanded && (
              <View style={styles.expandable}>
                <View style={styles.divider} />

                {isMealRelative && (
                  <>
                    <Text style={styles.subLabel}>{t('home.shiftMealTime', { meal: t(`settings.${anchorMeal}`).toLowerCase() })}</Text>
                    <View style={styles.shiftRow}>
                      {([15, 30, 45] as const).map((shift) => (
                        <Pressable
                          key={shift}
                          style={[styles.shiftBtn, selectedShift === shift && styles.shiftBtnActive]}
                          onPress={() => handleShift(shift)}
                        >
                          <Text
                            style={[
                              styles.shiftBtnText,
                              selectedShift === shift && styles.shiftBtnTextActive,
                            ]}
                          >
                            +{shift} min
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Pressable
                      style={styles.setExactTimeBtn}
                      onPress={() => timePickerRef.current?.present()}
                    >
                      <ClockIcon color={colors.textSecondary} size={16} />
                      <Text style={styles.setExactTimeText}>{t('home.setExactTime')}</Text>
                    </Pressable>

                    {shiftActive && (
                      <View style={styles.shiftFeedback}>
                        <Text style={styles.shiftFeedbackText}>
                          {t('home.mealShiftedTo', { meal: t(`settings.${anchorMeal}`) })}{' '}
                          <Text style={styles.shiftFeedbackTime}>{effectiveMealTime}</Text>
                        </Text>
                        <Pressable onPress={handleResetShift}>
                          <Text style={styles.resetBtn}>{t('action.reset')}</Text>
                        </Pressable>
                      </View>
                    )}
                  </>
                )}

                <Text style={styles.subLabel}>{t('home.alarmSound')}</Text>
                <View style={styles.profileRow}>
                  <Pressable
                    style={[
                      styles.profileBtn,
                      activeProfile === 'home' && styles.profileBtnActive,
                    ]}
                    onPress={() => setActiveProfile('home')}
                  >
                    <HomeProfileIcon
                      color={
                        activeProfile === 'home' ? colors.primaryTextOn : colors.textSecondary
                      }
                      size={16}
                    />
                    <Text
                      style={[
                        styles.profileBtnText,
                        activeProfile === 'home' && styles.profileBtnTextActive,
                      ]}
                    >
                      {t('profile.home')}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.profileBtn,
                      activeProfile === 'outdoors' && styles.profileBtnActive,
                    ]}
                    onPress={() => setActiveProfile('outdoors')}
                  >
                    <OutdoorsProfileIcon
                      color={
                        activeProfile === 'outdoors' ? colors.primaryTextOn : colors.textSecondary
                      }
                      size={16}
                    />
                    <Text
                      style={[
                        styles.profileBtnText,
                        activeProfile === 'outdoors' && styles.profileBtnTextActive,
                      ]}
                    >
                      {t('profile.outdoors')}
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  style={[styles.silenceRow, nextDoseSilenced && styles.silenceRowActive]}
                  onPress={() => nextDose && toggleSilence(nextDose.id)}
                >
                  <View
                    style={[
                      styles.silenceIconCircle,
                      nextDoseSilenced && styles.silenceIconCircleActive,
                    ]}
                  >
                    <BellIcon color="white" size={18} silenced={nextDoseSilenced} />
                  </View>
                  <Text
                    style={[styles.silenceLabel, nextDoseSilenced && styles.silenceLabelActive]}
                  >
                    {nextDoseSilenced ? t('home.silenced') : t('home.silenceThisAlarm')}
                  </Text>
                  <View
                    style={[styles.toggleTrack, nextDoseSilenced && styles.toggleTrackActive]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        nextDoseSilenced && styles.toggleThumbActive,
                      ]}
                    />
                  </View>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.nextCard, styles.noNextCard]}>
            <Text style={styles.noNextText}>
              {todayEntries.length === 0 ? t('home.noDoses') : t('home.allDone')}
            </Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>{t('home.allDosesToday')}</Text>

        <View style={styles.doseList}>
          {todayEntries.map((entry, idx) => {
            const isLast = idx === todayEntries.length - 1;
            const dotColor =
              entry.status === 'taken' || entry.status === 'manual'
                ? colors.positive
                : entry.status === 'upcoming'
                ? colors.primary
                : entry.status === 'missed'
                ? colors.error
                : colors.border;

            const silenced = isSilenced(entry.dose.id);
            const showBell = entry.status === 'upcoming' || entry.status === 'scheduled';

            return (
              <View
                key={entry.dose.id}
                style={[styles.doseRow, !isLast && styles.doseRowBorder]}
              >
                <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
                <View style={styles.doseInfo}>
                  <Text style={styles.doseTime}>{entry.effectiveTime}</Text>
                  <Text style={styles.doseName}>
                    {DOSE_LABEL_KEYS[entry.dose.label] ? t(DOSE_LABEL_KEYS[entry.dose.label]) : entry.dose.label} {t('dose.suffix')}
                  </Text>
                </View>
                {showBell && (
                  <DoseSilenceBell
                    silenced={silenced}
                    onToggle={() => toggleSilence(entry.dose.id)}
                    accessibilityLabel={`Silence ${entry.dose.label} dose`}
                  />
                )}
                <Badge status={entry.status === 'taken' ? 'taken' : entry.status === 'manual' ? 'manual' : entry.status === 'upcoming' ? 'upcoming' : entry.status === 'missed' ? 'missed' : 'scheduled'} />
              </View>
            );
          })}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {nextDose && (
        <>
          <TimePickerSheet
            ref={timePickerRef}
            meal={anchorMeal}
            scope="today"
            initialTime={effectiveMealTime}
            onSave={handleSaveMealTime}
          />
          <TakenEarlySheet
            ref={takenEarlyRef}
            medications={nextDose.medications.map((m) => `${m.name} ${m.dosage}`)}
            onConfirm={handleTakenEarly}
          />
        </>
      )}
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
  greetingEyebrow: {
    ...typography.helper,
    color: colors.textTertiary,
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
  nextCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  noNextCard: {
    padding: spacing.cardPadding,
    alignItems: 'center',
  },
  noNextText: {
    ...typography.helper,
    color: colors.textSecondary,
  },
  nextCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.cardPadding,
  },
  nextCardMeds: {
    flex: 1,
  },
  nextCardEyebrow: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
    marginBottom: 6,
    textTransform: 'none' as const,
  },
  nextCardMed: {
    fontSize: 20,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.textPrimary,
    lineHeight: 28,
  },
  nextCardTime: {
    ...typography.helper,
    color: colors.textSecondary,
    marginTop: 6,
  },
  chevronWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  takenEarlyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: spacing.cardPadding,
    marginBottom: spacing.md,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
  },
  takenEarlyText: {
    ...typography.helper,
    color: colors.primaryDarkerText,
  },
  expandable: {
    paddingHorizontal: spacing.cardPadding,
    paddingBottom: spacing.cardPadding,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderDivider,
    marginBottom: spacing.lg,
  },
  subLabel: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  shiftRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  shiftBtn: {
    flex: 1,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shiftBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  shiftBtnText: {
    ...typography.helper,
    color: colors.textSecondary,
  },
  shiftBtnTextActive: {
    color: colors.primaryTextOn,
    fontFamily: 'Manrope_600SemiBold',
  },
  setExactTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  setExactTimeText: {
    ...typography.helper,
    color: colors.textSecondary,
  },
  shiftFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSoft,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  shiftFeedbackText: {
    ...typography.helper,
    color: colors.textSecondary,
  },
  shiftFeedbackTime: {
    fontFamily: 'Manrope_600SemiBold',
    color: colors.textPrimary,
  },
  resetBtn: {
    ...typography.helper,
    color: colors.primary,
    fontFamily: 'Manrope_600SemiBold',
  },
  profileRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  profileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  profileBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  profileBtnText: {
    ...typography.helper,
    color: colors.textSecondary,
  },
  profileBtnTextActive: {
    color: colors.primaryTextOn,
    fontFamily: 'Manrope_600SemiBold',
  },
  silenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 54,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  silenceRowActive: {
    backgroundColor: colors.bgNeutral,
    borderColor: colors.borderStrong,
  },
  silenceIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  silenceIconCircleActive: {
    backgroundColor: colors.textMuted,
  },
  silenceLabel: {
    flex: 1,
    ...typography.helper,
    color: colors.textPrimary,
  },
  silenceLabelActive: {
    color: colors.textMuted,
  },
  toggleTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    padding: 3,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: colors.textMuted,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  doseList: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.cardPadding,
    minHeight: spacing.tapMin,
    gap: spacing.sm,
  },
  doseRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDividerSoft,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  doseInfo: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  doseTime: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.textPrimary,
  },
  doseName: {
    ...typography.helper,
    color: colors.textSecondary,
    marginTop: 1,
  },
  bottomPad: {
    height: 20,
  },
});
