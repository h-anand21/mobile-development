// ============================================================
// DevNest — AI Types
// ============================================================

export type AIActionType = 'explain' | 'summarize' | 'optimize' | 'refactor' | 'generate' | 'debug';

export interface AIHistoryItem {
  id: string;
  snippetId: string;
  snippetTitle?: string;  // joined from snippets table
  actionType: AIActionType;
  prompt: string;
  response: string;
  isSaved: boolean;
  createdAt: string;
}

export interface AIHistoryRow {
  id: string;
  snippetId: string;
  snippetTitle: string | null;
  actionType: string;
  prompt: string;
  response: string;
  isSaved: number;
  createdAt: string;
}

export interface AIRequest {
  snippetId: string;
  code: string;
  language: string;
  actionType: AIActionType;
}

export interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
  cached?: boolean;
}
