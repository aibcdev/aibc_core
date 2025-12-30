/**
 * Google Compliance Service - Ensure all content meets Google guidelines
 * Prevents spam detection and ensures E-E-A-T compliance
 */

import { BlogPost } from '../types/seo';
import { QualityCheck, validatePostForPublishing } from './contentQualityService';

export interface ComplianceReport {
  compliant: boolean;
  qualityScore: number;
  issues: string[];
  recommendations: string[];
  canPublish: boolean;
}

/**
 * Comprehensive Google compliance check
 */
export async function checkGoogleCompliance(
  post: BlogPost,
  allPosts: BlogPost[]
): Promise<ComplianceReport> {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let compliant = true;

  // 1. Quality check
  const qualityCheck = validatePostForPublishing(post, allPosts);
  
  if (!qualityCheck.valid) {
    compliant = false;
    issues.push(...qualityCheck.quality.issues);
  }
  if (qualityCheck.quality.warnings.length > 0) {
    recommendations.push(...qualityCheck.quality.warnings);
  }

  // 2. Content uniqueness (Google penalizes duplicate content)
  const { checkContentSimilarity } = await import('./contentVariationService');
  const similarity = await checkContentSimilarity(post.content || '', allPosts, 70);
  
  if (!similarity.isUnique) {
    compliant = false;
    issues.push(`Content too similar to existing post (${similarity.similarity.toFixed(1)}% similarity, need <70%)`);
  }

  // 3. Keyword stuffing check
  const keywordDensity = calculateKeywordDensity(post);
  if (keywordDensity > 2.5) {
    compliant = false;
    issues.push(`Potential keyword stuffing (${keywordDensity.toFixed(1)}% density, max 2-2.5%)`);
  }

  // 4. Thin content check
  const wordCount = post.word_count || (post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0);
  if (wordCount < 500) {
    compliant = false;
    issues.push(`Thin content (${wordCount} words, minimum 500 recommended)`);
  }

  // 5. Over-optimization check
  const internalLinks = Object.keys(post.internal_links || {}).length;
  if (internalLinks > 10) {
    compliant = false;
    issues.push(`Over-optimized internal linking (${internalLinks} links, max 10 recommended)`);
  }

  // 6. E-E-A-T signals
  if (!post.author || post.author === 'AIBC') {
    recommendations.push('Add specific author name for better E-E-A-T');
  }

  if (!post.structured_data || Object.keys(post.structured_data).length === 0) {
    recommendations.push('Add structured data for better search visibility');
  }

  // 7. Spam pattern detection
  const spamPatterns = detectSpamPatterns(post);
  if (spamPatterns.length > 0) {
    compliant = false;
    issues.push(`Spam patterns detected: ${spamPatterns.join(', ')}`);
  }

  // 8. Content freshness
  const publishedDate = post.published_at ? new Date(post.published_at) : new Date();
  const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // This is fine for new content, but good to note
  if (daysSincePublished > 365) {
    recommendations.push('Consider updating content for freshness');
  }

  return {
    compliant,
    qualityScore: qualityCheck.quality.score,
    issues,
    recommendations,
    canPublish: compliant && qualityCheck.quality.score >= 70,
  };
}

/**
 * Calculate keyword density
 */
function calculateKeywordDensity(post: BlogPost): number {
  if (!post.target_keywords || post.target_keywords.length === 0) return 0;
  if (!post.content) return 0;

  const content = post.content.toLowerCase().replace(/<[^>]*>/g, '');
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;

  if (totalWords === 0) return 0;

  let keywordCount = 0;
  for (const keyword of post.target_keywords) {
    const keywordLower = keyword.toLowerCase();
    const matches = content.match(new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
    keywordCount += matches ? matches.length : 0;
  }

  return (keywordCount / totalWords) * 100;
}

/**
 * Detect spam patterns
 */
function detectSpamPatterns(post: BlogPost): string[] {
  const patterns: string[] = [];
  const content = (post.content || '').toLowerCase();

  // 1. Excessive repetition of same phrase
  const phrases = content.match(/\b\w+\s+\w+\s+\w+\b/g) || [];
  const phraseFreq: Record<string, number> = {};
  for (const phrase of phrases) {
    phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
  }
  for (const [phrase, freq] of Object.entries(phraseFreq)) {
    if (freq > 5) {
      patterns.push(`Repetitive phrase: "${phrase}"`);
    }
  }

  // 2. Too many external links
  const externalLinks = (content.match(/<a[^>]*href=["'](https?:\/\/[^"']+)["']/g) || []).length;
  if (externalLinks > 15) {
    patterns.push(`Too many external links (${externalLinks})`);
  }

  // 3. Hidden text (spam technique)
  if (content.includes('display:none') || content.includes('visibility:hidden')) {
    patterns.push('Hidden text detected');
  }

  // 4. Cloaking patterns
  if (content.length > 0 && post.meta_description && 
      content.toLowerCase().includes(post.meta_description.toLowerCase().substring(0, 50))) {
    // This is actually fine, but checking for exact duplicates
    if (content === post.meta_description) {
      patterns.push('Content identical to meta description');
    }
  }

  return patterns;
}

/**
 * Generate Google-compliant content guidelines
 */
export function getGoogleComplianceGuidelines(): string {
  return `
GOOGLE COMPLIANCE GUIDELINES:

1. CONTENT QUALITY:
   - Minimum 500 words (1000+ preferred)
   - Unique content (70%+ uniqueness)
   - Natural keyword usage (1-2% density)
   - Proper grammar and readability

2. E-E-A-T SIGNALS:
   - Author attribution
   - Expertise indicators
   - Authority signals (structured data)
   - Trustworthiness markers

3. TECHNICAL SEO:
   - Proper heading structure (H1, H2, H3)
   - Meta descriptions (120-160 chars)
   - Internal links (3-7 per post)
   - External links (authoritative sources)

4. AVOID SPAM PATTERNS:
   - No keyword stuffing
   - No duplicate content
   - No hidden text
   - No over-optimization
   - Natural language only

5. INDEXING RATE LIMITS:
   - Max 200 URLs/day via Indexing API
   - Max 20 URLs/hour
   - Spread submissions throughout day
  `;
}


