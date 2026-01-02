/**
 * Brand Assets Routes
 * Handles brand asset updates and triggers n8n workflows to update Content Hub
 */

import { Router } from 'express';
import { triggerMasterCMOWorkflow } from '../services/agents/masterCMOAgent';
import { storage } from '../services/storage';

const router = Router();

/**
 * POST /api/brand-assets/update
 * Handle brand asset updates and trigger n8n workflow to update Content Hub
 */
router.post('/update', async (req, res) => {
  try {
    const { materials, colors, fonts, voiceSettings, brandProfile, contentPreferences, username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, error: 'Username is required' });
    }

    // Get latest scan results for context
    let scanData: any = null;
    try {
      const userScans = storage.getUserScans(username);
      if (userScans.length > 0) {
        const completedScans = userScans.filter((s: any) => s.status === 'complete');
        if (completedScans.length > 0) {
          const latestScan = completedScans[0];
          scanData = latestScan.results || latestScan;
        }
      }
    } catch (e) {
      console.warn('[Brand Assets] Could not load scan data from storage');
    }

    // Build workflow context
    const workflowContext = {
      scanId: scanData?.scanId || scanData?.id,
      brandDNA: scanData?.brandDNA,
      brandVoice: voiceSettings || scanData?.brandDNA?.voice,
      brandAssets: {
        materials: materials || [],
        colors: colors || [],
        fonts: fonts || [],
        profile: brandProfile || {},
        voice: voiceSettings || {},
        preferences: contentPreferences || {},
      },
      extractedContent: scanData?.extractedContent,
      competitorIntelligence: scanData?.competitorIntelligence || [],
      strategicInsights: scanData?.strategicInsights || [],
      brandIdentity: scanData?.brandIdentity,
      username: username,
      workflowType: 'brand-assets-update' as const,
      brandAssetsUpdate: {
        materials: materials || [],
        colors: colors || [],
        fonts: fonts || [],
        profile: brandProfile,
        voice: voiceSettings,
        preferences: contentPreferences,
      },
    };

    console.log('[Brand Assets] Triggering workflow to update Content Hub:', {
      username,
      hasMaterials: !!(materials && materials.length > 0),
      hasColors: !!(colors && colors.length > 0),
      hasFonts: !!(fonts && fonts.length > 0),
      hasProfile: !!brandProfile,
      hasVoice: !!voiceSettings,
    });

    // Trigger n8n workflow to update Content Hub
    const workflowResult = await triggerMasterCMOWorkflow(workflowContext);

    if (workflowResult.success) {
      res.json({
        success: true,
        message: 'Brand assets updated. Content Hub is being refreshed with new context.',
        workflowTriggered: true,
        executionId: workflowResult.executionId,
      });
    } else {
      res.status(500).json({
        success: false,
        error: workflowResult.error || 'Failed to update Content Hub',
      });
    }
  } catch (error: any) {
    console.error('[Brand Assets] Processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error processing brand assets update',
    });
  }
});

export default router;
