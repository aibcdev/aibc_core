import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { resetPassword } from '../services/authClient';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const ResetPasswordView: React.FC<NavProps> = ({ onNavigate }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  // Check for Supabase session on mount
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      // Check if we have a valid password reset session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsValidSession(true);
        } else {
          // Check URL hash for Supabase token
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const type = hashParams.get('type');
          
          if (accessToken && type === 'recovery') {
            // Set the session from the token
            supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            }).then(() => {
              setIsValidSession(true);
            });
          } else {
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
        }
      });
    } else {
      // Fallback: check for token in URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        setIsValidSession(true);
      } else {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      let result;
      
      if (isSupabaseConfigured() && supabase) {
        // Use Supabase password reset
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          setError(updateError.message || 'Failed to reset password');
          setLoading(false);
          return;
        }

        result = { success: true };
      } else {
        // Fallback to backend API
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token') || '';
        result = await resetPassword(token, newPassword);
      }

      if (result.success) {
        setSuccess(true);
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          onNavigate(ViewState.SIGNIN);
        }, 2000);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession && !error) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#050505] overflow-y-auto">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <Loader2 className="w-8 h-8 animate-spin text-white/40 mb-4" />
          <p className="text-white/60 text-sm">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#050505] overflow-y-auto">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
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

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl font-serif font-medium text-white mb-2">Password Reset Successful!</h1>
              <p className="text-green-400/80 text-sm mb-4">Your password has been updated. Redirecting to sign in...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
        <button 
          onClick={() => onNavigate(ViewState.SIGNIN)}
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

          <h1 className="text-3xl font-serif font-medium tracking-tight text-center text-white mb-2">Reset your password</h1>
          <p className="text-center text-white/50 mb-8 text-sm">Enter your new password below</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">New Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg bg-[#0A0A0A] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Confirm Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg bg-[#0A0A0A] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-lg bg-[#FF5E1E] py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-[#FF5E1E]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordView;

import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { resetPassword } from '../services/authClient';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const ResetPasswordView: React.FC<NavProps> = ({ onNavigate }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  // Check for Supabase session on mount
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      // Check if we have a valid password reset session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsValidSession(true);
        } else {
          // Check URL hash for Supabase token
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const type = hashParams.get('type');
          
          if (accessToken && type === 'recovery') {
            // Set the session from the token
            supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            }).then(() => {
              setIsValidSession(true);
            });
          } else {
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
        }
      });
    } else {
      // Fallback: check for token in URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        setIsValidSession(true);
      } else {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      let result;
      
      if (isSupabaseConfigured() && supabase) {
        // Use Supabase password reset
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          setError(updateError.message || 'Failed to reset password');
          setLoading(false);
          return;
        }

        result = { success: true };
      } else {
        // Fallback to backend API
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token') || '';
        result = await resetPassword(token, newPassword);
      }

      if (result.success) {
        setSuccess(true);
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          onNavigate(ViewState.SIGNIN);
        }, 2000);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession && !error) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#050505] overflow-y-auto">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <Loader2 className="w-8 h-8 animate-spin text-white/40 mb-4" />
          <p className="text-white/60 text-sm">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#050505] overflow-y-auto">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
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

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl font-serif font-medium text-white mb-2">Password Reset Successful!</h1>
              <p className="text-green-400/80 text-sm mb-4">Your password has been updated. Redirecting to sign in...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
        <button 
          onClick={() => onNavigate(ViewState.SIGNIN)}
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

          <h1 className="text-3xl font-serif font-medium tracking-tight text-center text-white mb-2">Reset your password</h1>
          <p className="text-center text-white/50 mb-8 text-sm">Enter your new password below</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">New Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg bg-[#0A0A0A] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Confirm Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg bg-[#0A0A0A] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-lg bg-[#FF5E1E] py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-[#FF5E1E]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordView;

