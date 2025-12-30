import React, { useCallback } from 'react';
import { ArrowRight, DollarSign, Users, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';
import SEOMeta from './shared/SEOMeta';

const VsHiringView: React.FC<NavProps> = ({ onNavigate }) => {
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
        title="Don't Hire a Marketing Manager - Use AI Instead | AIBC"
        description="Save $50K+ on marketing salaries. AIBC generates unlimited marketing content that matches your brand voice. Costs $49/month vs $50K+ salary."
        image={`${baseURL}/favicon.svg`}
        url={`${baseURL}/vs-hiring`}
        type="website"
      />
      <Navigation onNavigate={onNavigate} />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 via-red-900/30 to-black"></div>
            <div className="absolute inset-0 bg-black/50 z-10"></div>
          </div>

          <div className="relative z-20 mx-auto max-w-[1400px] px-6 lg:px-12 py-32">
            <div className="text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight mb-10 leading-[1.1] max-w-5xl">
                <span className="text-white">Don't hire a marketing manager.</span>
                <br />
                <span className="text-white/60">Use AI instead.</span>
              </h1>
              
              <p className="text-2xl sm:text-3xl text-white/90 max-w-4xl mb-12 leading-relaxed">
                AIBC generates unlimited marketing content that matches your brand voice. Same quality as a marketing team, 99% cheaper.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleStartScan}
                  className="px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 w-fit"
                >
                  See ROI calculator <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    const element = document.getElementById('comparison');
                    if (element) {
                      window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
                    }
                  }}
                  className="px-8 py-4 bg-black border border-white text-white font-medium rounded-lg hover:bg-black/80 transition-colors flex items-center gap-2 w-fit"
                >
                  Compare costs
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Cost Comparison Section */}
        <section id="comparison" className="py-24 bg-[#050505] border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium mb-16 text-center">
              <span className="text-white">Save $50K+ on</span>
              <br />
              <span className="text-white/60">marketing salaries.</span>
            </h2>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Hiring Option */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-8 h-8 text-red-400" />
                  <h3 className="text-2xl font-bold text-white">Hiring Marketing Team</h3>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Marketing Manager Salary</span>
                    <span className="text-white font-bold">$50,000+/year</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Content Creator</span>
                    <span className="text-white font-bold">$40,000+/year</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Benefits & Overhead</span>
                    <span className="text-white font-bold">$20,000+/year</span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-white">Total Annual Cost</span>
                      <span className="text-2xl font-bold text-red-400">$110,000+</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-white/40 mt-0.5" />
                    <span className="text-white/60">3-6 months to hire</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="w-5 h-5 text-white/40 mt-0.5" />
                    <span className="text-white/60">Ongoing management required</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-5 h-5 text-white/40 mt-0.5" />
                    <span className="text-white/60">Salary increases over time</span>
                  </div>
                </div>
              </div>

              {/* AIBC Option */}
              <div className="bg-[#0A0A0A] border-2 border-orange-500/50 rounded-2xl p-8 relative">
                <div className="absolute top-4 right-4 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs font-bold text-orange-400">
                  RECOMMENDED
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-8 h-8 text-orange-400" />
                  <h3 className="text-2xl font-bold text-white">Using AIBC</h3>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Pro Plan</span>
                    <span className="text-white font-bold">$49/month</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Unlimited Content</span>
                    <span className="text-green-400 font-bold">Included</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Brand Voice Matching</span>
                    <span className="text-green-400 font-bold">Included</span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-white">Total Annual Cost</span>
                      <span className="text-2xl font-bold text-green-400">$588/year</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-white/60">Start in minutes, not months</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-white/60">Works 24/7, never takes vacation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-white/60">Scales with your business</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="inline-block bg-green-500/20 border border-green-500/30 rounded-xl px-8 py-4">
                <div className="text-3xl font-bold text-green-400 mb-2">99.5% Cost Savings</div>
                <p className="text-white/60">Save $109,412+ per year vs hiring a marketing team</p>
              </div>
            </div>
          </div>
        </section>

        {/* What AIBC Does Section */}
        <section className="py-24 bg-[#050505]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-16 text-center">
              Everything a marketing team does.
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <CheckCircle className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Content Ideas & Strategy</h3>
                <p className="text-white/60">Generate unlimited marketing ideas that match your brand voice and strategy.</p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <CheckCircle className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Social Media Posts</h3>
                <p className="text-white/60">LinkedIn, Twitter, Instagram - all platforms covered with content in your voice.</p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <CheckCircle className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Blog Posts & Articles</h3>
                <p className="text-white/60">Long-form content that matches your writing style and brand voice.</p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <CheckCircle className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Email Campaigns</h3>
                <p className="text-white/60">Email content that sounds like you wrote it, automatically generated.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-orange-900/20 via-red-900/20 to-purple-900/20 border-t border-white/5">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-medium text-white mb-4">
              Ready to save $50K+ on marketing?
            </h2>
            <p className="text-xl text-white/60 mb-8">
              Start using AIBC today. No hiring needed. No salaries to pay.
            </p>
            <button
              onClick={handleStartScan}
              className="px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors mb-4"
            >
              Start free trial
            </button>
            <p className="text-sm text-white/40">
              No credit card required. Start saving today.
            </p>
          </div>
        </section>

        <Footer onNavigate={onNavigate} />
      </main>
    </div>
  );
};

export default VsHiringView;


