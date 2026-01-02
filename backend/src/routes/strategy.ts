/**
 * Strategy Processing Routes
 * Handles strategy modification requests and triggers n8n workflows
 */

import { Router } from 'express';
import { triggerMasterCMOWorkflow } from '../services/agents/masterCMOAgent';
import { storage } from '../services/storage';
import { generateTaskPlan } from '../services/taskPlanningService';
import { generateJSON } from '../services/llmService';
import { generateOpenManusSuggestions, shouldUseOpenManusStrategy } from '../services/openmanusStrategyService';

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
      // Generate marketing suggestions - use OpenManus if enabled, otherwise legacy
      let marketingSuggestions: string[] = [];
      
      const useOpenManus = await shouldUseOpenManusStrategy();
      if (useOpenManus) {
        try {
          console.log('[Strategy Route] Using OpenManus for marketing suggestions');
          const openManusResult = await generateOpenManusSuggestions({
            userMessage: message,
            username: scanUsername,
            brandDNA: brandDNA || scanData?.brandDNA,
            competitorIntelligence: workflowContext.competitorIntelligence,
          });
          marketingSuggestions = openManusResult.suggestions;
        } catch (error: any) {
          console.warn('[Strategy Route] OpenManus suggestions failed, falling back to legacy:', error.message);
          // Fallback to legacy
          marketingSuggestions = await generateMarketingSuggestions(
            message,
            scanUsername,
            brandDNA || scanData?.brandDNA,
            workflowContext.competitorIntelligence
          );
        }
      } else {
        // Use legacy suggestion generation
        marketingSuggestions = await generateMarketingSuggestions(
          message,
          scanUsername,
          brandDNA || scanData?.brandDNA,
          workflowContext.competitorIntelligence
        );
      }

      // Generate natural, human-like response - like talking to a real person
      let responseMessage = '';
      
      // Start with a casual, natural acknowledgment (like a real person would respond)
      const messageLower = message.toLowerCase();
      if (messageLower.includes('reminder') || messageLower.includes('calendar') || messageLower.includes('schedule')) {
        responseMessage = `Got it! Setting that up now.`;
      } else if (messageLower.includes('competitor') || messageLower.includes('add')) {
        responseMessage = `On it!`;
      } else if (messageLower.includes('focus') || messageLower.includes('change')) {
        responseMessage = `Perfect. Shifting focus to that.`;
      } else {
        responseMessage = `Got it.`;
      }
      
      // Add ONE short sentence - no long explanations
      responseMessage += ` Updating your content plan.`;
      
      // Add suggestions ONLY if they exist, and make them super short and casual
      if (marketingSuggestions.length > 0) {
        // Take only 2-3 suggestions, make them super concise (max 80 chars)
        const shortSuggestions = marketingSuggestions.slice(0, 2).map(s => {
          const trimmed = s.length > 80 ? s.substring(0, 77) + '...' : s;
          return trimmed;
        });
        
        responseMessage += `\n\nQuick ideas:\n${shortSuggestions.map(s => `• ${s}`).join('\n')}`;
      }
      
      // End with a simple, casual note
      responseMessage += `\n\nContent Hub will update shortly.`;

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
    const prompt = `You're a helpful marketing strategist chatting with a client. Based on their request, give 3-5 short, actionable suggestions.

USER REQUEST: "${userMessage}"

BRAND: ${username} (${brandDNA?.industry || 'various'})
VOICE: ${brandDNA?.voice?.style || brandDNA?.voice?.tone || 'professional'}
THEMES: ${(brandDNA?.themes || brandDNA?.corePillars || []).slice(0, 3).join(', ') || 'general'}
${competitors.length > 0 ? `COMPETITORS: ${competitors.map((c: any) => c.name).slice(0, 3).join(', ')}` : ''}

Write suggestions that are:
- Short (1-2 sentences max)
- Conversational and friendly
- Specific and actionable
- Directly related to their request

Keep it casual and helpful, like you're texting a colleague. Return as JSON array: ["suggestion 1", "suggestion 2", ...]`;

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

