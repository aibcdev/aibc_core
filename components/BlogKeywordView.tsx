import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Search, ArrowLeft, ArrowRight } from 'lucide-react';
import { NavProps, ViewState } from '../types';
import { BlogPost } from '../types/seo';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';
import SEOMeta from './shared/SEOMeta';

interface BlogKeywordViewProps extends NavProps {
  keyword: string;
}

interface KeywordPageResponse {
  keyword: string;
  description: string;
  posts: BlogPost[];
  total: number;
  relatedKeywords: string[];
}

const BlogKeywordView: React.FC<BlogKeywordViewProps> = ({ onNavigate, keyword }) => {
  const [data, setData] = useState<KeywordPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('aibcmedia.com') || hostname.includes('netlify')) {
        return 'https://api.aibcmedia.com';
      }
    }
    // NOTE: Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) resolution issues in browsers.
    return import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
  };
  
  const API_URL = getApiUrl();
  const decodedKeyword = decodeURIComponent(keyword);

  useEffect(() => {
    fetchKeywordData();
  }, [keyword]);

  const fetchKeywordData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/blog/keyword/${keyword}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch keyword data');
      }
      
      const keywordData: KeywordPageResponse = await response.json();
      setData(keywordData);
    } catch (error) {
      console.error('Error fetching keyword data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const baseURL = typeof window !== 'undefined' ? window.location.origin : 'https://aibcmedia.com';
  const keywordUrl = `${baseURL}/blog/keyword/${keyword}`;
  
  // Generate structured data for keyword page
  const structuredData = data ? [
    {
      type: 'CollectionPage',
      data: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${decodedKeyword} Articles`,
        description: data.description,
        url: keywordUrl,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: data.posts.length,
          itemListElement: data.posts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: post.title,
            url: `${baseURL}/blog/${post.slug}`,
          })),
        },
      },
    },
    {
      type: 'BreadcrumbList',
      data: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseURL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: `${baseURL}/blog`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: decodedKeyword,
            item: keywordUrl,
          },
        ],
      },
    },
  ] : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navigation onNavigate={onNavigate} />
        <main className="pt-16">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="animate-pulse">
              <div className="h-12 bg-white/5 rounded mb-4"></div>
              <div className="h-6 bg-white/5 rounded w-3/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-white/5 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navigation onNavigate={onNavigate} />
        <main className="pt-16">
          <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <p className="text-white/60 text-lg mb-4">No articles found for this keyword</p>
            <button
              onClick={() => window.location.href = '/blog'}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Browse All Articles
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SEOMeta
        title={`${decodedKeyword} Articles | AIBC Blog`}
        description={data.description}
        url={keywordUrl}
        type="website"
        structuredData={structuredData}
        keywords={[decodedKeyword, ...data.relatedKeywords.slice(0, 5)]}
      />
      <Navigation onNavigate={onNavigate} />

      <main className="pt-16">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <button
            onClick={() => window.location.href = '/blog'}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Blog</span>
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-orange-500" />
              <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-500 text-sm font-bold rounded-full">
                {decodedKeyword}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              {decodedKeyword} Articles
            </h1>
            <p className="text-xl text-white/60 mb-4">
              {data.description}
            </p>
            <p className="text-sm text-white/40">
              {data.total} {data.total === 1 ? 'article' : 'articles'} found
            </p>
          </div>

          {/* Related Keywords */}
          {data.relatedKeywords.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-white/40 mb-3 uppercase tracking-wider">
                Related Keywords
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.relatedKeywords.map(relatedKeyword => (
                  <a
                    key={relatedKeyword}
                    href={`/blog/keyword/${encodeURIComponent(relatedKeyword.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Search className="w-3 h-3" />
                    {relatedKeyword}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {data.posts.length === 0 ? (
          <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <p className="text-white/60 text-lg mb-4">No articles found for this keyword</p>
            <button
              onClick={() => window.location.href = '/blog'}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Browse All Articles
            </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-6 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.posts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => window.location.href = `/blog/${post.slug}`}
                  className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-orange-500/50 transition-all cursor-pointer group"
                >
                  {(post.featured_image_url || (post.target_keywords?.[0] ? (() => {
                    const keyword = post.target_keywords[0].substring(0, 50);
                    return `https://placehold.co/1200x630/1a1a1a/f97316?text=${encodeURIComponent(keyword)}`;
                  })() : null)) ? (
                    <div className="w-full h-48 bg-white/5 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={post.featured_image_url || (post.target_keywords?.[0] ? (() => {
                          const keyword = post.target_keywords[0].substring(0, 50);
                          return `https://placehold.co/1200x630/1a1a1a/f97316?text=${encodeURIComponent(keyword)}`;
                        })() : '')}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : null}
                  
                  {post.category && (
                    <span className="inline-block px-2 py-1 bg-orange-500/20 text-orange-500 text-xs font-bold rounded mb-3">
                      {post.category}
                    </span>
                  )}

                  <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-orange-400 transition-colors">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-white/60 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-white/40">
                    {post.published_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                    )}
                    {post.reading_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.reading_time} min</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-orange-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default BlogKeywordView;



