/**
 * Structured Data Service - Generate JSON-LD structured data for SEO
 */

import { BlogPost } from '../types/seo';

/**
 * Get base URL from environment
 */
function getBaseURL(): string {
  const baseURL = process.env.BASE_URL || process.env.FRONTEND_URL || 'https://aibcmedia.com';
  return baseURL.replace(/\/$/, '');
}

/**
 * Generate Article structured data for a blog post
 */
export function generateArticleStructuredData(post: BlogPost): object {
  const baseURL = getBaseURL();
  const url = `${baseURL}/blog/${post.slug}`;
  const imageUrl = post.featured_image_url || `${baseURL}/favicon.svg`;
  
  // Extract author info (can be enhanced)
  const author = {
    '@type': 'Organization',
    name: 'AIBC',
    url: baseURL,
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt || post.title,
    image: imageUrl,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    author: author,
    publisher: {
      '@type': 'Organization',
      name: 'AIBC',
      logo: {
        '@type': 'ImageObject',
        url: `${baseURL}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url: url,
  };

  // Add keywords if available
  if (post.target_keywords && post.target_keywords.length > 0) {
    (structuredData as any)['keywords'] = post.target_keywords.join(', ');
  }

  // Add article body if needed (for some schema types)
  if (post.content) {
    const textContent = post.content.replace(/<[^>]*>/g, '').substring(0, 500);
    (structuredData as any)['articleBody'] = textContent;
  }

  return structuredData;
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationStructuredData(): object {
  const baseURL = getBaseURL();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AIBC',
    url: baseURL,
    logo: `${baseURL}/favicon.svg`,
    description: 'AI-powered content platform for brands',
    sameAs: [
      // Add social media links if available
    ],
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbStructuredData(post: BlogPost): object {
  const baseURL = getBaseURL();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseURL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${baseURL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${baseURL}/blog/${post.slug}`,
      },
    ],
  };
}

/**
 * Generate FAQPage structured data from post content
 */
export function generateFAQStructuredData(post: BlogPost): object | null {
  // Extract FAQ questions and answers from content
  // This is a simple implementation - can be enhanced with better parsing
  const faqRegex = /<h[23][^>]*>(?:Q:|Question:)?\s*([^<]+)<\/h[23]>/gi;
  const faqs: Array<{ question: string; answer: string }> = [];

  const content = post.content;
  let match;
  const questions: string[] = [];
  
  while ((match = faqRegex.exec(content)) !== null) {
    questions.push(match[1].trim());
  }

  // Simple extraction - look for answers after questions
  // This is basic and can be improved
  if (questions.length === 0) {
    return null;
  }

  // For now, return a basic FAQ structure
  // In production, you'd parse the content more intelligently
  const faqItems = questions.slice(0, 5).map(q => ({
    '@type': 'Question',
    name: q.replace(/^Q:\s*/, ''),
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'See full article for detailed answer.',
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  };
}

/**
 * Generate all structured data for a blog post
 */
export function generateAllStructuredData(post: BlogPost): Array<{ type: string; data: object }> {
  const structuredData = [];

  // Article structured data
  structuredData.push({
    type: 'BlogPosting',
    data: generateArticleStructuredData(post),
  });

  // Breadcrumbs
  structuredData.push({
    type: 'BreadcrumbList',
    data: generateBreadcrumbStructuredData(post),
  });

  // FAQ if applicable
  const faq = generateFAQStructuredData(post);
  if (faq) {
    structuredData.push({
      type: 'FAQPage',
      data: faq,
    });
  }

  return structuredData;
}

