/**
 * Real-time Platform API Integration Service
 * Fetches live data from platform APIs (Twitter/X, Instagram, LinkedIn, etc.)
 */

import { getApiBaseUrl, getDebugEndpoint } from './apiClient';

export interface PlatformPost {
  id: string;
  platform: string;
  content: string;
  timestamp: number | string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  };
  url?: string;
}

export interface PlatformMetrics {
  postsThisWeek: number;
  engagementThisWeek: number;
  platformBreakdown: Record<string, number>;
  lastFetched: string;
}

/**
 * Check if platform API integrations are configured
 */
export function hasPlatformIntegrations(): boolean {
  // Check for API keys/tokens in localStorage or env
  const hasTwitter = !!(localStorage.getItem('twitter_api_key') || import.meta.env.VITE_TWITTER_API_KEY);
  const hasInstagram = !!(localStorage.getItem('instagram_access_token') || import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN);
  const hasLinkedIn = !!(localStorage.getItem('linkedin_access_token') || import.meta.env.VITE_LINKEDIN_ACCESS_TOKEN);
  
  return hasTwitter || hasInstagram || hasLinkedIn;
}

/**
 * Fetch real-time posts from platform APIs
 */
export async function fetchRealTimePosts(
  username: string,
  platforms: string[] = ['twitter', 'instagram', 'linkedin']
): Promise<PlatformPost[]> {
  try {
    const API_BASE_URL = getApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}/api/platforms/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        platforms,
        timeframe: '7d' // Last 7 days
      })
    });

    if (!response.ok) {
      throw new Error(`Platform API error: ${response.status}`);
    }

    const data = await response.json();
    return data.posts || [];
  } catch (error: any) {
    console.error('Error fetching real-time posts:', error);
    // #region agent log
    fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'platformApiService.ts:fetchRealTimePosts',message:'Error fetching real-time posts',data:{error:error.message,username,platforms},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H8'})}).catch(()=>{});
    // #endregion
    return [];
  }
}

/**
 * Calculate real-time metrics from platform API data
 */
export function calculateRealTimeMetrics(posts: PlatformPost[]): PlatformMetrics {
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  
  // Filter posts from last 7 days
  const postsThisWeek = posts.filter(post => {
    const postTime = typeof post.timestamp === 'string' 
      ? new Date(post.timestamp).getTime() 
      : post.timestamp;
    return postTime >= sevenDaysAgo;
  });
  
  // Calculate engagement
  const engagementThisWeek = postsThisWeek.reduce((sum, post) => {
    return sum + (post.engagement.likes || 0) + 
           (post.engagement.shares || 0) + 
           (post.engagement.comments || 0);
  }, 0);
  
  // Platform breakdown
  const platformBreakdown: Record<string, number> = {};
  postsThisWeek.forEach(post => {
    const platform = post.platform.toLowerCase();
    platformBreakdown[platform] = (platformBreakdown[platform] || 0) + 1;
  });
  
  return {
    postsThisWeek: postsThisWeek.length,
    engagementThisWeek,
    platformBreakdown,
    lastFetched: new Date().toISOString()
  };
}

/**
 * Poll platform APIs for real-time updates
 * Returns a cleanup function to stop polling
 */
export function startRealTimePolling(
  username: string,
  platforms: string[],
  onUpdate: (metrics: PlatformMetrics) => void,
  intervalMs: number = 5 * 60 * 1000 // Default: 5 minutes
): () => void {
  if (!hasPlatformIntegrations()) {
    console.warn('Platform API integrations not configured. Real-time polling disabled.');
    return () => {}; // Return no-op cleanup function
  }
  
  let isPolling = true;
  
  const poll = async () => {
    if (!isPolling) return;
    
    try {
      const posts = await fetchRealTimePosts(username, platforms);
      const metrics = calculateRealTimeMetrics(posts);
      onUpdate(metrics);
    } catch (error) {
      console.error('Polling error:', error);
    }
  };
  
  // Initial fetch
  poll();
  
  // Set up interval
  const intervalId = setInterval(poll, intervalMs);
  
  // Return cleanup function
  return () => {
    isPolling = false;
    clearInterval(intervalId);
  };
}

/**
 * Merge real-time API data with scan results
 * Prioritizes real-time data when available
 */
export function mergeMetrics(
  scanMetrics: { postsThisWeek: number; engagementThisWeek: number },
  realTimeMetrics: PlatformMetrics | null
): { postsThisWeek: number; engagementThisWeek: number; lastUpdated: string; isRealTime: boolean } {
  if (realTimeMetrics && realTimeMetrics.lastFetched) {
    // Use real-time data if available
    return {
      postsThisWeek: realTimeMetrics.postsThisWeek,
      engagementThisWeek: realTimeMetrics.engagementThisWeek,
      lastUpdated: realTimeMetrics.lastFetched,
      isRealTime: true
    };
  }
  
  // Fall back to scan data
  return {
    postsThisWeek: scanMetrics.postsThisWeek,
    engagementThisWeek: scanMetrics.engagementThisWeek,
    lastUpdated: new Date().toISOString(),
    isRealTime: false
  };
}

