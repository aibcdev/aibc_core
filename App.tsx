
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
import { ViewState } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [username, setUsername] = useState<string>('');
  const [scanType, setScanType] = useState<'basic' | 'deep'>('basic');

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

  return (
    <>
      {view === ViewState.LANDING && <LandingView onNavigate={navigate} />}
      {view === ViewState.LOGIN && <LoginView onNavigate={navigate} />}
      {view === ViewState.SIGNIN && <SignInView onNavigate={navigate} />}
      {view === ViewState.RESET_PASSWORD && <ResetPasswordView onNavigate={navigate} />}
      {view === ViewState.INGESTION && <IngestionView onNavigate={navigate} setUsername={setUsername} setScanType={setScanType} />}
      {view === ViewState.AUDIT && <AuditView onNavigate={navigate} username={username} scanType={scanType} />}
      {view === ViewState.VECTORS && <VectorsView onNavigate={navigate} />}
      {view === ViewState.DASHBOARD && <DashboardView onNavigate={navigate} />}
      {view === ViewState.PRICING && <PricingView onNavigate={navigate} />}
      {view === ViewState.ADMIN && <AdminView onNavigate={navigate} />}
    </>
  );
}
