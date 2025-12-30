/**
 * Bulk Content Service - Optimized database operations for mass content
 */

import { BlogPost } from '../types/seo';
import { createBlogPost, dbRowToBlogPost } from './seoContentService';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

/**
 * Chunk array into smaller arrays
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Bulk create posts (1000 at a time for optimal performance)
 */
export async function bulkCreatePosts(
  posts: Partial<BlogPost>[]
): Promise<BlogPost[]> {
  if (posts.length === 0) return [];

  console.log(`📦 Bulk creating ${posts.length} posts...`);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('Supabase not available, falling back to individual inserts');
      return fallbackIndividualInserts(posts);
    }

    // Prepare data for bulk insert
    const now = new Date().toISOString();
    const insertData = posts.map(post => ({
      slug: post.slug || generateSlug(post.title || 'untitled'),
      title: post.title || 'Untitled',
      author: post.author || 'AIBC',
      meta_description: post.meta_description || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      featured_image_url: post.featured_image_url || null,
      category: post.category || null,
      tags: post.tags || [],
      target_keywords: post.target_keywords || [],
      status: post.status || 'published',
      published_at: post.published_at || (post.status === 'published' ? now : null),
      created_at: post.created_at || now,
      updated_at: post.updated_at || now,
      word_count: post.word_count || null,
      reading_time: post.reading_time || null,
      views: post.views || 0,
      seo_score: post.seo_score || null,
      internal_links: post.internal_links || {},
      structured_data: post.structured_data || {},
    }));

    // Bulk insert in chunks of 1000 (Supabase limit)
    const chunks = chunkArray(insertData, 1000);
    const results: BlogPost[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`  Inserting chunk ${i + 1}/${chunks.length} (${chunk.length} posts)...`);

      try {
        const { data, error } = await supabase
          .from('seo_blog_posts')
          .insert(chunk)
          .select();

        if (error) {
          console.error(`Error in bulk insert chunk ${i + 1}:`, error);
          // Fallback to individual inserts for this chunk
          const fallbackResults = await fallbackIndividualInserts(
            chunk.map(c => ({
              slug: c.slug,
              title: c.title,
              content: c.content,
              // ... map other fields
            }))
          );
          results.push(...fallbackResults);
          continue;
        }

        if (data) {
          results.push(...data.map(dbRowToBlogPost));
        }
      } catch (error) {
        console.error(`Exception in bulk insert chunk ${i + 1}:`, error);
        // Continue with next chunk
      }
    }

    console.log(`✅ Bulk insert complete: ${results.length}/${posts.length} posts created`);
    return results;
  }

  // Fallback to individual inserts
  return fallbackIndividualInserts(posts);
}

/**
 * Fallback to individual inserts (slower but reliable)
 */
async function fallbackIndividualInserts(
  posts: Partial<BlogPost>[]
): Promise<BlogPost[]> {
  const results: BlogPost[] = [];
  
  // Process in parallel batches of 50
  const chunks = chunkArray(posts, 50);
  
  for (const chunk of chunks) {
    const chunkResults = await Promise.allSettled(
      chunk.map(post => createBlogPost(post))
    );
    
    for (const result of chunkResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    }
  }
  
  return results;
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

/**
 * Bulk update posts
 */
export async function bulkUpdatePosts(
  updates: Array<{ id: string; data: Partial<BlogPost> }>
): Promise<number> {
  if (!isSupabaseConfigured() || updates.length === 0) return 0;

  const supabase = getSupabaseClient();
  if (!supabase) return 0;

  // Process in chunks
  const chunks = chunkArray(updates, 100);
  let updated = 0;

  for (const chunk of chunks) {
    const promises = chunk.map(({ id, data }) =>
      supabase
        .from('seo_blog_posts')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
    );

    const results = await Promise.allSettled(promises);
    updated += results.filter(r => r.status === 'fulfilled').length;
  }

  return updated;
}

