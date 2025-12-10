/**
 * API Client for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  };
  error?: string;
  status?: string;
}

/**
 * Start a new scan
 */
export async function startScan(
  username: string,
  platforms: string[],
  scanType: 'standard' | 'deep' = 'standard',
  connectedAccounts?: Record<string, string>
): Promise<ScanResponse> {
  try {
    // Get connected accounts from localStorage if not provided
    const accountsToUse = connectedAccounts || (() => {
      try {
        const stored = localStorage.getItem('connectedAccounts');
        return stored ? JSON.parse(stored) : undefined;
      } catch {
        return undefined;
      }
    })();
    
    const response = await fetch(`${API_BASE_URL}/api/scan/start`, {
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
    if (error.message?.includes('fetch') || error.message?.includes('network') || error.name === 'TypeError') {
      throw new Error('Load failed - Cannot connect to backend server. Please check if the server is running.');
    }
    throw error;
  }
}

/**
 * Get scan status
 */
export async function getScanStatus(scanId: string): Promise<ScanStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scan/${scanId}/status`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get scan status');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Get scan status error:', error);
    throw error;
  }
}

/**
 * Get scan results
 */
export async function getScanResults(scanId: string): Promise<ScanResults> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scan/${scanId}/results`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get scan results');
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
  interval: number = 2000
): Promise<ScanResults> {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const statusResponse = await getScanStatus(scanId);
        
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
      } catch (error) {
        reject(error);
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
    const response = await fetch(`${API_BASE_URL}/api/scan/user/${encodeURIComponent(username)}/latest`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get latest scan results');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Get latest scan results error:', error);
    throw error;
  }
}

