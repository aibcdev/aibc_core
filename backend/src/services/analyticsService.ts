import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export interface AnalyticsReportRequest {
  dateRange: {
    start: string; // ISO date
    end: string; // ISO date
  };
  parameters: {
    toneTracking?: boolean;
    contentTracking?: boolean;
    engagementMetrics?: boolean;
    brandVoiceMatch?: boolean;
    competitorComparison?: boolean;
    platformBreakdown?: string[]; // ['twitter', 'linkedin', etc.]
    customMetrics?: string[]; // User-defined metrics
  };
  brandDNA?: any; // For tone analysis
  contentData?: any[]; // Historical content data
}

export interface AnalyticsReport {
  success: boolean;
  reportId?: string;
  generatedAt?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sections?: {
    executiveSummary?: string;
    toneAnalysis?: {
      averageTone: string;
      toneConsistency: number; // 0-100
      toneEvolution: any[];
      recommendations: string[];
    };
    contentPerformance?: {
      totalContent: number;
      averageEngagement: number;
      topPerformingContent: any[];
      contentTrends: any[];
    };
    brandVoiceMatch?: {
      overallMatch: number; // 0-100
      platformBreakdown: Record<string, number>;
      recommendations: string[];
    };
    competitorComparison?: {
      marketPosition: string;
      strengths: string[];
      opportunities: string[];
    };
    customMetrics?: Record<string, any>;
  };
  error?: string;
}

/**
 * Generate custom analytics report
 */
export async function generateAnalyticsReport(
  request: AnalyticsReportRequest
): Promise<AnalyticsReport> {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build analysis prompt based on requested parameters
    const analysisPrompts: string[] = [];

    if (request.parameters.toneTracking && request.brandDNA) {
      analysisPrompts.push(`Analyze tone consistency across all content. Brand DNA tone: ${JSON.stringify(request.brandDNA.voice)}`);
    }

    if (request.parameters.contentTracking && request.contentData) {
      analysisPrompts.push(`Analyze content performance metrics for ${request.contentData.length} pieces of content.`);
    }

    if (request.parameters.brandVoiceMatch && request.brandDNA) {
      analysisPrompts.push(`Calculate brand voice match percentage. Target voice: ${JSON.stringify(request.brandDNA.voice)}`);
    }

    if (request.parameters.competitorComparison) {
      analysisPrompts.push(`Provide competitive analysis and market positioning insights.`);
    }

    const prompt = `Generate a comprehensive analytics report for the date range ${request.dateRange.start} to ${request.dateRange.end}.

Analysis Requirements:
${analysisPrompts.join('\n')}

${request.parameters.customMetrics ? `Custom Metrics to Include: ${request.parameters.customMetrics.join(', ')}` : ''}

${request.parameters.platformBreakdown ? `Platform Breakdown Required: ${request.parameters.platformBreakdown.join(', ')}` : ''}

Generate a structured report with:
1. Executive Summary (2-3 paragraphs)
2. Tone Analysis (if requested): Average tone, consistency score (0-100), evolution over time, recommendations
3. Content Performance (if requested): Total content count, average engagement, top performers, trends
4. Brand Voice Match (if requested): Overall match percentage, platform breakdown, recommendations
5. Competitor Comparison (if requested): Market position, strengths, opportunities
6. Custom Metrics (if provided): Analysis of each custom metric

Return as JSON:
{
  "executiveSummary": "...",
  "toneAnalysis": {
    "averageTone": "...",
    "toneConsistency": 0-100,
    "toneEvolution": [...],
    "recommendations": [...]
  },
  "contentPerformance": {
    "totalContent": 0,
    "averageEngagement": 0,
    "topPerformingContent": [...],
    "contentTrends": [...]
  },
  "brandVoiceMatch": {
    "overallMatch": 0-100,
    "platformBreakdown": {...},
    "recommendations": [...]
  },
  "competitorComparison": {
    "marketPosition": "...",
    "strengths": [...],
    "opportunities": [...]
  },
  "customMetrics": {...}
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const reportData = JSON.parse(jsonMatch[0]);
      
      return {
        success: true,
        reportId,
        generatedAt: new Date().toISOString(),
        dateRange: request.dateRange,
        sections: reportData
      };
    }

    throw new Error('Failed to parse analytics report as JSON');
  } catch (error: any) {
    console.error('Analytics report generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate analytics report'
    };
  }
}

/**
 * Check if user has Business+ tier access
 */
export function checkBusinessPlusAccess(userTier: string): boolean {
  return userTier === 'business' || userTier === 'premium';
}

