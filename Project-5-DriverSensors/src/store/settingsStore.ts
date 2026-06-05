import { create } from 'zustand';
import { storage } from '../database/storage';

export interface SettingsState {
  // Permissions (primarily managed by system, stored as status indicators)
  permissions: {
    location: string;
    notifications: string;
    motion: string;
    phoneUsage: string;
    backgroundRefresh: string;
  };
  
  // Thresholds
  harshBraking: number;      // m/s^2 (range -1.0 to -5.0)
  sharpTurn: number;         // degrees (range 15 to 60)
  speeding: number;          // km/h tolerance (range 0 to 30)
  phoneUsage: number;        // seconds limit (range 2 to 15)
  
  // Notifications toggles
  reminders: boolean;
  weeklyReports: boolean;
  achievements: boolean;
  safetyAlerts: boolean;
  
  // Customization
  selectedTheme: 'light' | 'dark' | 'system';
  selectedAccent: number;    // index: 0=Blue, 1=Green, 2=Purple, 3=Yellow, 4=Red, 5=Cyan
  units: 'metric' | 'imperial';

  // Actions
  setPermission: (key: keyof SettingsState['permissions'], value: string) => void;
  setThreshold: (key: 'harshBraking' | 'sharpTurn' | 'speeding' | 'phoneUsage', value: number) => void;
  setNotification: (key: 'reminders' | 'weeklyReports' | 'achievements' | 'safetyAlerts', value: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (index: number) => void;
  setUnits: (units: 'metric' | 'imperial') => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  permissions: {
    location: 'Always Allow',
    notifications: 'Allowed',
    motion: 'Allowed',
    phoneUsage: 'Allowed',
    backgroundRefresh: 'Allowed',
  },
  harshBraking: -3.0,
  sharpTurn: 35,
  speeding: 10,
  phoneUsage: 5,
  reminders: true,
  weeklyReports: true,
  achievements: true,
  safetyAlerts: true,
  selectedTheme: 'dark' as const,
  selectedAccent: 2, // Purple
  units: 'metric' as const,
};

// Load initial state from MMKV storage if available
const loadInitialState = () => {
  try {
    const saved = storage.getString('user_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load settings from storage', error);
  }
  return DEFAULT_SETTINGS;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...loadInitialState(),

  setPermission: (key, value) => {
    set((state) => {
      const newPermissions = { ...state.permissions, [key]: value };
      const updated = { ...state, permissions: newPermissions };
      storage.set('user_settings', JSON.stringify({
        harshBraking: updated.harshBraking,
        sharpTurn: updated.sharpTurn,
        speeding: updated.speeding,
        phoneUsage: updated.phoneUsage,
        reminders: updated.reminders,
        weeklyReports: updated.weeklyReports,
        achievements: updated.achievements,
        selectedTheme: updated.selectedTheme,
        selectedAccent: updated.selectedAccent,
        units: updated.units,
      }));
      return { permissions: newPermissions };
    });
  },

  setThreshold: (key, value) => {
    set((state) => {
      const updated = { ...state, [key]: value };
      storage.set('user_settings', JSON.stringify({
        harshBraking: updated.harshBraking,
        sharpTurn: updated.sharpTurn,
        speeding: updated.speeding,
        phoneUsage: updated.phoneUsage,
        reminders: updated.reminders,
        weeklyReports: updated.weeklyReports,
        achievements: updated.achievements,
        selectedTheme: updated.selectedTheme,
        selectedAccent: updated.selectedAccent,
        units: updated.units,
      }));
      return { [key]: value };
    });
  },

  setNotification: (key, value) => {
    set((state) => {
      const updated = { ...state, [key]: value };
      storage.set('user_settings', JSON.stringify({
        harshBraking: updated.harshBraking,
        sharpTurn: updated.sharpTurn,
        speeding: updated.speeding,
        phoneUsage: updated.phoneUsage,
        reminders: updated.reminders,
        weeklyReports: updated.weeklyReports,
        achievements: updated.achievements,
        selectedTheme: updated.selectedTheme,
        selectedAccent: updated.selectedAccent,
        units: updated.units,
      }));
      return { [key]: value };
    });
  },

  setTheme: (theme) => {
    set((state) => {
      const updated = { ...state, selectedTheme: theme };
      storage.set('user_settings', JSON.stringify({
        harshBraking: updated.harshBraking,
        sharpTurn: updated.sharpTurn,
        speeding: updated.speeding,
        phoneUsage: updated.phoneUsage,
        reminders: updated.reminders,
        weeklyReports: updated.weeklyReports,
        achievements: updated.achievements,
        selectedTheme: updated.selectedTheme,
        selectedAccent: updated.selectedAccent,
        units: updated.units,
      }));
      return { selectedTheme: theme };
    });
  },

  setAccentColor: (index) => {
    set((state) => {
      const updated = { ...state, selectedAccent: index };
      storage.set('user_settings', JSON.stringify({
        harshBraking: updated.harshBraking,
        sharpTurn: updated.sharpTurn,
        speeding: updated.speeding,
        phoneUsage: updated.phoneUsage,
        reminders: updated.reminders,
        weeklyReports: updated.weeklyReports,
        achievements: updated.achievements,
        selectedTheme: updated.selectedTheme,
        selectedAccent: updated.selectedAccent,
        units: updated.units,
      }));
      return { selectedAccent: index };
    });
  },

  setUnits: (units) => {
    set((state) => {
      const updated = { ...state, units };
      storage.set('user_settings', JSON.stringify({
        harshBraking: updated.harshBraking,
        sharpTurn: updated.sharpTurn,
        speeding: updated.speeding,
        phoneUsage: updated.phoneUsage,
        reminders: updated.reminders,
        weeklyReports: updated.weeklyReports,
        achievements: updated.achievements,
        selectedTheme: updated.selectedTheme,
        selectedAccent: updated.selectedAccent,
        units: updated.units,
      }));
      return { units };
    });
  },

  resetToDefaults: () => {
    set(DEFAULT_SETTINGS);
    storage.set('user_settings', JSON.stringify({
      harshBraking: DEFAULT_SETTINGS.harshBraking,
      sharpTurn: DEFAULT_SETTINGS.sharpTurn,
      speeding: DEFAULT_SETTINGS.speeding,
      phoneUsage: DEFAULT_SETTINGS.phoneUsage,
      reminders: DEFAULT_SETTINGS.reminders,
      weeklyReports: DEFAULT_SETTINGS.weeklyReports,
      achievements: DEFAULT_SETTINGS.achievements,
      selectedTheme: DEFAULT_SETTINGS.selectedTheme,
      selectedAccent: DEFAULT_SETTINGS.selectedAccent,
      units: DEFAULT_SETTINGS.units,
    }));
  },
}));
