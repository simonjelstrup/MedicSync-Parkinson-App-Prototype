import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, radii, spacing, typography } from '../../lib/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        pressed && !disabled && pressedStyles[variant],
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.primaryTextOn : colors.textSecondary}
          size="small"
        />
      ) : (
        <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    minHeight: spacing.tapMin,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    minHeight: 60,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  tertiary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
  },
  destructive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#F5C5C5',
  },
});

const pressedStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primaryDark,
  },
  secondary: {
    backgroundColor: colors.bgSoft,
  },
  tertiary: {
    backgroundColor: colors.bgSoft,
  },
  destructive: {
    backgroundColor: colors.bgError,
  },
});

const labelStyles = StyleSheet.create({
  primary: {
    ...typography.buttonPrimary,
    color: colors.primaryTextOn,
  },
  secondary: {
    ...typography.button,
    color: colors.textSecondary,
  },
  tertiary: {
    ...typography.button,
    fontSize: 15,
    color: colors.textSecondary,
  },
  destructive: {
    ...typography.button,
    color: colors.errorDark,
  },
});
