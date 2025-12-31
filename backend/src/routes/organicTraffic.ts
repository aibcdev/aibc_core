/**
 * Organic Traffic Analytics Routes
 * Track progress towards 200 daily organic views
 */

import express from 'express';
import { getOrganicTrafficMetrics, getOrganicTrafficProgress, calculateSEOScore } from '../services/organicTrafficService';
import { getBlogPostBySlug } from '../services/seoContentService';

const router = express.Router();

/**
 * GET /api/organic-traffic/metrics - Get organic traffic metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string)
      : new Date();

    const metrics = await getOrganicTrafficMetrics(startDate, endDate);
    res.json(metrics);
  } catch (error: any) {
    console.error('Error getting organic traffic metrics:', error);
    res.status(500).json({ error: error.message || 'Failed to get metrics' });
  }
});

/**
 * GET /api/organic-traffic/progress - Get progress towards 200 daily views
 */
router.get('/progress', async (req, res) => {
  try {
    const progress = await getOrganicTrafficProgress();
    res.json(progress);
  } catch (error: any) {
    console.error('Error getting progress:', error);
    res.status(500).json({ error: error.message || 'Failed to get progress' });
  }
});

/**
 * GET /api/organic-traffic/seo-score/:slug - Get SEO score for a page
 */
router.get('/seo-score/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const score = calculateSEOScore(post);
    res.json({
      slug,
      score,
      maxScore: 100,
      grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
    });
  } catch (error: any) {
    console.error('Error calculating SEO score:', error);
    res.status(500).json({ error: error.message || 'Failed to calculate score' });
  }
});

export default router;




