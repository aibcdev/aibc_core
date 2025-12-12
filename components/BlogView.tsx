import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, Search, Filter, ArrowRight } from 'lucide-react';
import { NavProps } from '../types';
import { BlogPost, BlogListResponse } from '../types/seo';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';

interface BlogViewProps extends NavProps {
  category?: string;
  tag?: string;
}

const BlogView: React.FC<BlogViewProps> = ({ onNavigate, category, tag }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(category);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(tag);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchTags();
  }, [page, selectedCategory, selectedTag, searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        status: 'published',
      });
      
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedTag) params.append('tag', selectedTag);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${API_URL}/api/blog?${params}`);
      const data: BlogListResponse = await response.json();
      
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/blog/categories`);
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_URL}/api/blog/tags`);
      const data = await response.json();
      setTags(data.tags || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handlePostClick = (slug: string) => {
    window.location.href = `/blog/${slug}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navigation onNavigate={onNavigate} />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 px-6 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Content & Marketing Insights
            </h1>
            <p className="text-xl text-white/60 max-w-2xl">
              Expert strategies, tips, and ideas for content marketing, video marketing, and brand storytelling.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 px-6 border-b border-white/10 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-white/40" />
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value || undefined);
                    setPage(1);
                  }}
                  className="px-4 py-2 bg-[#050505] border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tag Filters */}
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(selectedTag === tag ? undefined : tag);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedTag === tag
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-[#050505] border-white/10 text-white/60 hover:border-white/30'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[#0A0A0A] rounded-xl border border-white/10 p-6 animate-pulse">
                    <div className="h-48 bg-white/5 rounded-lg mb-4"></div>
                    <div className="h-4 bg-white/5 rounded mb-2"></div>
                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-white/60 text-lg">No posts found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => handlePostClick(post.slug)}
                      className="bg-[#0A0A0A] rounded-xl border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer group"
                    >
                      {post.featured_image_url && (
                        <div className="aspect-video bg-gradient-to-br from-orange-900/20 to-blue-900/20 overflow-hidden">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        {post.category && (
                          <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-500 text-xs font-bold rounded-full mb-3">
                            {post.category}
                          </span>
                        )}
                        <h2 className="text-xl font-bold mb-3 group-hover:text-orange-500 transition-colors">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-white/60 text-sm mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-white/40">
                          {post.published_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(post.published_at)}</span>
                            </div>
                          )}
                          {post.reading_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{post.reading_time} min read</span>
                            </div>
                          )}
                        </div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 text-white/60 text-xs rounded"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-500 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-white/60">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-500 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogView;

