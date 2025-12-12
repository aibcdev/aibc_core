/**
 * Sitemap API Routes
 */

import express from 'express';
import { generateFullSitemap, generateBlogSitemap } from '../services/sitemapService';

const router = express.Router();

/**
 * GET /api/sitemap.xml - Full sitemap
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const sitemap = await generateFullSitemap();
    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error: any) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
  }
});

/**
 * GET /api/blog/sitemap.xml - Blog-specific sitemap
 */
router.get('/blog/sitemap.xml', async (req, res) => {
  try {
    const sitemap = await generateBlogSitemap();
    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error: any) {
    console.error('Error generating blog sitemap:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate blog sitemap</error>');
  }
});

export default router;

