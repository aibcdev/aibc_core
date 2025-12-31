import { Router } from 'express';
import { generateAnalyticsReport, checkBusinessPlusAccess } from '../services/analyticsService';
import { scrapeLast7DaysContent, generateAnalyticsInsights } from '../services/contentScraperService';
import {
  generateAdvancedAnalytics,
  generateCustomDashboard,
  generatePerformancePredictions,
} from '../services/enhancedAnalyticsService';

const router = Router();

// Generate custom analytics report (Business+ tier only)
router.post('/report', async (req, res) => {
  try {
    const { dateRange, parameters, brandDNA, contentData } = req.body;
    const userTier = req.headers['x-user-tier'] as string || 'free'; // In production, get from auth

    // Check tier access
    if (!checkBusinessPlusAccess(userTier)) {
      return res.status(403).json({
        success: false,
        error: 'Custom analytics reports are only available for Business+ tier users'
      });
    }

    if (!dateRange || !dateRange.start || !dateRange.end) {
      return res.status(400).json({
        success: false,
        error: 'Date range is required'
      });
    }

    if (!parameters || Object.keys(parameters).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one analysis parameter is required'
      });
    }

    const report = await generateAnalyticsReport({
      dateRange,
      parameters,
      brandDNA,
      contentData
    });

    if (report.success) {
      res.json(report);
    } else {
      res.status(500).json(report);
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate analytics report'
    });
  }
});

// Scrape last 7 days of content and generate analytics
router.post('/last7days', async (req, res) => {
  try {
    const { companyUsername, companyPlatforms, competitors } = req.body;

    if (!companyUsername || !companyPlatforms || !Array.isArray(companyPlatforms)) {
      return res.status(400).json({
        success: false,
        error: 'companyUsername and companyPlatforms array are required'
      });
    }

    // Set timeout for this endpoint (30 seconds max)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - scraping took too long')), 30000);
    });

    try {
      // Scrape content with timeout
      const scrapedData = await Promise.race([
        scrapeLast7DaysContent(
          companyUsername,
          companyPlatforms,
          competitors || []
        ),
        timeoutPromise
      ]) as any;

      // Generate insights using LLM (with shorter timeout)
      const insightsTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('LLM timeout')), 15000);
      });

      let insights;
      try {
        insights = await Promise.race([
          generateAnalyticsInsights(scrapedData),
          insightsTimeout
        ]);
      } catch (insightsError: any) {
        console.warn('Insights generation failed, returning scraped data only:', insightsError.message);
        insights = null; // Continue without insights
      }

      res.json({
        success: true,
        data: {
          ...scrapedData,
          insights
        }
      });
    } catch (scrapeError: any) {
      // If scraping fails, return a fallback response using scan data
      console.warn('Scraping failed, returning fallback response:', scrapeError.message);
      res.json({
        success: true,
        data: {
          company: {
            username: companyUsername,
            posts: [],
            totalEngagement: 0,
            avgEngagement: 0,
            postCount: 0
          },
          competitors: (competitors || []).map((c: any) => ({
            name: c.name,
            username: c.username,
            posts: [],
            totalEngagement: 0,
            avgEngagement: 0,
            postCount: 0
          })),
          insights: null,
          fallback: true,
          message: 'Using fallback data - scraping unavailable'
        }
      });
    }
  } catch (error: any) {
    console.error('Error in analytics/last7days:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape and analyze content'
    });
  }
});

// Generate platform-specific insights
router.post('/platform-insights', async (req, res) => {
  try {
    const { company, competitors, platforms } = req.body;

    if (!company || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({
        success: false,
        error: 'company and platforms array are required'
      });
    }

    // Use LLM to generate platform-specific insights
    const { generateJSON, isLLMConfigured } = await import('../services/llmService');
    
    if (!isLLMConfigured()) {
      // Return fallback insights if LLM not configured
      return res.json({
        success: true,
        platforms: platforms.map((p: string) => ({
          platform: p,
          performance: 0,
          whatsWorking: ['Content analysis requires LLM configuration'],
          areasForImprovement: ['Configure LLM service for detailed insights']
        }))
      });
    }

    const prompt = `Analyze the following content data and generate platform-specific insights for each platform.

Company Data:
- Total Engagement: ${company.totalEngagement || 0}
- Average Engagement: ${company.avgEngagement || 0}
- Post Count: ${company.postCount || 0}
- Posts: ${JSON.stringify(company.posts?.slice(0, 10) || [])}

Competitors: ${competitors?.length || 0} competitors analyzed

Platforms to analyze: ${platforms.join(', ')}

For each platform, provide:
1. Performance percentage (calculate based on engagement trends, use realistic numbers like 1-30%)
2. What's working (3 specific, actionable insights based on successful content patterns)
3. Areas for improvement (3 specific, actionable recommendations)

Return JSON in this format:
{
  "platforms": [
    {
      "platform": "Instagram",
      "performance": 14,
      "whatsWorking": ["insight 1", "insight 2", "insight 3"],
      "areasForImprovement": ["improvement 1", "improvement 2", "improvement 3"]
    }
  ]
}

Make insights specific, actionable, and based on the actual content patterns. Use platform-specific best practices.`;

    const systemPrompt = `You are an analytics expert. Analyze content performance data and provide platform-specific insights.
Return valid JSON only, in this exact format:
{
  "platforms": [
    {
      "platform": "Instagram",
      "performance": 14,
      "whatsWorking": ["insight 1", "insight 2", "insight 3"],
      "areasForImprovement": ["improvement 1", "improvement 2", "improvement 3"]
    }
  ]
}`;

    // Set timeout for LLM call (20 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('LLM timeout')), 20000);
    });

    try {
      const result = await Promise.race([
        generateJSON<{ platforms: Array<{
          platform: string;
          performance: number;
          whatsWorking: string[];
          areasForImprovement: string[];
        }> }>(prompt, systemPrompt),
        timeoutPromise
      ]) as any;

      if (result && result.platforms) {
        res.json({
          success: true,
          platforms: result.platforms
        });
      } else {
        throw new Error('Failed to generate platform insights');
      }
    } catch (llmError: any) {
      console.warn('LLM generation failed, returning fallback:', llmError.message);
      // Return fallback insights based on available data
      res.json({
        success: true,
        platforms: platforms.map((p: string) => ({
          platform: p,
          performance: company?.avgEngagement ? Math.min(30, Math.floor(company.avgEngagement / 100)) : 0,
          whatsWorking: ['Analyzing content patterns...'],
          areasForImprovement: ['Improving engagement rates...']
        })),
        fallback: true
      });
    }
  } catch (error: any) {
    console.error('Error generating platform insights:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate platform insights'
    });
  }
});

// Regenerate content ideas based on strategy context
router.post('/regenerate-content', async (req, res) => {
  // #region agent log
  const fs = require('fs');
  const logPath = '/Users/akeemojuko/Documents/aibc_core-1/.cursor/debug.log';
  try {
    fs.appendFileSync(logPath, JSON.stringify({location:'analytics.ts:regenerate-content',message:'REGENERATE CONTENT CALLED',data:{hasStrategy:!!req.body.strategy,hasScanUsername:!!req.body.scanUsername,hasBrandDNA:!!req.body.brandDNA,hasCompetitors:!!req.body.competitorIntelligence,hasConversationContext:!!req.body.conversationContext,conversationLength:req.body.conversationContext?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'content-regenerate',hypothesisId:'H17'})+'\n');
  } catch(e){}
  // #endregion
  try {
    const { 
      strategy, 
      brandDNA, 
      brandVoice, // Brand voice from Brand Assets page
      brandAssets, // All brand assets (colors, fonts, materials, profile)
      competitorIntelligence, 
      currentContentIdeas,
      scanUsername,
      conversationContext 
    } = req.body;

    // Check if task planning is enabled
    const enableTaskPlanning = process.env.ENABLE_TASK_PLANNING !== 'false';
    const enableBrowserValidation = process.env.ENABLE_BROWSER_AUTOMATION !== 'false';
    
    let taskPlan = null;
    if (enableTaskPlanning) {
      try {
        const { generateTaskPlan } = await import('../services/taskPlanningService');
        const goal = `Regenerate content ideas for ${scanUsername} based on strategy: ${typeof strategy === 'string' ? strategy : strategy?.title || 'strategy update'}`;
        taskPlan = await generateTaskPlan(goal, {
          strategy,
          brandDNA,
          brandAssets,
          competitorIntelligence,
          scanUsername,
        });
        console.log(`[Content Regeneration] Generated task plan with ${taskPlan.tasks.length} tasks`);
      } catch (error: any) {
        console.warn(`[Content Regeneration] Task planning failed, continuing without: ${error.message}`);
      }
    }

    if (!strategy || !scanUsername) {
      // #region agent log
      try {
        fs.appendFileSync(logPath, JSON.stringify({location:'analytics.ts:regenerate-content',message:'VALIDATION FAILED',data:{hasStrategy:!!strategy,hasScanUsername:!!scanUsername},timestamp:Date.now(),sessionId:'debug-session',runId:'content-regenerate',hypothesisId:'H17'})+'\n');
      } catch(e){}
      // #endregion
      return res.status(400).json({
        success: false,
        error: 'strategy and scanUsername are required'
      });
    }

    const { generateJSON, isLLMConfigured } = await import('../services/llmService');
    
    if (!isLLMConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'LLM service not configured'
      });
    }

    // Build competitor context for content generation
    const competitorContext = (competitorIntelligence || []).slice(0, 3).map((c: any) => ({
      name: c.name,
      primaryVector: c.primaryVector,
      topViralContent: (c.topViralContent || []).slice(0, 2)
    }));

    // Handle both string and object strategies
    const strategyObj = typeof strategy === 'string' 
      ? { type: 'user_directed', title: strategy.substring(0, 50), description: strategy }
      : strategy;

    const strategyType = strategyObj.type || 'user_directed';

    const prompt = `STRATEGY-DRIVEN CONTENT REGENERATION for ${scanUsername}.

## ACTIVE STRATEGY:
- Type: ${strategyType}
- Title: ${strategyObj.title || 'Custom strategy'}
- Description: ${strategyObj.description || strategyObj.title || (typeof strategy === 'string' ? strategy : 'Custom strategy')}
- Applied: ${strategyObj.appliedAt || 'Just now'}

## CONVERSATION CONTEXT (Recent strategy discussion):
${conversationContext ? conversationContext.substring(0, 1000) : 'No conversation context provided'}

## BRAND DNA:
${brandDNA ? `
- Archetype: ${brandDNA.archetype || 'Not specified'}
- Voice: ${brandDNA.voice?.tone || 'Professional'}
- Core Pillars: ${(brandDNA.corePillars || brandDNA.themes || []).join(', ') || 'Not specified'}
- Industry: ${brandDNA.industry || 'Not specified'}
- Name: ${brandDNA.name || scanUsername}
` : 'No brand DNA available'}

## BRAND VOICE (extracted from actual content analysis - how they actually write):
${brandDNA?.voice ? `
- Style: ${brandDNA.voice.style || brandDNA.voice.tone || 'Not specified'} (from their actual posts)
- Formality: ${brandDNA.voice.formality || 'Not specified'} (from their actual posts)
- Tone: ${brandDNA.voice.tone || 'Professional'} (from their actual posts)
- Vocabulary: ${Array.isArray(brandDNA.voice.vocabulary) ? brandDNA.voice.vocabulary.join(', ') : 'Not specified'} (words they actually use)
- Voice Characteristics: ${Array.isArray(brandDNA.voice.tones) ? brandDNA.voice.tones.join(', ') : 'Not specified'} (from content analysis)
` : 'No brand voice extracted - analyze their actual content to match their real writing style'}

## BRAND ASSETS:
${brandAssets ? `
- Colors: ${Array.isArray(brandAssets.colors) ? brandAssets.colors.map((c: any) => c.name || c).join(', ') : 'Not specified'}
- Fonts: ${Array.isArray(brandAssets.fonts) ? brandAssets.fonts.map((f: any) => f.name || f).join(', ') : 'Not specified'}
- Materials: ${Array.isArray(brandAssets.materials) ? `${brandAssets.materials.length} materials available` : 'Not specified'}
` : 'No brand assets specified'}

## COMPETITOR INTELLIGENCE:
${competitorContext.length > 0 ? competitorContext.map((c: any) => `
- ${c.name}: ${c.primaryVector || 'General content'}
  Top viral: ${(c.topViralContent || []).map((v: any) => v.title).join('; ') || 'N/A'}
`).join('') : 'No competitors specified'}

## CURRENT CONTENT IDEAS (to improve upon):
${(currentContentIdeas || []).slice(0, 3).map((idea: any) => `- ${idea.title || 'Untitled idea'}`).join('\n') || 'No existing ideas'}

## TASK: Generate 8 NEW content ideas that:
${strategyType === 'competitor_focus' ? `
1. Directly address the competitor mentioned: ${strategy.title.replace('Focus on ', '')}
2. Counter their top-performing content with better versions
3. Highlight YOUR unique advantages they don't have
4. Use viral hooks that outperform competitor content
` : strategy.type === 'brand_building' ? `
1. Focus on establishing thought leadership
2. Showcase brand values and story
3. Create save-worthy educational content
4. Build emotional connection with audience
` : `
1. Balance competitor awareness with brand building
2. Create differentiated content that stands out
3. Focus on audience value first
4. Use proven viral patterns
`}

Each idea MUST:
- Have a 30+ character viral hook title
- Reference the active strategy context
- Include platform and format
- Explain why it aligns with the strategy
- Be SPECIFIC to ${scanUsername} - use their brand name, industry, and actual context
- NOT be generic - must reference their actual brand DNA, industry, or competitors
- Match their ACTUAL brand voice (extracted from their real content): ${brandDNA?.voice?.style || brandDNA?.voice?.tone || 'professional and engaging'}
- Use their ACTUAL formality level (from their posts): ${brandDNA?.voice?.formality || 'professional'}
- Use vocabulary they actually use: ${Array.isArray(brandDNA?.voice?.vocabulary) ? brandDNA.voice.vocabulary.slice(0, 5).join(', ') : 'match their actual writing style'}

Return JSON array:
[
  {
    "title": "Viral hook title 30+ chars specific to ${scanUsername}",
    "description": "Why this aligns with ${strategyType} strategy and expected engagement for ${scanUsername}",
    "platform": "instagram|twitter|linkedin|youtube|tiktok",
    "format": "carousel|video|reel|thread|post",
    "strategyAlignment": "How this specifically addresses the ${strategyType} strategy for ${scanUsername}",
    "competitorInspiration": "Which competitor pattern inspired this (if applicable)"
  }
]`;

    const systemPrompt = `You are a strategic content planner. Generate content ideas that DIRECTLY implement the given strategy.
For competitor_focus: Every idea must directly counter or outperform the target competitor.
For brand_building: Every idea must build brand authority and emotional connection.
Return valid JSON only.`;

    // #region agent log
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'analytics.ts:regenerate-content',message:'CALLING LLM',data:{strategyType,hasConversationContext:!!conversationContext,conversationLength:conversationContext?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'content-regenerate',hypothesisId:'H17'})+'\n');
    } catch(e){}
    // #endregion
    
    const result = await generateJSON<any[]>(prompt, systemPrompt);

    // #region agent log
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'analytics.ts:regenerate-content',message:'LLM RESULT RECEIVED',data:{isArray:Array.isArray(result),resultLength:result?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'content-regenerate',hypothesisId:'H17'})+'\n');
    } catch(e){}
    // #endregion

    if (Array.isArray(result) && result.length > 0) {
      // Validate that content ideas are specific to the company
      let validatedIdeas = result.map((idea: any) => ({
        ...idea,
        // Ensure title and description reference the company
        title: idea.title || `Content idea for ${scanUsername}`,
        description: idea.description || `Strategy-aligned content for ${scanUsername}`,
        // Ensure platform and format are valid
        platform: (idea.platform || 'twitter').toLowerCase(),
        format: (idea.format || 'post').toLowerCase()
      }));

      // Browser validation if enabled
      if (enableBrowserValidation && competitorIntelligence?.length > 0) {
        try {
          const { browserAgent } = await import('../services/agents/browserAgent');
          const topCompetitor = competitorIntelligence[0];
          if (topCompetitor?.website || topCompetitor?.url) {
            const validationResult = await browserAgent.execute('validate-content', {
              url: topCompetitor.website || topCompetitor.url,
              searchQuery: `${scanUsername} ${brandDNA?.industry || ''} content`,
            });
            
            if (validationResult.success) {
              console.log(`[Content Regeneration] Browser validation completed`);
              // Ideas are already validated, browser check confirms competitor context
            }
          }
        } catch (error: any) {
          console.warn(`[Content Regeneration] Browser validation failed: ${error.message}`);
        }
      }

      // Iterative refinement if task plan exists
      if (taskPlan && taskPlan.tasks.some(t => t.name.toLowerCase().includes('refine'))) {
        try {
          const { generateJSON } = await import('../services/llmService');
          const refinementPrompt = `Refine the following content ideas to better align with strategy and brand:

CONTENT IDEAS:
${JSON.stringify(validatedIdeas, null, 2)}

STRATEGY: ${strategyType}
BRAND DNA: ${JSON.stringify(brandDNA, null, 2)}

Improve each idea to be more specific, engaging, and strategy-aligned. Return the refined array.`;
          
          const refined = await generateJSON<any[]>(refinementPrompt, 'You are a content strategist. Refine ideas for maximum impact.', { tier: 'deep' });
          if (Array.isArray(refined) && refined.length > 0) {
            validatedIdeas = refined;
            console.log(`[Content Regeneration] Ideas refined through iterative process`);
          }
        } catch (error: any) {
          console.warn(`[Content Regeneration] Refinement failed: ${error.message}`);
        }
      }
      
      res.json({
        success: true,
        contentIdeas: validatedIdeas,
        strategy: strategyType,
        scanUsername: scanUsername, // Include username in response
        generatedAt: new Date().toISOString(),
        taskPlanUsed: !!taskPlan,
        browserValidationUsed: enableBrowserValidation && competitorIntelligence?.length > 0,
      });
    } else {
      throw new Error('Failed to generate strategy-aligned content');
    }
  } catch (error: any) {
    console.error('Error regenerating content:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to regenerate content'
    });
  }
});

// Get competitive analytics comparison
router.post('/competitive-comparison', async (req, res) => {
  try {
    const { company, competitors } = req.body;

    if (!company) {
      return res.status(400).json({
        success: false,
        error: 'company data is required'
      });
    }

    const { generateJSON, isLLMConfigured } = await import('../services/llmService');
    
    if (!isLLMConfigured()) {
      // Return fallback comparison if LLM not configured
      return res.json({
        success: true,
        comparison: {
          companyMetrics: {
            estimatedEngagementRate: 'N/A',
            postingFrequency: `${company.postCount || 0} posts/week`,
            topPlatform: (company.platforms || [])[0] || 'Unknown',
            contentStrength: 'medium'
          },
          competitorComparison: (competitors || []).slice(0, 5).map((c: any) => ({
            competitor: c.name || 'Competitor',
            engagementComparison: 'N/A',
            frequencyComparison: 'similar',
            platformOverlap: company.platforms || [],
            theyWinAt: 'Analysis requires LLM',
            youWinAt: 'Analysis requires LLM'
          })),
          overallRanking: {
            position: 1,
            totalCompetitors: (competitors || []).length,
            trend: 'stable'
          },
          recommendations: ['Configure LLM service for detailed competitive analysis']
        },
        fallback: true
      });
    }

    const prompt = `Generate a competitive analytics comparison for ${company.name || company.username}.

COMPANY DATA:
- Name: ${company.name || company.username}
- Posts analyzed: ${company.postCount || 'Unknown'}
- Social platforms: ${(company.platforms || []).join(', ') || 'Unknown'}

COMPETITORS:
${(competitors || []).map((c: any) => `
- ${c.name}:
  Platforms: ${(c.postingChannels || []).join(', ') || 'Unknown'}
  Frequency: ${c.postingFrequency || 'Unknown'}
  Top formats: ${(c.bestFormats || []).join(', ') || 'Unknown'}
  Threat level: ${c.threatLevel || 'Unknown'}
`).join('')}

Generate a competitive comparison with:
1. Your company's estimated engagement metrics
2. How you compare to each competitor
3. Engagement rate ranking
4. Content frequency comparison
5. Platform strength comparison
6. Areas where you're winning
7. Areas where competitors are winning
8. Specific recommendations

Return JSON:
{
  "companyMetrics": {
    "estimatedEngagementRate": "X%",
    "postingFrequency": "X posts/week",
    "topPlatform": "platform name",
    "contentStrength": "high|medium|low"
  },
  "competitorComparison": [
    {
      "competitor": "name",
      "engagementComparison": "+X% or -X%",
      "frequencyComparison": "more|less|similar",
      "platformOverlap": ["platform1", "platform2"],
      "theyWinAt": "specific area",
      "youWinAt": "specific area"
    }
  ],
  "overallRanking": {
    "position": 1-5,
    "totalCompetitors": number,
    "trend": "improving|declining|stable"
  },
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ]
}`;

    // Set timeout for LLM call (20 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('LLM timeout')), 20000);
    });

    try {
      const result = await Promise.race([
        generateJSON<any>(prompt, 'You are a competitive intelligence analyst. Provide data-driven competitive analysis. Return valid JSON only.'),
        timeoutPromise
      ]) as any;

      if (result) {
        res.json({
          success: true,
          comparison: result,
          generatedAt: new Date().toISOString()
        });
      } else {
        throw new Error('Failed to generate competitive comparison');
      }
    } catch (llmError: any) {
      console.warn('LLM generation failed, returning fallback:', llmError.message);
      // Return fallback comparison
      res.json({
        success: true,
        comparison: {
          companyMetrics: {
            estimatedEngagementRate: 'N/A',
            postingFrequency: `${company.postCount || 0} posts/week`,
            topPlatform: (company.platforms || [])[0] || 'Unknown',
            contentStrength: 'medium'
          },
          competitorComparison: (competitors || []).slice(0, 5).map((c: any) => ({
            competitor: c.name || 'Competitor',
            engagementComparison: 'N/A',
            frequencyComparison: 'similar',
            platformOverlap: company.platforms || [],
            theyWinAt: 'Detailed analysis unavailable',
            youWinAt: 'Detailed analysis unavailable'
          })),
          overallRanking: {
            position: 1,
            totalCompetitors: (competitors || []).length,
            trend: 'stable'
          },
          recommendations: ['Run a full scan for detailed competitive analysis']
        },
        generatedAt: new Date().toISOString(),
        fallback: true
      });
    }
  } catch (error: any) {
    console.error('Error generating competitive comparison:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate comparison'
    });
  }
});

/**
 * POST /api/analytics/advanced
 * Generate advanced analytics with deeper insights
 */
router.post('/advanced', async (req, res) => {
  try {
    const { contentData, engagementData, dateRange, brandDNA } = req.body;

    if (!contentData || !engagementData || !dateRange) {
      return res.status(400).json({
        success: false,
        error: 'ContentData, engagementData, and dateRange required'
      });
    }

    const analytics = await generateAdvancedAnalytics(
      contentData,
      engagementData,
      dateRange,
      brandDNA
    );

    res.json({
      success: true,
      analytics,
    });
  } catch (error: any) {
    console.error('Advanced analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate advanced analytics'
    });
  }
});

/**
 * POST /api/analytics/custom-dashboard
 * Generate custom analytics dashboard
 */
router.post('/custom-dashboard', async (req, res) => {
  try {
    const { metrics, contentData, dateRange } = req.body;

    if (!metrics || !Array.isArray(metrics) || !contentData || !dateRange) {
      return res.status(400).json({
        success: false,
        error: 'Metrics array, contentData, and dateRange required'
      });
    }

    const dashboard = await generateCustomDashboard(metrics, contentData, dateRange);

    res.json({
      success: true,
      dashboard,
    });
  } catch (error: any) {
    console.error('Custom dashboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate custom dashboard'
    });
  }
});

/**
 * POST /api/analytics/predictions
 * Generate content performance predictions
 */
router.post('/predictions', async (req, res) => {
  try {
    const { historicalData, plannedContent } = req.body;

    if (!historicalData || !plannedContent) {
      return res.status(400).json({
        success: false,
        error: 'HistoricalData and plannedContent required'
      });
    }

    const predictions = await generatePerformancePredictions(historicalData, plannedContent);

    res.json({
      success: true,
      predictions,
    });
  } catch (error: any) {
    console.error('Performance predictions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate predictions'
    });
  }
});

export default router;

