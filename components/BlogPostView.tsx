import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, ArrowLeft, Share2, ArrowRight } from 'lucide-react';
import { NavProps, ViewState } from '../types';
import { BlogPost } from '../types/seo';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';
import SEOMeta from './shared/SEOMeta';

interface BlogPostViewProps extends NavProps {
  slug: string;
}

const BlogPostView: React.FC<BlogPostViewProps> = ({ onNavigate, slug }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post) {
      fetchRelatedPosts();
    }
  }, [post]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/blog/${slug}`);
      if (!response.ok) {
        throw new Error('Post not found');
      }
      const data: BlogPost = await response.json();
      setPost(data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    if (!post) return;
    try {
      const response = await fetch(`${API_URL}/api/blog/${slug}/related?limit=3`);
      const data = await response.json();
      setRelatedPosts(data.related || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt || post.title,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navigation onNavigate={onNavigate} />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="animate-pulse">
              <div className="h-12 bg-white/5 rounded mb-4"></div>
              <div className="h-6 bg-white/5 rounded w-3/4 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-white/5 rounded"></div>
                <div className="h-4 bg-white/5 rounded"></div>
                <div className="h-4 bg-white/5 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navigation onNavigate={onNavigate} />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
            <p className="text-white/60 mb-8">The blog post you're looking for doesn't exist.</p>
            <button
              onClick={() => window.location.href = '/blog'}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Blog
            </button>
          </div>
        </main>
      </div>
    );
  }

  const baseURL = typeof window !== 'undefined' ? window.location.origin : 'https://aibcmedia.com';
  const structuredData = post ? [
    {
      type: 'BlogPosting',
      data: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.meta_description || post.excerpt || post.title,
        image: post.featured_image_url || `${baseURL}/favicon.svg`,
        datePublished: post.published_at || post.created_at,
        dateModified: post.updated_at || post.published_at || post.created_at,
        author: {
          '@type': 'Person',
          name: post.author || 'AIBC',
        },
        url: `${baseURL}/blog/${post.slug}`,
      },
    },
  ] : undefined;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {post && (
        <SEOMeta
          title={`${post.title} | AIBC Blog`}
          description={post.meta_description || post.excerpt || post.title}
          image={post.featured_image_url}
          url={`${baseURL}/blog/${post.slug}`}
          type="article"
          structuredData={structuredData}
        />
      )}
      <Navigation onNavigate={onNavigate} />

      <main className="pt-16">
        {/* Back Button */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => window.location.href = '/blog'}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Blog</span>
          </button>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-6 pb-12">
          {post.category && (
            <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-500 text-sm font-bold rounded-full mb-4">
              {post.category}
            </span>
          )}

          <h1 className="text-4xl md:text-5xl font-black mb-6">{post.title}</h1>

          {post.meta_description && (
            <p className="text-xl text-white/70 mb-8">{post.meta_description}</p>
          )}

          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-white/60">
            {post.published_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>
            )}
            {post.reading_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.reading_time} min read</span>
              </div>
            )}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {post.featured_image_url && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Article Content */}
          <div
            className="prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-p:text-white/80 prose-p:leading-relaxed
              prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-strong:font-bold
              prose-code:text-orange-500 prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-[#0A0A0A] prose-pre:border prose-pre:border-white/10
              prose-ul:text-white/80 prose-ol:text-white/80
              prose-li:text-white/80
              prose-img:rounded-lg prose-img:border prose-img:border-white/10"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Sign Up CTA */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-2xl p-8 md:p-12">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to transform your content strategy?
                </h2>
                <p className="text-lg text-white/70 mb-8 leading-relaxed">
                  Join AIBC and get AI-powered content generation, video ideas, and brand storytelling tools that help you create consistent, on-brand content effortlessly.
                </p>
                <button
                  onClick={() => onNavigate(ViewState.SIGNIN)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors text-lg group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-sm text-white/50 mt-4">
                  No credit card required • Start in seconds
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="w-5 h-5 text-white/60" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/5 text-white/60 text-sm rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 py-12 border-t border-white/10">
            <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.id}
                  onClick={() => window.location.href = `/blog/${relatedPost.slug}`}
                  className="bg-[#0A0A0A] rounded-xl border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer group"
                >
                  {relatedPost.featured_image_url && (
                    <div className="aspect-video bg-gradient-to-br from-orange-900/20 to-blue-900/20 overflow-hidden">
                      <img
                        src={relatedPost.featured_image_url}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {relatedPost.category && (
                      <span className="inline-block px-2 py-1 bg-orange-500/20 text-orange-500 text-xs font-bold rounded-full mb-2">
                        {relatedPost.category}
                      </span>
                    )}
                    <h3 className="text-lg font-bold mb-2 group-hover:text-orange-500 transition-colors">
                      {relatedPost.title}
                    </h3>
                    {relatedPost.excerpt && (
                      <p className="text-white/60 text-sm line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default BlogPostView;

