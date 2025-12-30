/**
 * Content Quality Routes - Monitor and ensure Google compliance
 */

import express from 'express';
import { getBlogPostBySlug } from '../services/seoContentService';
import { checkContentQuality, validatePostForPublishing } from '../services/contentQualityService';
import { checkGoogleCompliance } from '../services/googleComplianceService';
import { indexingRateLimiter } from '../services/contentQualityService';

const router = express.Router();

/**
 * GET /api/content-quality/check/:slug - Check quality of a specific post
 */
router.get('/check/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get all posts for comparison
    const { listBlogPosts } = await import('../services/seoContentService');
    const allPosts = await listBlogPosts({ status: 'published', limit: 1000 });

    // Check quality
    const quality = checkContentQuality(post, allPosts.posts);
    
    // Check compliance
    const compliance = await checkGoogleCompliance(post, allPosts.posts);

    res.json({
      slug,
      quality,
      compliance,
      recommendations: [
        ...quality.warnings,
        ...compliance.recommendations,
      ],
    });
  } catch (error: any) {
    console.error('Error checking content quality:', error);
    res.status(500).json({ error: error.message || 'Failed to check quality' });
  }
});

/**
 * GET /api/content-quality/rate-limits - Get indexing rate limit status
 */
router.get('/rate-limits', async (req, res) => {
  try {
    res.json({
      remainingDaily: indexingRateLimiter.getRemainingDaily(),
      remainingHourly: indexingRateLimiter.getRemainingHourly(),
      maxDaily: 200,
      maxHourly: 20,
      message: 'Google Indexing API limits: 200/day, 20/hour',
    });
  } catch (error: any) {
    console.error('Error getting rate limits:', error);
    res.status(500).json({ error: error.message || 'Failed to get rate limits' });
  }
});

/**
 * GET /api/content-quality/guidelines - Get Google compliance guidelines
 */
router.get('/guidelines', async (req, res) => {
  try {
    const { getGoogleComplianceGuidelines } = await import('../services/googleComplianceService');
    const guidelines = getGoogleComplianceGuidelines();
    res.json({ guidelines });
  } catch (error: any) {
    console.error('Error getting guidelines:', error);
    res.status(500).json({ error: error.message || 'Failed to get guidelines' });
  }
});

export default router;



