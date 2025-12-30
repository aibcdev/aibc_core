/**
 * SEO Analytics API Routes
 */

import express from 'express';
import { getPostPerformance, getAggregateAnalytics, getPostPerformanceSummary } from '../services/seoAnalyticsService';
import { recordPerformance } from '../services/seoAnalyticsService';
import { analyzeSEOImpact } from '../services/seoAnalyticsService';
import { listBlogPosts } from '../services/seoContentService';

const router = express.Router();

/**
 * GET /api/seo/analytics - Get aggregate analytics
 */
router.get('/', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const analytics = await getAggregateAnalytics(days);
    res.json(analytics);
  } catch (error: any) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: error.message || 'Failed to get analytics' });
  }
});

/**
 * GET /api/seo/analytics/post/:id - Get performance for specific post
 */
router.get('/post/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const performance = await getPostPerformance(id, days);
    const summary = await getPostPerformanceSummary(id);
    
    res.json({
      performance,
      summary,
    });
  } catch (error: any) {
    console.error('Error getting post performance:', error);
    res.status(500).json({ error: error.message || 'Failed to get post performance' });
  }
});

/**
 * POST /api/seo/analytics/record - Record performance metrics
 */
router.post('/record', async (req, res) => {
  try {
    const { post_id, ...metrics } = req.body;
    
    if (!post_id) {
      return res.status(400).json({ error: 'post_id is required' });
    }

    const performance = await recordPerformance(post_id, metrics);
    res.json(performance);
  } catch (error: any) {
    console.error('Error recording performance:', error);
    res.status(500).json({ error: error.message || 'Failed to record performance' });
  }
});

/**
 * GET /api/seo/analytics/impact - Analyze which posts are helping SEO
 */
router.get('/impact', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const impact = await analyzeSEOImpact(days);
    res.json(impact);
  } catch (error: any) {
    console.error('Error analyzing SEO impact:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze SEO impact' });
  }
});

/**
 * POST /api/seo/analytics/track - Track SEO events (pageviews, clicks, conversions)
 * Used for landing page tracking and ad optimization
 */
router.post('/track', async (req, res) => {
  try {
    const { page, event, element, data, timestamp, url, referrer } = req.body;
    
    // Log for analytics (can be stored in database later)
    console.log(`[SEO Tracking] ${event} on ${page}`, {
      element,
      data,
      timestamp: new Date(timestamp || Date.now()).toISOString(),
      url,
      referrer,
    });

    // Return success immediately (fire and forget for performance)
    res.json({ success: true, tracked: true });
  } catch (error: any) {
    // Don't fail the request if tracking fails
    console.error('Error tracking SEO event:', error);
    res.json({ success: false, error: error.message });
  }
});

export default router;

