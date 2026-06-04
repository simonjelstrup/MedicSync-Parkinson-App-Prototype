import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useScheduleStore } from '../stores/scheduleStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTodayStore } from '../stores/todayStore';
import { useHistoryStore } from '../stores/historyStore';
import {
  computeDoseEffectiveScheduledTime,
  computeDoseScheduledTime,
  computeEffectiveMealTime,
  todayString,
} from './scheduleUtils';
import { NOTIFICATION_SOUND_FILE } from './soundManager';
import i18n from './i18n';
import type { MealTimes } from '../stores/settingsStore';
import type { StoredDose } from '../stores/scheduleStore';
import type { MealAdjustment } from '../stores/todayStore';

export function alarmIdentifier(doseId: string): string {
  return `dose-alarm-${doseId}`;
}

export function alarmRepeatIdentifier(doseId: string, n: number): string {
  return `dose-alarm-${doseId}-r${n}`;
}

export function okToEatIdentifier(doseId: string): string {
  return `ok-to-eat-${doseId}`;
}

function buildNotificationBody(
  dose: StoredDose,
  mealTimes: MealTimes,
  mealAdjustments: Record<string, MealAdjustment>
): { subtitle: string; body: string } {
  const medications = dose.medications.map((m) => `${m.name} ${m.dosage}`).join(' · ');

  let context = '';
  if (dose.timingMode === 'fixed') {
    context = i18n.t('schedule.anchorAt', { time: dose.fixedTime });
  } else {
    const { meal, relation, minutes } = dose.mealAnchor;
    const mealName = i18n.t(`settings.${meal}`).toLowerCase();
    const relText = i18n.t(`doseEditor.${relation}`);
    const minLabel = minutes >= 60 ? i18n.t('doseEditor.oneHour') : `${minutes} min`;
    const effectiveMealTime = computeEffectiveMealTime(meal, mealTimes, mealAdjustments);
    context = `${minLabel} ${relText} ${mealName} · ${effectiveMealTime}`;
  }

  // iOS shows subtitle + body separately; Android combines them
  if (Platform.OS === 'ios') {
    return { subtitle: medications, body: context };
  }
  return { subtitle: medications, body: context ? `${medications}\n${context}` : medications };
}

export async function scheduleAllAlarms(): Promise<void> {
  const doses = useScheduleStore.getState().doses;
  const mealTimes = useSettingsStore.getState().mealTimes;
  const mealAdjustments = useTodayStore.getState().mealAdjustments;
  const activeProfileId = useTodayStore.getState().activeProfile;
  const profile = useSettingsStore.getState().profiles[activeProfileId];
  const today = todayString();
  const confirmedIds = new Set(
    useHistoryStore
      .getState()
      .logs.filter((l) => l.date === today && (l.status === 'taken' || l.status === 'manual'))
      .map((l) => l.doseId)
  );

  const now = new Date();

  for (const dose of doses) {
    if (confirmedIds.has(dose.id)) {
      await Notifications.cancelScheduledNotificationAsync(alarmIdentifier(dose.id));
      for (let n = 1; n <= 5; n++) {
        await Notifications.cancelScheduledNotificationAsync(alarmRepeatIdentifier(dose.id, n));
      }
      continue;
    }

    const effectiveTime = computeDoseEffectiveScheduledTime(dose, mealTimes, mealAdjustments);
    const [h, m] = effectiveTime.split(':').map(Number);
    const trigger = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);

    if (trigger <= now) continue;

    const { subtitle, body } = buildNotificationBody(dose, mealTimes, mealAdjustments);

    const alarmContent = {
      title: i18n.t('alarm.kicker'),
      subtitle,
      body,
      data: { doseId: dose.id, type: 'dose-alarm' },
      sound: NOTIFICATION_SOUND_FILE[profile.sound],
      categoryIdentifier: 'dose-alarm',
    };

    await Notifications.scheduleNotificationAsync({
      identifier: alarmIdentifier(dose.id),
      content: alarmContent,
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
    });

    // Repeat every minute for 5 minutes so the alarm keeps ringing on the lock screen
    for (let n = 1; n <= 5; n++) {
      const repeatTrigger = new Date(trigger.getTime() + n * 60 * 1000);
      if (repeatTrigger > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: alarmRepeatIdentifier(dose.id, n),
          content: alarmContent,
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: repeatTrigger },
        });
      }
    }
  }
}

export async function cancelDoseAlarm(doseId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(alarmIdentifier(doseId));
  for (let n = 1; n <= 5; n++) {
    await Notifications.cancelScheduledNotificationAsync(alarmRepeatIdentifier(doseId, n));
  }
}

export async function scheduleOkToEat(
  doseId: string,
  takenAt: string,
  minutesOffset: number
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(okToEatIdentifier(doseId));

  const [h, m] = takenAt.split(':').map(Number);
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
  const fireAt = new Date(base.getTime() + minutesOffset * 60 * 1000);

  if (fireAt <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: okToEatIdentifier(doseId),
    content: {
      title: i18n.t('eat.title'),
      body: i18n.t('notifications.okToEatBody'),
      data: { type: 'ok-to-eat', doseId },
      sound: 'default',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
  });
}

export function logMissedDoses(): void {
  const doses = useScheduleStore.getState().doses;
  const mealTimes = useSettingsStore.getState().mealTimes;
  const mealAdjustments = useTodayStore.getState().mealAdjustments;
  const today = todayString();
  const existingLogs = useHistoryStore.getState().logs.filter((l) => l.date === today);

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  for (const dose of doses) {
    if (existingLogs.some((l) => l.doseId === dose.id)) continue;

    const effectiveTime = computeDoseEffectiveScheduledTime(dose, mealTimes, mealAdjustments);
    const [h, m] = effectiveTime.split(':').map(Number);

    if (nowMin >= h * 60 + m + 30) {
      useHistoryStore.getState().logDose({
        id: `missed-${dose.id}-${today}`,
        doseId: dose.id,
        date: today,
        scheduledTime: effectiveTime,
        takenAt: null,
        method: null,
        status: 'missed',
        doseName: `${dose.label} ${i18n.t('dose.suffix')}`,
      });
    }
  }
}

export function logMissedDosesForDate(date: string): void {
  const doses = useScheduleStore.getState().doses;
  const mealTimes = useSettingsStore.getState().mealTimes;
  const existingLogs = useHistoryStore.getState().logs.filter((l) => l.date === date);

  for (const dose of doses) {
    if (existingLogs.some((l) => l.doseId === dose.id)) continue;

    useHistoryStore.getState().logDose({
      id: `missed-${dose.id}-${date}`,
      doseId: dose.id,
      date,
      scheduledTime: computeDoseScheduledTime(dose, mealTimes),
      takenAt: null,
      method: null,
      status: 'missed',
      doseName: `${dose.label} ${i18n.t('dose.suffix')}`,
    });
  }
}
