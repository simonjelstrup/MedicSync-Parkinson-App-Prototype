import React, { forwardRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BottomSheet, type BottomSheetRef } from './primitives';
import { colors, typography, spacing, radii } from '../lib/theme';
import { useTranslation } from 'react-i18next';

type Props = {
  medications: string[];
  onConfirm: (time: string) => void;
};

const HOURS = Array.from({ length: 24 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: i }));
const MINUTES = Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: i }));

function currentHM(): { hour: number; minute: number } {
  const now = new Date();
  return { hour: now.getHours(), minute: now.getMinutes() };
}

export const TakenEarlySheet = forwardRef<BottomSheetRef, Props>(
  ({ medications, onConfirm }, ref) => {
    const { t } = useTranslation();
    const defaults = currentHM();
    const [hour, setHour] = useState(defaults.hour);
    const [minute, setMinute] = useState(defaults.minute);

    const handleConfirm = () => {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      onConfirm(time);
      (ref as React.RefObject<BottomSheetRef>).current?.dismiss();
    };

    const handleCancel = () => {
      const d = currentHM();
      setHour(d.hour);
      setMinute(d.minute);
      (ref as React.RefObject<BottomSheetRef>).current?.dismiss();
    };

    return (
      <BottomSheet ref={ref} snapPoints={['58%']} title={t('takenEarly.title')}>
        <Text style={styles.sub}>{t('takenEarly.sub')}</Text>
        <View style={styles.medsCard}>
          <Text style={styles.medsLabel}>{t('takenEarly.medsLabel')}</Text>
          {medications.map((med, i) => (
            <Text key={i} style={styles.medName}>{med}</Text>
          ))}
        </View>
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
          <Pressable onPress={handleConfirm} style={[styles.btn, styles.btnSave]}>
            <Text style={styles.btnSaveText}>{t('takenEarly.confirm')}</Text>
          </Pressable>
        </View>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  sub: {
    ...typography.helper,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  medsCard: {
    backgroundColor: colors.bgSoft,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
  },
  medsLabel: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  medName: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
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
    height: 150,
  },
  pickerItem: {
    fontSize: 26,
    fontFamily: 'Manrope_600SemiBold',
    color: colors.textPrimary,
    height: 150,
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
