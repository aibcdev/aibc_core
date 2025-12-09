import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Play, Star, Code2, 
  Database, User, Globe, Braces, 
  ShieldCheck, Lock, Server, Mic, Sparkles, Bot, Twitter, 
  Github, Linkedin, Image as ImageIcon, Footprints, Cpu, Sliders, 
  BrainCircuit, FileText, FileCheck, Archive, Video, Mic2, BarChart3,
  Zap, LogOut
} from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const LandingView: React.FC<NavProps> = ({ onNavigate }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; initials: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (isSupabaseConfigured() && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsLoggedIn(true);
          const name = session.user.user_metadata?.name || session.user.email || 'User';
          const email = session.user.email || '';
          const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
          setUserInfo({ name, email, initials });
        } else {
          setIsLoggedIn(false);
          setUserInfo(null);
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            setIsLoggedIn(true);
            const name = session.user.user_metadata?.name || session.user.email || 'User';
            const email = session.user.email || '';
            const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
            setUserInfo({ name, email, initials });
          } else {
            setIsLoggedIn(false);
            setUserInfo(null);
          }
        });
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };
  return (
    <div id="landing-view" className="animate-in fade-in duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center">
            {/* Logo Section */}
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => window.scrollTo(0,0)}
            >
              <div className="h-8 w-8 flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4" />
                  <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="4" />
                  <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="4" />
                  <circle cx="50" cy="50" r="6" fill="currentColor" />
                </svg>
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">AIBC</span>
            </div>

            {/* Vertical Divider */}
            <div className="h-6 w-[1px] bg-white/20 mx-8 hidden md:block"></div>

            {/* Menu Items */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-sm font-bold text-white hover:text-orange-500 transition-colors uppercase tracking-wide">Home</a>
              <button 
                onClick={() => onNavigate(ViewState.PRICING)}
                className="text-sm font-bold text-white hover:text-orange-500 transition-colors uppercase tracking-wide"
              >
                Pricing
              </button>
              <div className="relative group">
                <a 
                  href="https://aibroadcasting.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors uppercase tracking-wide flex items-center gap-1 cursor-pointer"
                >
                  AIBC Stream
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                
                {/* Dropdown Modal */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="grid grid-cols-2 gap-4">
                    <a 
                      href="https://aibroadcasting.xyz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.04] transition-all group/item"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Video className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover/item:text-orange-400 transition-colors">AI Streaming Channels</h3>
                          <p className="text-xs text-white/40">Real-time video synthesis</p>
                        </div>
                      </div>
                    </a>
                    
                    <a 
                      href="https://aibroadcasting.xyz/copystream"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.04] transition-all group/item"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover/item:text-orange-400 transition-colors">CopyStream</h3>
                          <p className="text-xs text-white/40">AI content generation</p>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn && userInfo ? (
              <>
                <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center text-[10px] font-bold border border-white/20">
                    {userInfo.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{userInfo.name}</div>
                    <div className="text-[10px] text-white/40 truncate">{userInfo.email}</div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const hasCompletedOnboarding = localStorage.getItem('lastScannedUsername');
                    onNavigate(hasCompletedOnboarding ? ViewState.DASHBOARD : ViewState.INGESTION);
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-white/10"
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 text-xs font-medium text-white/60 hover:text-white transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate(ViewState.SIGNIN)} 
                  className="hidden md:block text-xs font-medium text-white/60 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button 
                  onClick={() => onNavigate(ViewState.SIGNIN)} 
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-white/10"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* HERO SECTION */}
        <section id="home" className="mx-auto max-w-7xl mb-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Content */}
            <div className="relative z-10 pt-8 lg:pt-0">
              <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-sans font-medium tracking-tight text-white leading-[1.1] mb-8">
                Never Hire a <br />
                <span className="text-orange-500">Marketing Employee</span> Again.
              </h1>
              
              <p className="text-lg text-[#888] max-w-lg mb-10 leading-relaxed font-light">
                Using our highly trained agents, we scan your digital footprint and give you automated content based on how you talk, write, and post. Whether you're a large business, or creator, we have the model to remove the guesswork out of creatives, to save you time and money.
              </p>
              
              {/* Buttons */}
              <div className="flex flex-wrap gap-4 mb-10">
                <button 
                  onClick={() => onNavigate(ViewState.INGESTION)}
                  className="relative group px-8 py-4 bg-[#111] rounded-full overflow-hidden border border-white/5 hover:border-white/10 transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
                >
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-full h-[20px] bg-gradient-to-t from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <span className="relative z-10 flex items-center gap-2 text-[13px] font-bold tracking-widest uppercase text-white group-hover:text-orange-50 transition-colors">
                    Scan my brand or Name <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
                
                <button className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all text-sm font-medium text-white/80 hover:text-white flex items-center gap-2">
                  See Sample Output <Play className="w-3 h-3 fill-current ml-1" />
                </button>
              </div>

              {/* Trust Row - Faces & Logos */}
              <div className="mt-8 flex items-center gap-4 animate-fade-in">
                <div className="flex items-center -space-x-3">
                  {/* Creator 1 */}
                  <div className="w-10 h-10 rounded-full border-2 border-black relative z-50 overflow-hidden bg-[#1a1a1a]">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" 
                      alt="Creator" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Creator 2 */}
                  <div className="w-10 h-10 rounded-full border-2 border-black relative z-40 overflow-hidden bg-[#1a1a1a]">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
                      alt="Creator" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Company Logo 1 */}
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center text-[10px] font-black text-black relative z-30">
                    TF
                  </div>
                  {/* Creator 3 */}
                  <div className="w-10 h-10 rounded-full border-2 border-black relative z-20 overflow-hidden bg-[#1a1a1a]">
                    <img 
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop" 
                      alt="Creator" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Company Logo 2 */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-black flex items-center justify-center text-[10px] font-black text-white relative z-10">
                    AI
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="text-[11px] text-white/60 font-medium mt-0.5">
                    <span className="text-white font-bold">4,000+</span> creators & brands
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visuals */}
            <div className="grid grid-cols-2 gap-5 h-[520px] relative animate-float animation-delay-500">
              <div className="absolute inset-0 bg-orange-600/10 blur-[100px] pointer-events-none rounded-full"></div>

              {/* Vertical Card (Left) - REPLACED WITH AI ARTWORK */}
              <div className="row-span-2 bg-[#080808] rounded-[2rem] border border-white/10 relative overflow-hidden flex flex-col justify-end p-6 group hover:border-orange-500/30 transition-colors duration-500" style={{ animationDelay: '0ms' }}>
                {/* Background Image/Video Placeholder */}
                <div className="absolute inset-0 bg-black">
                   <img 
                      src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=80" 
                      alt="AI Art" 
                      className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[2s]"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                   
                   {/* Play Button Overlay */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all group-hover:scale-110">
                      <Play className="w-6 h-6 text-white fill-current ml-1" />
                   </div>
                </div>

                <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-2">
                       <div className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-[10px] font-bold text-purple-300 uppercase tracking-wide flex items-center gap-1">
                           <Sparkles className="w-3 h-3" /> Generative Video
                       </div>
                   </div>
                   <h3 className="text-lg font-bold text-white mb-1">AI Cinematography</h3>
                   <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                       <div className="h-full bg-purple-500 w-2/3 rounded-full animate-[shimmer_2s_infinite]"></div>
                   </div>
                   <p className="text-[10px] text-white/50 mt-2 font-mono">Rendering frame 140/900...</p>
                </div>
              </div>

              {/* Top Right Card - Sync Data with Orange-Red Gradient */}
              <div 
                className="rounded-[2rem] relative overflow-hidden p-6 flex flex-col items-center justify-center shadow-lg group" 
                style={{ 
                  animationDelay: '200ms',
                  background: 'radial-gradient(ellipse at center, rgba(251, 146, 60, 0.9) 0%, rgba(249, 115, 22, 0.8) 50%, rgba(220, 38, 38, 0.9) 100%)'
                }}
              >
                {/* Subtle texture overlay */}
                <div 
                  className="absolute inset-0 opacity-50"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)'
                  }}
                ></div>
                
                <div className="relative z-10 w-full h-full flex flex-col justify-between">
                  <div className="text-center mb-6">
                    <span className="text-white font-medium text-sm drop-shadow-lg tracking-wide">Sync Data</span>
                  </div>
                  
                  <div className="flex justify-between items-center px-2 w-full">
                    {/* Database Icon */}
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/40 rounded-xl flex items-center justify-center shadow-xl translate-x-2 group-hover:translate-x-4 transition-transform duration-500">
                      <Database className="text-white w-6 h-6 drop-shadow-lg" />
                    </div>
                    
                    {/* Connecting Line */}
                    <div className="h-[2px] flex-1 bg-white/40 mx-4 relative overflow-hidden rounded-full">
                        <div className="absolute inset-0 w-full h-full bg-white/90 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>

                    {/* User Icon */}
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/40 rounded-xl flex items-center justify-center shadow-xl -translate-x-2 group-hover:-translate-x-4 transition-transform duration-500">
                      <User className="text-white w-6 h-6 drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Right Card */}
              <div className="bg-[#111] rounded-[2rem] border border-white/10 p-6 flex flex-col justify-center relative overflow-hidden group hover:border-white/20 transition-colors" style={{ animationDelay: '400ms' }}>
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Braces className="w-16 h-16 text-white rotate-12" />
                </div>
                
                <h3 className="text-white/90 text-sm font-medium mb-6 text-center z-10">API Integration</h3>
                
                <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/5 relative z-10 hover:translate-y-[-2px] transition-transform duration-300 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                      <Globe className="text-orange-500 w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white mb-1">HTTP Request</div>
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-white/40 truncate">GET /users/list</span>
                        <span className="text-green-500 font-bold bg-green-500/10 px-1.5 py-0.5 rounded">200</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CREATE WITHOUT BEING GENERIC */}
        <section className="py-8 bg-black relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Visual - Configure Agent UI */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-[#0A0A0A] rounded-2xl border border-white/10 p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-white">Configure Agent</h3>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-2">Target Persona</label>
                      <div className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm flex justify-between items-center">
                        SaaS Founders
                        <span className="text-white/20">▼</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-2">Content Topics</label>
                      <div className="flex gap-2">
                        <div className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-xs text-white flex items-center gap-2">
                          Product Growth <span className="text-white/40">×</span>
                        </div>
                        <div className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-xs text-white flex items-center gap-2">
                          AI Strategy <span className="text-white/40">×</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] uppercase tracking-wider text-white/40 mb-2">
                        <span>Tone: Professional</span>
                        <span>Witty</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full relative">
                        <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer"></div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/5">
                      <button className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide">Update Agent</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div>
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.1] mb-6">
                  Create without <br /> being <span className="text-white/40">generic.</span>
                </h2>
                <p className="text-lg text-[#888] leading-relaxed mb-8 max-w-md">
                  Generic AI content fails. Our platform uses deep context vectors to understand your unique brand voice, ensuring every piece of content feels authentically yours—at scale.
                </p>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                      <div className="i-lucide-fingerprint text-purple-400 w-5 h-5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 6"/><path d="M5 15.887c.495-1.081 1.207-2.036 2-2.887"/><path d="M9.128 12.35A3.5 3.5 0 0 1 12 10.5a3.5 3.5 0 0 1 2.872 1.85"/><path d="M12 7a6 6 0 0 1 5.661 4.03"/><path d="M3.129 13.5A9 9 0 0 1 12 5.5a9 9 0 0 1 8.871 8"/><path d="M12 17.5a2.5 2.5 0 0 1-2.5-2.5V14"/><path d="M14.5 15a2.5 2.5 0 0 1-2.5 2.5v3"/><path d="M12 22v-1"/></svg>
                      </div>
                    </div>
                    <h4 className="text-white font-bold mb-2">Voice Cloning</h4>
                    <p className="text-sm text-[#666]">Upload samples to train agents on your specific writing style.</p>
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                      <div className="i-lucide-target text-purple-400 w-5 h-5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                      </div>
                    </div>
                    <h4 className="text-white font-bold mb-2">Niche Targeting</h4>
                    <p className="text-sm text-[#666]">Drill down into micro-segments with custom parameters.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SCALE YOUR CONTENT ENGINE */}
        <section className="py-8 bg-black relative overflow-hidden border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="order-2 lg:order-1">
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.1] mb-6">
                  Scale your content <br /> engine, <span className="text-white/40">not your headcount.</span>
                </h2>
                <p className="text-lg text-[#888] leading-relaxed mb-10 max-w-md">
                  Stop guessing what works. Our autonomous agents research, draft, and optimize content that ranks. Watch your organic traffic grow on autopilot while you focus on strategy.
                </p>
                
                <div className="flex flex-col gap-4 items-start">
                  <button 
                    onClick={() => onNavigate(ViewState.INGESTION)}
                    className="bg-white text-black px-8 py-4 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    Deploy Agents <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-[#666]">No credit card required for pilot.</span>
                </div>
              </div>

              {/* Right Visual - Analytics Dashboard */}
              <div className="relative order-1 lg:order-2">
                <div className="relative bg-[#0A0A0A] rounded-3xl border border-white/10 p-8 aspect-square flex flex-col justify-center relative overflow-hidden">
                  
                  {/* Monthly Views Card */}
                  <div className="absolute top-12 left-8 w-48 bg-[#111] rounded-xl border border-white/10 p-4 shadow-2xl z-10 animate-[float_6s_ease-in-out_infinite]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] text-white/40 uppercase">Monthly Views</span>
                      <BarChart3 className="w-3 h-3 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">84.2k</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      ↗ +12.5%
                    </div>
                  </div>

                  {/* Article Performance Card */}
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-4 w-64 bg-white rounded-xl p-5 shadow-2xl z-20">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-[10px]">AI</div>
                        <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">Published</span>
                    </div>
                    <div className="space-y-1 mb-4">
                      <div className="text-[10px] text-gray-400 uppercase">Article Performance</div>
                      <div className="text-3xl font-bold text-black">4,489</div>
                      <div className="text-xs text-gray-500">Reads in last 24h</div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-xs font-medium text-black">Conversion</span>
                      <span className="text-xs font-bold text-black">8.1%</span>
                    </div>
                  </div>

                  {/* Research Agent Card */}
                  <div className="absolute bottom-12 left-12 w-56 bg-[#111] rounded-xl border border-white/10 p-4 shadow-2xl z-10 animate-[float_7s_ease-in-out_infinite_1s]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Research Agent</div>
                        <div className="text-[10px] text-emerald-400">Active now</div>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-purple-500 w-3/4 rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-white/40">
                      <span>Indexing...</span>
                      <span>75%</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OUTPUT COMPARISON */}
        <section className="py-6 border-t border-white/5 bg-[#050505] relative">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-medium tracking-tight text-white">High Fidelity Output</h2>
              <p className="mt-3 text-white/50 text-base">See the difference between generic AI and <span className="text-orange-400">Brand-Tuned AI</span>.</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl">
              <div className="flex border-b border-white/10 bg-white/5 backdrop-blur">
                <div className="flex-1 px-5 py-3 text-[10px] font-bold text-white/40 border-r border-white/10 flex items-center justify-between">
                  <span>INPUT: RAW THOUGHTS</span>
                  <Mic className="h-3 w-3" strokeWidth={1.5} />
                </div>
                <div className="flex-1 px-5 py-3 text-[10px] font-bold text-orange-400 bg-orange-500/5 flex items-center justify-between">
                  <span>OUTPUT: LINKEDIN POST</span>
                  <span className="text-[9px] text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> Optimized</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row min-h-[300px]">
                {/* Before */}
                <div className="flex-1 p-6 border-r border-white/10 bg-[#050505]">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      <span className="text-[9px] text-white/40 font-bold">YOU</span>
                    </div>
                    <div className="space-y-3 w-full">
                      <div className="w-full rounded-xl bg-white/5 border border-white/5 p-4">
                        <p className="font-mono text-[11px] leading-relaxed text-white/50 italic">
                          "Basically we are seeing that companies spend way too much time on meetings. Like, asynchronous work is better..."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* After */}
                <div className="flex-1 p-6 bg-[#080808] relative overflow-hidden">
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="space-y-3 w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">Felix Chen</span>
                        <span className="text-[10px] text-white/40">• CMO at TechFlow</span>
                      </div>
                      <p className="text-[13px] text-white/90 leading-relaxed font-serif">
                        Your calendar is killing your company. 💀
                      </p>
                      <p className="text-[13px] text-white/80 leading-relaxed font-serif">
                        We analyzed 500+ startups.
                        The #1 cause of stalled growth? <span className="bg-orange-500/10 text-orange-200 px-1 rounded font-medium">Meeting density.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW DIAGRAM */}
        <section className="py-6 bg-[#050505] relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="mx-auto max-w-[1200px] px-6 relative z-10">
                <div className="relative w-full h-[600px] rounded-3xl bg-[#030303]/80 border border-white/5 p-8 overflow-hidden backdrop-blur-sm shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-[#000000] to-[#000000] opacity-50"></div>
                    
                    {/* Nodes Container */}
                    <div className="relative w-full h-full text-white/80 text-[10px] font-mono tracking-wide">
                        
                        {/* SVG Connectors - Calculated approx positions */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                            {/* Main trunk */}
                            <path d="M100 300 L200 300" stroke="white" strokeWidth="1" />
                            <path d="M250 300 L350 300" stroke="white" strokeWidth="1" />
                            <path d="M400 300 L480 300" stroke="white" strokeWidth="1" />
                            
                            {/* Split */}
                            <path d="M530 300 C 560 300, 560 180, 620 180" stroke="white" strokeWidth="1" fill="none" />
                            <path d="M530 300 C 560 300, 560 420, 620 420" stroke="white" strokeWidth="1" fill="none" />

                            {/* Top Branch Outputs */}
                            <path d="M670 180 C 720 180, 720 100, 780 100" stroke="white" strokeWidth="1" fill="none" />
                            <path d="M670 180 C 720 180, 720 180, 780 180" stroke="white" strokeWidth="1" fill="none" />
                            <path d="M670 180 C 720 180, 720 260, 780 260" stroke="white" strokeWidth="1" fill="none" />

                            {/* Bottom Branch Outputs */}
                            <path d="M670 420 C 720 420, 720 360, 780 360" stroke="white" strokeWidth="1" fill="none" />
                            <path d="M670 420 C 720 420, 720 440, 780 440" stroke="white" strokeWidth="1" fill="none" />
                            <path d="M670 420 C 720 420, 720 520, 780 520" stroke="white" strokeWidth="1" fill="none" />

                            {/* Final Convergence */}
                            <path d="M830 100 C 900 100, 900 300, 950 300" stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
                            <path d="M830 260 C 880 260, 880 300, 950 300" stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
                            <path d="M830 360 C 880 360, 880 300, 950 300" stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
                            <path d="M830 520 C 900 520, 900 300, 950 300" stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
                        </svg>

                        {/* Node 1: Footprint */}
                        <div className="absolute top-[300px] left-[50px] -translate-y-1/2 flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-[#0A0A0A] border border-white/20 flex items-center justify-center relative shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                <Footprints className="w-6 h-6 text-white" />
                                <div className="absolute -inset-1 border border-white/5 rounded-xl pointer-events-none"></div>
                            </div>
                            <span>Digital Footprint</span>
                        </div>

                        {/* Node 2: Scoring */}
                        <div className="absolute top-[300px] left-[225px] -translate-y-1/2 flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-[#0A0A0A] border border-dashed border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <Cpu className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div className="text-center">
                                <span>Scoring AI</span>
                                <div className="h-4 w-[1px] bg-white/10 mx-auto my-1"></div>
                                <div className="text-[8px] text-white/40 leading-tight">ENGAGEMENT DATA<br/>COMPETITOR ANALYSIS</div>
                            </div>
                        </div>

                        {/* Node 3: Code */}
                        <div className="absolute top-[300px] left-[375px] -translate-y-1/2 flex flex-col items-center gap-3">
                             <div className="w-14 h-14 rounded-xl bg-[#1a1a1a] border border-white/20 flex items-center justify-center">
                                <Code2 className="w-6 h-6 text-white" />
                            </div>
                            <span>Code</span>
                        </div>

                        {/* Node 4: Quality Filter 1 */}
                        <div className="absolute top-[300px] left-[505px] -translate-y-1/2 flex flex-col items-center gap-3">
                             <div className="w-14 h-14 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center">
                                <Sliders className="w-6 h-6 text-white" />
                            </div>
                            <span>Quality Filter</span>
                        </div>

                        {/* Top Branch: Content AI */}
                        <div className="absolute top-[180px] left-[645px] -translate-y-1/2 flex flex-col items-center gap-3">
                             <div className="w-14 h-14 rounded-xl bg-[#0A0A0A] border border-dashed border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                                <BrainCircuit className="w-6 h-6 text-blue-400" />
                            </div>
                            <span>Content AI</span>
                        </div>

                        {/* Bottom Branch: Quality Filter 2 */}
                        <div className="absolute top-[420px] left-[645px] -translate-y-1/2 flex flex-col items-center gap-3">
                             <div className="w-14 h-14 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center">
                                <Sliders className="w-6 h-6 text-white" />
                            </div>
                            <span>Quality Filter 2</span>
                        </div>

                        {/* Leaf Nodes Top */}
                        <div className="absolute top-[100px] left-[805px] -translate-y-1/2 flex flex-col items-center gap-1 group">
                             <div className="w-12 h-12 rounded-lg bg-[#0A0A0A] border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                                <Twitter className="w-5 h-5 text-white" />
                            </div>
                        </div>
                         <div className="absolute top-[180px] left-[805px] -translate-y-1/2 flex flex-col items-center gap-1 group">
                             <div className="text-[8px] text-white/40 mb-1">X Post</div>
                             <div className="w-12 h-12 rounded-lg bg-[#0A0A0A] border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                        </div>
                         <div className="absolute top-[260px] left-[805px] -translate-y-1/2 flex flex-col items-center gap-1 group">
                             <div className="text-[8px] text-white/40 mb-1">Store</div>
                             <div className="w-12 h-12 rounded-lg bg-[#0A0A0A] border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                                <Linkedin className="w-5 h-5 text-white" />
                            </div>
                             <span className="text-[8px]">LinkedIn</span>
                        </div>

                        {/* Leaf Nodes Bottom */}
                        <div className="absolute top-[360px] left-[805px] -translate-y-1/2 flex flex-col items-center gap-1 group">
                             <div className="w-12 h-12 rounded-lg bg-[#0A0A0A] border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="absolute top-[440px] left-[805px] -translate-y-1/2 flex flex-col items-center gap-1 group">
                             <div className="text-[8px] text-white/40 mb-1">Store</div>
                             <div className="w-12 h-12 rounded-lg bg-[#0A0A0A] border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                                <FileCheck className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="absolute top-[520px] left-[805px] -translate-y-1/2 flex flex-col items-center gap-1 group">
                             <div className="text-[8px] text-white/40 mb-1">Review</div>
                             <div className="w-12 h-12 rounded-lg bg-[#0A0A0A] border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                                <Archive className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[8px]">Archive</span>
                        </div>

                        {/* Final Output */}
                        <div className="absolute top-[300px] left-[980px] -translate-y-1/2 flex flex-col items-center gap-4">
                            <div className="relative">
                                {/* Ripple effect */}
                                <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-20 duration-[3s]"></div>
                                <div className="absolute -inset-4 rounded-full border border-white/5"></div>
                                <div className="absolute -inset-8 rounded-full border border-white/5"></div>
                                
                                <div className="w-20 h-20 rounded-full bg-[#111] border border-white/20 flex items-center justify-center z-10 relative">
                                    <Globe className="w-8 h-8 text-white font-thin" strokeWidth={1} />
                                </div>
                            </div>
                            <span>Final Content Output</span>
                        </div>

                    </div>
                </div>
            </div>
        </section>


        {/* RESULTS SECTION */}
        <section className="relative py-6 bg-black overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-0 bg-noise mix-blend-overlay"></div>
          
          <div className="relative z-10 mx-auto max-w-[1400px] px-6">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                  <span className="text-xs text-white/60">Customer Success</span>
                </div>
                <h2 className="text-5xl font-medium tracking-tight text-white">Results.</h2>
              </div>
            </div>

            {/* Masonry-style Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Column 1: Stats */}
              <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-6 h-[400px] hover:border-white/20 transition-colors">
                <div className="relative z-10 space-y-4">
                  <div>
                    <span className="text-6xl font-medium tracking-tighter text-white">99.8</span>
                    <span className="text-xl text-white/40 align-top">%</span>
                  </div>
                  <p className="text-xs text-white/70 max-w-xs leading-relaxed">
                    Uptime for <span className="text-white font-semibold">250K+ workflows</span>.
                  </p>
                  <div>
                      <span className="text-4xl font-medium tracking-tighter text-white">85</span>
                      <span className="text-lg text-white/40 align-top">%</span>
                  </div>
                  <p className="text-xs text-white/70 max-w-xs leading-relaxed">
                     Time savings on content ops.
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate(ViewState.INGESTION)}
                  className="relative z-10 mt-auto w-full rounded-full bg-white py-3 text-xs font-semibold text-black hover:bg-gray-200 transition-colors"
                >
                  Start your workflow
                </button>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-4">
                <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex items-center justify-between group hover:bg-white/[0.06] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-red-900/40"></div>
                    <div>
                      <div className="text-xs font-semibold text-white">Sarah Chen</div>
                      <div className="text-[9px] text-white/40 uppercase tracking-wide">TechFlow</div>
                    </div>
                  </div>
                </div>

                <div className="relative flex-1 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 p-6 flex flex-col justify-end min-h-[240px]">
                  <div className="absolute top-6 left-6 flex gap-0.5">
                    {[1,2,3,4,5].map((_, i) => <Star key={i} className="h-3 w-3 fill-white text-white" />)}
                  </div>
                  <p className="text-lg font-medium tracking-tight text-white leading-snug">
                    "FlowAI reduced our processing time by 85% and eliminated manual errors."
                  </p>
                </div>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col gap-4">
                <div className="relative flex-1 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 p-6 flex flex-col justify-center text-center min-h-[240px]">
                  <p className="text-lg font-medium tracking-tight text-white leading-snug mb-4">
                    "The AI learns our patterns and suggests content angles we’d never considered."
                  </p>
                </div>
                <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex items-center gap-4">
                  <div className="h-8 w-8 rounded bg-orange-900/40"></div>
                  <div>
                    <div className="text-xs font-semibold text-white">Marcus Johnson</div>
                    <div className="text-[9px] text-white/40 uppercase tracking-wide">Innovate Labs</div>
                  </div>
                </div>
              </div>

              {/* Column 4 */}
              <div className="flex flex-col gap-4">
                <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-blue-900/40"></div>
                    <div>
                      <div className="text-xs font-semibold text-white">Maya Patel</div>
                      <div className="text-[9px] text-white/40 uppercase tracking-wide">Director</div>
                    </div>
                  </div>
                </div>

                <div className="relative flex-1 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 p-6 flex flex-col justify-end text-right min-h-[240px]">
                  <div className="absolute top-6 left-6 flex gap-0.5">
                    {[1,2,3,4,5].map((_, i) => <Star key={i} className="h-3 w-3 fill-orange-500 text-orange-500" />)}
                  </div>
                  <p className="text-lg font-medium tracking-tight text-white leading-snug">
                    "Seamless integration. Setup took minutes."
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* WHAT YOU ACTUALLY GET - COLORFUL GRID REDESIGN */}
        <section id="streams" className="py-6 bg-[#050505]">
           <div className="mx-auto max-w-7xl px-6">
               <div className="mb-10">
                   <h2 className="text-3xl font-medium tracking-tight text-white mb-4">Exactly What You’ll Get Each Month</h2>
                   <div className="h-1 w-20 bg-orange-500 rounded-full"></div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   
                   {/* Card 1: Text Posts */}
                   <div className="rounded-3xl p-8 bg-gradient-to-br from-cyan-900/20 to-blue-900/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all hover:-translate-y-1 group relative overflow-hidden h-[320px] flex flex-col">
                       <div className="absolute inset-0 bg-noise opacity-10"></div>
                       <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80" className="absolute right-[-20px] top-[-20px] w-40 h-40 object-cover rounded-2xl rotate-12 opacity-40 group-hover:opacity-60 transition-opacity" alt="Social" />
                       
                       <div className="mt-auto relative z-10">
                           <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                               <FileText className="w-6 h-6" />
                           </div>
                           <h3 className="text-2xl font-bold text-white mb-2">Text Posts</h3>
                           <div className="inline-block px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/60 mb-3 border border-white/5">All Tiers</div>
                           <p className="text-sm text-white/60 leading-relaxed">Threads, captions, newsletters, and short-form posts optimized for engagement.</p>
                       </div>
                   </div>

                   {/* Card 2: Articles */}
                   <div className="rounded-3xl p-8 bg-gradient-to-br from-emerald-900/20 to-green-900/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:-translate-y-1 group relative overflow-hidden h-[320px] flex flex-col">
                       <div className="absolute inset-0 bg-noise opacity-10"></div>
                       <img src="https://images.unsplash.com/photo-1499750310159-5418f31b1936?auto=format&fit=crop&w=600&q=80" className="absolute right-[-20px] top-[-20px] w-40 h-40 object-cover rounded-2xl rotate-12 opacity-40 group-hover:opacity-60 transition-opacity" alt="Article" />
                       
                       <div className="mt-auto relative z-10">
                           <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                               <FileCheck className="w-6 h-6" />
                           </div>
                           <h3 className="text-2xl font-bold text-white mb-2">Articles</h3>
                           <div className="inline-block px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/60 mb-3 border border-white/5">Pro & Premium</div>
                           <p className="text-sm text-white/60 leading-relaxed">Blogs, op-eds, and PR-ready long-form content SEO-tuned for your niche.</p>
                       </div>
                   </div>

                   {/* Card 3: Short Videos */}
                   <div className="rounded-3xl p-8 bg-gradient-to-br from-purple-900/20 to-fuchsia-900/10 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:-translate-y-1 group relative overflow-hidden h-[320px] flex flex-col">
                       <div className="absolute inset-0 bg-noise opacity-10"></div>
                       <img src="https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=600&q=80" className="absolute right-[-20px] top-[-20px] w-40 h-40 object-cover rounded-2xl rotate-12 opacity-40 group-hover:opacity-60 transition-opacity" alt="Shorts" />
                       
                       <div className="mt-auto relative z-10">
                           <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                               <Video className="w-6 h-6" />
                           </div>
                           <h3 className="text-2xl font-bold text-white mb-2">Short Videos</h3>
                           <div className="inline-block px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/60 mb-3 border border-white/5">Premium</div>
                           <p className="text-sm text-white/60 leading-relaxed">15s–30s reels, promos, and social shorts generated from your text content.</p>
                       </div>
                   </div>

                   {/* Card 4: Explainer Videos */}
                   <div className="rounded-3xl p-8 bg-gradient-to-br from-orange-900/20 to-red-900/10 border border-orange-500/20 hover:border-orange-500/40 transition-all hover:-translate-y-1 group relative overflow-hidden h-[320px] flex flex-col">
                       <div className="absolute inset-0 bg-noise opacity-10"></div>
                       <img src="https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80" className="absolute right-[-20px] top-[-20px] w-40 h-40 object-cover rounded-2xl rotate-12 opacity-40 group-hover:opacity-60 transition-opacity" alt="Explainer" />
                       
                       <div className="mt-auto relative z-10">
                           <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                               <Play className="w-6 h-6" />
                           </div>
                           <h3 className="text-2xl font-bold text-white mb-2">Explainer Videos</h3>
                           <div className="inline-block px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/60 mb-3 border border-white/5">Premium</div>
                           <p className="text-sm text-white/60 leading-relaxed">30s–3m deep-dive brand explainers and tutorials.</p>
                       </div>
                   </div>

                   {/* Card 5: Podcasts */}
                   <div className="rounded-3xl p-8 bg-gradient-to-br from-pink-900/20 to-rose-900/10 border border-pink-500/20 hover:border-pink-500/40 transition-all hover:-translate-y-1 group relative overflow-hidden h-[320px] flex flex-col">
                       <div className="absolute inset-0 bg-noise opacity-10"></div>
                       <img src="https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=600&q=80" className="absolute right-[-20px] top-[-20px] w-40 h-40 object-cover rounded-2xl rotate-12 opacity-40 group-hover:opacity-60 transition-opacity" alt="Podcast" />
                       
                       <div className="mt-auto relative z-10">
                           <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-4">
                               <Mic2 className="w-6 h-6" />
                           </div>
                           <h3 className="text-2xl font-bold text-white mb-2">Podcasts</h3>
                           <div className="inline-block px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/60 mb-3 border border-white/5">Premium</div>
                           <p className="text-sm text-white/60 leading-relaxed">2–5 min narrative audio clips and mini-podcasts featuring AI voice clones.</p>
                       </div>
                   </div>

                   {/* Card 6: Analytics */}
                   <div className="rounded-3xl p-8 bg-gradient-to-br from-indigo-900/20 to-slate-900/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all hover:-translate-y-1 group relative overflow-hidden h-[320px] flex flex-col">
                       <div className="absolute inset-0 bg-noise opacity-10"></div>
                       <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" className="absolute right-[-20px] top-[-20px] w-40 h-40 object-cover rounded-2xl rotate-12 opacity-40 group-hover:opacity-60 transition-opacity" alt="Analytics" />
                       
                       <div className="mt-auto relative z-10">
                           <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                               <BarChart3 className="w-6 h-6" />
                           </div>
                           <h3 className="text-2xl font-bold text-white mb-2">Analytics</h3>
                           <div className="inline-block px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/60 mb-3 border border-white/5">Business+</div>
                           <p className="text-sm text-white/60 leading-relaxed">Deep tone reports, content tracking, and schedule performance views.</p>
                       </div>
                   </div>

               </div>
           </div>
        </section>

        {/* USE CASES */}
        <section id="business" className="py-6 bg-[#050505] border-t border-white/5">
             <div className="mx-auto max-w-6xl px-6">
                 <div className="text-center mb-10">
                     <h2 className="text-3xl font-medium tracking-tight text-white">Built for Every Kind of Brand</h2>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {[
                         { title: 'Enterprise', text: 'Weekly thought-leadership content — auto-published', color: 'bg-blue-500' },
                         { title: 'DTC Brands', text: 'Launch promos, community updates, and brand storytelling', color: 'bg-purple-500' },
                         { title: 'Creators', text: 'Daily social-ready output — no scripts, no cameras', color: 'bg-orange-500' },
                         { title: 'Casual Users', text: 'Rewritten blogs, summarised pods, and styled tweets on demand', color: 'bg-green-500' },
                     ].map((card, i) => (
                         <div key={i} className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all hover:-translate-y-1 group">
                             <div className={`w-10 h-10 ${card.color}/10 rounded-lg flex items-center justify-center mb-4 group-hover:${card.color}/20 transition-colors`}>
                                 <div className={`w-3 h-3 rounded-full ${card.color}`}></div>
                             </div>
                             <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                             <p className="text-sm text-white/50 leading-relaxed">{card.text}</p>
                         </div>
                     ))}
                 </div>
             </div>
        </section>

        {/* OBJECTION BREAKER & FINAL CTA */}
        <section className="py-8 bg-gradient-to-b from-[#050505] to-[#111] text-center px-6">
            <div className="max-w-3xl mx-auto mb-8">
                 <h2 className="text-2xl font-medium text-white mb-6">Still Not Sure If AIBC Business Is Right for You?</h2>
                 <p className="text-white/50 mb-8">Let AI analyze your brand first. See the magic before you commit.</p>
                 <div className="flex justify-center gap-4">
                     <button onClick={() => onNavigate(ViewState.INGESTION)} className="text-xs font-bold text-white border-b border-orange-500 pb-0.5 hover:text-orange-400 transition-colors">Scan My Brand</button>
                     <span className="text-white/20">•</span>
                     <button onClick={() => onNavigate(ViewState.SIGNIN)} className="text-xs font-bold text-white border-b border-white/20 pb-0.5 hover:text-white/80 transition-colors">Login</button>
                 </div>
            </div>

            <div className="max-w-4xl mx-auto bg-orange-600 rounded-[2rem] p-12 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                
                <div className="relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 leading-none">
                        Your Brand. Amplified. <br/> On Autopilot.
                    </h2>
                    <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                        Never hire a content marketer again. We do your strategy, writing, and content — start to publish.
                    </p>
                    <button 
                      onClick={() => onNavigate(ViewState.INGESTION)}
                      className="bg-white text-orange-600 px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-neutral-100 transition-colors shadow-2xl hover:scale-105 transform duration-200"
                    >
                        Start Free — Scan My Brand Now
                    </button>
                </div>
            </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#010204] pt-16 pb-8 text-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-orange-500/30 to-transparent"></div>
        
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 flex items-center justify-center text-white">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="12" />
                    <circle cx="50" cy="50" r="20" fill="currentColor" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">AIBC</span>
            </div>
            <p className="text-white/40 max-w-xs mb-6 text-xs leading-relaxed">
              Turning your digital footprint into a scalable content engine. Automated, authentic, and always on brand.
            </p>
            <div className="flex gap-3">
              <a href="#" className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"><Twitter className="h-3.5 w-3.5" strokeWidth={1.5} /></a>
              <a href="#" className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"><Github className="h-3.5 w-3.5" strokeWidth={1.5} /></a>
              <a href="#" className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"><Linkedin className="h-3.5 w-3.5" strokeWidth={1.5} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-3 text-white/40 text-xs font-medium">
              <li><a href="#" className="hover:text-orange-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Integrations</a></li>
              <li><button onClick={() => onNavigate(ViewState.PRICING)} className="hover:text-orange-400 transition-colors">Pricing</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3 text-white/40 text-xs font-medium">
              <li><a href="#" className="hover:text-orange-400 transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">API Docs</a></li>
            </ul>
          </div>

           <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-white/40 text-xs font-medium">
              <li><a href="#" className="hover:text-orange-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Legal</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-white/30 font-medium">
          <p>© 2024 AIBC Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Cookie Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;