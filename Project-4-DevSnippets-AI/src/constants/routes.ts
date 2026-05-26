// ============================================================
// DevNest — App Routes
// ============================================================

export const ROUTES = {
  // Auth / Onboarding
  ONBOARDING: '/onboarding',
  PROFILE_SETUP: '/profile-setup',

  // Tabs
  HOME: '/(tabs)/',
  SEARCH: '/(tabs)/search',
  FILES: '/(tabs)/files',
  PROFILE: '/(tabs)/profile',
  SETTINGS: '/(tabs)/settings',

  // Stack Screens
  CREATE_SNIPPET: '/snippet/create',
  SNIPPET_DETAIL: (id: string) => `/snippet/${id}` as const,
  EDIT_SNIPPET: (id: string) => `/snippet/edit/${id}` as const,
  FOLDER_DETAIL: (id: string) => `/folder/${id}` as const,
  AI_HISTORY: '/ai-history',
  TEMPLATES: '/templates',
} as const;
