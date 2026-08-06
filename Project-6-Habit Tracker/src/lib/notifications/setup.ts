import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { isRunningInExpoGo } from 'expo';
import { REMINDERS_CHANNEL_ID } from '../../constants/channels';

/**
 * Configure foreground notification behavior.
 * This ensures that when the app is open (in the foreground),
 * we still show standard heads-up banners, play sounds, and set badges.
 * 
 * NOTE: Expo Go does not fully support notification channels on Android.
 * Local (scheduled) notifications still work in Expo Go.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false, // badge not supported in Expo Go
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
 *
 * EXPO GO: setNotificationChannelAsync is NOT supported in Expo Go — skipped gracefully.
 */
export async function initializeNotificationChannel() {
  // Expo Go does not support Android notification channels — skip to avoid NullPointerException
  if (isRunningInExpoGo()) {
    console.log('[Notifications] Skipping channel setup — running in Expo Go.');
    return;
  }

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(REMINDERS_CHANNEL_ID, {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#5EEAD4',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: undefined,
      });
    } catch (e) {
      console.warn('[Notifications] Failed to create notification channel:', e);
    }
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
