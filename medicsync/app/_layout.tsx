import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, AppState } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import i18n, { loadSavedLanguage } from '../lib/i18n';
import { colors } from '../lib/theme';
import { SilenceProvider } from '../contexts/SilenceContext';
import { useTodayStore } from '../stores/todayStore';
import { useScheduleStore } from '../stores/scheduleStore';
import { useSettingsStore } from '../stores/settingsStore';
import {
  setupNotificationHandler,
  setupAndroidChannels,
  requestNotificationPermissions,
  setupNotificationCategories,
} from '../lib/notifications';
import { scheduleAllAlarms, logMissedDoses, logMissedDosesForDate } from '../lib/alarmScheduler';

// Set up notification handler before any component renders
setupNotificationHandler();

function handleNotificationData(data: Record<string, unknown>) {
  if (data?.type === 'dose-alarm' && data?.doseId) {
    router.push({ pathname: '/alarm', params: { doseId: String(data.doseId) } });
  } else if (data?.type === 'ok-to-eat') {
    router.push('/ok-to-eat');
  }
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const [langLoaded, setLangLoaded] = React.useState(false);

  React.useEffect(() => {
    loadSavedLanguage().finally(() => setLangLoaded(true));
  }, []);

  useEffect(() => {
    // Request notification permissions once, then register categories
    requestNotificationPermissions().then((granted) => {
      if (granted) setupNotificationCategories();
    });
    setupAndroidChannels();

    // Handle day rollover and missed dose logging
    const runStartup = () => {
      const store = useTodayStore.getState();
      const previousDate = store.date;
      store.checkRollover();
      const today = new Date().toISOString().slice(0, 10);
      if (previousDate !== today) {
        logMissedDosesForDate(previousDate);
      }
      logMissedDoses();
      scheduleAllAlarms();
    };

    // Slight delay allows Zustand AsyncStorage hydration to complete
    const initTimeout = setTimeout(runStartup, 400);

    // Re-run on app foreground
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') runStartup();
    });

    // Reschedule when schedule or meal times change
    const unsubSchedule = useScheduleStore.subscribe(() => scheduleAllAlarms());
    const unsubSettings = useSettingsStore.subscribe(() => scheduleAllAlarms());
    const unsubToday = useTodayStore.subscribe((s, prev) => {
      if (s.mealAdjustments !== prev.mealAdjustments) scheduleAllAlarms();
    });

    return () => {
      clearTimeout(initTimeout);
      appStateSub.remove();
      unsubSchedule();
      unsubSettings();
      unsubToday();
    };
  }, []);

  useEffect(() => {
    // Handle notification tap (or action button tap) when app is in background/killed
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;
      // "Confirm manually" action button on the lock-screen card → skip alarm screen
      if (response.actionIdentifier === 'MANUAL_CONFIRM' && data?.doseId) {
        router.push({ pathname: '/manual-confirm', params: { doseId: String(data.doseId) } });
      } else {
        handleNotificationData(data);
      }
    });

    // Handle notification received while app is in foreground — navigate directly
    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as Record<string, unknown>;
      if (data?.type === 'dose-alarm' || data?.type === 'ok-to-eat') {
        handleNotificationData(data);
      }
    });

    // Handle cold launch via notification (app was killed)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data as Record<string, unknown>;
        handleNotificationData(data);
      }
    });

    return () => {
      responseSub.remove();
      receivedSub.remove();
    };
  }, []);

  if (!fontsLoaded || !langLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <SilenceProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="alarm" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
              <Stack.Screen name="manual-confirm" options={{ presentation: 'fullScreenModal', animation: 'slide_from_right' }} />
              <Stack.Screen name="confirmed" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
              <Stack.Screen name="ok-to-eat" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
              <Stack.Screen name="profile-editor" />
              <Stack.Screen name="dose-editor" />
              <Stack.Screen name="pillbox-location" />
              <Stack.Screen name="relatives" />
            </Stack>
          </SilenceProvider>
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
