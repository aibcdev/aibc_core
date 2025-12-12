/**
 * SEO Optimization API Routes
 */

import express from 'express';
import { analyzeContentSEO, generateOptimizedMetaDescription } from '../services/contentOptimizationService';
import { updatePostWithInternalLinks } from '../services/internalLinkingService';
import { getBlogPostById } from '../services/seoContentService';

const router = express.Router();

/**
 * POST /api/seo/optimize - Analyze and optimize content
 */
router.post('/', async (req, res) => {
  try {
    const { post_id } = req.body;
    
    if (!post_id) {
      return res.status(400).json({ error: 'post_id is required' });
    }

    const post = await getBlogPostById(post_id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const keyword = post.target_keywords?.[0] || '';
    const analysis = analyzeContentSEO(post, keyword);

    // Auto-optimize if requested
    if (req.body.auto_optimize) {
      // Add internal links
      await updatePostWithInternalLinks(post_id);
      
      // Generate optimized meta description if missing
      if (!post.meta_description && keyword) {
        const optimizedMeta = generateOptimizedMetaDescription(post.title, post.content, keyword);
        // Would update post here, but keeping analysis separate for now
      }
    }

    res.json({
      analysis,
      recommendations: analysis.suggestions,
    });
  } catch (error: any) {
    console.error('Error optimizing content:', error);
    res.status(500).json({ error: error.message || 'Failed to optimize content' });
  }
});

export default router;

