// ============================================================
// DevNest — Folder Store (Zustand)
// ============================================================
import { create } from 'zustand';
import { DevNestFolder, FolderRow } from '@/types/file.types';
import { generateId } from '@/utils/helpers/idGenerator';
import { nowISO } from '@/utils/formatters/dateFormatter';
import * as FQ from '@/database/queries/folders.queries';

function rowToFolder(row: FolderRow & { snippetCount?: number }): DevNestFolder {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    snippetCount: row.snippetCount ?? 0,
    createdAt: row.createdAt,
  };
}

interface FolderState {
  folders: DevNestFolder[];
  isLoading: boolean;

  loadFolders: () => Promise<void>;
  createFolder: (name: string, color: string, icon: string) => Promise<DevNestFolder>;
  updateFolder: (id: string, updates: Partial<Pick<DevNestFolder, 'name' | 'color' | 'icon'>>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  getFolderById: (id: string) => DevNestFolder | undefined;
}

export const useFolderStore = create<FolderState>((set, get) => ({
  folders: [],
  isLoading: false,

  loadFolders: async () => {
    set({ isLoading: true });
    try {
      const rows = await FQ.getAllFolders();
      set({ folders: rows.map(rowToFolder), isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createFolder: async (name, color, icon) => {
    const row: FolderRow = { id: generateId(), name, color, icon, createdAt: nowISO() };
    await FQ.insertFolder(row);
    const folder = rowToFolder(row);
    set(state => ({ folders: [folder, ...state.folders] }));
    return folder;
  },

  updateFolder: async (id, updates) => {
    await FQ.updateFolder(id, updates);
    set(state => ({
      folders: state.folders.map(f => f.id === id ? { ...f, ...updates } : f),
    }));
  },

  deleteFolder: async (id) => {
    await FQ.deleteFolder(id);
    set(state => ({ folders: state.folders.filter(f => f.id !== id) }));
  },

  getFolderById: (id) => get().folders.find(f => f.id === id),
}));
