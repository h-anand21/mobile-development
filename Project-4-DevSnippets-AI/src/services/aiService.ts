// ============================================================
// DevNest — AI Service (Gemini REST API, RN Compatible)
// ============================================================

import * as SecureStore from 'expo-secure-store';
import { useSettingsStore } from '@/store/settingsStore';

const getApiKey = async () => {
  const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (envKey && envKey !== 'your_gemini_api_key_here') return envKey;
  try {
    const secureKey = await SecureStore.getItemAsync('devnest_gemini_key');
    if (secureKey) return secureKey;
  } catch (e) {}
  return null;
};

export const askGemini = async (prompt: string, context?: string): Promise<string> => {
  const API_KEY = await getApiKey();
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured. Please set it in Settings.');
  }
  const { aiModel } = useSettingsStore.getState();
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${API_KEY}`;

  const fullPrompt = context
    ? `You are an expert developer AI assistant named DevNest AI.

Context Code:
\`\`\`
${context}
\`\`\`

User Request:
${prompt}`
    : `You are an expert developer AI assistant named DevNest AI.

User Request:
${prompt}`;

  const body = {
    contents: [
      {
        parts: [{ text: fullPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No response received from Gemini. Please try again.');
  }

  return text;
};

export const askGeminiVision = async (prompt: string, base64Image: string, mimeType: string): Promise<string> => {
  const API_KEY = await getApiKey();
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured. Please set it in Settings.');
  }
  const { aiModel } = useSettingsStore.getState();
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${API_KEY}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64Image,
            }
          }
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  };

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('No response received from Gemini Vision.');
  }

  return text;
};
