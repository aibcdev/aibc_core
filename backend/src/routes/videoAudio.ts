/**
 * Video & Audio Content Routes
 */

import express from 'express';
import {
  generateVideoScript,
  generatePodcastScript,
  generateAudioContentIdeas,
} from '../services/videoAudioService';

const router = express.Router();

/**
 * POST /api/video/generate-script
 * Generate video script
 */
router.post('/generate-script', async (req, res) => {
  try {
    const { topic, duration, style, brandDNA } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic required' });
    }

    const script = await generateVideoScript(
      topic,
      duration || 60,
      style || 'tutorial',
      brandDNA
    );

    res.json({
      success: true,
      script,
    });
  } catch (error: any) {
    console.error('Video script generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate video script' });
  }
});

/**
 * POST /api/audio/generate-podcast-script
 * Generate podcast script
 */
router.post('/generate-podcast-script', async (req, res) => {
  try {
    const { topic, duration, format, brandDNA } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic required' });
    }

    const script = await generatePodcastScript(
      topic,
      duration || 30,
      format || 'solo',
      brandDNA
    );

    res.json({
      success: true,
      script,
    });
  } catch (error: any) {
    console.error('Podcast script generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate podcast script' });
  }
});

/**
 * POST /api/audio/generate-ideas
 * Generate audio/podcast content ideas
 */
router.post('/generate-ideas', async (req, res) => {
  try {
    const { brandDNA, count } = req.body;

    if (!brandDNA) {
      return res.status(400).json({ error: 'BrandDNA required' });
    }

    const ideas = await generateAudioContentIdeas(brandDNA, count || 5);

    res.json({
      success: true,
      ideas,
    });
  } catch (error: any) {
    console.error('Audio ideas generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate audio ideas' });
  }
});

export default router;




