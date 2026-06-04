import React, { forwardRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BottomSheet, type BottomSheetRef } from './primitives';
import { colors, typography, spacing, radii } from '../lib/theme';
import { useTranslation } from 'react-i18next';

export type WheelColumn<T> = {
  items: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  flex?: number;
};

type Props = {
  title: string;
  columns: WheelColumn<any>[];
  onSave: () => void;
  onCancel?: () => void;
};

export const WheelPickerSheet = forwardRef<BottomSheetRef, Props>(
  ({ title, columns, onSave, onCancel }, ref) => {
    const { t } = useTranslation();

    const handleSave = () => {
      onSave();
      (ref as React.RefObject<BottomSheetRef>).current?.dismiss();
    };

    const handleCancel = () => {
      onCancel?.();
      (ref as React.RefObject<BottomSheetRef>).current?.dismiss();
    };

    return (
      <BottomSheet ref={ref} snapPoints={['48%']} title={title}>
        <View style={styles.wheelRow}>
          {columns.map((col, i) => (
            <View key={i} style={[styles.wheelCol, col.flex ? { flex: col.flex } : { flex: 1 }]}>
              <Picker
                selectedValue={col.value}
                onValueChange={col.onChange}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {col.items.map((item) => (
                  <Picker.Item key={String(item.value)} label={item.label} value={item.value} />
                ))}
              </Picker>
            </View>
          ))}
        </View>
        <View style={styles.btns}>
          <Pressable onPress={handleCancel} style={[styles.btn, styles.btnCancel]}>
            <Text style={styles.btnCancelText}>{t('action.cancel')}</Text>
          </Pressable>
          <Pressable onPress={handleSave} style={[styles.btn, styles.btnSave]}>
            <Text style={styles.btnSaveText}>{t('action.save')}</Text>
          </Pressable>
        </View>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  wheelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  wheelCol: {
    alignItems: 'center',
  },
  picker: {
    width: '100%',
    height: 160,
  },
  pickerItem: {
    fontSize: 20,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.textPrimary,
    height: 160,
  },
  btns: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btn: {
    flex: 1,
    height: spacing.tapMin,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: colors.bgSoft,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  btnCancelText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  btnSave: {
    backgroundColor: colors.primary,
  },
  btnSaveText: {
    ...typography.buttonPrimary,
    color: colors.primaryTextOn,
  },
});
