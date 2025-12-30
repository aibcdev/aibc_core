/**
 * Keywords Tracking Routes
 * Show what keywords we're ranking for
 */

import express from 'express';
import { getAllKeywords, getKeywordsByStatus, trackKeyword } from '../services/keywordService';
import { listBlogPosts } from '../services/seoContentService';

const router = express.Router();

/**
 * GET /api/keywords - Get all tracked keywords
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    
    let keywords;
    if (status) {
      keywords = await getKeywordsByStatus(status as 'targeting' | 'ranking' | 'tracked');
    } else {
      keywords = await getAllKeywords();
    }
    
    // Limit results
    const limited = keywords.slice(0, parseInt(limit as string));
    
    res.json({
      total: keywords.length,
      keywords: limited,
      status: status || 'all',
    });
  } catch (error: any) {
    console.error('Error getting keywords:', error);
    res.status(500).json({ error: error.message || 'Failed to get keywords' });
  }
});

/**
 * GET /api/keywords/targeting - Get keywords we're currently targeting
 * ONLY returns real tracked keywords from database - no generated/dummy data
 */
router.get('/targeting', async (req, res) => {
  try {
    // Only return real tracked keywords from database
    const keywords = await getKeywordsByStatus('targeting');
    
    // Return only real tracked keywords - no generated/dummy data
    res.json({
      total: keywords.length,
      keywords: keywords.slice(0, 100),
    });
  } catch (error: any) {
    console.error('Error getting targeting keywords:', error);
    res.status(500).json({ error: error.message || 'Failed to get targeting keywords' });
  }
});

/**
 * GET /api/keywords/ranking - Get keywords we're currently ranking for
 */
router.get('/ranking', async (req, res) => {
  try {
    const keywords = await getKeywordsByStatus('ranking');
    
    // Also check published posts for target keywords
    const posts = await listBlogPosts({ status: 'published', limit: 1000 });
    const postKeywords = new Set<string>();
    
    for (const post of posts.posts || []) {
      if (post.target_keywords && Array.isArray(post.target_keywords)) {
        post.target_keywords.forEach(k => postKeywords.add(k));
      }
    }
    
    // Merge with tracked keywords
    const allRanking = [
      ...keywords,
      ...Array.from(postKeywords).map(k => ({
        keyword: k,
        status: 'ranking' as const,
        target_url: `/blog/${posts.posts?.find(p => p.target_keywords?.includes(k))?.slug}`,
      })),
    ];
    
    // Remove duplicates
    const unique = Array.from(
      new Map(allRanking.map(k => [k.keyword.toLowerCase(), k])).values()
    );
    
    res.json({
      total: unique.length,
      keywords: unique.slice(0, 100),
    });
  } catch (error: any) {
    console.error('Error getting ranking keywords:', error);
    res.status(500).json({ error: error.message || 'Failed to get ranking keywords' });
  }
});

/**
 * GET /api/keywords/stats - Get keyword statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const allKeywords = await getAllKeywords();
    const targeting = await getKeywordsByStatus('targeting');
    const ranking = await getKeywordsByStatus('ranking');
    const tracked = await getKeywordsByStatus('tracked');
    
    // Get posts count - validate response
    let postsCount = 0;
    let keywordsWithPostsCount = 0;
    try {
      const posts = await listBlogPosts({ status: 'published', limit: 10000 });
      if (posts && typeof posts.total === 'number') {
        postsCount = posts.total;
      }
      if (posts && Array.isArray(posts.posts)) {
        keywordsWithPostsCount = new Set(
          posts.posts.flatMap((p: any) => (p.target_keywords && Array.isArray(p.target_keywords)) ? p.target_keywords : [])
        ).size;
      }
    } catch (postsError) {
      console.warn('Error getting posts for keyword stats:', postsError);
      // Continue with 0 values
    }
    
    // Ensure all values are valid numbers
    res.json({
      total: Array.isArray(allKeywords) ? allKeywords.length : 0,
      targeting: Array.isArray(targeting) ? targeting.length : 0,
      ranking: Array.isArray(ranking) ? ranking.length : 0,
      tracked: Array.isArray(tracked) ? tracked.length : 0,
      posts: typeof postsCount === 'number' ? postsCount : 0,
      keywordsWithPosts: typeof keywordsWithPostsCount === 'number' ? keywordsWithPostsCount : 0,
    });
  } catch (error: any) {
    console.error('Error getting keyword stats:', error);
    // Return zeros instead of error to allow frontend to show N/A
    res.json({
      total: 0,
      targeting: 0,
      ranking: 0,
      tracked: 0,
      posts: 0,
      keywordsWithPosts: 0,
    });
  }
});

/**
 * POST /api/keywords/track - Track a new keyword
 */
router.post('/track', async (req, res) => {
  try {
    const { keyword, search_volume, competition_score, target_url } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }
    
    const tracked = await trackKeyword({
      keyword,
      search_volume,
      competition_score,
      target_url,
      status: 'targeting',
    });
    
    res.json({
      success: true,
      keyword: tracked,
    });
  } catch (error: any) {
    console.error('Error tracking keyword:', error);
    res.status(500).json({ error: error.message || 'Failed to track keyword' });
  }
});

export default router;



