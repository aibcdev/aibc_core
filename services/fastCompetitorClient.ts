/**
 * Fast Competitor Discovery Client
 * Calls optimized backend endpoint for instant competitor discovery
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface CompetitorCandidate {
  domain: string;
  name: string;
  similarityScore: number;
  industry: string;
  description: string;
  logoUrl?: string;
  socialProfiles?: {
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
}

/**
 * Discover competitors instantly from URL/domain
 */
export async function discoverCompetitorsFast(
  brandUrl: string,
  brandDNA?: any,
  maxCompetitors: number = 5
): Promise<CompetitorCandidate[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${API_BASE_URL}/api/competitors/discover-fast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brandUrl,
        brandDNA,
        maxCompetitors,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.competitors || [];
  } catch (error: any) {
    console.error('Fast competitor discovery error:', error);
    // Return empty array on error - don't block user flow
    return [];
  }
}

