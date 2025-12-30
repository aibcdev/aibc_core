/**
 * Media Agent
 * Integrates with FAL API and Gemini for image/video generation
 */

interface MediaContext {
  prompt?: string;
  style?: string;
  size?: string;
  duration?: number;
  mediaUrl?: string;
  platform?: string;
  variations?: any[];
  contentIdeas?: any[];
  brandDNA?: any;
  brandVoice?: any; // Brand voice from Styles & Voice settings
  brandAssets?: { // All brand assets
    voice?: any;
    colors?: any[];
    fonts?: any[];
    materials?: any[];
    profile?: any;
  };
  extractedContent?: any;
  competitorIntelligence?: any[];
  strategicInsights?: any[];
  brandIdentity?: any;
  username?: string;
}

/**
 * Media Agent implementation
 */
export const mediaAgent = {
  /**
   * Execute media task
   */
  async execute(task: string, context: MediaContext): Promise<any> {
    console.log(`[Media Agent] Executing task: ${task}`);

    switch (task) {
      case 'generate-image':
        return await generateImage(context);
      case 'generate-video':
        return await generateVideo(context);
      case 'optimize-media':
        return await optimizeMedia(context);
      case 'create-media-variations':
        return await createMediaVariations(context);
      case 'generate-content-assets':
        // CRITICAL: Regenerate content ideas using actual brand data if available
        // This ensures content matches the brand's actual style, not generic templates
        if (context.brandDNA || context.extractedContent) {
          return await regenerateContentIdeasWithBrandData(context);
        }
        // Fallback: Just generate assets for existing contentIdeas
        return await generateContentAssets(context);
      case 'create-media-assets':
        return await createMediaAssets(context);
      default:
        throw new Error(`Unknown media task: ${task}`);
    }
  },
};

/**
 * Generate image via FAL or Gemini
 */
async function generateImage(context: MediaContext): Promise<any> {
  const { prompt, style, size } = context;

  if (!prompt) {
    throw new Error('Prompt required for image generation');
  }

  try {
    // Try FAL API first if configured
    if (process.env.FAL_API_KEY) {
      try {
        const falImage = await generateImageWithFAL(prompt, style, size);
        return {
          success: true,
          imageUrl: falImage.url,
          provider: 'fal',
          prompt,
          style,
          size,
          generatedAt: new Date().toISOString(),
        };
      } catch (error: any) {
        console.warn('[Media Agent] FAL generation failed, falling back to Gemini:', error.message);
      }
    }

    // Fallback to Gemini
    if (process.env.GEMINI_API_KEY) {
      const geminiImage = await generateImageWithGemini(prompt, style, size);
      return {
        success: true,
        imageUrl: geminiImage.url,
        provider: 'gemini',
        prompt,
        style,
        size,
        generatedAt: new Date().toISOString(),
      };
    }

    throw new Error('No image generation API configured (FAL or Gemini)');
  } catch (error: any) {
    console.error('[Media Agent] Image generation error:', error);
    throw error;
  }
}

/**
 * Generate video via FAL
 */
async function generateVideo(context: MediaContext): Promise<any> {
  const { prompt, duration = 10 } = context;

  if (!prompt) {
    throw new Error('Prompt required for video generation');
  }

  if (!process.env.FAL_API_KEY) {
    throw new Error('FAL API key not configured for video generation');
  }

  try {
    const video = await generateVideoWithFAL(prompt, duration);
    return {
      success: true,
      videoUrl: video.url,
      provider: 'fal',
      prompt,
      duration,
      generatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Media Agent] Video generation error:', error);
    throw error;
  }
}

/**
 * Optimize media for platform
 */
async function optimizeMedia(context: MediaContext): Promise<any> {
  const { mediaUrl, platform } = context;

  if (!mediaUrl) {
    throw new Error('Media URL required');
  }

  try {
    // Platform-specific optimization
    const optimizations: any = {
      platform,
      originalUrl: mediaUrl,
    };

    switch (platform?.toLowerCase()) {
      case 'instagram':
        optimizations.width = 1080;
        optimizations.height = 1080;
        optimizations.format = 'jpg';
        optimizations.quality = 90;
        break;
      case 'twitter':
      case 'x':
        optimizations.width = 1200;
        optimizations.height = 675;
        optimizations.format = 'jpg';
        optimizations.quality = 85;
        break;
      case 'linkedin':
        optimizations.width = 1200;
        optimizations.height = 627;
        optimizations.format = 'jpg';
        optimizations.quality = 90;
        break;
      case 'facebook':
        optimizations.width = 1200;
        optimizations.height = 630;
        optimizations.format = 'jpg';
        optimizations.quality = 85;
        break;
      default:
        optimizations.width = 1080;
        optimizations.height = 1080;
        optimizations.format = 'jpg';
        optimizations.quality = 85;
    }

    return {
      success: true,
      optimizedUrl: mediaUrl, // In real implementation, this would be the optimized version
      optimizations,
      optimizedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Media Agent] Media optimization error:', error);
    throw error;
  }
}

/**
 * Create platform-specific media variations
 */
async function createMediaVariations(context: MediaContext): Promise<any> {
  const { mediaUrl, variations = [] } = context;

  if (!mediaUrl) {
    throw new Error('Media URL required');
  }

  try {
    const platforms = variations.length > 0 ? variations : ['instagram', 'twitter', 'linkedin', 'facebook'];
    
    const optimizedVariations = await Promise.all(
      platforms.map(platform => optimizeMedia({ mediaUrl, platform }))
    );

    return {
      success: true,
      variations: optimizedVariations,
      totalVariations: optimizedVariations.length,
      createdAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Media Agent] Variation creation error:', error);
    throw error;
  }
}

/**
 * CRITICAL: Regenerate content ideas using actual brand data
 * This ensures content matches the brand's actual style, voice, and posting patterns
 */
async function regenerateContentIdeasWithBrandData(context: MediaContext): Promise<any> {
  const { brandDNA, extractedContent, competitorIntelligence, strategicInsights, brandIdentity, username } = context;
  
  console.log(`[Media Agent] ========================================`);
  console.log(`[Media Agent] Regenerating content ideas with brand data`);
  console.log(`[Media Agent] Has brandDNA: ${!!brandDNA}`);
  console.log(`[Media Agent] Has extractedContent: ${!!extractedContent}`);
  console.log(`[Media Agent] Has brandIdentity: ${!!brandIdentity}`);
  
  try {
    const { generateJSON } = await import('../llmService');
    
    // Extract actual brand data
    const brandName = brandIdentity?.name || username?.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0] || 'the brand';
    const industry = brandIdentity?.industry || brandDNA?.industry || 'their industry';
    const niche = brandIdentity?.niche || brandDNA?.niche || '';
    const description = brandIdentity?.description || brandDNA?.description || brandDNA?.bio || '';
    
    // Extract ACTUAL posts and content style
    const actualPosts = extractedContent?.posts || [];
    const actualThemes = extractedContent?.content_themes || brandDNA?.themes || [];
    // USE ONLY extracted brand voice from scan (analyzed from actual content) - NOT manual settings
    // The scan analyzes actual posts to extract real voice, like asking ChatGPT "Write a paragraph explaining [COMPANY]"
    const brandVoice = brandDNA?.voice || extractedContent?.brand_voice || {};
    const bio = extractedContent?.profile?.bio || brandDNA?.bio || '';
    
    // Analyze actual posting patterns
    const postSamples = actualPosts.slice(0, 10).map((p: any) => ({
      content: p.content || p.text || '',
      platform: p.platform || 'unknown',
      engagement: p.engagement || p.likes || 0,
    }));
    
    // Extract voice characteristics from ACTUAL extracted voice (from content analysis)
    const voiceTones = brandVoice?.tones || brandVoice?.vocabulary || [];
    const voiceStyle = brandVoice?.style || brandVoice?.tone || '';
    const voiceFormality = brandVoice?.formality || '';
    
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/akeemojuko/Documents/aibc_core-1/.cursor/debug.log';
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'mediaAgent.ts:regenerateContentIdeasWithBrandData',message:'USING EXTRACTED BRAND VOICE',data:{hasBrandDNAVoice:!!brandDNA?.voice,hasExtractedContentVoice:!!extractedContent?.brand_voice,voiceStyle,voiceFormality,voiceTonesCount:voiceTones.length,actualPostsCount:actualPosts.length},timestamp:Date.now(),sessionId:'debug-session',runId:'content-generation',hypothesisId:'H19'})+'\n');
    } catch(e){}
    // #endregion
    
    console.log(`[Media Agent] Brand: ${brandName}, Industry: ${industry}`);
    console.log(`[Media Agent] Actual posts: ${actualPosts.length}, Themes: ${actualThemes.length}`);
    console.log(`[Media Agent] Voice: ${voiceStyle}, Tones: ${voiceTones.join(', ')}`);
    console.log(`[Media Agent] Brand Voice Source: ${brandDNA?.voice ? 'Brand DNA (extracted from actual content)' : 'Not specified'}`);
    
    // Build prompt using ACTUAL brand data
    const contentPrompt = `Generate 8 VIRAL content ideas for ${brandName} that MATCH their actual content style.

## 🎯 BRAND IDENTITY (USE THIS AS PRIMARY):
- Company: ${brandName}
- Industry: ${industry}
- Niche: ${niche}
- What they do: ${description}
${bio ? `- Bio: ${bio}` : ''}

## 📝 ACTUAL CONTENT STYLE (MATCH THIS - extracted from their real posts):
${actualThemes.length > 0 ? `- Content Themes: ${actualThemes.join(', ')}` : ''}
${voiceStyle ? `- Voice Style (from actual content analysis): ${voiceStyle}` : ''}
${voiceTones.length > 0 ? `- Voice Tones/Vocabulary (words they actually use): ${voiceTones.join(', ')}` : ''}
${voiceFormality ? `- Formality (from their actual posts): ${voiceFormality}` : ''}

## 📊 ACTUAL POSTS (ANALYZE THESE TO MATCH STYLE):
${postSamples.length > 0 ? postSamples.slice(0, 5).map((p: any, i: number) => `
Post ${i + 1} (${p.platform}):
"${p.content.substring(0, 200)}${p.content.length > 200 ? '...' : ''}"
`).join('\n') : 'No posts available - use brand identity and industry'}

## 🎯 TASK:
Generate content ideas that:
1. MATCH the actual posting style shown above (from their real posts)
2. Use the same voice tones (${voiceTones.length > 0 ? voiceTones.join(', ') : 'authentic and engaging'}) - extracted from their actual content
3. Reference actual themes: ${actualThemes.length > 0 ? actualThemes.join(', ') : 'brand-specific topics'}
4. Are SPECIFIC to ${brandName} and their ${industry} business
5. Use viral hooks BUT maintain brand voice consistency (match their actual writing style from the posts above)
6. ${voiceStyle ? `Follow their actual voice style: ${voiceStyle} (extracted from their real content)` : 'Maintain consistent brand voice based on their actual posts'}
7. ${voiceFormality ? `Use ${voiceFormality} formality level (from their actual posts)` : 'Match brand formality from their actual content'}

CRITICAL: Content must feel like it was written by ${brandName} themselves, not generic marketing copy.
If their posts are casual, your ideas should be casual. If they're professional, your ideas should be professional.
MATCH THEIR ACTUAL STYLE.

Return JSON array:
[
  {
    "title": "Viral hook title that matches ${brandName}'s voice",
    "description": "Why this matches their style + why it will go viral",
    "platform": "instagram|twitter|linkedin|youtube|tiktok",
    "format": "reel|carousel|thread|post|video|short",
    "theme": "${actualThemes[0] || 'brand content'}",
    "voiceMatch": "How this matches their actual voice style",
    "viralTrigger": "curiosity|controversy|social_proof|FOMO|identity|emotion",
    "estimatedEngagement": "Specific prediction",
    "whyItWorks": "Why this will work for ${brandName} specifically"
  }
]`;

    const systemPrompt = `You are a content strategist who creates content that MATCHES the brand's actual style.

CRITICAL RULES:
1. Analyze the actual posts provided - match their tone, style, and format
2. Use the same voice characteristics (${voiceTones.length > 0 ? voiceTones.join(', ') : 'authentic'})
3. Reference actual themes: ${actualThemes.join(', ') || 'brand-specific topics'}
4. Content must feel like ${brandName} wrote it, not generic marketing
5. Every idea must be SPECIFIC to ${brandName} in ${industry}
6. Match their actual posting patterns and style

DO NOT generate generic content. Every idea must reference ${brandName} specifically and match their actual content style.`;

    const regeneratedIdeas = await generateJSON<any>(contentPrompt, systemPrompt, { tier: 'deep' });
    
    let contentIdeas: any[] = [];
    if (Array.isArray(regeneratedIdeas)) {
      contentIdeas = regeneratedIdeas;
    } else if (regeneratedIdeas?.ideas && Array.isArray(regeneratedIdeas.ideas)) {
      contentIdeas = regeneratedIdeas.ideas;
    } else if (regeneratedIdeas?.contentIdeas && Array.isArray(regeneratedIdeas.contentIdeas)) {
      contentIdeas = regeneratedIdeas.contentIdeas;
    }
    
    // Filter to ensure brand specificity
    contentIdeas = contentIdeas.filter((idea: any) => {
      if (!idea.title || !idea.description) return false;
      const titleLower = idea.title.toLowerCase();
      const descLower = idea.description.toLowerCase();
      const brandNameLower = brandName.toLowerCase();
      
      // Must reference brand name or industry
      const mentionsBrand = titleLower.includes(brandNameLower) || 
                           descLower.includes(brandNameLower) ||
                           titleLower.includes(industry.toLowerCase().split(' ')[0]) ||
                           descLower.includes(industry.toLowerCase().split(' ')[0]);
      
      return mentionsBrand && idea.title.length > 20;
    });
    
    console.log(`[Media Agent] ✅ Regenerated ${contentIdeas.length} brand-specific content ideas`);
    console.log(`[Media Agent] ========================================`);
    
    // Generate images for the regenerated ideas
    const assets = await Promise.all(
      contentIdeas.slice(0, 5).map(async (idea: any, index: number) => {
        try {
          const imagePrompt = `${idea.title} - ${brandName} ${industry} content`;
          const image = await generateImage({
            prompt: imagePrompt,
            style: voiceStyle || 'modern',
            size: 'square',
          });
          return {
            contentId: idea.id || `content_${Date.now()}_${index}`,
            imageUrl: image.imageUrl,
            generatedAt: new Date().toISOString(),
          };
        } catch (error: any) {
          console.warn(`[Media Agent] Failed to generate asset for content ${index}:`, error.message);
          return null;
        }
      })
    );

    return {
      success: true,
      contentIdeas: contentIdeas, // Return regenerated ideas
      assets: assets.filter(a => a !== null),
      totalGenerated: contentIdeas.length,
      generatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Media Agent] Content regeneration error:', error);
    // Fallback to existing contentIdeas if regeneration fails
    return await generateContentAssets(context);
  }
}

/**
 * Generate content assets for content ideas (fallback)
 */
async function generateContentAssets(context: MediaContext): Promise<any> {
  const { contentIdeas = [] } = context as any;

  try {
    const assets = await Promise.all(
      contentIdeas.slice(0, 5).map(async (idea: any) => {
        try {
          const image = await generateImage({
            prompt: idea.title || idea.description || 'Content image',
            style: 'modern',
            size: 'square',
          });
          return {
            contentId: idea.id,
            imageUrl: image.imageUrl,
            generatedAt: new Date().toISOString(),
          };
        } catch (error: any) {
          console.warn(`[Media Agent] Failed to generate asset for content ${idea.id}:`, error.message);
          return null;
        }
      })
    );

    return {
      success: true,
      contentIdeas: contentIdeas, // Return original ideas
      assets: assets.filter(a => a !== null),
      totalGenerated: assets.filter(a => a !== null).length,
      generatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Media Agent] Content assets generation error:', error);
    throw error;
  }
}

/**
 * Create media assets for content
 */
async function createMediaAssets(context: MediaContext): Promise<any> {
  const { content } = context as any;

  if (!content) {
    throw new Error('Content required');
  }

  try {
    // Generate images for content
    const imagePrompts = Array.isArray(content) 
      ? content.map((c: any) => c.title || c.description || 'Content image')
      : [content.title || content.description || 'Content image'];

    const images = await Promise.all(
      imagePrompts.map((prompt: string) => 
        generateImage({ prompt, style: 'modern', size: 'square' })
      )
    );

    return {
      success: true,
      images: images.map(img => img.imageUrl),
      totalImages: images.length,
      createdAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Media Agent] Media assets creation error:', error);
    throw error;
  }
}

/**
 * Generate image with FAL API
 */
async function generateImageWithFAL(prompt: string, style?: string, size?: string): Promise<any> {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) {
    throw new Error('FAL API key not configured');
  }

  // FAL API endpoint for image generation
  const url = 'https://fal.run/fal-ai/flux-pro/v1/images/generations';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: `${prompt}${style ? `, ${style} style` : ''}`,
      size: size || '1024x1024',
      num_images: 1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FAL API error: ${error}`);
  }

  const data = await response.json() as any;
  return {
    url: data.images?.[0]?.url || data.url,
    data,
  };
}

/**
 * Generate image with Gemini
 */
async function generateImageWithGemini(prompt: string, style?: string, size?: string): Promise<any> {
  // Use existing Gemini route
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  const url = `${apiBaseUrl}/api/gemini/generate-image`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: `${prompt}${style ? `, ${style} style` : ''}`,
      style: style || 'modern',
      size: size || 'square',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json() as any;
  return {
    url: data.images?.[0] || data.imageUrl,
    data,
  };
}

/**
 * Generate video with FAL API
 */
async function generateVideoWithFAL(prompt: string, duration: number): Promise<any> {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) {
    throw new Error('FAL API key not configured');
  }

  // FAL API endpoint for video generation
  const url = 'https://fal.run/fal-ai/luma-dream-machine/v1/generations';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      duration_seconds: duration,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FAL API error: ${error}`);
  }

  const data = await response.json() as any;
  return {
    url: data.video_url || data.url,
    data,
  };
}

