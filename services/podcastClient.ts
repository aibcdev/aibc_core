/**
 * Frontend API client for podcast generation
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface PodcastRequest {
  topic: string;
  duration: number; // 2-5 minutes
  brandVoice?: any;
  style?: 'conversational' | 'narrative' | 'educational' | 'entertaining';
  includeMusic?: boolean;
  voiceCloneId?: string;
}

export interface PodcastResponse {
  success: boolean;
  podcastId?: string;
  script?: string;
  audioUrl?: string;
  duration?: number;
  status?: 'generating' | 'processing' | 'complete' | 'error';
  error?: string;
}

/**
 * Generate podcast (Premium tier only)
 */
export async function generatePodcast(
  request: PodcastRequest,
  userTier: string = 'premium'
): Promise<PodcastResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/podcast/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Tier': userTier
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate podcast');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Podcast generation error:', error);
    throw error;
  }
}

