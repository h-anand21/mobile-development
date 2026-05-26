// ============================================================
// DevNest — Settings Store (Zustand + AsyncStorage)
// ============================================================
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, AppTheme, FontSize, UserProfile } from '@/types/settings.types';
import { STORAGE_KEYS } from '@/constants/storageKeys';

interface SettingsState extends AppSettings {
  userProfile: UserProfile | null;
  isLoaded: boolean;

  loadSettings: () => Promise<void>;
  setTheme: (theme: AppTheme) => Promise<void>;
  setFontSize: (size: FontSize) => Promise<void>;
  setHaptic: (enabled: boolean) => Promise<void>;
  setOnboardingDone: () => Promise<void>;
  setProfileSetupDone: () => Promise<void>;
  setUserProfile: (profile: UserProfile) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'dark',
  fontSize: 'medium',
  hapticEnabled: true,
  onboardingDone: false,
  profileSetupDone: false,
  geminiApiKey: undefined,
  userProfile: null,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const [theme, fontSize, haptic, onboarding, profileDone, profile] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.FONT_SIZE),
        AsyncStorage.getItem(STORAGE_KEYS.HAPTIC_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE_SETUP_DONE),
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
      ]);

      set({
        theme: (theme as AppTheme) ?? 'dark',
        fontSize: (fontSize as FontSize) ?? 'medium',
        hapticEnabled: haptic !== 'false',
        onboardingDone: onboarding === 'true',
        profileSetupDone: profileDone === 'true',
        userProfile: profile ? JSON.parse(profile) : null,
        isLoaded: true,
      });
    } catch {
      set({ isLoaded: true });
    }
  },

  setTheme: async (theme) => {
    set({ theme });
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  setFontSize: async (fontSize) => {
    set({ fontSize });
    await AsyncStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSize);
  },

  setHaptic: async (hapticEnabled) => {
    set({ hapticEnabled });
    await AsyncStorage.setItem(STORAGE_KEYS.HAPTIC_ENABLED, String(hapticEnabled));
  },

  setOnboardingDone: async () => {
    set({ onboardingDone: true });
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
  },

  setProfileSetupDone: async () => {
    set({ profileSetupDone: true });
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_SETUP_DONE, 'true');
  },

  setUserProfile: async (profile) => {
    set({ userProfile: profile });
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },
}));
