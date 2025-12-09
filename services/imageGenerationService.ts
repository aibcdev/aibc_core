/**
 * Image Generation Service
 * Uses Gemini Imagen 3 / Nanobanana for free image generation
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ImageGenerationRequest {
  prompt: string;
  style?: 'realistic' | 'illustration' | 'photography' | 'artistic';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
  brandDNA?: any;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  imageId?: string;
  error?: string;
}

/**
 * Generate image using Gemini Imagen 3 / Nanobanana (free generation)
 */
export async function generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        style: request.style || 'realistic',
        aspectRatio: request.aspectRatio || '1:1',
        brandDNA: request.brandDNA,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to generate image' }));
      return {
        success: false,
        error: error.error || 'Failed to generate image',
      };
    }

    const data = await response.json();
    return {
      success: true,
      imageUrl: data.imageUrl,
      imageId: data.imageId,
    };
  } catch (error: any) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate image',
    };
  }
}

/**
 * Generate image for content (optimized prompt based on content)
 */
export async function generateImageForContent(
  content: string,
  platform: string,
  brandDNA?: any
): Promise<ImageGenerationResponse> {
  // Build optimized prompt for image generation
  const prompt = `Create a social media image for ${platform} based on this content: "${content.substring(0, 200)}"
  
Style: Professional, on-brand, engaging
Platform: ${platform}
Content theme: ${content.substring(0, 100)}`;

  return generateImage({
    prompt,
    style: 'realistic',
    aspectRatio: platform === 'INSTAGRAM' ? '1:1' : platform === 'YOUTUBE' ? '16:9' : '1:1',
    brandDNA,
  });
}

