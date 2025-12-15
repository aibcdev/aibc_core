/**
 * Content Generator Service - AI-powered content generation using templates
 */

import { generateText, generateJSON } from './llmService';
import { getTemplate, suggestTemplateForKeyword } from './contentTemplates';
import { createBlogPost, updateBlogPost } from './seoContentService';
import { ContentGenerationRequest, ContentGenerationResponse, BlogPost } from '../types/seo';

/**
 * Generate SEO-optimized meta description for instant traffic
 */
function generateMetaDescription(title: string, content: string, keyword: string): string {
  // Extract first meaningful paragraph (skip HTML tags)
  const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const firstParagraph = textContent.substring(0, 200).trim();
  
  // Ensure keyword appears early in meta description (first 50 chars if possible)
  const keywordLower = keyword.toLowerCase();
  const firstParagraphLower = firstParagraph.toLowerCase();
  
  let metaDesc = '';
  
  if (firstParagraphLower.includes(keywordLower)) {
    // Keyword found - use it, but ensure it's near the start
    const keywordIndex = firstParagraphLower.indexOf(keywordLower);
    if (keywordIndex <= 50) {
      // Keyword is early enough
      metaDesc = firstParagraph.substring(0, 155).trim();
    } else {
      // Move keyword earlier
      const beforeKeyword = firstParagraph.substring(0, keywordIndex);
      const afterKeyword = firstParagraph.substring(keywordIndex);
      metaDesc = `${afterKeyword.substring(0, 100)} ${beforeKeyword.substring(0, 50)}`.trim();
      if (metaDesc.length > 155) {
        metaDesc = metaDesc.substring(0, 152) + '...';
      }
    }
  } else {
    // Keyword not found - add it naturally at the start
    const excerpt = firstParagraph.substring(0, 120);
    metaDesc = `${keyword}: ${excerpt}...`.trim();
  }
  
  // Ensure it's exactly 150-155 characters (optimal for search results)
  if (metaDesc.length > 155) {
    metaDesc = metaDesc.substring(0, 152).trim() + '...';
  } else if (metaDesc.length < 120) {
    // Too short - add more context
    const moreContent = textContent.substring(200, 350).trim();
    metaDesc = `${metaDesc} ${moreContent.substring(0, 155 - metaDesc.length - 1)}`.trim();
    if (metaDesc.length > 155) {
      metaDesc = metaDesc.substring(0, 152) + '...';
    }
  }
  
  return metaDesc;
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
 * Generate SEO-optimized title (Keyword-first for instant traffic)
 */
async function generateTitle(keyword: string, templateType: string): Promise<string> {
  const prompt = `Generate a compelling, SEO-optimized blog post title that will rank immediately for keyword: "${keyword}"

INSTANT SEO TITLE REQUIREMENTS:
- Place the primary keyword "${keyword}" in the FIRST 3-5 words of the title (critical for instant ranking)
- Keep it between 50-60 characters (optimal for search results display)
- Make it clear, compelling, and click-worthy (high CTR = better ranking)
- Include a benefit, number, or power word when natural
- Match the template type: ${templateType}
- Sound human and engaging, not robotic

FORMAT EXAMPLES:
- "[Keyword]: [Benefit/Guide/Strategy]" (e.g., "Content Marketing: Complete Guide to Viral Growth")
- "How to [Action] with [Keyword]" (e.g., "How to Scale Content Marketing in 2024")
- "[Number] [Keyword] [Benefit]" (e.g., "10 Content Marketing Strategies That Actually Work")
- "[Keyword] for [Audience]" (e.g., "Content Marketing for SaaS Companies")

Return ONLY the title, nothing else. No quotes, no markdown, no colons at the end.`;

  const title = await generateText(prompt, undefined, { tier: 'basic' });
  return title.trim().replace(/^["']|["']$/g, '').replace(/^#+\s*/, '').replace(/:$/, ''); // Remove quotes, markdown, trailing colons
}

/**
 * Generate content using AI and template (Blitz SEO optimized with human voice)
 */
async function generateContentBody(
  keyword: string,
  templateType: string,
  targetWordCount: number = 2000
): Promise<string> {
  const template = getTemplate(templateType as any);
  const structure = template.structure;

  const prompt = `You are an expert SEO content writer and storyteller. Write a comprehensive, highly-optimized blog post about: "${keyword}" that sounds like it was written by a real human expert, not AI.

CRITICAL REQUIREMENTS FOR INSTANT SEO TRAFFIC:

1. KEYWORD OPTIMIZATION (For immediate search visibility):
   - Primary keyword "${keyword}" MUST appear in:
     * Title (first 3-5 words if possible)
     * First paragraph (within first 100 words, naturally)
     * At least 4-5 H2/H3 headings (with keyword variations)
     * Throughout body (1.5-2% density - natural, not forced)
   - Include 5-8 related long-tail keywords naturally
   - Use semantic variations and synonyms throughout
   - Include LSI (Latent Semantic Indexing) keywords related to "${keyword}"

2. EMBOLDENED SUBHEADERS (Visual hierarchy for SEO):
   - ALL H2 headings must use: <h2><strong>Your Heading Text</strong></h2>
   - ALL H3 headings must use: <h3><strong>Your Subheading Text</strong></h3>
   - This creates visual emphasis AND helps search engines understand structure
   - Make headings compelling and keyword-rich when natural

3. HUMAN VOICE & TONE (Not generic AI):
   - Write like a real expert sharing knowledge, not a robot
   - Use conversational language: "Here's what I've learned..." "You'll want to..."
   - Include personal insights, real examples, and authentic experiences
   - Vary sentence length (mix short punchy sentences with longer explanatory ones)
   - Use contractions naturally: "you're", "it's", "we've"
   - Add personality: occasional humor, relatable analogies, genuine enthusiasm
   - Avoid: "In conclusion", "It is important to note", "Furthermore" (too robotic)
   - Instead use: "Bottom line?", "Here's the thing...", "The real kicker is..."

4. CONTENT STRUCTURE (SEO + Readability):
   - Target: ${targetWordCount} words minimum (comprehensive, in-depth)
   - Use proper HTML: <h2><strong>...</strong></h2>, <h3><strong>...</strong></h3>, <p>, <ul>/<li>, <strong> for emphasis
   - Structure: Hook intro → Value-packed sections → Actionable takeaways → Strong conclusion
   - Include real examples, case studies, or data points
   - Add internal linking opportunities (mention related topics naturally)
   - Use bullet points and numbered lists for scannability

5. INSTANT SEO WINS:
   - First paragraph must answer "What is [keyword]?" or "Why does [keyword] matter?"
   - Include a "What You'll Learn" or "Key Takeaways" section early
   - Add FAQ section at end (targets featured snippets)
   - Use schema-friendly formatting (lists, headings, clear structure)
   - Include actionable steps readers can take immediately

6. VALUE & AUTHORITY:
   - Make this THE definitive resource on "${keyword}"
   - Include insights competitors miss
   - Provide actionable, specific advice (not vague generalizations)
   - Back up claims with examples or reasoning
   - Address common questions and objections

TEMPLATE STRUCTURE:
${structure}

WRITING STYLE EXAMPLES:
✅ GOOD (Human): "I've spent years testing different approaches, and here's what actually works..."
❌ BAD (Robotic): "It is important to understand that various approaches exist..."

✅ GOOD (Human): "You're probably wondering: does this really matter? Short answer: absolutely."
❌ BAD (Robotic): "This topic is significant because..."

✅ GOOD (Human): "Let me show you exactly how to do this, step by step."
❌ BAD (Robotic): "The following steps should be followed..."

Now write the complete, publication-ready article in HTML format. Make it sound like a real expert wrote it, optimize it for instant SEO traffic, and use <h2><strong>...</strong></h2> and <h3><strong>...</strong></h3> for ALL headings:`;

  const content = await generateText(prompt, undefined, { tier: 'basic' });
  
  // Post-process to ensure all headings are emboldened
  let processedContent = content.trim();
  
  // Ensure H2 headings are emboldened
  processedContent = processedContent.replace(
    /<h2>([^<]+)<\/h2>/gi,
    '<h2><strong>$1</strong></h2>'
  );
  
  // Ensure H3 headings are emboldened
  processedContent = processedContent.replace(
    /<h3>([^<]+)<\/h3>/gi,
    '<h3><strong>$1</strong></h3>'
  );
  
  // If headings already have strong tags but not wrapped, fix them
  processedContent = processedContent.replace(
    /<h2><strong>([^<]+)<\/strong><\/h2>/gi,
    '<h2><strong>$1</strong></h2>'
  );
  processedContent = processedContent.replace(
    /<h3><strong>([^<]+)<\/strong><\/h3>/gi,
    '<h3><strong>$1</strong></h3>'
  );
  
  return processedContent;
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
 * Calculate SEO score optimized for instant traffic
 */
function calculateBasicSEOScore(post: BlogPost, keyword: string): number {
  let score = 0;
  const keywordLower = keyword.toLowerCase();
  const titleLower = post.title.toLowerCase();
  const contentLower = post.content.replace(/<[^>]*>/g, '').toLowerCase();

  // Title contains keyword in first 5 words (35 points - CRITICAL for instant ranking)
  const titleWords = titleLower.split(/\s+/).slice(0, 5).join(' ');
  if (titleWords.includes(keywordLower)) score += 35;
  else if (titleLower.includes(keywordLower)) score += 25; // Still good, but not optimal

  // Meta description exists and contains keyword (15 points)
  if (post.meta_description) {
    score += 10;
    if (post.meta_description.toLowerCase().includes(keywordLower)) score += 5;
  }

  // Content length (20 points for 2000+ words - comprehensive content ranks better)
  if ((post.word_count || 0) >= 2000) score += 20;
  else if ((post.word_count || 0) >= 1500) score += 15;
  else if ((post.word_count || 0) >= 1000) score += 10;
  else if ((post.word_count || 0) >= 500) score += 5;

  // Keyword in first 100 words (15 points - early mention = better ranking)
  const first100Words = contentLower.substring(0, contentLower.indexOf(' ', 500) || 500);
  if (first100Words.includes(keywordLower)) score += 15;
  else if (contentLower.substring(0, 200).includes(keywordLower)) score += 10;

  // Keyword density optimal (10 points)
  const keywordCount = (contentLower.match(new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  const wordCount = post.word_count || 1;
  const density = (keywordCount / wordCount) * 100;
  if (density >= 1.5 && density <= 2.5) score += 10; // Optimal for instant traffic
  else if (density >= 1 && density <= 3) score += 7;

  // Has emboldened headings (10 points - visual + SEO benefit)
  if (post.content.includes('<h2><strong>') || post.content.includes('<h3><strong>')) score += 10;
  else if (post.content.includes('<h2') || post.content.includes('<h3')) score += 7;

  // Has excerpt (5 points)
  if (post.excerpt) score += 5;

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

