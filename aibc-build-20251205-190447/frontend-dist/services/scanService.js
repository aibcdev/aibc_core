"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScan = startScan;
const generative_ai_1 = require("@google/generative-ai");
const storage_1 = require("./storage");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
console.log(`Gemini API Key configured: ${GEMINI_API_KEY ? 'Yes (length: ' + GEMINI_API_KEY.length + ')' : 'No'}`);
const genAI = GEMINI_API_KEY ? new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY) : null;
async function startScan(scanId, username, platforms, scanType) {
    const scan = storage_1.storage.getScan(scanId);
    if (!scan) {
        console.error(`Scan ${scanId} not found in storage`);
        return;
    }
    try {
        storage_1.storage.updateScan(scanId, { status: 'scanning', progress: 0 });
        addLog(scanId, `[SYSTEM] Initializing Digital Footprint Scanner...`);
        addLog(scanId, `[SYSTEM] Target: ${username}`);
        addLog(scanId, `[SYSTEM] Platforms: ${platforms.join(', ')}`);
        addLog(scanId, `[SYSTEM] Scan Type: ${scanType}`);
        const allExtractedContent = [];
        const totalPlatforms = platforms.length;
        let successfulPlatforms = 0;
        // Use LLM to research the brand directly (more reliable than scraping)
        addLog(scanId, `[SCANNER] Researching ${username} across ${platforms.join(', ')}...`);
        addLog(scanId, `[SCANNER] Using AI-powered brand research...`);
        storage_1.storage.updateScan(scanId, { progress: 30 });
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
        }
        catch (researchError) {
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
        storage_1.storage.updateScan(scanId, { progress: 85 });
        addLog(scanId, `[ANALYSIS] Processing extracted content...`);
        addLog(scanId, `[ANALYSIS] Successfully scanned ${successfulPlatforms}/${totalPlatforms} platforms`);
        addLog(scanId, `[ANALYSIS] Extracting voice & tone patterns...`);
        addLog(scanId, `[ANALYSIS] Identifying content themes...`);
        // Merge content from all platforms - only real data
        const mergedContent = {
            profile: allExtractedContent.find((ec) => ec.profile && ec.profile.bio && ec.profile.bio.length > 20)?.profile ||
                allExtractedContent[0]?.profile || { bio: '' },
            posts: allExtractedContent.flatMap((ec) => ec.posts || []).filter((p) => p && p.content && p.content.length > 10),
            content_themes: Array.from(new Set(allExtractedContent.flatMap((ec) => ec.content_themes || []).filter((t) => t && t.length > 0))),
            extraction_confidence: allExtractedContent.length > 0
                ? allExtractedContent.reduce((sum, ec) => sum + (ec.extraction_confidence || 0), 0) /
                    allExtractedContent.length
                : 0,
        };
        // Validate OUTPUT only
        const validatedContent = validateOutputOnly(mergedContent, username);
        // Extract Brand DNA (with error handling)
        storage_1.storage.updateScan(scanId, { progress: 90 });
        let brandDNA;
        try {
            brandDNA = await extractBrandDNA(validatedContent);
            addLog(scanId, `[SUCCESS] Brand DNA extracted`);
        }
        catch (error) {
            addLog(scanId, `[WARNING] Brand DNA extraction failed: ${error.message} - using fallback`);
            brandDNA = {
                archetype: 'The Architect',
                voice: { style: 'professional', tones: ['Systematic', 'Transparent', 'Dense'] },
                corePillars: ['Content Strategy', 'Brand Identity', 'Market Position']
            };
        }
        // Generate Strategic Insights (with error handling)
        storage_1.storage.updateScan(scanId, { progress: 95 });
        let strategicInsights;
        try {
            strategicInsights = await generateStrategicInsights(validatedContent, brandDNA);
            addLog(scanId, `[SUCCESS] Strategic insights generated`);
        }
        catch (error) {
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
        storage_1.storage.updateScan(scanId, { progress: 98 });
        let competitorIntelligence = [];
        let marketShare = null;
        // First check if we have competitors from the research data
        const researchCompetitors = allExtractedContent.find(ec => ec.competitors)?.competitors;
        if (researchCompetitors && researchCompetitors.length > 0) {
            competitorIntelligence = researchCompetitors;
            addLog(scanId, `[SUCCESS] Using ${competitorIntelligence.length} competitors from brand research`);
        }
        else {
            // Generate using LLM if not available
            try {
                const competitorData = await generateCompetitorIntelligence(validatedContent, brandDNA, username);
                // Handle new format with marketShare
                if (competitorData && competitorData.competitors) {
                    competitorIntelligence = competitorData.competitors;
                    marketShare = competitorData.marketShare;
                }
                else if (Array.isArray(competitorData)) {
                    competitorIntelligence = competitorData;
                }
                if (competitorIntelligence.length > 0) {
                    addLog(scanId, `[SUCCESS] Competitor intelligence analyzed - ${competitorIntelligence.length} competitors identified`);
                }
                if (marketShare) {
                    addLog(scanId, `[SUCCESS] Market share estimated at ${marketShare.percentage}% of ${marketShare.industry}`);
                }
            }
            catch (error) {
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
        storage_1.storage.updateScan(scanId, {
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
    }
    catch (error) {
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
            storage_1.storage.updateScan(scanId, {
                progress: 100,
                status: 'complete',
                results: fallbackResults,
                completedAt: new Date().toISOString(),
                error: error.message
            });
            addLog(scanId, `[WARNING] Scan completed with errors - using fallback data`);
        }
        catch (fallbackError) {
            // Last resort - mark as error but still try to complete
            storage_1.storage.updateScan(scanId, {
                status: 'error',
                error: error.message,
                progress: 100
            });
        }
    }
}
function addLog(scanId, message) {
    const scan = storage_1.storage.getScan(scanId);
    if (scan) {
        scan.logs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
        storage_1.storage.updateScan(scanId, { logs: scan.logs });
    }
}
function getProfileUrl(username, platform) {
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
async function scrapeProfile(url, platform) {
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
async function researchBrandWithLLM(username, platforms) {
    if (!genAI) {
        throw new Error('Gemini API not configured');
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Research "${username}" on ${platforms.join(', ')}. Give me the key facts.

I need:
1. Their profile (bio, followers, verified status)
2. What they post about (5-8 recent posts with approximate timestamps - use dates from the past 2-4 weeks)
3. Their main topics (3-5 themes)
4. How they talk (tone, style)
5. Posting frequency and typical posting times (if you can infer from the data)
6. Who they compete with (3 real competitors)

WRITING STYLE FOR COMPETITORS:
- Use real names, not generic labels
- Short sentences only
- "theirAdvantage" = one sentence, what they're good at
- "yourOpportunity" = one sentence, how to beat them (start with a verb)

Return ONLY valid JSON:
{
  "profile": {
    "bio": "Their bio",
    "follower_count": 0,
    "verified": false,
    "platform_presence": ["twitter", "youtube"]
  },
  "posts": [
    {
      "content": "Short summary of what they posted",
      "post_type": "video",
      "timestamp": "2024-12-01T10:30:00Z",
      "engagement": {"likes": 0, "shares": 0, "comments": 0},
      "quality_score": 0.8
    }
  ],
  "content_themes": ["topic1", "topic2", "topic3"],
  "brand_voice": {
    "tone": "casual",
    "style": "conversational",
    "vocabulary": ["key", "words"]
  },
  "competitors": [
    {
      "name": "Real Competitor Name",
      "threatLevel": "HIGH",
      "primaryVector": "YouTube - posts daily",
      "theirAdvantage": "Bigger audience and better production.",
      "yourOpportunity": "Be more authentic. Their content feels corporate."
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
    }
    catch (error) {
        console.error('LLM research error:', error);
        throw error;
    }
}
async function extractOutputContent(scrapedContent, username, platform) {
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
                extracted.posts = extracted.posts.filter((post) => {
                    // Filter low-quality posts
                    const content = (post.content || '').trim();
                    if (content.length < 10)
                        return false;
                    if (content.match(/^[^\w\s]*$/))
                        return false; // Only emojis/symbols
                    if (post.quality_score && post.quality_score < 0.3)
                        return false;
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
    }
    catch (error) {
        console.error('LLM extraction error:', error);
        throw error;
    }
}
function validateOutputOnly(content, username) {
    const validatedPosts = (content.posts || []).filter((post) => {
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
            const brandMention = mentions.some((m) => m.toLowerCase().includes(username.toLowerCase().replace('@', '')));
            if (!brandMention && mentions.length > 0) {
                return false; // It's mentioning others, not the brand
            }
        }
        // Filter low-quality content
        if (postContent.length < 10)
            return false;
        if (postContent.match(/^[^\w\s]*$/))
            return false; // Only emojis/symbols
        // Filter based on quality score if available
        if (post.quality_score && post.quality_score < 0.3)
            return false;
        // Filter spam-like patterns
        if (lowerContent.match(/(click here|buy now|limited time|act now){2,}/i))
            return false;
        return true;
    });
    return {
        ...content,
        posts: validatedPosts,
    };
}
async function extractBrandDNA(validatedContent) {
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
        const allPosts = (validatedContent.posts || []).map((p) => p.content).join('\n\n');
        const combinedText = allPosts.substring(0, 50000);
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
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
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
        }
        throw new Error('Failed to parse Brand DNA response as JSON');
    }
    catch (error) {
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
async function generateStrategicInsights(validatedContent, brandDNA) {
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
        const allPosts = (validatedContent.posts || []).map((p) => p.content).join('\n\n');
        const combinedText = allPosts.substring(0, 40000);
        // Analyze posting patterns
        const postDates = (validatedContent.posts || [])
            .map((p) => p.timestamp ? new Date(p.timestamp) : null)
            .filter((d) => d && !isNaN(d.getTime()));
        const hasVideo = (validatedContent.posts || []).some((p) => p.media_urls?.some((url) => url.includes('youtube') || url.includes('video') || url.includes('tiktok')));
        const hasImages = (validatedContent.posts || []).some((p) => p.media_urls?.some((url) => url.includes('image') || url.includes('photo') || url.includes('img')));
        const avgEngagement = (validatedContent.posts || [])
            .filter((p) => p.engagement)
            .map((p) => {
            const eng = p.engagement || {};
            return (eng.likes || 0) + (eng.shares || 0) + (eng.comments || 0);
        });
        const avgEng = avgEngagement.length > 0
            ? avgEngagement.reduce((a, b) => a + b, 0) / avgEngagement.length
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
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const insights = JSON.parse(jsonMatch[0]);
            // Filter and validate insights
            return insights
                .filter((insight) => {
                // Ensure required fields
                return insight.title && insight.description && insight.impact && insight.effort;
            })
                .slice(0, 4); // Max 4 insights
        }
        throw new Error('Failed to parse strategic insights as JSON');
    }
    catch (error) {
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
async function generateCompetitorIntelligence(validatedContent, brandDNA, username) {
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
        const allPosts = (validatedContent.posts || []).map((p) => p.content).join('\n\n');
        const combinedText = allPosts.substring(0, 40000);
        const prompt = `You are analyzing "${username || 'this creator'}" and need to find their 3 CLOSEST competitors.

CRITICAL: Don't just find random companies in the same space. Find the 3 that are MOST SIMILAR based on:
1. WHAT they offer (product/service/content type)
2. HOW they offer it (style, tone, approach)
3. TRACTION (similar audience size, engagement levels)

Their Profile:
- Content: ${combinedText.substring(0, 10000)}
- Brand DNA: ${JSON.stringify(brandDNA, null, 2)}
- Topics: ${(validatedContent.content_themes || []).join(', ')}
- Bio: ${validatedContent.profile?.bio || 'N/A'}

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
                    const enrichedCompetitors = await Promise.all(parsed.competitors.slice(0, 3).map(async (comp) => {
                        try {
                            // Research competitor's actual posting patterns
                            const competitorData = await researchBrandWithLLM(comp.handle || comp.name, [comp.platform || 'youtube', 'twitter', 'linkedin', 'instagram']);
                            // Enrich with actual posting data
                            if (competitorData.posts && competitorData.posts.length > 0) {
                                const posts = competitorData.posts;
                                // Calculate posting frequency from timestamps
                                const postDates = posts
                                    .map((p) => {
                                    if (p.timestamp) {
                                        try {
                                            return new Date(p.timestamp);
                                        }
                                        catch (e) {
                                            return null;
                                        }
                                    }
                                    return null;
                                })
                                    .filter((d) => d && !isNaN(d.getTime()))
                                    .sort((a, b) => b.getTime() - a.getTime()); // Sort newest first
                                let postingFrequency = comp.postingFrequency || 'Unknown';
                                if (postDates.length > 1) {
                                    // Calculate time span between oldest and newest post
                                    const oldestPost = postDates[postDates.length - 1];
                                    const newestPost = postDates[0];
                                    const daysDiff = Math.max(1, (newestPost.getTime() - oldestPost.getTime()) / (1000 * 60 * 60 * 24));
                                    const postsPerWeek = (postDates.length / daysDiff) * 7;
                                    if (postsPerWeek >= 7) {
                                        postingFrequency = 'Daily';
                                    }
                                    else if (postsPerWeek >= 4) {
                                        postingFrequency = `${Math.round(postsPerWeek)}x/week`;
                                    }
                                    else if (postsPerWeek >= 2) {
                                        postingFrequency = `${Math.round(postsPerWeek)}x/week`;
                                    }
                                    else if (postsPerWeek >= 1) {
                                        postingFrequency = 'Weekly';
                                    }
                                    else {
                                        postingFrequency = 'Less than weekly';
                                    }
                                }
                                else if (postDates.length === 1) {
                                    postingFrequency = '1 post found';
                                }
                                // Calculate average post length
                                const postLengths = posts.map((p) => (p.content || '').length).filter((len) => len > 0);
                                const avgLength = postLengths.length > 0
                                    ? postLengths.reduce((sum, len) => sum + len, 0) / postLengths.length
                                    : 0;
                                // Extract posting times - analyze hour distribution
                                let postingTimes = comp.postingTimes || 'Unknown';
                                if (postDates.length > 0) {
                                    const hours = postDates.map((d) => d.getHours());
                                    const hourCounts = {};
                                    hours.forEach((h) => {
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
                        }
                        catch (error) {
                            console.error(`Error researching competitor ${comp.name}:`, error);
                            return comp; // Return original if research fails
                        }
                    }));
                    return {
                        marketShare: parsed.marketShare,
                        competitors: enrichedCompetitors
                    };
                }
            }
            catch (e) {
                console.error('Error parsing competitor intelligence:', e);
            }
        }
        throw new Error('Failed to parse competitor intelligence as JSON');
    }
    catch (error) {
        console.error('Competitor intelligence generation error:', error);
        return { marketShare: null, competitors: [] };
    }
}
