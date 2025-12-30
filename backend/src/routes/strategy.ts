/**
 * Strategy Processing Routes
 * Handles strategy modification requests and triggers n8n workflows
 */

import { Router } from 'express';
import { triggerMasterCMOWorkflow } from '../services/agents/masterCMOAgent';
import { storage } from '../services/storage';

const router = Router();

/**
 * POST /api/strategy/process
 * Process strategy modification request and trigger n8n workflow
 */
router.post('/process', async (req, res) => {
  try {
    const { message, username, brandDNA, competitors } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const scanUsername = username || req.body.scanUsername;
    if (!scanUsername) {
      return res.status(400).json({ success: false, error: 'Username is required' });
    }

    // Get latest scan results for context
    let scanData: any = null;
    try {
      // Try to get from storage by finding latest scan for username
      const userScans = storage.getUserScans(scanUsername);
      if (userScans.length > 0) {
        // Get most recent completed scan
        const completedScans = userScans.filter((s: any) => s.status === 'complete');
        if (completedScans.length > 0) {
          const latestScan = completedScans[0]; // Already sorted by getUserScans
          scanData = latestScan.results || latestScan;
        }
      }
    } catch (e) {
      console.warn('[Strategy] Could not load scan data from storage, using provided data');
    }

    // Use provided data as fallback
    if (!scanData) {
      scanData = {
        brandDNA: brandDNA || null,
        competitorIntelligence: competitors ? competitors.map((c: string) => ({ name: c })) : [],
      };
    }

    // Load brand voice and assets from request or use defaults
    // Brand voice should come from Brand Assets page (stored in localStorage on frontend)
    // For now, extract from brandDNA if available, or use defaults
    const brandVoiceFromDNA = (brandDNA || scanData?.brandDNA)?.voice || {};
    const brandAssets = {
      voice: brandVoiceFromDNA,
      colors: scanData?.brandColors || [],
      fonts: scanData?.brandFonts || [],
      materials: scanData?.brandMaterials || [],
      profile: scanData?.brandProfile || null,
    };

    // Trigger n8n workflow for strategy modification
    const workflowContext = {
      scanId: scanData?.scanId || scanData?.id,
      brandDNA: brandDNA || scanData?.brandDNA,
      brandVoice: brandVoiceFromDNA, // Explicitly include brand voice
      brandAssets: brandAssets, // Include all brand assets
      extractedContent: scanData?.extractedContent,
      competitorIntelligence: Array.isArray(competitors) && competitors.length > 0 && typeof competitors[0] === 'string'
        ? competitors.map((c: string) => ({ name: c }))
        : (competitors || scanData?.competitorIntelligence || []),
      strategicInsights: scanData?.strategicInsights || [],
      brandIdentity: scanData?.brandIdentity,
      username: scanUsername,
      workflowType: 'strategy-modification' as const,
      strategyModification: message,
      userMessage: message,
    };

    console.log('[Strategy] Triggering strategy modification workflow:', { 
      scanUsername, 
      messageLength: message.length,
      hasBrandDNA: !!workflowContext.brandDNA,
      hasBrandVoice: !!workflowContext.brandVoice,
      hasBrandAssets: !!workflowContext.brandAssets,
      competitorsCount: workflowContext.competitorIntelligence.length,
    });
    
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/akeemojuko/Documents/aibc_core-1/.cursor/debug.log';
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'strategy.ts:77',message:'TRIGGERING N8N WORKFLOW',data:{scanUsername,messageLength:message.length,hasBrandDNA:!!workflowContext.brandDNA,hasBrandVoice:!!workflowContext.brandVoice,hasBrandAssets:!!workflowContext.brandAssets,competitorsCount:workflowContext.competitorIntelligence.length,workflowType:workflowContext.workflowType},timestamp:Date.now(),sessionId:'debug-session',runId:'n8n-workflow',hypothesisId:'H13'})+'\n');
    } catch(e){}
    // #endregion

    const workflowResult = await triggerMasterCMOWorkflow(workflowContext);
    
    // #region agent log
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'strategy.ts:80',message:'N8N WORKFLOW RESULT',data:{success:workflowResult.success,hasExecutionId:!!workflowResult.executionId,error:workflowResult.error},timestamp:Date.now(),sessionId:'debug-session',runId:'n8n-workflow',hypothesisId:'H13'})+'\n');
    } catch(e){}
    // #endregion

    if (workflowResult.success) {
      // Get the new strategy plan from workflow results
      // The workflow will have updated the strategy based on user's message
      const responseMessage = `Strategy modification processed. New content plan created based on: "${message}". 
      
The n8n workflow has been triggered to:
- Analyze your request
- Update content strategy
- Research competitors (if mentioned)
- Generate new content aligned with your modification

Check the Content Hub for reviewed content ready for your approval.`;

      res.json({
        success: true,
        message: responseMessage,
        response: responseMessage,
        newStrategy: workflowResult.executionId ? 'Workflow triggered' : 'Strategy updated',
        contentUpdates: {
          strategyModified: true,
          modification: message,
          workflowTriggered: true,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: workflowResult.error || 'Failed to process strategy modification',
      });
    }
  } catch (error: any) {
    console.error('[Strategy] Processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error processing strategy',
    });
  }
});

export default router;

