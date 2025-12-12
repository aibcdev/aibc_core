/**
 * SEO Analytics API Routes
 */

import express from 'express';
import { getPostPerformance, getAggregateAnalytics, getPostPerformanceSummary } from '../services/seoAnalyticsService';
import { recordPerformance } from '../services/seoAnalyticsService';

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

export default router;

