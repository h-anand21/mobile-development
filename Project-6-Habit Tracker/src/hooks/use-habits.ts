import { create } from 'zustand';
import { Habit, Frequency } from '../lib/habits/types';
import {
  getHabits,
  saveHabit as saveHabitStorage,
  deleteHabit as deleteHabitStorage,
  saveHabits as saveAllHabitsStorage,
} from '../lib/habits/storage';
import {
  scheduleHabitReminder,
  cancelHabitReminders,
} from '../lib/notifications/schedule';
import {
  completeHabitToday,
  undoHabitCompletion,
} from '../lib/habits/streak';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface HabitsState {
  habits: Habit[];
  isLoading: boolean;
  loadHabits: () => Promise<void>;
  createHabit: (name: string, emoji: string, frequency: Frequency) => Promise<Habit>;
  updateHabit: (id: string, name: string, emoji: string, frequency: Frequency) => Promise<Habit>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompleteHabit: (id: string) => Promise<void>;
}

export const useHabits = create<HabitsState>((set, get) => ({
  habits: [],
  isLoading: false,

  loadHabits: async () => {
    set({ isLoading: true });
    try {
      const stored = await getHabits();
      set({ habits: stored });
    } catch (error) {
      console.error('Failed to load habits in store', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createHabit: async (name, emoji, frequency) => {
    const newHabit: Habit = {
      id: uuidv4(),
      name,
      emoji,
      frequency,
      notificationIds: [],
      streak: 0,
      lastCompletedISO: null,
      completedDates: [],
      createdAtISO: new Date().toISOString(),
    };

    // 1. Schedule notifications
    const notificationIds = await scheduleHabitReminder(newHabit);
    newHabit.notificationIds = notificationIds;

    // 2. Persist to storage
    await saveHabitStorage(newHabit);

    // 3. Update state
    set(state => ({
      habits: [...state.habits, newHabit],
    }));

    return newHabit;
  },

  updateHabit: async (id, name, emoji, frequency) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === id);
    if (!habit) {
      throw new Error(`Habit with ID ${id} not found`);
    }

    // 1. Cancel old notifications
    await cancelHabitReminders(habit.notificationIds);

    const updatedHabit: Habit = {
      ...habit,
      name,
      emoji,
      frequency,
      notificationIds: [], // reset temporarily
    };

    // 2. Schedule new notifications
    const newNotificationIds = await scheduleHabitReminder(updatedHabit);
    updatedHabit.notificationIds = newNotificationIds;

    // 3. Persist to storage
    await saveHabitStorage(updatedHabit);

    // 4. Update state
    set(state => ({
      habits: state.habits.map(h => (h.id === id ? updatedHabit : h)),
    }));

    return updatedHabit;
  },

  deleteHabit: async id => {
    const { habits } = get();
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    // 1. Cancel only this habit's notifications
    await cancelHabitReminders(habit.notificationIds);

    // 2. Delete from storage
    await deleteHabitStorage(id);

    // 3. Update state
    set(state => ({
      habits: state.habits.filter(h => h.id !== id),
    }));
  },

  toggleCompleteHabit: async id => {
    const { habits } = get();
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];
    let updatedHabit: Habit;

    if (habit.lastCompletedISO === today) {
      // Revert completion
      const reverted = undoHabitCompletion(habit);
      updatedHabit = {
        ...habit,
        streak: reverted.streak,
        lastCompletedISO: reverted.lastCompletedISO,
        completedDates: habit.completedDates.filter(d => d !== today),
      };
    } else {
      // Complete habit
      const completed = completeHabitToday(habit);
      updatedHabit = {
        ...habit,
        streak: completed.streak,
        lastCompletedISO: completed.lastCompletedISO,
        completedDates: [...habit.completedDates.filter(d => d !== today), today],
      };
    }

    // Persist and update state
    await saveHabitStorage(updatedHabit);
    set(state => ({
      habits: state.habits.map(h => (h.id === id ? updatedHabit : h)),
    }));
  },
}));
