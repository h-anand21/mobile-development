import { router } from 'expo-router';

export type NotificationDataPayload = {
  screen?: string;
  habitId?: string;
  [key: string]: any;
};

/**
 * Handles the tap interaction on both local and push notifications.
 * Redirects the user to the appropriate screen within the app.
 */
export function handleNotificationTap(data: NotificationDataPayload) {
  console.log('Handling notification tap with payload:', data);
  
  if (data?.screen === '/habit' && data?.habitId) {
    // Navigate to the habit detail screen
    // Expo Router resolves this dynamically to /habit/[id]
    setTimeout(() => {
      router.push(`/habit/${data.habitId}`);
    }, 100);
  }
}
