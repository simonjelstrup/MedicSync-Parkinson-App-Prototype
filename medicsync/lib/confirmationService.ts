import { useHistoryStore } from '../stores/historyStore';
import { useScheduleStore } from '../stores/scheduleStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTodayStore } from '../stores/todayStore';
import { addMinutes, computeDoseEffectiveScheduledTime, todayString } from './scheduleUtils';
import { cancelDoseAlarm, scheduleOkToEat } from './alarmScheduler';
import i18n from './i18n';
import type { DoseLog } from './mockData';

function currentTimeString(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function computeEatTime(doseId: string, takenAt: string): string | null {
  const dose = useScheduleStore.getState().doses.find((d) => d.id === doseId);
  if (!dose) return null;
  if (dose.timingMode === 'meal' && dose.mealAnchor.relation === 'before') {
    return addMinutes(takenAt, dose.mealAnchor.minutes);
  }
  return null;
}

export async function confirmDose(
  doseId: string,
  method: 'nfc' | 'manual',
  takenAt?: string
): Promise<{ eatTime: string | null }> {
  const now = takenAt ?? currentTimeString();
  const doses = useScheduleStore.getState().doses;
  const mealTimes = useSettingsStore.getState().mealTimes;
  const mealAdjustments = useTodayStore.getState().mealAdjustments;
  const dose = doses.find((d) => d.id === doseId);

  const scheduledTime = dose
    ? computeDoseEffectiveScheduledTime(dose, mealTimes, mealAdjustments)
    : '00:00';

  const doseName = dose ? `${dose.label} ${i18n.t('dose.suffix')}` : doseId;

  const log: DoseLog = {
    id: `${doseId}-${Date.now()}`,
    doseId,
    date: todayString(),
    scheduledTime,
    takenAt: now,
    method,
    status: method === 'nfc' ? 'taken' : 'manual',
    doseName,
  };

  useHistoryStore.getState().logDose(log);
  await cancelDoseAlarm(doseId);

  if (dose?.timingMode === 'meal' && dose.mealAnchor.relation === 'before') {
    await scheduleOkToEat(doseId, now, dose.mealAnchor.minutes);
  }

  return { eatTime: computeEatTime(doseId, now) };
}
