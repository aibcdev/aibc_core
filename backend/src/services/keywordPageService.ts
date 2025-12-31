/**
 * Keyword Page Service - Generate dynamic keyword landing pages
 */

import { BlogPost } from '../types/seo';
import { listBlogPosts } from './seoContentService';

export interface KeywordPageData {
  keyword: string;
  description: string;
  posts: BlogPost[];
  relatedKeywords: string[];
  totalPosts: number;
}

/**
 * Get posts by keyword (searches in title, description, content, and target_keywords)
 */
export async function getPostsByKeyword(keyword: string, limit: number = 12): Promise<KeywordPageData> {
  // Get all published posts
  const result = await listBlogPosts({
    status: 'published',
    limit: 1000, // Get more to filter by keyword
  });

  const keywordLower = keyword.toLowerCase();
  
  // Filter posts that mention the keyword
  const matchingPosts = result.posts.filter(post => {
    const titleMatch = post.title?.toLowerCase().includes(keywordLower);
    const descMatch = post.meta_description?.toLowerCase().includes(keywordLower) ||
                     post.excerpt?.toLowerCase().includes(keywordLower);
    const keywordMatch = post.target_keywords?.some(k => k.toLowerCase().includes(keywordLower));
    const contentMatch = post.content?.toLowerCase().includes(keywordLower);
    
    return titleMatch || descMatch || keywordMatch || contentMatch;
  });

  // Sort by relevance (title matches first, then keyword matches, then content matches)
  const sortedPosts = matchingPosts.sort((a, b) => {
    const aTitle = a.title?.toLowerCase().includes(keywordLower) ? 3 : 0;
    const aKeyword = a.target_keywords?.some(k => k.toLowerCase().includes(keywordLower)) ? 2 : 0;
    const aContent = a.content?.toLowerCase().includes(keywordLower) ? 1 : 0;
    const aScore = aTitle + aKeyword + aContent;

    const bTitle = b.title?.toLowerCase().includes(keywordLower) ? 3 : 0;
    const bKeyword = b.target_keywords?.some(k => k.toLowerCase().includes(keywordLower)) ? 2 : 0;
    const bContent = b.content?.toLowerCase().includes(keywordLower) ? 1 : 0;
    const bScore = bTitle + bKeyword + bContent;

    return bScore - aScore;
  });

  // Extract related keywords from matching posts
  const relatedKeywords = new Set<string>();
  matchingPosts.forEach(post => {
    if (post.target_keywords) {
      post.target_keywords.forEach(k => {
        if (k.toLowerCase() !== keywordLower && k.length > 3) {
          relatedKeywords.add(k);
        }
      });
    }
  });

  // Generate description
  const description = `Discover articles, guides, and insights about ${keyword} on AIBC. ${sortedPosts.length} articles covering ${keyword} topics.`;

  return {
    keyword,
    description,
    posts: sortedPosts.slice(0, limit),
    relatedKeywords: Array.from(relatedKeywords).slice(0, 10),
    totalPosts: sortedPosts.length,
  };
}

/**
 * Generate keyword page content (for auto-generated pages)
 */
export function generateKeywordPageContent(keyword: string, posts: BlogPost[]): string {
  const intro = `# ${keyword}: Complete Guide and Resources

Welcome to our comprehensive resource on ${keyword}. Here you'll find expert insights, guides, and articles covering everything you need to know about ${keyword}.

## Featured Articles

${posts.slice(0, 5).map((post, index) => 
  `${index + 1}. [${post.title}](/blog/${post.slug}) - ${post.excerpt || post.meta_description || ''}`
).join('\n\n')}

## What You'll Learn

Our ${keyword} content covers:
- Best practices
- Common challenges and solutions
- Best practices and strategies
- Real-world examples and case studies

## Explore More

Browse our complete collection of ${keyword} articles below, or explore related topics to deepen your understanding.
`;

  return intro;
}




