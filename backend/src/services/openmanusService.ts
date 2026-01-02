/**
 * OpenManus Integration Service
 * HTTP client for communicating with OpenManus Python service
 */

const OPENMANUS_API_URL = process.env.OPENMANUS_API_URL || 'http://localhost:8000';
const OPENMANUS_API_KEY = process.env.OPENMANUS_API_KEY || '';
const OPENMANUS_TIMEOUT = parseInt(process.env.OPENMANUS_TIMEOUT || '300000', 10); // 5 minutes default

export interface OpenManusTaskRequest {
  task: string;
  context?: Record<string, any>;
  agent_type?: 'scan' | 'strategy' | 'competitor' | 'content';
  max_steps?: number;
}

export interface OpenManusTaskResponse {
  success: boolean;
  result?: string;
  error?: string;
  steps?: Array<Record<string, any>>;
}

export interface OpenManusHealthResponse {
  status: string;
  version: string;
}

/**
 * Check if OpenManus service is healthy and available
 */
export async function checkOpenManusHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check

    const response = await fetch(`${OPENMANUS_API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(OPENMANUS_API_KEY && { 'Authorization': `Bearer ${OPENMANUS_API_KEY}` }),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return false;
    }

    const data = await response.json() as OpenManusHealthResponse;
    return data.status === 'healthy' || data.status === 'limited';
  } catch (error: any) {
    console.warn('[OpenManus] Health check failed:', error.message);
    return false;
  }
}

/**
 * Execute a general task using OpenManus agent
 */
export async function executeOpenManusTask(
  request: OpenManusTaskRequest
): Promise<OpenManusTaskResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OPENMANUS_TIMEOUT);

    const response = await fetch(`${OPENMANUS_API_URL}/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(OPENMANUS_API_KEY && { 'Authorization': `Bearer ${OPENMANUS_API_KEY}` }),
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenManus API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as OpenManusTaskResponse;
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('OpenManus task execution timeout');
    }
    console.error('[OpenManus] Task execution error:', error);
    throw error;
  }
}

/**
 * Execute a footprint scanning task
 */
export async function executeScanTask(
  task: string,
  context?: Record<string, any>
): Promise<OpenManusTaskResponse> {
  return executeOpenManusTask({
    task,
    context,
    agent_type: 'scan',
    max_steps: 30, // More steps for comprehensive scanning
  });
}

/**
 * Execute a strategy analysis/generation task
 */
export async function executeStrategyTask(
  task: string,
  context?: Record<string, any>
): Promise<OpenManusTaskResponse> {
  return executeOpenManusTask({
    task,
    context,
    agent_type: 'strategy',
    max_steps: 20,
  });
}

/**
 * Execute a competitor analysis task
 */
export async function executeCompetitorTask(
  task: string,
  context?: Record<string, any>
): Promise<OpenManusTaskResponse> {
  return executeOpenManusTask({
    task,
    context,
    agent_type: 'competitor',
    max_steps: 25,
  });
}

/**
 * Execute a content generation task
 */
export async function executeContentTask(
  task: string,
  context?: Record<string, any>
): Promise<OpenManusTaskResponse> {
  return executeOpenManusTask({
    task,
    context,
    agent_type: 'content',
    max_steps: 15,
  });
}

/**
 * Retry wrapper with exponential backoff
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on timeout or client errors (4xx)
      if (error.message?.includes('timeout') || error.message?.includes('400')) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`[OpenManus] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Unknown error in retry');
}

/**
 * Check if OpenManus is enabled and available
 */
export async function isOpenManusAvailable(): Promise<boolean> {
  const enabled = process.env.OPENMANUS_ENABLED === 'true';
  if (!enabled) {
    return false;
  }

  try {
    return await checkOpenManusHealth();
  } catch (error) {
    return false;
  }
}
