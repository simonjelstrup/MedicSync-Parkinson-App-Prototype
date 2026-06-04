import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../lib/theme';

interface IconButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  size?: number;
  style?: ViewStyle;
  accessibilityLabel: string;
  variant?: 'soft' | 'ghost';
}

export function IconButton({
  onPress,
  children,
  size = 36,
  style,
  accessibilityLabel,
  variant = 'soft',
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          minWidth: size,
          minHeight: size,
        },
        variant === 'soft' && styles.soft,
        variant === 'ghost' && styles.ghost,
        pressed && styles.pressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  soft: {
    backgroundColor: colors.bgSoft,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    backgroundColor: colors.primarySoft,
    opacity: 0.85,
  },
});
