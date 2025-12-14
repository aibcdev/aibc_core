/**
 * Social Media Content Generation API Routes
 */

import express from 'express';
import { generateSocialPost, enhanceContentIdeaWithPostContent } from '../services/socialContentGeneratorService';

const router = express.Router();

/**
 * POST /api/social/generate - Generate personalized social media post
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      platform,
      topic,
      format,
      brandContext,
      competitorInsights,
      targetAudience
    } = req.body;

    if (!platform || !brandContext) {
      return res.status(400).json({ 
        error: 'Platform and brandContext are required' 
      });
    }

    const result = await generateSocialPost({
      platform: platform.toLowerCase() as 'linkedin' | 'twitter' | 'x',
      topic,
      format: format || 'post',
      brandContext,
      competitorInsights,
      targetAudience
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error generating social post:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate social post' 
    });
  }
});

/**
 * POST /api/social/enhance - Enhance content idea with personalized post content
 */
router.post('/enhance', async (req, res) => {
  try {
    const { contentIdea, brandContext } = req.body;

    if (!contentIdea || !brandContext) {
      return res.status(400).json({ 
        error: 'contentIdea and brandContext are required' 
      });
    }

    const enhanced = await enhanceContentIdeaWithPostContent(
      contentIdea,
      brandContext
    );

    res.json(enhanced);
  } catch (error: any) {
    console.error('Error enhancing content idea:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to enhance content idea' 
    });
  }
});

export default router;

