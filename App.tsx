
import React, { useState, useEffect } from 'react';
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

function App() {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [username, setUsername] = useState<string>('');
  const [scanType, setScanType] = useState<'basic' | 'deep'>('basic');
  const [isInitializing, setIsInitializing] = useState(false);

  // Load username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('lastScannedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // Handle hash routing for pricing and Stripe callbacks
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#pricing') {
        setView(ViewState.PRICING);
      }
    };

    handleHashChange();
    
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
