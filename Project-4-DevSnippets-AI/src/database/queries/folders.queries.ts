// ============================================================
// DevNest — Folder SQL Queries
// ============================================================
import { getDB } from '../db';
import { FolderRow } from '@/types/file.types';

export async function getAllFolders(): Promise<(FolderRow & { snippetCount: number })[]> {
  const db = getDB();
  return await db.getAllAsync(
    `SELECT f.*, COUNT(s.id) as snippetCount
     FROM folders f
     LEFT JOIN snippets s ON s.folderId = f.id AND s.isDeleted = 0
     GROUP BY f.id
     ORDER BY f.createdAt DESC`
  );
}

export async function getFolderById(id: string): Promise<FolderRow | null> {
  const db = getDB();
  return await db.getFirstAsync<FolderRow>(
    `SELECT * FROM folders WHERE id = ?`, [id]
  );
}

export async function insertFolder(folder: FolderRow): Promise<void> {
  const db = getDB();
  await db.runAsync(
    `INSERT INTO folders (id, name, color, icon, createdAt) VALUES (?, ?, ?, ?, ?)`,
    [folder.id, folder.name, folder.color, folder.icon, folder.createdAt]
  );
}

export async function updateFolder(id: string, updates: Partial<FolderRow>): Promise<void> {
  const db = getDB();
  const fields = Object.keys(updates).filter(k => k !== 'id').map(k => `${k} = ?`).join(', ');
  const values = Object.entries(updates).filter(([k]) => k !== 'id').map(([, v]) => v);
  await db.runAsync(`UPDATE folders SET ${fields} WHERE id = ?`, [...values, id]);
}

export async function deleteFolder(id: string): Promise<void> {
  const db = getDB();
  // Unlink snippets from this folder before deleting
  await db.runAsync(`UPDATE snippets SET folderId = NULL WHERE folderId = ?`, [id]);
  await db.runAsync(`DELETE FROM folders WHERE id = ?`, [id]);
}

export async function getFoldersCount(): Promise<number> {
  const db = getDB();
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM folders`
  );
  return result?.count ?? 0;
}
