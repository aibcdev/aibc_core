/**
 * Sitemap API Routes
 */

import express from 'express';
import { generateFullSitemap, generateBlogSitemap, generateCategorySitemap, generateTagSitemap, generateSitemapIndex } from '../services/sitemapService';

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

/**
 * GET /api/categories/sitemap.xml - Category sitemap
 */
router.get('/categories/sitemap.xml', async (req, res) => {
  try {
    const sitemap = await generateCategorySitemap();
    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error: any) {
    console.error('Error generating category sitemap:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate category sitemap</error>');
  }
});

/**
 * GET /api/tags/sitemap.xml - Tag sitemap
 */
router.get('/tags/sitemap.xml', async (req, res) => {
  try {
    const sitemap = await generateTagSitemap();
    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error: any) {
    console.error('Error generating tag sitemap:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate tag sitemap</error>');
  }
});

/**
 * GET /api/sitemap-index.xml - Sitemap index (for large sites)
 */
router.get('/sitemap-index.xml', async (req, res) => {
  try {
    const baseURL = process.env.BASE_URL || process.env.FRONTEND_URL || 'https://aibcmedia.com';
    const cleanBaseURL = baseURL.replace(/\/$/, '');
    
    const sitemaps = [
      { loc: `${cleanBaseURL}/api/sitemap.xml` },
      { loc: `${cleanBaseURL}/api/blog/sitemap.xml` },
      { loc: `${cleanBaseURL}/api/categories/sitemap.xml` },
      { loc: `${cleanBaseURL}/api/tags/sitemap.xml` },
    ];
    
    const sitemapIndex = generateSitemapIndex(sitemaps);
    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemapIndex);
  } catch (error: any) {
    console.error('Error generating sitemap index:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap index</error>');
  }
});

export default router;

