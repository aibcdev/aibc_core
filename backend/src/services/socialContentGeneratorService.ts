/**
 * Social Media Content Generator Service
 * Generates enterprise-level, personalized LinkedIn and Twitter content
 * Based on industry, company size, competitors, brand voice, and platform preferences
 * Enhanced to match StoryArb-level quality standards
 */

import { generateText, generateJSON } from './llmService';
import { BlogPost } from '../types/seo';

/**
 * Convert scan results brand voice to BrandContext format
 */
export function convertScanBrandVoiceToContext(scanBrandVoice: any): BrandContext['brandVoice'] {
  if (!scanBrandVoice) return undefined;
  
  // Handle different brand voice formats from scan results
  if (typeof scanBrandVoice === 'object') {
    return {
      style: scanBrandVoice.style || scanBrandVoice.tone || 'professional',
      formality: scanBrandVoice.formality || (scanBrandVoice.tone === 'casual' ? 'conversational' : 'professional'),
      tone: scanBrandVoice.tone || scanBrandVoice.style || 'friendly',
      vocabulary: scanBrandVoice.vocabulary || scanBrandVoice.keywords || []
    };
  }
  
  return undefined;
}

interface BrandContext {
  name: string;
  industry?: string;
  niche?: string;
  companySize?: 'startup' | 'small' | 'medium' | 'enterprise' | 'enterprise-plus';
  description?: string;
  brandVoice?: {
    style?: string;
    formality?: string;
    tone?: string;
    vocabulary?: string[];
  };
  themes?: string[];
  competitors?: Array<{
    name: string;
    advantage?: string;
    contentStyle?: string;
  }>;
  platformPreferences?: {
    primary?: string[];
    secondary?: string[];
  };
}

interface SocialPostRequest {
  platform: 'linkedin' | 'twitter' | 'x';
  topic?: string;
  format?: 'post' | 'thread' | 'carousel';
  brandContext: BrandContext;
  competitorInsights?: string;
  targetAudience?: string;
}

interface SocialPostResponse {
  content: string;
  hook?: string;
  hashtags?: string[];
  estimatedEngagement?: string;
  personalizationNotes?: string;
}

/**
 * Determine platform preferences based on industry, niche, and brand type
 * Enhanced with industry-specific insights and audience behavior patterns
 * Exported for use in other services
 */
export function determinePlatformPreferences(
  industry: string | undefined,
  niche: string | undefined,
  companySize: string | undefined,
  brandVoice?: { style?: string; tone?: string }
): { primary: string[]; secondary: string[]; rationale: string } {
  const industryLower = (industry || '').toLowerCase();
  const nicheLower = (niche || '').toLowerCase();
  const voiceStyle = (brandVoice?.style || '').toLowerCase();
  
  // Sports, fitness, entertainment, gaming -> Twitter/Instagram (not LinkedIn)
  // These audiences are highly active on Twitter and Instagram, less so on LinkedIn
  if (
    industryLower.includes('sport') ||
    industryLower.includes('fitness') ||
    industryLower.includes('athletic') ||
    industryLower.includes('entertainment') ||
    industryLower.includes('gaming') ||
    industryLower.includes('esports') ||
    nicheLower.includes('athletic') ||
    nicheLower.includes('sport') ||
    nicheLower.includes('fitness') ||
    nicheLower.includes('wellness')
  ) {
    return {
      primary: ['twitter', 'instagram'],
      secondary: ['tiktok', 'youtube'],
      rationale: 'Sports and fitness audiences are highly active on Twitter and Instagram, with real-time engagement and visual content preferences'
    };
  }
  
  // B2B, SaaS, Professional Services, Enterprise -> LinkedIn primary
  // These audiences prefer professional networking and thought leadership content
  if (
    industryLower.includes('saas') ||
    industryLower.includes('software') ||
    industryLower.includes('tech') ||
    industryLower.includes('professional') ||
    industryLower.includes('consulting') ||
    industryLower.includes('enterprise') ||
    industryLower.includes('b2b') ||
    (companySize && ['enterprise', 'enterprise-plus'].includes(companySize))
  ) {
    return {
      primary: ['linkedin'],
      secondary: ['twitter', 'youtube'],
      rationale: 'B2B and enterprise audiences prefer LinkedIn for professional insights and thought leadership'
    };
  }
  
  // DTC, E-commerce, Consumer, Fashion, Beauty -> Instagram/TikTok primary
  // Visual platforms drive discovery and purchase decisions
  if (
    industryLower.includes('ecommerce') ||
    industryLower.includes('retail') ||
    industryLower.includes('consumer') ||
    industryLower.includes('fashion') ||
    industryLower.includes('beauty') ||
    industryLower.includes('cosmetics') ||
    industryLower.includes('apparel') ||
    nicheLower.includes('fashion') ||
    nicheLower.includes('beauty')
  ) {
    return {
      primary: ['instagram', 'tiktok'],
      secondary: ['twitter', 'pinterest'],
      rationale: 'Consumer and fashion brands thrive on visual platforms where discovery and inspiration drive engagement'
    };
  }
  
  // Healthcare, Finance, Legal -> LinkedIn + Twitter (professional but accessible)
  if (
    industryLower.includes('healthcare') ||
    industryLower.includes('health') ||
    industryLower.includes('finance') ||
    industryLower.includes('financial') ||
    industryLower.includes('legal') ||
    industryLower.includes('law')
  ) {
    return {
      primary: ['linkedin', 'twitter'],
      secondary: ['youtube'],
      rationale: 'Regulated industries balance professional credibility (LinkedIn) with accessible education (Twitter)'
    };
  }
  
  // Education, EdTech -> LinkedIn + Twitter + YouTube
  if (
    industryLower.includes('education') ||
    industryLower.includes('edtech') ||
    industryLower.includes('learning') ||
    industryLower.includes('training')
  ) {
    return {
      primary: ['linkedin', 'youtube'],
      secondary: ['twitter', 'instagram'],
      rationale: 'Education brands leverage LinkedIn for B2B and YouTube for long-form educational content'
    };
  }
  
  // Default: Balanced approach based on company size
  if (companySize && ['startup', 'small'].includes(companySize)) {
    return {
      primary: ['twitter', 'instagram'],
      secondary: ['linkedin'],
      rationale: 'Smaller companies often start with Twitter and Instagram for faster engagement and community building'
    };
  }
  
  return {
    primary: ['linkedin', 'twitter'],
    secondary: ['instagram'],
    rationale: 'Balanced approach for general business audiences'
  };
}

/**
 * Generate personalized LinkedIn post
 */
export async function generateLinkedInPost(
  request: SocialPostRequest
): Promise<SocialPostResponse> {
  const { brandContext, topic, competitorInsights, targetAudience } = request;
  
  // Determine optimal LinkedIn approach based on company size and industry
  const companySize = brandContext.companySize || 'medium';
  const industry = brandContext.industry || 'General';
  const isEnterprise = ['enterprise', 'enterprise-plus'].includes(companySize);
  const isB2B = industry.toLowerCase().includes('saas') || 
                industry.toLowerCase().includes('software') ||
                industry.toLowerCase().includes('professional');
  
  // LinkedIn content style varies by company size
  const linkedInStyle = isEnterprise 
    ? 'thought leadership with data, industry insights, strategic perspectives'
    : isB2B
    ? 'professional insights, actionable advice, industry trends'
    : 'authentic storytelling, behind-the-scenes, value-driven content';
  
  const brandVoice = brandContext.brandVoice || {};
  const voiceStyle = brandVoice.style || 'professional';
  const tone = brandVoice.tone || 'friendly';
  const formality = brandVoice.formality || (isEnterprise ? 'professional' : 'conversational');
  
  const competitorContext = brandContext.competitors && brandContext.competitors.length > 0
    ? `\n\nCOMPETITOR INTELLIGENCE:
${brandContext.competitors.map(c => 
  `- ${c.name}: ${c.advantage || c.contentStyle || 'Strong content presence'}`
).join('\n')}
Your content must differentiate from competitors while learning from their successful patterns.`
    : '';
  
  const prompt = `You are an enterprise-level content strategist creating LinkedIn content for ${brandContext.name}, a ${industry} company${brandContext.niche ? ` in the ${brandContext.niche} niche` : ''}.

BRAND CONTEXT:
- Company: ${brandContext.name}
- Industry: ${industry}
${brandContext.niche ? `- Niche: ${brandContext.niche}` : ''}
- Company Size: ${companySize}
- What they do: ${brandContext.description || 'Not specified'}
- Brand Voice: ${voiceStyle}, ${tone}, ${formality}
${brandContext.themes && brandContext.themes.length > 0 ? `- Content Themes: ${brandContext.themes.join(', ')}` : ''}
${competitorInsights ? `- Competitor Insights: ${competitorInsights}` : ''}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${competitorContext}

LINKEDIN CONTENT REQUIREMENTS (Enterprise-Level Quality - StoryArb Standard):

1. **Hook (First 125 Characters - Critical for Algorithm)**:
   Must stop the scroll in 0.5 seconds. The first 125 characters determine visibility.
   Use one of these proven patterns:
   - Personal story with lesson: "I made a $${isEnterprise ? '10M' : '100K'} mistake. Here's what I learned:"
   - Contrarian take: "Stop doing [common ${industry} practice]. Do [this] instead."
   - Transformation: "3 years ago I was [X]. Today I [Y]. Here's how:"
   - Industry insight: "The ${industry} industry is broken. Here's why:"
   - Data-driven: "After analyzing ${isEnterprise ? '500' : '50'} ${industry} companies, I found [surprising insight]:"
   - Question hook: "Why do ${industry} companies keep making the same mistake?"
   - Pattern break: "Everyone in ${industry} does [X]. The winners do [Y] instead."

2. **Structure (Optimized for LinkedIn Algorithm)**:
   - **Hook** (1-2 lines, 125 chars max for preview)
   - **Context/Story** (2-3 lines) - Build credibility and relatability
   - **Key Insight/Lesson** (3-5 lines) - The core value, use line breaks for readability
   - **Supporting Evidence** (1-2 lines) - Data, example, or proof point
   - **Actionable Takeaway** (1-2 lines) - What readers can do differently
   - **Engagement Question** (1 line) - Drive comments and discussion

3. **Tone & Style**: ${linkedInStyle}
   - Match brand voice EXACTLY: ${voiceStyle}, ${tone}, ${formality}
   ${brandVoice.vocabulary && brandVoice.vocabulary.length > 0 ? `- Use brand vocabulary: ${brandVoice.vocabulary.slice(0, 5).join(', ')}` : ''}
   - Professional but human - write like a person, not a corporation
   - Value-first, never promotional - educate before you sell
   - Authentic and relatable - real experiences, not marketing speak
   - Industry-native - use ${industry} terminology naturally

4. **Length**: 150-300 words (optimal for LinkedIn engagement)
   - First 125 characters are critical (appear in feed preview)
   - Use line breaks every 2-3 sentences for readability
   - End with engagement hook (question or call-to-action)

5. **Personalization (Deep Industry & Brand Integration)**:
   - Reference ${brandContext.name}'s specific industry/niche: ${industry}${brandContext.niche ? ` / ${brandContext.niche}` : ''}
   - Use industry-specific terminology that ${industry} professionals use daily
   - Address pain points that ${industry} professionals face (be specific)
   - Include insights that only ${brandContext.name} could provide (unique perspective)
   - Reference ${companySize === 'enterprise' || companySize === 'enterprise-plus' ? 'enterprise-level' : companySize} context appropriately
   ${brandContext.competitors && brandContext.competitors.length > 0 ? `- Differentiate from: ${brandContext.competitors.map(c => c.name).join(', ')}` : ''}
   ${brandContext.themes && brandContext.themes.length > 0 ? `- Align with brand themes: ${brandContext.themes.slice(0, 3).join(', ')}` : ''}

${topic ? `\nTOPIC FOCUS: ${topic}` : ''}

Generate a LinkedIn post that:
- Sounds like it was written by a senior executive or thought leader at ${brandContext.name}
- Provides genuine value to ${industry} professionals
- Differentiates from competitors
- Maintains ${brandContext.name}'s brand voice
- Is ready to publish (no placeholders)

Return JSON:
{
  "content": "Full LinkedIn post text (150-300 words)",
  "hook": "The opening hook line",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "estimatedEngagement": "Expected engagement prediction",
  "personalizationNotes": "How this was personalized for ${brandContext.name}"
}`;

  const systemPrompt = `You are an elite LinkedIn content strategist creating posts that consistently generate 10K+ impressions and 500+ engagements.

Your content quality matches enterprise partners like StoryArb, who excel at:
- **Thought-provoking insights**: Challenge conventional wisdom with fresh perspectives
- **Industry-specific expertise**: Deep knowledge that only insiders can provide
- **Authentic storytelling**: Real experiences, not corporate speak
- **Data-driven perspectives**: Statistics and research that support claims
- **Actionable takeaways**: Concrete steps readers can implement immediately
- **Strategic positioning**: Content that elevates brand authority
- **Emotional resonance**: Connects on both intellectual and emotional levels

QUALITY STANDARDS (StoryArb-Level):
1. **Brand-specific**: Every word feels uniquely ${brandContext.name}, not generic or templated
2. **Industry-relevant**: Speaks directly to ${industry} professionals' pain points and aspirations
3. **Voice-authentic**: Perfectly matches ${brandContext.name}'s ${voiceStyle}, ${tone}, ${formality} voice
4. **Competitor-aware**: Differentiates from competitors while learning from their successful patterns
5. **Platform-optimized**: Engineered for LinkedIn's algorithm (first 125 characters critical, engagement hooks, optimal length)
6. **Value-first**: Provides genuine value before any promotion
7. **Engagement-optimized**: Includes questions, insights, or calls-to-action that drive comments and shares

CONTENT PHILOSOPHY:
- Write like a thought leader, not a marketer
- Lead with value, not with your product
- Be specific, not generic
- Use data and stories, not fluff
- Create content only ${brandContext.name} could create

Quality standard: Enterprise-level, billion-dollar company quality. Every post should feel like it was crafted by a $10M+ content team.`;

  try {
    const result = await generateJSON<SocialPostResponse>(
      prompt,
      systemPrompt,
      { tier: 'basic' }
    );
    
    return result || {
      content: `[Error generating LinkedIn post]`,
      hook: '',
      hashtags: [],
      estimatedEngagement: 'Unknown',
      personalizationNotes: 'Generation failed'
    };
  } catch (error: any) {
    console.error('Error generating LinkedIn post:', error);
    throw new Error(`Failed to generate LinkedIn post: ${error.message}`);
  }
}

/**
 * Generate personalized Twitter/X post
 */
export async function generateTwitterPost(
  request: SocialPostRequest
): Promise<SocialPostResponse> {
  const { brandContext, topic, competitorInsights, format = 'post' } = request;
  
  const industry = brandContext.industry || 'General';
  const brandVoice = brandContext.brandVoice || {};
  const voiceStyle = brandVoice.style || 'conversational';
  const tone = brandVoice.tone || 'friendly';
  
  // Determine if this is a thread or single tweet
  const isThread = format === 'thread';
  
  const competitorContext = brandContext.competitors && brandContext.competitors.length > 0
    ? `\n\nCOMPETITOR INTELLIGENCE:
${brandContext.competitors.map(c => 
  `- ${c.name}: ${c.advantage || c.contentStyle || 'Strong presence'}`
).join('\n')}
Your content must stand out from competitors.`
    : '';
  
  const prompt = `You are an elite Twitter/X content creator crafting ${isThread ? 'a viral thread' : 'a high-engagement tweet'} for ${brandContext.name}, a ${industry} company${brandContext.niche ? ` in the ${brandContext.niche} niche` : ''}.

BRAND CONTEXT:
- Company: ${brandContext.name}
- Industry: ${industry}
${brandContext.niche ? `- Niche: ${brandContext.niche}` : ''}
- Company Size: ${brandContext.companySize || 'medium'}
- What they do: ${brandContext.description || 'Not specified'}
- Brand Voice: ${voiceStyle}, ${tone}
${brandContext.themes && brandContext.themes.length > 0 ? `- Content Themes: ${brandContext.themes.join(', ')}` : ''}
${competitorInsights ? `- Competitor Insights: ${competitorInsights}` : ''}
${competitorContext}

TWITTER/X CONTENT REQUIREMENTS (Enterprise-Level Quality - StoryArb Standard):

${isThread ? `
THREAD FORMAT (5-10 tweets):
1. **Hook Tweet (Tweet 1)**: Must stop the scroll instantly. First 10 words are critical.
   Proven patterns:
   - "I spent [time] researching ${industry}. Here's what nobody tells you:"
   - "Hot take: [controversial but valuable ${industry} opinion]"
   - "[Number] things I learned building ${brandContext.name}:"
   - "Unpopular opinion: [${industry} common practice] is actually [counter-intuitive truth]"
   - "The ${industry} industry doesn't want you to know:"
   - "After analyzing [X] ${industry} companies, I found:"

2. **Structure (Optimized for Twitter Algorithm)**:
   - Tweet 1: Hook (240-280 chars, first 10 words critical)
   - Tweets 2-4: Core insights/points (each 240-280 chars)
   - Tweet 5-7: Examples, data, proof (240-280 chars each)
   - Final tweet: Key takeaway + engagement CTA (240-280 chars)

3. **Each Tweet Requirements**:
   - 240-280 characters (optimal for engagement and algorithm)
   - Stands alone but builds narrative arc
   - Uses line breaks (every 2-3 lines) for readability
   - Includes engagement hooks (questions, surprising facts, calls-to-action)
   - Numbered format: "1/", "2/", etc. for thread navigation
` : `
SINGLE TWEET FORMAT:
1. **Hook (First 10 Words - Critical)**: Must grab attention instantly
   Patterns:
   - Question: "Why do ${industry} companies..."
   - Statement: "The biggest mistake in ${industry}..."
   - Contrarian: "Everyone in ${industry} thinks X. They're wrong."
   - Data: "After analyzing [X], I found..."

2. **Structure**: 
   - Hook (10-15 words, first 10 are critical)
   - Value/Insight (remaining space, 200-250 chars)
   - Optional: Question or CTA (last 20-30 chars)

3. **Length**: 240-280 characters (optimal for engagement and algorithm)
4. **Style**: Punchy, conversational, value-packed, scannable
5. **Line Breaks**: Use strategically for readability (every 2-3 sentences)
`}

4. **Tone & Style**: 
   - Match brand voice EXACTLY: ${voiceStyle}, ${tone}
   ${brandVoice.vocabulary && brandVoice.vocabulary.length > 0 ? `- Use brand vocabulary: ${brandVoice.vocabulary.slice(0, 5).join(', ')}` : ''}
   - Conversational but authoritative - write like a thought leader
   - Quick, scannable, value-dense - every word counts
   - Platform-native (Twitter culture) - understand Twitter's unique voice
   - Industry-native - use ${industry} terminology naturally

5. **Personalization (Deep Industry & Brand Integration)**:
   - Reference ${brandContext.name}'s specific industry: ${industry}${brandContext.niche ? ` / ${brandContext.niche}` : ''}
   - Use industry-appropriate language that ${industry} professionals use
   - Address ${industry} audience directly (speak their language)
   - Include insights unique to ${brandContext.name} (what only they could say)
   ${brandContext.companySize ? `- Reference ${brandContext.companySize} context appropriately` : ''}
   ${brandContext.competitors && brandContext.competitors.length > 0 ? `- Differentiate from: ${brandContext.competitors.map(c => c.name).join(', ')}` : ''}
   ${brandContext.themes && brandContext.themes.length > 0 ? `- Align with brand themes: ${brandContext.themes.slice(0, 3).join(', ')}` : ''}

${topic ? `\nTOPIC FOCUS: ${topic}` : ''}

Generate ${isThread ? 'a Twitter thread' : 'a Twitter post'} that:
- Sounds authentic to ${brandContext.name}'s brand voice
- Provides genuine value to ${industry} audience
- Differentiates from competitors
- Is optimized for Twitter/X engagement
- Is ready to publish (no placeholders)

${isThread ? `
Return JSON:
{
  "content": "Full thread text with tweet numbers (1/ 2/ etc.)",
  "hook": "The opening hook tweet",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "estimatedEngagement": "Expected engagement prediction",
  "personalizationNotes": "How this was personalized"
}` : `
Return JSON:
{
  "content": "Full tweet text (240-280 chars)",
  "hook": "The opening hook",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "estimatedEngagement": "Expected engagement prediction",
  "personalizationNotes": "How this was personalized"
}`}`;

  const systemPrompt = `You are an elite Twitter/X content strategist creating ${isThread ? 'threads' : 'tweets'} that consistently generate 10K+ impressions and 500+ engagements.

Your content quality matches enterprise partners like StoryArb, who excel at:
- **Scroll-stopping hooks**: First 10 words must grab attention instantly
- **Value-dense insights**: Every word delivers value, no fluff
- **Industry-specific expertise**: Deep knowledge that resonates with ${industry} audience
- **Authentic brand voice**: Perfectly matches ${brandContext.name}'s ${voiceStyle}, ${tone} voice
- **Platform-native engagement**: Understands Twitter culture and algorithm
- **Thread mastery**: If thread, each tweet builds narrative while standing alone
- **Timing awareness**: Content that works in real-time feed context

QUALITY STANDARDS (StoryArb-Level):
1. **Brand-specific**: Every word feels uniquely ${brandContext.name}, not generic
2. **Industry-relevant**: Speaks directly to ${industry} audience's interests and pain points
3. **Voice-authentic**: Perfectly matches ${brandContext.name}'s ${voiceStyle}, ${tone} voice
4. **Competitor-aware**: Differentiates from competitors while learning from their success
5. **Platform-optimized**: Engineered for Twitter/X algorithm (240-280 chars optimal, engagement hooks)
6. **Value-first**: Provides genuine value before any promotion
7. **Engagement-optimized**: Includes hooks, questions, or CTAs that drive replies and retweets

CONTENT PHILOSOPHY:
- Write like a thought leader, not a marketer
- Lead with value, not with your product
- Be specific and punchy, not generic and wordy
- Use data and stories, not fluff
- Create content only ${brandContext.name} could create
- Understand Twitter culture: quick, scannable, value-packed

Quality standard: Enterprise-level, billion-dollar company quality. Every ${isThread ? 'thread' : 'tweet'} should feel like it was crafted by a $10M+ content team.`;

  try {
    const result = await generateJSON<SocialPostResponse>(
      prompt,
      systemPrompt,
      { tier: 'basic' }
    );
    
    return result || {
      content: `[Error generating Twitter post]`,
      hook: '',
      hashtags: [],
      estimatedEngagement: 'Unknown',
      personalizationNotes: 'Generation failed'
    };
  } catch (error: any) {
    console.error('Error generating Twitter post:', error);
    throw new Error(`Failed to generate Twitter post: ${error.message}`);
  }
}

/**
 * Generate social media post based on platform
 */
export async function generateSocialPost(
  request: SocialPostRequest
): Promise<SocialPostResponse> {
  const platform = request.platform.toLowerCase();
  
  if (platform === 'linkedin' || platform === 'linkedin.com') {
    return generateLinkedInPost(request);
  } else if (platform === 'twitter' || platform === 'x' || platform === 'x.com') {
    return generateTwitterPost(request);
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Enhance existing content ideas with personalized post content
 */
export async function enhanceContentIdeaWithPostContent(
  contentIdea: any,
  brandContext: BrandContext
): Promise<any> {
  const platform = contentIdea.platform?.toLowerCase() || 'twitter';
  const format = contentIdea.format || 'post';
  
  // Determine platform preferences with enhanced logic
  const platformPrefs = brandContext.platformPreferences || 
    determinePlatformPreferences(
      brandContext.industry,
      brandContext.niche,
      brandContext.companySize,
      brandContext.brandVoice
    );
  
  // Check if platform matches brand's primary platforms
  const isPrimaryPlatform = platformPrefs.primary.includes(platform);
  const isSecondaryPlatform = platformPrefs.secondary.includes(platform);
  
  if (!isPrimaryPlatform && !isSecondaryPlatform) {
    // Platform doesn't match brand preferences - log rationale
    console.log(`Platform ${platform} doesn't match brand preferences for ${brandContext.name}`);
    console.log(`Recommended platforms: ${platformPrefs.primary.join(', ')} (primary), ${platformPrefs.secondary.join(', ')} (secondary)`);
    console.log(`Rationale: ${platformPrefs.rationale || 'General business audience'}`);
  }
  
  try {
    const postContent = await generateSocialPost({
      platform: platform === 'x' ? 'twitter' : platform as 'linkedin' | 'twitter',
      topic: contentIdea.theme || contentIdea.title,
      format: format === 'thread' ? 'thread' : 'post',
      brandContext,
      competitorInsights: brandContext.competitors?.map(c => 
        `${c.name}: ${c.advantage || c.contentStyle}`
      ).join('; ')
    });
    
    return {
      ...contentIdea,
      generatedContent: postContent.content,
      hook: postContent.hook,
      hashtags: postContent.hashtags,
      estimatedEngagement: postContent.estimatedEngagement,
      personalizationNotes: postContent.personalizationNotes
    };
  } catch (error: any) {
    console.error('Error enhancing content idea:', error);
    return contentIdea; // Return original if enhancement fails
  }
}

