/**
 * Internal Linking Service - Automatic contextual linking between related posts
 */

import { listBlogPosts, getBlogPostById } from './seoContentService';
import { BlogPost } from '../../../types/seo';

/**
 * Extract keywords from content
 */
function extractKeywords(content: string, minLength: number = 4): string[] {
  const words = content
    .toLowerCase()
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length >= minLength);

  // Count frequency
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Return top keywords (appearing at least 2 times)
  return Object.entries(wordCount)
    .filter(([_, count]) => count >= 2)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
}

/**
 * Find related posts based on keywords and categories
 */
async function findRelatedPosts(
  post: BlogPost,
  limit: number = 10
): Promise<Array<{ post: BlogPost; score: number }>> {
  const allPosts = await listBlogPosts({ status: 'published', limit: 1000 });
  
  // Extract keywords from current post
  const postKeywords = new Set([
    ...extractKeywords(post.title + ' ' + post.content),
    ...(post.target_keywords || []).map(k => k.toLowerCase()),
  ]);

  const related: Array<{ post: BlogPost; score: number }> = [];

  for (const otherPost of allPosts.posts) {
    if (otherPost.id === post.id) continue; // Skip self

    let score = 0;

    // Category match
    if (post.category && otherPost.category === post.category) {
      score += 10;
    }

    // Tag matches
    if (post.tags && otherPost.tags) {
      const commonTags = post.tags.filter(tag => otherPost.tags!.includes(tag));
      score += commonTags.length * 5;
    }

    // Keyword matches in title
    const otherTitleKeywords = extractKeywords(otherPost.title);
    const titleMatches = otherTitleKeywords.filter(k => postKeywords.has(k));
    score += titleMatches.length * 3;

    // Keyword matches in content
    const otherContentKeywords = extractKeywords(otherPost.content);
    const contentMatches = otherContentKeywords.filter(k => postKeywords.has(k));
    score += contentMatches.length * 1;

    // Keyword match in target keywords
    if (post.target_keywords && otherPost.target_keywords) {
      const commonTargetKeywords = post.target_keywords.filter(k =>
        otherPost.target_keywords!.some(ok => ok.toLowerCase() === k.toLowerCase())
      );
      score += commonTargetKeywords.length * 8;
    }

    if (score > 0) {
      related.push({ post: otherPost, score });
    }
  }

  // Sort by score and return top results
  return related.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Find anchor text opportunities in content
 */
function findAnchorTextOpportunities(
  content: string,
  targetPost: BlogPost
): Array<{ text: string; position: number; score: number }> {
  const opportunities: Array<{ text: string; position: number; score: number }> = [];
  const targetKeywords = new Set([
    ...extractKeywords(targetPost.title),
    ...(targetPost.target_keywords || []).map(k => k.toLowerCase()),
  ]);

  // Extract sentences and phrases from content
  const sentences = content
    .replace(/<[^>]*>/g, ' ')
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  sentences.forEach((sentence, index) => {
    const words = sentence.toLowerCase().split(/\s+/);
    
    // Check for keyword matches
    words.forEach((word, wordIndex) => {
      if (targetKeywords.has(word)) {
        // Find phrase containing this word (2-5 words)
        const start = Math.max(0, wordIndex - 2);
        const end = Math.min(words.length, wordIndex + 3);
        const phrase = words.slice(start, end).join(' ');

        opportunities.push({
          text: sentence.substring(
            sentence.toLowerCase().indexOf(phrase),
            sentence.toLowerCase().indexOf(phrase) + phrase.length
          ),
          position: index,
          score: 5,
        });
      }
    });
  });

  return opportunities.sort((a, b) => b.score - a.score);
}

/**
 * Insert internal links into content
 */
export async function addInternalLinks(
  post: BlogPost,
  maxLinks: number = 5
): Promise<{ content: string; links: Array<{ url: string; text: string; postId: string }> }> {
  const related = await findRelatedPosts(post, maxLinks * 2);
  
  if (related.length === 0) {
    return { content: post.content, links: [] };
  }

  const links: Array<{ url: string; text: string; postId: string }> = [];
  let content = post.content;

  // Process each related post
  for (const { post: relatedPost } of related.slice(0, maxLinks)) {
    const opportunities = findAnchorTextOpportunities(content, relatedPost);
    
    if (opportunities.length > 0) {
      const opportunity = opportunities[0]; // Use best opportunity
      const linkUrl = `/blog/${relatedPost.slug}`;
      const linkText = opportunity.text;
      const linkHtml = `<a href="${linkUrl}" class="internal-link text-orange-500 hover:text-orange-400 underline">${linkText}</a>`;

      // Insert link (simple replacement - can be enhanced)
      const regex = new RegExp(escapeRegex(linkText), 'i');
      if (regex.test(content)) {
        content = content.replace(regex, linkHtml);
        links.push({
          url: linkUrl,
          text: linkText,
          postId: relatedPost.id,
        });
      }
    }
  }

  return { content, links };
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build topic clusters (hub-and-spoke model)
 */
export async function buildTopicClusters(topic: string): Promise<{
  pillar: BlogPost | null;
  supporting: BlogPost[];
}> {
  const allPosts = await listBlogPosts({ status: 'published', limit: 1000 });
  const topicLower = topic.toLowerCase();

  // Find pillar post (longest, most comprehensive post about the topic)
  let pillar: BlogPost | null = null;
  let maxWordCount = 0;

  for (const post of allPosts.posts) {
    const matchesTopic =
      post.title.toLowerCase().includes(topicLower) ||
      post.target_keywords?.some(k => k.toLowerCase().includes(topicLower)) ||
      post.content.toLowerCase().includes(topicLower);

    if (matchesTopic && (post.word_count || 0) > maxWordCount) {
      pillar = post;
      maxWordCount = post.word_count || 0;
    }
  }

  // Find supporting posts (related but more specific)
  const supporting: BlogPost[] = [];
  if (pillar) {
    const related = await findRelatedPosts(pillar, 10);
    supporting.push(...related.map(r => r.post).filter(p => p.id !== pillar!.id));
  }

  return { pillar, supporting };
}

/**
 * Update post with internal links
 */
export async function updatePostWithInternalLinks(postId: string): Promise<BlogPost | null> {
  const post = await getBlogPostById(postId);
  if (!post) return null;

  const { content: updatedContent, links } = await addInternalLinks(post);

  // Store links metadata
  const internalLinks: Record<string, string> = {};
  links.forEach(link => {
    internalLinks[link.postId] = link.url;
  });

  // Update post with new content and links
  const updated = await updateBlogPost(postId, {
    content: updatedContent,
    internal_links: internalLinks,
  });

  return updated;
}

