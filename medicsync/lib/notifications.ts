import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import i18n from './i18n';

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function setupNotificationCategories(): Promise<void> {
  await Notifications.setNotificationCategoryAsync('dose-alarm', [
    {
      identifier: 'MANUAL_CONFIRM',
      buttonTitle: i18n.t('alarm.confirmWithoutPillbox'),
      options: { opensAppToForeground: true },
    },
  ]);
}

export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const data = notification.request.content.data as Record<string, unknown>;
      if (data?.type === 'dose-alarm' || data?.type === 'ok-to-eat') {
        // App is open — suppress system banner; the received listener navigates directly
        return { shouldShowAlert: false, shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: false, shouldShowList: false };
      }
      return { shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true };
    },
  });
}

export async function setupAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('dose-alarm', {
    name: 'Dose Alarm',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 500, 200, 500],
    lightColor: '#C8914F',
  });
  await Notifications.setNotificationChannelAsync('ok-to-eat', {
    name: 'OK to eat',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}
