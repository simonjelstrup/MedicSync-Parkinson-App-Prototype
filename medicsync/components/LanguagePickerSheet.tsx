import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BottomSheet, type BottomSheetRef } from './primitives';
import { colors, typography, spacing, radii } from '../lib/theme';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../lib/i18n';
import i18n from '../lib/i18n';

export const LanguagePickerSheet = forwardRef<BottomSheetRef, object>(
  (_props, ref) => {
    const { t } = useTranslation();

    const handleSelect = (lang: 'en' | 'da') => {
      setLanguage(lang);
      setTimeout(() => {
        (ref as React.RefObject<BottomSheetRef>).current?.dismiss();
      }, 150);
    };

    const currentLang = i18n.language as 'en' | 'da';

    return (
      <BottomSheet ref={ref} snapPoints={['40%']} title={t('lang.title')}>
        <Text style={styles.sub}>{t('lang.sub')}</Text>
        <View style={styles.list}>
          {(['en', 'da'] as const).map(lang => {
            const selected = currentLang === lang || (lang === 'en' && !['en', 'da'].includes(currentLang));
            return (
              <Pressable key={lang} onPress={() => handleSelect(lang)} style={styles.row}>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.langName}>{lang === 'en' ? 'English' : 'Dansk'}</Text>
                <Text style={styles.langNative}>{lang === 'en' ? 'English' : 'Danish'}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={() => (ref as React.RefObject<BottomSheetRef>).current?.dismiss()}
          style={styles.doneBtn}
        >
          <Text style={styles.doneBtnText}>{t('action.done')}</Text>
        </Pressable>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  sub: {
    ...typography.helper,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  list: {
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: spacing.tapMin,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDividerSoft,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  langName: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  langNative: {
    ...typography.helper,
    color: colors.textSecondary,
  },
  doneBtn: {
    height: spacing.tapMin,
    backgroundColor: colors.bgSoft,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    ...typography.button,
    color: colors.textSecondary,
  },
});
