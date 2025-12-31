/**
 * Mass Sitemap Service - Handle sitemaps for 1M+ pages
 * Uses sitemap index and multiple sitemap files
 */

import { SitemapUrl, generateSitemapXML, generateSitemapIndex } from './sitemapService';
import { listBlogPosts } from './seoContentService';

const MAX_URLS_PER_SITEMAP = 50000; // Google's limit is 50,000 URLs per sitemap

/**
 * Generate sitemap for a range of posts
 */
export async function generateSitemapChunk(
  startIndex: number,
  endIndex: number,
  baseURL: string
): Promise<string> {
  const result = await listBlogPosts({ 
    status: 'published', 
    limit: endIndex - startIndex,
    // Would need pagination support
  });

  const urls: SitemapUrl[] = result.posts
    .slice(startIndex, endIndex)
    .map(post => ({
      loc: `${baseURL}/blog/${post.slug}`,
      lastmod: post.updated_at || post.published_at,
      changefreq: 'weekly' as const,
      priority: 0.7,
    }));

  return generateSitemapXML(urls);
}

/**
 * Generate sitemap index for all sitemaps
 */
export async function generateMassSitemapIndex(baseURL: string, totalPosts: number): Promise<string> {
  const numSitemaps = Math.ceil(totalPosts / MAX_URLS_PER_SITEMAP);
  const sitemaps: Array<{ loc: string; lastmod?: string }> = [];

  // Main sitemaps
  sitemaps.push({ loc: `${baseURL}/api/sitemap.xml` });
  sitemaps.push({ loc: `${baseURL}/api/blog/sitemap.xml` });
  sitemaps.push({ loc: `${baseURL}/api/categories/sitemap.xml` });
  sitemaps.push({ loc: `${baseURL}/api/tags/sitemap.xml` });

  // Post sitemaps (chunked)
  for (let i = 0; i < numSitemaps; i++) {
    sitemaps.push({
      loc: `${baseURL}/api/sitemap/posts-${i + 1}.xml`,
      lastmod: new Date().toISOString().split('T')[0],
    });
  }

  return generateSitemapIndex(sitemaps);
}

/**
 * Get total post count
 */
export async function getTotalPostCount(): Promise<number> {
  const result = await listBlogPosts({ status: 'published', limit: 1 });
  return result.total || 0;
}




