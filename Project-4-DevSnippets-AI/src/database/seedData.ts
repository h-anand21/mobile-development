// ============================================================
// DevNest — Seed Data (Templates preloaded on first launch)
// ============================================================
import { insertSnippet } from '@/database/queries/snippets.queries';
import { insertFolder } from '@/database/queries/folders.queries';
import { generateId } from '@/utils/helpers/idGenerator';
import { stringifyTags } from '@/utils/helpers/tagParser';
import { nowISO } from '@/utils/formatters/dateFormatter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';

const SEED_FOLDERS = [
  { name: 'React Hooks', color: '#58A6FF', icon: 'Code' },
  { name: 'API Utils',   color: '#39D353', icon: 'Globe' },
  { name: 'SQL Queries', color: '#D29922', icon: 'Database' },
];

const SEED_SNIPPETS = [
  {
    title: 'React useState Hook',
    content: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  );
}`,
    language: 'JavaScript',
    tags: ['react', 'hook', 'state'],
    description: 'Basic useState hook example with counter functionality.',
    isFavorite: 1,
    folderName: 'React Hooks',
  },
  {
    title: 'Fetch API with Async/Await',
    content: `const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
};`,
    language: 'JavaScript',
    tags: ['fetch', 'api', 'async', 'await'],
    description: 'Reusable fetch wrapper with error handling.',
    isFavorite: 0,
    folderName: 'API Utils',
  },
  {
    title: 'Custom useLocalStorage Hook',
    content: `import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue] as const;
}`,
    language: 'TypeScript',
    tags: ['hook', 'typescript', 'localstorage', 'custom'],
    description: 'Typed useLocalStorage hook for persistent state.',
    isFavorite: 1,
    folderName: 'React Hooks',
  },
  {
    title: 'Express API Route',
    content: `const express = require('express');
const router = express.Router();

router.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;`,
    language: 'JavaScript',
    tags: ['express', 'api', 'route', 'backend'],
    description: 'Express.js GET route with error handling.',
    isFavorite: 0,
    folderName: 'API Utils',
  },
  {
    title: 'SQL SELECT with JOIN',
    content: `SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(o.id) AS order_count,
  SUM(o.total) AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.active = 1
  AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC
LIMIT 10;`,
    language: 'SQL',
    tags: ['sql', 'query', 'join', 'aggregate'],
    description: 'SQL query to get top 10 users by spending in last 30 days.',
    isFavorite: 0,
    folderName: 'SQL Queries',
  },
  {
    title: 'useEffect Cleanup',
    content: `import { useEffect, useState } from 'react';

function DataComponent({ id }: { id: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    fetchData(id).then(result => {
      if (!cancelled) setData(result);
    });

    // Cleanup prevents state updates after unmount
    return () => { cancelled = true; };
  }, [id]);

  return <div>{JSON.stringify(data)}</div>;
}`,
    language: 'TypeScript',
    tags: ['react', 'hook', 'effect', 'cleanup'],
    description: 'useEffect with proper cleanup to prevent memory leaks.',
    isFavorite: 1,
    folderName: 'React Hooks',
  },
];

export async function seedDatabase(): Promise<void> {
  try {
    const alreadySeeded = await AsyncStorage.getItem(STORAGE_KEYS.SEED_DONE);
    if (alreadySeeded === 'true') return;

    const now = nowISO();

    // Create folders first
    const folderMap: Record<string, string> = {};
    for (const f of SEED_FOLDERS) {
      const folderId = generateId();
      folderMap[f.name] = folderId;
      await insertFolder({ id: folderId, name: f.name, color: f.color, icon: f.icon, createdAt: now });
    }

    // Create snippets
    for (const s of SEED_SNIPPETS) {
      await insertSnippet({
        id: generateId(),
        title: s.title,
        content: s.content,
        language: s.language,
        tags: stringifyTags(s.tags),
        description: s.description,
        isFavorite: s.isFavorite,
        isPinned: 0,
        isDeleted: 0,
        folderId: folderMap[s.folderName] ?? null,
        createdAt: now,
        updatedAt: now,
      });
    }

    await AsyncStorage.setItem(STORAGE_KEYS.SEED_DONE, 'true');
    console.log('[DevNest] ✅ Seed data inserted successfully');
  } catch (error) {
    console.error('[DevNest] ❌ Seed failed:', error);
  }
}
