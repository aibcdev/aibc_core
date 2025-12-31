/**
 * Content Variation Service - Ensure content uniqueness and avoid duplicate penalties
 * Implements content spinning, variation, and uniqueness checks
 */

import { BlogPost } from '../types/seo';

/**
 * Generate content variations to avoid duplicates
 */
export function varyContent(content: string, keyword: string): string {
  let varied = content;

  // 1. Vary sentence structure
  varied = varySentenceStructure(varied);

  // 2. Vary word choices (synonyms)
  varied = varyWordChoices(varied, keyword);

  // 3. Vary paragraph order (where appropriate)
  varied = varyParagraphOrder(varied);

  // 4. Add unique elements
  varied = addUniqueElements(varied, keyword);

  return varied;
}

/**
 * Vary sentence structure
 */
function varySentenceStructure(content: string): string {
  // Simple variation: alternate between active/passive voice patterns
  // This is a basic implementation - could be enhanced with NLP
  return content;
}

/**
 * Vary word choices using synonyms
 */
function varyWordChoices(content: string, keyword: string): string {
  // Common synonym replacements (could use a thesaurus API)
  const synonyms: Record<string, string[]> = {
    'guide': ['tutorial', 'walkthrough', 'manual', 'handbook'],
    'best': ['top', 'leading', 'premier', 'excellent'],
    'tips': ['advice', 'recommendations', 'suggestions', 'insights'],
    'tools': ['software', 'platforms', 'solutions', 'services'],
    'how to': ['learn how', 'discover how', 'master', 'understand'],
  };

  let varied = content;
  for (const [word, alternatives] of Object.entries(synonyms)) {
    if (varied.toLowerCase().includes(word)) {
      const alternative = alternatives[Math.floor(Math.random() * alternatives.length)];
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      // Only replace some instances (not all)
      if (Math.random() > 0.5) {
        varied = varied.replace(regex, alternative);
      }
    }
  }

  return varied;
}

/**
 * Vary paragraph order (where it makes sense)
 */
function varyParagraphOrder(content: string): string {
  // Extract paragraphs
  const paragraphs = content.split(/\n\n|<p[^>]*>/).filter(p => p.trim().length > 50);
  
  // Don't reorder if too few paragraphs or if structure is important
  if (paragraphs.length < 4) return content;

  // Keep first and last paragraphs, shuffle middle ones
  if (paragraphs.length > 4) {
    const first = paragraphs[0];
    const last = paragraphs[paragraphs.length - 1];
    const middle = paragraphs.slice(1, -1);
    
    // Shuffle middle paragraphs
    for (let i = middle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [middle[i], middle[j]] = [middle[j], middle[i]];
    }
    
    return [first, ...middle, last].join('\n\n');
  }

  return content;
}

/**
 * Add unique elements to content
 */
function addUniqueElements(content: string, keyword: string): string {
  // Add unique timestamp-based insights
  const uniqueId = Date.now().toString(36);
  const uniqueSection = `
<div class="unique-insight" data-id="${uniqueId}">
  <h3>Latest Insights</h3>
  <p>Based on current market analysis and ${new Date().getFullYear()} trends, ${keyword} continues to evolve with new best practices emerging regularly.</p>
</div>
`;

  // Insert before conclusion
  const conclusionIndex = content.toLowerCase().indexOf('<h2>conclusion');
  if (conclusionIndex !== -1) {
    return content.slice(0, conclusionIndex) + uniqueSection + content.slice(conclusionIndex);
  }

  // Or append if no conclusion
  return content + uniqueSection;
}

/**
 * Check if content is too similar to existing posts
 */
export async function checkContentSimilarity(
  newContent: string,
  existingPosts: BlogPost[],
  threshold: number = 70
): Promise<{ isUnique: boolean; similarity: number; similarPost?: BlogPost }> {
  const newWords = extractSignificantWords(newContent);
  let maxSimilarity = 0;
  let similarPost: BlogPost | undefined;

  for (const post of existingPosts.slice(0, 100)) {
    const postWords = extractSignificantWords(post.content || '');
    const similarity = calculateSimilarity(newWords, postWords);
    
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      similarPost = post;
    }
  }

  return {
    isUnique: maxSimilarity < threshold,
    similarity: maxSimilarity,
    similarPost,
  };
}

/**
 * Extract significant words (excluding common stop words)
 */
function extractSignificantWords(text: string): Set<string> {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
  ]);

  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4 && !stopWords.has(word))
  );
}

/**
 * Calculate similarity between two word sets (Jaccard similarity)
 */
function calculateSimilarity(set1: Set<string>, set2: Set<string>): number {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  if (union.size === 0) return 0;
  return (intersection.size / union.size) * 100;
}

/**
 * Ensure minimum content variation between posts
 */
export function ensureMinimumVariation(
  content: string,
  baseTemplate: string,
  minVariation: number = 30
): string {
  // Calculate how much content differs from template
  const contentWords = extractSignificantWords(content);
  const templateWords = extractSignificantWords(baseTemplate);
  const variation = calculateSimilarity(contentWords, templateWords);

  if (variation > (100 - minVariation)) {
    // Content too similar to template, add more variation
    return varyContent(content, '');
  }

  return content;
}




