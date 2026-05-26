// ============================================================
// DevNest — SQLite Schema (CREATE TABLE strings)
// ============================================================

export const CREATE_FOLDERS_TABLE = `
  CREATE TABLE IF NOT EXISTS folders (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    color       TEXT NOT NULL DEFAULT '#39D353',
    icon        TEXT NOT NULL DEFAULT 'Folder',
    createdAt   TEXT NOT NULL
  );
`;

export const CREATE_SNIPPETS_TABLE = `
  CREATE TABLE IF NOT EXISTS snippets (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL DEFAULT '',
    language    TEXT NOT NULL DEFAULT 'JavaScript',
    tags        TEXT NOT NULL DEFAULT '[]',
    description TEXT,
    isFavorite  INTEGER NOT NULL DEFAULT 0,
    isPinned    INTEGER NOT NULL DEFAULT 0,
    isDeleted   INTEGER NOT NULL DEFAULT 0,
    folderId    TEXT REFERENCES folders(id) ON DELETE SET NULL,
    createdAt   TEXT NOT NULL,
    updatedAt   TEXT NOT NULL
  );
`;

export const CREATE_FILES_TABLE = `
  CREATE TABLE IF NOT EXISTS files (
    id          TEXT PRIMARY KEY,
    snippetId   TEXT REFERENCES snippets(id) ON DELETE CASCADE,
    folderId    TEXT REFERENCES folders(id) ON DELETE SET NULL,
    fileName    TEXT NOT NULL,
    filePath    TEXT NOT NULL,
    fileType    TEXT NOT NULL DEFAULT 'document',
    mimeType    TEXT,
    sizeBytes   INTEGER,
    createdAt   TEXT NOT NULL
  );
`;

export const CREATE_AI_HISTORY_TABLE = `
  CREATE TABLE IF NOT EXISTS ai_history (
    id          TEXT PRIMARY KEY,
    snippetId   TEXT NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
    actionType  TEXT NOT NULL,
    prompt      TEXT NOT NULL,
    response    TEXT NOT NULL,
    isSaved     INTEGER NOT NULL DEFAULT 0,
    createdAt   TEXT NOT NULL
  );
`;

// Indexes for performance
export const CREATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_snippets_isFavorite ON snippets(isFavorite);`,
  `CREATE INDEX IF NOT EXISTS idx_snippets_isDeleted  ON snippets(isDeleted);`,
  `CREATE INDEX IF NOT EXISTS idx_snippets_isPinned   ON snippets(isPinned);`,
  `CREATE INDEX IF NOT EXISTS idx_snippets_folderId   ON snippets(folderId);`,
  `CREATE INDEX IF NOT EXISTS idx_snippets_language   ON snippets(language);`,
  `CREATE INDEX IF NOT EXISTS idx_ai_history_snippetId ON ai_history(snippetId);`,
  `CREATE INDEX IF NOT EXISTS idx_files_snippetId     ON files(snippetId);`,
];
