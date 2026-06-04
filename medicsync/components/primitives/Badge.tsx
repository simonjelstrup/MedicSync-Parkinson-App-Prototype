import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radii } from '../../lib/theme';

export type BadgeStatus =
  | 'taken'
  | 'due'
  | 'missed'
  | 'manual'
  | 'scheduled'
  | 'upcoming';

interface BadgeConfig {
  bg: string;
  text: string;
}

const config: Record<BadgeStatus, BadgeConfig> = {
  taken:     { bg: colors.bgPositive, text: colors.positiveDark },
  due:       { bg: colors.bgSoft,     text: colors.primaryDarkerText },
  upcoming:  { bg: colors.bgSoft,     text: colors.primaryDarkerText },
  missed:    { bg: colors.bgError,    text: colors.errorDark },
  manual:    { bg: colors.bgNeutral,  text: colors.textMuted },
  scheduled: { bg: colors.bgNeutral,  text: colors.textMuted },
};

interface BadgeProps {
  status: BadgeStatus;
  style?: ViewStyle;
}

export function Badge({ status, style }: BadgeProps) {
  const { t } = useTranslation();
  const { bg, text } = config[status];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: text }]}>
        {t(`badges.${status}`)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radii.badge,
    alignSelf: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
});
