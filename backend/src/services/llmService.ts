/**
 * LLM Service - Supports DeepSeek, OpenAI, and Gemini
 * DeepSeek is preferred for high-quality brand analysis
 */

import dotenv from 'dotenv';
dotenv.config();

// API Keys
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Preferred provider order
const providers = ['deepseek', 'openai', 'gemini'] as const;
type Provider = typeof providers[number];

function getActiveProvider(): Provider | null {
  if (DEEPSEEK_API_KEY) return 'deepseek';
  if (OPENAI_API_KEY) return 'openai';
  if (GEMINI_API_KEY) return 'gemini';
  return null;
}

console.log(`LLM Provider: ${getActiveProvider() || 'None configured'}`);

/**
 * Call DeepSeek API (OpenAI-compatible)
 */
async function callDeepSeek(prompt: string, systemPrompt?: string): Promise<string> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat', // or 'deepseek-reasoner' for R1
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data: any = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt: string, systemPrompt?: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data: any = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Call Gemini API
 */
async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  return response.text();
}

/**
 * Generate text using the best available LLM
 */
export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  const provider = getActiveProvider();
  
  if (!provider) {
    throw new Error('No LLM API key configured. Set DEEPSEEK_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY.');
  }

  console.log(`Using LLM provider: ${provider}`);

  switch (provider) {
    case 'deepseek':
      return callDeepSeek(prompt, systemPrompt);
    case 'openai':
      return callOpenAI(prompt, systemPrompt);
    case 'gemini':
      return callGemini(prompt, systemPrompt);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Generate JSON from LLM response
 */
export async function generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
  const text = await generateText(prompt, systemPrompt);
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse JSON from LLM response');
  }
  
  return JSON.parse(jsonMatch[0]);
}

/**
 * Check if LLM is configured
 */
export function isLLMConfigured(): boolean {
  return !!getActiveProvider();
}

export { getActiveProvider };

