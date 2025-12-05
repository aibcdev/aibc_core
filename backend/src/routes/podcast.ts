import { Router } from 'express';
import { generatePodcastWithVoice, checkPremiumAccess } from '../services/podcastService';

const router = Router();

// Generate podcast (Premium tier only)
router.post('/generate', async (req, res) => {
  try {
    const { topic, duration, brandVoice, style, includeMusic, voiceCloneId } = req.body;
    const userTier = req.headers['x-user-tier'] as string || 'free'; // In production, get from auth

    // Check tier access
    if (!checkPremiumAccess(userTier)) {
      return res.status(403).json({
        success: false,
        error: 'Podcast generation is only available for Premium tier users'
      });
    }

    if (!topic || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Topic and duration are required'
      });
    }

    if (duration < 2 || duration > 5) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be between 2 and 5 minutes'
      });
    }

    const result = await generatePodcastWithVoice({
      topic,
      duration,
      brandVoice,
      style: style || 'conversational',
      includeMusic: includeMusic || false,
      voiceCloneId
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate podcast'
    });
  }
});

// Get podcast status
router.get('/:id/status', (req, res) => {
  // TODO: Implement status checking
  res.json({
    success: true,
    status: 'complete'
  });
});

export default router;

