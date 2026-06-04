import React, { forwardRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BottomSheet, type BottomSheetRef } from './primitives';
import { colors, typography, spacing, radii } from '../lib/theme';
import { useTranslation } from 'react-i18next';

type Meal = 'breakfast' | 'lunch' | 'dinner';

type Props = {
  meal: Meal;
  scope?: 'today' | 'default';
  initialTime?: string;
  onSave: (time: string) => void;
};

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  label: String(i).padStart(2, '0'),
  value: i,
}));

const MINUTES = Array.from({ length: 12 }, (_, i) => ({
  label: String(i * 5).padStart(2, '0'),
  value: i * 5,
}));

function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':').map(Number);
  const minute = Math.round(m / 5) * 5;
  return { hour: h ?? 8, minute: minute >= 60 ? 55 : minute };
}

export const TimePickerSheet = forwardRef<BottomSheetRef, Props>(
  ({ meal, scope = 'today', initialTime = '08:00', onSave }, ref) => {
    const { t } = useTranslation();
    const parsed = parseTime(initialTime);
    const [hour, setHour] = useState(parsed.hour);
    const [minute, setMinute] = useState(parsed.minute);

    useEffect(() => {
      const p = parseTime(initialTime);
      setHour(p.hour);
      setMinute(p.minute);
    }, [initialTime]);

    const titleKey =
      meal === 'breakfast'
        ? 'timePicker.setBreakfastTime'
        : meal === 'lunch'
        ? 'timePicker.setLunchTime'
        : 'timePicker.setDinnerTime';

    const scopeKey = scope === 'today' ? 'timePicker.todayScope' : 'timePicker.defaultScope';

    const handleSave = () => {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      onSave(time);
      (ref as React.RefObject<BottomSheetRef>).current?.dismiss();
    };

    const handleCancel = () => {
      const p = parseTime(initialTime);
      setHour(p.hour);
      setMinute(p.minute);
      (ref as React.RefObject<BottomSheetRef>).current?.dismiss();
    };

    return (
      <BottomSheet ref={ref} snapPoints={['50%']} title={t(titleKey)}>
        <Text style={styles.sub}>{t(scopeKey)}</Text>
        <View style={styles.wheelRow}>
          <View style={styles.wheelCol}>
            <Picker
              selectedValue={hour}
              onValueChange={(v) => setHour(v)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {HOURS.map((h) => (
                <Picker.Item key={h.value} label={h.label} value={h.value} />
              ))}
            </Picker>
          </View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.wheelCol}>
            <Picker
              selectedValue={minute}
              onValueChange={(v) => setMinute(v)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {MINUTES.map((m) => (
                <Picker.Item key={m.value} label={m.label} value={m.value} />
              ))}
            </Picker>
          </View>
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
  sub: {
    ...typography.helper,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  wheelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  wheelCol: {
    flex: 1,
  },
  picker: {
    width: '100%',
    height: 160,
  },
  pickerItem: {
    fontSize: 28,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.textPrimary,
    height: 160,
  },
  colon: {
    fontSize: 28,
    fontFamily: 'Manrope_700Bold',
    color: colors.textPrimary,
    marginHorizontal: 4,
    marginBottom: 4,
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
