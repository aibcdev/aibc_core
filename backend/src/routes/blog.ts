/**
 * Blog API Routes
 */

import express from 'express';
import {
  createBlogPost,
  getBlogPostById,
  getBlogPostBySlug,
  updateBlogPost,
  deleteBlogPost,
  listBlogPosts,
  incrementViewCount,
  getCategories,
  getTags,
  getRelatedPosts,
} from '../services/seoContentService';
import { generateAllStructuredData } from '../services/structuredDataService';

const router = express.Router();

/**
 * GET /api/blog - List blog posts
 */
router.get('/', async (req, res) => {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blog.ts:GET /api/blog',message:'LIST BLOG POSTS REQUEST',data:{query:req.query,hostname:req.hostname},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-debug',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    const params = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      category: req.query.category as string,
      tag: req.query.tag as string,
      status: req.query.status as 'draft' | 'published' | 'scheduled',
      search: req.query.search as string,
    };

    const result = await listBlogPosts(params);
    
    // #region agent log
    const postsWithImages = result.posts?.filter(p => p.featured_image_url).length || 0;
    const postsWithoutImages = result.posts?.filter(p => !p.featured_image_url).length || 0;
    const samplePost = result.posts?.[0];
    const hasTOC = samplePost?.content?.match(/Table of Contents|table of contents/i);
    const hasBrokenHTML = samplePost?.content?.match(/<[^>]*[<>{}[\]\\|`~!@#$%^&*+=?;:'"][^>]*>/);
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blog.ts:GET /api/blog',message:'BLOG POSTS LISTED',data:{totalPosts:result.posts?.length || 0,postsWithImages,postsWithoutImages,hasSamplePost:!!samplePost,samplePostId:samplePost?.id,samplePostFeaturedImage:samplePost?.featured_image_url,hasTOC:!!hasTOC,hasBrokenHTML:!!hasBrokenHTML},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-debug',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    // Ensure we always return the correct structure
    // Return 200 even if no posts found (not an error condition)
    const response = {
      posts: result.posts || [],
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || 10,
      totalPages: result.totalPages || 0,
    };
    
    // Log if no posts found (for debugging)
    if (response.posts.length === 0) {
      console.log(`[Blog API] No posts found for query:`, params);
    } else {
      console.log(`[Blog API] Returning ${response.posts.length} posts (total: ${response.total})`);
    }
    
    res.status(200).json(response);
  } catch (error: any) {
    console.error('[Blog API] Error listing blog posts:', error);
    // Return 200 with empty structure instead of 500 error
    // This prevents frontend from treating it as a fatal error
    const response = {
      posts: [],
      total: 0,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      totalPages: 0,
    };
    res.status(200).json(response);
  }
});

/**
 * GET /api/blog/categories - Get all categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    res.json({ categories });
  } catch (error: any) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: error.message || 'Failed to get categories' });
  }
});

/**
 * GET /api/blog/tags - Get all tags
 */
router.get('/tags', async (req, res) => {
  try {
    const tags = await getTags();
    res.json({ tags });
  } catch (error: any) {
    console.error('Error getting tags:', error);
    res.status(500).json({ error: error.message || 'Failed to get tags' });
  }
});

/**
 * GET /api/blog/category/:category - Get posts by category
 * Must come before /:slug to avoid route conflicts
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const decodedCategory = decodeURIComponent(category.replace(/-/g, ' '));
    
    const params = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
      category: decodedCategory,
      status: 'published' as const,
    };

    const result = await listBlogPosts(params);
    res.json({
      posts: result.posts || [],
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || 12,
      totalPages: result.totalPages || 0,
      category: decodedCategory,
    });
  } catch (error: any) {
    console.error('Error getting category posts:', error);
    res.status(500).json({ error: error.message || 'Failed to get category posts' });
  }
});

/**
 * GET /api/blog/tag/:tag - Get posts by tag
 * Must come before /:slug to avoid route conflicts
 */
router.get('/tag/:tag', async (req, res) => {
  try {
    const { tag } = req.params;
    const decodedTag = decodeURIComponent(tag.replace(/-/g, ' '));
    
    const params = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
      tag: decodedTag,
      status: 'published' as const,
    };

    const result = await listBlogPosts(params);
    res.json({
      posts: result.posts || [],
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || 12,
      totalPages: result.totalPages || 0,
      tag: decodedTag,
    });
  } catch (error: any) {
    console.error('Error getting tag posts:', error);
    res.status(500).json({ error: error.message || 'Failed to get tag posts' });
  }
});

/**
 * GET /api/blog/keyword/:keyword - Get posts by keyword
 * Must come before /:slug to avoid route conflicts
 */
router.get('/keyword/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const decodedKeyword = decodeURIComponent(keyword.replace(/-/g, ' '));
    
    const { getPostsByKeyword } = await import('../services/keywordPageService');
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
    
    const keywordData = await getPostsByKeyword(decodedKeyword, limit);
    
    res.json({
      keyword: decodedKeyword,
      description: keywordData.description,
      posts: keywordData.posts,
      total: keywordData.totalPosts,
      relatedKeywords: keywordData.relatedKeywords,
    });
  } catch (error: any) {
    console.error('Error getting keyword posts:', error);
    res.status(500).json({ error: error.message || 'Failed to get keyword posts' });
  }
});

/**
 * GET /api/blog/:slug - Get blog post by slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blog.ts:GET /api/blog/:slug',message:'GET BLOG POST BY SLUG',data:{slug,hostname:req.hostname},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-debug',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blog.ts:GET /api/blog/:slug',message:'POST NOT FOUND',data:{slug},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-debug',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // #region agent log
    const hasTOC = post.content?.match(/Table of Contents|table of contents/i);
    const hasBrokenHTML = post.content?.match(/<[^>]*[<>{}[\]\\|`~!@#$%^&*+=?;:'"][^>]*>/);
    const has2024 = post.content?.match(/\b2024\b/);
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blog.ts:GET /api/blog/:slug',message:'POST RETRIEVED',data:{postId:post.id,slug:post.slug,hasFeaturedImageUrl:!!post.featured_image_url,featuredImageUrl:post.featured_image_url,hasTOC:!!hasTOC,hasBrokenHTML:!!hasBrokenHTML,has2024:!!has2024,contentLength:post.content?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-debug',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

    // Increment view count (async, don't wait)
    incrementViewCount(slug).catch(err => console.error('Error incrementing view count:', err));

    res.json(post);
  } catch (error: any) {
    console.error('Error getting blog post:', error);
    res.status(500).json({ error: error.message || 'Failed to get blog post' });
  }
});

/**
 * GET /api/blog/:slug/related - Get related posts
 */
router.get('/:slug/related', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
    const related = await getRelatedPosts(post.id, limit);
    res.json({ related });
  } catch (error: any) {
    console.error('Error getting related posts:', error);
    res.status(500).json({ error: error.message || 'Failed to get related posts' });
  }
});

/**
 * GET /api/blog/:slug/structured-data - Get structured data for a blog post
 */
router.get('/:slug/structured-data', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const structuredData = generateAllStructuredData(post);
    res.json({ structuredData });
  } catch (error: any) {
    console.error('Error generating structured data:', error);
    res.status(500).json({ error: error.message || 'Failed to generate structured data' });
  }
});

/**
 * GET /api/blog/:slug/internal-links - Get internal link suggestions for a blog post
 */
router.get('/:slug/internal-links', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const { generateInternalLinks, injectInternalLinks } = await import('../services/internalLinkingService');
    
    // Generate internal links
    const links = await generateInternalLinks(post);
    
    // Optionally inject links into content
    const inject = req.query.inject === 'true';
    let contentWithLinks = post.content;
    if (inject && links.length > 0) {
      contentWithLinks = injectInternalLinks(post.content || '', links);
    }

    res.json({
      links,
      contentWithLinks: inject ? contentWithLinks : undefined,
    });
  } catch (error: any) {
    console.error('Error generating internal links:', error);
    res.status(500).json({ error: error.message || 'Failed to generate internal links' });
  }
});

/**
 * POST /api/blog - Create new blog post
 */
router.post('/', async (req, res) => {
  try {
    const post = await createBlogPost(req.body);
    res.status(201).json(post);
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: error.message || 'Failed to create blog post' });
  }
});

/**
 * PUT /api/blog/:id - Update blog post
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateBlogPost(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: error.message || 'Failed to update blog post' });
  }
});

/**
 * DELETE /api/blog/:id - Delete blog post
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteBlogPost(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: error.message || 'Failed to delete blog post' });
  }
});

/**
 * POST /api/blog/fix-existing - Fix existing blog posts (add images, fix formatting)
 * Refactored to use blogPostFixService
 */
router.post('/fix-existing', async (req, res) => {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blog.ts:POST /api/blog/fix-existing',message:'FIX EXISTING POSTS REQUEST',data:{hostname:req.hostname},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-fix',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    
    const { fixBlogPosts } = await import('../services/blogPostFixService');
    
    // Get all published posts
    const allPosts = await listBlogPosts({ status: 'published', limit: 1000 });
    
    if (!allPosts.posts || allPosts.posts.length === 0) {
      return res.json({
        success: true,
        total: 0,
        fixed: 0,
        errors: 0,
      });
    }
    
    // Fix all posts using the centralized service
    const result = await fixBlogPosts(allPosts.posts);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blog.ts:POST /api/blog/fix-existing',message:'FIX EXISTING POSTS COMPLETE',data:{totalPosts:allPosts.posts.length,fixed:result.fixed,errors:result.errors},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-fix',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    
    res.json({
      success: true,
      total: allPosts.posts.length,
      fixed: result.fixed,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error('Error fixing existing posts:', error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'blog.ts:POST /api/blog/fix-existing',message:'FIX EXISTING POSTS ERROR',data:{error:error instanceof Error ? error.message : String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-fix',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    res.status(500).json({ error: error.message || 'Failed to fix existing posts' });
  }
});

/**
 * POST /api/blog/fix-post/:id - Fix a single blog post
 */
router.post('/fix-post/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { getBlogPostById } = await import('../services/seoContentService');
    const { fixBlogPost } = await import('../services/blogPostFixService');
    
    const post = await getBlogPostById(id);
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    const fixedPost = await fixBlogPost(post);
    
    res.json({
      success: true,
      post: fixedPost,
    });
  } catch (error: any) {
    console.error('Error fixing post:', error);
    res.status(500).json({ error: error.message || 'Failed to fix post' });
  }
});

export default router;

