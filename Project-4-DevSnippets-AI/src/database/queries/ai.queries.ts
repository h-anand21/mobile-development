// ============================================================
// DevNest — AI History SQL Queries
// ============================================================
import { getDB } from '../db';
import { AIHistoryRow } from '@/types/ai.types';

export async function getCachedAIResponse(
  snippetId: string,
  actionType: string
): Promise<AIHistoryRow | null> {
  const db = getDB();
  return await db.getFirstAsync<AIHistoryRow>(
    `SELECT ah.*, s.title as snippetTitle 
     FROM ai_history ah
     LEFT JOIN snippets s ON s.id = ah.snippetId
     WHERE ah.snippetId = ? AND ah.actionType = ?
     ORDER BY ah.createdAt DESC LIMIT 1`,
    [snippetId, actionType]
  );
}

export async function insertAIHistory(row: AIHistoryRow): Promise<void> {
  const db = getDB();
  await db.runAsync(
    `INSERT INTO ai_history (id, snippetId, actionType, prompt, response, isSaved, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [row.id, row.snippetId, row.actionType, row.prompt, row.response, row.isSaved, row.createdAt]
  );
}

export async function getAllAIHistory(): Promise<AIHistoryRow[]> {
  const db = getDB();
  return await db.getAllAsync<AIHistoryRow>(
    `SELECT ah.*, s.title as snippetTitle 
     FROM ai_history ah
     LEFT JOIN snippets s ON s.id = ah.snippetId
     ORDER BY ah.createdAt DESC`
  );
}

export async function getAIHistoryByAction(actionType: string): Promise<AIHistoryRow[]> {
  const db = getDB();
  return await db.getAllAsync<AIHistoryRow>(
    `SELECT ah.*, s.title as snippetTitle 
     FROM ai_history ah
     LEFT JOIN snippets s ON s.id = ah.snippetId
     WHERE ah.actionType = ?
     ORDER BY ah.createdAt DESC`,
    [actionType]
  );
}

export async function toggleAIHistorySaved(id: string, isSaved: boolean): Promise<void> {
  const db = getDB();
  await db.runAsync(
    `UPDATE ai_history SET isSaved = ? WHERE id = ?`,
    [isSaved ? 1 : 0, id]
  );
}

export async function deleteAIHistory(id: string): Promise<void> {
  const db = getDB();
  await db.runAsync(`DELETE FROM ai_history WHERE id = ?`, [id]);
}
