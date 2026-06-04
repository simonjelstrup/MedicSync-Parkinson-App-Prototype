import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radii, shadows } from '../lib/theme';
import { mockHistory } from '../lib/mockData';
import { Badge } from '../components/primitives';
import { BackArrowIcon } from '../components/svg/Icons';

export default function RelativesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const todayLogs = mockHistory[0].logs;

  const formatDate = () => {
    const d = new Date();
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <BackArrowIcon color={colors.textPrimary} size={20} />
          </Pressable>
          <View>
            <Text style={styles.title}>{t('relatives.titleName')}</Text>
            <Text style={styles.subtitle}>{formatDate()}</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.relativesCard}>
          {todayLogs.map((log, idx) => {
            const isLast = idx === todayLogs.length - 1;
            const badgeStatus =
              log.status === 'taken' ? 'taken'
              : log.status === 'manual' ? 'manual'
              : log.status === 'missed' ? 'missed'
              : log.status === 'upcoming' ? 'upcoming'
              : 'scheduled';

            return (
              <View key={log.id} style={[styles.relRow, !isLast && styles.relRowBorder]}>
                <Text style={styles.relTime}>{log.scheduledTime}</Text>
                <Text style={styles.relName}>{log.doseName}</Text>
                <Badge status={badgeStatus} />
              </View>
            );
          })}
        </View>

        <Text style={styles.footer}>{t('relatives.lastUpdated')}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: 18,
    paddingBottom: 6,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Manrope_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.helper,
    color: colors.textSecondary,
    marginTop: 2,
  },
  spacer: {
    height: 14,
  },
  relativesCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  relRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.cardPadding,
    height: spacing.tapMin,
    gap: spacing.md,
  },
  relRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDividerSoft,
  },
  relTime: {
    fontSize: 15,
    fontFamily: 'Manrope_500Medium',
    color: colors.textSecondary,
    width: 48,
  },
  relName: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 15,
  },
  footer: {
    ...typography.helper,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
