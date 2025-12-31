/**
 * Blog Scheduler API Routes
 * Handles auto-publishing of blog posts
 */

import express from 'express';
import { publishScheduledPost, getSchedulerStatus } from '../services/blogScheduler';

const router = express.Router();

/**
 * POST /api/blog/publish-scheduled
 * Publish the next scheduled blog post (called by Cloud Scheduler daily at 9 AM)
 */
router.post('/publish-scheduled', async (req, res) => {
  try {
    const result = await publishScheduledPost();
    
    if (result.success) {
      res.json({
        success: true,
        message: `Published post: "${result.post?.title}"`,
        post: result.post
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error || 'No posts to publish'
      });
    }
  } catch (error: any) {
    console.error('Error publishing scheduled post:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to publish scheduled post'
    });
  }
});

/**
 * GET /api/blog/scheduler-status
 * Get scheduler status (draft count, next publish time)
 */
router.get('/scheduler-status', async (req, res) => {
  try {
    const status = await getSchedulerStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (error: any) {
    console.error('Error getting scheduler status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get scheduler status'
    });
  }
});

export default router;








