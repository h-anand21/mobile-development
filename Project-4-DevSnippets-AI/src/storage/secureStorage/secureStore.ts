// ============================================================
// DevNest — SecureStore wrapper (for Gemini API key)
// ============================================================
import * as SecureStore from 'expo-secure-store';
import { SECURE_KEYS } from '@/constants/storageKeys';

export async function saveApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEYS.GEMINI_API_KEY, key);
}

export async function getApiKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(SECURE_KEYS.GEMINI_API_KEY);
}

export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_KEYS.GEMINI_API_KEY);
}
