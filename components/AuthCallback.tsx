import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseAuth';
import { ViewState } from '../types';

/**
 * Handles OAuth callback from Supabase
 * This component should be rendered at /auth/callback route
 */
const AuthCallback: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase automatically handles the OAuth callback
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          onNavigate(ViewState.LOGIN);
          return;
        }

        if (session) {
          // Successfully authenticated
          // Redirect to ingestion or dashboard
          onNavigate(ViewState.INGESTION);
        } else {
          // No session found
          onNavigate(ViewState.LOGIN);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        onNavigate(ViewState.LOGIN);
      }
    };

    handleAuthCallback();
  }, [onNavigate]);

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/60 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

