import { GoogleGenAI } from "@google/genai";

// Free LLM API key (Gemini free tier or other free LLM)
const llmApiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

interface ProfileURLs {
  twitter?: string;
  youtube?: string[];
  linkedin?: string;
  instagram?: string;
}

interface ExtractedContent {
  profile: {
    bio?: string;
    verified?: boolean;
    profile_image?: string;
    follower_count?: number;
  };
  posts: Array<{
    content: string;
    timestamp?: string;
    media_urls?: string[];
    engagement?: {
      likes?: number;
      shares?: number;
    };
  }>;
  content_themes: string[];
  extraction_confidence: number;
}

interface BrandDNA {
  voice: {
    style: string;
    formality: string;
    tone: string;
    vocabulary: string[];
  };
  themes: string[];
  visual_identity?: {
    colors?: string[];
    style?: string;
  };
  engagement_patterns?: {
    frequency?: string;
    best_content_types?: string[];
  };
}

/**
 * Discovers public profile URLs for a given username across platforms
 */
export function discoverProfileURLs(username: string, platforms: string[]): ProfileURLs {
  const urls: ProfileURLs = {};

  if (platforms.includes('twitter')) {
    urls.twitter = `https://twitter.com/${username}`;
  }

  if (platforms.includes('youtube')) {
    urls.youtube = [
      `https://youtube.com/@${username}`,
      `https://youtube.com/c/${username}`,
      `https://youtube.com/user/${username}`,
    ];
  }

  if (platforms.includes('linkedin')) {
    urls.linkedin = `https://linkedin.com/in/${username}`;
  }

  if (platforms.includes('instagram')) {
    urls.instagram = `https://instagram.com/${username}`;
  }

  return urls;
}

/**
 * Scrapes a public profile page (client-side or server-side)
 * Note: This is a placeholder - actual scraping would be done server-side
 * due to CORS restrictions
 */
export async function scrapePublicProfile(url: string): Promise<{ html: string; text: string; url: string }> {
  // This would be implemented server-side with Playwright
  // For now, return placeholder structure
  return {
    html: '',
    text: '',
    url: url,
  };
}

/**
 * Uses LLM to extract OUTPUT content from scraped page
 * Uses free tier LLM (Gemini free tier)
 */
export async function extractOutputContent(
  scrapedContent: { html: string; text: string; url: string },
  username: string,
  platform: string
): Promise<ExtractedContent> {
  if (!llmApiKey) {
    // Fallback mock data if no API key
    return {
      profile: {
        bio: 'Sample bio',
        verified: false,
      },
      posts: [],
      content_themes: [],
      extraction_confidence: 0.5,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: llmApiKey });

    const prompt = `You are analyzing a public ${platform} profile page for user: ${username}

IMPORTANT: Extract ONLY content published BY ${username} (OUTPUT only).
DO NOT extract:
- Mentions of ${username} by others
- Retweets or shares
- Comments from other users
- Content about ${username}
- Third-party content

From this page content, extract:

1. Profile Information:
   - Bio/description
   - Profile picture URL
   - Verification status
   - Follower/following counts (if visible)

2. Posts/Content Published BY ${username}:
   - Post text/content
   - Timestamps
   - Media (images, videos) URLs
   - Engagement metrics (if visible)

3. Content Analysis:
   - Topics/themes
   - Writing style
   - Posting frequency patterns

Page Content:
${scrapedContent.text.substring(0, 50000)} // Limit to avoid token limits

Return structured JSON:
{
  "profile": {
    "bio": "...",
    "verified": true/false,
    "profile_image": "url"
  },
  "posts": [
    {
      "content": "...",
      "timestamp": "...",
      "media_urls": ["..."],
      "engagement": {"likes": 0, "shares": 0}
    }
  ],
  "content_themes": ["..."],
  "extraction_confidence": 0.0-1.0
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const text = response.text || '';
    
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if JSON parsing fails
    return {
      profile: { bio: 'Extraction in progress' },
      posts: [],
      content_themes: [],
      extraction_confidence: 0.7,
    };
  } catch (error) {
    console.error('LLM extraction error:', error);
    throw error;
  }
}

/**
 * Validates that extracted content is OUTPUT from the brand only
 */
export function validateOutputOnly(
  extractedData: ExtractedContent,
  username: string
): ExtractedContent {
  const validatedPosts = extractedData.posts.filter((post) => {
    // Check if post is from the brand
    const isFromBrand = !post.content.toLowerCase().startsWith('rt @') &&
                       !post.content.toLowerCase().startsWith('retweeting') &&
                       !post.content.includes('@') || post.content.includes(`@${username}`);
    
    return isFromBrand;
  });

  return {
    ...extractedData,
    posts: validatedPosts,
  };
}

/**
 * Extracts Brand DNA from validated OUTPUT content
 */
export async function extractBrandDNA(
  validatedContent: ExtractedContent
): Promise<BrandDNA> {
  if (!llmApiKey) {
    return {
      voice: {
        style: 'professional',
        formality: 'casual',
        tone: 'friendly',
        vocabulary: [],
      },
      themes: [],
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: llmApiKey });

    // Aggregate all post content
    const allPosts = validatedContent.posts.map((p) => p.content).join('\n\n');
    const combinedText = allPosts.substring(0, 50000); // Limit tokens

    const prompt = `Analyze this brand's content to extract their unique DNA:

Content:
${combinedText}

Extract:

1. Voice & Tone:
   - Writing style (formal, casual, technical, etc.)
   - Vocabulary patterns
   - Sentence structure
   - Emotional tone

2. Content Themes:
   - Main topics they discuss
   - Value propositions
   - Messaging pillars

3. Visual Identity (from descriptions):
   - Color preferences
   - Style (minimalist, bold, etc.)

4. Engagement Patterns:
   - Posting frequency
   - Best performing content types

Return structured JSON with brand DNA profile.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return {
      voice: {
        style: 'professional',
        formality: 'casual',
        tone: 'friendly',
        vocabulary: [],
      },
      themes: validatedContent.content_themes,
    };
  } catch (error) {
    console.error('Brand DNA extraction error:', error);
    throw error;
  }
}

/**
 * Main function to scan a brand's digital footprint
 */
export async function scanBrandFootprint(
  username: string,
  platforms: string[] = ['twitter', 'youtube', 'linkedin', 'instagram']
): Promise<{
  extractedContent: ExtractedContent;
  brandDNA: BrandDNA;
}> {
  // 1. Discover profile URLs
  const profileURLs = discoverProfileURLs(username, platforms);

  // 2. Scrape public profiles (would be done server-side)
  // For now, this is a placeholder - actual scraping needs server-side implementation
  const scrapedData = await Promise.all(
    Object.entries(profileURLs).map(async ([platform, url]) => {
      if (Array.isArray(url)) {
        // Try first URL format
        return await scrapePublicProfile(url[0]);
      }
      return await scrapePublicProfile(url);
    })
  );

  // 3. Extract OUTPUT content using LLM
  const extractedContents = await Promise.all(
    scrapedData.map((data, index) => {
      const platform = Object.keys(profileURLs)[index];
      return extractOutputContent(data, username, platform);
    })
  );

  // 4. Merge extracted content from all platforms
  const mergedContent: ExtractedContent = {
    profile: extractedContents[0]?.profile || {},
    posts: extractedContents.flatMap((ec) => ec.posts),
    content_themes: Array.from(
      new Set(extractedContents.flatMap((ec) => ec.content_themes))
    ),
    extraction_confidence:
      extractedContents.reduce((sum, ec) => sum + ec.extraction_confidence, 0) /
      extractedContents.length,
  };

  // 5. Validate OUTPUT only
  const validatedContent = validateOutputOnly(mergedContent, username);

  // 6. Extract Brand DNA
  const brandDNA = await extractBrandDNA(validatedContent);

  return {
    extractedContent: validatedContent,
    brandDNA,
  };
}

