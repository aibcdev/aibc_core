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
export function generateBreadcrumbStructuredData(post: BlogPost, includeCategory: boolean = true): object {
  const baseURL = getBaseURL();
  const items: Array<{ '@type': string; position: number; name: string; item: string }> = [
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
  ];

  // Add category if available
  if (includeCategory && post.category) {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: post.category,
      item: `${baseURL}/blog/category/${encodeURIComponent(post.category.toLowerCase().replace(/\s+/g, '-'))}`,
    });
  }

  // Add post
  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: post.title,
    item: `${baseURL}/blog/${post.slug}`,
  });
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

/**
 * Generate FAQPage structured data from post content
 */
export function generateFAQStructuredData(post: BlogPost): object | null {
  const content = post.content || '';
  
  // Enhanced FAQ extraction - look for common FAQ patterns
  const faqPatterns = [
    /<h[23][^>]*>(?:Q:|Question:|\?)\s*([^<]+)<\/h[23]>/gi,
    /<strong[^>]*>(?:Q:|Question:|\?)\s*([^<]+)<\/strong>/gi,
    /(?:Q:|Question:)\s*([^\n]+)/gi,
  ];

  const questions: string[] = [];
  
  for (const pattern of faqPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const question = match[1].trim();
      if (question.length > 10 && question.length < 200) {
        questions.push(question);
      }
    }
  }

  if (questions.length === 0) {
    return null;
  }

  // Extract answers - look for content after questions
  const faqItems = questions.slice(0, 10).map((question, index) => {
    // Try to find answer in content after question
    const questionIndex = content.indexOf(question);
    let answerText = 'See full article for detailed answer.';
    
    if (questionIndex !== -1) {
      const afterQuestion = content.substring(questionIndex + question.length);
      // Look for next paragraph or list item
      const answerMatch = afterQuestion.match(/<p[^>]*>([^<]+)<\/p>/i) || 
                         afterQuestion.match(/<li[^>]*>([^<]+)<\/li>/i);
      if (answerMatch && answerMatch[1]) {
        answerText = answerMatch[1].trim().substring(0, 500);
      }
    }

    return {
      '@type': 'Question',
      name: question.replace(/^[Q:?\s]+/i, ''),
      acceptedAnswer: {
        '@type': 'Answer',
        text: answerText,
      },
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  };
}

/**
 * Generate HowTo structured data for tutorial posts
 */
export function generateHowToStructuredData(post: BlogPost): object | null {
  const content = post.content || '';
  
  // Check if post is a tutorial/how-to guide
  const isHowTo = post.title?.toLowerCase().includes('how to') ||
                  post.title?.toLowerCase().includes('tutorial') ||
                  post.title?.toLowerCase().includes('guide') ||
                  post.category?.toLowerCase() === 'tutorial' ||
                  post.tags?.some(tag => tag.toLowerCase().includes('tutorial') || tag.toLowerCase().includes('how-to'));

  if (!isHowTo) {
    return null;
  }

  // Extract steps from ordered or unordered lists
  const stepPatterns = [
    /<ol[^>]*>([\s\S]*?)<\/ol>/gi,
    /<ul[^>]*>([\s\S]*?)<\/ul>/gi,
    /<li[^>]*>([^<]+)<\/li>/gi,
  ];

  const steps: Array<{ '@type': string; name: string; text: string }> = [];
  
  for (const pattern of stepPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const stepText = match[1]?.replace(/<[^>]*>/g, '').trim();
      if (stepText && stepText.length > 10 && stepText.length < 500) {
        steps.push({
          '@type': 'HowToStep',
          name: stepText.substring(0, 100),
          text: stepText,
        });
      }
      if (steps.length >= 10) break;
    }
    if (steps.length > 0) break;
  }

  // If no steps found, create from headings
  if (steps.length === 0) {
    const headingPattern = /<h[23][^>]*>([^<]+)<\/h[23]>/gi;
    let match;
    while ((match = headingPattern.exec(content)) !== null && steps.length < 10) {
      const stepText = match[1].trim();
      if (stepText.length > 5) {
        steps.push({
          '@type': 'HowToStep',
          name: stepText,
          text: stepText,
        });
      }
    }
  }

  if (steps.length === 0) {
    return null;
  }

  const baseURL = getBaseURL();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: post.title,
    description: post.meta_description || post.excerpt || post.title,
    image: post.featured_image_url || `${baseURL}/favicon.svg`,
    step: steps,
    totalTime: post.reading_time ? `PT${post.reading_time}M` : undefined,
  };
}

/**
 * Generate Person structured data for authors
 */
export function generatePersonStructuredData(authorName: string, authorUrl?: string): object {
  const baseURL = getBaseURL();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: authorName,
    url: authorUrl || baseURL,
  };
}

/**
 * Generate Review structured data (if post contains reviews)
 */
export function generateReviewStructuredData(post: BlogPost): object | null {
  // Check if post contains review content
  const hasReview = post.content?.toLowerCase().includes('rating') ||
                   post.content?.toLowerCase().includes('review') ||
                   post.content?.toLowerCase().includes('stars') ||
                   post.tags?.some(tag => tag.toLowerCase().includes('review'));

  if (!hasReview) {
    return null;
  }

  // Extract rating if present (look for patterns like "5/5", "4 stars", etc.)
  const ratingPatterns = [
    /(\d+)\s*\/\s*5/i,
    /(\d+)\s*stars?/i,
    /rating[:\s]+(\d+)/i,
  ];

  let ratingValue: number | undefined;
  for (const pattern of ratingPatterns) {
    const match = post.content?.match(pattern);
    if (match) {
      ratingValue = parseInt(match[1], 10);
      if (ratingValue >= 1 && ratingValue <= 5) {
        break;
      }
    }
  }

  if (!ratingValue) {
    return null;
  }

  const baseURL = getBaseURL();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Thing',
      name: post.title,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: ratingValue,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      '@type': 'Person',
      name: post.author || 'AIBC',
    },
    reviewBody: post.excerpt || post.meta_description || post.title,
  };
}

/**
 * Generate CollectionPage structured data for category/tag pages
 */
export function generateCollectionPageStructuredData(
  name: string,
  description: string,
  url: string,
  items: Array<{ name: string; url: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: name,
    description: description,
    url: url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
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

  // HowTo if applicable
  const howTo = generateHowToStructuredData(post);
  if (howTo) {
    structuredData.push({
      type: 'HowTo',
      data: howTo,
    });
  }

  // Review if applicable
  const review = generateReviewStructuredData(post);
  if (review) {
    structuredData.push({
      type: 'Review',
      data: review,
    });
  }

  return structuredData;
}

