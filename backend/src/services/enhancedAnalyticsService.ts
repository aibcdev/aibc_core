/**
 * Enhanced Analytics Service
 * Provides deeper analytics insights, ROI tracking, and advanced metrics
 */

import { generateJSON, generateText, isLLMConfigured } from './llmService';

export interface AdvancedAnalytics {
  contentPerformance: {
    totalContent: number;
    totalEngagement: number;
    averageEngagementRate: number;
    topPerformers: Array<{
      id: string;
      title: string;
      platform: string;
      engagement: number;
      engagementRate: number;
      reach: number;
    }>;
    worstPerformers: Array<{
      id: string;
      title: string;
      platform: string;
      engagement: number;
      reason: string;
    }>;
  };
  audienceInsights: {
    peakEngagementTimes: Array<{
      day: string;
      hour: number;
      engagementRate: number;
    }>;
    preferredContentTypes: Array<{
      type: string;
      averageEngagement: number;
      count: number;
    }>;
    audienceGrowth: {
      current: number;
      previous: number;
      growthRate: number;
    };
  };
  roiMetrics: {
    contentInvestment: number;
    estimatedValue: number;
    roi: number;
    costPerEngagement: number;
    costPerConversion: number;
  };
  trends: {
    contentTrends: Array<{
      period: string;
      engagement: number;
      contentCount: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    platformTrends: Record<string, {
      engagement: number;
      trend: 'up' | 'down' | 'stable';
      growthRate: number;
    }>;
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
    expectedImpact: string;
  }>;
}

/**
 * Generate advanced analytics report
 */
export async function generateAdvancedAnalytics(
  contentData: any[],
  engagementData: any[],
  dateRange: { start: string; end: string },
  brandDNA?: any
): Promise<AdvancedAnalytics> {
  if (!isLLMConfigured()) {
    // Return basic analytics if LLM not available
    return generateBasicAnalytics(contentData, engagementData);
  }

  const prompt = `Analyze the following content and engagement data to generate comprehensive analytics insights.

CONTENT DATA (${contentData.length} pieces):
${JSON.stringify(contentData.slice(0, 20), null, 2)}${contentData.length > 20 ? '\n... (truncated)' : ''}

ENGAGEMENT DATA:
${JSON.stringify(engagementData.slice(0, 20), null, 2)}${engagementData.length > 20 ? '\n... (truncated)' : ''}

DATE RANGE: ${dateRange.start} to ${dateRange.end}

${brandDNA ? `BRAND CONTEXT:
- Brand Voice: ${brandDNA.voice?.tone || 'professional'}
- Brand Archetype: ${brandDNA.archetype || 'The Creator'}
` : ''}

Generate comprehensive analytics including:

1. CONTENT PERFORMANCE:
   - Total content pieces and engagement
   - Average engagement rate
   - Top 5 performing content (with engagement metrics)
   - Bottom 3 performing content (with reasons why)

2. AUDIENCE INSIGHTS:
   - Peak engagement times (day + hour)
   - Preferred content types
   - Audience growth metrics

3. ROI METRICS:
   - Content investment (estimate based on content count)
   - Estimated value generated
   - ROI percentage
   - Cost per engagement
   - Cost per conversion

4. TRENDS:
   - Content performance trends over time
   - Platform-specific trends
   - Growth rates

5. RECOMMENDATIONS:
   - High priority actionable recommendations
   - Expected impact of each recommendation

Return comprehensive JSON analytics report.`;

  try {
    const analytics = await generateJSON<AdvancedAnalytics>(prompt, undefined, { tier: 'basic' });
    return analytics;
  } catch (error) {
    console.error('[Enhanced Analytics] Generation error:', error);
    return generateBasicAnalytics(contentData, engagementData);
  }
}

/**
 * Generate basic analytics (fallback)
 */
function generateBasicAnalytics(
  contentData: any[],
  engagementData: any[]
): AdvancedAnalytics {
  const totalEngagement = engagementData.reduce((sum, e) => sum + (e.engagement || 0), 0);
  const avgEngagement = contentData.length > 0 ? totalEngagement / contentData.length : 0;

  return {
    contentPerformance: {
      totalContent: contentData.length,
      totalEngagement,
      averageEngagementRate: avgEngagement,
      topPerformers: [],
      worstPerformers: [],
    },
    audienceInsights: {
      peakEngagementTimes: [],
      preferredContentTypes: [],
      audienceGrowth: {
        current: 0,
        previous: 0,
        growthRate: 0,
      },
    },
    roiMetrics: {
      contentInvestment: contentData.length * 50, // Estimate
      estimatedValue: totalEngagement * 0.1, // Estimate
      roi: 0,
      costPerEngagement: contentData.length > 0 ? (contentData.length * 50) / totalEngagement : 0,
      costPerConversion: 0,
    },
    trends: {
      contentTrends: [],
      platformTrends: {},
    },
    recommendations: [],
  };
}

/**
 * Generate custom analytics dashboard data
 */
export async function generateCustomDashboard(
  metrics: string[],
  contentData: any[],
  dateRange: { start: string; end: string }
): Promise<Record<string, any>> {
  if (!isLLMConfigured()) {
    return {};
  }

  const prompt = `Generate custom analytics dashboard for the following metrics: ${metrics.join(', ')}

Content Data: ${contentData.length} pieces
Date Range: ${dateRange.start} to ${dateRange.end}

For each metric, provide:
- Current value
- Previous period comparison
- Trend (up/down/stable)
- Insights
- Recommendations

Return JSON object with each metric as a key.`;

  try {
    const dashboard = await generateJSON<Record<string, any>>(prompt, undefined, { tier: 'basic' });
    return dashboard;
  } catch (error) {
    console.error('[Enhanced Analytics] Custom dashboard error:', error);
    return {};
  }
}

/**
 * Generate content performance predictions
 */
export async function generatePerformancePredictions(
  historicalData: any[],
  plannedContent: any[]
): Promise<Array<{
  contentId: string;
  predictedEngagement: number;
  confidence: number;
  recommendations: string[];
}>> {
  if (!isLLMConfigured()) {
    return [];
  }

  const prompt = `Based on historical content performance data, predict engagement for planned content.

HISTORICAL DATA (${historicalData.length} pieces):
${JSON.stringify(historicalData.slice(0, 10), null, 2)}

PLANNED CONTENT:
${JSON.stringify(plannedContent, null, 2)}

For each planned content piece, predict:
- Expected engagement
- Confidence level (0-100)
- Recommendations to improve performance

Return JSON array of predictions.`;

  try {
    const predictions = await generateJSON<Array<{
      contentId: string;
      predictedEngagement: number;
      confidence: number;
      recommendations: string[];
    }>>(prompt, undefined, { tier: 'basic' });
    return predictions;
  } catch (error) {
    console.error('[Enhanced Analytics] Prediction error:', error);
    return [];
  }
}





