/**
 * Mass Content Scheduler - Automatically generate thousands of pages
 * Runs daily to build towards 1M indexed pages
 */

import cron from 'node-cron';
import { getTopPriorityKeywords } from '../services/keywordGenerationService';
import { batchGeneratePosts } from '../services/massContentGenerationService';

/**
 * Schedule daily mass content generation (AGGRESSIVE MODE)
 */
export function scheduleMassContentGeneration(
  time: string = '02:00', // 2 AM to avoid peak traffic
  timezone: string = 'America/New_York',
  postsPerDay: number = 5000 // AGGRESSIVE: 5000 posts per day
): void {
  console.log(`📅 Scheduling AGGRESSIVE mass content generation: ${postsPerDay} posts/day at ${time} ${timezone}`);

  cron.schedule(`0 ${time.split(':')[1]} ${time.split(':')[0]} * * *`, async () => {
    console.log('🚀 Starting AGGRESSIVE daily mass content generation...');
    
    try {
      // Get trending keywords first (highest priority)
      const { TrendingTopicsService } = await import('../services/trendingTopicsService');
      const trendingService = new TrendingTopicsService();
      const trendingKeywords = await trendingService.getTrendingKeywords();
      
      console.log(`📈 Found ${trendingKeywords.length} trending keywords`);

      // Get regular priority keywords
      const regularKeywords = getTopPriorityKeywords(postsPerDay - trendingKeywords.length);
      
      // Combine (trending first)
      const allKeywords = [...trendingKeywords, ...regularKeywords];
      console.log(`📝 Total keywords to generate: ${allKeywords.length}`);

      // Use queue system for parallel processing
      const { contentQueue } = await import('../services/contentQueue');
      await contentQueue.addKeywords(allKeywords);

      // Also generate directly for immediate results
      const llmService = await import('../services/llmService');
      const results = await batchGeneratePosts(allKeywords.slice(0, 1000), llmService, 100, 0);

      console.log(`✅ Daily generation complete: ${results.success} success, ${results.failed} failed`);
      
      // Log progress
      const { getTotalPostCount } = await import('../services/massSitemapService');
      const totalPosts = await getTotalPostCount();
      const progress = ((totalPosts / 1000000) * 100).toFixed(2);
      console.log(`📊 Total posts: ${totalPosts} (${progress}% of 1M target)`);
      
      // Submit new posts to Google (RATE-LIMITED for compliance)
      // Only submit published posts that passed quality checks
      const publishedPosts = results.posts.filter(p => p.status === 'published');
      if (publishedPosts.length > 0) {
        const { googleIndexing } = await import('../services/googleIndexingService');
        const { indexingRateLimiter } = await import('../services/contentQualityService');
        
        // Only submit if within rate limits
        const urls = publishedPosts
          .slice(0, indexingRateLimiter.getRemainingDaily()) // Respect daily limit
          .map(p => 
            `${process.env.BASE_URL || process.env.FRONTEND_URL || 'https://aibcmedia.com'}/blog/${p.slug}`
          );
        
        if (urls.length > 0) {
          console.log(`📤 Submitting ${urls.length} URLs to Google (within rate limits)...`);
          await googleIndexing.submitBatch(urls);
        } else {
          console.log(`⏸️ Deferring ${publishedPosts.length} URLs (rate limit reached)`);
        }
      }
    } catch (error) {
      console.error('❌ Error in mass content generation:', error);
    }
  }, {
    timezone,
  });
}

/**
 * Schedule location-based content generation (weekly)
 */
export function scheduleLocationContentGeneration(
  dayOfWeek: number = 0, // Sunday
  time: string = '03:00',
  timezone: string = 'America/New_York'
): void {
  console.log(`📅 Scheduling location content generation: Weekly on day ${dayOfWeek} at ${time}`);

  cron.schedule(`0 ${time.split(':')[1]} ${time.split(':')[0]} * * ${dayOfWeek}`, async () => {
    console.log('🌍 Starting location-based content generation...');
    
    try {
      const { getKeywordsForLocation, TARGET_LOCATIONS } = await import('../services/keywordGenerationService');
      const llmService = await import('../services/llmService');

      // Generate content for one location per week
      const locationIndex = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % TARGET_LOCATIONS.length;
      const location = TARGET_LOCATIONS[locationIndex];
      
      console.log(`📍 Generating content for ${location}...`);
      
      const keywords = getKeywordsForLocation(location).slice(0, 200); // INCREASED: 200 posts per location
      const results = await batchGeneratePosts(keywords, llmService, 100, 0); // AGGRESSIVE: no delay

      console.log(`✅ Location generation complete for ${location}: ${results.success} posts`);
    } catch (error) {
      console.error('❌ Error in location content generation:', error);
    }
  }, {
    timezone,
  });
}

