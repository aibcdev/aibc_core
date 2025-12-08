
import React, { useState, useEffect } from 'react';
import LandingView from './components/LandingView';
import LoginView from './components/LoginView';
import SignInView from './components/SignInView';
import ResetPasswordView from './components/ResetPasswordView';
import IngestionView from './components/IngestionView';
import AuditView from './components/AuditView';
import VectorsView from './components/VectorsView';
import DashboardView from './components/DashboardView';
import PricingView from './components/PricingView';
import AdminView from './components/AdminView';
import InboxView from './components/InboxView';
import { ViewState } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [username, setUsername] = useState<string>('');
  const [scanType, setScanType] = useState<'basic' | 'deep'>('basic');
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for existing session on mount (persist login across refreshes)
  // Only run once on mount, not on every view change
  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      // Run session check in background - don't block rendering
      if (isSupabaseConfigured() && supabase) {
        try {
          // First, check for existing session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session && !error && mounted) {
            // User is logged in - restore session
            const userData = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email,
            };
            
            localStorage.setItem('authToken', session.access_token);
            localStorage.setItem('refreshToken', session.refresh_token || '');
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Only redirect on initial load if on landing page
            if (view === ViewState.LANDING) {
              const hasCompletedOnboarding = localStorage.getItem('lastScannedUsername');
              if (hasCompletedOnboarding) {
                setView(ViewState.DASHBOARD);
              } else {
                setView(ViewState.INGESTION);
              }
            }
          } else if (mounted) {
            // No active Supabase session - try to restore from localStorage
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('authToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');
            
            if (storedUser && storedToken && storedRefreshToken) {
              // Try to refresh the session using the stored refresh token
              try {
                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
                  refresh_token: storedRefreshToken
                });
                
                if (refreshData.session && !refreshError) {
                  // Successfully refreshed session
                  const userData = JSON.parse(storedUser);
                  localStorage.setItem('authToken', refreshData.session.access_token);
                  localStorage.setItem('refreshToken', refreshData.session.refresh_token || '');
                  localStorage.setItem('user', JSON.stringify(userData));
                  
                  // Only redirect on initial load if on landing page
                  if (view === ViewState.LANDING) {
                    const hasCompletedOnboarding = localStorage.getItem('lastScannedUsername');
                    if (hasCompletedOnboarding) {
                      setView(ViewState.DASHBOARD);
                    } else {
                      setView(ViewState.INGESTION);
                    }
                  }
                } else {
                  // Refresh failed - clear stale data
                  localStorage.removeItem('user');
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('refreshToken');
                }
              } catch (refreshErr) {
                console.error('Error refreshing session:', refreshErr);
                // Keep user data for now - don't log out on refresh error
              }
            } else if (storedUser && !storedToken) {
              // No token but has user data - clear it
              localStorage.removeItem('user');
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
            }
          }
          
          // Set up auth state listener to persist session changes (only once)
          if (mounted) {
            supabase.auth.onAuthStateChange((event, session) => {
              if (session) {
                const userData = {
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.name || session.user.email,
                };
                localStorage.setItem('authToken', session.access_token);
                localStorage.setItem('refreshToken', session.refresh_token || '');
                localStorage.setItem('user', JSON.stringify(userData));
              } else if (event === 'SIGNED_OUT') {
                localStorage.removeItem('user');
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
              }
            });
          }
        } catch (err) {
          console.error('Error checking session:', err);
          // On error, don't change view - let current view render
          // Don't set error state - just log it and continue
        }
      }
    };
    
    // Run session check in background without blocking
    checkSession();
    
    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  // Load username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('lastScannedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // Handle hash routing for pricing, password reset, and OAuth callbacks
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#pricing') {
        setView(ViewState.PRICING);
      } else if (window.location.hash === '#reset-password' || window.location.hash.includes('access_token')) {
        setView(ViewState.RESET_PASSWORD);
      }
    };

    // Check for Supabase OAuth callback
    const checkSupabaseAuth = async () => {
      if (isSupabaseConfigured() && supabase) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        if (accessToken && refreshToken && type === 'recovery') {
          // Password reset callback - handled by ResetPasswordView
          return;
        }
        
        if (accessToken && refreshToken) {
          // Supabase OAuth callback - set session
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (!error && data.session) {
              localStorage.setItem('authToken', data.session.access_token);
              localStorage.setItem('user', JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.email,
              }));
              
              // Check if user has completed onboarding (has scanned username)
              const hasCompletedOnboarding = localStorage.getItem('lastScannedUsername');
              
              // New users go to ingestion (onboarding), existing users go to dashboard
              if (hasCompletedOnboarding) {
                setView(ViewState.DASHBOARD);
              } else {
                setView(ViewState.INGESTION);
              }
              
              // Clean up URL
              window.history.replaceState(null, '', window.location.pathname);
            }
          } catch (err) {
            console.error('Error setting Supabase session:', err);
          }
        }
      }
    };

    handleHashChange();
    checkSupabaseAuth();
    
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
    
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newView: ViewState) => {
    setView(newView);
    // Update URL hash for pricing
    if (newView === ViewState.PRICING) {
      window.location.hash = 'pricing';
    } else if (window.location.hash === '#pricing') {
      window.location.hash = '';
    }
  };

  // Always render views immediately - no loading screen blocking
  // Session check happens in background and doesn't block rendering
  
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
      {currentView === ViewState.VECTORS && <VectorsView onNavigate={navigate} />}
      {currentView === ViewState.DASHBOARD && <DashboardView onNavigate={navigate} />}
      {currentView === ViewState.PRICING && <PricingView onNavigate={navigate} />}
      {currentView === ViewState.ADMIN && <AdminView onNavigate={navigate} />}
      {currentView === ViewState.INBOX && <InboxView onNavigate={navigate} />}
    </>
  );
}
