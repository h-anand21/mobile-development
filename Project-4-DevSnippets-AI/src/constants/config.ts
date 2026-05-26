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
  '#39D353', // green
  '#58A6FF', // blue
  '#F78166', // red
  '#D29922', // yellow
  '#BC8CFF', // purple
  '#FA7343', // orange
  '#39C5BB', // teal
  '#F9826C', // salmon
] as const;

export const FOLDER_ICONS = [
  'Folder', 'FolderOpen', 'Code', 'Globe', 'Database',
  'Cpu', 'Layers', 'Package', 'BookOpen', 'Star',
] as const;
