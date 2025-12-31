/**
 * n8n Integration Routes
 * Handles webhooks and workflow triggers from n8n
 */

import { Router } from 'express';
import { handleN8nWebhook, registerAgentCallback, getWorkflowStatus, updateWorkflowStatus } from '../services/n8nService';
import { orchestrateWorkflow } from '../services/agents/masterCMOAgent';

const router = Router();

/**
 * POST /api/n8n/webhook/:webhookId
 * Handle incoming webhook from n8n
 */
router.post('/webhook/:webhookId', async (req, res) => {
  try {
    const { webhookId } = req.params;
    const payload = req.body;
    const headers = req.headers as Record<string, string>;

    const result = await handleN8nWebhook(webhookId, payload, headers);

    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('[n8n] Webhook handler error:', error);
    res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

/**
 * POST /api/n8n/callback/register
 * Register agent callback URL
 */
router.post('/callback/register', async (req, res) => {
  try {
    const { agentId, callbackUrl, workflowId } = req.body;

    if (!agentId || !callbackUrl) {
      return res.status(400).json({ success: false, error: 'agentId and callbackUrl required' });
    }

    registerAgentCallback(agentId, callbackUrl, workflowId);

    res.json({ success: true, message: 'Callback registered' });
  } catch (error: any) {
    console.error('[n8n] Callback registration error:', error);
    res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

/**
 * GET /api/n8n/workflow/:workflowId/status
 * Get workflow status
 */
router.get('/workflow/:workflowId/status', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const status = getWorkflowStatus(workflowId);

    if (!status) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    res.json({ success: true, status });
  } catch (error: any) {
    console.error('[n8n] Workflow status error:', error);
    res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

/**
 * POST /api/n8n/workflow/orchestrate
 * Trigger Master CMO orchestration workflow
 */
router.post('/workflow/orchestrate', async (req, res) => {
  try {
    const context = req.body;

    if (!context.workflowType) {
      return res.status(400).json({ success: false, error: 'workflowType required' });
    }

    const result = await orchestrateWorkflow(context);

    if (result.success) {
      res.json({ success: true, results: result.results });
    } else {
      res.status(400).json({ success: false, error: result.error, results: result.results });
    }
  } catch (error: any) {
    console.error('[n8n] Orchestration error:', error);
    res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

/**
 * POST /api/n8n/workflow/:workflowId/update
 * Update workflow status (for n8n callbacks)
 */
router.post('/workflow/:workflowId/update', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { status, result, error } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'status required' });
    }

    updateWorkflowStatus(workflowId, status, result, error);

    res.json({ success: true, message: 'Workflow status updated' });
  } catch (error: any) {
    console.error('[n8n] Workflow update error:', error);
    res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

export default router;






