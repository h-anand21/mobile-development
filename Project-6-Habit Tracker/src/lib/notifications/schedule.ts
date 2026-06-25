import * as Notifications from 'expo-notifications';
import { Habit } from '../habits/types';
import { REMINDERS_CHANNEL_ID } from '../../constants/channels';
import { checkNotificationPermissions } from './setup';

/**
 * Schedules local recurring reminder notifications for a habit.
 * Returns an array of scheduled notification IDs.
 */
export async function scheduleHabitReminder(habit: Habit): Promise<string[]> {
  const permission = await checkNotificationPermissions();
  if (permission !== 'granted') {
    console.warn('Notifications permission is not granted. Reminders will be scheduled, but won\'t display.');
  }

  const { frequency, name, emoji, id: habitId } = habit;
  const scheduledIds: string[] = [];

  const title = `Time for ${name} ${emoji}`;
  const body = `Keep your streak alive! Tap to check in.`;
  const data = {
    screen: '/habit',
    habitId: habitId,
  };

  try {
    if (frequency.kind === 'daily') {
      const scheduledId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          channelId: REMINDERS_CHANNEL_ID,
          hour: frequency.hour,
          minute: frequency.minute,
        },
      });
      scheduledIds.push(scheduledId);
    } else if (frequency.kind === 'weekly') {
      // For weekly habits, schedule a notification for each selected weekday
      for (const jsWeekday of frequency.weekdays) {
        // JS Date weekdays: 0 (Sun) - 6 (Sat)
        // Expo Notifications trigger weekdays: 1 (Sun) - 7 (Sat)
        const expoWeekday = jsWeekday + 1;

        const scheduledId = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            channelId: REMINDERS_CHANNEL_ID,
            weekday: expoWeekday,
            hour: frequency.hour,
            minute: frequency.minute,
          },
        });
        scheduledIds.push(scheduledId);
      }
    }
  } catch (error) {
    console.error(`Failed to schedule reminders for habit ${habitId}:`, error);
  }

  return scheduledIds;
}

/**
 * Cancels specific notifications.
 * Used when a habit is edited (cancelling old schedules) or deleted.
 */
export async function cancelHabitReminders(notificationIds: string[]): Promise<void> {
  if (!notificationIds || notificationIds.length === 0) return;

  for (const id of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (error) {
      console.warn(`Failed to cancel notification with ID ${id}:`, error);
    }
  }
}
