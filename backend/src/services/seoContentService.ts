/**
 * SEO Content Service - Manages blog posts and content
 */

import { BlogPost, BlogListParams, BlogListResponse } from '../../../types/seo';

// In-memory storage (will migrate to database)
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
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Create a new blog post
 */
export async function createBlogPost(data: Partial<BlogPost>): Promise<BlogPost> {
  const id = data.id || `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const slug = data.slug || generateSlug(data.title || 'untitled');
  const now = new Date().toISOString();
  const wordCount = data.content ? calculateWordCount(data.content) : 0;

  // Ensure unique slug
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

/**
 * Get blog post by ID
 */
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  return blogPostsStore.get(id) || null;
}

/**
 * Get blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const id = blogPostsBySlug.get(slug);
  if (!id) return null;
  return blogPostsStore.get(id) || null;
}

/**
 * Update blog post
 */
export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
  const existing = blogPostsStore.get(id);
  if (!existing) return null;

  // Handle slug changes
  if (updates.slug && updates.slug !== existing.slug) {
    blogPostsBySlug.delete(existing.slug);
    blogPostsBySlug.set(updates.slug, id);
  }

  // Recalculate word count if content changed
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

/**
 * Delete blog post
 */
export async function deleteBlogPost(id: string): Promise<boolean> {
  const post = blogPostsStore.get(id);
  if (!post) return false;

  blogPostsStore.delete(id);
  blogPostsBySlug.delete(post.slug);
  return true;
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

  let posts = Array.from(blogPostsStore.values());

  // Apply filters
  if (category) {
    posts = posts.filter(p => p.category === category);
  }

  if (tag) {
    posts = posts.filter(p => p.tags?.includes(tag));
  }

  if (status) {
    posts = posts.filter(p => p.status === status);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(searchLower) ||
      p.content.toLowerCase().includes(searchLower) ||
      p.excerpt?.toLowerCase().includes(searchLower)
    );
  }

  // Sort by published_at (newest first), then by created_at
  posts.sort((a, b) => {
    const dateA = a.published_at || a.created_at;
    const dateB = b.published_at || b.created_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  // Paginate
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

/**
 * Increment view count
 */
export async function incrementViewCount(slug: string): Promise<void> {
  const post = await getBlogPostBySlug(slug);
  if (post) {
    post.views++;
    blogPostsStore.set(post.id, post);
  }
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<string[]> {
  const categories = new Set<string>();
  for (const post of blogPostsStore.values()) {
    if (post.category) {
      categories.add(post.category);
    }
  }
  return Array.from(categories).sort();
}

/**
 * Get all tags
 */
export async function getTags(): Promise<string[]> {
  const tags = new Set<string>();
  for (const post of blogPostsStore.values()) {
    if (post.tags) {
      post.tags.forEach(tag => tags.add(tag));
    }
  }
  return Array.from(tags).sort();
}

/**
 * Get related posts (by category or tags)
 */
export async function getRelatedPosts(postId: string, limit: number = 3): Promise<BlogPost[]> {
  const post = await getBlogPostById(postId);
  if (!post) return [];

  let related: BlogPost[] = [];

  // Find posts with same category
  if (post.category) {
    const categoryPosts = Array.from(blogPostsStore.values())
      .filter(p => p.id !== postId && p.category === post.category && p.status === 'published');
    related.push(...categoryPosts);
  }

  // Find posts with matching tags
  if (post.tags && post.tags.length > 0) {
    const tagPosts = Array.from(blogPostsStore.values())
      .filter(p => {
        if (p.id === postId || p.status !== 'published') return false;
        return p.tags?.some(tag => post.tags!.includes(tag));
      });
    related.push(...tagPosts);
  }

  // Remove duplicates and limit
  const uniqueRelated = Array.from(new Map(related.map(p => [p.id, p])).values());
  return uniqueRelated.slice(0, limit);
}

