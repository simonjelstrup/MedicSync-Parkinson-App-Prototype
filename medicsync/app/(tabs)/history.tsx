import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radii, shadows } from '../../lib/theme';
import { useHistoryDays, type HistoryDay } from '../../lib/scheduleUtils';
import { useHistoryStore } from '../../stores/historyStore';
import { Badge } from '../../components/primitives';
import type { DoseLog, DoseStatus } from '../../lib/mockData';

const DOT_COLORS: Record<DoseStatus, string> = {
  taken: colors.positive,
  manual: colors.textMuted,
  missed: colors.error,
  upcoming: colors.primary,
  scheduled: colors.border,
};

function HistoryDots({ logs }: { logs: DoseLog[] }) {
  return (
    <View style={styles.dotsRow}>
      {logs.map((log) => (
        <View key={log.id} style={[styles.hdot, { backgroundColor: DOT_COLORS[log.status] }]} />
      ))}
    </View>
  );
}

function takenCount(logs: DoseLog[]): number {
  return logs.filter((l) => l.status === 'taken' || l.status === 'manual').length;
}

export default function HistoryScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const historyDays = useHistoryDays();
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  const handleClearHistory = () => {
    Alert.alert(
      t('history.clearConfirmTitle'),
      t('history.clearConfirmMessage'),
      [
        { text: t('history.clearConfirmCancel'), style: 'cancel' },
        { text: t('history.clearConfirmOk'), style: 'destructive', onPress: clearHistory },
      ]
    );
  };
  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    new Set(historyDays.length > 0 ? [historyDays[0].date] : [])
  );

  const toggleDay = (date: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greeting}>
          <View style={styles.greetingRow}>
            <Text style={styles.greetingName}>{t('history.title')}</Text>
            {historyDays.length > 0 && (
              <Pressable style={styles.clearBtn} onPress={handleClearHistory}>
                <Text style={styles.clearBtnText}>{t('history.clearHistory')}</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.greetingDate}>{t('history.last30days')}</Text>
        </View>

        <View style={styles.spacer} />

        {historyDays.map((day: HistoryDay) => {
          const expanded = expandedDays.has(day.date);
          const taken = takenCount(day.logs);

          const dayLabel =
            day.label === 'today'
              ? `${t('day.today')} · ${day.displayDate}`
              : day.label === 'yesterday'
              ? `${t('day.yesterday')} · ${day.displayDate}`
              : day.displayDate;

          return (
            <Pressable key={day.date} style={styles.dayCard} onPress={() => toggleDay(day.date)}>
              <View style={styles.dayHead}>
                <Text style={styles.dayLabel}>{dayLabel}</Text>
                <View style={styles.dayMeta}>
                  <HistoryDots logs={day.logs} />
                  <Text style={styles.dayScore}>
                    {taken}/{day.logs.length}
                  </Text>
                </View>
              </View>

              {expanded &&
                day.logs.map((log, idx) => {
                  const isLast = idx === day.logs.length - 1;
                  const badgeStatus =
                    log.status === 'taken'
                      ? 'taken'
                      : log.status === 'manual'
                      ? 'manual'
                      : log.status === 'missed'
                      ? 'missed'
                      : log.status === 'upcoming'
                      ? 'upcoming'
                      : 'scheduled';

                  return (
                    <View
                      key={log.id}
                      style={[styles.historyEntry, !isLast && styles.historyEntryBorder]}
                    >
                      <Text style={styles.hTime}>{log.takenAt ?? log.scheduledTime}</Text>
                      <Text style={styles.hName}>{log.doseName}</Text>
                      <Badge status={badgeStatus} />
                    </View>
                  );
                })}
            </Pressable>
          );
        })}

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
  spacer: {
    height: 14,
  },
  dayCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  dayHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.cardPadding,
    paddingVertical: spacing.md,
  },
  dayLabel: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.textPrimary,
  },
  dayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  hdot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dayScore: {
    ...typography.helper,
    color: colors.textSecondary,
    minWidth: 30,
    textAlign: 'right',
  },
  historyEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.cardPadding,
    paddingVertical: spacing.sm + 2,
  },
  historyEntryBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.borderDividerSoft,
  },
  hTime: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: colors.textSecondary,
    width: 48,
  },
  hName: {
    flex: 1,
    ...typography.helper,
    color: colors.textPrimary,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.badge,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  clearBtnText: {
    fontSize: 13,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.textSecondary,
  },
  bottomPad: {
    height: 20,
  },
});
