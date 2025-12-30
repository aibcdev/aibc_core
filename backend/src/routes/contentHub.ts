/**
 * Content Hub Routes
 * Provides reviewed content from n8n workflows to Content Hub
 */

import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

/**
 * GET /api/content-hub/reviewed
 * Get reviewed content ready for company review
 */
router.get('/reviewed', async (req, res) => {
  try {
    const contentHubPath = path.join(__dirname, '../../.content-hub-reviewed.json');
    
    if (!fs.existsSync(contentHubPath)) {
      return res.json({ success: true, items: [] });
    }

    const items = JSON.parse(fs.readFileSync(contentHubPath, 'utf8') || '[]');
    
    // Filter to only items from last 7 days
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentItems = items.filter((item: any) => {
      const reviewedAt = new Date(item.reviewedAt).getTime();
      return reviewedAt >= sevenDaysAgo;
    });

    res.json({ success: true, items: recentItems });
  } catch (error: any) {
    console.error('[Content Hub] Error fetching reviewed content:', error);
    res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

/**
 * POST /api/content-hub/reviewed/:id/approve
 * Approve reviewed content (moves to calendar)
 */
router.post('/reviewed/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const contentHubPath = path.join(__dirname, '../../.content-hub-reviewed.json');
    
    if (!fs.existsSync(contentHubPath)) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    const items = JSON.parse(fs.readFileSync(contentHubPath, 'utf8') || '[]');
    const itemIndex = items.findIndex((item: any) => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    // Mark as approved and ready for calendar
    items[itemIndex].status = 'approved';
    items[itemIndex].approvedAt = new Date().toISOString();
    items[itemIndex].approvedBy = req.body.userId || 'user';

    fs.writeFileSync(contentHubPath, JSON.stringify(items, null, 2));

    res.json({ success: true, item: items[itemIndex] });
  } catch (error: any) {
    console.error('[Content Hub] Error approving content:', error);
    res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

/**
 * POST /api/content-hub/reviewed/:id/reject
 * Reject reviewed content
 */
router.post('/reviewed/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const contentHubPath = path.join(__dirname, '../../.content-hub-reviewed.json');
    
    if (!fs.existsSync(contentHubPath)) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    const items = JSON.parse(fs.readFileSync(contentHubPath, 'utf8') || '[]');
    const itemIndex = items.findIndex((item: any) => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    // Mark as rejected
    items[itemIndex].status = 'rejected';
    items[itemIndex].rejectedAt = new Date().toISOString();
    items[itemIndex].rejectionReason = reason;

    fs.writeFileSync(contentHubPath, JSON.stringify(items, null, 2));

    res.json({ success: true, item: items[itemIndex] });
  } catch (error: any) {
    console.error('[Content Hub] Error rejecting content:', error);
    res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

export default router;





