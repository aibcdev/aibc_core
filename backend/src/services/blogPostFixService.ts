/**
 * Blog Post Fix Service - Centralized service for fixing blog post issues
 * Handles image generation, content formatting, and other fixes
 */

import { BlogPost } from '../types/seo';
import { generateFeaturedImage } from './contentGeneratorService';
import { updateBlogPost } from './seoContentService';

/**
 * Fix a single blog post - ensures it has images and proper formatting
 */
export async function fixBlogPost(post: BlogPost): Promise<BlogPost> {
  let needsUpdate = false;
  const updates: Partial<BlogPost> = {};
  const currentYear = new Date().getFullYear();

  // Fix HTML formatting issues
  if (post.content) {
    let processedContent = post.content;

    // Remove markdown code block wrappers (```html ... ```)
    processedContent = processedContent.replace(/^```html\s*/i, '');
    processedContent = processedContent.replace(/\s*```\s*$/i, '');
    processedContent = processedContent.trim();

    // Remove Table of Contents - more aggressive patterns
    processedContent = processedContent.replace(
      /<h2><strong>Table of Contents<\/strong><\/h2>[\s\S]*?(?=<h2|<h3|$)/gi,
      ''
    );
    processedContent = processedContent.replace(
      /<h2>Table of Contents<\/h2>[\s\S]*?(?=<h2|<h3|$)/gi,
      ''
    );
    processedContent = processedContent.replace(
      /<h3><strong>Table of Contents<\/strong><\/h3>[\s\S]*?(?=<h2|<h3|$)/gi,
      ''
    );
    processedContent = processedContent.replace(
      /<h3>Table of Contents<\/h3>[\s\S]*?(?=<h2|<h3|$)/gi,
      ''
    );
    processedContent = processedContent.replace(
      /## Table of Contents[\s\S]*?(?=##|$)/gi,
      ''
    );
    processedContent = processedContent.replace(
      /### Table of Contents[\s\S]*?(?=##|###|$)/gi,
      ''
    );
    // Remove TOC lists
    processedContent = processedContent.replace(
      /<ul>[\s\S]*?Table of Contents[\s\S]*?<\/ul>/gi,
      ''
    );
    processedContent = processedContent.replace(
      /<ol>[\s\S]*?Table of Contents[\s\S]*?<\/ol>/gi,
      ''
    );

    // Fix broken HTML tags (common issues: unclosed tags, malformed attributes)
    // Remove any HTML tags with trailing/failing codes (broken attributes that cause rendering issues)
    processedContent = processedContent.replace(
      /<(\w+)[^>]*\s+[a-z]+="[^"]*$/gim,
      (match) => {
        const tagName = match.match(/<(\w+)/)?.[1];
        return tagName ? `<${tagName}>` : match;
      }
    );

    // Remove any tags with malformed attributes (containing special chars that break HTML parsing)
    processedContent = processedContent.replace(
      /<(\w+)[^>]*[<>{}[\]\\|`~!@#$%^&*+=?;:'"][^>]*>/gi,
      (match) => {
        const tagName = match.match(/<(\w+)/)?.[1];
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
    processedContent = processedContent.replace(/\b2024\b/g, currentYear.toString());

    if (processedContent !== post.content) {
      updates.content = processedContent;
      needsUpdate = true;
    }
  }

  // Add featured image if missing
  if (!post.featured_image_url) {
    const keyword = post.target_keywords?.[0] || post.title.split(' ').slice(0, 3).join(' ') || 'Blog Post';
    const imageUrl = await generateFeaturedImage(post.title, keyword, post.category);
    if (imageUrl) {
      updates.featured_image_url = imageUrl;
      needsUpdate = true;
    }
  }

  // Apply updates if needed
  if (needsUpdate) {
    const updated = await updateBlogPost(post.id, updates);
    return updated || post;
  }

  return post;
}

/**
 * Fix multiple blog posts
 */
export async function fixBlogPosts(posts: BlogPost[]): Promise<{ fixed: number; errors: number }> {
  let fixed = 0;
  let errors = 0;

  for (const post of posts) {
    try {
      const fixedPost = await fixBlogPost(post);
      // Check if any updates were made
      if (fixedPost.featured_image_url !== post.featured_image_url || 
          fixedPost.content !== post.content) {
        fixed++;
      }
    } catch (error: any) {
      console.error(`Error fixing post ${post.id}:`, error);
      errors++;
    }
  }

  return { fixed, errors };
}

