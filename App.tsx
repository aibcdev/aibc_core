
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
import { ViewState } from './types';

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [username, setUsername] = useState<string>('');

  // Load username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('lastScannedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // Handle hash routing for pricing and password reset
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#pricing') {
        setView(ViewState.PRICING);
      } else if (window.location.hash === '#reset-password' || window.location.hash.includes('access_token')) {
        setView(ViewState.RESET_PASSWORD);
      }
    };

    handleHashChange();
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
      {view === ViewState.INGESTION && <IngestionView onNavigate={navigate} setUsername={setUsername} />}
      {view === ViewState.AUDIT && <AuditView onNavigate={navigate} username={username} />}
      {view === ViewState.VECTORS && <VectorsView onNavigate={navigate} />}
      {view === ViewState.DASHBOARD && <DashboardView onNavigate={navigate} />}
      {view === ViewState.PRICING && <PricingView onNavigate={navigate} />}
    </>
  );
}
