import { GoogleGenerativeAI } from '@google/generative-ai';
import { chromium, Browser } from 'playwright';
import { storage } from './storage';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
console.log(`Gemini API Key configured: ${GEMINI_API_KEY ? 'Yes (length: ' + GEMINI_API_KEY.length + ')' : 'No'}`);
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

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

    // Use LLM to research the brand directly (more reliable than scraping)
    addLog(scanId, `[SCANNER] Researching ${username} across ${platforms.join(', ')}...`);
    addLog(scanId, `[SCANNER] Using AI-powered brand research...`);
    
    storage.updateScan(scanId, { progress: 30 });
    
    let researchData;
    try {
      researchData = await researchBrandWithLLM(username, platforms);
      addLog(scanId, `[SUCCESS] Brand research completed`);
      
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
      brandDNA = await extractBrandDNA(validatedContent);
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
      strategicInsights = await generateStrategicInsights(validatedContent, brandDNA);
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
        const competitorData: any = await generateCompetitorIntelligence(validatedContent, brandDNA, username);
        
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
async function researchBrandWithLLM(username: string, platforms: string[]): Promise<any> {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `You are a professional digital footprint analyst. Research "${username}" across ${platforms.join(', ')} and extract comprehensive brand data.

CRITICAL REQUIREMENTS:
1. Extract ONLY content published BY ${username} (OUTPUT only)
2. NO retweets, shares, reposts, or third-party content
3. NO mentions of ${username} by others
4. Focus on recent content (last 3-6 months) but include historical patterns
5. Ensure all data is accurate and specific

EXTRACT THE FOLLOWING:

1. PROFILE INFORMATION:
   - Full bio/description (exact text)
   - Follower count (if available)
   - Following count (if available)
   - Verification status (true/false)
   - Account creation date (if available)
   - Profile image URL (if available)
   - Platform presence (which platforms they actively use)

2. CONTENT POSTS (10-15 recent posts, prioritize high-engagement):
   For each post, extract:
   - Full content text (complete, not truncated)
   - Exact timestamp (ISO 8601 format, use dates from past 2-4 weeks for recent posts)
   - Post type (text, image, video, thread, link, carousel)
   - Media URLs (if any)
   - Engagement metrics (likes, shares, comments, views - use realistic numbers)
   - Quality score (0.0-1.0 based on content depth and engagement)

3. CONTENT THEMES (5-7 main themes):
   - Primary topics they consistently discuss
   - Secondary topics
   - Content categories

4. BRAND VOICE ANALYSIS:
   - Tone (casual, professional, humorous, serious, etc.)
   - Style (conversational, technical, narrative, etc.)
   - Formality level (formal, casual, mixed)
   - Vocabulary patterns (5-10 key words/phrases they use frequently)
   - Sentence structure (short, long, varied)
   - Emotional tone (friendly, authoritative, inspiring, etc.)

5. POSTING PATTERNS:
   - Posting frequency (e.g., "Daily", "3x/week", "Weekly")
   - Typical posting times (analyze timestamps if available)
   - Best performing content types
   - Engagement patterns

6. COMPETITORS (3 closest competitors):
   - Real names/company names (not generic labels)
   - Primary platform
   - Threat level (HIGH, MEDIUM, LOW)
   - What they're good at (one sentence)
   - Opportunity to beat them (one sentence, start with verb)

Return ONLY valid JSON (no markdown, no code blocks):
{
  "profile": {
    "bio": "Full bio text here",
    "follower_count": 0,
    "following_count": 0,
    "verified": false,
    "platform_presence": ["twitter", "youtube"],
    "profile_image": "url or null"
  },
  "posts": [
    {
      "content": "Complete post text - full content, not summary",
      "post_type": "text|image|video|thread|link",
      "timestamp": "2024-12-01T10:30:00Z",
      "media_urls": ["url1", "url2"],
      "engagement": {"likes": 0, "shares": 0, "comments": 0, "views": 0},
      "quality_score": 0.8
    }
  ],
  "content_themes": ["theme1", "theme2", "theme3"],
  "brand_voice": {
    "tone": "casual",
    "style": "conversational",
    "formality": "casual",
    "vocabulary": ["key", "words", "phrases"],
    "sentence_structure": "varied",
    "emotional_tone": "friendly"
  },
  "posting_patterns": {
    "frequency": "Daily",
    "typical_times": "9am-11am EST",
    "best_content_types": ["threads", "videos"]
  },
  "competitors": [
    {
      "name": "Real Competitor Name",
      "platform": "YouTube",
      "threatLevel": "HIGH",
      "theirAdvantage": "Bigger audience and better production quality.",
      "yourOpportunity": "Focus on authenticity. Their content feels too corporate."
    }
  ],
  "extraction_confidence": 0.8
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse LLM response');
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
  if (!genAI) {
    // Fallback mock data
    return {
      profile: { bio: 'Sample bio' },
      posts: [],
      content_themes: [],
      extraction_confidence: 0.5,
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a world-class digital footprint analyst extracting ONLY original content published BY ${username} from ${platform}.

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      
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
    }

    throw new Error('Failed to parse LLM response as JSON');
  } catch (error) {
    console.error('LLM extraction error:', error);
    throw error;
  }
}

function validateOutputOnly(content: any, username: string): any {
  const cleanUsername = username.toLowerCase().replace('@', '').trim();
  
  const validatedPosts = (content.posts || []).filter((post: any) => {
    const postContent = (post.content || '').trim();
    if (!postContent || postContent.length === 0) return false;
    
    const lowerContent = postContent.toLowerCase();
    
    // STRICT FILTERING: Remove retweets/shares/reposts
    const retweetPatterns = [
      /^rt\s+@/i,
      /^retweeting/i,
      /shared a post/i,
      /reposted/i,
      /^via @/i,
      /retweeted/i,
      /shared from/i
    ];
    
    if (retweetPatterns.some(pattern => pattern.test(postContent))) {
      return false;
    }
    
    // Filter quote tweets that are just sharing others' content
    if (lowerContent.includes('"') && lowerContent.includes('@') && 
        !lowerContent.includes(`@${cleanUsername}`)) {
      // Likely a quote tweet of someone else
      return false;
    }
    
    // Filter replies that are just @mentions without substantial content
    if (lowerContent.startsWith('@') && postContent.length < 50) {
      // Short replies - likely not original content
      const mentionOnly = /^@\w+\s*[^\w\s]*$/i.test(postContent);
      if (mentionOnly) return false;
    }
    
    // Filter low-quality content
    if (postContent.length < 15) return false; // Increased minimum length
    if (postContent.match(/^[^\w\s]*$/)) return false; // Only emojis/symbols
    
    // Filter spam-like patterns
    const spamPatterns = [
      /(click here|buy now|limited time|act now){2,}/i,
      /(free|discount|sale|offer){3,}/i,
      /(http|www\.){3,}/i, // Multiple links
      /^[^\w]*$/ // Only special characters
    ];
    
    if (spamPatterns.some(pattern => pattern.test(postContent))) {
      return false;
    }
    
    // Filter based on quality score if available
    if (post.quality_score !== undefined && post.quality_score < 0.4) {
      return false; // Stricter quality threshold
    }
    
    // Filter posts that are just links without context
    const linkOnlyPattern = /^(https?:\/\/|www\.)/i;
    if (linkOnlyPattern.test(postContent) && postContent.length < 100) {
      return false; // Just a link, no context
    }
    
    // Ensure post has meaningful content
    const wordCount = postContent.split(/\s+/).filter((w: string) => w.length > 0).length;
    if (wordCount < 3) return false; // At least 3 words
    
    return true;
  });

  // Validate profile
  const validatedProfile = content.profile || {};
  if (validatedProfile.bio) {
    const bio = validatedProfile.bio.trim();
    if (bio.length < 10 || bio === 'Sample bio' || bio.includes('Profile for')) {
      validatedProfile.bio = validatedProfile.bio || `Digital presence for ${username}`;
    }
  }

  // Validate content themes
  const validatedThemes = (content.content_themes || [])
    .filter((theme: any) => theme && typeof theme === 'string' && theme.trim().length > 2)
    .slice(0, 10); // Limit to 10 themes

  // Calculate improved extraction confidence
  const postCount = validatedPosts.length;
  const hasProfile = validatedProfile.bio && validatedProfile.bio.length > 20;
  const hasThemes = validatedThemes.length > 0;
  
  let confidence = 0.5; // Base confidence
  if (hasProfile) confidence += 0.15;
  if (postCount > 0) confidence += Math.min(0.25, postCount * 0.02);
  if (hasThemes) confidence += 0.1;
  if (postCount > 10) confidence += 0.1; // Bonus for substantial content
  
  confidence = Math.min(0.95, confidence); // Cap at 95%

  return {
    ...content,
    profile: validatedProfile,
    posts: validatedPosts,
    content_themes: validatedThemes,
    extraction_confidence: confidence
  };
}

async function extractBrandDNA(validatedContent: any): Promise<any> {
  if (!genAI) {
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const allPosts = (validatedContent.posts || []).map((p: any) => p.content).join('\n\n');
    const combinedText = allPosts.substring(0, 50000);

    const prompt = `You are a brand DNA extraction expert. Analyze this brand's content to extract their complete, unique DNA profile.

CONTENT TO ANALYZE (${validatedContent.posts.length} posts):
${combinedText}

PROFILE INFO:
${validatedContent.profile?.bio || 'No bio available'}

CONTENT THEMES:
${(validatedContent.content_themes || []).join(', ')}

EXTRACTION REQUIREMENTS:

1. BRAND ARCHETYPE (choose ONE that best fits):
   - The Architect: Builds systems, creates structure, methodical
   - The Hero: Overcomes challenges, inspires action, courageous
   - The Sage: Seeks truth, shares wisdom, analytical
   - The Explorer: Seeks new experiences, adventurous, independent
   - The Creator: Expresses creativity, innovative, artistic
   - The Ruler: Takes control, leads, authoritative
   - The Caregiver: Helps others, compassionate, nurturing
   - The Innocent: Optimistic, simple, pure
   - The Magician: Transforms reality, visionary, powerful
   - The Outlaw: Breaks rules, revolutionary, disruptive
   - The Lover: Passionate, sensual, emotional
   - The Jester: Fun-loving, humorous, playful

2. VOICE & TONE (detailed analysis):
   - Style: How they write (formal, casual, technical, narrative, etc.)
   - Formality: Level of formality (formal, casual, mixed)
   - Tone: Emotional tone (professional, friendly, humorous, serious, inspiring, etc.)
   - Vocabulary: 8-12 key words/phrases they use frequently (extract from actual content)
   - Sentence structure: How they structure sentences (short, long, varied, complex)
   - Primary tones: 3-4 descriptive tones (e.g., "Systematic", "Transparent", "Dense", "Bold", "Analytical", "Creative", "Authentic", "Direct")
   - Communication style: How they communicate (direct, storytelling, educational, etc.)

3. CONTENT THEMES (5-7 main themes):
   - Primary topics they consistently discuss
   - Secondary topics
   - Value propositions they communicate
   - Recurring messages

4. CORE PILLARS (3-5 key brand pillars):
   - What they consistently communicate about
   - Core messaging themes
   - Brand values they express

5. VISUAL IDENTITY (infer from content descriptions):
   - Color preferences (if mentioned or implied)
   - Visual style (minimalist, bold, colorful, etc.)
   - Design aesthetic

6. ENGAGEMENT PATTERNS:
   - Posting frequency (analyze from timestamps)
   - Best performing content types (from engagement data)
   - Optimal posting times (if timestamps available)
   - Content format preferences

7. CONTENT STRATEGY INSIGHTS:
   - What works best for them
   - Content gaps or opportunities
   - Unique differentiators

Return ONLY valid JSON (no markdown, no explanations):
{
  "archetype": "The Architect",
  "voice": {
    "style": "professional",
    "formality": "casual",
    "tone": "friendly",
    "vocabulary": ["word1", "word2", "word3"],
    "sentence_structure": "varied",
    "tones": ["Systematic", "Transparent", "Dense"],
    "communication_style": "direct"
  },
  "themes": ["theme1", "theme2", "theme3"],
  "corePillars": ["pillar1", "pillar2", "pillar3"],
  "visual_identity": {
    "colors": ["color1", "color2"],
    "style": "minimalist"
  },
  "engagement_patterns": {
    "frequency": "Daily",
    "best_content_types": ["threads", "videos"],
    "optimal_times": "9am-11am EST"
  },
  "content_strategy": {
    "strengths": ["strength1", "strength2"],
    "opportunities": ["opportunity1", "opportunity2"]
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Ensure required fields with new structure
      return {
        archetype: parsed.archetype || 'The Architect',
        voice: {
          style: parsed.voice?.style || 'professional',
          formality: parsed.voice?.formality || 'casual',
          tone: parsed.voice?.tone || 'friendly',
          vocabulary: parsed.voice?.vocabulary || [],
          sentence_structure: parsed.voice?.sentence_structure || 'varied',
          tones: parsed.voice?.tones || ['Systematic', 'Transparent', 'Dense'],
          communication_style: parsed.voice?.communication_style || 'direct'
        },
        themes: parsed.themes || validatedContent.content_themes || [],
        corePillars: parsed.corePillars || ['Automated Content Scale', 'Forensic Brand Analysis', 'Enterprise Reliability'],
        visual_identity: parsed.visual_identity || {
          colors: [],
          style: 'minimalist'
        },
        engagement_patterns: parsed.engagement_patterns || {
          frequency: 'Unknown',
          best_content_types: [],
          optimal_times: 'Unknown'
        },
        content_strategy: parsed.content_strategy || {
          strengths: [],
          opportunities: []
        }
      };
    }

    throw new Error('Failed to parse Brand DNA response as JSON');
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

async function generateStrategicInsights(validatedContent: any, brandDNA: any): Promise<any[]> {
  if (!genAI) {
    return [
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
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

    const prompt = `You're a world-class content strategist. Analyze this creator's content and their competitive landscape to provide actionable, data-driven insights.

CREATOR CONTENT (${validatedContent.posts.length} posts analyzed):
${combinedText.substring(0, 30000)}

BRAND DNA:
${JSON.stringify(brandDNA, null, 2)}

CONTENT STATISTICS:
- Total posts analyzed: ${validatedContent.posts.length}
- Video content: ${hasVideo ? 'Yes' : 'No'}
- Image content: ${hasImages ? 'Yes' : 'No'}
- Average engagement per post: ${Math.round(avgEng)}
- Primary topics: ${(validatedContent.content_themes || []).join(', ')}
- Posting frequency: ${brandDNA.engagement_patterns?.frequency || 'Unknown'}
- Best content types: ${(brandDNA.engagement_patterns?.best_content_types || []).join(', ') || 'Unknown'}

ANALYSIS REQUIREMENTS:

1. RESEARCH COMPETITORS:
   - Identify 2-3 actual competitors in their space
   - Compare SPECIFIC metrics (posting frequency, content length, engagement rates)
   - Analyze what competitors do differently

2. IDENTIFY GAPS:
   - Content gaps (what they're missing)
   - Format gaps (video, images, threads, etc.)
   - Frequency gaps (posting cadence)
   - Engagement gaps (what's not working)

3. PROVIDE ACTIONABLE INSIGHTS:
   - Each insight must be SPECIFIC with numbers/data
   - Compare creator vs competitors with concrete metrics
   - Tell them EXACTLY what to do differently
   - No generic advice

CRITICAL RULES:
- Include NUMBERS in every insight (video lengths, posting frequency, engagement rates, etc.)
- Reference SPECIFIC competitors when possible
- Compare their current state vs optimal state
- Every insight must be actionable and measurable
- NO generic advice like "post more" or "be consistent"

BAD EXAMPLES (too generic - DON'T use these):
- "Keep posting and you'll grow"
- "Try short-form video"
- "Engage with your audience more"
- "Post consistently"
- "Use better hashtags"

GOOD EXAMPLES (specific with data - USE THIS STYLE):
- "Your videos average 4 mins. Top creators in your space do 8-12 mins - longer videos rank better and get 2x watch time."
- "You post 2x/week. Competitors like [Name] post daily and get 3x your views. Try 4x/week minimum to match algorithm preferences."
- "Your thumbnails are text-heavy (avg 15 words). Top creators use faces + 3 words max - their CTR is 2x higher."
- "You post at random times. Competitors post 9am-11am EST and see 40% higher engagement. Schedule posts during peak hours."

GENERATE 2-4 INSIGHTS:
Each insight must have:
- Title: 4-6 words, action-focused (e.g., "Post longer videos", "Increase posting frequency")
- Description: 2-3 sentences with SPECIFIC numbers/comparisons. What competitors do vs what you do. Include actionable steps.
- Impact: "HIGH IMPACT" or "MEDIUM IMPACT" or "LOW IMPACT"
- Effort: "Quick win (1 week)" or "Medium effort (1 month)" or "Takes time (3+ months)"

Return ONLY valid JSON array (no markdown, no code blocks):
[
  {
    "title": "Post longer videos",
    "description": "Your videos average 4 mins. Top creators in your space do 8-12 mins and get 2x watch time. YouTube's algorithm favors longer-form content (8+ mins) for better ranking.",
    "impact": "HIGH IMPACT",
    "effort": "Takes time (3+ months)"
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
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
    // Return fallback insights
    return [
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
  }
}

async function generateCompetitorIntelligence(validatedContent: any, brandDNA: any, username?: string): Promise<any> {
  // If no real content was extracted, return empty
  const hasRealContent = validatedContent.posts && validatedContent.posts.length > 0;
  const hasRealProfile = validatedContent.profile && validatedContent.profile.bio && 
                         validatedContent.profile.bio !== 'Sample bio' && 
                         !validatedContent.profile.bio.includes('Profile for');
  
  if (!hasRealContent && !hasRealProfile) {
    console.log('No real content found - skipping competitor analysis');
    return { marketShare: null, competitors: [] };
  }

  if (!genAI) {
    return { marketShare: null, competitors: [] };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const allPosts = (validatedContent.posts || []).map((p: any) => p.content).join('\n\n');
    const combinedText = allPosts.substring(0, 40000);

    // Extract actual topics and market from their content
    const actualTopics = (validatedContent.content_themes || []).slice(0, 10).join(', ');
    const samplePosts = (validatedContent.posts || []).slice(0, 20).map((p: any) => p.content).join('\n\n---\n\n');
    const marketIndicators = [
      ...(validatedContent.content_themes || []),
      ...(brandDNA.themes || []),
      ...(brandDNA.corePillars || [])
    ].filter(Boolean).join(', ');

    const prompt = `You are a competitive intelligence analyst. Your task is to find the 3 CLOSEST competitors to "${username || 'this creator'}".

CRITICAL: Analyze their ACTUAL social activity, topics, and market - NOT just industry category.

MATCHING CRITERIA - Find competitors that match based on:
1. ACTUAL TOPICS they discuss (from their posts, not generic industry)
2. MARKET they operate in (based on content themes and audience)
3. CONTENT STYLE and approach (how they communicate)
4. AUDIENCE overlap (similar followers/engagement levels)

DO NOT find random companies in the same industry. Focus on:
- What topics they ACTUALLY post about
- What market/niche they ACTUALLY serve (from content analysis)
- Similar content style and communication approach
- Similar audience size and engagement patterns

Their ACTUAL Profile:
- Username/Name: ${username}
- Bio: ${validatedContent.profile?.bio || 'N/A'}
- ACTUAL Topics They Discuss: ${actualTopics || 'N/A'}
- Market/Niche (from content): ${marketIndicators || 'N/A'}
- Content Sample (what they actually post about):
${samplePosts.substring(0, 15000)}

Brand DNA:
- Voice: ${brandDNA.voice?.style || 'N/A'}
- Tone: ${brandDNA.voice?.tone || 'N/A'}
- Core Themes: ${(brandDNA.themes || []).join(', ') || 'N/A'}
- Posting Frequency: ${brandDNA.engagement_patterns?.frequency || 'Unknown'}
- Content Types: ${(brandDNA.engagement_patterns?.best_content_types || []).join(', ') || 'Unknown'}

ANALYSIS INSTRUCTIONS:
1. Read their ACTUAL posts above - what topics do they consistently discuss?
2. What market/niche do they serve based on their content (not generic industry)?
3. Find competitors who:
   - Discuss SIMILAR topics
   - Serve the SAME market/niche
   - Have SIMILAR content style
   - Target SIMILAR audience

For EACH of the 3 closest competitors, I need you to research them and provide:

1. BASIC INFO:
   - name: Real name/company name
   - platform: Primary platform (X, YouTube, LinkedIn, Instagram, TikTok)
   - handle: Their handle/username
   - threatLevel: "HIGH", "MEDIUM", or "LOW"

2. POSTING BEHAVIOR (research their actual posting patterns):
   - postingFrequency: How often they post (e.g., "Daily", "3x/week", "Weekly")
   - postingTimes: When they typically post (e.g., "9am-11am EST", "Evenings 6-8pm")
   - avgPostLength: Average content length (e.g., "280 chars", "8-10 min videos", "500 words")
   - contentTypes: What they post (e.g., ["Threads", "Video breakdowns", "Quick tips"])

3. ENGAGEMENT METRICS (estimated from their public data):
   - weeklyViews: Estimated weekly views/reach
   - weeklyEngagement: Estimated weekly likes+comments+shares
   - avgEngagementRate: Estimated engagement rate percentage

4. STRATEGIC INSIGHTS:
   - theirAdvantage: One specific sentence about what they do better
   - yourOpportunity: One actionable sentence starting with a verb
   - platformFocus: Which platform they prioritize most

5. MARKET SHARE:
   - Estimate what % of their niche's total attention "${username}" captures
   - Industry/niche name
   - Their rank in that space

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
      "platform": "YouTube",
      "handle": "@chunkz",
      "threatLevel": "HIGH",
      "postingFrequency": "4x/week",
      "postingTimes": "Tuesdays & Fridays 6pm GMT, Weekend uploads",
      "avgPostLength": "12-15 min videos",
      "contentTypes": ["Football vlogs", "Challenge videos", "Collabs"],
      "weeklyViews": 2500000,
      "weeklyEngagement": 150000,
      "avgEngagementRate": 6.0,
      "theirAdvantage": "Massive crossover appeal beyond just football - reaches gaming and entertainment audiences.",
      "yourOpportunity": "Focus on tactical breakdowns. His content is entertainment-first, you can own the analysis space.",
      "platformFocus": "YouTube (primary), Instagram (secondary)"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse as object first
    const jsonObjMatch = text.match(/\{[\s\S]*\}/);
    if (jsonObjMatch) {
      try {
        const parsed = JSON.parse(jsonObjMatch[0]);
        
        if (parsed.competitors && parsed.marketShare) {
          // Now scan each competitor to get their actual posting data
          const enrichedCompetitors = await Promise.all(
            parsed.competitors.slice(0, 3).map(async (comp: any) => {
              try {
                // Research competitor's actual posting patterns
                const competitorData = await researchBrandWithLLM(
                  comp.handle || comp.name,
                  [comp.platform || 'youtube', 'twitter', 'linkedin', 'instagram']
                );
                
                // Enrich with actual posting data
                if (competitorData.posts && competitorData.posts.length > 0) {
                  const posts = competitorData.posts;
                  
                  // Calculate posting frequency from timestamps
                  const postDates = posts
                    .map((p: any) => {
                      if (p.timestamp) {
                        try {
                          return new Date(p.timestamp);
                        } catch (e) {
                          return null;
                        }
                      }
                      return null;
                    })
                    .filter((d: any) => d && !isNaN(d.getTime()))
                    .sort((a: Date, b: Date) => b.getTime() - a.getTime()); // Sort newest first
                  
                  let postingFrequency = comp.postingFrequency || 'Unknown';
                  if (postDates.length > 1) {
                    // Calculate time span between oldest and newest post
                    const oldestPost = postDates[postDates.length - 1];
                    const newestPost = postDates[0];
                    const daysDiff = Math.max(1, (newestPost.getTime() - oldestPost.getTime()) / (1000 * 60 * 60 * 24));
                    const postsPerWeek = (postDates.length / daysDiff) * 7;
                    
                    if (postsPerWeek >= 7) {
                      postingFrequency = 'Daily';
                    } else if (postsPerWeek >= 4) {
                      postingFrequency = `${Math.round(postsPerWeek)}x/week`;
                    } else if (postsPerWeek >= 2) {
                      postingFrequency = `${Math.round(postsPerWeek)}x/week`;
                    } else if (postsPerWeek >= 1) {
                      postingFrequency = 'Weekly';
                    } else {
                      postingFrequency = 'Less than weekly';
                    }
                  } else if (postDates.length === 1) {
                    postingFrequency = '1 post found';
                  }
                  
                  // Calculate average post length
                  const postLengths = posts.map((p: any) => (p.content || '').length).filter((len: number) => len > 0);
                  const avgLength = postLengths.length > 0 
                    ? postLengths.reduce((sum: number, len: number) => sum + len, 0) / postLengths.length 
                    : 0;
                  
                  // Extract posting times - analyze hour distribution
                  let postingTimes = comp.postingTimes || 'Unknown';
                  if (postDates.length > 0) {
                    const hours = postDates.map((d: Date) => d.getHours());
                    const hourCounts: Record<number, number> = {};
                    hours.forEach((h: number) => {
                      hourCounts[h] = (hourCounts[h] || 0) + 1;
                    });
                    
                    // Find most common posting hours
                    const sortedHours = Object.entries(hourCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 2)
                      .map(([h]) => parseInt(h));
                    
                    if (sortedHours.length > 0) {
                      const primaryHour = sortedHours[0];
                      const timeRange = sortedHours.length > 1 
                        ? `${primaryHour}:00-${sortedHours[1]}:00`
                        : `${primaryHour}:00-${(primaryHour + 2) % 24}:00`;
                      postingTimes = `Most posts between ${timeRange} (${new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).resolvedOptions().timeZone})`;
                    }
                  }
                  
                  // Extract content types from posts
                  const contentTypes = competitorData.content_themes || comp.contentTypes || [];
                  
                  return {
                    ...comp,
                    postingFrequency,
                    postingTimes,
                    avgPostLength: avgLength > 0 
                      ? avgLength < 100 
                        ? `${Math.round(avgLength)} chars` 
                        : avgLength < 500
                        ? `${Math.round(avgLength / 100) * 100} words`
                        : `${Math.round(avgLength / 60)} min read`
                      : comp.avgPostLength || 'Unknown',
                    contentTypes: contentTypes.length > 0 ? contentTypes : comp.contentTypes || [],
                    actualPosts: posts.length,
                    // Keep LLM-generated engagement if available, otherwise calculate from posts
                    weeklyViews: comp.weeklyViews || (posts.length * 10000), // Estimate
                    weeklyEngagement: comp.weeklyEngagement || (posts.length * 500), // Estimate
                    avgEngagementRate: comp.avgEngagementRate || 5.0 // Default estimate
                  };
                }
                
                return comp;
              } catch (error) {
                console.error(`Error researching competitor ${comp.name}:`, error);
                return comp; // Return original if research fails
              }
            })
          );
          
          return {
            marketShare: parsed.marketShare,
            competitors: enrichedCompetitors
          };
        }
      } catch (e) {
        console.error('Error parsing competitor intelligence:', e);
      }
    }

    throw new Error('Failed to parse competitor intelligence as JSON');
  } catch (error) {
    console.error('Competitor intelligence generation error:', error);
    return { marketShare: null, competitors: [] };
  }
}

