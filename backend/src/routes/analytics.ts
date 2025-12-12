import { Router } from 'express';
import { generateAnalyticsReport, checkBusinessPlusAccess } from '../services/analyticsService';
import { scrapeLast7DaysContent, generateAnalyticsInsights } from '../services/contentScraperService';

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

    // Scrape content
    const scrapedData = await scrapeLast7DaysContent(
      companyUsername,
      companyPlatforms,
      competitors || []
    );

    // Generate insights using LLM
    const insights = await generateAnalyticsInsights(scrapedData);

    res.json({
      success: true,
      data: {
        ...scrapedData,
        insights
      }
    });
  } catch (error: any) {
    console.error('Error scraping analytics:', error);
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
      return res.status(503).json({
        success: false,
        error: 'LLM service not configured'
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

    const result = await generateJSON<{ platforms: Array<{
      platform: string;
      performance: number;
      whatsWorking: string[];
      areasForImprovement: string[];
    }> }>(prompt, systemPrompt);

    if (result && result.platforms) {
      res.json({
        success: true,
        platforms: result.platforms
      });
    } else {
      throw new Error('Failed to generate platform insights');
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
  try {
    const { 
      strategy, 
      brandDNA, 
      competitorIntelligence, 
      currentContentIdeas,
      scanUsername 
    } = req.body;

    if (!strategy || !scanUsername) {
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

    const prompt = `STRATEGY-DRIVEN CONTENT REGENERATION for ${scanUsername}.

## ACTIVE STRATEGY:
- Type: ${strategyObj.type || 'user_directed'}
- Title: ${strategyObj.title || 'Custom strategy'}
- Description: ${strategyObj.description || strategyObj.title || strategy}
- Applied: ${strategyObj.appliedAt || 'Just now'}

## BRAND DNA:
${brandDNA ? `
- Archetype: ${brandDNA.archetype}
- Voice: ${brandDNA.voice?.tone || 'Professional'}
- Core Pillars: ${(brandDNA.corePillars || []).join(', ')}
` : 'No brand DNA available'}

## COMPETITOR INTELLIGENCE:
${competitorContext.map((c: any) => `
- ${c.name}: ${c.primaryVector || 'General content'}
  Top viral: ${(c.topViralContent || []).map((v: any) => v.title).join('; ') || 'N/A'}
`).join('')}

## CURRENT CONTENT IDEAS (to improve upon):
${(currentContentIdeas || []).slice(0, 3).map((idea: any) => `- ${idea.title}`).join('\n')}

## TASK: Generate 8 NEW content ideas that:
${strategy.type === 'competitor_focus' ? `
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

Return JSON array:
[
  {
    "title": "Viral hook title 30+ chars",
    "description": "Why this aligns with ${strategy.type} strategy and expected engagement",
    "platform": "instagram|twitter|linkedin|youtube|tiktok",
    "format": "carousel|video|reel|thread|post",
    "strategyAlignment": "How this specifically addresses the ${strategy.type} strategy",
    "competitorInspiration": "Which competitor pattern inspired this (if applicable)"
  }
]`;

    const systemPrompt = `You are a strategic content planner. Generate content ideas that DIRECTLY implement the given strategy.
For competitor_focus: Every idea must directly counter or outperform the target competitor.
For brand_building: Every idea must build brand authority and emotional connection.
Return valid JSON only.`;

    const result = await generateJSON<any[]>(prompt, systemPrompt);

    if (Array.isArray(result) && result.length > 0) {
      res.json({
        success: true,
        contentIdeas: result,
        strategy: strategy.type,
        generatedAt: new Date().toISOString()
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
      return res.status(503).json({
        success: false,
        error: 'LLM service not configured'
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

    const result = await generateJSON<any>(prompt, 'You are a competitive intelligence analyst. Provide data-driven competitive analysis. Return valid JSON only.');

    if (result) {
      res.json({
        success: true,
        comparison: result,
        generatedAt: new Date().toISOString()
      });
    } else {
      throw new Error('Failed to generate competitive comparison');
    }
  } catch (error: any) {
    console.error('Error generating competitive comparison:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate comparison'
    });
  }
});

export default router;

