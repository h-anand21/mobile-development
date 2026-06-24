import { useState, useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync } from '../lib/notifications/push';
import { checkNotificationPermissions } from '../lib/notifications/setup';
import { Alert } from 'react-native';

const PUSH_TOKEN_STORAGE_KEY = 'PUSH_TOKEN';

export function usePushNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Load cached token and check permissions on mount
  useEffect(() => {
    async function init() {
      try {
        const cachedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
        if (cachedToken) {
          setPushToken(cachedToken);
        }
        const status = await checkNotificationPermissions();
        setPermissionStatus(status);
      } catch (error) {
        console.error('Failed to initialize push notifications hook:', error);
      }
    }
    init();
  }, []);

  const checkPermissions = async () => {
    const status = await checkNotificationPermissions();
    setPermissionStatus(status);
    return status;
  };

  const register = async () => {
    setIsRegistering(true);
    try {
      const token = await registerForPushNotificationsAsync();
      const status = await checkNotificationPermissions();
      setPermissionStatus(status);

      if (token) {
        setPushToken(token);
        await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
      }
      return token;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return null;
    } finally {
      setIsRegistering(false);
    }
  };

  const copyToken = async () => {
    if (!pushToken) {
      Alert.alert('No Token', 'No Expo Push Token available to copy.');
      return false;
    }
    try {
      await Clipboard.setStringAsync(pushToken);
      Alert.alert('Copied!', 'Expo Push Token copied to clipboard.');
      return true;
    } catch (error) {
      console.error('Failed to copy token:', error);
      return false;
    }
  };

  return {
    pushToken,
    permissionStatus,
    isRegistering,
    checkPermissions,
    register,
    copyToken,
  };
}
