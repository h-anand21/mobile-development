// ============================================================
// DevNest — AI Store (Zustand)
// ============================================================
import { create } from 'zustand';
import { AIHistoryItem, AIHistoryRow, AIActionType, AIRequest, AIResponse } from '@/types/ai.types';
import { generateId } from '@/utils/helpers/idGenerator';
import { nowISO } from '@/utils/formatters/dateFormatter';
import * as AIQ from '@/database/queries/ai.queries';
import * as SecureStore from 'expo-secure-store';
import { SECURE_KEYS } from '@/constants/storageKeys';
import { APP_CONFIG } from '@/constants/config';

function rowToItem(row: AIHistoryRow): AIHistoryItem {
  return {
    ...row,
    isSaved: row.isSaved === 1,
    actionType: row.actionType as AIActionType,
    snippetTitle: row.snippetTitle ?? undefined,
  };
}

function buildPrompt(code: string, language: string, action: AIActionType): string {
  const prompts: Record<AIActionType, string> = {
    explain: `Explain this ${language} code clearly and concisely:\n\n\`\`\`${language}\n${code}\n\`\`\``,
    summarize: `Summarize what this ${language} code does in 2-3 sentences:\n\n\`\`\`${language}\n${code}\n\`\`\``,
    optimize: `Suggest optimizations for this ${language} code and explain why:\n\n\`\`\`${language}\n${code}\n\`\`\``,
    refactor: `Refactor this ${language} code for better readability and maintainability:\n\n\`\`\`${language}\n${code}\n\`\`\``,
    generate: `Generate a useful ${language} code snippet related to:\n\n${code}`,
    debug: `Find and fix bugs in this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
  };
  return prompts[action];
}

interface AIState {
  history: AIHistoryItem[];
  isLoading: boolean;
  error: string | null;
  currentFilter: AIActionType | 'all';

  loadHistory: () => Promise<void>;
  askAI: (request: AIRequest) => Promise<AIResponse>;
  toggleSaved: (id: string) => Promise<void>;
  deleteHistory: (id: string) => Promise<void>;
  setFilter: (filter: AIActionType | 'all') => void;
  clearError: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  history: [],
  isLoading: false,
  error: null,
  currentFilter: 'all',

  loadHistory: async () => {
    try {
      const rows = await AIQ.getAllAIHistory();
      set({ history: rows.map(rowToItem) });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  askAI: async ({ snippetId, code, language, actionType }) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Check cache first
      const cached = await AIQ.getCachedAIResponse(snippetId, actionType);
      if (cached) {
        set({ isLoading: false });
        return { success: true, response: cached.response, cached: true };
      }

      // 2. Get API key
      let apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        const secureKey = await SecureStore.getItemAsync(SECURE_KEYS.GEMINI_API_KEY);
        apiKey = secureKey ? secureKey : undefined;
      }

      if (!apiKey) {
        set({ isLoading: false, error: 'API key not set. Add it in Settings.' });
        return { success: false, error: 'API key not set. Go to Settings to add your Gemini API key.' };
      }

      // 3. Call Gemini
      const prompt = buildPrompt(code, language, actionType);
      const url = `${APP_CONFIG.aiApiBaseUrl}/${APP_CONFIG.aiModel}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error?.message ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      const response: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response received.';

      // 4. Cache the response
      const row: AIHistoryRow = {
        id: generateId(),
        snippetId,
        snippetTitle: null,
        actionType,
        prompt,
        response,
        isSaved: 0,
        createdAt: nowISO(),
      };
      await AIQ.insertAIHistory(row);
      set(state => ({
        history: [rowToItem(row), ...state.history],
        isLoading: false,
      }));

      return { success: true, response };
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      return { success: false, error: e.message };
    }
  },

  toggleSaved: async (id) => {
    const item = get().history.find(h => h.id === id);
    if (!item) return;
    const newValue = !item.isSaved;
    await AIQ.toggleAIHistorySaved(id, newValue);
    set(state => ({
      history: state.history.map(h => h.id === id ? { ...h, isSaved: newValue } : h),
    }));
  },

  deleteHistory: async (id) => {
    await AIQ.deleteAIHistory(id);
    set(state => ({ history: state.history.filter(h => h.id !== id) }));
  },

  setFilter: (currentFilter) => set({ currentFilter }),
  clearError: () => set({ error: null }),
}));
