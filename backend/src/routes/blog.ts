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

const router = express.Router();

/**
 * GET /api/blog - List blog posts
 */
router.get('/', async (req, res) => {
  try {
    const params = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      category: req.query.category as string,
      tag: req.query.tag as string,
      status: req.query.status as 'draft' | 'published' | 'scheduled',
      search: req.query.search as string,
    };

    const result = await listBlogPosts(params);
    res.json(result);
  } catch (error: any) {
    console.error('Error listing blog posts:', error);
    res.status(500).json({ error: error.message || 'Failed to list blog posts' });
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
 * GET /api/blog/:slug - Get blog post by slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

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

export default router;

