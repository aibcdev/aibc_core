/**
 * Content Generator API Routes
 */

import express from 'express';
import { generateBlogPost } from '../services/contentGeneratorService';
import { ContentGenerationRequest } from '../types/seo';

const router = express.Router();

/**
 * POST /api/blog/generate - Generate new SEO content
 */
router.post('/generate', async (req, res) => {
  try {
    const request: ContentGenerationRequest = {
      keyword: req.body.keyword,
      template_type: req.body.template_type,
      category: req.body.category,
      target_word_count: req.body.target_word_count,
    };

    if (!request.keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const result = await generateBlogPost(request);
    res.json(result);
  } catch (error: any) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
});

export default router;

