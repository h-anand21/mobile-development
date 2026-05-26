// ============================================================
// DevNest — Storage Keys
// ============================================================

export const STORAGE_KEYS = {
  THEME: 'devnest_theme',
  FONT_SIZE: 'devnest_font_size',
  HAPTIC_ENABLED: 'devnest_haptic',
  ONBOARDING_DONE: 'devnest_onboarding_done',
  PROFILE_SETUP_DONE: 'devnest_profile_setup_done',
  SEED_DONE: 'devnest_seed_done',
  USER_PROFILE: 'devnest_user_profile',
  RECENT_SEARCHES: 'devnest_recent_searches',
} as const;

export const SECURE_KEYS = {
  GEMINI_API_KEY: 'devnest_gemini_key',
} as const;
