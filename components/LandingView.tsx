import React, { useState } from 'react';
import { 
  ArrowRight, Play, Star, Code2, 
  Database, User, Globe, Braces, 
  ShieldCheck, Lock, Server, Mic, Sparkles, Bot, Twitter, 
  Github, Linkedin, Image as ImageIcon, Footprints, Cpu, Sliders, 
  BrainCircuit, FileText, FileCheck, Archive, Video, Mic2, BarChart3,
  Zap, MessageSquareText, Sparkles as SparklesIcon, MessageCircle,
  ChevronDown, Triangle, X
} from 'lucide-react';
import { ViewState, NavProps } from '../types';

const LandingView: React.FC<NavProps> = ({ onNavigate }) => {
  const [showSampleModal, setShowSampleModal] = useState(false);

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
              
              {/* AIBC Stream Dropdown */}
              <div className="group relative">
                <button 
                  className="flex items-center gap-1 text-sm font-bold text-white hover:text-orange-500 transition-colors uppercase tracking-wide focus:outline-none"
                  onClick={() => window.open('https://aibroadcasting.xyz', '_blank', 'noopener,noreferrer')}
                >
                  AIBC Stream
                  <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-orange-500 transition-colors" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-[600px] origin-top opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out transform group-hover:translate-y-0 translate-y-2 z-50">
                  <div className="bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl shadow-black overflow-hidden ring-1 ring-white/5">
                    
                    {/* Live Feed Header */}
                    <div className="border-b border-white/10 p-3 bg-gradient-to-r from-red-600/20 to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
                          <span className="text-[10px] font-mono text-white/80 uppercase tracking-wider">Live Feed</span>
                        </div>
                        <div className="text-[10px] font-mono text-white/60">
                          <span className="text-white/40">Minutes Watched: </span>
                          <span className="text-emerald-400 font-semibold">30,000+</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dropdown Header */}
                    <div className="border-b border-white/10 p-4 flex items-end justify-between bg-[#111]/50">
                      <div>
                        <h2 className="text-xl font-semibold tracking-tight text-white mb-1 uppercase">AI Streaming Channels</h2>
                        <div className="flex items-center gap-2 text-emerald-500 font-mono text-[10px] tracking-wide">
                          <span>///</span>
                          <span>REAL-TIME VIDEO SYNTHESIS ENGINE</span>
                        </div>
                      </div>
                      <a 
                        href="https://aibroadcasting.xyz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors underline"
                      >
                        aibroadcasting.xyz
                      </a>
                    </div>
                    
                    <div className="grid grid-cols-12 min-h-[350px]">
                      
                      {/* Left Sidebar: Latest Generations */}
                      <div className="col-span-5 border-r border-white/10 bg-[#050505]/50 flex flex-col">
                        <div className="p-2.5 border-b border-white/10 flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 pl-1">Latest Generations</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse mr-2"></div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          
                          {/* List Item 1 */}
                          <div className="group/item p-3 hover:bg-white/5 cursor-pointer border-b border-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-mono text-blue-400 font-medium uppercase">Crypto Macro</span>
                              <span className="text-[10px] font-mono text-white/30">12:42 UTC</span>
                            </div>
                            <h3 className="text-xs font-medium text-white/70 group-hover/item:text-white leading-snug mb-2">Bitcoin Breaches $100k: Market Analysis Video</h3>
                            <div className="flex gap-2">
                              <span className="px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-mono text-white/40 bg-white/5">VIDEO</span>
                              <span className="px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-mono text-white/40 bg-white/5">1:20</span>
                            </div>
                          </div>
                          
                          {/* List Item 2 */}
                          <div className="group/item p-3 hover:bg-white/5 cursor-pointer border-b border-white/10 transition-colors bg-white/5">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-mono text-fuchsia-400 font-medium uppercase">Tech Earnings</span>
                              <span className="text-[10px] font-mono text-white/30">12:38 UTC</span>
                            </div>
                            <h3 className="text-xs font-medium text-white leading-snug mb-2">NVIDIA Q4 Earnings Call: AI Summary & Highlights</h3>
                            <div className="flex gap-2">
                              <span className="px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-mono text-white/40 bg-white/5">AUDIO</span>
                              <span className="px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-mono text-white/40 bg-white/5">3:45</span>
                            </div>
                          </div>
                          
                          {/* List Item 3 */}
                          <div className="group/item p-3 hover:bg-white/5 cursor-pointer border-b border-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-mono text-emerald-400 font-medium uppercase">Regulation</span>
                              <span className="text-[10px] font-mono text-white/30">12:15 UTC</span>
                            </div>
                            <h3 className="text-xs font-medium text-white/70 group-hover/item:text-white leading-snug mb-2">SEC Approval Odds Increase: Legal Breakdown</h3>
                            <div className="flex gap-2">
                              <span className="px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-mono text-white/40 bg-white/5">VIDEO</span>
                              <span className="px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-mono text-white/40 bg-white/5">2:10</span>
                            </div>
                          </div>
                          
                          {/* List Item 4 */}
                          <div className="group/item p-3 hover:bg-white/5 cursor-pointer transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-mono text-violet-400 font-medium uppercase">Defi</span>
                              <span className="text-[10px] font-mono text-white/30">11:50 UTC</span>
                            </div>
                            <h3 className="text-xs font-medium text-white/70 group-hover/item:text-white leading-snug mb-2">Uniswap V4 Launch Date Confirmed</h3>
                            <div className="flex gap-2">
                              <span className="px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-mono text-white/40 bg-white/5">SHORT</span>
                              <span className="px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-mono text-white/40 bg-white/5">0:45</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Content: Video & Stats */}
                      <div className="col-span-7 p-3 flex flex-col gap-3 bg-[#050505]">
                        
                        {/* Video Player Area */}
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 group/video cursor-pointer">
                          {/* Background Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-black"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                          
                          {/* Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-20 h-20">
                              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-xl blur-xl opacity-40 animate-pulse"></div>
                              <div className="relative z-10 w-full h-full rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover/video:scale-105 transition-transform duration-300">
                                <Play className="w-8 h-8 text-white fill-white ml-1" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Live Ticker Bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-9 bg-black/80 backdrop-blur border-t border-white/10 flex items-center">
                            <div className="h-full px-2.5 bg-red-600 flex items-center justify-center">
                              <div className="flex flex-col items-center leading-none">
                                <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Live</span>
                                <span className="text-[8px] font-bold text-white uppercase tracking-tighter">News</span>
                              </div>
                            </div>
                            <div className="flex-1 overflow-hidden relative mx-2">
                              <div className="text-[9px] font-mono text-white/70 whitespace-nowrap uppercase tracking-wide">
                                MARKET CLOSE: AI SECTOR LEADS RALLY AMID NEW REGULATION TALKS
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pr-2.5 border-l border-white/10 pl-2.5 h-full">
                              <div className="flex flex-col leading-none">
                                <div className="flex items-center gap-1">
                                  <span className="text-[8px] font-mono text-emerald-500">BTC</span>
                                  <span className="text-[8px] font-mono text-emerald-500">$98,230</span>
                                  <Triangle className="w-1 h-1 fill-emerald-500 text-emerald-500 rotate-0" />
                                </div>
                                <span className="text-[8px] font-mono text-white/40 text-right">2.4%</span>
                              </div>
                              <div className="flex flex-col leading-none">
                                <div className="flex items-center gap-1">
                                  <span className="text-[8px] font-mono text-emerald-500">ETH</span>
                                  <span className="text-[8px] font-mono text-emerald-500">$4,102</span>
                                  <Triangle className="w-1 h-1 fill-emerald-500 text-emerald-500 rotate-0" />
                                </div>
                                <span className="text-[8px] font-mono text-white/40 text-right">1.8%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bottom Stats Grid */}
                        <div className="grid grid-cols-4 gap-3 mt-auto">
                          <div className="p-2.5 rounded border border-white/10 bg-white/5">
                            <div className="text-[8px] font-mono text-white/40 uppercase tracking-wide mb-1">Video Generations</div>
                            <div className="text-lg font-semibold text-white tracking-tight">100+</div>
                          </div>
                          <div className="p-2.5 rounded border border-white/10 bg-white/5">
                            <div className="text-[8px] font-mono text-white/40 uppercase tracking-wide mb-1">Active Users</div>
                            <div className="text-lg font-semibold text-white tracking-tight">22,000+</div>
                          </div>
                          <div className="p-2.5 rounded border border-white/10 bg-white/5">
                            <div className="text-[8px] font-mono text-white/40 uppercase tracking-wide mb-1">Content Strands</div>
                            <div className="text-lg font-semibold text-white tracking-tight">4</div>
                          </div>
                          <div className="p-2.5 rounded border border-white/10 bg-white/5 relative">
                            <div className="text-[8px] font-mono text-white/40 uppercase tracking-wide mb-1">Languages</div>
                            <div className="text-lg font-semibold text-white tracking-tight">64</div>
                            <div className="absolute bottom-1.5 right-1.5">
                              <Globe className="w-2.5 h-2.5 text-white/30" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate(ViewState.LOGIN)} 
              className="hidden md:block text-sm font-bold text-white/60 hover:text-white transition-colors uppercase tracking-wide whitespace-nowrap"
            >
              LOG IN
            </button>
            <button 
              onClick={() => onNavigate(ViewState.LOGIN)} 
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 uppercase tracking-wide whitespace-nowrap"
            >
              GET STARTED
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 px-4 sm:px-6 lg:px-8 overflow-hidden" role="main" itemScope itemType="https://schema.org/WebPage">
        
        {/* HERO SECTION */}
        <section id="home" className="mx-auto max-w-7xl mb-4 relative" aria-label="Hero section" itemScope itemType="https://schema.org/WebPageElement">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Content */}
            <div className="relative z-10 pt-8 lg:pt-0">
              <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-sans font-medium tracking-tight text-white leading-[1.1] mb-8" itemProp="headline">
                Never Hire a <br />
                <span className="text-orange-500">Marketing Employee</span> Again.
              </h1>
              
              <p className="text-lg text-[#888] max-w-lg mb-10 leading-relaxed font-light" itemProp="description">
                Using our highly trained AI agents, we scan your digital footprint and give you automated content based on how you talk, write, and post. Whether you're a large business, or creator, we have the model to remove the guesswork out of creatives, to save you time and money.
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
                
                <button 
                  onClick={() => setShowSampleModal(true)}
                  className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all text-sm font-medium text-white/80 hover:text-white flex items-center gap-2"
                >
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
                      alt="AIBC platform user - content creator testimonial" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {/* Creator 2 */}
                  <div className="w-10 h-10 rounded-full border-2 border-black relative z-40 overflow-hidden bg-[#1a1a1a]">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
                      alt="AIBC platform user - marketing professional testimonial" 
                      className="w-full h-full object-cover"
                      loading="lazy"
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
                      alt="AIBC platform user - business owner testimonial"
                      loading="lazy" 
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
                      alt="AI-powered content generation visualization - AIBC platform interface"
                      loading="lazy" 
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

        {/* OUTPUT COMPARISON - NIKE.COM SAMPLE */}
        <section className="py-6 border-t border-white/5 bg-[#050505] relative">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-medium tracking-tight text-white">High Fidelity Output</h2>
              <p className="mt-3 text-white/50 text-base">Sample output from <span className="text-orange-400 font-semibold">Nike.com</span> digital footprint scan.</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl">
              <div className="flex border-b border-white/10 bg-white/5 backdrop-blur">
                <div className="flex-1 px-5 py-3 text-[10px] font-bold text-white/40 border-r border-white/10 flex items-center justify-between">
                  <span>INPUT: nike.com</span>
                  <Globe className="h-3 w-3" strokeWidth={1.5} />
                </div>
                <div className="flex-1 px-5 py-3 text-[10px] font-bold text-orange-400 bg-orange-500/5 flex items-center justify-between">
                  <span>OUTPUT: BRAND DNA & CONTENT</span>
                  <span className="text-[9px] text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> Analyzed</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row min-h-[400px]">
                {/* Brand DNA Output */}
                <div className="flex-1 p-6 border-r border-white/10 bg-[#050505]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Nike Brand DNA</div>
                        <div className="text-[10px] text-white/40">Extracted from digital footprint</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="w-full rounded-xl bg-white/5 border border-white/5 p-4">
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Brand Archetype</div>
                        <p className="text-sm font-semibold text-white">The Hero</p>
                      </div>
                      
                      <div className="w-full rounded-xl bg-white/5 border border-white/5 p-4">
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Voice & Tone</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-300 text-[10px] font-medium border border-orange-500/20">Empowering</span>
                          <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-300 text-[10px] font-medium border border-orange-500/20">Motivational</span>
                          <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-300 text-[10px] font-medium border border-orange-500/20">Bold</span>
                        </div>
                      </div>
                      
                      <div className="w-full rounded-xl bg-white/5 border border-white/5 p-4">
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Core Pillars</div>
                        <ul className="text-xs text-white/80 space-y-1 mt-2">
                          <li>• Just Do It - Action-oriented messaging</li>
                          <li>• Innovation & Performance</li>
                          <li>• Athlete Empowerment</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Generated Content Output */}
                <div className="flex-1 p-6 bg-[#080808] relative overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                        <span className="text-[9px] text-white/40 font-bold">AIBC</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Generated Content</div>
                        <div className="text-[10px] text-white/40">Brand-voice matched</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="w-full rounded-xl bg-white/5 border border-white/5 p-4">
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">LinkedIn Post</div>
                        <p className="text-[13px] text-white/90 leading-relaxed font-serif mb-2">
                          Your limits are just suggestions. 🏃‍♂️
                        </p>
                        <p className="text-[13px] text-white/80 leading-relaxed font-serif">
                          Every breakthrough starts with a single step. At Nike, we don't just make products—we build the tools that help athletes push beyond what they thought possible.
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">Brand Match: 94%</span>
                        </div>
                      </div>
                      
                      <div className="w-full rounded-xl bg-white/5 border border-white/5 p-4">
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Instagram Caption</div>
                        <p className="text-[13px] text-white/90 leading-relaxed font-serif">
                          Just Do It. ✨
                          <br /><br />
                          Because greatness isn't found in comfort zones. It's built in the moments when you choose to push harder, run faster, jump higher.
                          <br /><br />
                          #JustDoIt #Nike
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT EVOLVED SECTION */}
        <section className="py-24 bg-[#030303] relative overflow-hidden">
          {/* Grid Background */}
          <div 
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
              backgroundSize: '40px 40px',
              backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
              maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
            }}
          ></div>

          <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-20 flex flex-col items-center text-center">
              <h1 className="text-4xl font-semibold tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Content, evolved.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-white/70">
                Transform raw ideas into multi-channel campaigns.<br className="hidden sm:block" />
                A unified operating system for modern creators.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 h-auto md:h-[600px]">
              {/* Card 1: Thread Composer (Large Vertical) */}
              <div className="group relative row-span-2 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl transition-all hover:bg-zinc-900/60">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                
                {/* Content UI Mockup */}
                <div className="relative flex-1 overflow-hidden p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-start gap-3 opacity-60">
                      <div className="h-6 w-6 rounded-full bg-zinc-700 flex-shrink-0"></div>
                      <div className="space-y-2 w-full">
                        <div className="h-2 w-1/3 rounded bg-zinc-700"></div>
                        <div className="h-16 w-full rounded-lg bg-zinc-800/50 border border-white/5 p-3">
                          <div className="h-2 w-3/4 rounded bg-zinc-700 mb-2"></div>
                          <div className="h-2 w-1/2 rounded bg-zinc-700"></div>
                        </div>
                      </div>
                    </div>
                    {/* Active Message */}
                    <div className="flex items-start gap-3 transition-transform duration-500 group-hover:-translate-y-1">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex-shrink-0">
                        <SparklesIcon className="h-3 w-3" />
                      </div>
                      <div className="w-full space-y-3">
                        <div className="relative overflow-hidden rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 shadow-inner">
                          <p className="text-xs leading-relaxed text-indigo-100/90 font-mono">
                            Generating thread structure...<br />
                            <span className="text-indigo-400">1. Hook:</span> The hidden cost of latency.<br />
                            <span className="text-indigo-400">2. Body:</span> Why milliseconds matter.<br />
                            <span className="text-indigo-400">3. CTA:</span> Download the benchmark report.
                          </p>
                          <div className="mt-2 h-3 w-1 bg-indigo-500 animate-pulse"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-6 w-16 rounded-full bg-white/5 border border-white/5"></div>
                          <div className="h-6 w-12 rounded-full bg-white/5 border border-white/5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative p-6 border-t border-white/5 bg-white/[0.01]">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquareText className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-sm font-medium text-white">Thread Composer</h3>
                  </div>
                  <p className="text-xs text-zinc-500">Auto-convert blogs into viral threads.</p>
                </div>
              </div>

              {/* Card 2: Analytics (Wide Top) */}
              <div className="group relative col-span-1 md:col-span-2 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl transition-all hover:bg-zinc-900/60">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                
                <div className="flex h-full flex-col sm:flex-row">
                  <div className="flex flex-col justify-between p-6 sm:w-1/2 z-10">
                    <div>
                      <div className="mb-3 inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400">
                        +124% Growth
                      </div>
                      <h3 className="text-lg font-medium tracking-tight text-white">Predictive Analytics</h3>
                      <p className="mt-2 text-sm text-zinc-500">
                        Forecast engagement before you hit publish. Our models train on millions of data points.
                      </p>
                    </div>
                  </div>
                  <div className="relative min-h-[160px] flex-1 overflow-hidden sm:w-1/2">
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-6 pb-6 pt-12 gap-2 h-full">
                      <div className="w-full bg-emerald-500/10 rounded-t-sm h-[30%] group-hover:h-[45%] transition-all duration-700 ease-out border-t border-x border-emerald-500/20"></div>
                      <div className="w-full bg-emerald-500/10 rounded-t-sm h-[50%] group-hover:h-[65%] transition-all duration-700 delay-75 ease-out border-t border-x border-emerald-500/20"></div>
                      <div className="w-full bg-emerald-500/10 rounded-t-sm h-[40%] group-hover:h-[50%] transition-all duration-700 delay-100 ease-out border-t border-x border-emerald-500/20"></div>
                      <div className="w-full bg-emerald-500/10 rounded-t-sm h-[70%] group-hover:h-[85%] transition-all duration-700 delay-150 ease-out border-t border-x border-emerald-500/20 relative">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-800 text-[10px] text-white py-1 px-2 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity delay-300">
                          2.4k
                        </div>
                      </div>
                      <div className="w-full bg-emerald-500/10 rounded-t-sm h-[60%] group-hover:h-[75%] transition-all duration-700 delay-200 ease-out border-t border-x border-emerald-500/20"></div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                  </div>
                </div>
              </div>

              {/* Card 3: Auto-Shorts (Small) */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl transition-all hover:bg-zinc-900/60">
                <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="relative h-32 w-full overflow-hidden border-b border-white/5 bg-black/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-32 rounded-lg bg-zinc-800/50 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-blue-500/10"></div>
                      <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg group-hover:bg-white/20 transition-colors">
                        <Play className="h-3 w-3 text-white ml-0.5 fill-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-1/3 bg-rose-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-medium text-white">Auto-Shorts</h3>
                  <p className="mt-1 text-xs text-zinc-500">Long-form to viral clips in seconds.</p>
                </div>
              </div>

              {/* Card 4: Voice Synthesis (Small) */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl transition-all hover:bg-zinc-900/60">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="relative h-32 w-full flex items-center justify-center gap-1 border-b border-white/5 bg-black/20 px-8">
                  <div className="h-4 w-1 bg-orange-500/40 rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
                  <div className="h-8 w-1 bg-orange-500/60 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]"></div>
                  <div className="h-12 w-1 bg-orange-500/80 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]"></div>
                  <div className="h-6 w-1 bg-orange-500/60 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                  <div className="h-10 w-1 bg-orange-500/50 rounded-full animate-[pulse_1.1s_ease-in-out_infinite]"></div>
                  <div className="h-4 w-1 bg-orange-500/30 rounded-full animate-[pulse_0.9s_ease-in-out_infinite]"></div>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-medium text-white">Voice Synthesis</h3>
                  <p className="mt-1 text-xs text-zinc-500">Ultra-realistic AI voiceovers.</p>
                </div>
              </div>
            </div>

            {/* Bottom Feature Bar */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Integration Marquee */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Native Integrations</h3>
                <div className="relative w-full overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                  <div className="flex w-[200%] gap-8 animate-scroll-left">
                    <div className="flex items-center gap-8 text-zinc-400">
                      <Github className="h-5 w-5" />
                      <MessageCircle className="h-5 w-5" />
                      <Twitter className="h-5 w-5" />
                      <ImageIcon className="h-5 w-5" />
                      <Video className="h-5 w-5" />
                      <Linkedin className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-8 text-zinc-400">
                      <Github className="h-5 w-5" />
                      <MessageCircle className="h-5 w-5" />
                      <Twitter className="h-5 w-5" />
                      <ImageIcon className="h-5 w-5" />
                      <Video className="h-5 w-5" />
                      <Linkedin className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl">
                <div className="relative z-10">
                  <h3 className="text-lg font-medium text-white">Start Building</h3>
                  <p className="text-xs text-zinc-400 mt-1">14-day free trial. No credit card required.</p>
                </div>
                <div className="relative z-10">
                  <button 
                    onClick={() => onNavigate(ViewState.LOGIN)}
                    className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </main>
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
                   <h2 className="text-3xl font-medium tracking-tight text-white mb-4">Exactly What You'll Get Each Month</h2>
                   <div className="h-1 w-20 bg-orange-500 rounded-full"></div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   
                   {/* Card 1: Text Posts */}
                   <div className="rounded-2xl p-8 bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border border-cyan-500/30 hover:border-cyan-500/50 transition-all hover:-translate-y-1 group relative overflow-hidden h-[300px] flex flex-col">
                       <div className="absolute inset-0 opacity-20">
                           <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                       </div>
                       <div className="absolute right-[-20px] top-[-20px] w-32 h-32 opacity-30">
                           <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-transparent rounded-2xl rotate-12"></div>
                       </div>
                       
                       <div className="mt-auto relative z-10">
                           <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                               <FileText className="w-6 h-6 text-white" />
                           </div>
                           <h3 className="text-2xl font-bold text-white mb-2">Text Posts</h3>
                           <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-[11px] text-white/70 mb-3 border border-white/10">All Tiers</div>
                           <p className="text-sm text-white/70 leading-relaxed">Threads, captions, newsletters, and short-form posts optimized for engagement.</p>
                       </div>
                   </div>

                   {/* Card 2: Articles */}
                   <div className="rounded-2xl p-8 bg-gradient-to-br from-emerald-900/30 to-green-900/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group relative overflow-hidden h-[300px] flex flex-col">
                       <div className="absolute inset-0 opacity-20">
                           <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                       </div>
                       <div className="absolute right-[-20px] top-[-20px] w-32 h-32 opacity-30">
                           <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-transparent rounded-2xl rotate-12"></div>
                       </div>
                       
                       <div className="mt-auto relative z-10">
                           <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                               <FileCheck className="w-6 h-6 text-white" />
                           </div>
                           <h3 className="text-2xl font-bold text-white mb-2">Articles</h3>
                           <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-[11px] text-white/70 mb-3 border border-white/10">Pro & Premium</div>
                           <p className="text-sm text-white/70 leading-relaxed">Blogs, op-eds, and PR-ready long-form content SEO-tuned for your niche.</p>
                       </div>
                   </div>

                   {/* Card 3: Short Videos */}
                   <div className="rounded-2xl p-8 bg-gradient-to-br from-purple-900/30 to-fuchsia-900/20 border border-purple-500/30 hover:border-purple-500/50 transition-all hover:-translate-y-1 group relative overflow-hidden h-[300px] flex flex-col">
                       <div className="absolute inset-0 opacity-20">
                           <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                       </div>
                       <div className="absolute right-[-20px] top-[-20px] w-32 h-32 opacity-30">
                           <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-2xl rotate-12 flex items-center justify-center">
                               <Play className="w-8 h-8 text-white/20" />
                           </div>
                       </div>
                       
                       <div className="mt-auto relative z-10">
                           <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                               <Video className="w-6 h-6 text-white" />
                           </div>
                           <h3 className="text-2xl font-bold text-white mb-2">Short Videos</h3>
                           <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-[11px] text-white/70 mb-3 border border-white/10">Premium</div>
                           <p className="text-sm text-white/70 leading-relaxed">15s-30s reels, promos, and social shorts generated from your text content.</p>
                       </div>
                   </div>

                   {/* Card 4: Explainer Videos */}
                   <div className="rounded-2xl p-8 bg-gradient-to-br from-orange-900/30 to-amber-900/20 border border-orange-500/30 hover:border-orange-500/50 transition-all hover:-translate-y-1 group relative overflow-hidden h-[300px] flex flex-col">
                       <div className="absolute inset-0 opacity-20">
                           <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                       </div>
                       <div className="absolute right-[-20px] top-[-20px] w-32 h-32 opacity-30">
                           <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-transparent rounded-2xl rotate-12"></div>
                       </div>
                       
                       <div className="mt-auto relative z-10">
                           <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                               <Play className="w-6 h-6 text-white" />
                           </div>
                           <h3 className="text-2xl font-bold text-white mb-2">Explainer Videos</h3>
                           <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-[11px] text-white/70 mb-3 border border-white/10">Premium</div>
                           <p className="text-sm text-white/70 leading-relaxed">30s-3m deep-dive brand explainers and tutorials.</p>
                       </div>
                   </div>

                   {/* Card 5: Podcasts */}
                   <div className="rounded-2xl p-8 bg-gradient-to-br from-pink-900/30 to-rose-900/20 border border-pink-500/30 hover:border-pink-500/50 transition-all hover:-translate-y-1 group relative overflow-hidden h-[300px] flex flex-col">
                       <div className="absolute inset-0 opacity-20">
                           <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                       </div>
                       <div className="absolute right-[-20px] top-[-20px] w-32 h-32 opacity-30">
                           <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-transparent rounded-2xl rotate-12"></div>
                       </div>
                       
                       <div className="mt-auto relative z-10">
                           <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                               <Mic2 className="w-6 h-6 text-white" />
                           </div>
                           <h3 className="text-2xl font-bold text-white mb-2">Podcasts</h3>
                           <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-[11px] text-white/70 mb-3 border border-white/10">Premium</div>
                           <p className="text-sm text-white/70 leading-relaxed">2-5 min narrative audio clips and mini-podcasts featuring AI voice clones.</p>
                       </div>
                   </div>

                   {/* Card 6: Analytics */}
                   <div className="rounded-2xl p-8 bg-gradient-to-br from-indigo-900/30 to-blue-900/20 border border-indigo-500/30 hover:border-indigo-500/50 transition-all hover:-translate-y-1 group relative overflow-hidden h-[300px] flex flex-col">
                       <div className="absolute inset-0 opacity-20">
                           <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                       </div>
                       <div className="absolute right-[-20px] top-[-20px] w-32 h-32 opacity-30">
                           <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-transparent rounded-2xl rotate-12 flex items-center justify-center">
                               <BarChart3 className="w-8 h-8 text-white/20" />
                           </div>
                       </div>
                       
                       <div className="mt-auto relative z-10">
                           <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                               <BarChart3 className="w-6 h-6 text-white" />
                           </div>
                           <h3 className="text-2xl font-bold text-white mb-2">Analytics</h3>
                           <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-[11px] text-white/70 mb-3 border border-white/10">Business+</div>
                           <p className="text-sm text-white/70 leading-relaxed">Deep tone reports, content tracking, and schedule performance views.</p>
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
                     <button onClick={() => onNavigate(ViewState.LOGIN)} className="text-xs font-bold text-white border-b border-white/20 pb-0.5 hover:text-white/80 transition-colors">Login</button>
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
                <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4" />
                  <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="4" />
                  <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="4" />
                  <circle cx="50" cy="50" r="6" fill="currentColor" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">AIBC</span>
            </div>
            <p className="text-white/40 max-w-xs mb-6 text-xs leading-relaxed">
              Turning your digital footprint into a scalable content engine. Automated, authentic, and always on brand.
            </p>
            <div className="flex gap-3">
              <a href="https://x.com/aibc" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"><Twitter className="h-3.5 w-3.5" strokeWidth={1.5} /></a>
              <a href="https://github.com/aibc" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"><Github className="h-3.5 w-3.5" strokeWidth={1.5} /></a>
              <a href="https://linkedin.com/company/aibc" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"><Linkedin className="h-3.5 w-3.5" strokeWidth={1.5} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-3 text-white/40 text-xs font-medium">
              <li><a href="#features" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-orange-400 transition-colors cursor-pointer">Features</a></li>
              <li><button onClick={() => onNavigate(ViewState.DASHBOARD)} className="hover:text-orange-400 transition-colors text-left">Integrations</button></li>
              <li><button onClick={() => onNavigate(ViewState.PRICING)} className="hover:text-orange-400 transition-colors text-left">Pricing</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3 text-white/40 text-xs font-medium">
              <li><a href="https://aibroadcasting.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">Community</a></li>
              <li><button onClick={() => onNavigate(ViewState.HELPCENTER)} className="hover:text-orange-400 transition-colors text-left">Help Center</button></li>
              <li><a href="https://docs.aibcmedia.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">API Docs</a></li>
            </ul>
          </div>

           <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-white/40 text-xs font-medium">
              <li><a href="mailto:hello@aibcmedia.com" className="hover:text-orange-400 transition-colors">About</a></li>
              <li><a href="mailto:careers@aibcmedia.com" className="hover:text-orange-400 transition-colors">Careers</a></li>
              <li><a href="mailto:legal@aibcmedia.com" className="hover:text-orange-400 transition-colors">Legal</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-white/30 font-medium">
          <p>© 2024 AIBC Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="mailto:legal@aibcmedia.com" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="mailto:legal@aibcmedia.com" className="hover:text-white transition-colors">Terms of Service</a>
            <button onClick={() => {}} className="hover:text-white transition-colors">Cookie Settings</button>
          </div>
        </div>
      </footer>

      {/* Sample Output Modal */}
      {showSampleModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSampleModal(false);
            }
          }}
          style={{ animation: 'fadeIn 0.3s ease-in' }}
        >
          <div className="relative bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setShowSampleModal(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Content */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-medium tracking-tight text-white mb-2">Sample Output</h2>
                <p className="text-white/50 text-base">Digital footprint scan results from <span className="text-orange-400 font-semibold">Nike.com</span></p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#050505] overflow-hidden shadow-xl">
                <div className="flex border-b border-white/10 bg-white/5 backdrop-blur">
                  <div className="flex-1 px-5 py-3 text-[10px] font-bold text-white/40 border-r border-white/10 flex items-center justify-between">
                    <span>INPUT: nike.com</span>
                    <Globe className="h-3 w-3" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 px-5 py-3 text-[10px] font-bold text-orange-400 bg-orange-500/5 flex items-center justify-between">
                    <span>OUTPUT: BRAND DNA & CONTENT</span>
                    <span className="text-[9px] text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> Analyzed</span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row min-h-[400px]">
                  {/* Brand DNA Output */}
                  <div className="flex-1 p-6 border-r border-white/10 bg-[#050505]">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Nike Brand DNA</div>
                          <div className="text-[10px] text-white/40">Extracted from digital footprint</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="w-full rounded-xl bg-white/5 border border-white/5 p-4">
                          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Brand Archetype</div>
                          <p className="text-sm font-semibold text-white">The Hero</p>
                        </div>
                        
                        <div className="w-full rounded-xl bg-white/5 border border-white/5 p-4">
                          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Voice & Tone</div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-300 text-[10px] font-medium border border-orange-500/20">Empowering</span>
                            <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-300 text-[10px] font-medium border border-orange-500/20">Motivational</span>
                            <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-300 text-[10px] font-medium border border-orange-500/20">Bold</span>
                          </div>
                        </div>
                        
                        <div className="w-full rounded-xl bg-white/5 border border-white/5 p-4">
                          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Core Pillars</div>
                          <ul className="text-xs text-white/80 space-y-1 mt-2">
                            <li>• Just Do It - Action-oriented messaging</li>
                            <li>• Innovation & Performance</li>
                            <li>• Athlete Empowerment</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Generated Content Output */}
                  <div className="flex-1 p-6 bg-[#080808] relative overflow-hidden">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                          <span className="text-[9px] text-white/40 font-bold">AIBC</span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Generated Content</div>
                          <div className="text-[10px] text-white/40">Brand-voice matched</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="w-full rounded-xl bg-white/5 border border-white/5 p-4">
                          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">LinkedIn Post</div>
                          <p className="text-[13px] text-white/90 leading-relaxed font-serif mb-2">
                            Your limits are just suggestions. 🏃‍♂️
                          </p>
                          <p className="text-[13px] text-white/80 leading-relaxed font-serif">
                            Every breakthrough starts with a single step. At Nike, we don't just make products—we build the tools that help athletes push beyond what they thought possible.
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">Brand Match: 94%</span>
                          </div>
                        </div>
                        
                        <div className="w-full rounded-xl bg-white/5 border border-white/5 p-4">
                          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Instagram Caption</div>
                          <p className="text-[13px] text-white/90 leading-relaxed font-serif">
                            Just Do It. ✨
                            <br /><br />
                            Because greatness isn't found in comfort zones. It's built in the moments when you choose to push harder, run faster, jump higher.
                            <br /><br />
                            #JustDoIt #Nike
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    setShowSampleModal(false);
                    onNavigate(ViewState.LOGIN);
                  }}
                  className="px-8 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
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