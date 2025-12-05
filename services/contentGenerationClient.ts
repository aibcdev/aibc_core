const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ContentGenerationRequest {
  platform: string;
  contentType?: string;
  topic: string;
  brandDNA: any;
  extractedContent?: any;
}

export interface ContentGenerationResponse {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * Generate content that matches the brand's unique voice
 */
export async function generateBrandVoiceContent(
  request: ContentGenerationRequest
): Promise<ContentGenerationResponse> {
  try {
    const response = await fetch(`${API_URL}/api/generate-content`, {
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
        error: error.error || 'Failed to generate content'
      };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Content generation error:', error);
    return {
      success: false,
      error: error.message || 'Network error while generating content'
    };
  }
}


