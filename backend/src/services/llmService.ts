/**
 * LLM Service - Multi-provider support with scan tiers
 * 
 * BASIC SCAN (Free users): Gemini 2.0 Flash - FREE tier (best free model)
 * DEEP SCAN (Paid users): Claude 3.5 Sonnet - ~$0.10/scan (best quality)
 * FALLBACK: DeepSeek R1 - ~$0.02/scan (great reasoning, cheap)
 */

import dotenv from 'dotenv';
dotenv.config();

// API Keys
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

// Scan types
export type ScanTier = 'basic' | 'deep' | 'test';
export type Provider = 'gemini-2-flash' | 'gemini-flash' | 'gemini-pro' | 'deepseek' | 'deepseek-r1' | 'openai' | 'claude';

// Provider configuration
export const PROVIDER_CONFIG: Record<Provider, { name: string; model: string; costPer1kTokens: number }> = {
  'gemini-2-flash': { name: 'Gemini 2.0 Flash', model: 'gemini-2.0-flash-exp', costPer1kTokens: 0 },
  'gemini-flash': { name: 'Gemini 1.5 Flash', model: 'gemini-1.5-flash', costPer1kTokens: 0 },
  'gemini-pro': { name: 'Gemini 1.5 Pro', model: 'gemini-1.5-pro', costPer1kTokens: 0.003 },
  'deepseek': { name: 'DeepSeek Chat', model: 'deepseek-chat', costPer1kTokens: 0.001 },
  'deepseek-r1': { name: 'DeepSeek R1', model: 'deepseek-reasoner', costPer1kTokens: 0.002 },
  'openai': { name: 'GPT-4o', model: 'gpt-4o', costPer1kTokens: 0.005 },
  'claude': { name: 'Claude 3.5 Sonnet', model: 'claude-3-5-sonnet-20241022', costPer1kTokens: 0.009 },
};

// Get provider for scan tier
export function getProviderForTier(tier: ScanTier, forceProvider?: Provider): Provider {
  if (forceProvider) return forceProvider;
  
  switch (tier) {
    case 'basic':
      // Basic scan: Use Gemini 2.0 Flash (FREE, best free model)
      if (GEMINI_API_KEY) return 'gemini-2-flash';
      if (DEEPSEEK_API_KEY) return 'deepseek';
      throw new Error('No LLM configured for basic scans. Set GEMINI_API_KEY.');
      
    case 'deep':
      // Deep scan: Use Gemini 2.0 Flash (same as basic, but with enhanced prompts)
      if (GEMINI_API_KEY) return 'gemini-2-flash';
      if (DEEPSEEK_API_KEY) return 'deepseek-r1';
      if (OPENAI_API_KEY) return 'openai';
      throw new Error('No LLM configured for deep scans. Set GEMINI_API_KEY.');
      
    case 'test':
      // Test mode: Use Gemini 2.0 Flash for testing
      if (GEMINI_API_KEY) return 'gemini-2-flash';
      if (DEEPSEEK_API_KEY) return 'deepseek-r1';
      if (OPENAI_API_KEY) return 'openai';
      throw new Error('No LLM configured for testing.');
      
    default:
      throw new Error(`Unknown scan tier: ${tier}`);
  }
}

// Check which providers are available
export function getAvailableProviders(): Provider[] {
  const available: Provider[] = [];
  if (GEMINI_API_KEY) {
    available.push('gemini-2-flash', 'gemini-flash', 'gemini-pro');
  }
  if (DEEPSEEK_API_KEY) {
    available.push('deepseek', 'deepseek-r1');
  }
  if (OPENAI_API_KEY) {
    available.push('openai');
  }
  if (ANTHROPIC_API_KEY) {
    available.push('claude');
  }
  return available;
}

function getActiveProvider(): Provider | null {
  if (GEMINI_API_KEY) return 'gemini-flash';
  if (DEEPSEEK_API_KEY) return 'deepseek';
  if (OPENAI_API_KEY) return 'openai';
  return null;
}

// Log available providers on startup
console.log(`LLM Service initialized. Available providers:`);
if (GEMINI_API_KEY) console.log('  ✅ Gemini 2.0 Flash - BASIC & DEEP scans (FREE)');
if (DEEPSEEK_API_KEY) console.log('  ✅ DeepSeek (Chat + R1) - Fallback');
if (OPENAI_API_KEY) console.log('  ✅ OpenAI (GPT-4o) - Fallback');
if (!GEMINI_API_KEY && !DEEPSEEK_API_KEY && !OPENAI_API_KEY) {
  console.log('  ⚠️ No LLM providers configured!');
}

/**
 * Call DeepSeek API
 */
async function callDeepSeek(prompt: string, systemPrompt?: string, model: string = 'deepseek-chat'): Promise<string> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: model,
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
async function callOpenAI(prompt: string, systemPrompt?: string, model: string = 'gpt-4o'): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: model,
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
async function callGemini(prompt: string, systemPrompt?: string, model: string = 'gemini-1.5-flash'): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const geminiModel = genAI.getGenerativeModel({ model });

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  const result = await geminiModel.generateContent(fullPrompt);
  const response = await result.response;
  return response.text();
}

/**
 * Call Claude API (Anthropic)
 */
async function callClaude(prompt: string, systemPrompt?: string, model: string = 'claude-3-5-sonnet-20241022'): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4096,
      messages: [
        { role: 'user', content: prompt }
      ],
      ...(systemPrompt ? { system: systemPrompt } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data: any = await response.json();
  return data.content[0]?.text || '';
}

/**
 * Generate text using specified provider or best available
 */
export async function generateText(
  prompt: string, 
  systemPrompt?: string,
  options?: { tier?: ScanTier; provider?: Provider }
): Promise<string> {
  const tier = options?.tier || 'basic';
  const provider = options?.provider || getProviderForTier(tier);
  const config = PROVIDER_CONFIG[provider];
  
  console.log(`[LLM] Using ${config.name} for ${tier} scan`);

  switch (provider) {
    case 'deepseek':
      return callDeepSeek(prompt, systemPrompt, 'deepseek-chat');
    case 'deepseek-r1':
      return callDeepSeek(prompt, systemPrompt, 'deepseek-reasoner');
    case 'openai':
      return callOpenAI(prompt, systemPrompt, 'gpt-4o');
    case 'gemini-2-flash':
      return callGemini(prompt, systemPrompt, 'gemini-2.0-flash-exp');
    case 'gemini-flash':
      return callGemini(prompt, systemPrompt, 'gemini-1.5-flash');
    case 'gemini-pro':
      return callGemini(prompt, systemPrompt, 'gemini-1.5-pro');
    case 'claude':
      return callClaude(prompt, systemPrompt, 'claude-3-5-sonnet-20241022');
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Generate JSON from LLM response
 */
export async function generateJSON<T = any>(
  prompt: string, 
  systemPrompt?: string,
  options?: { tier?: ScanTier; provider?: Provider }
): Promise<T> {
  const text = await generateText(prompt, systemPrompt, options);
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    // Try array format
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }
    throw new Error('Failed to parse JSON from LLM response');
  }
  
  return JSON.parse(jsonMatch[0]);
}

/**
 * Check if LLM is configured
 */
export function isLLMConfigured(): boolean {
  return !!(GEMINI_API_KEY || DEEPSEEK_API_KEY || OPENAI_API_KEY);
}

/**
 * Compare scan results from multiple providers (for testing)
 */
export async function compareScanProviders(
  prompt: string,
  systemPrompt?: string,
  providers?: Provider[]
): Promise<Record<string, { result: string; provider: string; time: number }>> {
  const availableProviders = providers || getAvailableProviders();
  const results: Record<string, { result: string; provider: string; time: number }> = {};
  
  for (const provider of availableProviders) {
    try {
      const start = Date.now();
      const result = await generateText(prompt, systemPrompt, { provider });
      const time = Date.now() - start;
      
      results[provider] = {
        result,
        provider: PROVIDER_CONFIG[provider].name,
        time
      };
      console.log(`[LLM Compare] ${provider}: ${time}ms`);
    } catch (error: any) {
      console.error(`[LLM Compare] ${provider} failed:`, error.message);
    }
  }
  
  return results;
}

export { getActiveProvider };
