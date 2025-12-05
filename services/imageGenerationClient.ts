const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ImageGenerationRequest {
  content: string;
  platform: 'instagram' | 'tiktok' | 'linkedin' | 'x' | 'youtube';
  brandDNA?: any;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  imageBase64?: string;
  error?: string;
}

/**
 * Generate an image for social media content
 */
export async function generateImageForContent(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  try {
    const response = await fetch(`${API_URL}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to generate image'
      };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: error.message || 'Network error while generating image'
    };
  }
}


