/**
 * Review Agent - Quality Assurance
 * Ensures highest quality content through multi-layer review
 */

import { generateText, generateJSON } from '../llmService';

interface ReviewContext {
  content?: any;
  brandDNA?: any;
  competitorIntelligence?: any[];
  strategicInsights?: any[];
  contentType?: string;
  platform?: string;
}

interface ReviewResult {
  approved: boolean;
  qualityScore: number;
  issues: string[];
  improvements: string[];
  reviewedContent?: any;
  rejectionReason?: string;
}

/**
 * Review Agent implementation
 */
export const reviewAgent = {
  /**
   * Execute review task
   */
  async execute(task: string, context: ReviewContext): Promise<any> {
    console.log(`[Review Agent] Executing task: ${task}`);

    switch (task) {
      case 'review-content-quality':
        return await reviewContentQuality(context);
      case 'review-text-content':
        return await reviewTextContent(context);
      case 'review-image-content':
        return await reviewImageContent(context);
      case 'review-video-content':
        return await reviewVideoContent(context);
      case 'final-quality-check':
        return await finalQualityCheck(context);
      default:
        throw new Error(`Unknown review task: ${task}`);
    }
  },
};

/**
 * Review content quality with multi-layer checks
 */
async function reviewContentQuality(context: ReviewContext): Promise<ReviewResult> {
  const { content, brandDNA, competitorIntelligence, strategicInsights } = context;

  console.log(`[Review Agent] ========================================`);
  console.log(`[Review Agent] reviewContentQuality called`);
  console.log(`[Review Agent] Has content: ${!!content}`);
  console.log(`[Review Agent] Has brandDNA: ${!!brandDNA}`);
  console.log(`[Review Agent] Competitors: ${competitorIntelligence?.length || 0}`);

  if (!content) {
    console.error(`[Review Agent] ❌ ERROR: Content required for review`);
    throw new Error('Content required for review');
  }

  try {
    const issues: string[] = [];
    const improvements: string[] = [];
    let qualityScore = 100;

    // Layer 1: Text Quality Review
    if (content.text || content.description || content.title) {
      const textReview = await reviewTextContent(context);
      if (!textReview.approved) {
        issues.push(...textReview.issues);
        improvements.push(...textReview.improvements);
        qualityScore -= 30;
      } else {
        content.text = textReview.reviewedContent?.text || content.text;
        content.description = textReview.reviewedContent?.description || content.description;
        content.title = textReview.reviewedContent?.title || content.title;
      }
    }

    // Layer 2: Brand Alignment Check
    const brandAlignment = await checkBrandAlignment(content, brandDNA);
    if (!brandAlignment.aligned) {
      issues.push(...brandAlignment.issues);
      improvements.push(...brandAlignment.suggestions);
      qualityScore -= 25;
    }

    // Layer 3: Competitor Benchmarking
    if (competitorIntelligence && competitorIntelligence.length > 0) {
      const benchmark = await benchmarkAgainstCompetitors(content, competitorIntelligence);
      if (benchmark.score < 70) {
        issues.push(`Content may not perform as well as competitor content`);
        improvements.push(...benchmark.improvements);
        qualityScore -= 15;
      }
    }

    // Layer 4: Strategic Alignment
    if (strategicInsights && strategicInsights.length > 0) {
      const strategicCheck = await checkStrategicAlignment(content, strategicInsights);
      if (!strategicCheck.aligned) {
        issues.push(...strategicCheck.issues);
        improvements.push(...strategicCheck.suggestions);
        qualityScore -= 10;
      }
    }

    // Layer 5: Platform Optimization
    if (context.platform) {
      const platformCheck = await checkPlatformOptimization(content, context.platform);
      if (!platformCheck.optimized) {
        issues.push(...platformCheck.issues);
        improvements.push(...platformCheck.suggestions);
        qualityScore -= 10;
      }
    }

    const approved = qualityScore >= 70 && issues.length < 3;

    console.log(`[Review Agent] Quality Score: ${qualityScore}/100`);
    console.log(`[Review Agent] Issues: ${issues.length}`);
    console.log(`[Review Agent] Approved: ${approved}`);
    console.log(`[Review Agent] ========================================`);

    return {
      approved,
      qualityScore: Math.max(0, qualityScore),
      issues,
      improvements,
      reviewedContent: approved ? content : undefined,
      rejectionReason: approved ? undefined : `Quality score too low (${qualityScore}/100) or too many issues (${issues.length})`,
    };
  } catch (error: any) {
    console.error('[Review Agent] Content quality review error:', error);
    throw error;
  }
}

/**
 * Review text content for quality, grammar, engagement
 */
async function reviewTextContent(context: ReviewContext): Promise<ReviewResult> {
  const { content, brandDNA } = context;

  const text = content.text || content.description || content.title || '';
  if (!text) {
    return {
      approved: true,
      qualityScore: 100,
      issues: [],
      improvements: [],
      reviewedContent: content,
    };
  }

  try {
    const prompt = `Review this content for quality, ensuring it meets professional standards:

Content to Review:
${text}

Brand Voice Guidelines:
${brandDNA ? JSON.stringify(brandDNA.voice || {}, null, 2) : 'Not provided'}

Check for:
1. Grammar and spelling errors
2. Clarity and readability
3. Engagement potential (hooks, calls-to-action)
4. Brand voice consistency
5. Appropriate tone for target audience
6. Professional quality

Return JSON with:
- approved: boolean
- qualityScore: number (0-100)
- issues: string[] (specific problems found)
- improvements: string[] (suggested improvements)
- reviewedText: string (improved version if changes needed)`;

    const systemPrompt = 'You are an expert content reviewer. Provide thorough, constructive feedback.';

    const review = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    const reviewedContent = { ...content };
    if (review.reviewedText) {
      if (content.text) reviewedContent.text = review.reviewedText;
      if (content.description) reviewedContent.description = review.reviewedText;
      if (content.title) reviewedContent.title = review.reviewedText;
    }

    return {
      approved: review.approved !== false,
      qualityScore: review.qualityScore || 80,
      issues: review.issues || [],
      improvements: review.improvements || [],
      reviewedContent: review.approved !== false ? reviewedContent : content,
    };
  } catch (error: any) {
    console.error('[Review Agent] Text review error:', error);
    // Fail open - approve if review fails
    return {
      approved: true,
      qualityScore: 80,
      issues: [],
      improvements: [],
      reviewedContent: content,
    };
  }
}

/**
 * Review image content for quality and appropriateness
 */
async function reviewImageContent(context: ReviewContext): Promise<ReviewResult> {
  const { content } = context;

  if (!content.imageUrl && !content.mediaUrl) {
    return {
      approved: true,
      qualityScore: 100,
      issues: [],
      improvements: [],
      reviewedContent: content,
    };
  }

  try {
    // Check if image URL is valid and accessible
    const imageUrl = content.imageUrl || content.mediaUrl;
    
    // In a real implementation, this would:
    // 1. Download and analyze image
    // 2. Check resolution, format, quality
    // 3. Verify brand alignment
    // 4. Check for inappropriate content
    
    // For now, basic validation
    const issues: string[] = [];
    const improvements: string[] = [];

    if (!imageUrl || typeof imageUrl !== 'string') {
      issues.push('Invalid or missing image URL');
      return {
        approved: false,
        qualityScore: 0,
        issues,
        improvements,
        rejectionReason: 'Invalid image URL',
      };
    }

    // Check URL format
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      issues.push('Image URL must be a valid HTTP/HTTPS URL');
    }

    return {
      approved: issues.length === 0,
      qualityScore: issues.length === 0 ? 90 : 50,
      issues,
      improvements,
      reviewedContent: content,
    };
  } catch (error: any) {
    console.error('[Review Agent] Image review error:', error);
    return {
      approved: false,
      qualityScore: 0,
      issues: ['Image review failed'],
      improvements: [],
      rejectionReason: error.message,
    };
  }
}

/**
 * Review video content
 */
async function reviewVideoContent(context: ReviewContext): Promise<ReviewResult> {
  const { content } = context;

  if (!content.videoUrl && !content.mediaUrl) {
    return {
      approved: true,
      qualityScore: 100,
      issues: [],
      improvements: [],
      reviewedContent: content,
    };
  }

  // Similar to image review but for video
  const videoUrl = content.videoUrl || content.mediaUrl;
  const issues: string[] = [];

  if (!videoUrl || typeof videoUrl !== 'string') {
    issues.push('Invalid or missing video URL');
    return {
      approved: false,
      qualityScore: 0,
      issues,
      improvements: [],
      rejectionReason: 'Invalid video URL',
    };
  }

  return {
    approved: issues.length === 0,
    qualityScore: issues.length === 0 ? 90 : 50,
    issues,
    improvements: [],
    reviewedContent: content,
  };
}

/**
 * Check brand alignment
 */
async function checkBrandAlignment(content: any, brandDNA?: any): Promise<{
  aligned: boolean;
  issues: string[];
  suggestions: string[];
}> {
  if (!brandDNA) {
    return { aligned: true, issues: [], suggestions: [] };
  }

  try {
    const prompt = `Check if this content aligns with the brand DNA:

Content:
${JSON.stringify(content, null, 2)}

Brand DNA:
${JSON.stringify(brandDNA, null, 2)}

Check for:
1. Voice and tone consistency
2. Theme alignment
3. Target audience match
4. Brand values representation

Return JSON with:
- aligned: boolean
- issues: string[] (misalignments found)
- suggestions: string[] (how to improve alignment)`;

    const systemPrompt = 'You are a brand alignment expert. Ensure content matches brand identity.';

    const result = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    return {
      aligned: result.aligned !== false,
      issues: result.issues || [],
      suggestions: result.suggestions || [],
    };
  } catch (error: any) {
    console.error('[Review Agent] Brand alignment check error:', error);
    return { aligned: true, issues: [], suggestions: [] };
  }
}

/**
 * Benchmark content against competitors
 */
async function benchmarkAgainstCompetitors(
  content: any,
  competitorIntelligence: any[]
): Promise<{
  score: number;
  improvements: string[];
}> {
  try {
    const topCompetitors = competitorIntelligence
      .filter(c => c.topViralContent && c.topViralContent.length > 0)
      .slice(0, 3);

    if (topCompetitors.length === 0) {
      return { score: 80, improvements: [] };
    }

    const competitorExamples = topCompetitors.flatMap(c =>
      (c.topViralContent || []).slice(0, 2).map((v: any) => ({
        competitor: c.name,
        title: v.title,
        whyItWorked: v.whyItWorked,
        engagement: v.estimatedEngagement,
      }))
    );

    const prompt = `Compare this content against top-performing competitor content:

Your Content:
${JSON.stringify(content, null, 2)}

Competitor Success Examples:
${JSON.stringify(competitorExamples, null, 2)}

Analyze:
1. Engagement potential comparison
2. What makes competitor content successful
3. How to improve your content to match/exceed competitor performance

Return JSON with:
- score: number (0-100, how well it compares)
- improvements: string[] (specific ways to improve)`;

    const systemPrompt = 'You are a competitive content analyst. Help content beat competitors.';

    const result = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    return {
      score: result.score || 70,
      improvements: result.improvements || [],
    };
  } catch (error: any) {
    console.error('[Review Agent] Competitor benchmarking error:', error);
    return { score: 75, improvements: [] };
  }
}

/**
 * Check strategic alignment
 */
async function checkStrategicAlignment(
  content: any,
  strategicInsights: any[]
): Promise<{
  aligned: boolean;
  issues: string[];
  suggestions: string[];
}> {
  try {
    const relevantInsights = strategicInsights.slice(0, 3);

    const prompt = `Check if this content aligns with strategic insights:

Content:
${JSON.stringify(content, null, 2)}

Strategic Insights:
${JSON.stringify(relevantInsights, null, 2)}

Return JSON with:
- aligned: boolean
- issues: string[] (strategic misalignments)
- suggestions: string[] (how to align better)`;

    const systemPrompt = 'You are a strategic content advisor. Ensure content supports business goals.';

    const result = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    return {
      aligned: result.aligned !== false,
      issues: result.issues || [],
      suggestions: result.suggestions || [],
    };
  } catch (error: any) {
    console.error('[Review Agent] Strategic alignment check error:', error);
    return { aligned: true, issues: [], suggestions: [] };
  }
}

/**
 * Check platform optimization
 */
async function checkPlatformOptimization(
  content: any,
  platform: string
): Promise<{
  optimized: boolean;
  issues: string[];
  suggestions: string[];
}> {
  try {
    const platformRequirements: Record<string, any> = {
      twitter: { maxLength: 280, hashtags: true, mentions: true },
      instagram: { maxLength: 2200, hashtags: true, visual: true },
      linkedin: { maxLength: 3000, professional: true, longForm: true },
      facebook: { maxLength: 5000, engaging: true },
      tiktok: { video: true, short: true, trending: true },
    };

    const requirements = platformRequirements[platform.toLowerCase()] || {};

    const prompt = `Check if this content is optimized for ${platform}:

Content:
${JSON.stringify(content, null, 2)}

Platform Requirements:
${JSON.stringify(requirements, null, 2)}

Return JSON with:
- optimized: boolean
- issues: string[] (optimization problems)
- suggestions: string[] (how to optimize better)`;

    const systemPrompt = 'You are a platform optimization expert. Ensure content is perfectly formatted for the platform.';

    const result = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    return {
      optimized: result.optimized !== false,
      issues: result.issues || [],
      suggestions: result.suggestions || [],
    };
  } catch (error: any) {
    console.error('[Review Agent] Platform optimization check error:', error);
    return { optimized: true, issues: [], suggestions: [] };
  }
}

/**
 * Final quality check before content hub
 */
async function finalQualityCheck(context: ReviewContext): Promise<ReviewResult> {
  // Run all review layers
  const qualityReview = await reviewContentQuality(context);
  
  if (!qualityReview.approved) {
    return qualityReview;
  }

  // Additional final checks
  const finalIssues: string[] = [];
  
  // Check for placeholder text
  if (qualityReview.reviewedContent) {
    const text = JSON.stringify(qualityReview.reviewedContent).toLowerCase();
    if (text.includes('lorem ipsum') || text.includes('placeholder') || text.includes('example text')) {
      finalIssues.push('Contains placeholder text');
    }
  }

  // Check completeness
  if (qualityReview.reviewedContent) {
    if (!qualityReview.reviewedContent.title && !qualityReview.reviewedContent.text) {
      finalIssues.push('Content missing title and text');
    }
  }

  if (finalIssues.length > 0) {
    return {
      ...qualityReview,
      approved: false,
      issues: [...qualityReview.issues, ...finalIssues],
      rejectionReason: `Final check failed: ${finalIssues.join(', ')}`,
    };
  }

  return qualityReview;
}

