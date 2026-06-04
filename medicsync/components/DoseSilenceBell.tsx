import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { colors, radii } from '../lib/theme';

type Props = {
  silenced: boolean;
  onToggle: () => void;
  accessibilityLabel?: string;
};

export function DoseSilenceBell({ silenced, onToggle, accessibilityLabel }: Props) {
  const iconColor = silenced ? colors.textMuted : colors.primary;

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [styles.btn, silenced && styles.btnSilenced, pressed && styles.btnPressed]}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Svg width={16} height={16} viewBox="0 0 18 18">
        <Path
          d="M9 2C8.4 2 8 2.4 8 3V3.3C5.7 3.8 4 5.7 4 8V11L3 12V13H15V12L14 11V8C14 5.7 12.3 3.8 10 3.3V3C10 2.4 9.6 2 9 2Z"
          fill={iconColor}
        />
        <Path d="M7.5 14C7.5 14.8 8.2 15.5 9 15.5C9.8 15.5 10.5 14.8 10.5 14H7.5Z" fill={iconColor} />
        {silenced && (
          <Line x1={3} y1={3} x2={15} y2={15} stroke={iconColor} strokeWidth={2} strokeLinecap="round" />
        )}
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: radii.badge,
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
    backgroundColor: colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSilenced: {
    borderColor: colors.border,
    backgroundColor: colors.bgNeutral,
  },
  btnPressed: {
    opacity: 0.7,
  },
});
