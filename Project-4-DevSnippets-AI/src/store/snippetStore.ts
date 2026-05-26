// ============================================================
// DevNest — Snippet Store (Zustand)
// ============================================================
import { create } from 'zustand';
import { Snippet, SnippetRow, CreateSnippetInput, UpdateSnippetInput, SnippetFilter, SnippetSortBy, Language } from '@/types/snippet.types';
import { parseTags, stringifyTags } from '@/utils/helpers/tagParser';
import { generateId } from '@/utils/helpers/idGenerator';
import { nowISO } from '@/utils/formatters/dateFormatter';
import * as Q from '@/database/queries/snippets.queries';

// Convert raw DB row → Snippet object
function rowToSnippet(row: SnippetRow): Snippet {
  return {
    ...row,
    tags: parseTags(row.tags),
    isFavorite: row.isFavorite === 1,
    isPinned: row.isPinned === 1,
    isDeleted: row.isDeleted === 1,
    language: row.language as Language,
    description: row.description ?? undefined,
    folderId: row.folderId ?? undefined,
  };
}

interface SnippetState {
  snippets: Snippet[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSnippets: () => Promise<void>;
  createSnippet: (input: CreateSnippetInput) => Promise<Snippet>;
  updateSnippet: (id: string, updates: UpdateSnippetInput) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;

  // Derived (computed) — via selector helpers below
  getSnippetById: (id: string) => Snippet | undefined;
  getFavorites: () => Snippet[];
  getByFolder: (folderId: string) => Snippet[];
  getRecent: (limit?: number) => Snippet[];
}

export const useSnippetStore = create<SnippetState>((set, get) => ({
  snippets: [],
  isLoading: false,
  error: null,

  loadSnippets: async () => {
    set({ isLoading: true, error: null });
    try {
      const rows = await Q.getAllSnippets();
      set({ snippets: rows.map(rowToSnippet), isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  createSnippet: async (input) => {
    const id = generateId();
    const now = nowISO();
    const row: SnippetRow = {
      id,
      title: input.title,
      content: input.content,
      language: input.language,
      tags: stringifyTags(input.tags ?? []),
      description: input.description ?? null,
      isFavorite: 0,
      isPinned: 0,
      isDeleted: 0,
      folderId: input.folderId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await Q.insertSnippet(row);
    const snippet = rowToSnippet(row);
    set(state => ({ snippets: [snippet, ...state.snippets] }));
    return snippet;
  },

  updateSnippet: async (id, updates) => {
    const { tags, isFavorite, isPinned, ...rest } = updates;
    const dbUpdates: Partial<SnippetRow> = { ...rest };
    if (tags !== undefined) dbUpdates.tags = stringifyTags(tags);
    if (isFavorite !== undefined) dbUpdates.isFavorite = isFavorite ? 1 : 0;
    if (isPinned !== undefined) dbUpdates.isPinned = isPinned ? 1 : 0;
    await Q.updateSnippet(id, dbUpdates);
    set(state => ({
      snippets: state.snippets.map(s =>
        s.id === id ? { ...s, ...updates, updatedAt: nowISO() } : s
      ),
    }));
  },

  deleteSnippet: async (id) => {
    await Q.softDeleteSnippet(id);
    set(state => ({ snippets: state.snippets.filter(s => s.id !== id) }));
  },

  toggleFavorite: async (id) => {
    const snippet = get().snippets.find(s => s.id === id);
    if (!snippet) return;
    const newValue = !snippet.isFavorite;
    await Q.toggleFavorite(id, newValue);
    set(state => ({
      snippets: state.snippets.map(s =>
        s.id === id ? { ...s, isFavorite: newValue } : s
      ),
    }));
  },

  togglePin: async (id) => {
    const snippet = get().snippets.find(s => s.id === id);
    if (!snippet) return;
    const newValue = !snippet.isPinned;
    await Q.togglePin(id, newValue);
    set(state => ({
      snippets: state.snippets.map(s =>
        s.id === id ? { ...s, isPinned: newValue } : s
      ),
    }));
  },

  // Derived selectors
  getSnippetById: (id) => get().snippets.find(s => s.id === id),
  getFavorites: () => get().snippets.filter(s => s.isFavorite),
  getByFolder: (folderId) => get().snippets.filter(s => s.folderId === folderId),
  getRecent: (limit = 10) => [...get().snippets].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, limit),
}));
