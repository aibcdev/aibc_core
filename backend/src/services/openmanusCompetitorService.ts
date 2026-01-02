/**
 * OpenManus Competitor Service
 * Competitor analysis using OpenManus agents
 */

import { executeCompetitorTask, isOpenManusAvailable } from './openmanusService';
import { useOpenManusCompetitor } from '../config/featureFlags';
import { buildOpenManusTaskPrompt } from './openmanusMappings';

export interface CompetitorRequest {
  competitorName: string;
  brandContext?: {
    name: string;
    industry?: string;
    niche?: string;
    themes?: string[];
  };
  platforms?: string[];
  analysisType?: 'quick' | 'deep';
}

export interface CompetitorResponse {
  name: string;
  analysis: {
    positioning: string;
    strengths: string[];
    weaknesses: string[];
    contentStyle: string;
    engagementPatterns?: any;
    topContent?: Array<{
      title: string;
      platform: string;
      engagement: number;
    }>;
  };
  competitiveAdvantage?: string;
  opportunity?: string;
}

/**
 * Analyze competitor using OpenManus
 */
export async function analyzeCompetitorWithOpenManus(
  request: CompetitorRequest
): Promise<CompetitorResponse> {
  // Check if OpenManus is enabled and available
  if (!useOpenManusCompetitor()) {
    throw new Error('OpenManus competitor analysis is not enabled. Set USE_OPENMANUS_COMPETITOR=true');
  }

  const available = await isOpenManusAvailable();
  if (!available) {
    throw new Error('OpenManus service is not available. Please ensure it is running.');
  }

  try {
    // Build competitor analysis task prompt
    const taskPrompt = buildCompetitorTaskPrompt(request);

    // Execute competitor task
    const response = await executeCompetitorTask(taskPrompt, {
      competitorName: request.competitorName,
      brandContext: request.brandContext,
      platforms: request.platforms,
      analysisType: request.analysisType,
    });

    if (!response.success) {
      throw new Error(response.error || 'OpenManus competitor analysis failed');
    }

    // Parse and return competitor analysis results
    const result = parseCompetitorResult(response.result || '', request);

    return result;
  } catch (error: any) {
    console.error('[OpenManus Competitor] Error:', error);
    throw error;
  }
}

/**
 * Build competitor analysis task prompt for OpenManus
 */
function buildCompetitorTaskPrompt(request: CompetitorRequest): string {
  const { competitorName, brandContext, platforms, analysisType } = request;

  let prompt = `Perform comprehensive competitor analysis for: ${competitorName}

`;

  if (brandContext) {
    prompt += `BRAND CONTEXT (for comparison):
- Name: ${brandContext.name}
- Industry: ${brandContext.industry || 'Not specified'}
- Niche: ${brandContext.niche || 'Not specified'}
- Themes: ${(brandContext.themes || []).join(', ') || 'Not specified'}

`;
  }

  if (platforms && platforms.length > 0) {
    prompt += `PLATFORMS TO ANALYZE: ${platforms.join(', ')}

`;
  }

  prompt += `ANALYSIS TYPE: ${analysisType || 'deep'}
${analysisType === 'deep' ? 'Perform comprehensive analysis with content scraping, engagement analysis, and positioning.' : 'Perform quick analysis with basic positioning and content style.'}

REQUIREMENTS:
1. Analyze competitor's positioning and market presence
2. Identify strengths and weaknesses
3. Analyze content style and messaging
4. Extract engagement patterns (if available)
5. Identify top-performing content
6. Compare with brand context (if provided)

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "name": "${competitorName}",
  "analysis": {
    "positioning": "...",
    "strengths": ["strength1", "strength2", ...],
    "weaknesses": ["weakness1", "weakness2", ...],
    "contentStyle": "...",
    "engagementPatterns": { ... },
    "topContent": [
      {
        "title": "...",
        "platform": "...",
        "engagement": 0
      }
    ]
  },
  "competitiveAdvantage": "...",
  "opportunity": "..."
}

Use browser automation to visit actual competitor profiles and extract real data.`;

  return prompt;
}

/**
 * Parse competitor result from OpenManus response
 */
function parseCompetitorResult(resultText: string, request: CompetitorRequest): CompetitorResponse {
  try {
    // Try to extract JSON from the result text
    let jsonText = resultText;

    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Try to find JSON object in the text
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonText);

    // Validate and normalize structure
    return {
      name: parsed.name || request.competitorName,
      analysis: {
        positioning: parsed.analysis?.positioning || '',
        strengths: Array.isArray(parsed.analysis?.strengths) ? parsed.analysis.strengths : [],
        weaknesses: Array.isArray(parsed.analysis?.weaknesses) ? parsed.analysis.weaknesses : [],
        contentStyle: parsed.analysis?.contentStyle || '',
        engagementPatterns: parsed.analysis?.engagementPatterns,
        topContent: Array.isArray(parsed.analysis?.topContent) ? parsed.analysis.topContent : [],
      },
      competitiveAdvantage: parsed.competitiveAdvantage,
      opportunity: parsed.opportunity,
    };
  } catch (error: any) {
    console.warn('[OpenManus Competitor] Failed to parse JSON result, creating fallback structure');
    
    // Return a basic structure if parsing fails
    return {
      name: request.competitorName,
      analysis: {
        positioning: resultText.substring(0, 200),
        strengths: [],
        weaknesses: [],
        contentStyle: '',
        topContent: [],
      },
    };
  }
}

/**
 * Check if OpenManus competitor analysis should be used (feature flag + availability)
 */
export async function shouldUseOpenManusCompetitor(): Promise<boolean> {
  if (!useOpenManusCompetitor()) {
    return false;
  }

  return await isOpenManusAvailable();
}
