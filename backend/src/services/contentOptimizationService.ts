/**
 * Content Optimization Service - SEO scoring, keyword optimization, readability
 */

import { BlogPost } from '../types/seo';

export interface SEOAnalysis {
  score: number;
  keywordDensity: number;
  readabilityScore: number;
  issues: string[];
  suggestions: string[];
  optimization: {
    title: boolean;
    metaDescription: boolean;
    headings: boolean;
    internalLinks: boolean;
    images: boolean;
    wordCount: boolean;
  };
}

/**
 * Calculate keyword density
 */
function calculateKeywordDensity(content: string, keyword: string): number {
  const text = content.replace(/<[^>]*>/g, ' ').toLowerCase();
  const keywordLower = keyword.toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const keywordCount = (text.match(new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  
  return words.length > 0 ? (keywordCount / words.length) * 100 : 0;
}

/**
 * Calculate readability score (Flesch Reading Ease approximation)
 */
function calculateReadability(content: string): number {
  const text = content.replace(/<[^>]*>/g, ' ').trim();
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => {
    return count + estimateSyllables(word);
  }, 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  // Normalize to 0-100 scale
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Estimate syllables in a word
 */
function estimateSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Check if content has proper heading structure
 */
function checkHeadingStructure(content: string): { hasHeadings: boolean; h2Count: number; h3Count: number } {
  const h2Matches = content.match(/<h2[^>]*>/gi) || [];
  const h3Matches = content.match(/<h3[^>]*>/gi) || [];
  
  return {
    hasHeadings: h2Matches.length > 0 || h3Matches.length > 0,
    h2Count: h2Matches.length,
    h3Count: h3Matches.length,
  };
}

/**
 * Analyze content for SEO optimization
 */
export function analyzeContentSEO(post: BlogPost, targetKeyword?: string): SEOAnalysis {
  const keyword = targetKeyword || post.target_keywords?.[0] || '';
  const issues: string[] = [];
  const suggestions: string[] = [];
  const optimization: SEOAnalysis['optimization'] = {
    title: false,
    metaDescription: false,
    headings: false,
    internalLinks: false,
    images: false,
    wordCount: false,
  };

  let score = 0;

  // Title optimization (20 points)
  if (post.title) {
    optimization.title = true;
    score += 10;
    
    if (keyword && post.title.toLowerCase().includes(keyword.toLowerCase())) {
      score += 10;
    } else if (keyword) {
      issues.push(`Title doesn't include target keyword: "${keyword}"`);
      suggestions.push(`Add "${keyword}" to the title`);
    }
    
    if (post.title.length > 60) {
      issues.push(`Title is too long (${post.title.length} chars, recommended: 60)`);
    }
  } else {
    issues.push('Missing title');
    suggestions.push('Add a title');
  }

  // Meta description (15 points)
  if (post.meta_description) {
    optimization.metaDescription = true;
    score += 10;
    
    if (keyword && post.meta_description.toLowerCase().includes(keyword.toLowerCase())) {
      score += 5;
    } else if (keyword) {
      suggestions.push(`Include "${keyword}" in meta description`);
    }
    
    if (post.meta_description.length > 155) {
      issues.push(`Meta description too long (${post.meta_description.length} chars, recommended: 155)`);
    }
  } else {
    issues.push('Missing meta description');
    suggestions.push('Add a meta description (155 characters)');
  }

  // Word count (15 points)
  const wordCount = post.word_count || 0;
  if (wordCount >= 2000) {
    optimization.wordCount = true;
    score += 15;
  } else if (wordCount >= 1500) {
    optimization.wordCount = true;
    score += 12;
  } else if (wordCount >= 1000) {
    score += 8;
    suggestions.push('Increase content length to 1500+ words for better SEO');
  } else {
    issues.push(`Content is too short (${wordCount} words, recommended: 1500+)`);
    suggestions.push('Expand content to at least 1500 words');
  }

  // Keyword density (15 points)
  if (keyword && post.content) {
    const density = calculateKeywordDensity(post.content, keyword);
    if (density >= 1 && density <= 2) {
      score += 15;
    } else if (density >= 0.5 && density < 1) {
      score += 10;
      suggestions.push(`Increase keyword density (currently ${density.toFixed(2)}%, target: 1-2%)`);
    } else if (density > 2 && density <= 3) {
      score += 8;
      suggestions.push(`Reduce keyword density slightly (currently ${density.toFixed(2)}%, target: 1-2%)`);
    } else if (density > 3) {
      issues.push(`Keyword density too high (${density.toFixed(2)}%, target: 1-2%)`);
      suggestions.push('Reduce keyword usage to avoid over-optimization');
    } else {
      issues.push(`Keyword density too low (${density.toFixed(2)}%, target: 1-2%)`);
      suggestions.push(`Increase usage of "${keyword}" naturally throughout content`);
    }
  }

  // Heading structure (10 points)
  const headingStructure = checkHeadingStructure(post.content);
  if (headingStructure.hasHeadings) {
    optimization.headings = true;
    score += 10;
    
    if (headingStructure.h2Count < 2) {
      suggestions.push('Add more H2 headings for better structure');
    }
  } else {
    issues.push('No headings found (H2/H3)');
    suggestions.push('Add headings to improve readability and SEO');
  }

  // Internal links (10 points)
  const internalLinksCount = post.internal_links ? Object.keys(post.internal_links).length : 0;
  if (internalLinksCount >= 3) {
    optimization.internalLinks = true;
    score += 10;
  } else if (internalLinksCount >= 1) {
    score += 5;
    suggestions.push('Add more internal links (recommended: 3-5)');
  } else {
    issues.push('No internal links found');
    suggestions.push('Add 3-5 internal links to related content');
  }

  // Images (5 points)
  const imageMatches = post.content.match(/<img[^>]*>/gi) || [];
  if (post.featured_image_url || imageMatches.length > 0) {
    optimization.images = true;
    score += 5;
  } else {
    suggestions.push('Add images to improve engagement');
  }

  // Keyword in first paragraph (10 points)
  if (keyword && post.content) {
    const firstParagraph = post.content.replace(/<[^>]*>/g, ' ').substring(0, 200).toLowerCase();
    if (firstParagraph.includes(keyword.toLowerCase())) {
      score += 10;
    } else {
      suggestions.push(`Include "${keyword}" in the first paragraph`);
    }
  }

  // Readability
  const readabilityScore = calculateReadability(post.content);
  if (readabilityScore >= 60) {
    score += 5; // Bonus for good readability
  } else if (readabilityScore < 30) {
    issues.push(`Content may be difficult to read (readability score: ${readabilityScore})`);
    suggestions.push('Simplify sentence structure for better readability');
  }

  return {
    score: Math.min(100, score),
    keywordDensity: keyword ? calculateKeywordDensity(post.content, keyword) : 0,
    readabilityScore,
    issues,
    suggestions,
    optimization,
  };
}

/**
 * Generate optimized meta description
 */
export function generateOptimizedMetaDescription(
  title: string,
  content: string,
  keyword: string,
  maxLength: number = 155
): string {
  // Try to find a good excerpt that includes the keyword
  const text = content.replace(/<[^>]*>/g, ' ').trim();
  const keywordIndex = text.toLowerCase().indexOf(keyword.toLowerCase());
  
  if (keywordIndex !== -1) {
    const start = Math.max(0, keywordIndex - 50);
    const end = Math.min(text.length, keywordIndex + keyword.length + (maxLength - keyword.length - 50));
    const excerpt = text.substring(start, end).trim();
    
    if (excerpt.length <= maxLength) {
      return excerpt;
    }
    
    return excerpt.substring(0, maxLength - 3).trim() + '...';
  }

  // Fallback: use beginning of content
  const excerpt = text.substring(0, maxLength - 3).trim();
  return excerpt + '...';
}

/**
 * Suggest image alt text
 */
export function suggestImageAltText(keyword: string, context: string): string {
  // Simple alt text generation - can be enhanced with AI
  const contextWords = context.replace(/<[^>]*>/g, ' ').split(/\s+/).slice(0, 5).join(' ');
  return `${keyword} - ${contextWords}`;
}

