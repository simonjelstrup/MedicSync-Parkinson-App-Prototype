import { useScheduleStore, type StoredDose, type MealAnchor } from '../stores/scheduleStore';
import { useSettingsStore, type MealTimes } from '../stores/settingsStore';
import { useHistoryStore } from '../stores/historyStore';
import { useTodayStore, type MealAdjustment } from '../stores/todayStore';
import type { DoseLog, DoseStatus, DoseTime } from './mockData';
import i18n from './i18n';

export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const adjusted = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(adjusted / 60)).padStart(2, '0')}:${String(adjusted % 60).padStart(2, '0')}`;
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function computeScheduledTime(anchor: MealAnchor, mealTimes: MealTimes): string {
  const base = mealTimes[anchor.meal];
  const offset = anchor.relation === 'before' ? -anchor.minutes : anchor.minutes;
  return addMinutes(base, offset);
}

export function computeEffectiveMealTime(
  meal: keyof MealTimes,
  mealTimes: MealTimes,
  mealAdjustments: Record<string, MealAdjustment>
): string {
  const base = mealTimes[meal];
  const adj = mealAdjustments[meal];
  if (!adj) return base;
  if (adj.customTime) return adj.customTime;
  if (adj.shiftMinutes) return addMinutes(base, adj.shiftMinutes);
  return base;
}

export function computeEffectiveScheduledTime(
  anchor: MealAnchor,
  mealTimes: MealTimes,
  mealAdjustments: Record<string, MealAdjustment>
): string {
  const effectiveMeal = computeEffectiveMealTime(anchor.meal, mealTimes, mealAdjustments);
  const offset = anchor.relation === 'before' ? -anchor.minutes : anchor.minutes;
  return addMinutes(effectiveMeal, offset);
}

export function timeUntil(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  const targetMin = h * 60 + m;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const diff = targetMin - nowMin;
  if (diff <= 0) return 'now';
  const hSuffix = i18n.language === 'da' ? 't' : 'h';
  if (diff < 60) return `${diff}m`;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return mins > 0 ? `${hours}${hSuffix} ${mins}m` : `${hours}${hSuffix}`;
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const locale = i18n.language === 'da' ? 'da-DK' : 'en-GB';
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
}

export function computeDoseScheduledTime(dose: StoredDose, mealTimes: MealTimes): string {
  if (dose.timingMode === 'fixed') return dose.fixedTime;
  return computeScheduledTime(dose.mealAnchor, mealTimes);
}

export function computeDoseEffectiveScheduledTime(
  dose: StoredDose,
  mealTimes: MealTimes,
  mealAdjustments: Record<string, MealAdjustment>
): string {
  if (dose.timingMode === 'fixed') return dose.fixedTime;
  return computeEffectiveScheduledTime(dose.mealAnchor, mealTimes, mealAdjustments);
}

// Doses with scheduledTime computed from default meal times (no today adjustments)
// Used by Schedule tab
export function useComputedDoses(): DoseTime[] {
  const storedDoses = useScheduleStore((s) => s.doses);
  const mealTimes = useSettingsStore((s) => s.mealTimes);
  return storedDoses
    .map((d) => ({ ...d, scheduledTime: computeDoseScheduledTime(d, mealTimes) }))
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
}

export type TodayDoseEntry = {
  dose: StoredDose;
  effectiveTime: string;
  status: DoseStatus;
  log?: DoseLog;
};

// Today's dose entries with live status, factoring in adjustments and confirmed logs
export function useTodayDoses(): TodayDoseEntry[] {
  const storedDoses = useScheduleStore((s) => s.doses);
  const mealTimes = useSettingsStore((s) => s.mealTimes);
  const mealAdjustments = useTodayStore((s) => s.mealAdjustments);
  const today = todayString();
  const allHistoryLogs = useHistoryStore((s) => s.logs);
  const confirmedToday = allHistoryLogs.filter(
    (l) => l.date === today && (l.status === 'taken' || l.status === 'manual')
  );

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Sort doses by effective scheduled time
  const withTimes = storedDoses.map((dose) => ({
    dose,
    effectiveTime: computeDoseEffectiveScheduledTime(dose, mealTimes, mealAdjustments),
  }));
  withTimes.sort((a, b) => a.effectiveTime.localeCompare(b.effectiveTime));

  let foundUpcoming = false;

  return withTimes.map(({ dose, effectiveTime }) => {
    const confirmed = confirmedToday.find((l) => l.doseId === dose.id);
    if (confirmed) {
      return { dose, effectiveTime, status: confirmed.status, log: confirmed };
    }

    const [th, tm] = effectiveTime.split(':').map(Number);
    const doseMin = th * 60 + tm;
    const minutesPast = nowMin - doseMin;

    let status: DoseStatus;
    if (minutesPast > 30) {
      status = 'missed';
    } else if (!foundUpcoming) {
      status = 'upcoming';
      foundUpcoming = true;
    } else {
      status = 'scheduled';
    }

    return { dose, effectiveTime, status };
  });
}

export type HistoryDay = {
  date: string;
  label: 'today' | 'yesterday' | 'date';
  displayDate: string;
  logs: DoseLog[];
};

export function useHistoryDays(): HistoryDay[] {
  const today = todayString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  const todayEntries = useTodayDoses();
  const allLogs = useHistoryStore((s) => s.logs);

  const todayLogs: DoseLog[] = todayEntries.map((entry) => ({
    id: entry.log?.id ?? `today-${entry.dose.id}`,
    doseId: entry.dose.id,
    date: today,
    scheduledTime: entry.effectiveTime,
    takenAt: entry.log?.takenAt ?? null,
    method: entry.log?.method ?? null,
    status: entry.status,
    doseName: `${entry.dose.label} ${i18n.t('dose.suffix')}`,
  }));

  // Past confirmed logs excluding today
  const pastLogs = allLogs.filter((l) => l.date !== today);

  // Group past logs by date
  const grouped: Record<string, DoseLog[]> = {};
  for (const log of pastLogs) {
    if (!grouped[log.date]) grouped[log.date] = [];
    grouped[log.date].push(log);
  }

  const days: HistoryDay[] = [];

  if (todayLogs.length > 0) {
    days.push({ date: today, label: 'today', displayDate: formatDisplayDate(today), logs: todayLogs });
  }

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  for (const date of sortedDates) {
    const label: HistoryDay['label'] = date === yesterday ? 'yesterday' : 'date';
    const logs = grouped[date].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    days.push({ date, label, displayDate: formatDisplayDate(date), logs });
  }

  return days;
}
