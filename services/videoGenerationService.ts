/**
 * Video Generation Service
 * Uses Gemini Veo 3.1 / Nanobanana for free video generation
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface VideoGenerationRequest {
  prompt: string;
  duration?: number; // seconds (5, 10, 15, 30)
  style?: 'realistic' | 'cinematic' | 'documentary' | 'social';
  aspectRatio?: '16:9' | '9:16' | '1:1';
  brandDNA?: any;
}

export interface VideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  videoId?: string;
  thumbnailUrl?: string;
  error?: string;
}

/**
 * Generate video using Gemini Veo 3.1 / Nanobanana (free generation)
 */
export async function generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        duration: request.duration || 10,
        style: request.style || 'realistic',
        aspectRatio: request.aspectRatio || '9:16',
        brandDNA: request.brandDNA,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to generate video' }));
      return {
        success: false,
        error: error.error || 'Failed to generate video',
      };
    }

    const data = await response.json();
    return {
      success: true,
      videoUrl: data.videoUrl,
      videoId: data.videoId,
      thumbnailUrl: data.thumbnailUrl,
    };
  } catch (error: any) {
    console.error('Video generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate video',
    };
  }
}

/**
 * Generate video for content (optimized prompt based on content)
 */
export async function generateVideoForContent(
  content: string,
  platform: string,
  brandDNA?: any
): Promise<VideoGenerationResponse> {
  // Build optimized prompt for video generation
  const prompt = `Create a ${platform} video based on this content: "${content.substring(0, 200)}"
  
Style: Engaging, on-brand, professional
Platform: ${platform}
Content theme: ${content.substring(0, 100)}`;

  return generateVideo({
    prompt,
    duration: platform === 'TIKTOK' || platform === 'INSTAGRAM' ? 15 : 30,
    style: 'social',
    aspectRatio: platform === 'YOUTUBE' ? '16:9' : '9:16',
    brandDNA,
  });
}

