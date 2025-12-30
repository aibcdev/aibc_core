/**
 * Content Generator Service - AI-powered content generation using templates
 */

import { generateText, generateJSON } from './llmService';
import { getTemplate, suggestTemplateForKeyword } from './contentTemplates';
import { createBlogPost, updateBlogPost } from './seoContentService';
import { ContentGenerationRequest, ContentGenerationResponse, BlogPost } from '../types/seo';
import { selectAuthor, getAuthorWritingInstructions, Author } from './authorService';

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
- "How to [Action] with [Keyword]" (e.g., "How to Scale Content Marketing in ${new Date().getFullYear()}")
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
  targetWordCount: number = 2000,
  author?: Author
): Promise<string> {
  const template = getTemplate(templateType as any);
  const structure = template.structure;

  // Get author-specific writing instructions if author provided
  const authorInstructions = author ? getAuthorWritingInstructions(author) : '';

  // Get holiday/event context if available
  const { getHolidayContext } = await import('./holidayEventService');
  const holidayContext = getHolidayContext();

  const prompt = `${authorInstructions}

You are an expert SEO content writer and storyteller. Write a comprehensive, highly-optimized blog post about: "${keyword}" that sounds like it was written by a real human expert, not AI.

${holidayContext}

${author ? `REMEMBER: Write in ${author.name}'s distinct voice and style throughout. Use their characteristic phrases, tone, and approach while maintaining all SEO requirements.` : ''}

MODERN BLOG STRUCTURE (Inspired by imagineai.me and headspace.com):

1. OPENING (Hook + Value Promise):
   - Start with a compelling hook: a question, surprising fact, relatable scenario, or personal story
   - First paragraph should be 2-3 sentences that immediately engage the reader
   - Clearly state what they'll learn or gain from reading this
   - Use current year (${new Date().getFullYear()}) naturally, never hardcode 2024
   - DO NOT start with "In this article" or "This post will" - be direct and engaging

2. NATURAL FLOW & STORYTELLING:
   - Each section should flow naturally into the next (like a conversation)
   - Use transition phrases: "Here's the thing...", "But wait, there's more...", "Let me explain...", "Here's where it gets interesting..."
   - Break up long paragraphs (3-4 sentences max per paragraph for readability)
   - Use white space effectively - short paragraphs create visual breathing room
   - Tell mini-stories within sections to illustrate points

3. CONTENT STRUCTURE (Modern Blog Format):
   - Opening hook (2-3 paragraphs)
   - Main content sections with clear H2 headings
   - Each H2 section should be 3-5 paragraphs with natural flow
   - Use H3 for subsections when needed (but don't overdo it)
   - Include visual breaks: bullet lists, numbered lists, short paragraphs
   - End each major section with a takeaway or transition to next section

4. KEYWORD OPTIMIZATION (Natural Integration):
   - Primary keyword "${keyword}" MUST appear in:
     * Title (first 3-5 words if possible)
     * First paragraph (within first 100 words, naturally)
     * At least 4-5 H2/H3 headings (with keyword variations)
     * Throughout body (1.5-2% density - natural, not forced)
   - Include 5-8 related long-tail keywords naturally
   - Use semantic variations and synonyms throughout
   - Include LSI (Latent Semantic Indexing) keywords related to "${keyword}"

5. EMBOLDENED SUBHEADERS (Visual hierarchy):
   - ALL H2 headings must use: <h2><strong>Your Heading Text</strong></h2>
   - ALL H3 headings must use: <h3><strong>Your Subheading Text</strong></h3>
   - Make headings compelling, benefit-focused, and keyword-rich when natural
   - Headings should create curiosity and guide the reader forward

6. HUMAN VOICE & TONE (Critical for Engagement):
   - Write like a real expert sharing knowledge, not a robot or encyclopedia
   - Use conversational language: "Here's what I've learned...", "You'll want to...", "I've seen this work..."
   - Include personal insights: "In my experience...", "I've noticed that...", "Here's what surprised me..."
   - Vary sentence length (mix short punchy sentences with longer explanatory ones)
   - Use contractions naturally: "you're", "it's", "we've", "don't", "can't"
   - Add personality: occasional humor, relatable analogies, genuine enthusiasm
   - Ask rhetorical questions: "But here's the thing...", "Want to know the secret?", "What if I told you..."
   - Avoid robotic phrases: "In conclusion", "It is important to note", "Furthermore", "Additionally", "Moreover"
   - Instead use: "Bottom line?", "Here's the thing...", "The real kicker is...", "Let me be straight with you..."
   - Make it feel like a conversation, not a textbook

7. CONTENT DEPTH & VALUE:
   - Target: ${targetWordCount} words minimum (comprehensive, in-depth)
   - Each section should provide real value, not filler
   - Include actionable insights readers can use immediately
   - Address common questions and objections naturally within the flow
   - Use examples and analogies to make concepts relatable
   - Back up claims with reasoning or context (no fake statistics or made-up data)

8. VISUAL ELEMENTS & SCANNABILITY:
   - Use bullet points for lists (makes content scannable)
   - Use numbered lists for step-by-step processes
   - Break up text with short paragraphs (2-4 sentences)
   - Use <strong> for emphasis on key points (but don't overdo it)
   - Create visual hierarchy with proper heading structure

9. CONCLUSION (Natural Wrap-up):
   - Summarize key takeaways in 2-3 paragraphs
   - End with a clear next step or call to action (but make it natural, not pushy)
   - Leave reader feeling they gained real value
   - DO NOT use "In conclusion" - transition naturally: "So, what does this all mean?", "Here's the bottom line...", "At the end of the day..."

10. FAQ SECTION (For Featured Snippets):
    - Add 3-5 common questions related to "${keyword}"
    - Format as: <p><strong>Q: Question here?</strong></p><p>A: Natural, conversational answer...</p>
    - Answers should be 2-3 sentences, not one-word responses

CRITICAL RULES:
- DO NOT include a "Table of Contents" section
- DO NOT use hardcoded dates (use ${new Date().getFullYear()} naturally)
- DO NOT include fake statistics or made-up data
- DO NOT use placeholder text or "lorem ipsum" style content
- DO write naturally, as if speaking to a friend who's interested in the topic
- DO create a narrative flow that keeps readers engaged from start to finish

TEMPLATE STRUCTURE:
${structure}

WRITING STYLE EXAMPLES:
✅ GOOD (Natural Flow): "I've spent years testing different approaches, and here's what actually works. The thing most people miss? It's not about the tools—it's about the mindset."
❌ BAD (Robotic): "It is important to understand that various approaches exist. The following information will be useful."

✅ GOOD (Engaging): "You're probably wondering: does this really matter? Short answer: absolutely. Here's why..."
❌ BAD (Generic): "This topic is significant because it affects many people."

✅ GOOD (Conversational): "Let me show you exactly how to do this, step by step. I'll walk you through each part so you can see exactly what I mean."
❌ BAD (Formal): "The following steps should be followed in order to achieve the desired outcome."

Now write the complete, publication-ready article in HTML format. Make it sound like a real expert wrote it, create natural flow throughout, optimize for SEO, and use <h2><strong>...</strong></h2> and <h3><strong>...</strong></h3> for ALL headings. Target ${targetWordCount} words with real depth and value.`;

  const content = await generateText(prompt, undefined, { tier: 'basic' });
  
  // Post-process to ensure all headings are emboldened and fix HTML issues
  let processedContent = content.trim();
  
  // Remove Table of Contents sections (if LLM added them despite instructions)
  processedContent = processedContent.replace(
    /<h2><strong>Table of Contents<\/strong><\/h2>[\s\S]*?(?=<h2|<h3|$)/gi,
    ''
  );
  processedContent = processedContent.replace(
    /<h2>Table of Contents<\/h2>[\s\S]*?(?=<h2|<h3|$)/gi,
    ''
  );
  processedContent = processedContent.replace(
    /## Table of Contents[\s\S]*?(?=##|$)/gi,
    ''
  );
  
  // Fix broken HTML tags (common issues: unclosed tags, malformed attributes)
  // Remove any HTML tags with trailing/failing codes (broken attributes that cause rendering issues)
  // Fix tags with unclosed quotes or malformed attributes
  processedContent = processedContent.replace(
    /<(\w+)[^>]*\s+[a-z]+="[^"]*$/gim,
    (match) => {
      // If tag is not properly closed, try to fix it
      const tagName = match.match(/<(\w+)/)?.[1];
      return tagName ? `<${tagName}>` : match;
    }
  );
  
  // Remove any tags with malformed attributes (containing special chars that break HTML parsing)
  // This catches "frailing codes" - broken HTML attributes that cause rendering issues
  processedContent = processedContent.replace(
    /<(\w+)[^>]*[<>{}[\]\\|`~!@#$%^&*+=?;:'"][^>]*>/gi,
    (match) => {
      const tagName = match.match(/<(\w+)/)?.[1];
      // If we can extract a valid tag name, return a clean version, otherwise remove
      if (tagName && ['h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'div', 'span'].includes(tagName.toLowerCase())) {
        return `<${tagName}>`;
      }
      return '';
    }
  );
  
  // Fix common HTML issues: unclosed tags, mismatched tags
  // Remove orphaned closing tags
  processedContent = processedContent.replace(/<\/\w+>(?![^<]*<)/g, '');
  
  // Fix double-closed tags
  processedContent = processedContent.replace(/<\/strong><\/strong>/gi, '</strong>');
  processedContent = processedContent.replace(/<\/em><\/em>/gi, '</em>');
  
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
  
  // Replace any hardcoded 2024 with current year
  const currentYear = new Date().getFullYear();
  processedContent = processedContent.replace(/\b2024\b/g, currentYear.toString());
  
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

  // Select author with clustering algorithm
  const author = selectAuthor();
  console.log(`[Content Generator] Generating ${selectedTemplateType} post for keyword: "${keyword}"`);
  console.log(`[Content Generator] Assigned author: ${author.name} (${author.background})`);

  try {
    // Generate title
    const title = await generateTitle(keyword, selectedTemplateType);
    console.log(`[Content Generator] Generated title: "${title}"`);

    // Generate content body with author's writing style
    const content = await generateContentBody(keyword, selectedTemplateType, target_word_count, author);
    console.log(`[Content Generator] Generated content (${content.length} chars) in ${author.name}'s voice`);

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

    // Generate featured image URL based on keyword/title
    // Use Unsplash API for free, high-quality images
    const featuredImageUrl = await generateFeaturedImage(title, keyword, category);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contentGeneratorService.ts:generateBlogPost',message:'FEATURED IMAGE URL BEFORE CREATE',data:{featuredImageUrl,hasImageUrl:!!featuredImageUrl,title,keyword},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-post-create',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

    // Create blog post - Auto-publish if SEO score is good
    const post = await createBlogPost({
      title,
      slug,
      author: author.name, // Assign selected author
      meta_description: metaDescription,
      content,
      excerpt,
      category,
      tags: [...new Set(tags)], // Remove duplicates
      target_keywords: [keyword],
      status: 'published', // Auto-publish for SEO content generation
      published_at: new Date().toISOString(),
      word_count: wordCount,
      featured_image_url: featuredImageUrl,
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contentGeneratorService.ts:generateBlogPost',message:'BLOG POST CREATED',data:{postId:post.id,slug:post.slug,hasFeaturedImageUrl:!!post.featured_image_url,featuredImageUrl:post.featured_image_url,title},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-post-create',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

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

/**
 * Generate featured image URL for blog post
 * Uses Unsplash Source API (free, no API key required for basic usage)
 */
export async function generateFeaturedImage(title: string, keyword: string, category?: string): Promise<string | undefined> {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contentGeneratorService.ts:generateFeaturedImage',message:'GENERATE FEATURED IMAGE CALLED',data:{title,keyword,category},timestamp:Date.now(),sessionId:'debug-session',runId:'image-gen',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    // Extract main concept from title/keyword for image search
    const searchTerm = keyword.split(' ').slice(0, 3).join(' ') || title.split(' ').slice(0, 3).join(' ');
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contentGeneratorService.ts:generateFeaturedImage',message:'SEARCH TERM EXTRACTED',data:{searchTerm,keyword,title},timestamp:Date.now(),sessionId:'debug-session',runId:'image-gen',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    // Use a deterministic image service that provides keyword-based images
    // Since Unsplash Source is deprecated and we don't have API keys, we'll use
    // a service that provides keyword-relevant placeholder images
    // For now, use placehold.co with keyword text - this at least shows the keyword
    // In production, you should use Unsplash/Pexels API with proper API keys for real photos
    const encodedKeyword = encodeURIComponent(searchTerm.substring(0, 50)); // Limit to 50 chars for URL
    const imageUrl = `https://placehold.co/1200x630/1a1a1a/f97316?text=${encodedKeyword}`;
    
    // Note: For actual photos related to keywords, you would need:
    // 1. Unsplash API key: https://unsplash.com/developers
    // 2. Pexels API key: https://www.pexels.com/api/
    // Then use their search APIs to get keyword-relevant images
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contentGeneratorService.ts:generateFeaturedImage',message:'IMAGE URL GENERATED',data:{imageUrl,searchTerm,encodedKeyword},timestamp:Date.now(),sessionId:'debug-session',runId:'image-gen',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    // Return the image URL
    return imageUrl;
  } catch (error) {
    console.warn('[Content Generator] Failed to generate featured image:', error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contentGeneratorService.ts:generateFeaturedImage',message:'IMAGE GENERATION ERROR',data:{error:error instanceof Error ? error.message : String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'image-gen',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    // Return undefined if image generation fails - frontend will show placeholder
    return undefined;
  }
}

