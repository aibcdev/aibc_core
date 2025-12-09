import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, LogOut, Camera, FileText as FileTextIcon } from 'lucide-react';
import { ViewState, NavProps } from '../../types';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';

const Navigation: React.FC<NavProps> = ({ onNavigate }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; initials: string } | null>(null);
  const [showAibcStreamDropdown, setShowAibcStreamDropdown] = useState(false);
  const aibcStreamRef = useRef<HTMLDivElement>(null);

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onNavigate(ViewState.LANDING)}
              className="flex items-center gap-2"
            >
              <span className="text-xl font-black text-white">AIBC</span>
              <span className="text-xl font-normal text-white">MEDIA</span>
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            </button>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => {
                if (window.location.pathname === '/' || window.location.hash === '') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  onNavigate(ViewState.LANDING);
                }
              }}
              className="text-sm font-bold text-white hover:text-orange-500 transition-colors"
            >
              HOME
            </button>
            <button 
              onClick={() => onNavigate(ViewState.PRICING)}
              className="text-sm font-bold text-white hover:text-orange-500 transition-colors"
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
              <button className="text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1">
                AIBC STREAM
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {/* Dropdown Modal */}
              {showAibcStreamDropdown && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-[500px] bg-[#0A0A0A] border border-white/20 rounded-xl shadow-2xl p-4 z-50">
                  <div className="flex flex-col gap-3">
                    {/* AI Streaming Channels */}
                    <a 
                      href="https://aibcstream.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-[#050505] border border-white/10 rounded-lg hover:bg-[#0A0A0A] transition-all group"
                    >
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Camera className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white mb-0.5 group-hover:text-purple-400 transition-colors">
                          AI Streaming Channels
                        </h3>
                        <p className="text-sm text-white/60">
                          Real-time video synthesis
                        </p>
                      </div>
                    </a>
                    
                    {/* CopyStream */}
                    <a 
                      href="https://copystream.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-[#050505] border border-white/10 rounded-lg hover:bg-[#0A0A0A] transition-all group"
                    >
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileTextIcon className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white mb-0.5 group-hover:text-blue-400 transition-colors">
                          CopyStream
                        </h3>
                        <p className="text-sm text-white/60">
                          AI content generation
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
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
                  className="text-sm text-white hover:text-orange-500 transition-colors"
                >
                  Log In
                </button>
                <button 
                  onClick={() => onNavigate(ViewState.INGESTION)}
                  className="px-4 py-2 bg-gray-800 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
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

