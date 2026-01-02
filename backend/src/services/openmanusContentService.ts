/**
 * OpenManus Content Service
 * Content generation using OpenManus agents
 */

import { executeContentTask, isOpenManusAvailable } from './openmanusService';
import { useOpenManusContent } from '../config/featureFlags';
import { buildOpenManusTaskPrompt } from './openmanusMappings';

export interface ContentRequest {
  contentType: 'blog' | 'social' | 'video-script';
  topic: string;
  brandDNA?: any;
  brandVoice?: any;
  platform?: string;
  format?: string;
  targetWordCount?: number;
  context?: Record<string, any>;
}

export interface ContentResponse {
  content: string;
  metadata?: {
    wordCount?: number;
    platform?: string;
    format?: string;
    optimized?: boolean;
  };
}

/**
 * Generate content using OpenManus
 */
export async function generateContentWithOpenManus(
  request: ContentRequest
): Promise<ContentResponse> {
  // Check if OpenManus is enabled and available
  if (!useOpenManusContent()) {
    throw new Error('OpenManus content generation is not enabled. Set USE_OPENMANUS_CONTENT=true');
  }

  const available = await isOpenManusAvailable();
  if (!available) {
    throw new Error('OpenManus service is not available. Please ensure it is running.');
  }

  try {
    // Build content generation task prompt
    const taskPrompt = buildContentTaskPrompt(request);

    // Execute content task
    const response = await executeContentTask(taskPrompt, {
      contentType: request.contentType,
      topic: request.topic,
      brandDNA: request.brandDNA,
      brandVoice: request.brandVoice,
      platform: request.platform,
      format: request.format,
      targetWordCount: request.targetWordCount,
      ...request.context,
    });

    if (!response.success) {
      throw new Error(response.error || 'OpenManus content generation failed');
    }

    // Parse and return content results
    const result = parseContentResult(response.result || '', request);

    return result;
  } catch (error: any) {
    console.error('[OpenManus Content] Error:', error);
    throw error;
  }
}

/**
 * Build content generation task prompt for OpenManus
 */
function buildContentTaskPrompt(request: ContentRequest): string {
  const { contentType, topic, brandDNA, brandVoice, platform, format, targetWordCount } = request;

  let prompt = `Generate ${contentType} content about: "${topic}"

`;

  if (brandDNA) {
    prompt += `BRAND DNA:
- Archetype: ${brandDNA.archetype || 'Not specified'}
- Themes: ${(brandDNA.themes || brandDNA.corePillars || []).join(', ') || 'Not specified'}
- Industry: ${brandDNA.industry || 'Not specified'}

`;
  }

  if (brandVoice) {
    prompt += `BRAND VOICE:
- Tone: ${brandVoice.tone || brandVoice.style || 'professional'}
- Style: ${brandVoice.style || 'authentic'}
${brandVoice.vocabulary ? `- Key Vocabulary: ${Array.isArray(brandVoice.vocabulary) ? brandVoice.vocabulary.join(', ') : brandVoice.vocabulary}` : ''}

`;
  }

  if (platform) {
    prompt += `PLATFORM: ${platform}
`;
  }

  if (format) {
    prompt += `FORMAT: ${format}
`;
  }

  if (targetWordCount) {
    prompt += `TARGET WORD COUNT: ${targetWordCount}
`;
  }

  prompt += `REQUIREMENTS:
${contentType === 'blog' ? `
1. Write a comprehensive, SEO-optimized blog post
2. Use proper HTML formatting with headings (<h2>, <h3>)
3. Include engaging introduction and conclusion
4. Make it informative and valuable for readers
5. Match the brand voice and style exactly
6. Target ${targetWordCount || 2000} words
` : contentType === 'social' ? `
1. Create engaging social media content
2. Match the platform's best practices (${platform || 'general'})
3. Include hook and call-to-action
4. Match the brand voice exactly
5. Format appropriately for ${format || 'post'}
` : `
1. Write a video script with clear structure
2. Include hook, main content, and call-to-action
3. Add timing notes and visual cues
4. Match the brand voice exactly
5. Keep it engaging and conversational
`}

OUTPUT FORMAT:
Return the complete content ready for publication. For blog posts, use HTML formatting. For social content, use plain text with appropriate formatting. For video scripts, include scene descriptions.`;

  return prompt;
}

/**
 * Parse content result from OpenManus response
 */
function parseContentResult(resultText: string, request: ContentRequest): ContentResponse {
  try {
    // Try to extract JSON if the response is wrapped
    let content = resultText.trim();

    // Remove markdown code blocks if present
    content = content.replace(/```html\n?/g, '').replace(/```markdown\n?/g, '').replace(/```\n?/g, '').trim();

    // Try to parse as JSON if it looks like JSON
    if (content.startsWith('{')) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.content) {
          content = parsed.content;
        }
      } catch (e) {
        // Not JSON, use as-is
      }
    }

    // Count words
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

    return {
      content,
      metadata: {
        wordCount,
        platform: request.platform,
        format: request.format,
        optimized: true,
      },
    };
  } catch (error: any) {
    console.warn('[OpenManus Content] Failed to parse result, using raw text');
    
    return {
      content: resultText,
      metadata: {
        platform: request.platform,
        format: request.format,
      },
    };
  }
}

/**
 * Check if OpenManus content generation should be used (feature flag + availability)
 */
export async function shouldUseOpenManusContent(): Promise<boolean> {
  if (!useOpenManusContent()) {
    return false;
  }

  return await isOpenManusAvailable();
}
