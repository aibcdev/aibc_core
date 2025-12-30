/**
 * Internal Linking Service - Automatic internal link suggestions and placement
 */

import { BlogPost } from '../types/seo';
import { listBlogPosts } from './seoContentService';

export interface InternalLink {
  text: string;
  url: string;
  anchorText: string;
  relevance: number;
}

export interface LinkSuggestion {
  keyword: string;
  targetPost: BlogPost;
  context: string;
  relevance: number;
}

/**
 * Find internal link opportunities in content
 */
export async function findInternalLinkOpportunities(
  post: BlogPost,
  allPosts: BlogPost[]
): Promise<LinkSuggestion[]> {
  const suggestions: LinkSuggestion[] = [];
  const content = post.content || '';
  const contentLower = content.toLowerCase();

  // Extract potential keywords from the post (from title, keywords, category)
  const postKeywords: string[] = [];
  if (post.title) {
    postKeywords.push(...extractKeywords(post.title));
  }
  if (post.target_keywords) {
    postKeywords.push(...post.target_keywords);
  }
  if (post.category) {
    postKeywords.push(post.category);
  }

  // Find other posts that could be linked
  for (const targetPost of allPosts) {
    if (targetPost.id === post.id || targetPost.status !== 'published') {
      continue;
    }

    // Check if target post's keywords appear in current post's content
    let relevance = 0;
    let matchedKeyword = '';

    if (targetPost.title) {
      const titleKeywords = extractKeywords(targetPost.title);
      for (const keyword of titleKeywords) {
        if (keyword.length > 3 && contentLower.includes(keyword.toLowerCase())) {
          relevance += 5;
          matchedKeyword = keyword;
        }
      }
    }

    if (targetPost.target_keywords) {
      for (const keyword of targetPost.target_keywords) {
        if (keyword.length > 3 && contentLower.includes(keyword.toLowerCase())) {
          relevance += 3;
          if (!matchedKeyword) matchedKeyword = keyword;
        }
      }
    }

    // Category match
    if (targetPost.category && post.category === targetPost.category) {
      relevance += 2;
    }

    // Tag overlap
    if (targetPost.tags && post.tags) {
      const commonTags = targetPost.tags.filter(tag => post.tags!.includes(tag));
      relevance += commonTags.length;
    }

    if (relevance > 0) {
      // Find context where keyword appears
      const keywordLower = matchedKeyword.toLowerCase();
      const keywordIndex = contentLower.indexOf(keywordLower);
      let context = '';
      
      if (keywordIndex !== -1) {
        const start = Math.max(0, keywordIndex - 50);
        const end = Math.min(content.length, keywordIndex + matchedKeyword.length + 50);
        context = content.substring(start, end);
      } else {
        // Use excerpt or description as context
        context = post.excerpt || post.meta_description || '';
      }

      suggestions.push({
        keyword: matchedKeyword,
        targetPost,
        context,
        relevance,
      });
    }
  }

  // Sort by relevance and return top suggestions
  return suggestions
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10);
}

/**
 * Extract keywords from text (simple implementation)
 */
function extractKeywords(text: string): string[] {
  // Remove common stop words and extract meaningful phrases
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can']);
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Extract 2-3 word phrases
  const phrases: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    if (phrase.length > 5) {
      phrases.push(phrase);
    }
  }

  return [...words, ...phrases].slice(0, 20);
}

/**
 * Generate internal links for a post's content
 */
export async function generateInternalLinks(post: BlogPost): Promise<InternalLink[]> {
  // Get all published posts
  const allPostsResult = await listBlogPosts({ status: 'published', limit: 1000 });
  const allPosts = allPostsResult.posts;

  // Find link opportunities
  const suggestions = await findInternalLinkOpportunities(post, allPosts);

  // Convert to InternalLink format
  const links: InternalLink[] = suggestions.map(suggestion => ({
    text: suggestion.keyword,
    url: `/blog/${suggestion.targetPost.slug}`,
    anchorText: suggestion.targetPost.title,
    relevance: suggestion.relevance,
  }));

  return links;
}

/**
 * Inject internal links into content
 */
export function injectInternalLinks(content: string, links: InternalLink[]): string {
  let modifiedContent = content;

  // Sort links by relevance and text length (longer first to avoid partial matches)
  const sortedLinks = [...links].sort((a, b) => {
    if (b.relevance !== a.relevance) {
      return b.relevance - a.relevance;
    }
    return b.text.length - a.text.length;
  });

  // Inject links (limit to 3-5 links per post to avoid over-optimization)
  const linksToInject = sortedLinks.slice(0, 5);
  const usedPositions = new Set<number>();

  for (const link of linksToInject) {
    const textLower = link.text.toLowerCase();
    const contentLower = modifiedContent.toLowerCase();
    
    // Find all occurrences
    let searchIndex = 0;
    while (true) {
      const index = contentLower.indexOf(textLower, searchIndex);
      if (index === -1) break;

      // Check if this position is already used
      if (!usedPositions.has(index)) {
        // Check if it's not already inside a link tag
        const before = modifiedContent.substring(Math.max(0, index - 10), index);
        const after = modifiedContent.substring(index + link.text.length, index + link.text.length + 10);
        
        if (!before.includes('<a ') && !after.includes('</a>')) {
          // Inject link
          const beforeText = modifiedContent.substring(0, index);
          const linkText = modifiedContent.substring(index, index + link.text.length);
          const afterText = modifiedContent.substring(index + link.text.length);
          
          modifiedContent = `${beforeText}<a href="${link.url}" class="internal-link">${linkText}</a>${afterText}`;
          usedPositions.add(index);
          break; // Only link first occurrence of each keyword
        }
      }
      
      searchIndex = index + 1;
    }
  }

  return modifiedContent;
}

/**
 * Get related posts for internal linking
 */
export async function getRelatedPostsForLinking(
  post: BlogPost,
  limit: number = 5
): Promise<BlogPost[]> {
  const allPostsResult = await listBlogPosts({ status: 'published', limit: 1000 });
  const allPosts = allPostsResult.posts;

  const suggestions = await findInternalLinkOpportunities(post, allPosts);
  
  return suggestions
    .slice(0, limit)
    .map(s => s.targetPost);
}

/**
 * Update a post with internal links
 */
export async function updatePostWithInternalLinks(postId: string): Promise<BlogPost | null> {
  const { getBlogPostById, updateBlogPost } = await import('./seoContentService');
  
  const post = await getBlogPostById(postId);
  if (!post || !post.content) {
    return null;
  }

  // Generate internal links
  const links = await generateInternalLinks(post);
  
  // Inject links into content
  const updatedContent = injectInternalLinks(post.content, links);
  
  // Update the post
  const updatedPost = await updateBlogPost(postId, {
    content: updatedContent,
  });
  
  return updatedPost;
}

/**
 * Add internal links to content (alias for injectInternalLinks for backward compatibility)
 */
export function addInternalLinks(content: string, links: InternalLink[]): string {
  return injectInternalLinks(content, links);
}
