import { Habit } from './types';

// Helper to get local date string YYYY-MM-DD
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get yesterday's date string YYYY-MM-DD
export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

/**
 * Calculates the active streak for display.
 * If the user did not complete the habit today and did not complete it yesterday,
 * the streak is broken and should display as 0.
 */
export function getActiveStreak(habit: Habit): number {
  if (!habit.lastCompletedISO) {
    return 0;
  }
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  if (habit.lastCompletedISO === today || habit.lastCompletedISO === yesterday) {
    return habit.streak;
  }
  return 0;
}

/**
 * Calculates the new streak and completion date when marking a habit as completed today.
 */
export function completeHabitToday(habit: Habit): { streak: number; lastCompletedISO: string } {
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  // If already completed today, return current values
  if (habit.lastCompletedISO === today) {
    return {
      streak: habit.streak,
      lastCompletedISO: today,
    };
  }

  // If completed yesterday, increment streak
  if (habit.lastCompletedISO === yesterday) {
    return {
      streak: habit.streak + 1,
      lastCompletedISO: today,
    };
  }

  // Otherwise, streak resets to 1 (new start)
  return {
    streak: 1,
    lastCompletedISO: today,
  };
}

/**
 * Reverts completion for today (undo action).
 * Reverts the streak to the previous state.
 */
export function undoHabitCompletion(habit: Habit): { streak: number; lastCompletedISO: string | null } {
  const today = getLocalDateString();
  if (habit.lastCompletedISO !== today) {
    return {
      streak: habit.streak,
      lastCompletedISO: habit.lastCompletedISO,
    };
  }

  // Decrement streak, and set last completed back to yesterday or null.
  // Since we don't know the exact history of completions, we default to null or yesterday.
  // (In practice, a simple decrement works since they can only toggle today's status).
  const newStreak = Math.max(0, habit.streak - 1);
  // We can't know for sure if they completed it yesterday without a full log,
  // so we default to null if streak is 0, otherwise yesterday.
  const prevCompleted = newStreak > 0 ? getYesterdayDateString() : null;

  return {
    streak: newStreak,
    lastCompletedISO: prevCompleted,
  };
}

/**
 * Recalculates the streak and lastCompletedISO from a list of completed dates.
 */
export function recalculateStreak(completedDates: string[]): { streak: number; lastCompletedISO: string | null } {
  if (completedDates.length === 0) {
    return { streak: 0, lastCompletedISO: null };
  }

  // Sort dates in descending order
  const sorted = [...completedDates].sort((a, b) => b.localeCompare(a));
  const lastCompletedISO = sorted[0];

  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  // If the last completed date is not today or yesterday, the active streak is 0
  if (lastCompletedISO !== today && lastCompletedISO !== yesterday) {
    return { streak: 0, lastCompletedISO };
  }

  // Count consecutive days going backwards from lastCompletedISO
  let streak = 0;
  let current = new Date(lastCompletedISO);

  // Safeguard loop to avoid infinite execution
  for (let i = 0; i < 365; i++) {
    const expectedStr = getLocalDateString(current);
    if (sorted.includes(expectedStr)) {
      streak++;
      // Move to yesterday
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return { streak, lastCompletedISO };
}

