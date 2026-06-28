export type Frequency =
  | {
      kind: 'daily';
      hour: number;
      minute: number;
    }
  | {
      kind: 'weekly';
      weekdays: number[]; // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc. (aligns with JS Date.getDay())
      hour: number;
      minute: number;
    };

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  frequency: Frequency;
  notificationIds: string[];
  streak: number;
  lastCompletedISO: string | null; // Stores ISO date string representing completion (YYYY-MM-DD)
  completedDates: string[]; // List of YYYY-MM-DD strings when completed
  createdAtISO: string;
  category?: 'health' | 'work' | 'mind' | 'body' | 'other';
  streakShields?: number;
  shieldedDates?: string[];
};
