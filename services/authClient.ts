const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  tier: 'free' | 'pro' | 'business' | 'premium';
  credits: number;
  createdAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  isNewUser?: boolean;
  error?: string;
  message?: string;
  resetToken?: string; // Only in development
}

/**
 * Sign up with email/password
 */
export async function signUp(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    if (!response.ok) {
      // If backend is unavailable, use client-side fallback
      if (response.status === 0 || response.status >= 500) {
        return signUpFallback(email, password, firstName, lastName);
      }
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Backend unavailable - use client-side fallback
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      return signUpFallback(email, password, firstName, lastName);
    }
    return {
      success: false,
      error: error.message || 'Failed to sign up',
    };
  }
}

/**
 * Client-side fallback for sign up (when backend unavailable)
 */
function signUpFallback(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): AuthResponse {
  // Generate mock user data
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    firstName,
    lastName,
    name: firstName && lastName ? `${firstName} ${lastName}` : email.split('@')[0],
    tier: 'free',
    credits: 100,
    createdAt: new Date().toISOString(),
    emailVerified: false,
  };

  // Generate mock token
  const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Store locally
  storeAuthToken(token);
  storeUser(user);

  return {
    success: true,
    user,
    token,
    isNewUser: true,
  };
}

/**
 * Sign in with email/password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      // If backend is unavailable, use client-side fallback
      if (response.status === 0 || response.status >= 500) {
        return signInFallback(email, password);
      }
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Backend unavailable - use client-side fallback
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      return signInFallback(email, password);
    }
    return {
      success: false,
      error: error.message || 'Failed to sign in',
    };
  }
}

/**
 * Client-side fallback for sign in (when backend unavailable)
 */
function signInFallback(email: string, password: string): AuthResponse {
  // Check if user exists in localStorage (from previous signup)
  const existingUser = getUser();
  
  if (existingUser && existingUser.email === email) {
    // User exists - generate new token
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    storeAuthToken(token);
    
    return {
      success: true,
      user: existingUser,
      token,
      isNewUser: false,
    };
  }

  // New user - create account
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    name: email.split('@')[0],
    tier: 'free',
    credits: 100,
    createdAt: new Date().toISOString(),
    emailVerified: false,
  };

  const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  storeAuthToken(token);
  storeUser(user);

  return {
    success: true,
    user,
    token,
    isNewUser: true,
  };
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(
  googleId: string,
  email: string,
  name?: string,
  picture?: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ googleId, email, name, picture }),
    });

    if (!response.ok) {
      // If backend is unavailable, use client-side fallback
      if (response.status === 0 || response.status >= 500) {
        return signInWithGoogleFallback(googleId, email, name, picture);
      }
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Backend unavailable - use client-side fallback
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      return signInWithGoogleFallback(googleId, email, name, picture);
    }
    return {
      success: false,
      error: error.message || 'Failed to sign in with Google',
    };
  }
}

/**
 * Client-side fallback for Google sign in (when backend unavailable)
 */
function signInWithGoogleFallback(
  googleId: string,
  email: string,
  name?: string,
  picture?: string
): AuthResponse {
  // Check if user exists
  const existingUser = getUser();
  
  if (existingUser && existingUser.email === email) {
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    storeAuthToken(token);
    
    return {
      success: true,
      user: existingUser,
      token,
      isNewUser: false,
    };
  }

  // Create new user
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    name: name || email.split('@')[0],
    tier: 'free',
    credits: 100,
    createdAt: new Date().toISOString(),
    emailVerified: true,
  };

  const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  storeAuthToken(token);
  storeUser(user);

  return {
    success: true,
    user,
    token,
    isNewUser: true,
  };
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to request password reset',
    };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to reset password',
    };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(token: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get user',
    };
  }
}

/**
 * Store auth token in localStorage
 */
export function storeAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * Remove auth token from localStorage
 */
export function clearAuthToken(): void {
  localStorage.removeItem('authToken');
}

/**
 * Store user data in localStorage
 */
export function storeUser(user: User): void {
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Get user data from localStorage
 */
export function getUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Clear user data from localStorage
 */
export function clearUser(): void {
  localStorage.removeItem('user');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  const user = getUser();
  return !!(token && user);
}

/**
 * Logout - clear all auth data
 */
export function logout(): void {
  clearAuthToken();
  clearUser();
  // Clear any other user-related data
  localStorage.removeItem('userTier');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
}

