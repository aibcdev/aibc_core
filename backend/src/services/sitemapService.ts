/**
 * Sitemap Service - Dynamic XML sitemap generation
 */

import { listBlogPosts } from './seoContentService';
import { BlogPost } from '../types/seo';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate sitemap XML
 */
export function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlEntries = urls.map(url => {
    let entry = `  <url>\n    <loc>${escapeXML(url.loc)}</loc>\n`;
    
    if (url.lastmod) {
      entry += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    
    if (url.changefreq) {
      entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    
    if (url.priority !== undefined) {
      entry += `    <priority>${url.priority}</priority>\n`;
    }
    
    entry += '  </url>';
    return entry;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Get base URL from environment or default
 */
function getBaseURL(): string {
  const baseURL = process.env.BASE_URL || process.env.FRONTEND_URL || 'https://aibcmedia.com';
  return baseURL.replace(/\/$/, ''); // Remove trailing slash
}

/**
 * Generate sitemap for blog posts
 */
export async function generateBlogSitemap(): Promise<string> {
  const baseURL = getBaseURL();
  const urls: SitemapUrl[] = [];

  // Get all published blog posts
  const result = await listBlogPosts({ status: 'published', limit: 1000 });
  
  // Add blog listing page
  urls.push({
    loc: `${baseURL}/blog`,
    changefreq: 'daily',
    priority: 0.9,
  });

  // Add each blog post
  for (const post of result.posts) {
    if (post.status === 'published' && post.published_at) {
      urls.push({
        loc: `${baseURL}/blog/${post.slug}`,
        lastmod: post.updated_at || post.published_at,
        changefreq: 'weekly',
        priority: 0.8,
      });
    }
  }

  return generateSitemapXML(urls);
}

/**
 * Generate complete sitemap (all pages)
 */
export async function generateFullSitemap(): Promise<string> {
  const baseURL = getBaseURL();
  const urls: SitemapUrl[] = [];

  // Main pages
  urls.push(
    { loc: baseURL, changefreq: 'daily', priority: 1.0 },
    { loc: `${baseURL}/pricing`, changefreq: 'monthly', priority: 0.8 },
    { loc: `${baseURL}/blog`, changefreq: 'daily', priority: 0.9 }
  );

  // Get all published blog posts
  const result = await listBlogPosts({ status: 'published', limit: 1000 });
  
  for (const post of result.posts) {
    if (post.status === 'published' && post.published_at) {
      urls.push({
        loc: `${baseURL}/blog/${post.slug}`,
        lastmod: post.updated_at || post.published_at,
        changefreq: 'weekly',
        priority: 0.7,
      });
    }
  }

  return generateSitemapXML(urls);
}

