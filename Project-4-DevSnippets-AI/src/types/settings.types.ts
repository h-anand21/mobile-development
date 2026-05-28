// ============================================================
// DevNest — Settings & App Types
// ============================================================

export type AppTheme = 'dark' | 'light';
export type FontSize = 'small' | 'medium' | 'large';

export interface UserProfile {
  name: string;
  avatarIndex: number; // index into AVATARS array
}

export interface AppSettings {
  theme: AppTheme;
  fontSize: FontSize;
  hapticEnabled: boolean;
  onboardingDone: boolean;
  profileSetupDone: boolean;
  geminiApiKey?: string;
  enabledLanguages?: string[];
}
