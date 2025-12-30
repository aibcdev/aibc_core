/**
 * Mass Content Generation Service - Generate thousands of pages automatically
 * Targets 1M indexed pages through programmatic content generation
 */

import { Keyword } from './keywordGenerationService';
import { BlogPost } from '../types/seo';
import { createBlogPost, listBlogPosts } from './seoContentService';
import { generateInternalLinks, injectInternalLinks } from './internalLinkingService';
import { generateAllStructuredData } from './structuredDataService';
import { validatePostForPublishing, enhancePostQuality } from './contentQualityService';

export interface ContentTemplate {
  type: 'guide' | 'list' | 'comparison' | 'faq' | 'location' | 'question';
  structure: string[];
}

/**
 * Content templates for different page types
 */
const CONTENT_TEMPLATES: Record<string, ContentTemplate> = {
  guide: {
    type: 'guide',
    structure: [
      'introduction',
      'what-is',
      'benefits',
      'how-it-works',
      'best-practices',
      'tools',
      'examples',
      'conclusion',
    ],
  },
  list: {
    type: 'list',
    structure: [
      'introduction',
      'criteria',
      'item-1',
      'item-2',
      'item-3',
      'item-4',
      'item-5',
      'comparison-table',
      'conclusion',
    ],
  },
  comparison: {
    type: 'comparison',
    structure: [
      'introduction',
      'overview',
      'feature-comparison',
      'pricing-comparison',
      'pros-cons',
      'use-cases',
      'recommendation',
      'conclusion',
    ],
  },
  faq: {
    type: 'faq',
    structure: [
      'introduction',
      'faq-1',
      'faq-2',
      'faq-3',
      'faq-4',
      'faq-5',
      'faq-6',
      'faq-7',
      'faq-8',
      'faq-9',
      'faq-10',
      'conclusion',
    ],
  },
  location: {
    type: 'location',
    structure: [
      'introduction',
      'location-overview',
      'market-analysis',
      'local-opportunities',
      'best-practices',
      'local-examples',
      'getting-started',
      'conclusion',
    ],
  },
  question: {
    type: 'question',
    structure: [
      'direct-answer',
      'explanation',
      'key-points',
      'examples',
      'related-questions',
      'conclusion',
    ],
  },
};

/**
 * Generate content for a keyword using LLM (OPTIMIZED with template cache)
 */
async function generateContentForKeyword(
  keyword: Keyword,
  template: ContentTemplate,
  llmService: any
): Promise<string> {
  // Try to use cached template first
  const { templateCache } = await import('./contentTemplateCache');
  
  const templateVars = {
    keyword: keyword.keyword,
    location: keyword.location || '',
    industry: keyword.category === 'industry' ? keyword.keyword.split(' ')[0] : '',
  };

  try {
    // Check cache first
    const cached = await templateCache.getOrGenerate(
      template.type,
      templateVars,
      async () => {
        // Generate new template if not cached
        const prompt = buildContentPrompt(keyword, template);
        
        // Use generateText or generateJSON from llmService
        let response: string;
        
        if (llmService.generateText) {
          response = await llmService.generateText(prompt, { tier: 'basic' });
        } else if (llmService.generateJSON) {
          const result = await (llmService.generateJSON as any)(
            `${prompt}\n\nReturn JSON: { "content": "full article HTML here" }`,
            undefined,
            { tier: 'basic' }
          );
          response = result?.content || '';
        } else if (llmService.default?.generateText) {
          response = await llmService.default.generateText(prompt, { tier: 'basic' });
        } else {
          response = '';
        }
        
        return response || generateFallbackContent(keyword, template);
      }
    );

    return cached;
  } catch (error) {
    console.error(`Error generating content for ${keyword.keyword}:`, error);
    return generateFallbackContent(keyword, template);
  }
}

/**
 * Build prompt for content generation
 */
function buildContentPrompt(keyword: Keyword, template: ContentTemplate): string {
  const locationContext = keyword.location 
    ? ` Focus on ${keyword.location} market and local opportunities.`
    : '';
  
  const intentContext = {
    informational: 'Create a comprehensive, educational guide.',
    commercial: 'Create a comparison/review style content highlighting best options.',
    transactional: 'Focus on pricing, deals, and purchasing information.',
    navigational: 'Provide clear navigation and how-to information.',
  }[keyword.intent];

  return `Write a detailed, SEO-optimized ${template.type} article about "${keyword.keyword}".${locationContext}

${intentContext}

Structure the content with these sections: ${template.structure.join(', ')}.

Requirements:
- Minimum 1500 words
- Include H2 and H3 headings
- Use bullet points and lists
- Include relevant examples
- Optimize for SEO with natural keyword usage
- Write in a helpful, authoritative tone
- Include actionable insights
- Add internal linking opportunities

Target audience: Marketing professionals, content creators, and businesses looking for ${keyword.keyword} solutions.`;
}

/**
 * Generate fallback content if LLM fails
 */
function generateFallbackContent(keyword: Keyword, template: ContentTemplate): string {
  const sections = template.structure.map((section, index) => {
    return `<h2>${section.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
<p>This section covers important information about ${keyword.keyword}${keyword.location ? ` in ${keyword.location}` : ''}.</p>`;
  }).join('\n\n');

  return `<h1>${keyword.keyword}</h1>
<p>Welcome to our comprehensive guide on ${keyword.keyword}${keyword.location ? ` in ${keyword.location}` : ''}.</p>

${sections}

<h2>Conclusion</h2>
<p>${keyword.keyword} is an essential aspect of modern marketing and content creation. Whether you're looking for solutions${keyword.location ? ` in ${keyword.location}` : ''} or exploring best practices, this guide provides the insights you need.</p>`;
}

/**
 * Generate slug from keyword
 */
function generateSlug(keyword: string): string {
  return keyword
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100); // Limit length
}

/**
 * Generate a blog post for a keyword
 */
export async function generatePostForKeyword(
  keyword: Keyword,
  llmService: any
): Promise<BlogPost | null> {
  try {
    // Determine template based on intent
    let templateType = 'guide';
    if (keyword.intent === 'commercial') templateType = 'comparison';
    else if (keyword.intent === 'transactional') templateType = 'list';
    else if (keyword.category === 'question') templateType = 'question';
    else if (keyword.category === 'location') templateType = 'location';

    const template = CONTENT_TEMPLATES[templateType] || CONTENT_TEMPLATES.guide;

    // Generate content
    let content = await generateContentForKeyword(keyword, template, llmService);
    
    // Ensure content variation (avoid duplicates)
    const { ensureMinimumVariation, checkContentSimilarity } = await import('./contentVariationService');
    const existingPostsForSimilarity = await listBlogPosts({ status: 'published', limit: 100 });
    
    // Check similarity before finalizing
    const similarityCheck = await checkContentSimilarity(content, existingPostsForSimilarity.posts, 70);
    if (!similarityCheck.isUnique) {
      console.warn(`⚠️ Content too similar (${similarityCheck.similarity}%), varying...`);
      const { varyContent } = await import('./contentVariationService');
      content = varyContent(content, keyword.keyword);
    }

    // Generate meta description
    const metaDescription = `${keyword.keyword}${keyword.location ? ` in ${keyword.location}` : ''} - Comprehensive guide, best practices, and expert insights. Learn everything you need to know about ${keyword.keyword}.`;

    // Generate excerpt (first 200 chars of content, stripped of HTML)
    const excerpt = content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';

    // Create tags
    const tags: string[] = [];
    if (keyword.category) tags.push(keyword.category);
    if (keyword.location) tags.push(keyword.location);
    if (keyword.parentKeyword) {
      const parentTag = keyword.parentKeyword.split(' ')[0];
      if (parentTag.length > 3) tags.push(parentTag);
    }
    tags.push('content marketing', 'ai marketing', 'content as a service');

    // Create post data
    const postData: Partial<BlogPost> = {
      title: keyword.keyword,
      slug: generateSlug(keyword.keyword),
      content: content,
      meta_description: metaDescription,
      excerpt: excerpt,
      category: keyword.category === 'location' ? 'Location Guides' : 
                keyword.category === 'question' ? 'FAQs' :
                keyword.intent === 'commercial' ? 'Comparisons' : 'Guides',
      tags: tags,
      target_keywords: [keyword.keyword],
      status: 'draft', // Start as draft for quality check
      author: 'AIBC Content Team', // E-E-A-T signal
    };

    // Enhance post quality
    const enhancements = enhancePostQuality(postData as BlogPost);
    Object.assign(postData, enhancements);

    // Get existing posts for uniqueness check
    const existingPosts = await listBlogPosts({ status: 'published', limit: 100 });
    
    // Validate post quality before publishing
    const validation = validatePostForPublishing(postData as BlogPost, existingPosts.posts);

    // Final Google compliance check
    const { checkGoogleCompliance } = await import('./googleComplianceService');
    const compliance = await checkGoogleCompliance(postData as BlogPost, existingPosts.posts);

    // Only publish if both quality and compliance checks pass
    if (validation.shouldPublish && compliance.canPublish) {
      postData.status = 'published';
      console.log(`✅ Post "${keyword.keyword}" passed all checks (quality: ${validation.quality.score}, compliant: ${compliance.compliant})`);
    } else {
      // Keep as draft if any issues
      const allIssues = [...validation.quality.issues, ...compliance.issues];
      console.warn(`⚠️ Post "${keyword.keyword}" failed checks (quality: ${validation.quality.score}, compliant: ${compliance.compliant}):`, allIssues);
      postData.status = 'draft';
    }

    // Create the post
    const post = await createBlogPost(postData);

    // Generate and inject internal links (async, don't wait)
    if (post) {
      // Do internal linking in background (don't block)
      generateInternalLinks(post)
        .then(links => {
          if (links.length > 0) {
            const contentWithLinks = injectInternalLinks(post.content || '', links);
            // Update post with linked content (async)
            // Would need updateBlogPost function
          }
        })
        .catch(linkError => {
          console.error('Error generating internal links:', linkError);
        });
    }

    return post;
  } catch (error) {
    console.error(`Error generating post for keyword ${keyword.keyword}:`, error);
    return null;
  }
}

/**
 * Batch generate posts for multiple keywords (OPTIMIZED - parallel processing)
 */
export async function batchGeneratePosts(
  keywords: Keyword[],
  llmService: any,
  batchSize: number = 100, // INCREASED from 10
  delayBetweenBatches: number = 0 // REMOVED delay for speed
): Promise<{ success: number; failed: number; posts: BlogPost[] }> {
  console.log(`🚀 Starting AGGRESSIVE batch generation for ${keywords.length} keywords...`);

  // Use parallel generator for maximum speed
  const { ParallelContentGenerator } = await import('./parallelContentService');
  const generator = new ParallelContentGenerator(20); // 20 concurrent workers

  // Generate all posts in parallel
  const posts = await generator.generateBatch(keywords, batchSize);

  // Bulk insert for database efficiency
  const { bulkCreatePosts } = await import('./bulkContentService');
  const created = await bulkCreatePosts(
    posts.map(p => ({
      title: p.title,
      slug: p.slug,
      content: p.content,
      meta_description: p.meta_description,
      excerpt: p.excerpt,
      category: p.category,
      tags: p.tags,
      target_keywords: p.target_keywords,
      status: p.status,
      published_at: p.published_at,
      author: p.author,
      word_count: p.word_count,
      reading_time: p.reading_time,
    }))
  );

  const results = {
    success: created.length,
    failed: keywords.length - created.length,
    posts: created,
  };

  console.log(`✅ AGGRESSIVE batch generation complete: ${results.success} success, ${results.failed} failed`);
  return results;
}

/**
 * Generate content cluster (topic + related keywords)
 */
export async function generateContentCluster(
  topic: string,
  relatedKeywords: Keyword[],
  llmService: any
): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];

  // Generate main topic post
  const mainKeyword: Keyword = {
    keyword: topic,
    intent: 'informational',
    category: 'core',
  };
  const mainPost = await generatePostForKeyword(mainKeyword, llmService);
  if (mainPost) posts.push(mainPost);

  // Generate related posts
  for (const keyword of relatedKeywords.slice(0, 20)) { // Limit to 20 related posts per cluster
    const post = await generatePostForKeyword(keyword, llmService);
    if (post) posts.push(post);
  }

  return posts;
}

