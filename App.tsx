
import React, { useState, useEffect } from 'react';
import LandingView from './components/LandingView';
import LoginView from './components/LoginView';
import SignInView from './components/SignInView';
import IngestionView from './components/IngestionView';
import AuditView from './components/AuditView';
import VectorsView from './components/VectorsView';
import DashboardView from './components/DashboardView';
import PricingView from './components/PricingView';
import HelpCenterView from './components/HelpCenterView';
import { ViewState } from './types';
import { isAuthenticated } from './services/authClient';

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

  // Check authentication state on mount
  useEffect(() => {
    // If user is authenticated and on landing page, redirect to dashboard
    if (isAuthenticated() && view === ViewState.LANDING) {
      // Don't auto-redirect - let user choose
      // But if they try to access protected routes, check auth
    }
  }, [view]);

  // Handle hash routing for pricing page
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#pricing') {
        setView(ViewState.PRICING);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newView: ViewState) => {
    // Protect routes that require authentication
    const protectedRoutes = [
      ViewState.DASHBOARD,
      ViewState.INGESTION,
      ViewState.AUDIT,
      ViewState.VECTORS
    ];

    if (protectedRoutes.includes(newView) && !isAuthenticated()) {
      // Redirect to login if trying to access protected route without auth
      setView(ViewState.LOGIN);
      return;
    }

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
      {view === ViewState.INGESTION && <IngestionView onNavigate={navigate} setUsername={setUsername} />}
      {view === ViewState.AUDIT && <AuditView onNavigate={navigate} username={username} />}
      {view === ViewState.VECTORS && <VectorsView onNavigate={navigate} />}
      {view === ViewState.DASHBOARD && <DashboardView onNavigate={navigate} />}
      {view === ViewState.PRICING && <PricingView onNavigate={navigate} />}
      {view === ViewState.HELPCENTER && <HelpCenterView onNavigate={navigate} />}
    </>
  );
}
