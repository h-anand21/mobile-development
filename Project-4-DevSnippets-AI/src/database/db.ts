// ============================================================
// DevNest — SQLite Connection & Initialization
// ============================================================
import * as SQLite from 'expo-sqlite';
import { APP_CONFIG } from '@/constants/config';
import {
  CREATE_SNIPPETS_TABLE,
  CREATE_FOLDERS_TABLE,
  CREATE_FILES_TABLE,
  CREATE_AI_HISTORY_TABLE,
  CREATE_INDEXES,
} from './schema';

let _db: SQLite.SQLiteDatabase | null = null;

export function getDB(): SQLite.SQLiteDatabase {
  if (!_db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return _db;
}

export async function initDB(): Promise<void> {
  try {
    _db = await SQLite.openDatabaseAsync(APP_CONFIG.dbName);

    // Enable WAL mode for better concurrent performance
    await _db.execAsync('PRAGMA journal_mode = WAL;');
    await _db.execAsync('PRAGMA foreign_keys = ON;');

    // Create tables
    await _db.execAsync(CREATE_FOLDERS_TABLE);
    await _db.execAsync(CREATE_SNIPPETS_TABLE);
    await _db.execAsync(CREATE_FILES_TABLE);
    await _db.execAsync(CREATE_AI_HISTORY_TABLE);

    // Create indexes
    for (const indexSQL of CREATE_INDEXES) {
      await _db.execAsync(indexSQL);
    }

    console.log('[DevNest DB] ✅ Database initialized successfully');
  } catch (error) {
    console.error('[DevNest DB] ❌ Init failed:', error);
    throw error;
  }
}

export async function closeDB(): Promise<void> {
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
}
