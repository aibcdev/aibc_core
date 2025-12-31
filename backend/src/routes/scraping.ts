/**
 * Scraping API Routes
 * Exposes free scraping endpoints for digital footprint analysis
 * Uses only free methods: direct fetch and browser automation (Playwright)
 * No paid APIs or API keys required
 */

import { Router } from 'express';
import {
  scrapeWebsite,
  analyzeDigitalFootprint,
  scrapeCompetitorContent,
  getAnalyticsData,
} from '../services/scrapingAPIService';

const router = Router();

/**
 * POST /api/scraping/website
 * Scrape a website
 */
router.post('/website', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL required' });
    }

    const result = await scrapeWebsite(url);

    if (result.success) {
      res.json({ success: true, data: result.data, source: result.source });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('[Scraping] Website scraping error:', error);
    res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

/**
 * POST /api/scraping/digital-footprint
 * Analyze digital footprint
 */
router.post('/digital-footprint', async (req, res) => {
  try {
    const { brandName, website } = req.body;

    if (!brandName) {
      return res.status(400).json({ success: false, error: 'Brand name required' });
    }

    const footprint = await analyzeDigitalFootprint(brandName, website);

    res.json({ success: true, data: footprint });
  } catch (error: any) {
    console.error('[Scraping] Digital footprint analysis error:', error);
    res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

/**
 * POST /api/scraping/competitor
 * Scrape competitor content
 */
router.post('/competitor', async (req, res) => {
  try {
    const { competitorUrl, brandName } = req.body;

    if (!competitorUrl) {
      return res.status(400).json({ success: false, error: 'Competitor URL required' });
    }

    const result = await scrapeCompetitorContent(competitorUrl, brandName || '');

    if (result.success) {
      res.json({ success: true, data: result.data, source: result.source });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('[Scraping] Competitor scraping error:', error);
    res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

/**
 * POST /api/scraping/analytics
 * Get analytics data
 */
router.post('/analytics', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL required' });
    }

    const result = await getAnalyticsData(url);

    if (result.success) {
      res.json({ success: true, data: result.data, source: result.source });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('[Scraping] Analytics data error:', error);
    res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

export default router;

