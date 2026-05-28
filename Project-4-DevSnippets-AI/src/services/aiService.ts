import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export const askGemini = async (prompt: string, context?: string): Promise<string> => {
  if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

  try {
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error: any) {
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
};
