
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
import { ViewState } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

function App() {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [username, setUsername] = useState<string>('');
  const [scanType, setScanType] = useState<'basic' | 'deep'>('basic');
  const [isInitializing, setIsInitializing] = useState(true); // Start true to prevent flash

  // Check authentication state on mount and restore session
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // First check localStorage for existing auth
        const authToken = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('user');
        const lastScanResults = localStorage.getItem('lastScanResults');
        
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
          
          // User is authenticated - go to appropriate page
          if (lastScanResults) {
            setView(ViewState.DASHBOARD);
          } else {
            setView(ViewState.INGESTION);
          }
        }
        // If no auth token, stay on landing page (default)
      } catch (error) {
        console.error('Auth state check error:', error);
        // Don't log out on errors - preserve auth state
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuthState();
  }, []);

  // Load username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('lastScannedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);
  
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

  const navigate = useCallback((newView: ViewState) => {
    // Re-check auth state at navigation time (not from closure)
    const authToken = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const isLoggedIn = authToken && user;
    
    // If user is logged in and tries to go to landing page, redirect to dashboard
    // This protects against accidental navigation to landing while authenticated
    // If auth was cleared (logout), this check will pass and allow landing
    if (newView === ViewState.LANDING && isLoggedIn) {
      // Auth still exists - don't go to landing, go to dashboard instead
      setView(ViewState.DASHBOARD);
      window.scrollTo(0, 0);
      return;
    }
    
    setView(newView);
    
    // DON'T use window.location.hash for pricing - it can cause auth state issues
    // Just use React state for navigation
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
      {currentView === ViewState.DASHBOARD && <DashboardView onNavigate={navigate} />}
      {currentView === ViewState.PRICING && <PricingView onNavigate={navigate} />}
      {currentView === ViewState.ADMIN && <AdminView onNavigate={navigate} />}
      {currentView === ViewState.INBOX && <InboxView onNavigate={navigate} />}
    </>
  );
}

export default App;
