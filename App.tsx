
import React, { useState, useEffect, useCallback } from 'react';
import LandingView from './components/LandingView';
import LoginView from './components/LoginView';
import SignInView from './components/SignInView';
import ResetPasswordView from './components/ResetPasswordView';
import IngestionView from './components/IngestionView';
import AuditView from './components/AuditView';
import OnboardingView from './components/OnboardingView';
import VectorsView from './components/VectorsView';
import DashboardView from './components/DashboardView';
import PricingView from './components/PricingView';
import AdminView from './components/AdminView';
import InboxView from './components/InboxView';
import BlogView from './components/BlogView';
import BlogPostView from './components/BlogPostView';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import TermsOfServiceView from './components/TermsOfServiceView';
import { ViewState } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

// URL path to view/page mapping
const URL_TO_VIEW: Record<string, { view: ViewState; page?: string }> = {
  '/': { view: ViewState.LANDING },
  '/pricing': { view: ViewState.PRICING },
  '/login': { view: ViewState.LOGIN },
  '/signin': { view: ViewState.SIGNIN },
  '/reset-password': { view: ViewState.RESET_PASSWORD },
  '/scan': { view: ViewState.INGESTION },
  '/audit': { view: ViewState.AUDIT },
  '/onboarding': { view: ViewState.ONBOARDING },
  '/dashboard': { view: ViewState.DASHBOARD, page: 'dashboard' },
  '/contenthub': { view: ViewState.DASHBOARD, page: 'contentHub' },
  '/strategy': { view: ViewState.DASHBOARD, page: 'strategy' },
  '/productionroom': { view: ViewState.DASHBOARD, page: 'production' },
  '/calendar': { view: ViewState.DASHBOARD, page: 'calendar' },
  '/brandassets': { view: ViewState.DASHBOARD, page: 'assets' },
  '/integrations': { view: ViewState.DASHBOARD, page: 'integrations' },
  '/competitors': { view: ViewState.DASHBOARD, page: 'competitors' },
  '/analytics': { view: ViewState.DASHBOARD, page: 'analytics' },
  '/settings': { view: ViewState.DASHBOARD, page: 'settings' },
  '/inbox': { view: ViewState.DASHBOARD, page: 'inbox' },
  '/admin': { view: ViewState.ADMIN },
  '/blog': { view: ViewState.BLOG },
  '/privacy-policy': { view: ViewState.PRIVACY_POLICY },
  '/terms-of-service': { view: ViewState.TERMS_OF_SERVICE },
};

// Page to URL mapping (for navigation)
const PAGE_TO_URL: Record<string, string> = {
  'dashboard': '/dashboard',
  'contentHub': '/contenthub',
  'strategy': '/strategy',
  'production': '/productionroom',
  'calendar': '/calendar',
  'assets': '/brandassets',
  'integrations': '/integrations',
  'competitors': '/competitors',
  'analytics': '/analytics',
  'settings': '/settings',
  'inbox': '/inbox',
};

function App() {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [dashboardPage, setDashboardPage] = useState<string>('dashboard');
  const [username, setUsername] = useState<string>('');
  const [scanType, setScanType] = useState<'basic' | 'deep'>('basic');
  const [isInitializing, setIsInitializing] = useState(true); // Start true to prevent flash
  const [blogSlug, setBlogSlug] = useState<string>('');

  // Parse URL on mount to determine initial view
  const getViewFromURL = useCallback(() => {
    const path = window.location.pathname.toLowerCase();
    const mapping = URL_TO_VIEW[path];
    if (mapping) {
      return mapping;
    }
    // Check for blog post route (e.g., /blog/some-post-slug)
    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '');
      return { view: ViewState.BLOG_POST, slug };
    }
    return { view: ViewState.LANDING };
  }, []);

  // Check authentication state on mount and restore session
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // DEV BYPASS: Allow access without auth on localhost for debugging
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const devBypass = isLocalDev && (window.location.search.includes('dev=true') || !isSupabaseConfigured());
        
        if (devBypass) {
          console.log('🔧 DEV BYPASS ENABLED - Skipping auth check (localhost + no Supabase config)');
          // Set fake auth for local testing
          localStorage.setItem('authToken', 'dev-bypass-token');
          localStorage.setItem('user', JSON.stringify({ email: 'dev@test.com', name: 'Dev User' }));
        }
        
        // First check localStorage for existing auth
        const authToken = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('user');
        const lastScanResults = localStorage.getItem('lastScanResults');
        
        // Parse URL to see if we should go to a specific page
        const urlMapping = getViewFromURL();
        
        // Handle public routes (no auth needed)
        if (urlMapping.view === ViewState.BLOG || urlMapping.view === ViewState.BLOG_POST ||
            urlMapping.view === ViewState.PRIVACY_POLICY || urlMapping.view === ViewState.TERMS_OF_SERVICE) {
          setView(urlMapping.view);
          if (urlMapping.view === ViewState.BLOG_POST && 'slug' in urlMapping) {
            setBlogSlug((urlMapping as any).slug);
          }
          setIsInitializing(false);
          return;
        }
        
        // If we have a token and user, they're authenticated
        if (authToken && userStr) {
          // If Supabase is configured, try to restore session
          if (isSupabaseConfigured() && supabase) {
            try {
              const { data: { session }, error } = await supabase.auth.getSession();
              
              if (error) {
                console.warn('Supabase session check error (continuing with local auth):', error.message);
                // Don't log out - keep local auth state
              }
              
              // If Supabase session exists, update local storage with fresh token
              if (session?.access_token) {
                localStorage.setItem('authToken', session.access_token);
                if (session.refresh_token) {
                  localStorage.setItem('refreshToken', session.refresh_token);
                }
              }
              // If no Supabase session but we have local auth, that's okay for local dev
            } catch (supabaseError) {
              console.warn('Supabase session restoration failed (continuing with local auth):', supabaseError);
              // Don't log out on Supabase errors
            }
          }
          
          // User is authenticated - check URL first, then fallback
          if (urlMapping.view === ViewState.DASHBOARD || urlMapping.page) {
            setView(ViewState.DASHBOARD);
            if (urlMapping.page) {
              setDashboardPage(urlMapping.page);
            }
          } else if (urlMapping.view === ViewState.PRICING) {
            setView(ViewState.PRICING);
          } else if (urlMapping.view === ViewState.BLOG || urlMapping.view === ViewState.BLOG_POST) {
            setView(urlMapping.view);
            if (urlMapping.view === ViewState.BLOG_POST && 'slug' in urlMapping) {
              setBlogSlug((urlMapping as any).slug);
            }
          } else if (urlMapping.view === ViewState.PRIVACY_POLICY || urlMapping.view === ViewState.TERMS_OF_SERVICE) {
            setView(urlMapping.view);
          } else if (urlMapping.view === ViewState.INGESTION) {
            // Only go to ingestion if explicitly navigating to /scan
            setView(ViewState.INGESTION);
          } else if (lastScanResults) {
            setView(ViewState.DASHBOARD);
            window.history.replaceState(null, '', '/dashboard');
          } else {
            // Default to landing page, not ingestion
            setView(ViewState.LANDING);
          }
        } else {
          // Not authenticated - only allow public pages
          if (urlMapping.view === ViewState.PRICING) {
            setView(ViewState.PRICING);
          } else if (urlMapping.view === ViewState.BLOG || urlMapping.view === ViewState.BLOG_POST) {
            setView(urlMapping.view);
            if (urlMapping.view === ViewState.BLOG_POST && 'slug' in urlMapping) {
              setBlogSlug((urlMapping as any).slug);
            }
          } else if (urlMapping.view === ViewState.PRIVACY_POLICY || urlMapping.view === ViewState.TERMS_OF_SERVICE) {
            setView(urlMapping.view);
          } else if (urlMapping.view === ViewState.LOGIN) {
            setView(ViewState.LOGIN);
          } else if (urlMapping.view === ViewState.SIGNIN) {
            setView(ViewState.SIGNIN);
          } else if (urlMapping.view === ViewState.RESET_PASSWORD) {
            setView(ViewState.RESET_PASSWORD);
          } else {
            // Stay on landing page
            setView(ViewState.LANDING);
          }
        }
      } catch (error) {
        console.error('Auth state check error:', error);
        // Don't log out on errors - preserve auth state
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuthState();
  }, [getViewFromURL]);

  // Load username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('lastScannedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);
  
  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlMapping = getViewFromURL();
      setView(urlMapping.view);
      if (urlMapping.page) {
        setDashboardPage(urlMapping.page);
      }
      if (urlMapping.view === ViewState.BLOG_POST && 'slug' in urlMapping) {
        setBlogSlug((urlMapping as any).slug);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getViewFromURL]);
  
  // Listen for auth state changes (Supabase events)
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only handle sign out events, not token refresh failures
      if (event === 'SIGNED_OUT') {
        // User explicitly signed out
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        setView(ViewState.LANDING);
      } else if (event === 'SIGNED_IN' && session) {
        // User signed in - update local storage
        localStorage.setItem('authToken', session.access_token);
        if (session.refresh_token) {
          localStorage.setItem('refreshToken', session.refresh_token);
        }
        localStorage.setItem('user', JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email,
        }));
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token refreshed - update local storage silently
        localStorage.setItem('authToken', session.access_token);
        if (session.refresh_token) {
          localStorage.setItem('refreshToken', session.refresh_token);
        }
      }
      // Ignore other events like INITIAL_SESSION, USER_UPDATED, PASSWORD_RECOVERY
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle Stripe checkout callbacks only (no hash routing to avoid auth issues)
  useEffect(() => {
    // Check for Stripe checkout completion
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      // Verify session and update subscription
      import('./services/stripeService').then(({ verifyCheckoutSession }) => {
        verifyCheckoutSession(sessionId).then(() => {
          // Redirect to dashboard after successful payment
          setView(ViewState.DASHBOARD);
          window.history.replaceState(null, '', window.location.pathname);
        }).catch(err => {
          console.error('Checkout verification error:', err);
        });
      });
    }
  }, []);

  const navigate = useCallback((newView: ViewState, page?: string) => {
    // Re-check auth state at navigation time (not from closure)
    const authToken = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const isLoggedIn = authToken && user;
    
    // #region agent log
    const navLog = {location:'App.tsx:276',message:'navigate CALLED',data:{newView,page,isLoggedIn,hasAuthToken:!!authToken,hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'app-navigate',hypothesisId:'H9'};
    console.log('[DEBUG]', navLog);
    fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(navLog)}).catch((e)=>console.warn('[DEBUG] Log fetch failed:',e));
    // #endregion
    
    // Public routes that are always accessible (even when logged in)
    const publicRoutes = [ViewState.PRICING, ViewState.BLOG, ViewState.BLOG_POST, ViewState.PRIVACY_POLICY, ViewState.TERMS_OF_SERVICE];
    
    // If user is logged in, restrict navigation
    if (isLoggedIn) {
      // Allow public routes
      if (publicRoutes.includes(newView)) {
        setView(newView);
        // Update URL based on view
        let newPath = '/';
        if (newView === ViewState.PRICING) newPath = '/pricing';
        else if (newView === ViewState.BLOG) newPath = '/blog';
        else if (newView === ViewState.BLOG_POST && page) newPath = `/blog/${page}`;
        else if (newView === ViewState.PRIVACY_POLICY) newPath = '/privacy-policy';
        else if (newView === ViewState.TERMS_OF_SERVICE) newPath = '/terms-of-service';
        window.history.pushState(null, '', newPath);
        window.scrollTo(0, 0);
        return;
      }
      
      // If trying to go to landing or login pages, redirect to ingestion
      if (newView === ViewState.LANDING || newView === ViewState.LOGIN || newView === ViewState.SIGNIN) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:295',message:'navigate REDIRECT - logged in user to ingestion',data:{attemptedView:newView},timestamp:Date.now(),sessionId:'debug-session',runId:'app-navigate',hypothesisId:'H9'})}).catch((e)=>console.warn('[DEBUG] Log fetch failed:',e));
        // #endregion
        setView(ViewState.INGESTION);
        window.history.pushState(null, '', '/scan');
        window.scrollTo(0, 0);
        return;
      }
      
      // Allow dashboard and ingestion for logged in users
      if (newView === ViewState.DASHBOARD || newView === ViewState.INGESTION || newView === ViewState.AUDIT || newView === ViewState.ONBOARDING) {
        // Allow these views
      } else {
        // Block other views - redirect to ingestion
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:308',message:'navigate BLOCKED - redirecting to ingestion',data:{attemptedView:newView},timestamp:Date.now(),sessionId:'debug-session',runId:'app-navigate',hypothesisId:'H9'})}).catch((e)=>console.warn('[DEBUG] Log fetch failed:',e));
        // #endregion
        setView(ViewState.INGESTION);
        window.history.pushState(null, '', '/scan');
        window.scrollTo(0, 0);
        return;
      }
    } else {
      // Not logged in - only allow public routes or auth routes
      if (!publicRoutes.includes(newView) && 
          newView !== ViewState.LOGIN && 
          newView !== ViewState.SIGNIN && 
          newView !== ViewState.RESET_PASSWORD &&
          newView !== ViewState.LANDING) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:320',message:'navigate BLOCKED - redirecting to login',data:{attemptedView:newView},timestamp:Date.now(),sessionId:'debug-session',runId:'app-navigate',hypothesisId:'H9'})}).catch((e)=>console.warn('[DEBUG] Log fetch failed:',e));
        // #endregion
        setView(ViewState.LOGIN);
        window.history.pushState(null, '', '/login');
        window.scrollTo(0, 0);
        return;
      }
    }
    
    setView(newView);
    
    // Update URL based on view
    let newPath = '/';
    if (newView === ViewState.PRICING) newPath = '/pricing';
    else if (newView === ViewState.LOGIN) newPath = '/login';
    else if (newView === ViewState.SIGNIN) newPath = '/signin';
    else if (newView === ViewState.RESET_PASSWORD) newPath = '/reset-password';
    else if (newView === ViewState.INGESTION) newPath = '/scan';
    else if (newView === ViewState.AUDIT) newPath = '/audit';
    else if (newView === ViewState.ONBOARDING) newPath = '/onboarding';
    else if (newView === ViewState.ADMIN) newPath = '/admin';
    else if (newView === ViewState.BLOG) newPath = '/blog';
    else if (newView === ViewState.DASHBOARD) {
      if (page) {
        setDashboardPage(page);
        newPath = PAGE_TO_URL[page] || '/dashboard';
      } else {
        newPath = '/dashboard';
      }
    }
    
    window.history.pushState(null, '', newPath);
    
    // Scroll to top on navigation
    window.scrollTo(0, 0);
  }, []);

  // Show minimal loading state while checking auth (prevents flash of landing page)
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }
  
  // Ensure we always render something - default to landing if view is invalid
  const currentView = Object.values(ViewState).includes(view as ViewState) ? view : ViewState.LANDING;
  
  return (
    <>
      {currentView === ViewState.LANDING && <LandingView onNavigate={navigate} />}
      {currentView === ViewState.LOGIN && <LoginView onNavigate={navigate} />}
      {currentView === ViewState.SIGNIN && <SignInView onNavigate={navigate} />}
      {currentView === ViewState.RESET_PASSWORD && <ResetPasswordView onNavigate={navigate} />}
      {currentView === ViewState.INGESTION && <IngestionView onNavigate={navigate} setUsername={setUsername} setScanType={setScanType} />}
      {currentView === ViewState.AUDIT && <AuditView onNavigate={navigate} username={username} scanType={scanType} />}
      {currentView === ViewState.ONBOARDING && <OnboardingView onNavigate={navigate} />}
      {currentView === ViewState.VECTORS && <VectorsView onNavigate={navigate} />}
      {currentView === ViewState.DASHBOARD && <DashboardView onNavigate={navigate} initialPage={dashboardPage} />}
      {currentView === ViewState.PRICING && <PricingView onNavigate={navigate} />}
      {currentView === ViewState.ADMIN && <AdminView onNavigate={navigate} />}
      {currentView === ViewState.INBOX && <InboxView onNavigate={navigate} />}
      {currentView === ViewState.BLOG && <BlogView onNavigate={navigate} />}
      {currentView === ViewState.BLOG_POST && <BlogPostView onNavigate={navigate} slug={blogSlug} />}
      {currentView === ViewState.PRIVACY_POLICY && <PrivacyPolicyView onNavigate={navigate} />}
      {currentView === ViewState.TERMS_OF_SERVICE && <TermsOfServiceView onNavigate={navigate} />}
    </>
  );
}

export default App;
