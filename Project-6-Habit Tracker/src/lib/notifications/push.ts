import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import { requestNotificationPermissions } from './setup';

/**
 * Registers the current device for remote push notifications and retrieves the Expo Push Token.
 * Push notifications are supported on physical Android and iOS devices.
 * 
 * NOTE: Remote push notifications (Expo Push Token) are NOT supported in Expo Go (SDK 53+).
 * Local/scheduled notifications still work in Expo Go.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push notifications do not work on simulators.
  if (!Device.isDevice) {
    console.warn('Must use physical device for Push Notifications');
    return null;
  }

  // Remote push notifications are NOT available in Expo Go since SDK 53
  if (isRunningInExpoGo()) {
    console.warn('[Push] Remote push notifications are not supported in Expo Go. Use a development build.');
    return null;
  }

  try {
    // Check and request notification permissions
    const status = await requestNotificationPermissions();
    if (status !== 'granted') {
      console.warn('Failed to get push token because notification permission was not granted');
      return null;
    }

    // Retrieve Project ID from expo configuration (required in newer Expo versions)
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn('EAS Project ID not found in app.json. Push registration may fail.');
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log('Successfully registered for Expo Push Token:', tokenData.data);
    return tokenData.data;
  } catch (error: any) {
    console.warn('[Push] Push registration notice (FCM/EAS project setup required for remote tokens):', error?.message || error);
    return null;
  }
}
