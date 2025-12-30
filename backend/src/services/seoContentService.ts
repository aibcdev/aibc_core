/**
 * SEO Content Service - Manages blog posts and content
 * Uses Supabase for persistent storage, falls back to in-memory if not configured
 */

import { BlogPost, BlogListParams, BlogListResponse } from '../types/seo';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import * as fs from 'fs';
import * as path from 'path';

// In-memory storage (fallback if Supabase not configured)
const blogPostsStore: Map<string, BlogPost> = new Map();
const blogPostsBySlug: Map<string, string> = new Map();


/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Calculate reading time from word count
 */
function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Calculate word count from content
 */
function calculateWordCount(content: string): number {
  return content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Convert database row to BlogPost
 */
function dbRowToBlogPost(row: any): BlogPost {
  const post = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    author: row.author,
    meta_description: row.meta_description,
    content: row.content,
    excerpt: row.excerpt,
    featured_image_url: row.featured_image_url,
    category: row.category,
    tags: row.tags || [],
    target_keywords: row.target_keywords || [],
    status: row.status,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    word_count: row.word_count,
    reading_time: row.reading_time,
    views: row.views || 0,
    seo_score: row.seo_score,
    internal_links: row.internal_links || {},
    structured_data: row.structured_data || {},
  };
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'seoContentService.ts:dbRowToBlogPost',message:'DB ROW TO BLOG POST',data:{postId:post.id,slug:post.slug,hasFeaturedImageUrl:!!post.featured_image_url,featuredImageUrl:post.featured_image_url,hasTargetKeywords:!!post.target_keywords?.length,targetKeywords:post.target_keywords},timestamp:Date.now(),sessionId:'debug-session',runId:'db-conversion',hypothesisId:'H3'})}).catch(()=>{});
  // #endregion
  
  return post;
}

/**
 * Create a new blog post
 */
export async function createBlogPost(data: Partial<BlogPost>): Promise<BlogPost> {
  const slug = data.slug || generateSlug(data.title || 'untitled');
  const now = new Date().toISOString();
  const wordCount = data.content ? calculateWordCount(data.content) : 0;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    // Check for existing slug
    const { data: existing } = await supabase
      .from('seo_blog_posts')
      .select('id')
      .eq('slug', slug)
      .single();

    let finalSlug = slug;
    if (existing) {
      let counter = 1;
      do {
        finalSlug = `${slug}-${counter}`;
        const { data: check } = await supabase
          .from('seo_blog_posts')
          .select('id')
          .eq('slug', finalSlug)
          .single();
        if (!check) break;
        counter++;
      } while (true);
    }

    const postData = {
      slug: finalSlug,
      title: data.title || 'Untitled',
      author: data.author || null, // Author name assigned during generation
      meta_description: data.meta_description,
      content: data.content || '',
      excerpt: data.excerpt || data.content?.substring(0, 160) || '',
      featured_image_url: data.featured_image_url,
      category: data.category,
      tags: data.tags || [],
      target_keywords: data.target_keywords || [],
      status: data.status || 'draft',
      published_at: data.status === 'published' && !data.published_at ? now : data.published_at,
      word_count: wordCount,
      reading_time: wordCount > 0 ? calculateReadingTime(wordCount) : null,
      views: 0,
      seo_score: data.seo_score,
      internal_links: data.internal_links || {},
      structured_data: data.structured_data || {},
    };

    const { data: post, error } = await supabase
      .from('seo_blog_posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }

    return dbRowToBlogPost(post);
  } else {
    // Fallback to in-memory
    const id = data.id || `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let finalSlug = slug;
    let counter = 1;
    while (blogPostsBySlug.has(finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const post: BlogPost = {
      id,
      slug: finalSlug,
      title: data.title || 'Untitled',
      author: data.author || undefined, // Author name assigned during generation
      meta_description: data.meta_description,
      content: data.content || '',
      excerpt: data.excerpt || data.content?.substring(0, 160) || '',
      featured_image_url: data.featured_image_url,
      category: data.category,
      tags: data.tags || [],
      target_keywords: data.target_keywords || [],
      status: data.status || 'draft',
      published_at: data.status === 'published' && !data.published_at ? now : data.published_at,
      created_at: data.created_at || now,
      updated_at: now,
      word_count: wordCount,
      reading_time: wordCount > 0 ? calculateReadingTime(wordCount) : undefined,
      views: 0,
      seo_score: data.seo_score,
      internal_links: data.internal_links,
      structured_data: data.structured_data,
    };

    blogPostsStore.set(id, post);
    blogPostsBySlug.set(finalSlug, id);
    return post;
  }
}

/**
 * Get blog post by ID
 */
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('seo_blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return dbRowToBlogPost(data);
  } else {
    return blogPostsStore.get(id) || null;
  }
}

/**
 * Get blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('seo_blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return dbRowToBlogPost(data);
  } else {
    const id = blogPostsBySlug.get(slug);
    if (!id) return null;
    return blogPostsStore.get(id) || null;
  }
}

/**
 * Update blog post
 */
export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    // Recalculate word count if content changed
    const updateData: any = { ...updates };
    if (updates.content !== undefined) {
      updateData.word_count = calculateWordCount(updates.content);
      updateData.reading_time = updateData.word_count > 0 ? calculateReadingTime(updateData.word_count) : null;
    }

    // Remove id from updates
    delete updateData.id;

    const { data, error } = await supabase
      .from('seo_blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;
    return dbRowToBlogPost(data);
  } else {
    const existing = blogPostsStore.get(id);
    if (!existing) return null;

    if (updates.slug && updates.slug !== existing.slug) {
      blogPostsBySlug.delete(existing.slug);
      blogPostsBySlug.set(updates.slug, id);
    }

    if (updates.content !== undefined) {
      updates.word_count = calculateWordCount(updates.content);
      updates.reading_time = updates.word_count > 0 ? calculateReadingTime(updates.word_count) : undefined;
    }

    const updated: BlogPost = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    blogPostsStore.set(id, updated);
    return updated;
  }
}

/**
 * Delete blog post
 */
export async function deleteBlogPost(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('seo_blog_posts')
      .delete()
      .eq('id', id);

    return !error;
  } else {
    const post = blogPostsStore.get(id);
    if (!post) return false;

    blogPostsStore.delete(id);
    blogPostsBySlug.delete(post.slug);
    return true;
  }
}

/**
 * List blog posts with filtering and pagination
 */
export async function listBlogPosts(params: BlogListParams = {}): Promise<BlogListResponse> {
  const {
    page = 1,
    limit = 10,
    category,
    tag,
    status,
    search,
  } = params;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return { posts: [], total: 0, page, limit, totalPages: 0 };

    let query = supabase.from('seo_blog_posts').select('*', { count: 'exact' });

    if (category) query = query.eq('category', category);
    if (tag) query = query.contains('tags', [tag]);
    if (status) {
      query = query.eq('status', status);
      // If filtering by 'published', ensure published_at is not null
      if (status === 'published') {
        query = query.not('published_at', 'is', null);
      }
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,meta_description.ilike.%${search}%`);
    }

    // Sort by published_at DESC (nulls last), then created_at DESC
    // For published posts, published_at should not be null, so this ensures proper ordering
    query = query.order('published_at', { ascending: false, nullsFirst: false });
    query = query.order('created_at', { ascending: false });

    // Paginate
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error || !data) {
      return { posts: [], total: 0, page, limit, totalPages: 0 };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      posts: data.map(dbRowToBlogPost),
      total,
      page,
      limit,
      totalPages,
    };
  } else {
    // Fallback to in-memory
    let posts = Array.from(blogPostsStore.values());

    if (category) posts = posts.filter(p => p.category === category);
    if (tag) posts = posts.filter(p => p.tags?.includes(tag));
    if (status) posts = posts.filter(p => p.status === status);
    if (search) {
      const searchLower = search.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.content.toLowerCase().includes(searchLower) ||
        p.excerpt?.toLowerCase().includes(searchLower)
      );
    }

    posts.sort((a, b) => {
      const dateA = a.published_at || a.created_at;
      const dateB = b.published_at || b.created_at;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    const total = posts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedPosts = posts.slice(startIndex, startIndex + limit);

    return {
      posts: paginatedPosts,
      total,
      page,
      limit,
      totalPages,
    };
  }
}

/**
 * Increment view count
 */
export async function incrementViewCount(slug: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      // Try RPC function first
      const { error: rpcError } = await supabase.rpc('increment_post_views', { post_slug: slug });
      if (rpcError) {
        // Fallback if RPC doesn't exist - manually increment
        const { data } = await supabase
          .from('seo_blog_posts')
          .select('views')
          .eq('slug', slug)
          .single();

        if (data) {
          await supabase
            .from('seo_blog_posts')
            .update({ views: (data.views || 0) + 1 })
            .eq('slug', slug);
        }
      }
    } catch (error) {
      // Silently fail - views are not critical
      console.warn('Failed to increment view count:', error);
    }
  } else {
    const post = await getBlogPostBySlug(slug);
    if (post) {
      post.views++;
      blogPostsStore.set(post.id, post);
    }
  }
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<string[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data } = await supabase
      .from('seo_blog_posts')
      .select('category')
      .not('category', 'is', null);

    if (!data) return [];
    const categories = new Set(data.map(row => row.category).filter(Boolean));
    return Array.from(categories).sort();
  } else {
    const categories = new Set<string>();
    for (const post of blogPostsStore.values()) {
      if (post.category) {
        categories.add(post.category);
      }
    }
    return Array.from(categories).sort();
  }
}

/**
 * Get all tags
 */
export async function getTags(): Promise<string[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data } = await supabase
      .from('seo_blog_posts')
      .select('tags');

    if (!data) return [];
    const tags = new Set<string>();
    data.forEach(row => {
      if (row.tags && Array.isArray(row.tags)) {
        row.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  } else {
    const tags = new Set<string>();
    for (const post of blogPostsStore.values()) {
      if (post.tags) {
        post.tags.forEach(tag => tags.add(tag));
      }
    }
    return Array.from(tags).sort();
  }
}

/**
 * Get related posts (by category or tags)
 */
export async function getRelatedPosts(postId: string, limit: number = 3): Promise<BlogPost[]> {
  const post = await getBlogPostById(postId);
  if (!post) return [];

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    let related: BlogPost[] = [];

    // Find posts with same category
    if (post.category) {
      const { data } = await supabase
        .from('seo_blog_posts')
        .select('*')
        .eq('category', post.category)
        .eq('status', 'published')
        .neq('id', postId)
        .limit(limit);

      if (data) {
        related.push(...data.map(dbRowToBlogPost));
      }
    }

    // Find posts with matching tags
    if (post.tags && post.tags.length > 0 && related.length < limit) {
      const { data } = await supabase
        .from('seo_blog_posts')
        .select('*')
        .eq('status', 'published')
        .neq('id', postId)
        .overlaps('tags', post.tags)
        .limit(limit - related.length);

      if (data) {
        related.push(...data.map(dbRowToBlogPost));
      }
    }

    // Remove duplicates
    const uniqueRelated = Array.from(new Map(related.map(p => [p.id, p])).values());
    return uniqueRelated.slice(0, limit);
  } else {
    // Fallback to in-memory
    let related: BlogPost[] = [];

    if (post.category) {
      const categoryPosts = Array.from(blogPostsStore.values())
        .filter(p => p.id !== postId && p.category === post.category && p.status === 'published');
      related.push(...categoryPosts);
    }

    if (post.tags && post.tags.length > 0) {
      const tagPosts = Array.from(blogPostsStore.values())
        .filter(p => {
          if (p.id === postId || p.status !== 'published') return false;
          return p.tags?.some(tag => post.tags!.includes(tag));
        });
      related.push(...tagPosts);
    }

    const uniqueRelated = Array.from(new Map(related.map(p => [p.id, p])).values());
    return uniqueRelated.slice(0, limit);
  }
}
