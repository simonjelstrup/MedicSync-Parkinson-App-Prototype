import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radii, shadows } from '../lib/theme';
import { useScheduleStore, type StoredDose } from '../stores/scheduleStore';
import { BackArrowIcon, PlusIcon, XIcon } from '../components/svg/Icons';
import { Toggle } from '../components/primitives';

type Meal = 'breakfast' | 'lunch' | 'dinner';
type Relation = 'before' | 'after';
type Med = { id: string; name: string; dosage: string };

const MINUTE_VALUES = [15, 30, 45, 60, 90, 120];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const FIXED_MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function parseFixedTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':').map(Number);
  const minute = Math.round((m ?? 0) / 5) * 5;
  return { hour: h ?? 8, minute: minute >= 60 ? 55 : minute };
}

function buildFixedTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export default function DoseEditorScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { doseId } = useLocalSearchParams<{ doseId: string }>();

  const doses = useScheduleStore((s) => s.doses);
  const addDose = useScheduleStore((s) => s.addDose);
  const updateDose = useScheduleStore((s) => s.updateDose);
  const deleteDose = useScheduleStore((s) => s.deleteDose);

  const isNew = !doseId || doseId === 'new' || doseId.startsWith('new_');
  const existingDose = isNew ? null : doses.find((d) => d.id === doseId);

  const [label, setLabel] = useState(existingDose?.label ?? '');
  const [timingMode, setTimingMode] = useState<'meal' | 'fixed'>(
    existingDose?.timingMode ?? 'meal'
  );
  const rawMinutes = existingDose?.mealAnchor.minutes ?? 30;
  const [minutes, setMinutes] = useState<number>(rawMinutes < 15 ? 15 : rawMinutes);
  const [relation, setRelation] = useState<Relation>(
    existingDose?.mealAnchor.relation ?? 'before'
  );
  const [meal, setMeal] = useState<Meal>(existingDose?.mealAnchor.meal ?? 'lunch');

  const parsedFixed = parseFixedTime(existingDose?.fixedTime ?? '08:00');
  const [fixedHour, setFixedHour] = useState(parsedFixed.hour);
  const [fixedMinute, setFixedMinute] = useState(parsedFixed.minute);

  const [medications, setMedications] = useState<Med[]>(
    existingDose?.medications.map((m) => ({ ...m })) ?? []
  );
  const [addingMed, setAddingMed] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');

  // Reset form when navigating to a different dose (handles expo-router screen reuse)
  useEffect(() => {
    const dose = isNew ? null : doses.find((d) => d.id === doseId);
    setLabel(dose?.label ?? '');
    setTimingMode(dose?.timingMode ?? 'meal');
    const m = dose?.mealAnchor.minutes ?? 30;
    setMinutes(m < 15 ? 15 : m);
    setRelation(dose?.mealAnchor.relation ?? 'before');
    setMeal(dose?.mealAnchor.meal ?? 'lunch');
    const pf = parseFixedTime(dose?.fixedTime ?? '08:00');
    setFixedHour(pf.hour);
    setFixedMinute(pf.minute);
    setMedications(dose?.medications.map((m) => ({ ...m })) ?? []);
    setAddingMed(false);
    setNewMedName('');
    setNewMedDosage('');
  }, [doseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const minuteLabel = (v: number): string => {
    if (v === 60) return t('doseEditor.oneHour');
    if (v === 90) return t('doseEditor.oneAndHalfHours');
    if (v === 120) return t('doseEditor.twoHours');
    return `${v} min`;
  };

  const handleAddMed = () => {
    if (newMedName.trim()) {
      setMedications((prev) => [
        ...prev,
        { id: Date.now().toString(), name: newMedName.trim(), dosage: newMedDosage.trim() },
      ]);
      setNewMedName('');
      setNewMedDosage('');
      setAddingMed(false);
    }
  };

  const handleRemoveMed = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      Alert.alert(t('doseEditor.labelRequired'));
      return;
    }

    const fixedTime = buildFixedTime(fixedHour, fixedMinute);
    const mealAnchor = { meal, relation, minutes };

    if (isNew) {
      const newDose: StoredDose = {
        id: Date.now().toString(),
        label: trimmedLabel,
        timingMode,
        fixedTime,
        mealAnchor,
        medications,
      };
      addDose(newDose);
    } else if (existingDose) {
      updateDose(existingDose.id, {
        label: trimmedLabel,
        timingMode,
        fixedTime,
        mealAnchor,
        medications,
      });
    }

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(t('doseEditor.delete'), t('doseEditor.deleteConfirm'), [
      { text: t('action.cancel'), style: 'cancel' },
      {
        text: t('doseEditor.delete'),
        style: 'destructive',
        onPress: () => {
          if (existingDose) deleteDose(existingDose.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <BackArrowIcon color={colors.textPrimary} size={20} />
            <Text style={styles.backLabel}>{t('common.settings')}</Text>
          </Pressable>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.eyebrow}>
            {isNew ? t('doseEditor.eyebrowNew') : t('doseEditor.eyebrow')}
          </Text>
          <Text style={styles.title}>
            {isNew ? t('doseEditor.titleNew') : (existingDose?.label ?? '')}
          </Text>
        </View>

        {/* Dose label */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('doseEditor.labelField')}</Text>
          <TextInput
            style={styles.fieldInput}
            value={label}
            onChangeText={setLabel}
            placeholder={t('doseEditor.labelField')}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Timing */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('doseEditor.timing')}</Text>
          <View style={styles.timingCard}>
            {/* Meal-relative toggle */}
            <View style={styles.timingToggleRow}>
              <Text style={styles.timingToggleLabel}>{t('doseEditor.mealRelative')}</Text>
              <Toggle
                value={timingMode === 'meal'}
                onValueChange={(v) => setTimingMode(v ? 'meal' : 'fixed')}
                activeColor={colors.primary}
              />
            </View>

            <View style={styles.timingDivider} />

            {timingMode === 'meal' ? (
              <>
                {/* Offset picker */}
                <View style={styles.pickerSection}>
                  <Text style={styles.pickerLabel}>{t('doseEditor.offset')}</Text>
                  <Picker
                    selectedValue={minutes}
                    onValueChange={(v) => setMinutes(v)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    {MINUTE_VALUES.map((v) => (
                      <Picker.Item key={v} label={minuteLabel(v)} value={v} />
                    ))}
                  </Picker>
                </View>

                <View style={styles.timingDivider} />

                {/* Before / After segmented */}
                <View style={styles.segmentSection}>
                  <Text style={styles.pickerLabel}>{t('doseEditor.relation')}</Text>
                  <View style={styles.segmentRow}>
                    <Pressable
                      style={[styles.segmentBtn, relation === 'before' && styles.segmentBtnActive]}
                      onPress={() => setRelation('before')}
                    >
                      <Text style={[styles.segmentBtnText, relation === 'before' && styles.segmentBtnTextActive]}>
                        {t('doseEditor.before')}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.segmentBtn, relation === 'after' && styles.segmentBtnActive]}
                      onPress={() => setRelation('after')}
                    >
                      <Text style={[styles.segmentBtnText, relation === 'after' && styles.segmentBtnTextActive]}>
                        {t('doseEditor.after')}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.timingDivider} />

                {/* Meal radio buttons */}
                {(['breakfast', 'lunch', 'dinner'] as Meal[]).map((m, idx) => (
                  <Pressable
                    key={m}
                    style={[styles.radioRow, idx > 0 && styles.radioRowBorder]}
                    onPress={() => setMeal(m)}
                  >
                    <View style={[styles.radioCircle, meal === m && styles.radioCircleActive]}>
                      {meal === m && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>{t(`settings.${m}`)}</Text>
                  </Pressable>
                ))}
              </>
            ) : (
              /* Fixed time: hour + minute wheels */
              <View style={styles.fixedTimeRow}>
                <View style={styles.pickerCol}>
                  <Picker
                    selectedValue={fixedHour}
                    onValueChange={(v) => setFixedHour(v)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    {HOURS.map((h) => (
                      <Picker.Item key={h} label={String(h).padStart(2, '0')} value={h} />
                    ))}
                  </Picker>
                </View>
                <Text style={styles.pickerColon}>:</Text>
                <View style={styles.pickerCol}>
                  <Picker
                    selectedValue={fixedMinute}
                    onValueChange={(v) => setFixedMinute(v)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    {FIXED_MINUTES.map((m) => (
                      <Picker.Item key={m} label={String(m).padStart(2, '0')} value={m} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Medications */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('doseEditor.medications')}</Text>
          {medications.length > 0 && (
            <View style={styles.medList}>
              {medications.map((med) => (
                <View key={med.id} style={styles.medRow}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>{med.dosage}</Text>
                  <Pressable onPress={() => handleRemoveMed(med.id)} hitSlop={8}>
                    <XIcon color={colors.textMuted} size={18} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {addingMed && (
            <View style={styles.addMedForm}>
              <TextInput
                style={styles.addMedInput}
                value={newMedName}
                onChangeText={setNewMedName}
                placeholder={t('doseEditor.addMedicationName')}
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
              <TextInput
                style={styles.addMedInput}
                value={newMedDosage}
                onChangeText={setNewMedDosage}
                placeholder={t('doseEditor.addMedicationDosage')}
                placeholderTextColor={colors.textMuted}
              />
              <View style={styles.addMedBtns}>
                <Pressable
                  style={styles.addMedCancel}
                  onPress={() => {
                    setAddingMed(false);
                    setNewMedName('');
                    setNewMedDosage('');
                  }}
                >
                  <Text style={styles.addMedCancelText}>{t('action.cancel')}</Text>
                </Pressable>
                <Pressable style={styles.addMedConfirm} onPress={handleAddMed}>
                  <Text style={styles.addMedConfirmText}>{t('action.done')}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {!addingMed && (
            <Pressable style={styles.addMedBtn} onPress={() => setAddingMed(true)}>
              <PlusIcon color={colors.primary} size={14} />
              <Text style={styles.addMedBtnText}>{t('doseEditor.addMedication')}</Text>
            </Pressable>
          )}
        </View>

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{t('doseEditor.save')}</Text>
        </Pressable>

        {!isNew && (
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>{t('doseEditor.delete')}</Text>
          </Pressable>
        )}
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
    paddingTop: 12,
    marginBottom: spacing.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 44,
    alignSelf: 'flex-start',
  },
  backLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  titleRow: {
    marginBottom: 24,
  },
  eyebrow: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Manrope_700Bold',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  fieldGroup: {
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
    marginBottom: 10,
  },
  fieldInput: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    height: 52,
    paddingHorizontal: spacing.cardPadding,
    ...typography.body,
    color: colors.textPrimary,
  },
  timingCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  timingToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.cardPadding,
    height: spacing.tapMin,
  },
  timingToggleLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
  },
  timingDivider: {
    height: 1,
    backgroundColor: colors.borderDividerSoft,
  },
  pickerSection: {
    paddingHorizontal: spacing.cardPadding,
    paddingTop: spacing.sm,
  },
  pickerLabel: {
    ...typography.helper,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  picker: {
    width: '100%',
    height: 140,
  },
  pickerItem: {
    fontSize: 16,
    color: colors.textPrimary,
    height: 140,
  },
  segmentSection: {
    paddingHorizontal: spacing.cardPadding,
    paddingVertical: spacing.md,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  segmentBtn: {
    flex: 1,
    height: 42,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentBtnText: {
    ...typography.helper,
    color: colors.textSecondary,
    fontFamily: 'Manrope_500Medium',
  },
  segmentBtnTextActive: {
    color: colors.primaryTextOn,
    fontFamily: 'Manrope_600SemiBold',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.cardPadding,
    height: spacing.tapMin,
    gap: spacing.md,
  },
  radioRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.borderDividerSoft,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  radioLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
  },
  pickerCol: {
    flex: 1,
    alignItems: 'center',
  },
  fixedTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenEdge,
    paddingVertical: spacing.sm,
  },
  pickerColon: {
    fontSize: 28,
    fontFamily: 'Manrope_700Bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  medList: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.cardPadding,
    height: spacing.tapMin,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDividerSoft,
    gap: spacing.md,
  },
  medName: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
  },
  medDosage: {
    ...typography.helper,
    color: colors.textSecondary,
  },
  addMedForm: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.cardPadding,
    gap: spacing.sm,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  addMedInput: {
    backgroundColor: colors.bgSoft,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    height: 44,
    paddingHorizontal: spacing.md,
    ...typography.helper,
    color: colors.textPrimary,
  },
  addMedBtns: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addMedCancel: {
    flex: 1,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMedCancelText: {
    ...typography.helper,
    color: colors.textSecondary,
  },
  addMedConfirm: {
    flex: 1,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMedConfirmText: {
    ...typography.helper,
    color: colors.primaryTextOn,
    fontFamily: 'Manrope_600SemiBold',
  },
  addMedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    alignSelf: 'flex-start',
    ...shadows.card,
  },
  addMedBtnText: {
    ...typography.helper,
    color: colors.primary,
    fontFamily: 'Manrope_600SemiBold',
  },
  saveBtn: {
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  saveBtnText: {
    ...typography.buttonPrimary,
    color: colors.primaryTextOn,
  },
  deleteBtn: {
    height: spacing.tapMin,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  deleteBtnText: {
    ...typography.button,
    color: colors.error,
  },
});
