import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { signIn, signInWithGoogle, forgotPassword } from '../services/authClient';
import { initializeGoogleSignIn, renderGoogleButton, isGoogleLoaded, getGoogleClientId, loadGoogleScript } from '../services/googleOAuth';

const SignInView: React.FC<NavProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Initialize Google Sign-In
  useEffect(() => {
    const clientId = getGoogleClientId();
    
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID not set - Google sign-in will use fallback');
      return;
    }

    // Load Google script and initialize
    const initGoogle = async () => {
      try {
        await loadGoogleScript(clientId);
        
        if (isGoogleLoaded()) {
          initializeGoogleSignIn(
            clientId,
            async (credential: string) => {
              setLoading(true);
              setError('');
              try {
                const result = await signInWithGoogle(credential);
                if (result.success) {
                  // Check if user has completed onboarding
                  const hasCompletedOnboarding = localStorage.getItem('lastScannedUsername');
                  
                  // New users go to ingestion (onboarding), existing users go to dashboard
                  if (hasCompletedOnboarding) {
                    onNavigate(ViewState.DASHBOARD);
                  } else {
                    onNavigate(ViewState.INGESTION);
                  }
                } else {
                  setError(result.error || 'Failed to sign in with Google');
                }
              } catch (err: any) {
                setError(err.message || 'Google sign-in failed');
              } finally {
                setLoading(false);
              }
            },
            (error: string) => {
              console.error('Google sign-in error:', error);
              // Don't show error immediately - let user try clicking button
            }
          );

          // Render Google button after initialization
          setTimeout(() => {
            if (googleButtonRef.current && isGoogleLoaded()) {
              try {
                renderGoogleButton(googleButtonRef.current.id);
              } catch (err) {
                console.error('Failed to render Google button:', err);
              }
            }
          }, 300);
        }
      } catch (error: any) {
        console.error('Failed to initialize Google sign-in:', error);
        // Don't show error - fallback button will handle it
      }
    };

    // Start initialization after a short delay
    setTimeout(initGoogle, 500);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn(email, password);
      if (result.success) {
        onNavigate(ViewState.DASHBOARD);
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setError('');

    if (!forgotPasswordEmail) {
      setError('Email is required');
      setForgotPasswordLoading(false);
      return;
    }

    try {
      console.log('🔐 Forgot password form submitted for:', forgotPasswordEmail);
      const result = await forgotPassword(forgotPasswordEmail);
      console.log('🔐 Forgot password result:', result);
      
      if (result.success) {
        setForgotPasswordSent(true);
        setError(''); // Clear any previous errors
      } else {
        // Show the actual error from Supabase
        const errorMsg = result.error || 'Failed to send reset email. Please try again.';
        setError(errorMsg);
        console.error('❌ Password reset failed:', errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to send reset email. Please try again.';
      setError(errorMsg);
      console.error('❌ Password reset exception:', err);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div id="signin-view" className="fixed inset-0 z-[60] bg-[#050505] overflow-y-auto">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
          <button 
            onClick={() => setShowForgotPassword(false)}
            className="absolute top-6 left-6 flex items-center gap-2 text-xs font-medium text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="w-full max-w-[400px]">
            <div className="mb-8 flex items-center gap-2 justify-center">
              <div className="h-8 w-8 flex items-center justify-center text-white">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4" />
                  <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="4" />
                  <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="4" />
                  <circle cx="50" cy="50" r="6" fill="currentColor" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">AIBC</span>
            </div>

            {forgotPasswordSent ? (
              <>
                <h1 className="text-3xl font-serif font-medium tracking-tight text-center text-white mb-2">Reset your password</h1>
                <p className="text-center text-white/50 mb-8 text-sm">Enter your email and we'll send you a reset link.</p>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                  <p className="text-green-400 text-sm font-medium">Password reset email sent!</p>
                  <p className="text-green-400/80 text-xs mt-1">Check your email for instructions to reset your password.</p>
                </div>

                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordSent(false);
                    setForgotPasswordEmail('');
                  }}
                  className="w-full rounded-lg bg-[#FF5E1E] py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-[#FF5E1E]/90 transition-all"
                >
                  Back to Sign In
                </button>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-serif font-medium tracking-tight text-center text-white mb-2">Reset your password</h1>
                <p className="text-center text-white/50 mb-8 text-sm">Enter your email and we'll send you a reset link.</p>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Email</label>
                    <input 
                      type="email" 
                      placeholder="jenny@example.com" 
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                      className="w-full rounded-lg bg-[#0A0A0A] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={forgotPasswordLoading}
                    className="w-full rounded-lg bg-[#FF5E1E] py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-[#FF5E1E]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="signin-view" className="fixed inset-0 z-[60] bg-[#050505] overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
        <button 
          onClick={() => onNavigate(ViewState.LANDING)}
          className="absolute top-6 left-6 flex items-center gap-2 text-xs font-medium text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mb-8 flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center text-white">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4" />
              <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="4" />
              <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="4" />
              <circle cx="50" cy="50" r="6" fill="currentColor" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">AIBC</span>
        </div>

        <div className="w-full max-w-[400px]">
          <h1 className="text-3xl font-serif font-medium tracking-tight text-center text-white mb-2">Welcome back</h1>
          <p className="text-center text-white/50 mb-8 text-sm">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="mb-4">
            <div id="google-signin-button-signin" ref={googleButtonRef} className="w-full flex items-center justify-center min-h-[40px]">
              {/* Fallback button - shows while Google loads or if not configured */}
              <button
                onClick={async () => {
                  // Check if Supabase is configured - use Supabase OAuth
                  const { isSupabaseConfigured, supabase } = await import('../services/supabaseClient');
                  if (isSupabaseConfigured() && supabase) {
                    setLoading(true);
                    setError('');
                    try {
                      const result = await signInWithGoogle('');
                      if (!result.success) {
                        setError(result.error || 'Google sign-in failed');
                        setLoading(false);
                      }
                      // Will redirect, so don't set loading to false
                    } catch (err: any) {
                      setError(err.message || 'Google sign-in failed');
                      setLoading(false);
                    }
                    return;
                  }

                  // Fallback: Use Google Identity Services if configured
                  const clientId = getGoogleClientId();
                  if (!clientId) {
                    setError('Google sign-in is not configured. Please set VITE_GOOGLE_CLIENT_ID in Netlify environment variables.');
                    return;
                  }
                  
                  // Try to trigger Google sign-in manually if script is loaded
                  if (isGoogleLoaded() && window.google?.accounts?.id) {
                    try {
                      window.google.accounts.id.prompt();
                    } catch (err) {
                      setError('Please wait for Google sign-in to load and try again');
                    }
                  } else {
                    setError('Google sign-in is loading. Please wait a moment and try again.');
                  }
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-all hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.52 12.29C23.52 11.43 23.44 10.61 23.3 9.82H12V14.45H18.45C18.17 15.93 17.32 17.18 16.05 18.03V21.01H19.92C22.18 18.93 23.52 15.86 23.52 12.29Z" fill="#4285F4"></path>
                        <path d="M12 24C15.24 24 17.96 22.92 19.92 21.01L16.05 18.03C14.98 18.75 13.61 19.17 12 19.17C8.87 19.17 6.22 17.06 5.27 14.21H1.27V17.31C3.25 21.24 7.31 24 12 24Z" fill="#34A853"></path>
                        <path d="M5.27 14.21C5.03 13.49 4.9 12.74 4.9 12C4.9 11.26 5.03 10.51 5.27 9.79V6.69H1.27C0.46 8.3 0 10.1 0 12C0 13.9 0.46 15.7 1.27 17.31L5.27 14.21Z" fill="#FBBC05"></path>
                        <path d="M12 4.83C13.76 4.83 15.34 5.44 16.58 6.63L20.01 3.2C17.96 1.29 15.24 0 12 0C7.31 0 3.25 2.76 1.27 6.69L5.27 9.79C6.22 6.94 8.87 4.83 12 4.83Z" fill="#EA4335"></path>
                      </svg>
                      Continue with Google
                    </>
                  )}
              </button>
            </div>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Email</label>
              <input 
                type="email" 
                placeholder="jenny@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg bg-[#0A0A0A] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg bg-[#0A0A0A] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all" 
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-orange-500 hover:text-orange-400 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-lg bg-[#FF5E1E] py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-[#FF5E1E]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-white/40">
              Don't have an account? <button onClick={() => onNavigate(ViewState.LOGIN)} className="text-orange-500 hover:text-orange-400 font-medium transition-colors">Sign up</button>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInView;

