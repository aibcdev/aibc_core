/**
 * Strategy Processing Routes
 * Handles strategy modification requests and triggers n8n workflows
 */

import { Router } from 'express';
import { triggerMasterCMOWorkflow } from '../services/agents/masterCMOAgent';
import { storage } from '../services/storage';
import { generateTaskPlan } from '../services/taskPlanningService';
import { generateJSON } from '../services/llmService';

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
      // Generate marketing suggestions using OpenManus-style iterative process
      const marketingSuggestions = await generateMarketingSuggestions(
        message,
        scanUsername,
        brandDNA || scanData?.brandDNA,
        workflowContext.competitorIntelligence
      );

      // Get the new strategy plan from workflow results
      const responseMessage = `Strategy modification processed. New content plan created based on: "${message}". 
      
The n8n workflow has been triggered to:
- Analyze your request
- Update content strategy
- Research competitors (if mentioned)
- Generate new content aligned with your modification

${marketingSuggestions.length > 0 ? `\n**Marketing Suggestions:**\n${marketingSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n` : ''}

Check the Content Hub for reviewed content ready for your approval.`;

      res.json({
        success: true,
        message: responseMessage,
        response: responseMessage,
        newStrategy: workflowResult.executionId ? 'Workflow triggered' : 'Strategy updated',
        marketingSuggestions,
        contentUpdates: {
          strategyModified: true,
          modification: message,
          workflowTriggered: true,
          suggestionsGenerated: marketingSuggestions.length,
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

/**
 * Generate marketing suggestions using OpenManus-style iterative process
 */
async function generateMarketingSuggestions(
  userMessage: string,
  username: string,
  brandDNA: any,
  competitors: any[]
): Promise<string[]> {
  try {
    const prompt = `You are a marketing strategist. Based on the user's strategy request, generate 3-5 actionable marketing suggestions.

USER REQUEST: "${userMessage}"

BRAND CONTEXT:
- Name: ${username}
- Industry: ${brandDNA?.industry || 'Not specified'}
- Brand Voice: ${brandDNA?.voice?.style || brandDNA?.voice?.tone || 'Professional'}
- Core Themes: ${(brandDNA?.themes || brandDNA?.corePillars || []).join(', ') || 'Not specified'}

COMPETITORS: ${competitors.length > 0 ? competitors.map((c: any) => c.name).join(', ') : 'None specified'}

Generate marketing suggestions that:
1. Are specific and actionable
2. Align with the user's strategy request
3. Consider the brand's voice and positioning
4. Can be implemented to improve content performance
5. Include specific tactics (e.g., "Create a weekly LinkedIn series on [topic]")

Return as JSON array of strings: ["suggestion 1", "suggestion 2", ...]`;

    const suggestions = await generateJSON<string[]>(prompt, 'You are an expert marketing strategist. Provide actionable, specific suggestions.', { tier: 'deep' });
    
    return Array.isArray(suggestions) ? suggestions.slice(0, 5) : [];
  } catch (error: any) {
    console.warn('[Strategy] Failed to generate marketing suggestions:', error.message);
    return [];
  }
}

/**
 * POST /api/strategy/suggest
 * Proactively suggest marketing ideas (OpenManus-style)
 */
router.post('/suggest', async (req, res) => {
  try {
    const { username, brandDNA, competitorIntelligence, conversationHistory } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, error: 'Username required' });
    }

    // Generate task plan for suggestion process
    const goal = `Generate proactive marketing suggestions for ${username} based on current strategy and market analysis`;
    const taskPlan = await generateTaskPlan(goal, {
      username,
      brandDNA,
      competitorIntelligence,
      conversationHistory: conversationHistory?.slice(-5) || [], // Last 5 messages
    });

    // Generate suggestions using LLM
    const prompt = `Generate 5 proactive marketing suggestions for ${username} based on:

BRAND DNA:
${JSON.stringify(brandDNA || {}, null, 2)}

COMPETITORS:
${competitorIntelligence?.map((c: any) => c.name).join(', ') || 'None'}

RECENT CONVERSATION:
${conversationHistory?.slice(-3).map((m: any) => `${m.role}: ${m.content}`).join('\n') || 'No recent conversation'}

Suggestions should:
1. Be proactive and forward-thinking
2. Address current market opportunities
3. Leverage brand strengths
4. Differentiate from competitors
5. Be immediately actionable

Return as JSON array: ["suggestion 1", "suggestion 2", ...]`;

    const suggestions = await generateJSON<string[]>(prompt, 'You are a proactive marketing strategist. Generate forward-thinking suggestions.', { tier: 'deep' });

    // Generate content ideas for each suggestion
    const contentIdeas = await Promise.all(
      (Array.isArray(suggestions) ? suggestions.slice(0, 5) : []).map(async (suggestion) => {
        const ideaPrompt = `Based on this marketing suggestion: "${suggestion}"

Generate a specific content idea that implements this suggestion for ${username}.

Return JSON: {
  "title": "Content title",
  "description": "How this implements the suggestion",
  "platform": "linkedin|twitter|instagram|youtube",
  "format": "post|carousel|video|thread"
}`;

        try {
          const idea = await generateJSON<any>(ideaPrompt, 'You are a content strategist. Create specific, actionable content ideas.', { tier: 'basic' });
          return {
            suggestion,
            contentIdea: idea,
          };
        } catch (error: any) {
          return {
            suggestion,
            contentIdea: null,
          };
        }
      })
    );

    res.json({
      success: true,
      suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 5) : [],
      contentIdeas: contentIdeas.filter(ci => ci.contentIdea),
      taskPlan: taskPlan.id,
    });
  } catch (error: any) {
    console.error('[Strategy] Suggestion generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate suggestions',
    });
  }
});

export default router;

