// ============================================================
// DevNest — Settings Store (Zustand + AsyncStorage)
// ============================================================
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, AppTheme, FontSize, UserProfile } from '@/types/settings.types';
import { STORAGE_KEYS } from '@/constants/storageKeys';

// Default standard list of languages to initialize
const DEFAULT_LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'Go', 'Rust',
  'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'SQL', 'HTML', 'CSS', 'Shell', 'Bash', 'PowerShell',
  'Markdown', 'JSON', 'YAML', 'GraphQL', 'Vue', 'Svelte', 'Dockerfile', 'Solidity', 'Elixir', 'Groovy', 
  'Lua', 'Julia', 'Scala', 'Haskell', 'Perl', 'R', 'Objective-C', 'Assembly', 'Other'
];

interface SettingsState extends AppSettings {
  userProfile: UserProfile | null;
  isLoaded: boolean;
  enabledLanguages: string[];

  geminiApiKey: string | undefined;
  aiModel: string;

  loadSettings: () => Promise<void>;
  setTheme: (theme: AppTheme) => Promise<void>;
  setFontSize: (size: FontSize) => Promise<void>;
  setHaptic: (enabled: boolean) => Promise<void>;
  setOnboardingDone: () => Promise<void>;
  setProfileSetupDone: () => Promise<void>;
  setUserProfile: (profile: UserProfile) => Promise<void>;
  setGeminiApiKey: (key: string) => Promise<void>;
  setAiModel: (model: string) => Promise<void>;
  setEnabledLanguages: (langs: string[]) => Promise<void>;
  logout: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'dark',
  fontSize: 'medium',
  hapticEnabled: true,
  onboardingDone: false,
  profileSetupDone: false,
  geminiApiKey: undefined,
  aiModel: 'gemini-2.5-flash',
  userProfile: null,
  enabledLanguages: DEFAULT_LANGUAGES,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const [theme, fontSize, haptic, onboarding, profileDone, profile, enabledLangs, storedModel] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.FONT_SIZE),
        AsyncStorage.getItem(STORAGE_KEYS.HAPTIC_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE_SETUP_DONE),
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
        AsyncStorage.getItem('devnest_enabled_languages'),
        AsyncStorage.getItem('devnest_ai_model'),
      ]);

      let geminiKey = undefined;
      try {
        const SecureStore = require('expo-secure-store');
        const key = await SecureStore.getItemAsync('devnest_gemini_key');
        if (key) geminiKey = key;
      } catch (e) {}

      set({
        theme: (theme as AppTheme) ?? 'dark',
        fontSize: (fontSize as FontSize) ?? 'medium',
        hapticEnabled: haptic !== 'false',
        onboardingDone: onboarding === 'true',
        profileSetupDone: profileDone === 'true',
        userProfile: profile ? JSON.parse(profile) : null,
        geminiApiKey: geminiKey,
        aiModel: storedModel || 'gemini-2.5-flash',
        enabledLanguages: enabledLangs ? JSON.parse(enabledLangs) : DEFAULT_LANGUAGES,
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

  setGeminiApiKey: async (key) => {
    try {
      const SecureStore = require('expo-secure-store');
      if (key) {
        await SecureStore.setItemAsync('devnest_gemini_key', key);
      } else {
        await SecureStore.deleteItemAsync('devnest_gemini_key');
      }
      set({ geminiApiKey: key });
    } catch (e) {
      console.error('Failed to save API key', e);
    }
  },

  setAiModel: async (model) => {
    set({ aiModel: model });
    await AsyncStorage.setItem('devnest_ai_model', model);
  },

  setEnabledLanguages: async (langs) => {
    set({ enabledLanguages: langs });
    await AsyncStorage.setItem('devnest_enabled_languages', JSON.stringify(langs));
  },

  logout: async () => {
    set({ 
      userProfile: null, 
      profileSetupDone: false,
    });
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    await AsyncStorage.removeItem(STORAGE_KEYS.PROFILE_SETUP_DONE);
  },
}));
