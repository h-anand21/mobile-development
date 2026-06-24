import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from './types';

const HABITS_STORAGE_KEY = 'HABITS_STORAGE';

export async function getHabits(): Promise<Habit[]> {
  try {
    const data = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Habit[];
  } catch (error) {
    console.error('Failed to get habits from storage', error);
    return [];
  }
}

export async function saveHabits(habits: Habit[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
    return true;
  } catch (error) {
    console.error('Failed to save habits to storage', error);
    return false;
  }
}

export async function saveHabit(habit: Habit): Promise<boolean> {
  const habits = await getHabits();
  const index = habits.findIndex(h => h.id === habit.id);
  if (index >= 0) {
    habits[index] = habit;
  } else {
    habits.push(habit);
  }
  return saveHabits(habits);
}

export async function updateHabit(habit: Habit): Promise<boolean> {
  return saveHabit(habit);
}

export async function deleteHabit(id: string): Promise<boolean> {
  const habits = await getHabits();
  const filtered = habits.filter(h => h.id !== id);
  return saveHabits(filtered);
}

export async function getHabitById(id: string): Promise<Habit | null> {
  const habits = await getHabits();
  const habit = habits.find(h => h.id === id);
  return habit || null;
}
