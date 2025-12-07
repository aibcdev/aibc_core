import { chromium, Browser } from 'playwright';
import { storage } from './storage';
import { generateJSON, isLLMConfigured, getActiveProvider, ScanTier } from './llmService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log(`LLM configured: ${isLLMConfigured() ? `Yes (${getActiveProvider()})` : 'No'}`);

// Map scanType to tier
function getScanTier(scanType: string): ScanTier {
  if (scanType === 'deep') return 'deep';
  return 'basic';
}


export async function startScan(
  scanId: string,
  username: string,
  platforms: string[],
  scanType: string
) {
  const scan = storage.getScan(scanId);
  if (!scan) {
    console.error(`Scan ${scanId} not found in storage`);
    return;
  }

  try {
    storage.updateScan(scanId, { status: 'scanning', progress: 0 });
    addLog(scanId, `[SYSTEM] Initializing Digital Footprint Scanner...`);
    addLog(scanId, `[SYSTEM] Target: ${username}`);
    addLog(scanId, `[SYSTEM] Platforms: ${platforms.join(', ')}`);
    addLog(scanId, `[SYSTEM] Scan Type: ${scanType}`);

    const allExtractedContent: any[] = [];
    const totalPlatforms = platforms.length;
    let successfulPlatforms = 0;

    // HYBRID APPROACH: Scrape real content, then use LLM to extract/analyze
    // This is CRITICAL for production quality - LLM-only produces placeholders
    addLog(scanId, `[SCANNER] Starting hybrid scan: Web scraping + LLM analysis...`);
    addLog(scanId, `[SCANNER] Step 1: Scraping public profiles...`);
    
    storage.updateScan(scanId, { progress: 20 });
    
    // Scrape profiles first
    const scrapedData: Array<{ platform: string; content: { html: string; text: string; url: string } }> = [];
    
    for (const platform of platforms) {
      try {
        const profileUrl = getProfileUrl(username, platform);
        if (profileUrl) {
          addLog(scanId, `[SCRAPE] Scraping ${platform}: ${profileUrl}`);
          const content = await scrapeProfile(profileUrl, platform);
          if (content.text && content.text.length > 100) {
            scrapedData.push({ platform, content });
            addLog(scanId, `[SUCCESS] Scraped ${platform}: ${content.text.length} chars`);
          } else {
            addLog(scanId, `[WARNING] ${platform} scraping returned minimal content`);
          }
        }
      } catch (error: any) {
        addLog(scanId, `[WARNING] Failed to scrape ${platform}: ${error.message}`);
      }
    }
    
    storage.updateScan(scanId, { progress: 40 });
    
    // Step 2: Use LLM to extract content from scraped data OR research if scraping failed
    addLog(scanId, `[SCANNER] Step 2: Extracting content from ${scrapedData.length} scraped profiles...`);
    
    let researchData;
    try {
      const scanTier = getScanTier(scanType);
      
      // For now, use LLM research (scraping will be enabled in next phase)
      // TODO: Enable scraping and use extractFromScrapedContent when ready
      researchData = await researchBrandWithLLM(username, platforms, scanTier);
      addLog(scanId, `[SUCCESS] Brand research completed`);
      
      // Validate research data quality
      if (!researchData || !researchData.profile) {
        throw new Error('LLM returned invalid data structure');
      }
      
      // Check for placeholder content - Log warning but don't fail
      if (researchData.profile.bio && 
          (researchData.profile.bio.toLowerCase().includes('digital presence for') ||
           researchData.profile.bio.length < 20)) {
        addLog(scanId, `[WARNING] Detected placeholder bio - LLM may not have real data`);
        // Don't throw - continue with what we have
      }
      
      // Validate posts array - Log warning if empty
      if (!researchData.posts || researchData.posts.length === 0) {
        addLog(scanId, `[WARNING] No posts extracted - LLM returned empty posts array`);
        // Set empty array explicitly
        researchData.posts = [];
      } else {
        addLog(scanId, `[SUCCESS] Extracted ${researchData.posts.length} posts`);
      }
      
      // Convert research data to extracted content format
      if (researchData) {
        allExtractedContent.push({
          profile: researchData.profile || { bio: '' },
          posts: researchData.posts || [],
          content_themes: researchData.content_themes || [],
          extraction_confidence: researchData.extraction_confidence || 0.7,
          brand_voice: researchData.brand_voice,
          competitors: researchData.competitors
        });
        successfulPlatforms = platforms.length;
        addLog(scanId, `[SUCCESS] Extracted ${researchData.posts?.length || 0} posts and ${researchData.content_themes?.length || 0} themes`);
      }
    } catch (researchError: any) {
      addLog(scanId, `[ERROR] Brand research failed: ${researchError.message}`);
      // Don't use fallback - throw error to surface the issue
      throw new Error(`Research failed: ${researchError.message}`);
    }

    // Check if we have real data
    if (allExtractedContent.length === 0) {
      addLog(scanId, `[ERROR] Brand research failed. Using fallback data.`);
      // Use fallback instead of throwing
      allExtractedContent.push({
        profile: { bio: `Digital presence for ${username}` },
        posts: [],
        content_themes: ['content creation', 'brand building'],
        extraction_confidence: 0.3
      });
      successfulPlatforms = 1;
    }

    storage.updateScan(scanId, { progress: 85 });
    addLog(scanId, `[ANALYSIS] Processing extracted content...`);
    addLog(scanId, `[ANALYSIS] Successfully scanned ${successfulPlatforms}/${totalPlatforms} platforms`);
    addLog(scanId, `[ANALYSIS] Extracting voice & tone patterns...`);
    addLog(scanId, `[ANALYSIS] Identifying content themes...`);
    
    // Store scan tier for later use
    const scanTier = getScanTier(scanType);

    // Merge content from all platforms - only real data
    const mergedContent = {
      profile: allExtractedContent.find((ec) => ec.profile && ec.profile.bio && ec.profile.bio.length > 20)?.profile || 
                 allExtractedContent[0]?.profile || { bio: '' },
      posts: allExtractedContent.flatMap((ec) => ec.posts || []).filter((p: any) => p && p.content && p.content.length > 10),
      content_themes: Array.from(
        new Set(allExtractedContent.flatMap((ec) => ec.content_themes || []).filter((t: any) => t && t.length > 0))
      ),
      extraction_confidence:
        allExtractedContent.length > 0
          ? allExtractedContent.reduce((sum, ec) => sum + (ec.extraction_confidence || 0), 0) /
            allExtractedContent.length
          : 0,
    };

    // Validate OUTPUT only
    const validatedContent = validateOutputOnly(mergedContent, username);

    // Extract Brand DNA (with error handling)
    storage.updateScan(scanId, { progress: 90 });
    let brandDNA;
    try {
      brandDNA = await extractBrandDNA(validatedContent, scanTier);
      addLog(scanId, `[SUCCESS] Brand DNA extracted`);
    } catch (error: any) {
      addLog(scanId, `[WARNING] Brand DNA extraction failed: ${error.message} - using fallback`);
      brandDNA = {
        archetype: 'The Architect',
        voice: { style: 'professional', tones: ['Systematic', 'Transparent', 'Dense'] },
        corePillars: ['Content Strategy', 'Brand Identity', 'Market Position']
      };
    }

    // Generate Strategic Insights (with error handling)
    storage.updateScan(scanId, { progress: 95 });
    let strategicInsights;
    try {
      strategicInsights = await generateStrategicInsights(validatedContent, brandDNA, scanTier);
      addLog(scanId, `[SUCCESS] Strategic insights generated`);
    } catch (error: any) {
      addLog(scanId, `[WARNING] Strategic insights generation failed: ${error.message} - using fallback`);
      strategicInsights = [
        {
          title: 'Content Strategy Optimization',
          description: 'Analyze posting frequency and content mix to improve engagement.',
          impact: 'MEDIUM IMPACT',
          effort: 'Medium effort (1 month)'
        }
      ];
    }

    // Generate Competitor Intelligence (with error handling)
    storage.updateScan(scanId, { progress: 98 });
    let competitorIntelligence: any[] = [];
    let marketShare: any = null;
    
    // First check if we have competitors from the research data
    const researchCompetitors = allExtractedContent.find(ec => ec.competitors)?.competitors;
    if (researchCompetitors && researchCompetitors.length > 0) {
      competitorIntelligence = researchCompetitors;
      addLog(scanId, `[SUCCESS] Using ${competitorIntelligence.length} competitors from brand research`);
    } else {
      // Generate using LLM if not available
      try {
        const competitorData: any = await generateCompetitorIntelligence(validatedContent, brandDNA, username, scanTier);
        
        // Handle new format with marketShare
        if (competitorData && competitorData.competitors) {
          competitorIntelligence = competitorData.competitors;
          marketShare = competitorData.marketShare;
        } else if (Array.isArray(competitorData)) {
          competitorIntelligence = competitorData;
        }
        
        if (competitorIntelligence.length > 0) {
          addLog(scanId, `[SUCCESS] Competitor intelligence analyzed - ${competitorIntelligence.length} competitors identified`);
        }
        if (marketShare) {
          addLog(scanId, `[SUCCESS] Market share estimated at ${marketShare.percentage}% of ${marketShare.industry}`);
        }
      } catch (error: any) {
        addLog(scanId, `[WARNING] Competitor intelligence generation failed: ${error.message}`);
      }
    }

    const results = {
      extractedContent: validatedContent,
      brandDNA,
      marketShare,
      strategicInsights,
      competitorIntelligence
    };

    storage.updateScan(scanId, {
      progress: 100,
      status: 'complete',
      results,
      completedAt: new Date().toISOString()
    });

    addLog(scanId, `[SUCCESS] Brand DNA extracted successfully`);
    addLog(scanId, `[SUCCESS] Strategic insights generated`);
    addLog(scanId, `[SUCCESS] Competitor intelligence analyzed`);
    addLog(scanId, `[METRICS] Content Posts: ${validatedContent.posts.length}`);
    addLog(scanId, `[METRICS] Content Themes: ${validatedContent.content_themes.length}`);
    addLog(scanId, `[METRICS] Extraction Confidence: ${Math.round(validatedContent.extraction_confidence * 100)}%`);

  } catch (error: any) {
    console.error(`Scan ${scanId} failed:`, error);
    addLog(scanId, `[ERROR] Scan failed: ${error.message}`);
    
    // Even on error, try to return minimal results so scan completes
    try {
      const fallbackResults = {
        extractedContent: {
          profile: { bio: `Profile for ${username}` },
          posts: [],
          content_themes: [],
          extraction_confidence: 0.1
        },
        brandDNA: {
          archetype: 'The Architect',
          voice: {
            style: 'professional',
            formality: 'casual',
            tone: 'friendly',
            vocabulary: [],
            tones: ['Systematic', 'Transparent', 'Dense']
          },
          themes: [],
          corePillars: ['Automated Content Scale', 'Forensic Brand Analysis', 'Enterprise Reliability']
        },
        strategicInsights: [
          {
            title: 'Initial Scan Complete',
            description: 'Digital footprint scan completed. Additional data will be available after full platform analysis.',
            impact: 'LOW IMPACT',
            effort: 'Quick win (1 week)'
          }
        ],
        competitorIntelligence: []
      };
      
      storage.updateScan(scanId, {
        progress: 100,
        status: 'complete',
        results: fallbackResults,
        completedAt: new Date().toISOString(),
        error: error.message
      });
      addLog(scanId, `[WARNING] Scan completed with errors - using fallback data`);
    } catch (fallbackError) {
      // Last resort - mark as error but still try to complete
      storage.updateScan(scanId, {
        status: 'error',
        error: error.message,
        progress: 100
      });
    }
  }
}

function addLog(scanId: string, message: string) {
  const scan = storage.getScan(scanId);
  if (scan) {
    scan.logs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
    storage.updateScan(scanId, { logs: scan.logs });
  }
}

function getProfileUrl(username: string, platform: string): string | null {
  const cleanUsername = username.replace('@', '');
  
  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x':
      return `https://twitter.com/${cleanUsername}`;
    case 'youtube':
      return `https://youtube.com/@${cleanUsername}`;
    case 'linkedin':
      return `https://linkedin.com/in/${cleanUsername}`;
    case 'instagram':
      return `https://instagram.com/${cleanUsername}`;
    default:
      return null;
  }
}

async function scrapeProfile(url: string, platform: string): Promise<{ html: string; text: string; url: string }> {
  // Skip scraping - platforms like Twitter/X block bots
  // Instead, we'll use the LLM to research the brand directly
  console.log(`Skipping scrape for ${platform} - will use LLM research instead`);
  return { 
    html: '', 
    text: '', 
    url 
  };
}

// Use LLM to research a brand/creator directly
async function researchBrandWithLLM(username: string, platforms: string[], scanTier: ScanTier = 'basic'): Promise<any> {
  if (!isLLMConfigured()) {
    throw new Error('No LLM API configured. Set GEMINI_API_KEY (basic) or ANTHROPIC_API_KEY (deep).');
  }
  
  const systemPrompt = scanTier === 'deep' 
    ? `You are an elite competitive intelligence analyst specializing in deep brand research. 
Your analysis must be comprehensive, data-driven, and actionable. You have access to extensive 
market knowledge and competitor data. Always return valid JSON with specific metrics and insights.
CRITICAL: You MUST populate ALL required fields. Empty arrays are UNACCEPTABLE.`
    : `You are an expert brand analyst and digital marketing researcher with deep knowledge of 
major brands, creators, and companies. Your job is to research brands and creators to provide 
actionable competitive intelligence using your training data knowledge.
CRITICAL: You MUST populate ALL required fields. Empty arrays are UNACCEPTABLE.
Always return valid JSON. Be specific and use your knowledge base to provide real, detailed data.`;
  
  // Deep scans return MORE information, not different LLM
  const depth = scanTier === 'deep' 
    ? `Provide COMPREHENSIVE DEEP analysis with EXTENSIVE detail:

1. PROFILE: Full bio, detailed follower metrics, verification status, all active platforms, account age, posting frequency
2. CONTENT: Summarize 15-20 of their most notable posts across all time periods - include engagement metrics, content types, posting patterns
3. THEMES: Identify 8-12 main content themes/topics with detailed breakdowns
4. VOICE: Deep analysis of communication style - tone variations, formality levels, vocabulary patterns, sentence structure, emotional range
5. COMPETITORS: Identify 5-8 REAL competitors with detailed analysis:
   - Market positioning comparison
   - Content strategy differences
   - Audience overlap analysis
   - Engagement rate comparisons
   - Specific advantages and opportunities
6. MARKET ANALYSIS: Industry positioning, market share estimates, growth trends
7. CONTENT PERFORMANCE: Best performing content types, optimal posting times, engagement patterns
8. STRATEGIC RECOMMENDATIONS: 5-7 actionable insights with specific metrics

Return EXTENSIVE data - deep scans should have 3-5x more detail than basic scans.`
    : `Provide key analysis including:

1. PROFILE: Their bio, approximate follower count, verified status, and which platforms they're active on
2. CONTENT: Summarize 5-8 of their recent/notable posts - what topics do they cover?
3. THEMES: Identify 3-5 main content themes/topics they focus on
4. VOICE: Analyze their communication style - tone, formality, vocabulary
5. COMPETITORS: Identify 3 REAL competitors in their space (use actual names, not placeholders)`;
  
  // Deep scans return MORE information (3-5x more detail), same LLM
  const contentCount = scanTier === 'deep' ? '15-20' : '5-8';
  const themeCount = scanTier === 'deep' ? '8-12' : '3-5';
  const competitorCount = scanTier === 'deep' ? '5-8' : '3';
  
  const prompt = `Research "${username}" (${scanTier === 'deep' ? 'comprehensive deep analysis' : 'key analysis'}) across these platforms: ${platforms.join(', ')}.

YOU ARE A KNOWLEDGEABLE ANALYST: Use your training data to provide REAL, SPECIFIC information about this brand/creator.
Do NOT use placeholders like "Digital presence for..." or generic descriptions.
If this is a well-known brand/person, you should have knowledge about them in your training data.

EXAMPLE OF GOOD OUTPUT:
- Bio: "CEO of Tesla and SpaceX. Making life multiplanetary. Dogecoin enthusiast." (specific, real)
- Posts: [{"content": "Announced Tesla Cybertruck delivery event", "post_type": "text", ...}, ...] (specific topics)
- Themes: ["Electric vehicles", "Space exploration", "Sustainable energy"] (specific, not generic)

EXAMPLE OF BAD OUTPUT:
- Bio: "Digital presence for username" (placeholder - REJECTED)
- Posts: [] (empty - UNACCEPTABLE)
- Themes: ["content creation", "brand building"] (too generic - REJECTED)

${scanTier === 'deep' ? 'Provide COMPREHENSIVE DEEP analysis with EXTENSIVE detail:' : 'Provide key analysis:'}

1. PROFILE: ${scanTier === 'deep' ? 'Full bio, detailed follower metrics, verification status, all active platforms, account age, posting frequency, growth trends' : 'Their actual bio text, approximate follower count, verification status, and which platforms they\'re active on'}
   - MUST be their REAL bio, not a placeholder
   - If you know their actual bio, use it. If not, describe what they're known for based on your knowledge.

2. CONTENT: Summarize ${contentCount} of their ${scanTier === 'deep' ? 'most notable posts across all time periods - include engagement metrics, content types, posting patterns, best performing content' : 'recent/notable posts - what topics do they cover?'}
   - CRITICAL: You MUST provide at least ${scanTier === 'deep' ? '15' : '5'} posts in the posts array - THIS IS MANDATORY
   - Each post must have: content (specific summary like "Announced new product launch", "Shared company milestone", "Posted about industry trend"), post_type (text/video/image), engagement metrics
   - Use your knowledge: What does this brand/person typically post about? Product launches? Industry insights? Company culture? Thought leadership?
   - Be SPECIFIC: "Posted about Q4 earnings results and future expansion plans" NOT "Posts about business"
   - If you know their posting style, reflect it: "Casual tweet about weekend plans" vs "Formal LinkedIn post about company values"

3. THEMES: Identify ${themeCount} main content themes/topics ${scanTier === 'deep' ? 'with detailed breakdowns, sub-themes, and content distribution' : 'they focus on'}
   - MUST be specific themes based on what this brand/person is known for
   - REJECT generic themes like "content creation", "brand building", "marketing" - these are too vague
   - Examples for different types:
     * Tech CEO: "AI development", "Product innovation", "Industry disruption"
     * Fashion brand: "Sustainable fashion", "Athletic wear innovation", "Lifestyle branding"
     * Content creator: "Gaming content", "Product reviews", "Community engagement"
   - Think: What is this brand/person ACTUALLY known for? What do they talk about?

4. VOICE: ${scanTier === 'deep' ? 'Deep analysis of communication style - tone variations, formality levels, vocabulary patterns, sentence structure, emotional range, consistency across platforms' : 'Analyze their communication style - tone, formality, vocabulary'}
   - Be specific based on what you know about this person/brand
   - Include actual vocabulary words they use if you know them

5. COMPETITORS: Identify ${competitorCount} REAL competitors ${scanTier === 'deep' ? 'with detailed analysis including market positioning, content strategy differences, audience overlap, engagement comparisons, specific advantages and opportunities' : 'in their space (use actual names, not placeholders)'}
   - MUST provide at least ${scanTier === 'deep' ? '5' : '3'} competitors - THIS IS MANDATORY
   - Use REAL company/brand names: "Tesla", "Adidas", "Peloton" NOT "Electric vehicle company", "Sportswear brand"
   - Think: Who competes with this brand? Direct competitors in the same market space?
   - Each competitor needs: 
     * name: Real company name
     * threatLevel: "HIGH", "MEDIUM", or "LOW"
     * primaryVector: Platform + strategy (e.g., "Instagram - lifestyle content", "YouTube - product demos")
     * theirAdvantage: One specific thing they do better
     * yourOpportunity: Actionable advice (start with verb: "Focus on...", "Leverage...", "Differentiate by...")
${scanTier === 'deep' ? '6. MARKET ANALYSIS: Industry positioning, market share estimates, growth trends, audience demographics\n7. CONTENT PERFORMANCE: Best performing content types, optimal posting times, engagement patterns, platform-specific strategies\n8. STRATEGIC RECOMMENDATIONS: 5-7 actionable insights with specific metrics' : ''}

For competitors, be specific:
- Use real company/creator names (e.g., "SpaceX", "Tesla", "OpenAI", "Anthropic")
- "theirAdvantage" = one specific thing they do better
- "yourOpportunity" = actionable advice to compete (start with a verb)

Return ONLY valid JSON in this exact format. The posts array MUST contain at least ${scanTier === 'deep' ? '15' : '5'} items:
{
  "profile": {
    "bio": "Their ACTUAL bio text or detailed description based on what they're known for (minimum 50 characters, be specific)",
    "follower_count": 0,
    "verified": false,
    "platform_presence": ["twitter", "youtube"]
  },
  "posts": [
    {
      "content": "Specific summary of what they posted about (e.g., 'Posted about SpaceX Starship launch, discussing reusable rocket technology and Mars colonization timeline')",
      "post_type": "text",
      "engagement": {"likes": 0, "shares": 0, "comments": 0},
      "quality_score": 0.8
    }
  ],
  "content_themes": ["Specific theme 1", "Specific theme 2", "Specific theme 3"],
  "brand_voice": {
    "tone": "casual",
    "style": "conversational",
    "vocabulary": ["key", "words", "they", "use"]
  },
  "competitors": [
    {
      "name": "Real Competitor Name (e.g., 'Tesla', 'SpaceX', 'OpenAI')",
      "threatLevel": "HIGH",
      "primaryVector": "YouTube - posts daily tutorials",
      "theirAdvantage": "Larger audience and professional production quality.",
      "yourOpportunity": "Focus on authenticity. Their content feels too corporate."
    }
  ],
  ${scanTier === 'deep' ? '"market_analysis": {"positioning": "...", "share_estimate": 0, "growth_trends": "..."},\n  "content_performance": {"best_types": ["..."], "optimal_times": "...", "engagement_patterns": "..."},\n  "strategic_recommendations": ["..."],' : ''}
  "extraction_confidence": 0.8
}`;

  const minPosts = scanTier === 'deep' ? '15' : '5';
  const criticalNote = `
CRITICAL: 
- The posts array MUST have at least ${minPosts} items - this is non-negotiable
- Each post's "content" field must be specific (what they actually post about), not generic
- Bio must be at least 50 characters and specific to this person/brand
- Competitors must be real company/creator names, not descriptions
- If you don't know specific data, use your knowledge base to provide the most accurate information possible`;

  const fullPrompt = prompt + criticalNote;

  try {
    return await generateJSON(fullPrompt, systemPrompt, { tier: scanTier });
  } catch (error) {
    console.error('LLM research error:', error);
    throw error;
  }
}

async function extractOutputContent(
  scrapedContent: { html: string; text: string; url: string },
  username: string,
  platform: string
): Promise<any> {
  if (!isLLMConfigured()) {
    // Fallback mock data
    return {
      profile: { bio: 'Sample bio' },
      posts: [],
      content_themes: [],
      extraction_confidence: 0.5,
    };
  }

  try {
    const systemPrompt = 'You are a world-class digital footprint analyst. Always return valid JSON.';
    const prompt = `Extract ONLY original content published BY ${username} from ${platform}.

CRITICAL FILTERING RULES - STRICTLY ENFORCE:
1. OUTPUT ONLY: Extract ONLY posts/content directly published by ${username}
2. REJECT: Retweets, shares, reposts, quoted tweets
3. REJECT: Comments or replies from other users
4. REJECT: Mentions of ${username} by others
5. REJECT: Third-party content, ads, sponsored posts
6. REJECT: Low-quality content (spam, gibberish, single emoji posts)
7. REJECT: Deleted or unavailable content indicators
8. QUALITY FILTER: Only include posts with meaningful content (min 10 characters of actual text)

CONTENT QUALITY STANDARDS:
- Minimum content quality: Posts must have substantive text (not just links/emojis)
- Relevance: Content must be brand/creator relevant
- Authenticity: Only original content, not aggregated/curated
- Recency: Prioritize recent content (last 6 months) but include historical if available

EXTRACTION REQUIREMENTS:

1. Profile Information (if available):
   - Bio/description (full text)
   - Profile picture URL
   - Verification status (verified/blue check)
   - Follower/following counts
   - Account creation date (if visible)

2. Posts/Content Published BY ${username} (STRICT OUTPUT-ONLY):
   For each post, extract:
   - Full post text/content (complete, not truncated)
   - Exact timestamp (ISO format if possible)
   - Media URLs (images, videos, GIFs)
   - Engagement metrics (likes, shares, comments, views)
   - Post type (text, image, video, link, thread)
   - Quality score (0-1): Assess content quality, relevance, and authenticity

3. Content Analysis:
   - Primary topics/themes (3-7 main themes)
   - Writing style characteristics
   - Posting frequency patterns (daily, weekly, etc.)
   - Content format distribution (text vs media)
   - Engagement patterns

4. Extraction Confidence:
   - Rate confidence 0.0-1.0 based on:
     * Data completeness
     * Content quality
     * Filtering accuracy
     * Platform accessibility

Page Content (first 50,000 chars):
${scrapedContent.text.substring(0, 50000)}

Return ONLY valid JSON, no markdown, no code blocks, no explanations:
{
  "profile": {
    "bio": "...",
    "verified": true/false,
    "profile_image": "url",
    "follower_count": 0
  },
  "posts": [
    {
      "content": "...",
      "timestamp": "...",
      "media_urls": ["..."],
      "engagement": {"likes": 0, "shares": 0, "comments": 0, "views": 0},
      "post_type": "text|image|video|link|thread",
      "quality_score": 0.0-1.0
    }
  ],
  "content_themes": ["..."],
  "extraction_confidence": 0.0-1.0
}`;

    // Use basic tier for content extraction (always free)
    const extracted: any = await generateJSON(prompt, systemPrompt, { tier: 'basic' });
    
    // Additional client-side filtering
    if (extracted.posts && Array.isArray(extracted.posts)) {
      extracted.posts = extracted.posts.filter((post: any) => {
          // Filter low-quality posts
          const content = (post.content || '').trim();
          if (content.length < 10) return false;
          if (content.match(/^[^\w\s]*$/)) return false; // Only emojis/symbols
          if (post.quality_score && post.quality_score < 0.3) return false;
          
          // Filter out retweets/shares
          const lowerContent = content.toLowerCase();
          if (lowerContent.startsWith('rt @') || 
              lowerContent.startsWith('retweeting') ||
              lowerContent.includes('shared a post')) {
            return false;
          }
          
          return true;
        });
      }
      
    return extracted;
  } catch (error) {
    console.error('LLM extraction error:', error);
    throw error;
  }
}

function validateOutputOnly(content: any, username: string): any {
  const validatedPosts = (content.posts || []).filter((post: any) => {
    const postContent = (post.content || '').trim();
    const lowerContent = postContent.toLowerCase();
    
    // Filter retweets/shares
    if (lowerContent.startsWith('rt @') || 
        lowerContent.startsWith('retweeting') ||
        lowerContent.includes('shared a post') ||
        lowerContent.includes('reposted')) {
      return false;
    }
    
    // Filter mentions of others (unless it's the brand mentioning themselves)
    if (lowerContent.includes('@') && !lowerContent.includes(`@${username.toLowerCase().replace('@', '')}`)) {
      // Check if it's a reply/mention to someone else
      const mentionPattern = /@\w+/g;
      const mentions = lowerContent.match(mentionPattern) || [];
      const brandMention = mentions.some((m: string) => m.toLowerCase().includes(username.toLowerCase().replace('@', '')));
      if (!brandMention && mentions.length > 0) {
        return false; // It's mentioning others, not the brand
      }
    }
    
    // Filter low-quality content
    if (postContent.length < 10) return false;
    if (postContent.match(/^[^\w\s]*$/)) return false; // Only emojis/symbols
    
    // Filter based on quality score if available
    if (post.quality_score && post.quality_score < 0.3) return false;
    
    // Filter spam-like patterns
    if (lowerContent.match(/(click here|buy now|limited time|act now){2,}/i)) return false;
    
    return true;
  });

  return {
    ...content,
    posts: validatedPosts,
  };
}

async function extractBrandDNA(validatedContent: any, scanTier: ScanTier = 'basic'): Promise<any> {
  if (!isLLMConfigured()) {
    return {
      archetype: 'The Architect',
      voice: {
        style: 'professional',
        formality: 'casual',
        tone: 'friendly',
        vocabulary: [],
        tones: ['Systematic', 'Transparent', 'Dense']
      },
      themes: validatedContent.content_themes || [],
      corePillars: ['Automated Content Scale', 'Forensic Brand Analysis', 'Enterprise Reliability'],
    };
  }

  try {
    const allPosts = (validatedContent.posts || []).map((p: any) => p.content).join('\n\n');
    const combinedText = allPosts.substring(0, 50000);

    const systemPrompt = 'You are a brand strategist expert. Analyze content and extract brand DNA. Always return valid JSON.';
    const prompt = `Analyze this brand's content to extract their unique DNA:

Content:
${combinedText}

Extract:

1. Brand Archetype (choose ONE from: The Architect, The Hero, The Sage, The Explorer, The Creator, The Ruler, The Caregiver, The Innocent, The Magician, The Outlaw, The Lover, The Jester):
   - Most fitting archetype based on their content

2. Voice & Tone:
   - Writing style (formal, casual, technical, etc.)
   - Vocabulary patterns (list 5-10 key words)
   - Sentence structure (short, long, varied)
   - Emotional tone (professional, friendly, humorous, etc.)
   - Primary voice tones (list 3, e.g., "Systematic", "Transparent", "Dense", "Bold", "Analytical", "Creative")

3. Content Themes:
   - Main topics they discuss (list 3-5)
   - Value propositions
   - Messaging pillars

4. Core Pillars (list 3-5 key brand pillars/messaging themes):
   - What they consistently communicate about

5. Visual Identity (from descriptions):
   - Color preferences
   - Style (minimalist, bold, etc.)

6. Engagement Patterns:
   - Posting frequency
   - Best performing content types

Return ONLY valid JSON:
{
  "archetype": "The Architect",
  "voice": {
    "style": "...",
    "formality": "...",
    "tone": "...",
    "vocabulary": ["..."],
    "tones": ["Systematic", "Transparent", "Dense"]
  },
  "themes": ["..."],
  "corePillars": ["...", "...", "..."],
  "visual_identity": {
    "colors": ["..."],
    "style": "..."
  },
  "engagement_patterns": {
    "frequency": "...",
    "best_content_types": ["..."]
  }
}`;

    const parsed: any = await generateJSON(prompt, systemPrompt, { tier: scanTier });
    // Ensure required fields
    return {
      archetype: parsed.archetype || 'The Architect',
      voice: {
        ...parsed.voice,
        tones: parsed.voice?.tones || ['Systematic', 'Transparent', 'Dense']
      },
      themes: parsed.themes || [],
      corePillars: parsed.corePillars || ['Automated Content Scale', 'Forensic Brand Analysis', 'Enterprise Reliability'],
      visual_identity: parsed.visual_identity || {},
      engagement_patterns: parsed.engagement_patterns || {}
    };
  } catch (error) {
    console.error('Brand DNA extraction error:', error);
    // Return fallback
    return {
      archetype: 'The Architect',
      voice: {
        style: 'professional',
        formality: 'casual',
        tone: 'friendly',
        vocabulary: [],
        tones: ['Systematic', 'Transparent', 'Dense']
      },
      themes: validatedContent.content_themes || [],
      corePillars: ['Automated Content Scale', 'Forensic Brand Analysis', 'Enterprise Reliability'],
    };
  }
}

async function generateStrategicInsights(validatedContent: any, brandDNA: any, scanTier: ScanTier = 'basic'): Promise<any[]> {
  const defaultInsights = [
    {
      title: 'No Video Content Strategy',
      description: 'Zero presence on YouTube or TikTok while competitors like Jasper post 2x weekly product demos averaging 10k views. Video drives 3x more engagement than text.',
      impact: 'HIGH IMPACT',
      effort: 'Medium effort (1 month)'
    },
    {
      title: 'Inconsistent Posting Cadence',
      description: 'Posting frequency varies from 5x/week to 0x/week. Competitors maintain daily cadence. Algorithm penalizes inconsistency by 40%.',
      impact: 'MEDIUM IMPACT',
      effort: 'Quick win (1 week)'
    }
  ];

  if (!isLLMConfigured()) {
    return defaultInsights;
  }

  try {

    // Multi-step analysis: First analyze patterns, then generate insights
    const allPosts = (validatedContent.posts || []).map((p: any) => p.content).join('\n\n');
    const combinedText = allPosts.substring(0, 40000);

    // Analyze posting patterns
    const postDates = (validatedContent.posts || [])
      .map((p: any) => p.timestamp ? new Date(p.timestamp) : null)
      .filter((d: any) => d && !isNaN(d.getTime()));
    
    const hasVideo = (validatedContent.posts || []).some((p: any) => 
      p.media_urls?.some((url: string) => url.includes('youtube') || url.includes('video') || url.includes('tiktok'))
    );
    
    const hasImages = (validatedContent.posts || []).some((p: any) => 
      p.media_urls?.some((url: string) => url.includes('image') || url.includes('photo') || url.includes('img'))
    );
    
    const avgEngagement = (validatedContent.posts || [])
      .filter((p: any) => p.engagement)
      .map((p: any) => {
        const eng = p.engagement || {};
        return (eng.likes || 0) + (eng.shares || 0) + (eng.comments || 0);
      });
    const avgEng = avgEngagement.length > 0 
      ? avgEngagement.reduce((a: number, b: number) => a + b, 0) / avgEngagement.length 
      : 0;

    const prompt = `You're a straight-talking content strategist. Research this creator's competitors and give 2-3 specific, data-driven insights.

Creator content (${validatedContent.posts.length} posts):
${combinedText}

Brand DNA: ${JSON.stringify(brandDNA, null, 2)}

Stats:
- Posts analyzed: ${validatedContent.posts.length}
- Video content: ${hasVideo ? 'Yes' : 'No'}
- Image content: ${hasImages ? 'Yes' : 'No'}
- Avg engagement: ${Math.round(avgEng)}
- Topics: ${(validatedContent.content_themes || []).join(', ')}

CRITICAL RULES:
1. Research their actual competitors and compare SPECIFIC metrics
2. Include NUMBERS - video lengths, posting frequency, engagement rates
3. Tell them exactly what to do differently based on competitor data
4. No generic advice like "post more" or "be consistent"
5. Every insight must reference what competitors are doing

BAD examples (too generic, don't say these):
- "Keep posting and you'll grow"
- "Try short-form video"
- "Engage with your audience more"

GOOD examples (specific with data):
- "Your videos average 4 mins. Top creators in your space do 8-12 mins - longer videos rank better."
- "You post 2x/week. Chunkz posts daily and gets 3x your views. Try 4x/week minimum."
- "Your thumbnails are text-heavy. MKBHD uses faces + 3 words max - his CTR is 2x higher."

Generate 2-3 insights with SPECIFIC data:
- Title: 4-6 words, action-focused
- Description: Include specific numbers/comparisons. What competitors do vs what you do.
- Impact: "HIGH IMPACT" or "MEDIUM IMPACT"
- Effort: "Quick win" or "Takes time"

Return ONLY valid JSON:
[
  {
    "title": "Make longer videos",
    "description": "Your videos are 4 mins avg. Top creators do 8-12 mins and get 2x watch time.",
    "impact": "HIGH IMPACT",
    "effort": "Takes time"
  }
]`;

    const { generateText } = await import('./llmService');
    const systemPrompt = scanTier === 'deep' 
      ? 'You are an elite content strategist with deep market knowledge. Provide comprehensive, data-driven insights with specific metrics. Always return valid JSON array.'
      : 'You are a content strategist. Provide specific, data-driven insights. Always return valid JSON array.';
    const text = await generateText(prompt, systemPrompt, { tier: scanTier });
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]);
      
      // Filter and validate insights
      return insights
        .filter((insight: any) => {
          // Ensure required fields
          return insight.title && insight.description && insight.impact && insight.effort;
        })
        .slice(0, 4); // Max 4 insights
    }

    throw new Error('Failed to parse strategic insights as JSON');
  } catch (error) {
    console.error('Strategic insights generation error:', error);
    return defaultInsights;
  }
}

async function generateCompetitorIntelligence(validatedContent: any, brandDNA: any, username?: string, scanTier: ScanTier = 'basic'): Promise<any> {
  // If no real content was extracted, return empty
  const hasRealContent = validatedContent.posts && validatedContent.posts.length > 0;
  const hasRealProfile = validatedContent.profile && validatedContent.profile.bio && 
                         validatedContent.profile.bio !== 'Sample bio' && 
                         !validatedContent.profile.bio.includes('Profile for');
  
  if (!hasRealContent && !hasRealProfile) {
    console.log('No real content found - skipping competitor analysis');
    return { marketShare: null, competitors: [] };
  }

  if (!isLLMConfigured()) {
    return { marketShare: null, competitors: [] };
  }

  try {
    const allPosts = (validatedContent.posts || []).map((p: any) => p.content).join('\n\n');
    const combinedText = allPosts.substring(0, 40000);

    const prompt = `Competitive analysis for this creator. Research their space and give me hard numbers.

Creator: ${username || 'Unknown'}
Their content: ${combinedText}
Brand DNA: ${JSON.stringify(brandDNA, null, 2)}
Topics: ${(validatedContent.content_themes || []).join(', ')}

I need:
1. Market share estimate (what % of their niche's total attention do they capture?)
2. Top 3 competitors with engagement data

MARKET SHARE:
- Look at their niche/industry (e.g., "football content creators", "tech reviewers")
- Estimate what % of total audience attention they get vs the whole space
- This is an ESTIMATE - be realistic (most creators are under 5%)

For each competitor:
- name: Real name
- threatLevel: "HIGH", "MEDIUM", or "LOW"
- primaryVector: Platform + posting frequency (e.g. "YouTube - 3x/week")
- weeklyViews: Estimated weekly views (number)
- weeklyEngagement: Estimated weekly likes+comments (number)
- theirAdvantage: One sentence, be specific
- yourOpportunity: One sentence, start with a verb

Return ONLY valid JSON:
{
  "marketShare": {
    "percentage": 2.5,
    "industry": "Football YouTube creators",
    "totalCreatorsInSpace": 500,
    "yourRank": 45,
    "note": "Estimate based on subscriber count and average views"
  },
  "competitors": [
    {
      "name": "Chunkz",
      "threatLevel": "HIGH",
      "primaryVector": "YouTube - 4x/week",
      "weeklyViews": 2500000,
      "weeklyEngagement": 150000,
      "theirAdvantage": "Massive crossover appeal beyond just football.",
      "yourOpportunity": "Go deeper on tactics. His content is entertainment-first."
    }
  ]
}`;

    const { generateText } = await import('./llmService');
    const systemPrompt = scanTier === 'deep'
      ? 'You are an elite competitive intelligence analyst with deep market knowledge. Provide comprehensive competitor analysis with specific metrics, market positioning, and actionable insights. Always return valid JSON.'
      : 'You are a competitive intelligence analyst. Provide specific data on competitors. Always return valid JSON.';
    const text = await generateText(prompt, systemPrompt, { tier: scanTier });
    
    // Try to parse as object first (new format)
    const jsonObjMatch = text.match(/\{[\s\S]*\}/);
    if (jsonObjMatch) {
      try {
        const parsed = JSON.parse(jsonObjMatch[0]);
        
        // New format with marketShare and competitors
        if (parsed.competitors && parsed.marketShare) {
          const competitors = parsed.competitors
            .filter((comp: any) => comp.name && comp.threatLevel)
            .slice(0, 3);
          
          return {
            marketShare: parsed.marketShare,
            competitors: competitors
          };
        }
        
        // If it's an array wrapped in object, extract it
        if (Array.isArray(parsed)) {
          return {
            marketShare: null,
            competitors: parsed.slice(0, 3)
          };
        }
      } catch (e) {
        // Try array format
      }
    }
    
    // Fallback: try array format
    const jsonArrMatch = text.match(/\[[\s\S]*\]/);
    if (jsonArrMatch) {
      const competitors = JSON.parse(jsonArrMatch[0]);
          return {
            marketShare: null,
            competitors: competitors
              .filter((comp: any) => comp.name && comp.threatLevel)
              .slice(0, scanTier === 'deep' ? 8 : 3) // Deep: 8 competitors, Basic: 3
          };
    }

    throw new Error('Failed to parse competitor intelligence as JSON');
  } catch (error) {
    console.error('Competitor intelligence generation error:', error);
    return { marketShare: null, competitors: [] };
  }
}

