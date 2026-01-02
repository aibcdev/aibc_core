/**
 * OpenManus Scan Service
 * Footprint scanning using OpenManus agents
 */

import { executeScanTask, isOpenManusAvailable } from './openmanusService';
import { useOpenManusScan } from '../config/featureFlags';
import { buildOpenManusTaskPrompt, getMaxSteps } from './openmanusMappings';

export interface ScanRequest {
  scanId: string;
  username: string;
  platforms: string[];
  scanType: string;
  connectedAccounts?: Record<string, string>;
}

export interface ScanResult {
  extractedContent: {
    profile: any;
    posts: any[];
    content_themes: string[];
    extraction_confidence: number;
    brand_voice?: any;
  };
  brandDNA: {
    archetype?: string;
    voice?: any;
    themes?: string[];
    industry?: string;
    niche?: string;
  };
  competitorIntelligence?: any[];
  brandIdentity?: {
    name: string;
    industry: string;
    description: string;
    competitors: string[];
    socialHandles: Record<string, string>;
    niche: string;
  };
}

/**
 * Execute footprint scan using OpenManus
 */
export async function executeOpenManusScan(request: ScanRequest): Promise<ScanResult> {
  // Check if OpenManus is enabled and available
  if (!useOpenManusScan()) {
    throw new Error('OpenManus scan is not enabled. Set USE_OPENMANUS_SCAN=true');
  }

  const available = await isOpenManusAvailable();
  if (!available) {
    throw new Error('OpenManus service is not available. Please ensure it is running.');
  }

  try {
    // Build comprehensive scan task prompt
    const taskPrompt = buildScanTaskPrompt(request);
    
    // Execute scan task
    const response = await executeScanTask(taskPrompt, {
      scanId: request.scanId,
      username: request.username,
      platforms: request.platforms,
      scanType: request.scanType,
      connectedAccounts: request.connectedAccounts,
    });

    if (!response.success) {
      throw new Error(response.error || 'OpenManus scan failed');
    }

    // Parse and return scan results
    // Note: OpenManus returns text, so we may need to extract JSON from the result
    const result = parseScanResult(response.result || '', request);

    return result;
  } catch (error: any) {
    console.error('[OpenManus Scan] Error:', error);
    throw error;
  }
}

/**
 * Build comprehensive scan task prompt for OpenManus
 */
function buildScanTaskPrompt(request: ScanRequest): string {
  const { username, platforms, scanType, connectedAccounts } = request;

  let prompt = `Perform a comprehensive digital footprint scan for: ${username}

REQUIREMENTS:
1. Discover and analyze social media profiles on: ${platforms.join(', ')}
2. Extract brand identity: name, industry, description, niche, competitors
3. Collect content: posts, bio, themes, voice characteristics
4. Analyze brand DNA: archetype, voice style, core themes
5. Identify competitors and their positioning

`;

  if (connectedAccounts && Object.keys(connectedAccounts).length > 0) {
    prompt += `CONNECTED ACCOUNTS:\n${JSON.stringify(connectedAccounts, null, 2)}\n\n`;
  }

  prompt += `SCAN TYPE: ${scanType}
${scanType === 'deep' ? 'Perform deep analysis with historical data and comprehensive competitor research.' : 'Perform standard analysis with current content.'}

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "extractedContent": {
    "profile": { "bio": "...", "name": "...", ... },
    "posts": [{ "content": "...", "platform": "...", ... }],
    "content_themes": ["theme1", "theme2", ...],
    "extraction_confidence": 0.0-1.0,
    "brand_voice": { "tone": "...", "style": "...", ... }
  },
  "brandDNA": {
    "archetype": "...",
    "voice": { ... },
    "themes": ["..."],
    "industry": "...",
    "niche": "..."
  },
  "competitorIntelligence": [
    { "name": "...", "threatLevel": "...", ... }
  ],
  "brandIdentity": {
    "name": "...",
    "industry": "...",
    "description": "...",
    "competitors": ["..."],
    "socialHandles": { "twitter": "...", ... },
    "niche": "..."
  }
}

Use browser automation to visit actual social profiles and extract real content.`;

  return prompt;
}

/**
 * Parse scan result from OpenManus response
 */
function parseScanResult(resultText: string, request: ScanRequest): ScanResult {
  try {
    // Try to extract JSON from the result text
    // OpenManus may wrap JSON in markdown code blocks or plain text
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
      extractedContent: {
        profile: parsed.extractedContent?.profile || {},
        posts: parsed.extractedContent?.posts || [],
        content_themes: parsed.extractedContent?.content_themes || [],
        extraction_confidence: parsed.extractedContent?.extraction_confidence || 0.7,
        brand_voice: parsed.extractedContent?.brand_voice,
      },
      brandDNA: {
        archetype: parsed.brandDNA?.archetype,
        voice: parsed.brandDNA?.voice,
        themes: parsed.brandDNA?.themes || [],
        industry: parsed.brandDNA?.industry,
        niche: parsed.brandDNA?.niche,
      },
      competitorIntelligence: parsed.competitorIntelligence || [],
      brandIdentity: parsed.brandIdentity || {
        name: request.username,
        industry: parsed.brandDNA?.industry || '',
        description: parsed.extractedContent?.profile?.bio || '',
        competitors: parsed.competitorIntelligence?.map((c: any) => c.name) || [],
        socialHandles: {},
        niche: parsed.brandDNA?.niche || '',
      },
    };
  } catch (error: any) {
    console.warn('[OpenManus Scan] Failed to parse JSON result, creating fallback structure');
    
    // Return a basic structure if parsing fails
    return {
      extractedContent: {
        profile: { bio: resultText.substring(0, 500) },
        posts: [],
        content_themes: [],
        extraction_confidence: 0.5,
      },
      brandDNA: {
        themes: [],
      },
      competitorIntelligence: [],
      brandIdentity: {
        name: request.username,
        industry: '',
        description: resultText.substring(0, 200),
        competitors: [],
        socialHandles: {},
        niche: '',
      },
    };
  }
}

/**
 * Check if OpenManus scan should be used (feature flag + availability)
 */
export async function shouldUseOpenManusScan(): Promise<boolean> {
  if (!useOpenManusScan()) {
    return false;
  }

  return await isOpenManusAvailable();
}
