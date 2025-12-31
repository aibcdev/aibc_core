import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, Search, ArrowRight, ChevronRight } from 'lucide-react';
import { NavProps } from '../types';
import { BlogPost, BlogListResponse } from '../types/seo';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';
import SEOMeta from './shared/SEOMeta';
import BlogImage from './shared/BlogImage';
import { getDebugEndpoint } from '../services/apiClient';

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
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);

  // Use production API URL if on production domain
  // Try multiple endpoints for better reliability
  const getApiUrls = (): string[] => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('aibcmedia.com') || hostname.includes('netlify')) {
        // Production backend URLs (try multiple)
        return [
          'https://api.aibcmedia.com',
          'https://aibcmedia.com/api', // Fallback
        ];
      }
    }
    // Local development URLs
    return [
      import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001',
      'http://localhost:3001', // Fallback
    ];
  };
  
  const API_URLS = getApiUrls();
  const API_URL = API_URLS[0]; // Primary URL

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchTags();
  }, [page, selectedCategory, selectedTag, searchQuery]);

  // Retry fetch with exponential backoff
  const fetchWithRetry = async (url: string, retries = 3, delay = 1000): Promise<Response | null> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        
        if (response.ok) {
          return response;
        }
        
        // If not the last attempt, wait before retrying
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
      } catch (error: any) {
        console.warn(`[BlogView] Fetch attempt ${attempt + 1} failed:`, error.message);
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
      }
    }
    return null;
  };

  const fetchPosts = async () => {
    setLoading(true);
    let lastError: Error | null = null;
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        status: 'published',
      });
      
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedTag) params.append('tag', selectedTag);
      if (searchQuery) params.append('search', searchQuery);

      // Try each API URL until one works
      let response: Response | null = null;
      let workingUrl = '';
      
      for (const apiUrl of API_URLS) {
        const requestUrl = `${apiUrl}/api/blog?${params}`;
        
        console.log(`[BlogView] Trying API URL: ${apiUrl}`);
        
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogView.tsx:fetchPosts',message:'Fetching blog posts',data:{apiUrl,requestUrl,hostname:typeof window !== 'undefined' ? window.location.hostname : 'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'prod-debug',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        response = await fetchWithRetry(requestUrl);
        
        if (response && response.ok) {
          workingUrl = apiUrl;
          console.log(`[BlogView] Successfully connected to: ${apiUrl}`);
          break;
        }
      }
      
      if (!response || !response.ok) {
        const errorText = response ? await response.text().catch(() => 'Could not read error') : 'All API endpoints failed';
        console.error('[BlogView] All API endpoints failed. Last error:', errorText);
        
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogView.tsx:fetchPosts',message:'All API endpoints failed',data:{triedUrls:API_URLS,lastError:errorText},timestamp:Date.now(),sessionId:'debug-session',runId:'prod-debug',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        // Distinguish between API error and no posts
        // If we got a response but it's empty, it might be no posts (not an error)
        if (response && response.status === 200) {
          // Got 200 but might be empty - treat as no posts
          setFeaturedPost(null);
          setPosts([]);
          setTotalPages(0);
        } else {
          // Actual error - log but still show empty state
          lastError = new Error(`API error: ${response?.status || 'No response'} - ${errorText}`);
          setFeaturedPost(null);
          setPosts([]);
          setTotalPages(0);
        }
        setLoading(false);
        return;
      }
      
      const data: BlogListResponse = await response.json();
      
      console.log(`[BlogView] Received ${data.posts?.length || 0} posts from ${workingUrl}`);
      
      // #region agent log
      const postsWithImages = data.posts?.filter(p => p.featured_image_url).length || 0;
      const samplePost = data.posts?.[0];
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogView.tsx:fetchPosts',message:'Blog data received',data:{postsCount:data.posts?.length || 0,total:data.total || 0,hasPosts:!!(data.posts && data.posts.length > 0),postsWithImages,hasSamplePost:!!samplePost,samplePostFeaturedImage:samplePost?.featured_image_url,apiUrl:workingUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'prod-debug',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      
      // Set featured post (first post) and regular posts
      if (data.posts && data.posts.length > 0) {
        setFeaturedPost(data.posts[0]);
        setPosts(data.posts.slice(1));
        
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogView.tsx:fetchPosts',message:'Posts set successfully',data:{featuredPost:!!data.posts[0],regularPosts:data.posts.length - 1},timestamp:Date.now(),sessionId:'debug-session',runId:'prod-debug',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      } else {
        // No posts found - this is valid, not an error
        console.log('[BlogView] No posts found - showing coming soon message');
        setFeaturedPost(null);
        setPosts([]);
        
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogView.tsx:fetchPosts',message:'No posts found - showing coming soon',data:{postsArray:data.posts,postsLength:data.posts?.length,total:data.total},timestamp:Date.now(),sessionId:'debug-session',runId:'prod-debug',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      }
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('[BlogView] Error fetching blog posts:', error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogView.tsx:fetchPosts',message:'Exception caught',data:{error:lastError.message,stack:lastError.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'prod-debug',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      setFeaturedPost(null);
      setPosts([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
      if (lastError) {
        console.error('[BlogView] Final error state:', lastError.message);
      }
    }
  };

  const fetchCategories = async () => {
    for (const apiUrl of API_URLS) {
      try {
        const response = await fetch(`${apiUrl}/api/blog/categories`, {
          signal: AbortSignal.timeout(5000),
        });
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
          return; // Success, exit
        }
      } catch (error) {
        console.warn(`[BlogView] Failed to fetch categories from ${apiUrl}:`, error);
        // Try next URL
      }
    }
    console.error('[BlogView] All API endpoints failed for categories');
  };

  const fetchTags = async () => {
    for (const apiUrl of API_URLS) {
      try {
        const response = await fetch(`${apiUrl}/api/blog/tags`, {
          signal: AbortSignal.timeout(5000),
        });
        if (response.ok) {
          const data = await response.json();
          setTags(data.tags || []);
          return; // Success, exit
        }
      } catch (error) {
        console.warn(`[BlogView] Failed to fetch tags from ${apiUrl}:`, error);
        // Try next URL
      }
    }
    console.error('[BlogView] All API endpoints failed for tags');
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

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      'Product': 'text-orange-500',
      'Engineering': 'text-emerald-400',
      'Strategy': 'text-blue-400',
      'Design': 'text-purple-400',
      'Security': 'text-rose-400',
      'Content Marketing': 'text-orange-500',
      'Video Marketing': 'text-blue-400',
    };
    return colors[category || ''] || 'text-neutral-400';
  };

  const baseURL = typeof window !== 'undefined' ? window.location.origin : 'https://aibcmedia.com';
  const pageTitle = selectedCategory 
    ? `${selectedCategory} Articles | AIBC Blog`
    : selectedTag
    ? `${selectedTag} Posts | AIBC Blog`
    : 'AIBC Blog | Content Marketing & Strategy Articles';
  const pageDescription = selectedCategory
    ? `Explore ${selectedCategory} articles and insights on AIBC Blog. Expert content marketing strategies, tips, and guides.`
    : selectedTag
    ? `Browse ${selectedTag} posts on AIBC Blog. Latest content marketing insights and strategies.`
    : 'Discover expert content marketing strategies, video marketing ideas, and brand storytelling insights on AIBC Blog. Read our latest articles and guides.';

  return (
    <div className="min-h-screen bg-black text-white">
      <SEOMeta
        title={pageTitle}
        description={pageDescription}
        image={`${baseURL}/favicon.svg`}
        url={`${baseURL}/blog${selectedCategory ? `?category=${selectedCategory}` : selectedTag ? `?tag=${selectedTag}` : ''}`}
        type="website"
        structuredData={[
          {
            type: 'CollectionPage',
            data: {
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: pageTitle,
              description: pageDescription,
              url: `${baseURL}/blog`,
            },
          },
        ]}
      />
      <Navigation onNavigate={onNavigate} />

      <main className="relative pt-24 pb-24 px-6">
        {/* Hero Section - Simplified */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
              AIBC Blog
            </h1>
            <p className="text-lg text-neutral-400 leading-relaxed">
              Expert content marketing strategies, video marketing ideas, and brand storytelling insights.
            </p>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <button
                onClick={() => {
                  setSelectedCategory(undefined);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  !selectedCategory
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
              >
                All Posts
              </button>
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-72 bg-white/5 border border-white/10 rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Featured Article - Simplified Card Layout */}
        {featuredPost && (
          <div className="max-w-7xl mx-auto mb-16">
            <a
              href={`/blog/${featuredPost.slug}`}
              className="group block rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 transition-all"
            >
              <BlogImage post={featuredPost} aspectRatio="16:9" className="mb-6" />
              <div className="px-6 pb-6">
                {featuredPost.category && (
                  <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-500 text-xs font-semibold rounded-md mb-3">
                    {featuredPost.category}
                  </span>
                )}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-orange-500 transition-colors">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                  <p className="text-base text-neutral-400 mb-4 leading-relaxed line-clamp-2">
                      {featuredPost.excerpt}
                    </p>
                  )}
                <div className="flex items-center gap-3 text-sm text-neutral-500">
                  {featuredPost.published_at && <span>{formatDate(featuredPost.published_at)}</span>}
                  {featuredPost.published_at && featuredPost.reading_time && <span>•</span>}
                  {featuredPost.reading_time && <span>{featuredPost.reading_time} min read</span>}
                </div>
              </div>
            </a>
          </div>
        )}

        {/* Article Grid */}
        {loading ? (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col animate-pulse">
                <div className="aspect-video bg-neutral-800 rounded-xl mb-6"></div>
                <div className="h-4 bg-neutral-800 rounded mb-3"></div>
                <div className="h-6 bg-neutral-800 rounded mb-3"></div>
                <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 && !featuredPost ? (
          <div className="max-w-7xl mx-auto text-center py-20">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center">
                  <Search className="w-8 h-8 text-neutral-600" />
                </div>
              </div>
              <h2 className="text-3xl font-semibold text-white mb-4">Content coming soon</h2>
              <p className="text-lg text-neutral-400 mb-8 leading-relaxed">
                We're generating SEO-optimized content about content marketing, video marketing, and brand storytelling. 
                New articles will appear here automatically as they're published.
              </p>
              <p className="text-sm text-neutral-500">
                Check back soon for expert strategies, tips, and insights.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article key={post.id} className="flex flex-col group">
                  <a
                    href={`/blog/${post.slug}`}
                    className="block rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 transition-all"
                  >
                    <BlogImage post={post} aspectRatio="16:9" className="mb-4" />
                    <div className="px-4 pb-4">
                    {post.category && (
                        <span className="inline-block px-2 py-1 bg-orange-500/20 text-orange-500 text-xs font-semibold rounded-md mb-3">
                          {post.category}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-orange-500 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                        <p className="text-sm text-neutral-400 leading-relaxed mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        {post.published_at && <span>{formatDate(post.published_at)}</span>}
                        {post.published_at && post.reading_time && <span>•</span>}
                        {post.reading_time && <span>{post.reading_time} min read</span>}
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </div>

            {/* Pagination / Load More */}
            {totalPages > 1 && (
              <div className="max-w-7xl mx-auto mt-20 flex justify-center">
                {page < totalPages ? (
                  <button
                    onClick={() => setPage(page + 1)}
                    className="px-8 py-3 rounded-lg border border-white/10 text-white font-medium hover:bg-white/5 transition-all text-sm"
                  >
                    Load older articles
                  </button>
                ) : (
                  <p className="text-neutral-500 text-sm">No more articles to load</p>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Newsletter Section */}
      <section className="border-t border-white/10 bg-neutral-950 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-6">
            Feed your inbox.
          </h2>
          <p className="text-lg text-neutral-400 mb-10 max-w-lg mx-auto">
            Join 15,000+ creators and engineers. We only send emails when we have something valuable to say.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="email@domain.com"
              className="flex-1 bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="bg-white text-black font-semibold rounded-lg px-6 py-3 hover:bg-neutral-200 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default BlogView;
