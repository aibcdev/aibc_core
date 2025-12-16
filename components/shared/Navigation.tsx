import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, LogOut, Camera, FileText as FileTextIcon, Play, TrendingUp, Globe } from 'lucide-react';
import { ViewState, NavProps } from '../../types';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';

const Navigation: React.FC<NavProps> = ({ onNavigate }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; initials: string } | null>(null);
  const [showAibcStreamDropdown, setShowAibcStreamDropdown] = useState(false);
  const aibcStreamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Check localStorage first (faster, works for local auth)
      const authToken = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');
      const isLoggedInLocal = !!(authToken && userStr);
      
      if (isLoggedInLocal) {
        setIsLoggedIn(true);
        try {
          const user = JSON.parse(userStr || '{}');
          const name = user.name || user.email || 'User';
          const email = user.email || '';
          const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
          setUserInfo({ name, email, initials });
        } catch (e) {
          setUserInfo({ name: 'User', email: '', initials: 'U' });
        }
      }
      
      // Also check Supabase if configured
      if (isSupabaseConfigured() && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsLoggedIn(true);
          const name = session.user.user_metadata?.name || session.user.email || 'User';
          const email = session.user.email || '';
          const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
          setUserInfo({ name, email, initials });
        } else if (!isLoggedInLocal) {
          setIsLoggedIn(false);
          setUserInfo(null);
        }

        supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            setIsLoggedIn(true);
            const name = session.user.user_metadata?.name || session.user.email || 'User';
            const email = session.user.email || '';
            const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
            setUserInfo({ name, email, initials });
          } else {
            // Only clear if Supabase session is gone AND no local auth
            const localAuth = !!(localStorage.getItem('authToken') && localStorage.getItem('user'));
            if (!localAuth) {
              setIsLoggedIn(false);
              setUserInfo(null);
            }
          }
        });
      } else if (!isLoggedInLocal) {
        setIsLoggedIn(false);
        setUserInfo(null);
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
      onNavigate(ViewState.LANDING);
    }
  };

  // Close AIBC Stream dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (aibcStreamRef.current && !aibcStreamRef.current.contains(event.target as Node)) {
        setShowAibcStreamDropdown(false);
      }
    };

    if (showAibcStreamDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAibcStreamDropdown]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] bg-[#050505]/95 backdrop-blur-xl border-b border-white/5">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                // #region agent log
                const navLog = {location:'Navigation.tsx:79',message:'LOGO clicked',data:{isLoggedIn},timestamp:Date.now(),sessionId:'debug-session',runId:'nav-click',hypothesisId:'H9'};
                console.log('[DEBUG]', navLog);
                fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(navLog)}).catch((e)=>console.warn('[DEBUG] Log fetch failed:',e));
                // #endregion
                if (isLoggedIn) {
                  // Authenticated users should go to ingestion page, not landing
                  onNavigate(ViewState.INGESTION);
                } else {
                  // Not authenticated - go to login
                  onNavigate(ViewState.LOGIN);
                }
              }}
              className="flex items-center gap-2"
            >
              <svg viewBox="0 0 100 100" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="4" />
                <circle cx="50" cy="50" r="34" stroke="white" strokeWidth="4" />
                <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="4" />
                <circle cx="50" cy="50" r="6" fill="#FF5E1E" />
              </svg>
              <span className="text-xl font-black text-white uppercase">AIBC</span>
            </button>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => {
                // #region agent log
                const navLog = {location:'Navigation.tsx:96',message:'HOME button clicked',data:{isLoggedIn,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'nav-click',hypothesisId:'H9'};
                console.log('[DEBUG]', navLog);
                fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(navLog)}).catch((e)=>console.warn('[DEBUG] Log fetch failed:',e));
                // #endregion
                if (isLoggedIn) {
                  // Authenticated users should go to ingestion page, not landing
                  onNavigate(ViewState.INGESTION);
                } else {
                  // Not authenticated - go to login
                  onNavigate(ViewState.LOGIN);
                }
              }}
              className="text-sm font-bold text-white hover:text-orange-500 transition-colors uppercase"
            >
              HOME
            </button>
            <button 
              onClick={() => {
                // #region agent log
                const navLog = {location:'Navigation.tsx:111',message:'BLOG button clicked',data:{isLoggedIn},timestamp:Date.now(),sessionId:'debug-session',runId:'nav-click',hypothesisId:'H9'};
                console.log('[DEBUG]', navLog);
                fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(navLog)}).catch((e)=>console.warn('[DEBUG] Log fetch failed:',e));
                // #endregion
                window.location.href = '/blog';
              }}
              className="text-sm font-bold text-white hover:text-orange-500 transition-colors uppercase"
            >
              BLOG
            </button>
            <button 
              onClick={() => {
                // #region agent log
                const navLog = {location:'Navigation.tsx:118',message:'PRICING button clicked',data:{isLoggedIn},timestamp:Date.now(),sessionId:'debug-session',runId:'nav-click',hypothesisId:'H9'};
                console.log('[DEBUG]', navLog);
                fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(navLog)}).catch((e)=>console.warn('[DEBUG] Log fetch failed:',e));
                // #endregion
                onNavigate(ViewState.PRICING);
              }}
              className="text-sm font-bold text-white hover:text-orange-500 transition-colors uppercase"
            >
              PRICING
            </button>
            {/* AIBC STREAM Dropdown */}
            <div 
              ref={aibcStreamRef}
              className="relative"
              onMouseEnter={() => setShowAibcStreamDropdown(true)}
              onMouseLeave={() => setShowAibcStreamDropdown(false)}
            >
              <a 
                href="https://aibroadcasting.xyz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-bold hover:text-orange-400 transition-colors flex items-center gap-1"
              >
                <span className="text-orange-500">AIBC</span>
                <span className="text-white">STREAM</span>
                <ChevronDown className="w-4 h-4 text-white" />
              </a>
              
              {/* Dropdown Modal - AI Streaming Channels Preview */}
              {showAibcStreamDropdown && (
                <>
                  {/* Invisible bridge to prevent gap */}
                  <div 
                    className="absolute top-full left-0 right-0 h-2"
                    onMouseEnter={() => setShowAibcStreamDropdown(true)}
                  ></div>
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[900px] bg-[#0A0A0A] border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50"
                    onMouseEnter={() => setShowAibcStreamDropdown(true)}
                    onMouseLeave={() => setShowAibcStreamDropdown(false)}
                  >
                  <div className="flex">
                    {/* Left Sidebar - Latest Generations */}
                    <div className="w-80 bg-[#050505] border-r border-white/10 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Latest Generations</h3>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="space-y-3">
                        {/* Generation Items */}
                        <a href="https://aibcstream.com" target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-white/5 transition-colors group">
                          <div className="text-[10px] font-bold text-blue-400 mb-1">CRYPTO MACRO</div>
                          <div className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Bitcoin Breaches $100k: Market Analysis Video</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-white/40">12:42 UTC</span>
                            <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] text-white/60">VIDEO 1:20</span>
                          </div>
                        </a>
                        <a href="https://aibcstream.com" target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-white/5 transition-colors group">
                          <div className="text-[10px] font-bold text-purple-400 mb-1">TECH EARNINGS</div>
                          <div className="text-sm font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">NVIDIA Q4 Earnings Call: AI Summary & Highlights</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-white/40">12:38 UTC</span>
                            <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] text-white/60">AUDIO 3:45</span>
                          </div>
                        </a>
                        <a href="https://aibcstream.com" target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-white/5 transition-colors group">
                          <div className="text-[10px] font-bold text-green-400 mb-1">REGULATION</div>
                          <div className="text-sm font-bold text-white mb-1 group-hover:text-green-400 transition-colors">SEC Approval Odds Increase: Legal Breakdown</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-white/40">12:15 UTC</span>
                            <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] text-white/60">VIDEO 2:10</span>
                          </div>
                        </a>
                        <a href="https://aibcstream.com" target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-white/5 transition-colors group">
                          <div className="text-[10px] font-bold text-blue-400 mb-1">DEFI</div>
                          <div className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Uniswap V4 Launch Date Confirmed</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-white/40">11:50 UTC</span>
                            <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] text-white/60">SHORT 0:45</span>
                          </div>
                        </a>
                      </div>
                    </div>

                    {/* Right Content - Video Player & Metrics */}
                    <div className="flex-1 p-4">
                      {/* Header */}
                      <div className="mb-4">
                        <h2 className="text-2xl font-black text-white uppercase mb-1">AI Streaming Channels</h2>
                        <p className="text-xs font-bold text-green-400 uppercase">/// Real-time video synthesis engine</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-white/60">
                          <span>ASSETS: <span className="text-white font-bold">8,240</span></span>
                          <span>SOURCES: <span className="text-white font-bold">1.2M</span></span>
                          <span>UPTIME: <span className="text-green-400 font-bold">99.99%</span></span>
                        </div>
                      </div>

                      {/* Video Player Preview */}
                      <div className="mb-4">
                        <div className="aspect-video bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-black rounded-lg border border-white/10 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20"></div>
                          <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all">
                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                          </div>
                        </div>
                        
                        {/* Live News Ticker */}
                        <div className="mt-3 flex items-center gap-2 bg-[#050505] rounded-lg p-2 border border-white/10">
                          <div className="px-3 py-1 bg-red-500 rounded text-xs font-bold text-white">LIVE NEWS</div>
                          <div className="flex-1 text-xs text-white/60 truncate">MARKET CLOSE: AI SECTOR LEADS RALLY AMID NEW REGULATI...</div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-white font-bold">BTC $98,230 <span className="text-green-400">▲ 2.4%</span></span>
                            <span className="text-white font-bold">ETH $4,102 <span className="text-green-400">▲ 1.8%</span></span>
                          </div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-[#050505] rounded-lg p-3 border border-white/10">
                          <div className="text-[10px] text-white/40 uppercase mb-1">Video Generations</div>
                          <div className="text-2xl font-bold text-white">100+</div>
                        </div>
                        <div className="bg-[#050505] rounded-lg p-3 border border-white/10">
                          <div className="text-[10px] text-white/40 uppercase mb-1">Active Users</div>
                          <div className="text-2xl font-bold text-white">22,000+</div>
                        </div>
                        <div className="bg-[#050505] rounded-lg p-3 border border-white/10">
                          <div className="text-[10px] text-white/40 uppercase mb-1">Content Strands</div>
                          <div className="text-2xl font-bold text-white">4</div>
                        </div>
                        <div className="bg-[#050505] rounded-lg p-3 border border-white/10">
                          <div className="text-[10px] text-white/40 uppercase mb-1">Languages</div>
                          <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-white">64</div>
                            <Globe className="w-4 h-4 text-white/40" />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section - Empty placeholder */}
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="p-3 bg-[#050505] border border-white/10 rounded-lg">
                          <div className="text-xs text-white/40 text-center">
                            More channels coming soon
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {isLoggedIn && userInfo ? (
              <>
                <button 
                  onClick={() => {
                    const hasCompletedOnboarding = localStorage.getItem('lastScannedUsername');
                    onNavigate(hasCompletedOnboarding ? ViewState.DASHBOARD : ViewState.INGESTION);
                  }}
                  className="text-sm text-white hover:text-orange-500 transition-colors"
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate(ViewState.SIGNIN)} 
                  className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-sm text-white hover:bg-white/10 hover:border-white/30 transition-all"
                >
                  Log In
                </button>
                <button 
                  onClick={() => onNavigate(ViewState.INGESTION)}
                  className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-sm text-white hover:bg-white/10 hover:border-white/30 transition-all"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

