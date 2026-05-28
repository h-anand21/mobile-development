// ============================================================
// DevNest — Snippet Types
// ============================================================

export type Language =
  | 'JavaScript'
  | 'TypeScript'
  | 'Python'
  | 'Java'
  | 'C#'
  | 'C++'
  | 'C'
  | 'Go'
  | 'Rust'
  | 'PHP'
  | 'Ruby'
  | 'Swift'
  | 'Kotlin'
  | 'Dart'
  | 'SQL'
  | 'HTML'
  | 'CSS'
  | 'Shell'
  | 'Bash'
  | 'PowerShell'
  | 'Markdown'
  | 'JSON'
  | 'YAML'
  | 'GraphQL'
  | 'Vue'
  | 'Svelte'
  | 'Dockerfile'
  | 'Solidity'
  | 'Elixir'
  | 'Groovy'
  | 'Lua'
  | 'Julia'
  | 'Scala'
  | 'Haskell'
  | 'Perl'
  | 'R'
  | 'Objective-C'
  | 'Assembly'
  | 'Other';

export interface Snippet {
  id: string;
  title: string;
  content: string;
  language: Language;
  tags: string[];       // stored as JSON string in SQLite
  description?: string;
  isFavorite: boolean;
  isPinned: boolean;
  isDeleted: boolean;
  folderId?: string;    // optional folder association
  createdAt: string;    // ISO string
  updatedAt: string;    // ISO string
}

// Raw row from SQLite (tags are JSON string)
export interface SnippetRow {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string;         // JSON string e.g. '["api","fetch"]'
  description: string | null;
  isFavorite: number;   // 0 or 1
  isPinned: number;
  isDeleted: number;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSnippetInput {
  title: string;
  content: string;
  language: Language;
  tags?: string[];
  description?: string;
  folderId?: string;
}

export interface UpdateSnippetInput extends Partial<CreateSnippetInput> {
  isFavorite?: boolean;
  isPinned?: boolean;
}

export type SnippetSortBy = 'newest' | 'oldest' | 'title' | 'language';
export type SnippetFilter = 'all' | 'favorites' | 'recent' | 'pinned';
