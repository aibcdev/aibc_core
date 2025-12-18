/**
 * Learning & Improvement API Routes
 * Handles feedback tracking, insights, and continuous improvement
 */

import express from 'express';
import {
  trackUserFeedback,
  trackScanQuality,
  getActiveInsights,
  applyInsight,
  getPromptVersions,
  createPromptVersion,
  runDailyLearningAnalysis
} from '../services/learningService';

const router = express.Router();

/**
 * POST /api/learning/feedback
 * Track user feedback for learning
 */
router.post('/feedback', async (req, res) => {
  try {
    const feedback = req.body;
    
    // Validate required fields
    if (!feedback.scanId || !feedback.username || !feedback.feedbackType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: scanId, username, feedbackType'
      });
    }

    await trackUserFeedback({
      scanId: feedback.scanId,
      username: feedback.username,
      feedbackType: feedback.feedbackType,
      contentId: feedback.contentId,
      contentTitle: feedback.contentTitle,
      rating: feedback.rating,
      comment: feedback.comment,
      metadata: feedback.metadata,
      timestamp: feedback.timestamp || new Date().toISOString()
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking feedback:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track feedback'
    });
  }
});

/**
 * POST /api/learning/scan-quality
 * Track scan quality metrics
 */
router.post('/scan-quality', async (req, res) => {
  try {
    const metrics = req.body;
    
    if (!metrics.scanId || !metrics.username) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: scanId, username'
      });
    }

    await trackScanQuality({
      scanId: metrics.scanId,
      username: metrics.username,
      extractionConfidence: metrics.extractionConfidence || 0,
      brandDNAAccuracy: metrics.brandDNAAccuracy,
      contentIdeasCount: metrics.contentIdeasCount || 0,
      contentIdeasApproved: metrics.contentIdeasApproved || 0,
      contentIdeasEdited: metrics.contentIdeasEdited || 0,
      contentIdeasDismissed: metrics.contentIdeasDismissed || 0,
      averageRating: metrics.averageRating || 0,
      timestamp: metrics.timestamp || new Date().toISOString()
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking scan quality:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track scan quality'
    });
  }
});

/**
 * GET /api/learning/insights
 * Get active learning insights
 */
router.get('/insights', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const insights = await getActiveInsights(limit);
    
    res.json({
      success: true,
      insights
    });
  } catch (error: any) {
    console.error('Error fetching insights:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch insights'
    });
  }
});

/**
 * POST /api/learning/insights/:id/apply
 * Apply a learning insight
 */
router.post('/insights/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const applied = await applyInsight(id);
    
    if (applied) {
      res.json({ success: true });
    } else {
      res.status(404).json({
        success: false,
        error: 'Insight not found or already applied'
      });
    }
  } catch (error: any) {
    console.error('Error applying insight:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to apply insight'
    });
  }
});

/**
 * GET /api/learning/prompts/:category
 * Get prompt versions for a category
 */
router.get('/prompts/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const versions = await getPromptVersions(category);
    
    res.json({
      success: true,
      versions
    });
  } catch (error: any) {
    console.error('Error fetching prompt versions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch prompt versions'
    });
  }
});

/**
 * POST /api/learning/prompts
 * Create a new prompt version
 */
router.post('/prompts', async (req, res) => {
  try {
    const { category, prompt, systemPrompt, basedOnInsightId } = req.body;
    
    if (!category || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: category, prompt'
      });
    }

    const version = await createPromptVersion(category, prompt, systemPrompt, basedOnInsightId);
    
    if (version) {
      res.json({
        success: true,
        version
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create prompt version'
      });
    }
  } catch (error: any) {
    console.error('Error creating prompt version:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create prompt version'
    });
  }
});

/**
 * POST /api/learning/analyze
 * Run daily learning analysis (admin endpoint)
 */
router.post('/analyze', async (req, res) => {
  try {
    const insights = await runDailyLearningAnalysis();
    
    res.json({
      success: true,
      insightsGenerated: insights.length,
      insights
    });
  } catch (error: any) {
    console.error('Error running learning analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to run analysis'
    });
  }
});

export default router;



