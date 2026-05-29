// ============================================================
// DevNest — App Config
// ============================================================

export const APP_CONFIG = {
  name: 'DevNest',
  version: '1.0.0',
  dbName: 'devnest.db',
  dbVersion: 1,
  aiModel: 'gemini-2.0-flash',
  aiApiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  searchDebounceMs: 300,
  maxTagsPerSnippet: 10,
  maxDescriptionLength: 500,
  maxRecentSearches: 10,
} as const;

export const FILE_PATHS = {
  snippets: 'snippets/',
  exports: 'exports/',
  screenshots: 'screenshots/',
  templates: 'templates/',
  backups: 'backups/',
} as const;

export const FOLDER_COLORS = [
  '#58A6FF', // Blue
  '#39D353', // Green
  '#D29922', // Yellow
  '#FF5252', // Red
  '#A371F7', // Purple
  '#FF66B2', // Pink
  '#FF9800', // Orange
] as const;

export const FOLDER_ICONS = [
  'Folder', 'FolderOpen', 'Code', 'Globe', 'Database',
  'Cpu', 'Layers', 'Package', 'BookOpen', 'Star',
] as const;
