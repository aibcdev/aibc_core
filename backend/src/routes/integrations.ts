/**
 * Platform Integrations Routes
 * Handles integrations with Slack, Square, LinkedIn, Canva, Pinterest, etc.
 */

import express from 'express';
import {
  registerSlackIntegration,
  sendSlackNotification,
  notifyScanComplete,
  notifyContentGenerated,
  isSlackConnected,
} from '../services/integrations/slackService';

const router = express.Router();

/**
 * SLACK INTEGRATION
 */

/**
 * POST /api/integrations/slack/register
 * Register Slack integration
 */
router.post('/slack/register', async (req, res) => {
  try {
    const { userId, workspaceId, teamId, accessToken, botToken, webhookUrl, channelId } = req.body;

    if (!userId || !workspaceId || !teamId || (!accessToken && !webhookUrl)) {
      return res.status(400).json({ error: 'Missing required Slack configuration' });
    }

    registerSlackIntegration(userId, {
      workspaceId,
      teamId,
      accessToken: accessToken || '',
      botToken,
      webhookUrl,
      channelId,
    });

    res.json({
      success: true,
      message: 'Slack integration registered successfully',
    });
  } catch (error: any) {
    console.error('Slack registration error:', error);
    res.status(500).json({ error: error.message || 'Failed to register Slack integration' });
  }
});

/**
 * POST /api/integrations/slack/notify
 * Send notification to Slack
 */
router.post('/slack/notify', async (req, res) => {
  try {
    const { userId, message, channel, blocks } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'UserId and message required' });
    }

    const success = await sendSlackNotification(userId, message, { channel, blocks });

    res.json({ success });
  } catch (error: any) {
    console.error('Slack notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to send Slack notification' });
  }
});

/**
 * POST /api/integrations/slack/webhook
 * Handle Slack webhook events
 */
router.post('/slack/webhook', async (req, res) => {
  try {
    const { type, event, challenge } = req.body;

    // Slack URL verification
    if (type === 'url_verification') {
      return res.json({ challenge });
    }

    // Handle events
    if (event) {
      console.log('[Slack] Webhook event:', event.type);
      // Process Slack events (mentions, commands, etc.)
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Slack webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/integrations/slack/status/:userId
 * Check Slack connection status
 */
router.get('/slack/status/:userId', (req, res) => {
  const { userId } = req.params;
  const connected = isSlackConnected(userId);

  res.json({
    connected,
    platform: 'slack',
  });
});

/**
 * SQUARE INTEGRATION
 */

/**
 * POST /api/integrations/square/register
 * Register Square integration
 */
router.post('/square/register', async (req, res) => {
  try {
    const { userId, accessToken, locationId, applicationId } = req.body;

    if (!userId || !accessToken) {
      return res.status(400).json({ error: 'UserId and accessToken required' });
    }

    // Store Square configuration (implement storage service)
    // For now, just acknowledge
    res.json({
      success: true,
      message: 'Square integration registered successfully',
    });
  } catch (error: any) {
    console.error('Square registration error:', error);
    res.status(500).json({ error: error.message || 'Failed to register Square integration' });
  }
});

/**
 * POST /api/integrations/square/sync
 * Sync Square payment/transaction data
 */
router.post('/square/sync', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'UserId required' });
    }

    // Fetch transactions from Square API
    // Generate content based on transaction data
    res.json({
      success: true,
      message: 'Square data synced successfully',
      transactionsCount: 0, // Placeholder
    });
  } catch (error: any) {
    console.error('Square sync error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync Square data' });
  }
});

/**
 * LINKEDIN INTEGRATION
 */

/**
 * POST /api/integrations/linkedin/register
 * Register LinkedIn integration
 */
router.post('/linkedin/register', async (req, res) => {
  try {
    const { userId, accessToken, organizationId } = req.body;

    if (!userId || !accessToken) {
      return res.status(400).json({ error: 'UserId and accessToken required' });
    }

    res.json({
      success: true,
      message: 'LinkedIn integration registered successfully',
    });
  } catch (error: any) {
    console.error('LinkedIn registration error:', error);
    res.status(500).json({ error: error.message || 'Failed to register LinkedIn integration' });
  }
});

/**
 * POST /api/integrations/linkedin/publish
 * Publish content to LinkedIn
 */
router.post('/linkedin/publish', async (req, res) => {
  try {
    const { userId, content, platform } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: 'UserId and content required' });
    }

    // Publish to LinkedIn API
    res.json({
      success: true,
      message: 'Content published to LinkedIn successfully',
      postId: 'linkedin_post_123', // Placeholder
    });
  } catch (error: any) {
    console.error('LinkedIn publish error:', error);
    res.status(500).json({ error: error.message || 'Failed to publish to LinkedIn' });
  }
});

/**
 * CANVA INTEGRATION
 */

/**
 * POST /api/integrations/canva/register
 * Register Canva integration
 */
router.post('/canva/register', async (req, res) => {
  try {
    const { userId, accessToken } = req.body;

    if (!userId || !accessToken) {
      return res.status(400).json({ error: 'UserId and accessToken required' });
    }

    res.json({
      success: true,
      message: 'Canva integration registered successfully',
    });
  } catch (error: any) {
    console.error('Canva registration error:', error);
    res.status(500).json({ error: error.message || 'Failed to register Canva integration' });
  }
});

/**
 * POST /api/integrations/canva/sync-assets
 * Sync Canva design assets
 */
router.post('/canva/sync-assets', async (req, res) => {
  try {
    const { userId } = req.body;

    res.json({
      success: true,
      assets: [], // Placeholder
    });
  } catch (error: any) {
    console.error('Canva sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PINTEREST INTEGRATION
 */

/**
 * POST /api/integrations/pinterest/register
 * Register Pinterest integration
 */
router.post('/pinterest/register', async (req, res) => {
  try {
    const { userId, accessToken } = req.body;

    if (!userId || !accessToken) {
      return res.status(400).json({ error: 'UserId and accessToken required' });
    }

    res.json({
      success: true,
      message: 'Pinterest integration registered successfully',
    });
  } catch (error: any) {
    console.error('Pinterest registration error:', error);
    res.status(500).json({ error: error.message || 'Failed to register Pinterest integration' });
  }
});

/**
 * POST /api/integrations/pinterest/create-pin
 * Create optimized pin
 */
router.post('/pinterest/create-pin', async (req, res) => {
  try {
    const { userId, imageUrl, title, description, boardId } = req.body;

    res.json({
      success: true,
      pinId: 'pinterest_pin_123', // Placeholder
    });
  } catch (error: any) {
    console.error('Pinterest pin creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/integrations/list/:userId
 * List all integrations for a user
 */
router.get('/list/:userId', (req, res) => {
  const { userId } = req.params;

  const integrations = [];

  if (isSlackConnected(userId)) {
    integrations.push({ platform: 'slack', connected: true });
  }

  // Add other integrations as they're implemented
  integrations.push(
    { platform: 'square', connected: false },
    { platform: 'linkedin', connected: false },
    { platform: 'canva', connected: false },
    { platform: 'pinterest', connected: false }
  );

  res.json({
    success: true,
    integrations,
  });
});

export default router;
