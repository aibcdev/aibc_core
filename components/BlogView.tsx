import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, Search, ArrowRight, ChevronRight } from 'lucide-react';
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
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);

  // Use production API URL if on production domain
  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('aibcmedia.com') || hostname.includes('netlify')) {
        // Production backend URL
        return 'https://aibc-backend-409115133182.us-central1.run.app';
      }
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
  };
  
  const API_URL = getApiUrl();

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

      const requestUrl = `${API_URL}/api/blog?${params}`;
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogView.tsx:58',message:'Fetching blog posts',data:{apiUrl:API_URL,requestUrl:requestUrl,hostname:typeof window !== 'undefined' ? window.location.hostname : 'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'prod-debug',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogView.tsx:66',message:'API response received',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'prod-debug',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Could not read error');
        console.error('Blog API error:', response.status, response.statusText, errorText);
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogView.tsx:72',message:'API error response',data:{status:response.status,errorText:errorText},timestamp:Date.now(),sessionId:'debug-session',runId:'prod-debug',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        setFeaturedPost(null);
        setPosts([]);
        setTotalPages(0);
        setLoading(false);
        return;
      }
      
      const data: BlogListResponse = await response.json();
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogView.tsx:78',message:'Blog data received',data:{postsCount:data.posts?.length || 0,total:data.total || 0,hasPosts:!!(data.posts && data.posts.length > 0)},timestamp:Date.now(),sessionId:'debug-session',runId:'prod-debug',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      // Set featured post (first post) and regular posts
      if (data.posts && data.posts.length > 0) {
        setFeaturedPost(data.posts[0]);
        setPosts(data.posts.slice(1));
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogView.tsx:82',message:'Posts set successfully',data:{featuredPost:!!data.posts[0],regularPosts:data.posts.length - 1},timestamp:Date.now(),sessionId:'debug-session',runId:'prod-debug',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      } else {
        setFeaturedPost(null);
        setPosts([]);
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogView.tsx:85',message:'No posts found - showing coming soon',data:{postsArray:data.posts,postsLength:data.posts?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'prod-debug',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      }
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BlogView.tsx:88',message:'Exception caught',data:{error:error instanceof Error ? error.message : String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'prod-debug',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      setFeaturedPost(null);
      setPosts([]);
      setTotalPages(0);
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
      month: 'short',
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

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation onNavigate={onNavigate} />

      <main className="relative pt-32 pb-24 px-6">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto mb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-orange-400 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Latest Insights
            </div>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white mb-8 leading-[1.1]">
              Content engineering <br />
              <span className="text-neutral-500">for the digital age.</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl">
              Deep dives into content automation, embedded media strategies, and the future of digital footprints. Curated by the AIBC team.
            </p>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="max-w-7xl mx-auto mb-16 border-b border-white/10 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <button
                onClick={() => {
                  setSelectedCategory(undefined);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-white text-black'
                    : 'border border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                }`}
              >
                All Posts
              </button>
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-full border border-white/10 text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-white text-black border-white'
                      : 'text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-64 bg-transparent border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Featured Article */}
        {featuredPost && (
          <div className="max-w-7xl mx-auto mb-20">
            <a
              href={`/blog/${featuredPost.slug}`}
              className="group relative block rounded-3xl overflow-hidden border border-white/10 bg-neutral-900/40 hover:border-orange-500/30 transition-all duration-500"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="h-64 md:h-auto bg-neutral-800 relative overflow-hidden">
                  {featuredPost.featured_image_url ? (
                    <img
                      src={featuredPost.featured_image_url}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.15),transparent_50%)]"></div>
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                    </>
                  )}
                  <div className="absolute bottom-6 left-6">
                    <span className="inline-block px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-md text-xs text-white font-medium">Featured</span>
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-sm text-neutral-500 mb-4">
                    {featuredPost.author && <span className="text-white font-medium">{featuredPost.author}</span>}
                    {featuredPost.author && featuredPost.published_at && <span className="w-1 h-1 rounded-full bg-neutral-600"></span>}
                    {featuredPost.published_at && <span>{formatDate(featuredPost.published_at)}</span>}
                    {featuredPost.published_at && featuredPost.reading_time && <span className="w-1 h-1 rounded-full bg-neutral-600"></span>}
                    {featuredPost.reading_time && <span>{featuredPost.reading_time} min read</span>}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6 tracking-tight group-hover:text-orange-500 transition-colors duration-300">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="text-lg text-neutral-400 mb-8 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-white font-medium mt-auto group/btn">
                    Read article
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </div>
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
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="flex flex-col group">
                  <a
                    href={`/blog/${post.slug}`}
                    className="block overflow-hidden rounded-xl border border-white/10 bg-neutral-900/20 aspect-video mb-6 relative hover:border-white/20 transition-all"
                  >
                    {post.featured_image_url ? (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    )}
                  </a>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                    {post.author && <span className="text-white font-medium">{post.author}</span>}
                    {post.author && (post.category || post.published_at || post.reading_time) && (
                      <span className="w-1 h-1 rounded-full bg-neutral-700"></span>
                    )}
                    {post.category && (
                      <>
                        <span className={`font-medium ${getCategoryColor(post.category)}`}>
                          {post.category}
                        </span>
                        {(post.published_at || post.reading_time) && (
                          <span className="w-1 h-1 rounded-full bg-neutral-700"></span>
                        )}
                      </>
                    )}
                    {post.published_at && <span>{formatDate(post.published_at)}</span>}
                  </div>
                  <h3 className={`text-xl font-semibold text-white mb-3 tracking-tight transition-colors ${getCategoryColor(post.category).replace('text-', 'group-hover:text-')}`}>
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-base text-neutral-400 leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <a
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sm text-white mt-auto hover:text-neutral-300 transition-colors"
                  >
                    Read more <ChevronRight className="w-4 h-4 ml-1" />
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
