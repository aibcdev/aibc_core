/**
 * OpenManus Strategy Service
 * Strategy generation and suggestion using OpenManus agents
 */

import { executeStrategyTask, isOpenManusAvailable } from './openmanusService';
import { useOpenManusStrategy } from '../config/featureFlags';
import { buildOpenManusTaskPrompt } from './openmanusMappings';

export interface StrategyRequest {
  userMessage: string;
  username: string;
  brandDNA?: any;
  competitorIntelligence?: any[];
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface StrategyResponse {
  suggestions: string[];
  contentIdeas?: Array<{
    suggestion: string;
    contentIdea: {
      title: string;
      description: string;
      platform: string;
      format: string;
    } | null;
  }>;
  analysis?: string;
}

/**
 * Generate marketing suggestions using OpenManus
 */
export async function generateOpenManusSuggestions(
  request: StrategyRequest
): Promise<StrategyResponse> {
  // Check if OpenManus is enabled and available
  if (!useOpenManusStrategy()) {
    throw new Error('OpenManus strategy is not enabled. Set USE_OPENMANUS_STRATEGY=true');
  }

  const available = await isOpenManusAvailable();
  if (!available) {
    throw new Error('OpenManus service is not available. Please ensure it is running.');
  }

  try {
    // Build strategy task prompt
    const taskPrompt = buildStrategyTaskPrompt(request);

    // Execute strategy task
    const response = await executeStrategyTask(taskPrompt, {
      username: request.username,
      brandDNA: request.brandDNA,
      competitorIntelligence: request.competitorIntelligence,
      conversationHistory: request.conversationHistory,
    });

    if (!response.success) {
      throw new Error(response.error || 'OpenManus strategy generation failed');
    }

    // Parse and return strategy results
    const result = parseStrategyResult(response.result || '', request);

    return result;
  } catch (error: any) {
    console.error('[OpenManus Strategy] Error:', error);
    throw error;
  }
}

/**
 * Build strategy task prompt for OpenManus
 */
function buildStrategyTaskPrompt(request: StrategyRequest): string {
  const { userMessage, username, brandDNA, competitorIntelligence, conversationHistory } = request;

  let prompt = `Generate proactive marketing suggestions for ${username} based on the following:

USER REQUEST: "${userMessage}"

`;

  if (brandDNA) {
    prompt += `BRAND DNA:
- Archetype: ${brandDNA.archetype || 'Not specified'}
- Industry: ${brandDNA.industry || 'Not specified'}
- Themes: ${(brandDNA.themes || brandDNA.corePillars || []).join(', ') || 'Not specified'}
- Voice: ${JSON.stringify(brandDNA.voice || {}, null, 2)}

`;
  }

  if (competitorIntelligence && competitorIntelligence.length > 0) {
    prompt += `COMPETITORS:
${competitorIntelligence.map((c: any) => `- ${c.name}: ${c.theirAdvantage || c.primaryVector || ''}`).join('\n')}

`;
  }

  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `RECENT CONVERSATION:
${conversationHistory.slice(-5).map((m: any) => `${m.role}: ${m.content}`).join('\n')}

`;
  }

  prompt += `REQUIREMENTS:
- Generate 2-3 VERY short suggestions (max 60 characters each)
- Write like a real person - casual, direct, no corporate speak
- No formal language, no "I recommend" or "Consider implementing"
- Just quick, practical ideas that sound natural
- Sound human, not like a marketing report

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "suggestions": ["short idea 1", "short idea 2"],
  "contentIdeas": [],
  "analysis": ""
}`;

  return prompt;
}

/**
 * Parse strategy result from OpenManus response
 */
function parseStrategyResult(resultText: string, request: StrategyRequest): StrategyResponse {
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
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : [],
      contentIdeas: Array.isArray(parsed.contentIdeas) ? parsed.contentIdeas : [],
      analysis: parsed.analysis || '',
    };
  } catch (error: any) {
    console.warn('[OpenManus Strategy] Failed to parse JSON result, creating fallback structure');
    
    // Return a basic structure if parsing fails
    return {
      suggestions: [resultText.substring(0, 200)],
      contentIdeas: [],
      analysis: resultText.substring(0, 500),
    };
  }
}

/**
 * Check if OpenManus strategy should be used (feature flag + availability)
 */
export async function shouldUseOpenManusStrategy(): Promise<boolean> {
  if (!useOpenManusStrategy()) {
    return false;
  }

  return await isOpenManusAvailable();
}
