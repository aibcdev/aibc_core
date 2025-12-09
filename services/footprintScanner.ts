// Client-side LLM calls disabled to avoid quota/API usage in browser
const llmApiKey = '';

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
  // Client-side LLM disabled: return placeholder to avoid Gemini calls from browser
  return {
    profile: {
      bio: 'Content extraction deferred to backend',
      verified: false,
    },
    posts: [],
    content_themes: [],
    extraction_confidence: 0.5,
  };
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
  // Client-side LLM disabled: return placeholder brand DNA
  return {
    voice: {
      style: 'professional',
      formality: 'casual',
      tone: 'friendly',
      vocabulary: [],
    },
    themes: validatedContent.content_themes,
  };
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

