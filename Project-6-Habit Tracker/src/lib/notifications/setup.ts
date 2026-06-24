import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { REMINDERS_CHANNEL_ID } from '../../constants/channels';

/**
 * Configure foreground notification behavior.
 * This ensures that when the app is open (in the foreground),
 * we still show standard heads-up banners, play sounds, and set badges.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Initialize Android custom notification channel.
 * 
 * CRITICAL EXPLANATION:
 * On Android 13 (API level 33) and above, notification permission is runtime-based.
 * We MUST create custom notification channels with high-importance (e.g. sound, vibration, heads-up banner)
 * BEFORE requesting notification permissions. If we request permission first and then create channels,
 * the OS may assign default or low importance status, preventing notifications from displaying as heads-up alerts.
 * Creating the channel first guarantees consistent OS-level behavior.
 */
export async function initializeNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REMINDERS_CHANNEL_ID, {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5EEAD4',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: 'default',
    });
  }
}

/**
 * Check existing notification permission status.
 */
export async function checkNotificationPermissions(): Promise<Notifications.PermissionStatus> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
}

/**
 * Request notification permission.
 * Automatically runs channel setup on Android first.
 */
export async function requestNotificationPermissions(): Promise<Notifications.PermissionStatus> {
  // Always create channel first on Android before requesting permissions
  await initializeNotificationChannel();

  const settings = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });
  return settings.status;
}

/**
 * Open system app settings for this application so users can manually enable permissions.
 */
export function openNotificationSettings() {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
}
