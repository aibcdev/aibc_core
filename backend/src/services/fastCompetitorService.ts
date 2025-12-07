/**
 * Fast Competitor Discovery Service
 * Optimized for sub-5-second competitor identification
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export interface CompetitorCandidate {
  domain: string;
  name: string;
  similarityScore: number;
  industry: string;
  description: string;
  logoUrl?: string;
  socialProfiles?: {
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
}

interface CompetitorCache {
  competitors: CompetitorCandidate[];
  cachedAt: Date;
  expiresAt: Date;
}

// Simple in-memory cache (replace with Redis/Firestore in production)
const competitorCache = new Map<string, CompetitorCache>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Extract domain from URL or username
 */
function extractDomain(input: string): string {
  // If it's already a domain/URL
  if (input.includes('.')) {
    try {
      const url = new URL(input.startsWith('http') ? input : `https://${input}`);
      return url.hostname.replace('www.', '');
    } catch {
      // If URL parsing fails, assume it's a domain
      return input.replace('www.', '').replace(/^https?:\/\//, '').split('/')[0];
    }
  }
  // If it's a username, we'll need to discover the domain
  return input;
}

/**
 * Fast competitor discovery - optimized for speed
 */
export async function discoverCompetitorsFast(
  brandInput: string, // URL, domain, or username
  brandDNA?: any,
  maxCompetitors: number = 5
): Promise<CompetitorCandidate[]> {
  const domain = extractDomain(brandInput);
  
  // Check cache first
  const cached = competitorCache.get(domain);
  if (cached && cached.expiresAt > new Date()) {
    console.log(`[FastCompetitor] Using cached competitors for ${domain}`);
    return cached.competitors.slice(0, maxCompetitors);
  }
  
  console.log(`[FastCompetitor] Discovering competitors for ${domain}...`);
  const startTime = Date.now();
  
  if (!genAI) {
    // Fallback: return empty array if no API key
    return [];
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Flash for speed
    
    // Single optimized prompt for fast discovery
    const prompt = `You are a competitive intelligence expert. Analyze ${domain} and identify the ${maxCompetitors} closest competitors.

COMPETITOR SELECTION CRITERIA (in order of importance):
1. WHAT they offer - Same or very similar products/services
2. HOW they offer it - Similar business model, pricing, distribution
3. TRACTION - Similar or higher market presence (not tiny startups)
4. TARGET AUDENCY - Same customer segment
5. POSITIONING - Similar brand positioning and messaging

${brandDNA ? `
Brand Context for ${domain}:
- Industry: ${brandDNA.industry || 'unknown'}
- Core themes: ${brandDNA.themes?.join(', ') || 'N/A'}
- Voice: ${brandDNA.voice || 'N/A'}
- Pillars: ${brandDNA.corePillars?.join(', ') || 'N/A'}
` : ''}

IMPORTANT: 
- Only include real, established companies (check they actually exist)
- Focus on direct competitors, not indirect
- Prioritize companies with similar market presence
- Exclude the brand itself

Return JSON array only, no markdown, no explanations:
[
  {
    "domain": "competitor1.com",
    "name": "Competitor One",
    "similarityScore": 0.85,
    "industry": "Industry name",
    "description": "Brief 1-sentence description"
  }
]`;

    // Use streaming for faster response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const competitors: CompetitorCandidate[] = JSON.parse(jsonMatch[0]);
      
      // Validate and clean
      const validated = competitors
        .filter(c => c.domain && c.name && c.domain !== domain)
        .slice(0, maxCompetitors);
      
      // Cache results
      competitorCache.set(domain, {
        competitors: validated,
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + CACHE_TTL)
      });
      
      const duration = Date.now() - startTime;
      console.log(`[FastCompetitor] Found ${validated.length} competitors in ${duration}ms`);
      
      return validated;
    }
    
    throw new Error('Failed to parse competitor JSON');
  } catch (error: any) {
    console.error('[FastCompetitor] Error:', error.message);
    return [];
  }
}

/**
 * Extract basic competitor data quickly (parallel operations)
 */
export async function extractCompetitorDataFast(
  competitorDomain: string
): Promise<Partial<CompetitorCandidate>> {
  // For MVP, return basic structure
  // In production, this would:
  // - Scrape homepage in parallel
  // - Extract social profiles
  // - Get domain metadata
  // - All in parallel for speed
  
  return {
    domain: competitorDomain,
    name: competitorDomain.split('.')[0],
    similarityScore: 0.8,
    industry: 'Technology',
    description: `${competitorDomain} competitor`
  };
}

/**
 * Get cached competitors if available
 */
export function getCachedCompetitors(domain: string): CompetitorCandidate[] | null {
  const cached = competitorCache.get(domain);
  if (cached && cached.expiresAt > new Date()) {
    return cached.competitors;
  }
  return null;
}

/**
 * Clear cache for a domain
 */
export function clearCompetitorCache(domain: string): void {
  competitorCache.delete(domain);
}

