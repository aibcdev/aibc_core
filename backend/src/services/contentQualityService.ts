/**
 * Content Quality Service - Ensure Google compliance and prevent spam detection
 * Implements E-E-A-T, uniqueness, and quality standards
 */

import { BlogPost } from '../types/seo';

export interface QualityCheck {
  passed: boolean;
  score: number;
  issues: string[];
  warnings: string[];
}

export interface ContentMetrics {
  wordCount: number;
  uniqueness: number; // 0-100
  readability: number; // 0-100
  keywordDensity: number;
  internalLinks: number;
  externalLinks: number;
  images: number;
  headings: number;
  eeatScore: number; // Experience, Expertise, Authoritativeness, Trustworthiness
}

/**
 * Check if content meets Google quality guidelines
 */
export function checkContentQuality(post: BlogPost, allPosts: BlogPost[]): QualityCheck {
  const issues: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // 1. Minimum word count (Google prefers substantial content)
  const wordCount = post.word_count || (post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0);
  if (wordCount < 500) {
    issues.push('Content too short (minimum 500 words recommended)');
    score -= 20;
  } else if (wordCount < 1000) {
    warnings.push('Content could be longer (1000+ words preferred)');
    score -= 5;
  }

  // 2. Check for duplicate content
  const uniqueness = calculateUniqueness(post, allPosts);
  if (uniqueness < 70) {
    issues.push(`Content too similar to existing posts (${uniqueness}% unique, need 70%+)`);
    score -= 30;
  } else if (uniqueness < 85) {
    warnings.push(`Content similarity warning (${uniqueness}% unique)`);
    score -= 10;
  }

  // 3. Keyword stuffing check
  const keywordDensity = calculateKeywordDensity(post);
  if (keywordDensity > 3) {
    issues.push(`Keyword stuffing detected (${keywordDensity}% density, max 2-3%)`);
    score -= 25;
  }

  // 4. Internal linking (not over-optimized)
  const internalLinkCount = Object.keys(post.internal_links || {}).length;
  if (internalLinkCount > 10) {
    warnings.push(`Too many internal links (${internalLinkCount}, max 10 recommended)`);
    score -= 5;
  }

  // 5. Content structure
  const headings = (post.content?.match(/<h[1-6][^>]*>/g) || []).length;
  if (headings < 3) {
    warnings.push('Content needs more structure (add headings)');
    score -= 5;
  }

  // 6. E-E-A-T signals
  const eeatScore = calculateEEATScore(post);
  if (eeatScore < 60) {
    warnings.push('E-E-A-T signals weak (add author, expertise indicators)');
    score -= 10;
  }

  // 7. Readability
  const readability = calculateReadability(post);
  if (readability < 50) {
    warnings.push('Content readability could be improved');
    score -= 5;
  }

  // 8. Check for spam patterns
  const spamPatterns = detectSpamPatterns(post);
  if (spamPatterns.length > 0) {
    issues.push(`Spam patterns detected: ${spamPatterns.join(', ')}`);
    score -= 50;
  }

  return {
    passed: issues.length === 0 && score >= 70,
    score: Math.max(0, score),
    issues,
    warnings,
  };
}

/**
 * Calculate content uniqueness compared to existing posts
 */
function calculateUniqueness(post: BlogPost, allPosts: BlogPost[]): number {
  if (allPosts.length === 0) return 100;

  const postContent = (post.content || '').toLowerCase().replace(/<[^>]*>/g, '');
  const postWords = new Set(postContent.split(/\s+/).filter(w => w.length > 4));

  let maxSimilarity = 0;

  for (const otherPost of allPosts.slice(0, 100)) { // Check against 100 most recent
    if (otherPost.id === post.id) continue;

    const otherContent = (otherPost.content || '').toLowerCase().replace(/<[^>]*>/g, '');
    const otherWords = new Set(otherContent.split(/\s+/).filter(w => w.length > 4));

    // Calculate Jaccard similarity
    const intersection = new Set([...postWords].filter(w => otherWords.has(w)));
    const union = new Set([...postWords, ...otherWords]);
    const similarity = (intersection.size / union.size) * 100;

    maxSimilarity = Math.max(maxSimilarity, similarity);
  }

  return Math.max(0, 100 - maxSimilarity);
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
 * Calculate E-E-A-T score
 */
function calculateEEATScore(post: BlogPost): number {
  let score = 0;

  // Author presence
  if (post.author && post.author !== 'AIBC') score += 20;
  else if (post.author) score += 10;

  // Structured data (authority signals)
  if (post.structured_data && Object.keys(post.structured_data).length > 0) score += 20;

  // Content depth (expertise)
  const wordCount = post.word_count || 0;
  if (wordCount > 2000) score += 20;
  else if (wordCount > 1000) score += 10;

  // Internal links (trust signals)
  const internalLinks = Object.keys(post.internal_links || {}).length;
  if (internalLinks >= 3 && internalLinks <= 7) score += 20;
  else if (internalLinks > 0) score += 10;

  // Category/tags (topic authority)
  if (post.category) score += 10;
  if (post.tags && post.tags.length > 0) score += 10;

  return Math.min(100, score);
}

/**
 * Calculate readability score
 */
function calculateReadability(post: BlogPost): number {
  if (!post.content) return 0;

  const content = post.content.replace(/<[^>]*>/g, '');
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgCharsPerWord = content.replace(/\s/g, '').length / words.length;

  // Flesch Reading Ease approximation
  // Higher score = easier to read
  let score = 100;
  score -= avgWordsPerSentence * 1.015; // Penalize long sentences
  score -= avgCharsPerWord * 84.6; // Penalize long words

  return Math.max(0, Math.min(100, score));
}

/**
 * Detect spam patterns
 */
function detectSpamPatterns(post: BlogPost): string[] {
  const patterns: string[] = [];
  const content = (post.content || '').toLowerCase();

  // 1. Excessive repetition
  const words = content.split(/\s+/);
  const wordFreq: Record<string, number> = {};
  for (const word of words) {
    if (word.length > 4) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }
  for (const [word, freq] of Object.entries(wordFreq)) {
    if (freq > words.length * 0.05) { // Word appears >5% of the time
      patterns.push(`Excessive repetition: "${word}"`);
    }
  }

  // 2. Too many links
  const linkCount = (content.match(/<a[^>]*>/g) || []).length;
  if (linkCount > 20) {
    patterns.push(`Too many links (${linkCount})`);
  }

  // 3. Suspicious keyword patterns
  if (post.target_keywords) {
    for (const keyword of post.target_keywords) {
      const keywordLower = keyword.toLowerCase();
      const keywordWords = keywordLower.split(/\s+/);
      // Check if keyword appears too frequently
      const keywordMatches = content.match(new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
      if (keywordMatches && keywordMatches.length > 20) {
        patterns.push(`Keyword overuse: "${keyword}"`);
      }
    }
  }

  // 4. Low content-to-HTML ratio
  const textContent = post.content?.replace(/<[^>]*>/g, '') || '';
  const htmlContent = post.content || '';
  const textRatio = textContent.length / htmlContent.length;
  if (textRatio < 0.5) {
    patterns.push('Low content-to-HTML ratio (too much markup)');
  }

  // 5. Missing essential elements
  if (!post.meta_description || post.meta_description.length < 50) {
    patterns.push('Missing or too short meta description');
  }

  if (!post.excerpt || post.excerpt.length < 100) {
    patterns.push('Missing or too short excerpt');
  }

  return patterns;
}

/**
 * Validate post before publishing
 */
export function validatePostForPublishing(post: BlogPost, allPosts: BlogPost[]): {
  valid: boolean;
  quality: QualityCheck;
  shouldPublish: boolean;
} {
  const quality = checkContentQuality(post, allPosts);

  // Don't publish if critical issues
  const shouldPublish = quality.passed && quality.score >= 70;

  return {
    valid: quality.passed,
    quality,
    shouldPublish,
  };
}

/**
 * Enhance post to meet quality standards
 */
export function enhancePostQuality(post: BlogPost): Partial<BlogPost> {
  const enhancements: Partial<BlogPost> = {};

  // Ensure minimum word count
  const wordCount = post.word_count || (post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0);
  if (wordCount < 1000 && post.content) {
    // Add more content sections
    const additionalContent = `
<h2>Additional Resources</h2>
<p>For more information about ${post.title}, consider exploring related topics and best practices in the field.</p>

<h2>Conclusion</h2>
<p>${post.title} represents an important aspect of modern content marketing and AI-driven strategies. By understanding the key principles and implementing best practices, you can achieve significant results.</p>
`;
    enhancements.content = (post.content || '') + additionalContent;
  }

  // Ensure meta description
  if (!post.meta_description || post.meta_description.length < 120) {
    const excerpt = post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 160) || '';
    enhancements.meta_description = excerpt.length >= 120 
      ? excerpt.substring(0, 160)
      : `${excerpt} Learn more about ${post.title} and best practices.`.substring(0, 160);
  }

  // Add author if missing
  if (!post.author) {
    enhancements.author = 'AIBC Content Team';
  }

  // Ensure proper category
  if (!post.category) {
    enhancements.category = 'Guides';
  }

  return enhancements;
}

/**
 * Rate limit indexing to avoid spam detection
 */
export class IndexingRateLimiter {
  private dailySubmissions: number = 0;
  private hourlySubmissions: number = 0;
  private lastReset: Date = new Date();

  // Google recommends:
  // - Max 200 URLs per day via Indexing API
  // - Spread submissions throughout the day
  private readonly MAX_DAILY = 200;
  private readonly MAX_HOURLY = 20;

  canSubmit(): boolean {
    this.resetIfNeeded();

    if (this.dailySubmissions >= this.MAX_DAILY) {
      return false;
    }

    if (this.hourlySubmissions >= this.MAX_HOURLY) {
      return false;
    }

    return true;
  }

  recordSubmission(): void {
    this.dailySubmissions++;
    this.hourlySubmissions++;
  }

  private resetIfNeeded(): void {
    const now = new Date();
    const hoursSinceReset = (now.getTime() - this.lastReset.getTime()) / (1000 * 60 * 60);

    if (hoursSinceReset >= 1) {
      this.hourlySubmissions = 0;
      this.lastReset = now;
    }

    const daysSinceReset = hoursSinceReset / 24;
    if (daysSinceReset >= 1) {
      this.dailySubmissions = 0;
    }
  }

  getRemainingDaily(): number {
    this.resetIfNeeded();
    return Math.max(0, this.MAX_DAILY - this.dailySubmissions);
  }

  getRemainingHourly(): number {
    this.resetIfNeeded();
    return Math.max(0, this.MAX_HOURLY - this.hourlySubmissions);
  }
}

// Singleton instance
export const indexingRateLimiter = new IndexingRateLimiter();




