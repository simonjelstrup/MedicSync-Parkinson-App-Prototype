import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radii, shadows } from '../../lib/theme';
import { useSettingsStore, type AlarmProfile } from '../../stores/settingsStore';
import { useComputedDoses } from '../../lib/scheduleUtils';
import type { DoseTime } from '../../lib/mockData';
import { TimePickerSheet } from '../../components/TimePickerSheet';
import { LanguagePickerSheet } from '../../components/LanguagePickerSheet';
import { type BottomSheetRef } from '../../components/primitives';
import {
  PlusIcon,
  EditIcon,
  ChevronRightIcon,
  SunriseIcon,
  SunFullIcon,
  MoonIcon,
  HomeProfileIcon,
  OutdoorsProfileIcon,
  GlobeIcon,
  BellIcon,
  ShieldCheckIcon,
  PersonIcon,
} from '../../components/svg/Icons';
import { Toggle } from '../../components/primitives';
import i18n from '../../lib/i18n';
import { useState } from 'react';

const DOSE_LABEL_KEYS: Record<string, string> = {
  Morning: 'dose.morning',
  Lunch: 'dose.lunch',
  Afternoon: 'dose.afternoon',
  Night: 'dose.night',
};

function profileSummary(profile: AlarmProfile, t: ReturnType<typeof useTranslation>['t']): string {
  return `${t(`sound.${profile.sound}`)} · ${t(`profile.${profile.escalation}`)}`;
}

function anchorLabel(dose: DoseTime, t: ReturnType<typeof useTranslation>['t']): string {
  if (dose.timingMode === 'fixed') return t('schedule.anchorAt', { time: dose.fixedTime });
  const { meal, relation, minutes } = dose.mealAnchor;
  const mealName = t(`doseEditor.${meal}Meal`);
  if (minutes === 0) return t('doseEditor.withMeal');
  const rel = t(`doseEditor.${relation}`);
  if (minutes === 60) return `${t('doseEditor.oneHour')} ${rel} ${mealName}`;
  return `${minutes} min ${rel} ${mealName}`;
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function SettingsSection({ children }: { children: React.ReactNode }) {
  return <View style={styles.settingsSection}>{children}</View>;
}

type SettingsRowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  arrow?: boolean;
  right?: React.ReactNode;
  onPress?: () => void;
};

function SettingsRow({ icon, title, subtitle, value, arrow, right, onPress }: SettingsRowProps) {
  const inner = (
    <>
      <View style={styles.settingsIconBox}>{icon}</View>
      <View style={styles.settingsText}>
        <Text style={styles.settingsTitle}>{title}</Text>
        {subtitle ? <Text style={styles.settingsSub}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={styles.settingsValue}>{value}</Text> : null}
      {arrow ? <ChevronRightIcon color={colors.textTertiary} size={16} /> : null}
      {right}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.settingsRow, pressed && styles.settingsRowPressed]}
      >
        {inner}
      </Pressable>
    );
  }
  return <View style={styles.settingsRow}>{inner}</View>;
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Store values
  const mealTimes = useSettingsStore((s) => s.mealTimes);
  const profiles = useSettingsStore((s) => s.profiles);
  const setMealTime = useSettingsStore((s) => s.setMealTime);
  const setRelativesEnabled = useSettingsStore((s) => s.setRelativesEnabled);
  const relativesEnabled = useSettingsStore((s) => s.relativesEnabled);
  const relativesNotifyMissedAfterMin = useSettingsStore((s) => s.relativesNotifyMissedAfterMin);
  const setRelativesNotifyMissedAfterMin = useSettingsStore((s) => s.setRelativesNotifyMissedAfterMin);

  const allDoses = useComputedDoses();
  const doses = [...allDoses].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const [activeMeal, setActiveMeal] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const breakfastRowRef = useRef<View>(null);
  const lunchRowRef = useRef<View>(null);
  const dinnerRowRef = useRef<View>(null);
  const timePickerRef = useRef<BottomSheetRef>(null);
  const languageRef = useRef<BottomSheetRef>(null);

  const openMealPicker = (meal: 'breakfast' | 'lunch' | 'dinner', rowRef: React.RefObject<View | null>) => {
    setActiveMeal(meal);
    rowRef.current?.measure((_x, _y, _w, h, _pageX, pageY) => {
      const windowHeight = Dimensions.get('window').height;
      const sheetHeight = windowHeight * 0.52;
      const desiredPageY = windowHeight - sheetHeight - h - 16;
      if (pageY > desiredPageY) {
        scrollRef.current?.scrollTo({
          y: scrollY.current + (pageY - desiredPageY),
          animated: true,
        });
      }
    });
    timePickerRef.current?.present();
  };

  const currentLang = i18n.language === 'da' ? 'Dansk' : 'English';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => { scrollY.current = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={16}
      >
        <View style={styles.greeting}>
          <Text style={styles.greetingName}>{t('nav.settings')}</Text>
        </View>

        <SectionLabel label={t('settings.yourDoses')} />
        {doses.map((dose) => (
          <Pressable
            key={dose.id}
            style={styles.doseEditorCard}
            onPress={() =>
              router.push({ pathname: '/dose-editor', params: { doseId: dose.id } })
            }
          >
            <View style={styles.doseEditorHead}>
              <View style={styles.doseEditorTimeBlock}>
                <Text style={styles.doseEditorTime}>{dose.scheduledTime}</Text>
                <Text style={styles.doseEditorLabel}>
                  {DOSE_LABEL_KEYS[dose.label] ? t(DOSE_LABEL_KEYS[dose.label]) : dose.label}
                </Text>
              </View>
              <Pressable
                hitSlop={8}
                onPress={() =>
                  router.push({ pathname: '/dose-editor', params: { doseId: dose.id } })
                }
                style={styles.doseEditorEditBtn}
              >
                <EditIcon color={colors.textSecondary} size={18} />
              </Pressable>
            </View>
            <Text style={styles.doseEditorAnchor}>{anchorLabel(dose, t)}</Text>
            <Text style={styles.doseEditorMeds}>
              {dose.medications.map((m) => `${m.name} ${m.dosage}`).join('\n')}
            </Text>
          </Pressable>
        ))}

        <Pressable
          style={styles.addDoseBtn}
          onPress={() => router.push({ pathname: '/dose-editor', params: { doseId: `new_${Date.now()}` } })}
        >
          <PlusIcon color={colors.primary} size={16} />
          <Text style={styles.addDoseBtnText}>{t('settings.addDose')}</Text>
        </Pressable>

        <SectionLabel label={t('settings.defaultMealTimes')} />
        <SettingsSection>
          <View ref={breakfastRowRef} collapsable={false}>
            <SettingsRow
              icon={<SunriseIcon color={colors.textSecondary} size={18} />}
              title={t('settings.breakfast')}
              value={mealTimes.breakfast}
              arrow
              onPress={() => openMealPicker('breakfast', breakfastRowRef)}
            />
          </View>
          <View style={styles.rowDivider} />
          <View ref={lunchRowRef} collapsable={false}>
            <SettingsRow
              icon={<SunFullIcon color={colors.textSecondary} size={18} />}
              title={t('settings.lunch')}
              value={mealTimes.lunch}
              arrow
              onPress={() => openMealPicker('lunch', lunchRowRef)}
            />
          </View>
          <View style={styles.rowDivider} />
          <View ref={dinnerRowRef} collapsable={false}>
            <SettingsRow
              icon={<MoonIcon color={colors.textSecondary} size={18} />}
              title={t('settings.dinner')}
              value={mealTimes.dinner}
              arrow
              onPress={() => openMealPicker('dinner', dinnerRowRef)}
            />
          </View>
        </SettingsSection>

        <SectionLabel label={t('settings.alarmProfiles')} />
        <SettingsSection>
          <SettingsRow
            icon={<HomeProfileIcon color={colors.textSecondary} size={18} />}
            title={t('profile.home')}
            subtitle={profileSummary(profiles.home, t)}
            arrow
            onPress={() =>
              router.push({ pathname: '/profile-editor', params: { profile: 'home' } })
            }
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon={<OutdoorsProfileIcon color={colors.textSecondary} size={18} />}
            title={t('profile.outdoors')}
            subtitle={profileSummary(profiles.outdoors, t)}
            arrow
            onPress={() =>
              router.push({ pathname: '/profile-editor', params: { profile: 'outdoors' } })
            }
          />
        </SettingsSection>

        <SectionLabel label={t('settings.language')} />
        <SettingsSection>
          <SettingsRow
            icon={<GlobeIcon color={colors.textSecondary} size={18} />}
            title={t('settings.language')}
            subtitle={currentLang}
            arrow
            onPress={() => languageRef.current?.present()}
          />
        </SettingsSection>

        <SectionLabel label={t('settings.pillbox')} />
        <SettingsSection>
          <SettingsRow
            icon={<ShieldCheckIcon color={colors.primary} size={18} />}
            title={t('settings.pillboxLocation')}
            subtitle={t('settings.pillboxSub')}
            arrow
            onPress={() => router.push('/pillbox-location')}
          />
        </SettingsSection>

        <SectionLabel label={t('settings.account')} />
        <SettingsSection>
          <SettingsRow
            icon={<GlobeIcon color={colors.textSecondary} size={18} />}
            title={t('settings.accountSignedOut')}
            subtitle={t('settings.accountSignedOutSub')}
            arrow
            onPress={() => {}}
          />
        </SettingsSection>

        <SectionLabel label={t('settings.relatives')} />
        <SettingsSection>
          <View style={styles.settingsRow}>
            <View style={styles.settingsIconBox}>
              <BellIcon color={colors.textSecondary} size={18} />
            </View>
            <View style={styles.settingsText}>
              <Text style={styles.settingsTitle}>{t('settings.notifyMissed')}</Text>
            </View>
            <Toggle
              value={relativesEnabled}
              onValueChange={setRelativesEnabled}
              activeColor={colors.primary}
            />
          </View>
          {relativesEnabled && (
            <View style={styles.notifyMinRow}>
              {([5, 15, 30, 60] as const).map((min) => (
                <Pressable
                  key={min}
                  style={[styles.notifyMinOpt, relativesNotifyMissedAfterMin === min && styles.notifyMinOptActive]}
                  onPress={() => setRelativesNotifyMissedAfterMin(min)}
                >
                  <Text style={[styles.notifyMinText, relativesNotifyMissedAfterMin === min && styles.notifyMinTextActive]}>
                    {min >= 60 ? t('doseEditor.oneHour') : `${min} min`}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          <View style={styles.rowDivider} />
          <SettingsRow
            icon={<PersonIcon color={colors.textSecondary} size={18} />}
            title={t('settings.relativesView')}
            subtitle="Erik Andersen"
            arrow
            onPress={() => router.push('/relatives')}
          />
        </SettingsSection>

        <View style={styles.bottomPad} />
      </ScrollView>

      <TimePickerSheet
        ref={timePickerRef}
        meal={activeMeal}
        scope="default"
        initialTime={mealTimes[activeMeal]}
        onSave={(time) => setMealTime(activeMeal, time)}
      />
      <LanguagePickerSheet ref={languageRef} />
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
  sectionLabel: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
    marginTop: 20,
    marginBottom: 10,
  },
  settingsSection: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.cardPadding,
    minHeight: spacing.tapMin,
    gap: spacing.md,
  },
  settingsRowPressed: {
    backgroundColor: colors.bgSoft,
  },
  settingsIconBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  settingsTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
  },
  settingsSub: {
    ...typography.helper,
    color: colors.textSecondary,
    marginTop: 1,
  },
  settingsValue: {
    ...typography.helper,
    color: colors.textSecondary,
    fontFamily: 'Manrope_600SemiBold',
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.borderDividerSoft,
    marginLeft: spacing.cardPadding + 32 + spacing.md,
  },
  doseEditorCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.cardPadding,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  doseEditorHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  doseEditorTimeBlock: {
    gap: 1,
  },
  doseEditorTime: {
    fontSize: 20,
    fontFamily: 'Manrope_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  doseEditorLabel: {
    ...typography.helper,
    color: colors.textSecondary,
  },
  doseEditorEditBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doseEditorAnchor: {
    ...typography.helper,
    color: colors.primary,
    marginBottom: 4,
    fontSize: 13,
  },
  doseEditorMeds: {
    ...typography.helper,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  addDoseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 44,
    paddingHorizontal: spacing.cardPadding,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  addDoseBtnText: {
    ...typography.helper,
    color: colors.primary,
    fontFamily: 'Manrope_600SemiBold',
  },
  notifyMinRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.cardPadding,
    paddingBottom: spacing.md,
  },
  notifyMinOpt: {
    flex: 1,
    height: 36,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  notifyMinOptActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  notifyMinText: {
    fontSize: 13,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.textSecondary,
  },
  notifyMinTextActive: {
    color: colors.primaryTextOn,
  },
  bottomPad: {
    height: 20,
  },
});
