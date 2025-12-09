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

export default router;

