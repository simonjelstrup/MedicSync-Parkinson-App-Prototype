import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radii } from '../lib/theme';
import { ForkPlateIcon } from '../components/svg/Icons';

export default function OkToEatScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.eatRing}>
          <ForkPlateIcon color={colors.positiveMid} size={44} />
        </View>

        <Text style={styles.kicker}>{t('eat.kicker')}</Text>
        <Text style={styles.title}>{t('eat.title')}</Text>
        <Text style={styles.sub}>{t('eat.sub')}</Text>

        <Pressable style={styles.btn} onPress={() => router.dismissAll()}>
          <Text style={styles.btnText}>{t('eat.okThanks')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgEat,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenEdge,
    paddingBottom: 40,
  },
  eatRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.bgPositive,
    borderWidth: 2,
    borderColor: colors.positiveSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  kicker: {
    ...typography.sectionLabel,
    color: colors.positiveSub,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Manrope_700Bold',
    color: colors.positiveText,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  sub: {
    ...typography.body,
    color: colors.positiveSub,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.xxl + 8,
  },
  btn: {
    width: '100%',
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors.positive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    ...typography.buttonPrimary,
    color: 'white',
  },
});
