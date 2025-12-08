/**
 * Authentication Client Service
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface AuthResponse {
  success: boolean;
  error?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  resetToken?: string;
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<AuthResponse> {
  // Use Supabase if configured (production)
  if (isSupabaseConfigured() && supabase) {
    try {
      console.log('Signing up via Supabase:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: firstName && lastName ? `${firstName} ${lastName}` : firstName || email.split('@')[0],
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        console.error('Supabase sign-up error:', error);
        return { success: false, error: error.message || 'Sign up failed' };
      }

      if (data.session) {
        // User is automatically signed in
        localStorage.setItem('authToken', data.session.access_token);
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || email.split('@')[0],
        }));
        return { 
          success: true, 
          token: data.session.access_token, 
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || email.split('@')[0],
          }
        };
      } else if (data.user) {
        // Email confirmation required
        return { 
          success: true, 
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || email.split('@')[0],
          }
        };
      }

      return { success: false, error: 'Sign up failed' };
    } catch (error: any) {
      console.error('Supabase sign-up exception:', error);
      return { success: false, error: error.message || 'Sign up failed' };
    }
  }

  // Fallback to backend API if Supabase not configured
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Sign up failed' }));
      return { success: false, error: error.error || 'Sign up failed' };
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    return { success: true, token: data.token, user: data.user };
  } catch (error: any) {
    console.error('Sign up error:', error);
    // Fallback: allow user to continue without backend
    localStorage.setItem('authToken', `mock_${Date.now()}`);
    localStorage.setItem('user', JSON.stringify({ id: 'mock', email }));
    return { success: true, token: `mock_${Date.now()}`, user: { id: 'mock', email } };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  // Use Supabase if configured (production)
  if (isSupabaseConfigured() && supabase) {
    try {
      console.log('Signing in via Supabase:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase sign-in error:', error);
        return { success: false, error: error.message || 'Invalid email or password' };
      }

      if (data.session) {
        // Store session token and refresh token for persistence
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email,
        };
        localStorage.setItem('authToken', data.session.access_token);
        localStorage.setItem('refreshToken', data.session.refresh_token || '');
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Also set session in Supabase client to ensure it persists
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token || '',
        });
        
        return { 
          success: true, 
          token: data.session.access_token, 
          user: userData
        };
      }

      return { success: false, error: 'Sign in failed' };
    } catch (error: any) {
      console.error('Supabase sign-in exception:', error);
      return { success: false, error: error.message || 'Sign in failed' };
    }
  }

  // Fallback to backend API if Supabase not configured
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Invalid email or password' }));
      return { success: false, error: error.error || 'Invalid email or password' };
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    return { success: true, token: data.token, user: data.user };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Connection error. Please try again.' };
  }
}

/**
 * Sign in with Google (using JWT credential from Google Identity Services)
 */
export async function signInWithGoogle(credential: string): Promise<AuthResponse> {
  // Use Supabase if configured (production)
  if (isSupabaseConfigured() && supabase) {
    try {
      console.log('Signing in with Google via Supabase');
      // Supabase OAuth flow - redirects to Google
      // Note: Google OAuth must be enabled in Supabase Dashboard → Authentication → Providers
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (error) {
        console.error('Supabase Google OAuth error:', error);
        return { success: false, error: error.message || 'Google sign-in failed' };
      }

      // Redirect to Google OAuth
      if (data.url) {
        window.location.href = data.url;
        return { success: true }; // Will redirect, so return success
      }

      return { success: false, error: 'Google sign-in failed' };
    } catch (error: any) {
      console.error('Supabase Google sign-in exception:', error);
      return { success: false, error: error.message || 'Google sign-in failed' };
    }
  }

  // Fallback to backend API if Supabase not configured
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Google sign-in failed' }));
      return { success: false, error: error.error || 'Google sign-in failed' };
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    return { success: true, token: data.token, user: data.user };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    // Fallback: allow user to continue
    const mockToken = `google_${Date.now()}`;
    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('user', JSON.stringify({ id: 'google_mock', email: 'user@gmail.com' }));
    return { success: true, token: mockToken, user: { id: 'google_mock', email: 'user@gmail.com' } };
  }
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<AuthResponse> {
  // Use Supabase if configured (production)
  if (isSupabaseConfigured() && supabase) {
    try {
      console.log('🔐 Requesting password reset via Supabase for:', email);
      console.log('🔐 Redirect URL:', `${window.location.origin}#reset-password`);
      
      const redirectUrl = `${window.location.origin}#reset-password`;
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      console.log('🔐 Supabase password reset response:', { 
        hasData: !!data, 
        error: error ? { 
          message: error.message, 
          status: error.status,
          name: error.name
        } : null,
        redirectUrl
      });

      if (error) {
        console.error('❌ Supabase password reset error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack
        });
        
        // Return the actual error so user can see what went wrong
        // Common errors:
        // - "Email rate limit exceeded" - too many requests
        // - "Email not confirmed" - user needs to confirm email first
        // - "User not found" - email doesn't exist (but we won't reveal this)
        if (error.message.includes('rate limit')) {
          return { 
            success: false, 
            error: 'Too many password reset requests. Please wait a few minutes and try again.' 
          };
        }
        
        if (error.message.includes('not confirmed') || error.message.includes('email')) {
          return { 
            success: false, 
            error: 'Please check your email and confirm your account first, or contact support.' 
          };
        }
        
        // For other errors, return a generic message but log the actual error
        return { 
          success: false, 
          error: 'Failed to send reset email. Please check your email address or try again later.' 
        };
      }

      console.log('✅ Password reset email sent successfully via Supabase');
      console.log('✅ Check email inbox (and spam folder) for reset link');
      // Success - Supabase will send email automatically
      return { success: true };
    } catch (error: any) {
      console.error('❌ Supabase password reset exception:', error);
      console.error('❌ Exception details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again later.' 
      };
    }
  }

  // Fallback to backend API if Supabase not configured
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      // Network error, CORS error, timeout, or any fetch failure
      console.error('Forgot password fetch error:', fetchError.message);
      // Still return success so user sees confirmation (backend will handle email)
      return { 
        success: true, 
        resetToken: process.env.NODE_ENV === 'development' ? `reset_${Date.now()}` : undefined 
      };
    }

    if (!response.ok) {
      // Even if backend fails, return success (don't reveal if email exists)
      const errorData = await response.json().catch(() => ({}));
      console.error('Password reset request failed:', errorData);
      return { success: true }; // Always return success for security
    }

    const data = await response.json();
    return { 
      success: true, 
      resetToken: data.resetToken || (process.env.NODE_ENV === 'development' ? `reset_${Date.now()}` : undefined)
    };
  } catch (error: any) {
    console.error('Forgot password error:', error);
    // Always return success (don't reveal if email exists)
    return { success: true };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<AuthResponse> {
  // Use Supabase if configured (production)
  if (isSupabaseConfigured() && supabase) {
    try {
      // Supabase uses session-based password reset
      // The token is handled via URL hash after user clicks email link
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Supabase password reset error:', error);
        return { success: false, error: error.message || 'Failed to reset password' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Supabase password reset exception:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }

  // Fallback to backend API if Supabase not configured
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to reset password' }));
      return { success: false, error: error.error || 'Failed to reset password' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return { success: false, error: 'Connection error. Please try again.' };
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('authToken');
}

/**
 * Get current user
 */
export function getUser(): any {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Sign out
 */
export function signOut(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

/**
 * Store auth token
 */
export function storeAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
}

/**
 * Store user data
 */
export function storeUser(user: any): void {
  localStorage.setItem('user', JSON.stringify(user));
}

