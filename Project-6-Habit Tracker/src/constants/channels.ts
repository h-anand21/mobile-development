import { Platform } from 'react-native';

export const REMINDERS_CHANNEL_ID = 'habit-reminders';

export const CHANNEL_CONFIG = {
  id: REMINDERS_CHANNEL_ID,
  name: 'Habit Reminders',
  description: 'Daily and weekly reminders for scheduled habits.',
  importance: 4, // High importance (Notifications.AndroidImportance.HIGH / MAX)
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#5EEAD4',
  showBadge: true,
};
