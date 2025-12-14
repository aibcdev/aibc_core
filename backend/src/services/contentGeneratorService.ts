/**
 * Content Generator Service - AI-powered content generation using templates
 */

import { generateText, generateJSON } from './llmService';
import { getTemplate, suggestTemplateForKeyword } from './contentTemplates';
import { createBlogPost, updateBlogPost } from './seoContentService';
import { ContentGenerationRequest, ContentGenerationResponse, BlogPost } from '../types/seo';

/**
 * Generate meta description from title and content
 */
function generateMetaDescription(title: string, content: string, keyword: string): string {
  const excerpt = content.substring(0, 150).trim();
  // Ensure keyword is in meta description if possible
  if (!excerpt.toLowerCase().includes(keyword.toLowerCase())) {
    return `${excerpt.substring(0, 120)}... Learn about ${keyword} and more.`;
  }
  return excerpt.substring(0, 155);
}

/**
 * Generate excerpt from content
 */
function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove HTML tags for excerpt
  const text = content.replace(/<[^>]*>/g, '').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/**
 * Generate SEO-optimized title (Blitz SEO: keyword-first approach)
 */
async function generateTitle(keyword: string, templateType: string): Promise<string> {
  const prompt = `Generate a compelling, SEO-optimized blog post title following Blitz SEO methodology for keyword: "${keyword}"

BLITZ SEO TITLE REQUIREMENTS:
- Place the primary keyword "${keyword}" at the beginning or early in the title
- Keep it between 50-60 characters for optimal SEO
- Make it clear, compelling, and click-worthy
- Include a benefit, number, or action word when possible
- Match the template type: ${templateType}
- Examples for guidance:
  * "Content Marketing Strategies: [Rest of Title]"
  * "[Keyword]: Complete Guide to [Benefit]"
  * "How to [Action] with [Keyword]"

Return ONLY the title, nothing else. No quotes, no markdown.`;

  const title = await generateText(prompt, undefined, { tier: 'basic' });
  return title.trim().replace(/^["']|["']$/g, '').replace(/^#+\s*/, ''); // Remove quotes and markdown if present
}

/**
 * Generate content using AI and template (Blitz SEO optimized)
 */
async function generateContentBody(
  keyword: string,
  templateType: string,
  targetWordCount: number = 2000
): Promise<string> {
  const template = getTemplate(templateType as any);
  const structure = template.structure;

  const prompt = `You are an expert SEO content writer following Blitz SEO methodology. Write a comprehensive, highly-optimized blog post about: "${keyword}"

BLITZ SEO REQUIREMENTS:
- Target word count: ${targetWordCount} words (comprehensive, in-depth content)
- Primary keyword "${keyword}" must appear in:
  * Title (first part if possible)
  * First paragraph (naturally)
  * At least 3 H2/H3 headings
  * Throughout body content (1-2% density, natural placement)
- Include related keywords and semantic variations naturally
- Use proper HTML formatting: <h2> for main headings, <h3> for subheadings, <p> for paragraphs, <ul>/<li> for lists, <strong> for emphasis
- Structure: Clear introduction, detailed main content, actionable takeaways, conclusion
- Include examples, case studies, or real-world applications
- Add value: Make this the most comprehensive resource on "${keyword}"
- Write in engaging, conversational yet authoritative tone
- Use the exact template structure provided
- Fill in all {placeholders} with relevant, detailed content

Use this structure:
${structure}

Write the complete, publication-ready article in HTML format now. Make it comprehensive and valuable enough to rank #1:`;

  const content = await generateText(prompt, undefined, { tier: 'basic' });
  return content.trim();
}

/**
 * Generate blog post from keyword and template
 */
export async function generateBlogPost(
  request: ContentGenerationRequest
): Promise<ContentGenerationResponse> {
  const {
    keyword,
    template_type,
    category = 'Content Marketing',
    target_word_count = 2000,
  } = request;

  // Auto-select template if not provided
  const selectedTemplateType = template_type || suggestTemplateForKeyword(keyword);

  console.log(`[Content Generator] Generating ${selectedTemplateType} post for keyword: "${keyword}"`);

  try {
    // Generate title
    const title = await generateTitle(keyword, selectedTemplateType);
    console.log(`[Content Generator] Generated title: "${title}"`);

    // Generate content body
    const content = await generateContentBody(keyword, selectedTemplateType, target_word_count);
    console.log(`[Content Generator] Generated content (${content.length} chars)`);

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Generate meta description
    const metaDescription = generateMetaDescription(title, content, keyword);
    
    // Generate excerpt
    const excerpt = generateExcerpt(content);

    // Extract tags from content (simple keyword extraction)
    const tags: string[] = [];
    const keywordWords = keyword.toLowerCase().split(' ');
    keywordWords.forEach(word => {
      if (word.length > 3) tags.push(word);
    });
    
    // Add template-based tags
    if (selectedTemplateType === 'how-to') tags.push('tutorial', 'guide');
    if (selectedTemplateType === 'list') tags.push('recommendations', 'best-practices');
    if (selectedTemplateType === 'tools') tags.push('tools', 'resources');

    // Calculate word count
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;

    // Create blog post - Auto-publish if SEO score is good
    const post = await createBlogPost({
      title,
      slug,
      meta_description: metaDescription,
      content,
      excerpt,
      category,
      tags: [...new Set(tags)], // Remove duplicates
      target_keywords: [keyword],
      status: 'published', // Auto-publish for SEO content generation
      published_at: new Date().toISOString(),
      word_count: wordCount,
    });

    // Calculate initial SEO score (basic)
    const seoScore = calculateBasicSEOScore(post, keyword);

    // Generate optimization suggestions
    const suggestions = generateOptimizationSuggestions(post, keyword);

    console.log(`[Content Generator] Post created: ${post.slug} (SEO Score: ${seoScore}/100)`);

    return {
      post,
      seo_score: seoScore,
      optimization_suggestions: suggestions,
    };
  } catch (error: any) {
    console.error('[Content Generator] Error generating post:', error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

/**
 * Calculate basic SEO score
 */
function calculateBasicSEOScore(post: BlogPost, keyword: string): number {
  let score = 0;
  const keywordLower = keyword.toLowerCase();
  const titleLower = post.title.toLowerCase();
  const contentLower = post.content.replace(/<[^>]*>/g, '').toLowerCase();

  // Title contains keyword (30 points)
  if (titleLower.includes(keywordLower)) score += 30;

  // Meta description exists (10 points)
  if (post.meta_description) score += 10;

  // Content length (20 points for 1500+ words)
  if ((post.word_count || 0) >= 1500) score += 20;
  else if ((post.word_count || 0) >= 1000) score += 15;
  else if ((post.word_count || 0) >= 500) score += 10;

  // Keyword in first paragraph (10 points)
  const firstParagraph = contentLower.substring(0, 200);
  if (firstParagraph.includes(keywordLower)) score += 10;

  // Keyword density reasonable (10 points)
  const keywordCount = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
  const wordCount = post.word_count || 1;
  const density = (keywordCount / wordCount) * 100;
  if (density >= 1 && density <= 2) score += 10; // Optimal density

  // Has headings (10 points)
  if (post.content.includes('<h2') || post.content.includes('<h3')) score += 10;

  // Has excerpt (10 points)
  if (post.excerpt) score += 10;

  return Math.min(100, score);
}

/**
 * Generate optimization suggestions
 */
function generateOptimizationSuggestions(post: BlogPost, keyword: string): string[] {
  const suggestions: string[] = [];
  const keywordLower = keyword.toLowerCase();
  const titleLower = post.title.toLowerCase();
  const contentLower = post.content.replace(/<[^>]*>/g, '').toLowerCase();

  if (!titleLower.includes(keywordLower)) {
    suggestions.push(`Add the keyword "${keyword}" to the title`);
  }

  if ((post.word_count || 0) < 1500) {
    suggestions.push(`Expand content to at least 1500 words for better SEO (currently ${post.word_count} words)`);
  }

  if (!post.meta_description) {
    suggestions.push('Add a meta description (155 characters)');
  }

  if (!post.excerpt) {
    suggestions.push('Add an excerpt for better previews');
  }

  if (!post.featured_image_url) {
    suggestions.push('Add a featured image for better engagement');
  }

  if (!post.content.includes('<h2') && !post.content.includes('<h3')) {
    suggestions.push('Add subheadings (H2/H3) to improve readability');
  }

  const keywordCount = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
  const wordCount = post.word_count || 1;
  const density = (keywordCount / wordCount) * 100;
  
  if (density < 0.5) {
    suggestions.push(`Increase keyword density (currently ${density.toFixed(2)}%, target 1-2%)`);
  } else if (density > 3) {
    suggestions.push(`Reduce keyword density (currently ${density.toFixed(2)}%, target 1-2%)`);
  }

  return suggestions;
}

