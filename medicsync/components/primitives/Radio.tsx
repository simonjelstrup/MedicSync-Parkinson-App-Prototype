import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '../../lib/theme';

export interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onValueChange: (value: string) => void;
}

export function RadioGroup({ options, value, onValueChange }: RadioGroupProps) {
  return (
    <View>
      {options.map((option, index) => (
        <Pressable
          key={option.value}
          onPress={() => onValueChange(option.value)}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === option.value }}
          accessibilityLabel={option.label}
          style={({ pressed }) => [
            styles.row,
            index < options.length - 1 && styles.rowBorder,
            pressed && styles.rowPressed,
          ]}
        >
          <View
            style={[
              styles.circle,
              value === option.value && styles.circleSelected,
            ]}
          >
            {value === option.value && <View style={styles.circleInner} />}
          </View>
          <Text style={styles.label}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: spacing.tapMin,
    gap: 14,
    paddingHorizontal: 2,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDivider,
  },
  rowPressed: {
    backgroundColor: colors.bgSoft,
    borderRadius: radii.sm,
    marginHorizontal: -4,
    paddingHorizontal: 6,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  circleSelected: {
    borderColor: colors.primary,
  },
  circleInner: {
    width: 12,
    height: 12,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
});
