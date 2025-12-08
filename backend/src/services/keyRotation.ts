/**
 * API Key Rotation Service
 * 
 * Supports multiple Gemini API keys with automatic rotation:
 * - Round-robin: Distribute requests evenly
 * - Failover: Use next key if current fails
 * - Quota tracking: Track usage per key
 */

import dotenv from 'dotenv';
dotenv.config();

// Load multiple API keys from environment
// Format: GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.
// Or: GEMINI_API_KEYS=key1,key2,key3,key4,key5
function loadApiKeys(): string[] {
  const keys: string[] = [];
  
  // Method 1: Comma-separated list
  const keysList = process.env.GEMINI_API_KEYS;
  if (keysList) {
    keys.push(...keysList.split(',').map(k => k.trim()).filter(k => k));
  }
  
  // Method 2: Individual keys (GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.)
  for (let i = 1; i <= 10; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (key) keys.push(key);
  }
  
  // Method 3: Single key (fallback)
  const singleKey = process.env.GEMINI_API_KEY;
  if (singleKey && !keys.includes(singleKey)) {
    keys.push(singleKey);
  }
  
  return keys.filter((key, index, self) => self.indexOf(key) === index); // Remove duplicates
}

const apiKeys = loadApiKeys();
let currentKeyIndex = 0;
const keyUsage: Map<string, { requests: number; errors: number; lastUsed: number }> = new Map();

// Initialize usage tracking
apiKeys.forEach(key => {
  keyUsage.set(key, { requests: 0, errors: 0, lastUsed: 0 });
});

console.log(`[KEY ROTATION] Loaded ${apiKeys.length} API key(s)`);
if (apiKeys.length > 1) {
  console.log(`[KEY ROTATION] Round-robin rotation enabled`);
}

/**
 * Get next API key (round-robin)
 */
export function getNextKey(): string {
  if (apiKeys.length === 0) {
    throw new Error('No Gemini API keys configured');
  }
  
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  
  // Track usage
  const usage = keyUsage.get(key);
  if (usage) {
    usage.requests++;
    usage.lastUsed = Date.now();
  }
  
  return key;
}

/**
 * Get current API key (without rotating)
 */
export function getCurrentKey(): string {
  if (apiKeys.length === 0) {
    throw new Error('No Gemini API keys configured');
  }
  return apiKeys[currentKeyIndex];
}

/**
 * Mark key as failed (for failover)
 */
export function markKeyFailed(key: string, error: string): void {
  const usage = keyUsage.get(key);
  if (usage) {
    usage.errors++;
    console.log(`[KEY ROTATION] Key failed: ${error.substring(0, 50)}... (errors: ${usage.errors})`);
  }
  
  // If too many errors, rotate to next key
  if (usage && usage.errors > 5) {
    console.log(`[KEY ROTATION] Key has ${usage.errors} errors, rotating to next key`);
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  }
}

/**
 * Get key statistics
 */
export function getKeyStats(): Array<{ key: string; requests: number; errors: number; lastUsed: number }> {
  return Array.from(keyUsage.entries()).map(([key, stats]) => ({
    key: key.substring(0, 10) + '...', // Mask key for security
    requests: stats.requests,
    errors: stats.errors,
    lastUsed: stats.lastUsed
  }));
}

/**
 * Get all keys (for testing)
 */
export function getAllKeys(): string[] {
  return [...apiKeys];
}

/**
 * Check if rotation is enabled
 */
export function isRotationEnabled(): boolean {
  return apiKeys.length > 1;
}

