/**
 * Mass Content Generation Routes
 * For generating thousands of pages automatically
 */

import express from 'express';
import { generateAllKeywords, getTopPriorityKeywords, getKeywordsForLocation } from '../services/keywordGenerationService';
import { batchGeneratePosts, generateContentCluster } from '../services/massContentGenerationService';
import { generateMassSitemapIndex, getTotalPostCount } from '../services/massSitemapService';

const router = express.Router();

/**
 * POST /api/mass-content/generate-keywords - Generate all keywords
 */
router.post('/generate-keywords', async (req, res) => {
  try {
    const keywords = generateAllKeywords();
    res.json({
      total: keywords.length,
      keywords: keywords.slice(0, 100), // Return sample
      message: `Generated ${keywords.length} keywords`,
    });
  } catch (error: any) {
    console.error('Error generating keywords:', error);
    res.status(500).json({ error: error.message || 'Failed to generate keywords' });
  }
});

/**
 * POST /api/mass-content/generate-posts - Generate posts for keywords
 */
router.post('/generate-posts', async (req, res) => {
  try {
    const { limit = 100, location, category } = req.body;

    // Get keywords
    let keywords;
    if (location) {
      keywords = getKeywordsForLocation(location);
    } else if (category) {
      const { getKeywordsByCategory } = await import('../services/keywordGenerationService');
      keywords = getKeywordsByCategory(category);
    } else {
      keywords = getTopPriorityKeywords(limit);
    }

    // Get LLM service
    const llmService = await import('../services/llmService');

    // Generate posts (AGGRESSIVE: larger batches, no delay)
    const results = await batchGeneratePosts(keywords, llmService, 100, 0);
    
    // Immediately submit to Google and amplify
    if (results.posts.length > 0) {
      const { googleIndexing } = await import('../services/googleIndexingService');
      const { socialAmplifier } = await import('../services/socialAmplificationService');
      
      const urls = results.posts.map(p => 
        `${process.env.BASE_URL || process.env.FRONTEND_URL || 'https://aibcmedia.com'}/blog/${p.slug}`
      );
      
      // Submit to Google (don't wait)
      googleIndexing.submitBatch(urls).catch(err => {
        console.error('Google indexing error:', err);
      });
      
      // Amplify posts (don't wait)
      Promise.allSettled(
        results.posts.map(p => socialAmplifier.amplifyPost(p))
      ).catch(err => {
        console.error('Social amplification error:', err);
      });
    }

    res.json({
      success: true,
      generated: results.success,
      failed: results.failed,
      total: keywords.length,
      posts: results.posts.slice(0, 10), // Return sample
    });
  } catch (error: any) {
    console.error('Error generating posts:', error);
    res.status(500).json({ error: error.message || 'Failed to generate posts' });
  }
});

/**
 * POST /api/mass-content/generate-cluster - Generate content cluster
 */
router.post('/generate-cluster', async (req, res) => {
  try {
    const { topic, relatedKeywords } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const llmService = await import('../services/llmService');
    const { generateAllKeywords } = await import('../services/keywordGenerationService');
    
    // Get related keywords if not provided
    const allKeywords = relatedKeywords || generateAllKeywords()
      .filter(k => k.parentKeyword === topic || k.keyword.includes(topic))
      .slice(0, 20);

    const posts = await generateContentCluster(topic, allKeywords, llmService);

    res.json({
      success: true,
      topic,
      postsGenerated: posts.length,
      posts: posts.slice(0, 5), // Return sample
    });
  } catch (error: any) {
    console.error('Error generating cluster:', error);
    res.status(500).json({ error: error.message || 'Failed to generate cluster' });
  }
});

/**
 * GET /api/mass-content/sitemap-index - Get sitemap index for all pages
 */
router.get('/sitemap-index', async (req, res) => {
  try {
    const baseURL = process.env.BASE_URL || process.env.FRONTEND_URL || 'https://aibcmedia.com';
    const cleanBaseURL = baseURL.replace(/\/$/, '');
    
    const totalPosts = await getTotalPostCount();
    const sitemapIndex = await generateMassSitemapIndex(cleanBaseURL, totalPosts);

    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemapIndex);
  } catch (error: any) {
    console.error('Error generating sitemap index:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap index</error>');
  }
});

/**
 * GET /api/mass-content/stats - Get generation stats
 */
router.get('/stats', async (req, res) => {
  try {
    const totalPosts = await getTotalPostCount();
    const { generateAllKeywords } = await import('../services/keywordGenerationService');
    const totalKeywords = generateAllKeywords().length;

    // Get queue stats
    const { contentQueue } = await import('../services/contentQueue');
    const queueStats = contentQueue.getStats();

    // Get template cache stats
    const { templateCache } = await import('../services/contentTemplateCache');
    const cacheStats = templateCache.getStats();

    const postsPerDay = parseInt(process.env.MASS_CONTENT_POSTS_PER_DAY || '5000', 10);
    const estimatedDaysTo1M = Math.ceil((1000000 - totalPosts) / postsPerDay);

    res.json({
      totalPosts,
      totalKeywords,
      coverage: ((totalPosts / totalKeywords) * 100).toFixed(2) + '%',
      target: 1000000,
      progress: ((totalPosts / 1000000) * 100).toFixed(2) + '%',
      queue: queueStats,
      cache: cacheStats,
      postsPerDay,
      estimatedDaysTo1M,
      estimatedDateTo1M: new Date(Date.now() + estimatedDaysTo1M * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: error.message || 'Failed to get stats' });
  }
});

/**
 * GET /api/mass-content/queue-stats - Get queue statistics
 */
router.get('/queue-stats', async (req, res) => {
  try {
    const { contentQueue } = await import('../services/contentQueue');
    const stats = contentQueue.getStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting queue stats:', error);
    res.status(500).json({ error: error.message || 'Failed to get queue stats' });
  }
});

export default router;

