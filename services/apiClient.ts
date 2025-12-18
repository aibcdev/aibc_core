/**
 * API Client for backend communication
 */

// Determine API URL: use env var, or detect production vs local
export function getApiBaseUrl(): string {
  // If env var is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Production detection: if running on aibcmedia.com (or any non-localhost domain)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Production - use aibcmedia.com backend
      return 'https://api.aibcmedia.com';
    }
  }
  
  // Local development - AIBC backend
  return 'http://localhost:3001';
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Get debug logging endpoint (uses AIBC backend)
 */
export function getDebugEndpoint(): string {
  return `${getApiBaseUrl()}/api/debug/log`;
}

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeout: 30000, // 30 seconds
};

/**
 * Retry wrapper for fetch requests
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = RETRY_CONFIG.maxRetries
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RETRY_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Retry on network errors or timeouts
    if (retries > 0 && (
      error.name === 'AbortError' ||
      error.name === 'TypeError' ||
      error.message?.includes('fetch') ||
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch')
    )) {
      console.log(`Retrying request (${RETRY_CONFIG.maxRetries - retries + 1}/${RETRY_CONFIG.maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay));
      return fetchWithRetry(url, options, retries - 1);
    }
    
    throw error;
  }
}

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<{ healthy: boolean; message?: string }> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }, 1); // Only 1 retry for health check

    if (response.ok) {
      return { healthy: true };
    }
    return { healthy: false, message: `Backend returned ${response.status}` };
  } catch (error: any) {
    return { 
      healthy: false, 
      message: error.message || 'Cannot connect to backend server' 
    };
  }
}

export interface ScanResponse {
  success: boolean;
  scanId?: string;
  message?: string;
  error?: string;
}

export interface ScanStatus {
  success: boolean;
  scan?: {
    id: string;
    status: 'starting' | 'scanning' | 'analyzing' | 'complete' | 'error';
    progress: number;
    logs: string[];
    error?: string;
  };
  error?: string;
}

export interface ScanResults {
  success: boolean;
  data?: {
    extractedContent: any;
    brandDNA: any;
    strategicInsights?: any[];
    competitorIntelligence?: any[];
    contentIdeas?: any[];
    marketShare?: {
      percentage: number;
      industry: string;
      totalCreatorsInSpace?: number;
      yourRank?: number;
      note?: string;
    };
    scanStats?: {
      postsAnalyzed: number;
      competitorsFound: number;
      themesIdentified: number;
      isDeepScan: boolean;
      scanTier: string;
    };
  };
  error?: string;
  status?: string;
}

/**
 * Start a new scan
 */
function clearScanCache(username?: string) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  // COMPREHENSIVE cache clear - remove ALL scan-related data
  const keysToRemove = [
    // Core scan data
    'lastScanResults',
    'lastScanId',
    'lastScanTimestamp',
    'lastScannedUsername',
    'lastScanType',
    
    // Content and production
    'productionAssets',
    'contentPreferences',
    
    // Strategy data - CRITICAL for rescan
    'strategyPlans',
    'activeContentStrategy',
    'strategyConversation',
    'strategyMessages',
    'strategyHistory',
    
    // Brand assets
    'brandMaterials',
    'brandProfile',
    'brandVoice',
    'brandColors',
    'brandFonts',
    
    // Analytics cache
    'analyticsCache',
    'previousInsightsCount',
    
    // Inbox and calendar
    'inboxItems',
    'calendarEvents',
    
    // Integrations remain (they're account-linked, not scan-linked)
    // 'integrations', // Keep this
    // 'connectedAccounts', // Keep this
  ];

  keysToRemove.forEach((key) => localStorage.removeItem(key));

  if (username) {
    localStorage.setItem('lastScannedUsername', username);
    localStorage.setItem('lastScanTimestamp', Date.now().toString());
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('newScanStarted', {
        detail: { 
          username: username || null, 
          timestamp: Date.now(),
          isRescan: false,
          clearAll: true
        },
      })
    );
  }
}

export async function startScan(
  username: string,
  platforms: string[],
  scanType: 'standard' | 'deep' = 'standard',
  connectedAccounts?: Record<string, string>
): Promise<ScanResponse> {
  try {
    clearScanCache(username);

    // Get connected accounts from localStorage if not provided
    const accountsToUse = connectedAccounts || (() => {
      try {
        const stored = localStorage.getItem('connectedAccounts');
        return stored ? JSON.parse(stored) : undefined;
      } catch {
        return undefined;
      }
    })();
    
    const response = await fetchWithRetry(`${API_BASE_URL}/api/scan/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        platforms,
        scanType,
        connectedAccounts: accountsToUse,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to start scan';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Start scan error:', error);
    // Provide more specific error messages
    if (error.message?.includes('fetch') || error.message?.includes('network') || error.name === 'TypeError' || error.name === 'AbortError') {
      throw new Error('Cannot connect to backend server. Please check if the server is running and try again.');
    }
    throw error;
  }
}

/**
 * Get scan status
 */
export async function getScanStatus(scanId: string): Promise<ScanStatus> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/scan/${scanId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to get scan status';
      try {
      const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Get scan status error:', error);
    // Don't throw network errors - let polling handle retries
    if (error.message?.includes('fetch') || error.message?.includes('network') || error.name === 'TypeError' || error.name === 'AbortError') {
      throw new Error('Network error - will retry');
    }
    throw error;
  }
}

/**
 * Get scan results
 */
export async function getScanResults(scanId: string): Promise<ScanResults> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/scan/${scanId}/results`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to get scan results';
      try {
      const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Get scan results error:', error);
    throw error;
  }
}

/**
 * Poll scan status until complete
 */
export async function pollScanStatus(
  scanId: string,
  onUpdate: (status: ScanStatus['scan']) => void,
  interval: number = 2000,
  maxPolls: number = 300 // 10 minutes max (300 * 2s = 600s)
): Promise<ScanResults> {
  return new Promise((resolve, reject) => {
    let pollCount = 0;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5;

    const poll = async () => {
      try {
        pollCount++;
        
        // Check max polls
        if (pollCount > maxPolls) {
          reject(new Error('Scan timeout - maximum polling attempts reached'));
          return;
        }

        const statusResponse = await getScanStatus(scanId);
        consecutiveErrors = 0; // Reset error count on success
        
        if (statusResponse.success && statusResponse.scan) {
          onUpdate(statusResponse.scan);

          if (statusResponse.scan.status === 'complete') {
            const results = await getScanResults(scanId);
            resolve(results);
          } else if (statusResponse.scan.status === 'error') {
            reject(new Error(statusResponse.scan.error || 'Scan failed'));
          } else {
            setTimeout(poll, interval);
          }
        } else {
          reject(new Error(statusResponse.error || 'Failed to get scan status'));
        }
      } catch (error: any) {
        consecutiveErrors++;
        
        // If too many consecutive errors, fail
        if (consecutiveErrors >= maxConsecutiveErrors) {
          reject(new Error(`Failed to get scan status after ${maxConsecutiveErrors} attempts: ${error.message}`));
          return;
        }
        
        // For network errors, retry with exponential backoff
        if (error.message?.includes('Network error') || error.message?.includes('network')) {
          const backoffDelay = Math.min(interval * Math.pow(2, consecutiveErrors - 1), 10000); // Max 10s
          console.log(`Network error, retrying in ${backoffDelay}ms...`);
          setTimeout(poll, backoffDelay);
        } else {
          // For other errors, reject immediately
        reject(error);
        }
      }
    };

    poll();
  });
}

/**
 * Get latest scan results for a username
 */
export async function getLatestScanResults(username: string): Promise<ScanResults> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/api/scan/user/${encodeURIComponent(username)}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to get latest scan results';
      try {
      const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Get latest scan results error:', error);
    throw error;
  }
}

