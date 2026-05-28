// ============================================================
// DevNest — Snippet SQL Queries
// ============================================================
import { getDB } from '../db';
import { SnippetRow } from '@/types/snippet.types';

// ---- READ ----

export async function getAllSnippets(): Promise<SnippetRow[]> {
  const db = getDB();
  return await db.getAllAsync<SnippetRow>(
    `SELECT * FROM snippets WHERE isDeleted = 0 ORDER BY isPinned DESC, updatedAt DESC`
  );
}

export async function getSnippetById(id: string): Promise<SnippetRow | null> {
  const db = getDB();
  return await db.getFirstAsync<SnippetRow>(
    `SELECT * FROM snippets WHERE id = ? AND isDeleted = 0`,
    [id]
  );
}

export async function getFavoriteSnippets(): Promise<SnippetRow[]> {
  const db = getDB();
  return await db.getAllAsync<SnippetRow>(
    `SELECT * FROM snippets WHERE isFavorite = 1 AND isDeleted = 0 ORDER BY updatedAt DESC`
  );
}

export async function getSnippetsByFolder(folderId: string): Promise<SnippetRow[]> {
  const db = getDB();
  return await db.getAllAsync<SnippetRow>(
    `SELECT * FROM snippets WHERE folderId = ? AND isDeleted = 0 ORDER BY updatedAt DESC`,
    [folderId]
  );
}

export async function searchSnippets(query: string): Promise<SnippetRow[]> {
  const db = getDB();
  const q = `%${query}%`;
  return await db.getAllAsync<SnippetRow>(
    `SELECT * FROM snippets 
     WHERE isDeleted = 0 
       AND (title LIKE ? OR content LIKE ? OR tags LIKE ? OR language LIKE ?)
     ORDER BY isPinned DESC, updatedAt DESC`,
    [q, q, q, q]
  );
}

export async function getRecentSnippets(limit = 10): Promise<SnippetRow[]> {
  const db = getDB();
  return await db.getAllAsync<SnippetRow>(
    `SELECT * FROM snippets WHERE isDeleted = 0 ORDER BY updatedAt DESC LIMIT ?`,
    [limit]
  );
}

export async function getSnippetsCount(): Promise<number> {
  const db = getDB();
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM snippets WHERE isDeleted = 0`
  );
  return result?.count ?? 0;
}

export async function getFavoritesCount(): Promise<number> {
  const db = getDB();
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM snippets WHERE isFavorite = 1 AND isDeleted = 0`
  );
  return result?.count ?? 0;
}

// ---- CREATE ----

export async function insertSnippet(snippet: SnippetRow): Promise<void> {
  const db = getDB();
  await db.runAsync(
    `INSERT INTO snippets 
      (id, title, content, language, tags, description, isFavorite, isPinned, isDeleted, folderId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      snippet.id,
      snippet.title,
      snippet.content,
      snippet.language,
      snippet.tags,
      snippet.description ?? null,
      snippet.isFavorite,
      snippet.isPinned,
      snippet.isDeleted,
      snippet.folderId ?? null,
      snippet.createdAt,
      snippet.updatedAt,
    ]
  );
}

// ---- UPDATE ----

export async function updateSnippet(id: string, updates: Partial<SnippetRow>): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();
  const fields = Object.keys(updates)
    .filter(k => k !== 'id')
    .map(k => `${k} = ?`)
    .join(', ');
  const values = Object.values(updates).filter((_, i) => Object.keys(updates)[i] !== 'id');

  await db.runAsync(
    `UPDATE snippets SET ${fields}, updatedAt = ? WHERE id = ?`,
    [...values, now, id]
  );
}

export async function toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE snippets SET isFavorite = ?, updatedAt = ? WHERE id = ?`,
    [isFavorite ? 1 : 0, now, id]
  );
}

export async function togglePin(id: string, isPinned: boolean): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE snippets SET isPinned = ?, updatedAt = ? WHERE id = ?`,
    [isPinned ? 1 : 0, now, id]
  );
}

// ---- DELETE (Soft) ----

export async function softDeleteSnippet(id: string): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE snippets SET isDeleted = 1, updatedAt = ? WHERE id = ?`,
    [now, id]
  );
}

export async function hardDeleteSnippet(id: string): Promise<void> {
  const db = getDB();
  await db.runAsync(`DELETE FROM snippets WHERE id = ?`, [id]);
}

export async function restoreSnippet(id: string): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE snippets SET isDeleted = 0, updatedAt = ? WHERE id = ?`,
    [now, id]
  );
}

export async function getDeletedSnippets(): Promise<SnippetRow[]> {
  const db = getDB();
  return await db.getAllAsync<SnippetRow>(
    `SELECT * FROM snippets WHERE isDeleted = 1 ORDER BY updatedAt DESC`
  );
}

export async function autoCleanDeletedSnippets(): Promise<void> {
  const db = getDB();
  await db.runAsync(
    `DELETE FROM snippets WHERE isDeleted = 1 AND datetime(updatedAt) < datetime('now', '-30 days')`
  );
}
