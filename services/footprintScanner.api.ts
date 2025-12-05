/**
 * API endpoint handler for digital footprint scanning
 * This would be deployed as a Cloud Function or Cloud Run service
 */

import { scrapePublicProfileServer, extractOutputContentServer, extractBrandDNAServer } from './footprintScanner.server';

interface ScanRequest {
  username: string;
  platforms: string[];
  scanType: 'standard' | 'deep';
}

interface ScanResponse {
  success: boolean;
  data?: {
    extractedContent: any;
    brandDNA: any;
  };
  error?: string;
}

/**
 * Main API handler for scanning digital footprint
 */
export async function scanFootprintAPI(request: ScanRequest): Promise<ScanResponse> {
  try {
    const { username, platforms, scanType } = request;

    // Validate request
    if (!username || !platforms || platforms.length === 0) {
      return {
        success: false,
        error: 'Username and platforms are required',
      };
    }

    // For standard scans, use LLM web scanning (free)
    if (scanType === 'standard') {
      const results = await performStandardScan(username, platforms);
      return {
        success: true,
        data: results,
      };
    }

    // For deep scans (Premium), use APIs
    if (scanType === 'deep') {
      const results = await performDeepScan(username, platforms);
      return {
        success: true,
        data: results,
      };
    }

    return {
      success: false,
      error: 'Invalid scan type',
    };
  } catch (error: any) {
    console.error('Scan error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

/**
 * Standard scan using LLM web scanning (free)
 */
async function performStandardScan(
  username: string,
  platforms: string[]
): Promise<{ extractedContent: any; brandDNA: any }> {
  const profileURLs = discoverProfileURLs(username, platforms);
  const allExtractedContent: any[] = [];

  // Scrape and extract from each platform
  for (const [platform, url] of Object.entries(profileURLs)) {
    try {
      const urlToScrape = Array.isArray(url) ? url[0] : url;
      
      // Scrape public profile
      const scraped = await scrapePublicProfileServer(urlToScrape);
      
      // Extract OUTPUT content using LLM
      const extracted = await extractOutputContentServer(scraped, username, platform);
      
      allExtractedContent.push(extracted);
    } catch (error) {
      console.error(`Error scanning ${platform}:`, error);
      // Continue with other platforms
    }
  }

  // Merge content from all platforms
  const mergedContent = {
    profile: allExtractedContent[0]?.profile || {},
    posts: allExtractedContent.flatMap((ec) => ec.posts || []),
    content_themes: Array.from(
      new Set(allExtractedContent.flatMap((ec) => ec.content_themes || []))
    ),
    extraction_confidence:
      allExtractedContent.length > 0
        ? allExtractedContent.reduce((sum, ec) => sum + (ec.extraction_confidence || 0), 0) /
          allExtractedContent.length
        : 0,
  };

  // Validate OUTPUT only
  const validatedContent = validateOutputOnly(mergedContent, username);

  // Extract Brand DNA
  const brandDNA = await extractBrandDNAServer(validatedContent);

  return {
    extractedContent: validatedContent,
    brandDNA,
  };
}

/**
 * Deep scan using official APIs (Premium tier only)
 */
async function performDeepScan(
  username: string,
  platforms: string[]
): Promise<{ extractedContent: any; brandDNA: any }> {
  // This would use official APIs
  // Implementation depends on API access
  throw new Error('Deep scan (API-based) not yet implemented');
}

/**
 * Helper: Discover profile URLs
 */
function discoverProfileURLs(username: string, platforms: string[]): Record<string, string | string[]> {
  const urls: Record<string, string | string[]> = {};

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
 * Helper: Validate OUTPUT only
 */
function validateOutputOnly(content: any, username: string): any {
  const validatedPosts = (content.posts || []).filter((post: any) => {
    const postContent = (post.content || '').toLowerCase();
    const isRetweet = postContent.startsWith('rt @') || postContent.startsWith('retweeting');
    const isMention = postContent.includes('@') && !postContent.includes(`@${username.toLowerCase()}`);
    
    return !isRetweet && !isMention;
  });

  return {
    ...content,
    posts: validatedPosts,
  };
}

