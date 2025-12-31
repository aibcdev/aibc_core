import React, { useCallback } from 'react';
import { ArrowRight, FileText, Linkedin, Twitter, Instagram, Youtube, Sparkles } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';
import SEOMeta from './shared/SEOMeta';

const ContentMarketingView: React.FC<NavProps> = ({ onNavigate }) => {
  const baseURL = typeof window !== 'undefined' ? window.location.origin : 'https://aibcmedia.com';
  
  const handleStartScan = useCallback(() => {
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
        title="Content Marketing That Matches Your Brand Voice | AIBC"
        description="AIBC generates content marketing that sounds like you wrote it. LinkedIn, Twitter, Instagram, blogs - all platforms covered with authentic brand voice."
        image={`${baseURL}/favicon.svg`}
        url={`${baseURL}/content-marketing`}
        type="website"
      />
      <Navigation onNavigate={onNavigate} />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-black"></div>
            <div className="absolute inset-0 bg-black/50 z-10"></div>
          </div>

          <div className="relative z-20 mx-auto max-w-[1400px] px-6 lg:px-12 py-32">
            <div className="text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight mb-10 leading-[1.1] max-w-5xl">
                <span className="text-white">Content marketing that</span>
                <br />
                <span className="text-white/60">matches your brand voice.</span>
              </h1>
              
              <p className="text-2xl sm:text-3xl text-white/90 max-w-4xl mb-12 leading-relaxed">
                AIBC generates content marketing for LinkedIn, Twitter, Instagram, blogs, and more - all in your authentic brand voice. No generic content. Just you, at scale.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleStartScan}
                  className="px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 w-fit"
                >
                  Generate your first piece <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    const element = document.getElementById('platforms');
                    if (element) {
                      window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
                    }
                  }}
                  className="px-8 py-4 bg-black border border-white text-white font-medium rounded-lg hover:bg-black/80 transition-colors flex items-center gap-2 w-fit"
                >
                  See all platforms
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Grid Section */}
        <section id="platforms" className="py-24 bg-[#050505] border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium mb-16 text-center">
              <span className="text-white">Content for every</span>
              <br />
              <span className="text-white/60">platform you use.</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                  <Linkedin className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">LinkedIn Posts</h3>
                <p className="text-white/60 mb-4">Professional thought leadership content that matches your brand voice.</p>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>• Long-form posts</li>
                  <li>• Industry insights</li>
                  <li>• Professional tone</li>
                </ul>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8">
                <div className="w-12 h-12 rounded-xl bg-gray-500/20 border border-gray-500/30 flex items-center justify-center mb-4">
                  <Twitter className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Twitter/X Threads</h3>
                <p className="text-white/60 mb-4">Engaging threads and posts that sound authentically yours.</p>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>• Viral thread formats</li>
                  <li>• Punchy single tweets</li>
                  <li>• Engagement-optimized</li>
                </ul>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center mb-4">
                  <Instagram className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Instagram Content</h3>
                <p className="text-white/60 mb-4">Visual content ideas with captions that match your brand style.</p>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>• Carousel posts</li>
                  <li>• Story captions</li>
                  <li>• Reel scripts</li>
                </ul>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4">
                  <Youtube className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">YouTube Scripts</h3>
                <p className="text-white/60 mb-4">Video scripts that match your speaking style and brand voice.</p>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>• Long-form scripts</li>
                  <li>• Short-form content</li>
                  <li>• Hook optimization</li>
                </ul>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Blog Posts</h3>
                <p className="text-white/60 mb-4">Long-form articles that match your writing style and expertise.</p>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>• SEO-optimized</li>
                  <li>• Brand voice consistent</li>
                  <li>• Research-backed</li>
                </ul>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Email Campaigns</h3>
                <p className="text-white/60 mb-4">Email content that sounds like you wrote it personally.</p>
                <ul className="space-y-2 text-sm text-white/60">
                  <li>• Newsletter content</li>
                  <li>• Product announcements</li>
                  <li>• Personalized tone</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-[#050505]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
                How it works.
              </h2>
              <p className="text-lg sm:text-xl text-white/60">
                Get content marketing that sounds like you in 3 steps.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                <div className="text-4xl font-bold text-white/20 mb-4">01</div>
                <h3 className="text-2xl font-bold text-white mb-4">Scan Your Brand</h3>
                <p className="text-white/60">
                  AIBC analyzes your existing content across all platforms to extract your unique brand voice, tone, and writing style.
                </p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                <div className="text-4xl font-bold text-white/20 mb-4">02</div>
                <h3 className="text-2xl font-bold text-white mb-4">Generate Content</h3>
                <p className="text-white/60">
                  Get content marketing for any platform - LinkedIn, Twitter, Instagram, blogs, emails. All in your authentic voice.
                </p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                <div className="text-4xl font-bold text-white/20 mb-4">03</div>
                <h3 className="text-2xl font-bold text-white mb-4">Publish & Scale</h3>
                <p className="text-white/60">
                  Use your content across all platforms. AIBC ensures every piece matches your brand voice - no generic content.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-orange-900/20 border-t border-white/5">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-medium text-white mb-4">
              Ready for content marketing that sounds like you?
            </h2>
            <p className="text-xl text-white/60 mb-8">
              Start generating content for all your platforms in your authentic brand voice.
            </p>
            <button
              onClick={handleStartScan}
              className="px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors mb-4"
            >
              Generate your first piece
            </button>
            <p className="text-sm text-white/40">
              No credit card required. Start creating content in minutes.
            </p>
          </div>
        </section>

        <Footer onNavigate={onNavigate} />
      </main>
    </div>
  );
};

export default ContentMarketingView;



