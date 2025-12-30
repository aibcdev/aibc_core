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
  // NOTE: Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) resolution issues in browsers.
  return 'http://127.0.0.1:3001';
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Get debug logging endpoint (uses debug server)
 */
export function getDebugEndpoint(): string {
  // Use the debug server endpoint directly (not the API backend)
  return 'http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d';
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
  const API_BASE_URL = getApiBaseUrl();
  // #region agent log
  fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.ts:checkBackendHealth',message:'HEALTH CHECK START',data:{API_BASE_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'health-check',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  try {
    // Use a shorter timeout for health check (5 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const healthCheckStart = Date.now();
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const elapsed = Date.now() - healthCheckStart;

    // #region agent log
    fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.ts:checkBackendHealth',message:'HEALTH CHECK RESPONSE',data:{ok:response.ok,status:response.status,statusText:response.statusText,elapsed,API_BASE_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'health-check',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

    if (response.ok) {
      return { healthy: true };
    }
    return { healthy: false, message: `Backend returned ${response.status}` };
  } catch (error: any) {
    // #region agent log
    fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.ts:checkBackendHealth',message:'HEALTH CHECK ERROR',data:{errorName:error?.name,errorMessage:error?.message,API_BASE_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'health-check',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    if (error.name === 'AbortError') {
      return { 
        healthy: false, 
        message: 'Backend health check timed out (5s). Server may be slow or unreachable.' 
      };
    }
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
  const API_BASE_URL = getApiBaseUrl();
  // #region agent log
  fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.ts:startScan',message:'START SCAN CALL',data:{username,platforms:platforms.length,scanType,API_BASE_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'start-scan',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
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
    
    const startScanStart = Date.now();
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
    const elapsed = Date.now() - startScanStart;

    // #region agent log
    fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.ts:startScan',message:'START SCAN RESPONSE',data:{ok:response.ok,status:response.status,elapsed,API_BASE_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'start-scan',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

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

    const result = await response.json();
    // #region agent log
    fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.ts:startScan',message:'START SCAN SUCCESS',data:{success:result?.success,hasScanId:!!result?.scanId,elapsed},timestamp:Date.now(),sessionId:'debug-session',runId:'start-scan',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    return result;
  } catch (error: any) {
    // #region agent log
    fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.ts:startScan',message:'START SCAN ERROR',data:{errorName:error?.name,errorMessage:error?.message,API_BASE_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'start-scan',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
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
        
        // #region agent log
        const getDebugEndpoint = () => 'http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d';
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.ts:375',message:'POLL STATUS RESPONSE',data:{scanId,success:statusResponse.success,hasScan:!!statusResponse.scan,status:statusResponse.scan?.status,progress:statusResponse.scan?.progress,pollCount},timestamp:Date.now(),sessionId:'debug-session',runId:'poll-status',hypothesisId:'H10'})}).catch(()=>{});
        // #endregion
        
        if (statusResponse.success && statusResponse.scan) {
          onUpdate(statusResponse.scan);

          if (statusResponse.scan.status === 'complete') {
            // #region agent log
            fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.ts:381',message:'STATUS IS COMPLETE - FETCHING RESULTS',data:{scanId},timestamp:Date.now(),sessionId:'debug-session',runId:'poll-status',hypothesisId:'H10'})}).catch(()=>{});
            // #endregion
            const results = await getScanResults(scanId);
            // #region agent log
            fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.ts:383',message:'RESULTS FETCHED - RESOLVING',data:{scanId,success:results.success,hasData:!!results.data},timestamp:Date.now(),sessionId:'debug-session',runId:'poll-status',hypothesisId:'H10'})}).catch(()=>{});
            // #endregion
            resolve(results);
          } else if (statusResponse.scan.status === 'error') {
            // #region agent log
            fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.ts:385',message:'STATUS IS ERROR',data:{scanId,error:statusResponse.scan.error},timestamp:Date.now(),sessionId:'debug-session',runId:'poll-status',hypothesisId:'H10'})}).catch(()=>{});
            // #endregion
            reject(new Error(statusResponse.scan.error || 'Scan failed'));
          } else {
            // #region agent log
            fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.ts:387',message:'STATUS NOT COMPLETE - CONTINUING POLL',data:{scanId,status:statusResponse.scan.status,willPollAgain:true},timestamp:Date.now(),sessionId:'debug-session',runId:'poll-status',hypothesisId:'H10'})}).catch(()=>{});
            // #endregion
            setTimeout(poll, interval);
          }
        } else {
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.ts:389',message:'STATUS RESPONSE INVALID',data:{scanId,success:statusResponse.success,error:statusResponse.error},timestamp:Date.now(),sessionId:'debug-session',runId:'poll-status',hypothesisId:'H10'})}).catch(()=>{});
          // #endregion
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

