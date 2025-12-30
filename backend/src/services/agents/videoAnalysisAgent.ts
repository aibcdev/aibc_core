/**
 * Video Analysis Agent
 * Analyzes video content from client outputs to extract insights
 * Integrates with video analysis APIs and LLM for content understanding
 * NEW: Detects channel references and fetches 2-3 videos from channels to establish style
 */

import { generateJSON } from '../llmService';
import { chromium, Browser, Page } from 'playwright';

interface VideoAnalysisContext {
  videos?: Array<{
    url: string;
    platform?: string;
    title?: string;
    description?: string;
    duration?: number;
    views?: number;
    engagement?: {
      likes?: number;
      shares?: number;
      comments?: number;
    };
    metadata?: any;
  }>;
  brandName?: string;
  industry?: string;
  extractedContent?: any;
  socialLinks?: Record<string, string>; // Channel URLs from scan
}

interface VideoAnalysisResult {
  videoInsights: Array<{
    videoUrl: string;
    platform: string;
    analysis: {
      contentAnalysis: {
        topics: string[];
        themes: string[];
        messaging: string;
        hook: string;
        callToAction: string;
      };
      performanceAnalysis: {
        engagementRate: number;
        performanceScore: number;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
      };
      styleAnalysis: {
        visualStyle: string;
        pacing: string;
        tone: string;
        editingStyle: string;
        musicStyle?: string;
      };
      technicalAnalysis: {
        quality: string;
        length: number;
        format: string;
        thumbnail?: string;
      };
    };
  }>;
  aggregatedInsights: {
    topPerformingVideos: string[];
    commonSuccessFactors: string[];
    contentPatterns: string[];
    stylePatterns: string[];
    recommendations: string[];
  };
}

/**
 * Video Analysis Agent implementation
 */
export const videoAnalysisAgent = {
  /**
   * Execute video analysis task
   */
  async execute(task: string, context: VideoAnalysisContext): Promise<any> {
    console.log(`[Video Analysis Agent] Executing task: ${task}`);

    switch (task) {
      case 'analyze-client-videos':
        return await analyzeClientVideos(context);
      case 'extract-video-insights':
        return await extractVideoInsights(context);
      case 'analyze-video-performance':
        return await analyzeVideoPerformance(context);
      default:
        throw new Error(`Unknown video analysis task: ${task}`);
    }
  },
};

/**
 * Analyze videos from client outputs
 * NEW: Also detects channel references and fetches 2-3 videos from channels
 */
async function analyzeClientVideos(context: VideoAnalysisContext): Promise<VideoAnalysisResult> {
  const { videos = [], brandName, industry, extractedContent, socialLinks } = context;

  console.log(`[Video Analysis Agent] Starting video analysis for ${brandName || 'client'}`);

  // Step 1: Extract videos from posts/content
  let videosToAnalyze = videos.length > 0 
    ? videos 
    : extractVideosFromContent(extractedContent);

  // Step 2: Detect channel references and fetch videos from channels
  if (videosToAnalyze.length === 0 || socialLinks) {
    console.log('[Video Analysis Agent] Checking for channel references...');
    const channelVideos = await fetchVideosFromChannels(socialLinks || {}, brandName);
    videosToAnalyze = [...videosToAnalyze, ...channelVideos];
    console.log(`[Video Analysis Agent] Found ${channelVideos.length} videos from channels`);
  }

  if (videosToAnalyze.length === 0) {
    console.log('[Video Analysis Agent] No videos found in client outputs or channels');
    return {
      videoInsights: [],
      aggregatedInsights: {
        topPerformingVideos: [],
        commonSuccessFactors: [],
        contentPatterns: [],
        stylePatterns: [],
        recommendations: [],
      },
    };
  }

  console.log(`[Video Analysis Agent] Analyzing ${videosToAnalyze.length} videos total (${videos.length} from posts, ${videosToAnalyze.length - videos.length} from channels)`);

  // Analyze each video
  const videoInsights = await Promise.all(
    videosToAnalyze.map(async (video) => {
      try {
        return await analyzeSingleVideo(video, brandName, industry);
      } catch (error: any) {
        console.error(`[Video Analysis Agent] Error analyzing video ${video.url}:`, error.message);
        return null;
      }
    })
  );

  // Filter out failed analyses
  const validInsights = videoInsights.filter((v): v is NonNullable<typeof v> => v !== null);

  // Aggregate insights across all videos
  const aggregatedInsights = await aggregateVideoInsights(validInsights);

  return {
    videoInsights: validInsights,
    aggregatedInsights,
  };
}

/**
 * Extract videos from extracted content
 */
function extractVideosFromContent(extractedContent: any): Array<{
  url: string;
  platform?: string;
  title?: string;
  description?: string;
  duration?: number;
  views?: number;
  engagement?: any;
  metadata?: any;
}> {
  const videos: Array<{
    url: string;
    platform?: string;
    title?: string;
    description?: string;
    duration?: number;
    views?: number;
    engagement?: any;
    metadata?: any;
  }> = [];

  if (!extractedContent) return videos;

  // Extract from posts
  if (Array.isArray(extractedContent.posts)) {
    extractedContent.posts.forEach((post: any) => {
      if (post.media_urls && Array.isArray(post.media_urls)) {
        post.media_urls.forEach((url: string) => {
          if (isVideoUrl(url)) {
            videos.push({
              url,
              platform: post.platform,
              title: post.content?.substring(0, 100),
              description: post.content,
              views: post.views,
              engagement: {
                likes: post.likes,
                shares: post.shares,
                comments: post.comments,
              },
              metadata: post,
            });
          }
        });
      }
    });
  }

  // Extract from videos array if present
  if (Array.isArray(extractedContent.videos)) {
    extractedContent.videos.forEach((video: any) => {
      if (typeof video === 'string') {
        videos.push({ url: video });
      } else if (video.url) {
        videos.push(video);
      }
    });
  }

  return videos;
}

/**
 * Check if URL is a video
 */
function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
  const videoDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'tiktok.com', 'instagram.com/reel', 'facebook.com/watch'];
  
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext)) ||
         videoDomains.some(domain => lowerUrl.includes(domain));
}

/**
 * Analyze a single video
 */
async function analyzeSingleVideo(
  video: {
    url: string;
    platform?: string;
    title?: string;
    description?: string;
    duration?: number;
    views?: number;
    engagement?: any;
    metadata?: any;
  },
  brandName?: string,
  industry?: string
): Promise<VideoAnalysisResult['videoInsights'][0]> {
  console.log(`[Video Analysis Agent] Analyzing video: ${video.url}`);

  // Use LLM to analyze video content
  const prompt = `Analyze this video from ${brandName || 'a client'} in the ${industry || ''} industry.

Video Details:
- URL: ${video.url}
- Platform: ${video.platform || 'unknown'}
- Title: ${video.title || 'N/A'}
- Description: ${video.description || 'N/A'}
- Duration: ${video.duration ? `${video.duration}s` : 'unknown'}
- Views: ${video.views || 'unknown'}
- Engagement: ${video.engagement ? JSON.stringify(video.engagement) : 'unknown'}

Analyze this video and provide insights on:

1. Content Analysis:
   - Main topics and themes
   - Core messaging
   - Hook/opening strategy
   - Call-to-action

2. Performance Analysis:
   - Engagement rate (if metrics available)
   - Performance score (0-100)
   - Strengths
   - Weaknesses
   - Recommendations for improvement

3. Style Analysis:
   - Visual style (minimalist, bold, cinematic, etc.)
   - Pacing (fast, slow, medium)
   - Tone (professional, casual, humorous, etc.)
   - Editing style (cuts, transitions, effects)
   - Music style (if applicable)

4. Technical Analysis:
   - Quality assessment
   - Length appropriateness
   - Format/platform optimization

Return JSON with this structure:
{
  "contentAnalysis": {
    "topics": ["..."],
    "themes": ["..."],
    "messaging": "...",
    "hook": "...",
    "callToAction": "..."
  },
  "performanceAnalysis": {
    "engagementRate": 0.0,
    "performanceScore": 0-100,
    "strengths": ["..."],
    "weaknesses": ["..."],
    "recommendations": ["..."]
  },
  "styleAnalysis": {
    "visualStyle": "...",
    "pacing": "...",
    "tone": "...",
    "editingStyle": "...",
    "musicStyle": "..."
  },
  "technicalAnalysis": {
    "quality": "...",
    "length": 0,
    "format": "...",
    "thumbnail": "..."
  }
}`;

  try {
    const systemPrompt = 'You are an expert video content analyst. Analyze videos to extract actionable insights about content, performance, style, and technical aspects.';

    const analysis = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    // Calculate engagement rate if metrics available
    let engagementRate = 0;
    if (video.views && video.engagement) {
      const totalEngagement = (video.engagement.likes || 0) + 
                             (video.engagement.shares || 0) + 
                             (video.engagement.comments || 0);
      engagementRate = video.views > 0 ? (totalEngagement / video.views) * 100 : 0;
    }

    return {
      videoUrl: video.url,
      platform: video.platform || 'unknown',
      analysis: {
        contentAnalysis: {
          topics: analysis.contentAnalysis?.topics || [],
          themes: analysis.contentAnalysis?.themes || [],
          messaging: analysis.contentAnalysis?.messaging || '',
          hook: analysis.contentAnalysis?.hook || '',
          callToAction: analysis.contentAnalysis?.callToAction || '',
        },
        performanceAnalysis: {
          engagementRate,
          performanceScore: analysis.performanceAnalysis?.performanceScore || 0,
          strengths: analysis.performanceAnalysis?.strengths || [],
          weaknesses: analysis.performanceAnalysis?.weaknesses || [],
          recommendations: analysis.performanceAnalysis?.recommendations || [],
        },
        styleAnalysis: {
          visualStyle: analysis.styleAnalysis?.visualStyle || '',
          pacing: analysis.styleAnalysis?.pacing || '',
          tone: analysis.styleAnalysis?.tone || '',
          editingStyle: analysis.styleAnalysis?.editingStyle || '',
          musicStyle: analysis.styleAnalysis?.musicStyle || '',
        },
        technicalAnalysis: {
          quality: analysis.technicalAnalysis?.quality || '',
          length: video.duration || analysis.technicalAnalysis?.length || 0,
          format: analysis.technicalAnalysis?.format || video.platform || '',
          thumbnail: analysis.technicalAnalysis?.thumbnail || '',
        },
      },
    };
  } catch (error: any) {
    console.error('[Video Analysis Agent] Error in LLM analysis:', error);
    // Return basic structure if LLM fails
    return {
      videoUrl: video.url,
      platform: video.platform || 'unknown',
      analysis: {
        contentAnalysis: {
          topics: [],
          themes: [],
          messaging: '',
          hook: '',
          callToAction: '',
        },
        performanceAnalysis: {
          engagementRate: 0,
          performanceScore: 0,
          strengths: [],
          weaknesses: [],
          recommendations: [],
        },
        styleAnalysis: {
          visualStyle: '',
          pacing: '',
          tone: '',
          editingStyle: '',
          musicStyle: '',
        },
        technicalAnalysis: {
          quality: '',
          length: video.duration || 0,
          format: video.platform || '',
          thumbnail: '',
        },
      },
    };
  }
}

/**
 * Aggregate insights across all analyzed videos
 */
async function aggregateVideoInsights(
  videoInsights: VideoAnalysisResult['videoInsights']
): Promise<VideoAnalysisResult['aggregatedInsights']> {
  if (videoInsights.length === 0) {
    return {
      topPerformingVideos: [],
      commonSuccessFactors: [],
      contentPatterns: [],
      stylePatterns: [],
      recommendations: [],
    };
  }

  // Identify top performing videos
  const sortedByPerformance = [...videoInsights].sort(
    (a, b) => b.analysis.performanceAnalysis.performanceScore - 
              a.analysis.performanceAnalysis.performanceScore
  );
  const topPerformingVideos = sortedByPerformance
    .slice(0, Math.max(1, Math.floor(videoInsights.length * 0.2)))
    .map(v => v.videoUrl);

  // Extract common success factors
  const allStrengths = videoInsights.flatMap(
    v => v.analysis.performanceAnalysis.strengths
  );
  const strengthCounts = new Map<string, number>();
  allStrengths.forEach(strength => {
    strengthCounts.set(strength, (strengthCounts.get(strength) || 0) + 1);
  });
  const commonSuccessFactors = Array.from(strengthCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([factor]) => factor);

  // Extract content patterns
  const allTopics = videoInsights.flatMap(v => v.analysis.contentAnalysis.topics);
  const allThemes = videoInsights.flatMap(v => v.analysis.contentAnalysis.themes);
  const topicCounts = new Map<string, number>();
  [...allTopics, ...allThemes].forEach(item => {
    topicCounts.set(item, (topicCounts.get(item) || 0) + 1);
  });
  const contentPatterns = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([pattern]) => pattern);

  // Extract style patterns
  const stylePatterns: string[] = [];
  const visualStyles = new Set(videoInsights.map(v => v.analysis.styleAnalysis.visualStyle));
  const tones = new Set(videoInsights.map(v => v.analysis.styleAnalysis.tone));
  const pacingStyles = new Set(videoInsights.map(v => v.analysis.styleAnalysis.pacing));
  
  visualStyles.forEach(style => stylePatterns.push(`Visual: ${style}`));
  tones.forEach(tone => stylePatterns.push(`Tone: ${tone}`));
  pacingStyles.forEach(pacing => stylePatterns.push(`Pacing: ${pacing}`));

  // Aggregate recommendations
  const allRecommendations = videoInsights.flatMap(
    v => v.analysis.performanceAnalysis.recommendations
  );
  const recommendationCounts = new Map<string, number>();
  allRecommendations.forEach(rec => {
    recommendationCounts.set(rec, (recommendationCounts.get(rec) || 0) + 1);
  });
  const recommendations = Array.from(recommendationCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([rec]) => rec);

  return {
    topPerformingVideos,
    commonSuccessFactors,
    contentPatterns,
    stylePatterns,
    recommendations,
  };
}

/**
 * Extract video insights for strategy optimization
 */
async function extractVideoInsights(context: VideoAnalysisContext): Promise<any> {
  const analysis = await analyzeClientVideos(context);
  
  return {
    insights: analysis.aggregatedInsights,
    videoCount: analysis.videoInsights.length,
    topPerformers: analysis.videoInsights
      .filter(v => analysis.aggregatedInsights.topPerformingVideos.includes(v.videoUrl)),
  };
}

/**
 * Analyze video performance metrics
 */
async function analyzeVideoPerformance(context: VideoAnalysisContext): Promise<any> {
  const analysis = await analyzeClientVideos(context);
  
  const performanceMetrics = {
    averageEngagementRate: 0,
    averagePerformanceScore: 0,
    totalVideos: analysis.videoInsights.length,
    topPerformers: [] as any[],
    improvementAreas: [] as string[],
  };

  if (analysis.videoInsights.length > 0) {
    const totalEngagement = analysis.videoInsights.reduce(
      (sum, v) => sum + v.analysis.performanceAnalysis.engagementRate, 0
    );
    const totalScore = analysis.videoInsights.reduce(
      (sum, v) => sum + v.analysis.performanceAnalysis.performanceScore, 0
    );

    performanceMetrics.averageEngagementRate = totalEngagement / analysis.videoInsights.length;
    performanceMetrics.averagePerformanceScore = totalScore / analysis.videoInsights.length;

    // Get top performers
    performanceMetrics.topPerformers = analysis.videoInsights
      .sort((a, b) => b.analysis.performanceAnalysis.performanceScore - 
                     a.analysis.performanceAnalysis.performanceScore)
      .slice(0, 3);

    // Get common weaknesses as improvement areas
    const allWeaknesses = analysis.videoInsights.flatMap(
      v => v.analysis.performanceAnalysis.weaknesses
    );
    const weaknessCounts = new Map<string, number>();
    allWeaknesses.forEach(weakness => {
      weaknessCounts.set(weakness, (weaknessCounts.get(weakness) || 0) + 1);
    });
    performanceMetrics.improvementAreas = Array.from(weaknessCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([area]) => area);
  }

  return performanceMetrics;
}

/**
 * Detect channel references from social links
 */
function detectChannelReferences(socialLinks: Record<string, string>): Array<{
  platform: string;
  channelUrl: string;
  channelId: string;
}> {
  const channels: Array<{ platform: string; channelUrl: string; channelId: string }> = [];

  // YouTube channels
  if (socialLinks.youtube || socialLinks.youtubechannel) {
    const youtubeUrl = socialLinks.youtube || socialLinks.youtubechannel;
    if (youtubeUrl) {
      // Extract channel ID from various YouTube URL formats
      const channelMatch = youtubeUrl.match(/(?:youtube\.com\/(?:c\/|channel\/|@|user\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (channelMatch) {
        channels.push({
          platform: 'youtube',
          channelUrl: youtubeUrl,
          channelId: channelMatch[1],
        });
      }
    }
  }

  // TikTok accounts
  if (socialLinks.tiktok) {
    const tiktokUrl = socialLinks.tiktok;
    const tiktokMatch = tiktokUrl.match(/tiktok\.com\/@([a-zA-Z0-9_.]+)/);
    if (tiktokMatch) {
      channels.push({
        platform: 'tiktok',
        channelUrl: tiktokUrl,
        channelId: tiktokMatch[1],
      });
    }
  }

  // Instagram (for Reels)
  if (socialLinks.instagram) {
    const instagramUrl = socialLinks.instagram;
    const instagramMatch = instagramUrl.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
    if (instagramMatch) {
      channels.push({
        platform: 'instagram',
        channelUrl: instagramUrl,
        channelId: instagramMatch[1],
      });
    }
  }

  return channels;
}

/**
 * Fetch 2-3 recent videos from channels to establish style
 */
async function fetchVideosFromChannels(
  socialLinks: Record<string, string>,
  brandName?: string
): Promise<Array<{
  url: string;
  platform?: string;
  title?: string;
  description?: string;
  duration?: number;
  views?: number;
  engagement?: any;
  metadata?: any;
}>> {
  const channels = detectChannelReferences(socialLinks);
  const allVideos: Array<{
    url: string;
    platform?: string;
    title?: string;
    description?: string;
    duration?: number;
    views?: number;
    engagement?: any;
    metadata?: any;
  }> = [];

  for (const channel of channels) {
    try {
      console.log(`[Video Analysis Agent] Fetching videos from ${channel.platform} channel: ${channel.channelUrl}`);
      
      let channelVideos: Array<{
        url: string;
        platform?: string;
        title?: string;
        description?: string;
        duration?: number;
        views?: number;
        engagement?: any;
        metadata?: any;
      }> = [];

      if (channel.platform === 'youtube') {
        channelVideos = await fetchYouTubeChannelVideos(channel.channelUrl, channel.channelId);
      } else if (channel.platform === 'tiktok') {
        channelVideos = await fetchTikTokChannelVideos(channel.channelUrl, channel.channelId);
      } else if (channel.platform === 'instagram') {
        channelVideos = await fetchInstagramChannelVideos(channel.channelUrl, channel.channelId);
      }

      // Limit to 2-3 videos per channel to establish style
      const videosToUse = channelVideos.slice(0, 3);
      allVideos.push(...videosToUse);
      
      console.log(`[Video Analysis Agent] Fetched ${videosToUse.length} videos from ${channel.platform} channel`);
    } catch (error: any) {
      console.error(`[Video Analysis Agent] Error fetching videos from ${channel.platform} channel:`, error.message);
    }
  }

  return allVideos;
}

/**
 * Fetch recent videos from YouTube channel
 */
async function fetchYouTubeChannelVideos(
  channelUrl: string,
  channelId: string
): Promise<Array<{
  url: string;
  platform?: string;
  title?: string;
  description?: string;
  duration?: number;
  views?: number;
  engagement?: any;
  metadata?: any;
}>> {
  const videos: Array<{
    url: string;
    platform?: string;
    title?: string;
    description?: string;
    duration?: number;
    views?: number;
    engagement?: any;
    metadata?: any;
  }> = [];

  try {
    // Normalize channel URL
    let normalizedUrl = channelUrl;
    if (channelUrl.includes('@')) {
      normalizedUrl = `https://www.youtube.com/${channelUrl.split('youtube.com/')[1] || channelUrl.split('youtu.be/')[1] || ''}`;
    } else if (!channelUrl.startsWith('http')) {
      normalizedUrl = `https://www.youtube.com/${channelUrl}`;
    }

    // Use Playwright to scrape YouTube channel videos
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Navigate to channel videos page
    const videosUrl = normalizedUrl.includes('/videos') 
      ? normalizedUrl 
      : `${normalizedUrl.replace(/\/$/, '')}/videos`;
    
    await page.goto(videosUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000); // Wait for dynamic content

    // Extract video links from the page
    const videoData = await page.evaluate(() => {
      const videos: Array<{ url: string; title: string; views?: string; duration?: string }> = [];
      
      // Try multiple selectors for YouTube video links
      const selectors = [
        'a#video-title-link',
        'a[href*="/watch?v="]',
        'ytd-grid-video-renderer a[href*="/watch"]',
        'a#video-title',
      ];

      for (const selector of selectors) {
        // @ts-ignore - document is available in browser context
        const links = Array.from(document.querySelectorAll(selector));
        if (links.length > 0) {
          links.slice(0, 3).forEach((link: any) => {
            const href = link.getAttribute('href');
            const title = link.textContent?.trim() || link.getAttribute('title') || '';
            
            if (href && href.includes('/watch?v=')) {
              const videoId = href.split('v=')[1]?.split('&')[0];
              if (videoId && !videos.find(v => v.url.includes(videoId))) {
                videos.push({
                  url: `https://www.youtube.com/watch?v=${videoId}`,
                  title,
                });
              }
            }
          });
          break; // Use first selector that works
        }
      }

      return videos;
    });

    await browser.close();

    // Convert to our format
    videoData.forEach((video) => {
      videos.push({
        url: video.url,
        platform: 'youtube',
        title: video.title,
        views: video.views ? parseViews(video.views) : undefined,
        metadata: { source: 'channel', channelUrl },
      });
    });

  } catch (error: any) {
    console.error(`[Video Analysis Agent] Error fetching YouTube videos:`, error.message);
  }

  return videos;
}

/**
 * Fetch recent videos from TikTok channel
 */
async function fetchTikTokChannelVideos(
  channelUrl: string,
  channelId: string
): Promise<Array<{
  url: string;
  platform?: string;
  title?: string;
  description?: string;
  duration?: number;
  views?: number;
  engagement?: any;
  metadata?: any;
}>> {
  const videos: Array<{
    url: string;
    platform?: string;
    title?: string;
    description?: string;
    duration?: number;
    views?: number;
    engagement?: any;
    metadata?: any;
  }> = [];

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(channelUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const videoData = await page.evaluate(() => {
      const videos: Array<{ url: string; title?: string }> = [];
      
      // TikTok video links
      // @ts-ignore - document is available in browser context
      const links = Array.from(document.querySelectorAll('a[href*="/video/"]'));
      links.slice(0, 3).forEach((link: any) => {
        const href = link.getAttribute('href');
        if (href && !videos.find(v => v.url === href)) {
          videos.push({
            url: href.startsWith('http') ? href : `https://www.tiktok.com${href}`,
          });
        }
      });

      return videos;
    });

    await browser.close();

    videoData.forEach((video) => {
      videos.push({
        url: video.url,
        platform: 'tiktok',
        title: video.title,
        metadata: { source: 'channel', channelUrl },
      });
    });

  } catch (error: any) {
    console.error(`[Video Analysis Agent] Error fetching TikTok videos:`, error.message);
  }

  return videos;
}

/**
 * Fetch recent videos from Instagram channel (Reels)
 */
async function fetchInstagramChannelVideos(
  channelUrl: string,
  channelId: string
): Promise<Array<{
  url: string;
  platform?: string;
  title?: string;
  description?: string;
  duration?: number;
  views?: number;
  engagement?: any;
  metadata?: any;
}>> {
  const videos: Array<{
    url: string;
    platform?: string;
    title?: string;
    description?: string;
    duration?: number;
    views?: number;
    engagement?: any;
    metadata?: any;
  }> = [];

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(channelUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const videoData = await page.evaluate(() => {
      const videos: Array<{ url: string }> = [];
      
      // Instagram Reels links
      // @ts-ignore - document is available in browser context
      const links = Array.from(document.querySelectorAll('a[href*="/reel/"]'));
      links.slice(0, 3).forEach((link: any) => {
        const href = link.getAttribute('href');
        if (href && !videos.find(v => v.url === href)) {
          videos.push({
            url: href.startsWith('http') ? href : `https://www.instagram.com${href}`,
          });
        }
      });

      return videos;
    });

    await browser.close();

    videoData.forEach((video) => {
      videos.push({
        url: video.url,
        platform: 'instagram',
        metadata: { source: 'channel', channelUrl },
      });
    });

  } catch (error: any) {
    console.error(`[Video Analysis Agent] Error fetching Instagram videos:`, error.message);
  }

  return videos;
}

/**
 * Parse view count string to number
 */
function parseViews(viewsString: string): number {
  const cleaned = viewsString.replace(/[^\d.KMB]/g, '');
  const num = parseFloat(cleaned);
  
  if (cleaned.includes('K')) return Math.round(num * 1000);
  if (cleaned.includes('M')) return Math.round(num * 1000000);
  if (cleaned.includes('B')) return Math.round(num * 1000000000);
  
  return Math.round(num);
}

