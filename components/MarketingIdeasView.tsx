import React, { useCallback, useEffect } from 'react';
import { ArrowRight, Sparkles, TrendingUp, Zap, FileText, BarChart3, CheckCircle, Star } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';
import SEOMeta from './shared/SEOMeta';
import { trackPageView, trackCTAClick, trackConversion } from './shared/seoTracking';

const MarketingIdeasView: React.FC<NavProps> = ({ onNavigate }) => {
  const baseURL = typeof window !== 'undefined' ? window.location.origin : 'https://aibcmedia.com';
  
  // SEO Tracking - Page View
  useEffect(() => {
    trackPageView('marketing-ideas', {
      source: new URLSearchParams(window.location.search).get('utm_source') || 'direct',
      medium: new URLSearchParams(window.location.search).get('utm_medium') || 'organic',
      campaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
    });
  }, []);
  
  const handleStartScan = useCallback(() => {
    trackCTAClick('marketing-ideas', 'start-scan', 'hero');
    trackConversion('marketing-ideas', 'cta_click', 1);
    
    const authToken = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (authToken && user) {
      onNavigate(ViewState.INGESTION);
    } else {
      onNavigate(ViewState.LOGIN);
    }
  }, [onNavigate]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SEOMeta
        title="Get Unlimited Marketing Ideas That Sound Like You | AIBC"
        description="AIBC generates unlimited marketing ideas that match your brand voice automatically. Stop struggling with content ideas - get authentic marketing content in your voice."
        image={`${baseURL}/favicon.svg`}
        url={`${baseURL}/marketing-ideas`}
        type="website"
        keywords={['marketing ideas', 'content ideas', 'brand voice', 'marketing automation', 'content generation', 'AI marketing']}
        structuredData={[{
          type: 'Organization',
          data: {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'AIBC Media',
            url: baseURL,
            logo: `${baseURL}/favicon.svg`,
          }
        }, {
          type: 'WebPage',
          data: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Get Unlimited Marketing Ideas That Sound Like You',
            description: 'AIBC generates unlimited marketing ideas that match your brand voice automatically.',
            url: `${baseURL}/marketing-ideas`,
          }
        }, {
          type: 'Product',
          data: {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'AIBC Marketing Ideas Generator',
            applicationCategory: 'MarketingSoftware',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            }
          }
        }]}
      />
      <Navigation onNavigate={onNavigate} />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-black"></div>
            <div className="absolute inset-0 bg-black/50 z-10"></div>
          </div>

          <div className="relative z-20 mx-auto max-w-[1400px] px-6 lg:px-12 py-32">
            <div className="text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight mb-10 leading-[1.1] max-w-5xl">
                <span className="text-white">Get unlimited marketing ideas</span>
                <br />
                <span className="text-white/60">that sound like you wrote them.</span>
              </h1>
              
              <p className="text-2xl sm:text-3xl text-white/90 max-w-4xl mb-12 leading-relaxed">
                AIBC extracts your brand voice from existing content & generates authentic marketing ideas automatically. No generic templates. Just your voice, at scale.
              </p>

              {/* Trust Signals - Blaze.ai/Jasper.ai Tactic */}
              <div className="flex items-center gap-6 mb-8 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Free brand scan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span>4.9/5 from 500+ brands</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleStartScan}
                  className="px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 w-fit"
                  data-seo-track="cta"
                  data-cta-type="hero-primary"
                >
                  Start free brand scan <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    trackCTAClick('marketing-ideas', 'learn-more', 'hero');
                    const element = document.getElementById('how-it-works');
                    if (element) {
                      window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
                    }
                  }}
                  className="px-8 py-4 bg-black border border-white text-white font-medium rounded-lg hover:bg-black/80 transition-colors flex items-center gap-2 w-fit"
                  data-seo-track="cta"
                  data-cta-type="hero-secondary"
                >
                  See how it works
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="py-24 bg-[#050505] border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium mb-16 text-center">
              <span className="text-white">Stop struggling with</span>
              <br />
              <span className="text-white/60">marketing ideas.</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="text-6xl sm:text-7xl font-medium text-white mb-4">50+</div>
                <h3 className="text-xl font-bold text-white mb-3">Marketing Ideas Weekly</h3>
                <p className="text-white/60">Generate unlimited marketing content ideas that match your brand voice automatically.</p>
              </div>
              <div className="text-center">
                <div className="text-6xl sm:text-7xl font-medium text-white mb-4">90%</div>
                <h3 className="text-xl font-bold text-white mb-3">Time Saved</h3>
                <p className="text-white/60">No more blank pages. Get marketing ideas instantly that sound authentically yours.</p>
              </div>
              <div className="text-center">
                <div className="text-6xl sm:text-7xl font-medium text-orange-500 mb-4">100%</div>
                <h3 className="text-xl font-bold text-white mb-3">Your Voice</h3>
                <p className="text-white/60">Every marketing idea matches your unique brand voice - extracted from your existing content.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-[#050505]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
                How it works.
              </h2>
              <p className="text-lg sm:text-xl text-white/60">
                Get marketing ideas that sound like you in 3 simple steps.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">1. Scan Your Brand</h3>
                </div>
                <p className="text-white/60 mb-6">
                  AIBC analyzes your existing content across all platforms - LinkedIn, Twitter, Instagram, your website. We extract your unique brand voice, tone, and style.
                </p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">2. Generate Ideas</h3>
                </div>
                <p className="text-white/60 mb-6">
                  Get unlimited marketing ideas automatically. Every idea matches your brand voice - no generic templates, no robotic text. Just authentic content ideas.
                </p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">3. Publish & Scale</h3>
                </div>
                <p className="text-white/60 mb-6">
                  Use your marketing ideas across all platforms. AIBC generates content for LinkedIn, Twitter, Instagram, blogs, and more - all in your voice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-[#050505] border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-5xl sm:text-6xl font-medium text-white mb-16 text-center">
              Marketing ideas for every platform.
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <FileText className="w-8 h-8 text-white mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">LinkedIn Posts</h3>
                <p className="text-white/60">Professional thought leadership content that matches your brand voice.</p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <Zap className="w-8 h-8 text-white mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Twitter/X Threads</h3>
                <p className="text-white/60">Engaging threads and posts that sound authentically yours.</p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <BarChart3 className="w-8 h-8 text-white mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Instagram Content</h3>
                <p className="text-white/60">Visual content ideas with captions that match your brand style.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section - Blaze.ai/Jasper.ai Tactic */}
        <section className="py-24 bg-[#050505] border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-4xl sm:text-5xl font-medium text-white mb-12 text-center">
              Trusted by 500+ brands
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white/80 mb-4">"AIBC saved us 20 hours per week on content ideation. The ideas actually sound like us, not generic AI."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 font-bold">SM</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Sarah Martinez</p>
                    <p className="text-white/60 text-sm">CMO, TechStartup</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white/80 mb-4">"We generate 50+ marketing ideas weekly now. Our content output increased 5x without hiring."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 font-bold">JD</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">James Davis</p>
                    <p className="text-white/60 text-sm">Founder, GrowthCo</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white/80 mb-4">"The brand voice extraction is incredible. Our audience can't tell the difference between AI and human content."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 font-bold">AL</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Alex Lee</p>
                    <p className="text-white/60 text-sm">Marketing Director, SaaS Pro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Multiple CTAs for Ad Optimization */}
        <section className="py-24 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-orange-900/20 border-t border-white/5">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-medium text-white mb-4">
              Ready for unlimited marketing ideas?
            </h2>
            <p className="text-xl text-white/60 mb-8">
              Start your free brand scan and get marketing ideas that sound like you wrote them.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button
                onClick={() => {
                  trackCTAClick('marketing-ideas', 'start-scan', 'final-cta');
                  trackConversion('marketing-ideas', 'final_cta_click', 1);
                  handleStartScan();
                }}
                className="px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                data-seo-track="cta"
                data-cta-type="final-primary"
              >
                Start free brand scan <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  trackCTAClick('marketing-ideas', 'view-pricing', 'final-cta');
                  onNavigate(ViewState.PRICING);
                }}
                className="px-8 py-4 bg-black border border-white text-white font-medium rounded-lg hover:bg-black/80 transition-colors flex items-center justify-center gap-2"
                data-seo-track="cta"
                data-cta-type="final-secondary"
              >
                View pricing
              </button>
            </div>
            <p className="text-sm text-white/40">
              No credit card required. Get your first marketing ideas in minutes. Cancel anytime.
            </p>
          </div>
        </section>

        <Footer onNavigate={onNavigate} />
      </main>
    </div>
  );
};

export default MarketingIdeasView;

