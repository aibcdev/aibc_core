import React, { useRef, useEffect, useCallback, useState } from 'react';
import { 
  ArrowRight, Play, TrendingUp, Clock, Sparkles, Zap, Globe, Shield, MessageSquare,
  BarChart3, Video, FileText, Target, Brain, X, Heart, RefreshCw
} from 'lucide-react';
import { ViewState, NavProps } from '../types';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';

const LandingView: React.FC<NavProps> = ({ onNavigate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  // Check if user is authenticated before allowing scan
  const handleStartScan = useCallback(() => {
    const authToken = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (authToken && user) {
      // User is logged in - go to scan
      onNavigate(ViewState.INGESTION);
    } else {
      // User not logged in - go to sign up
      onNavigate(ViewState.LOGIN);
    }
  }, [onNavigate]);

  useEffect(() => {
    // Ensure video plays and handle errors
    if (videoRef.current) {
      const video = videoRef.current;
      
      const handleCanPlay = () => {
        video.play().catch(err => {
          console.log('Video autoplay prevented:', err);
        });
      };
      
      const handleError = (e: any) => {
        console.error('Video error:', e);
        console.error('Video error details:', {
          error: video.error,
          networkState: video.networkState,
          readyState: video.readyState
        });
      };
      
      const handleLoadStart = () => {
        console.log('Video load started');
      };
      
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      video.addEventListener('loadstart', handleLoadStart);
      
      // Try to play immediately
      video.play().catch(err => {
        console.log('Initial video play failed:', err);
      });
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadstart', handleLoadStart);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navigation onNavigate={onNavigate} />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Video Background with Overlay */}
          <div className="absolute inset-0 z-0">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover opacity-100"
              style={{ zIndex: 1, minHeight: '100%', minWidth: '100%' }}
            >
              <source src="/hero-video.mp4?v=3" type="video/mp4" />
              <source src="/hero-video.webm?v=3" type="video/webm" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/50 z-10" style={{ zIndex: 2 }}></div>
            {/* Fallback background image if video doesn't load */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-20 blur-3xl" style={{ zIndex: 0 }}></div>
          </div>

          <div className="relative z-20 mx-auto max-w-[1400px] px-6 lg:px-12 py-32">
            <div className="text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight mb-10 leading-[1.1] max-w-5xl">
                <span className="text-white">Never hire a content marketing employee again.</span>
              </h1>
              
              <p className="text-2xl sm:text-3xl text-white/90 max-w-4xl mb-12 leading-relaxed">
                The enterprise AI platform for modern marketing teams. Turn strategy into world-class content at scale.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleStartScan}
                  className="px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 w-fit"
                >
                  Start free trial <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowHowItWorks(true)}
                  className="px-8 py-4 bg-black border border-white text-white font-medium rounded-lg hover:bg-black/80 transition-colors flex items-center gap-2 w-fit"
                >
                  <Play className="w-4 h-4" /> See how it works
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="py-24 bg-[#050505] border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium mb-16 text-center">
              <span className="text-white">Grow faster with content</span>
              <br />
              <span className="text-white/60">that actually converts.</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="text-6xl sm:text-7xl font-medium text-white mb-4">2.5x</div>
                <h3 className="text-xl font-bold text-white mb-3">ROI Increase</h3>
                <p className="text-white/60">Average return on ad spend for brands using AIBC creative assets vs traditional stock.</p>
              </div>
              <div className="text-center">
                <div className="text-6xl sm:text-7xl font-medium text-white mb-4">10x</div>
                <h3 className="text-xl font-bold text-white mb-3">Faster Production</h3>
                <p className="text-white/60">Go from ideation to published campaign in minutes, not weeks.</p>
              </div>
              <div className="text-center">
                <div className="text-6xl sm:text-7xl font-medium text-orange-500 mb-4">#1</div>
                <h3 className="text-xl font-bold text-white mb-3">Rated Platform</h3>
                <p className="text-white/60">Voted the most intuitive enterprise AI solution by G2 and Capterra in 2024.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - "Everything you need to grow" */}
        <section className="py-24 bg-[#050505]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-4">
                Everything you need to grow.
              </h2>
              <p className="text-lg sm:text-xl text-white/60">
                A complete toolkit for modern creators and businesses. No technical skills required.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Know what works - Left side, spans 2 columns */}
              <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Know what works</h3>
                </div>
                <p className="text-white/60 mb-6">
                  See which posts will perform best before you even hit publish. AIBC learns from your best content to predict engagement.
                </p>
                
                {/* Engagement Graph */}
                <div className="bg-[#050505] rounded-xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-wider mb-1">TOTAL ENGAGEMENT</div>
                      <div className="text-3xl font-bold text-white">124.8K</div>
                    </div>
                    <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs font-bold text-green-400">12.5%</span>
                    </div>
                  </div>
                  
                  {/* Simple Line Graph */}
                  <div className="h-32 flex items-end gap-2 relative">
                    {[60, 45, 55, 50, 65, 70, 85].map((height, i) => {
                      const isToday = i === 6; // Sunday is today
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center relative">
                          {isToday && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                              TODAY
                              <div className="text-white font-bold">4,291 +8%</div>
                            </div>
                          )}
                        <div 
                          className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t transition-all"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-[10px] text-white/30 mt-2">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i]}</div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right column - two cards stacked */}
              <div className="flex flex-col gap-6">
                {/* Always in Sync - Top right */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Always in Sync</h3>
                  </div>
                  <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs font-bold text-orange-400">
                    INSTANT
                  </span>
                </div>
                <p className="text-white/60 mb-6">
                  Update your brand voice once, and it updates everywhere instantly across all channels.
                </p>
                
                {/* Progress Bar */}
                <div className="bg-[#050505] rounded-lg h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400" style={{ width: '85%' }}></div>
                </div>
                </div>

                {/* Writes in Your Voice - Bottom right */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Writes in Your Voice</h3>
                </div>
                <p className="text-white/60 mb-6">
                  No robotic text. It sounds just like you.
                </p>
                
                {/* Terminal/Code Snippet */}
                <div className="bg-[#050505] rounded-xl p-4 border border-white/5 font-mono text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-white/80">
                    <div className="text-purple-400">$</div>
                    <div className="text-white/60">generate --tone=minimalist --context=luxury</div>
                    <div className="text-white/40 mt-2">&gt; <span className="animate-pulse">|</span></div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid - "Everything you need to scale your narrative" */}
        <section className="py-24 bg-[#050505] border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-5xl sm:text-6xl font-medium text-white mb-16 text-center">
              Everything you need to scale your narrative.
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <Zap className="w-8 h-8 text-white mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Instant Generation</h3>
                <p className="text-white/60">Create blog posts, social captions, and emails in seconds, not hours.</p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <FileText className="w-8 h-8 text-white mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Brand Voice Match</h3>
                <p className="text-white/60">Our AI analyzes your past content to perfectly mimic your unique tone and style.</p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <BarChart3 className="w-8 h-8 text-white mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Performance Analytics</h3>
                <p className="text-white/60">Track how your AI-generated content performs across all channels in real-time.</p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <Globe className="w-8 h-8 text-white mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Multi-language Support</h3>
                <p className="text-white/60">Translate and localize your content for over 30 languages instantly.</p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <Shield className="w-8 h-8 text-white mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Enterprise Security</h3>
                <p className="text-white/60">SOC2 Type II certified. Your data is encrypted and never used to train public models.</p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <MessageSquare className="w-8 h-8 text-white mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Collaboration Tools</h3>
                <p className="text-white/60">Comment, approve, and edit content with your team in a seamless workflow.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Configuration & Content Engine Section */}
        <section className="py-24 bg-[#050505] border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {/* Top Left: Configure Agent Panel */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Configure Agent</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Target Persona */}
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">TARGET PERSONA</label>
                    <select className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-white">
                      <option>SaaS Founders</option>
                      <option>Marketing Teams</option>
                      <option>Content Creators</option>
                      <option>Enterprise Leaders</option>
                    </select>
                  </div>
                  
                  {/* Content Topics */}
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">CONTENT TOPICS</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-white flex items-center gap-2">
                        Product Growth <span className="text-white/60 cursor-pointer">×</span>
                      </span>
                      <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-white flex items-center gap-2">
                        AI Strategy <span className="text-white/60 cursor-pointer">×</span>
                      </span>
                      <input 
                        type="text" 
                        placeholder="Add topic..."
                        className="flex-1 min-w-[120px] bg-[#050505] border border-white/10 rounded-lg px-4 py-1.5 text-sm text-white placeholder-white/30"
                      />
                    </div>
                  </div>
                  
                  {/* Tone Slider */}
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">TONE</label>
                    <div className="relative">
                      <div className="flex justify-between text-xs text-white/60 mb-2">
                        <span>PROFESSIONAL</span>
                        <span>WITTY</span>
                      </div>
                      <div className="relative h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer"
                          style={{ left: '25%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors">
                    UPDATE AGENT
                  </button>
                </div>
              </div>
              
              {/* Top Right: Create without being generic */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                <h2 className="text-4xl sm:text-5xl font-medium text-white mb-4">
                  Create without being <span className="text-white/40">generic.</span>
                </h2>
                <p className="text-lg text-white/60 mb-8">
                  Generic AI content fails. Our platform uses deep context vectors to understand your unique brand voice, ensuring every piece of content feels authentically yours—at scale.
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Voice Cloning */}
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                      <Brain className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Voice Cloning</h3>
                    <p className="text-sm text-white/60">
                      Upload samples to train agents on your specific writing style.
                    </p>
                  </div>
                  
                  {/* Niche Targeting */}
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Niche Targeting</h3>
                    <p className="text-sm text-white/60">
                      Drill down into micro-segments with custom parameters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Bottom Left: Scale your content engine */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                <h2 className="text-4xl sm:text-5xl font-medium text-white mb-4">
                  Scale your content engine, <span className="text-white/40">not your headcount.</span>
                </h2>
                <p className="text-lg text-white/60 mb-8">
                  Stop guessing what works. Our autonomous agents research, draft, and optimize content that ranks. Watch your organic traffic grow on autopilot while you focus on strategy.
                </p>
                <button className="px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 mb-2">
                  Deploy Agents <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-sm text-white/40">
                  No credit card required for pilot.
                </p>
              </div>
              
              {/* Bottom Right: Analytics Panel */}
              <div className="space-y-4">
                {/* Monthly Views Card */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-white/60" />
                      <span className="text-xs text-white/40 uppercase tracking-wider">MONTHLY VIEWS</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">84.2k</span>
                    <span className="text-sm text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> +12.5%
                    </span>
                  </div>
                </div>
                
                {/* Article Performance Card */}
                <div className="bg-white border border-white/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                        <span className="text-xs font-bold text-white">AI</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">PUBLISHED</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">ARTICLE PERFORMANCE</span>
                  </div>
                  <div className="text-4xl font-bold text-black mb-1">4,489</div>
                  <div className="text-sm text-gray-600 mb-4">Reads in last 24h</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Conversion</span>
                    <span className="text-sm font-bold text-black">8.1%</span>
                  </div>
                </div>
                
                {/* Research Agent Card */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">Research Agent</h3>
                      <span className="text-sm text-green-400">Active now</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                      <span>Indexing...</span>
                      <span>75%</span>
                    </div>
                    <div className="h-2 bg-[#050505] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Powering the Next Generation Section - Image Grid */}
        <section className="relative py-32 bg-[#050505] border-t border-white/5 overflow-hidden">
          {/* Background Photo Grid */}
          <div className="absolute inset-0 z-0">
              <div className="grid grid-cols-5 grid-rows-3 h-full w-full gap-0">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                  className="relative overflow-hidden grayscale"
                    style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-${1522071820 + i}?w=400&h=400&fit=crop&q=80&bw=1')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ))}
              </div>
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/60 z-10"></div>
          </div>

          {/* Content */}
          <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-medium text-white tracking-tight">
                Powering the next generation of creators and businesses.
              </h2>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-orange-900/20 border-t border-white/5">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-medium text-white mb-4">
              Ready to transform your content?
            </h2>
            <p className="text-xl text-white/60 mb-8">
              Join thousands of modern marketing teams using AIBC Media today.
            </p>
            <button
              onClick={handleStartScan}
              className="px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors mb-4"
            >
              Start your 7-day free trial
            </button>
            <p className="text-sm text-white/40">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </section>

        <Footer />
      </main>

      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowHowItWorks(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
            {/* Gradient accents */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
            
            {/* Close button */}
            <button 
              onClick={() => setShowHowItWorks(false)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Content */}
            <div className="relative p-8 md:p-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How AIBC works</h2>
                <p className="text-white/60 text-lg max-w-xl mx-auto">
                  Automate your workflow with intelligent generation, seamless adjustments, and data-driven learning.
                </p>
              </div>
              
              {/* 3 Feature Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {/* Card 1: Content Generation */}
                <div className="bg-[#111111] border border-white/10 rounded-xl p-6 relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold mb-6">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Content Generation</h3>
                  <p className="text-white/50 text-sm mb-6">
                    Automatically creates tailored posts based on your brand voice.
                  </p>
                  {/* Mock calendar UI */}
                  <div className="bg-[#0A0A0A] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/60 text-xs">Sep 2026</span>
                      <div className="flex gap-1">
                        <div className="w-5 h-5 rounded bg-white/5" />
                        <div className="w-5 h-5 rounded bg-white/5" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded mb-2 w-fit">May 5</div>
                        <div className="bg-[#1a1a1a] rounded-lg p-2 border border-white/5">
                          <div className="w-full h-12 bg-gradient-to-br from-white/10 to-white/5 rounded" />
                          <div className="h-1.5 bg-white/20 rounded mt-2 w-3/4" />
                          <div className="h-1.5 bg-white/10 rounded mt-1 w-1/2" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-white/30 text-[10px] mb-2">May 6</div>
                        <div className="bg-[#1a1a1a] rounded-lg p-2 border border-white/5 h-[72px]" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Card 2: Smart Editor */}
                <div className="bg-[#111111] border border-white/10 rounded-xl p-6 relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold mb-6">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Smart Editor</h3>
                  <p className="text-white/50 text-sm mb-6">
                    Powerful tools to refine copy, swap images, and perfect your message.
                  </p>
                  {/* Mock editor UI */}
                  <div className="relative rounded-lg overflow-hidden">
                    <div className="absolute top-2 left-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 text-white text-xs z-10">
                      <RefreshCw className="w-3 h-3" /> Replace
                    </div>
                    <div className="bg-gradient-to-br from-gray-400 to-gray-600 h-32 rounded-lg" />
                    <div className="absolute bottom-2 left-2 text-white font-medium text-sm">Coaching</div>
                    <div className="absolute bottom-2 right-2 bg-white rounded-lg p-2 shadow-lg">
                      <div className="w-10 h-10 bg-cyan-500 rounded" />
                      <div className="text-[8px] text-gray-500 mt-1">#6147DC</div>
                    </div>
                  </div>
                </div>
                
                {/* Card 3: Adaptive Learning */}
                <div className="bg-[#111111] border border-white/10 rounded-xl p-6 relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold mb-6">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Adaptive Learning</h3>
                  <p className="text-white/50 text-sm mb-6">
                    Continuous analysis optimizes future content for maximum engagement.
                  </p>
                  {/* Mock analytics UI */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4 text-white/40" />
                      <span className="text-white/60 text-sm flex-1">Reach</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-3/4 rounded-full" />
                      </div>
                      <span className="text-green-400 text-xs font-medium">+24%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-white/40" />
                      <span className="text-white/60 text-sm flex-1">Likes</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-1/2 rounded-full" />
                      </div>
                      <span className="text-green-400 text-xs font-medium">+12%</span>
                    </div>
                    {/* Chart mock */}
                    <div className="h-16 mt-4 flex items-end gap-1">
                      <svg viewBox="0 0 100 40" className="w-full h-full">
                        <path 
                          d="M0 35 Q10 30 20 32 T40 25 T60 28 T80 15 T100 20" 
                          fill="none" 
                          stroke="url(#purpleGradient)" 
                          strokeWidth="2"
                        />
                        <defs>
                          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#A855F7" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center justify-end gap-4">
                <button 
                  onClick={() => setShowHowItWorks(false)}
                  className="px-6 py-3 text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowHowItWorks(false);
                    onNavigate(ViewState.LOGIN);
                  }}
                  className="px-8 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingView;
