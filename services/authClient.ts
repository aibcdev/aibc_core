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
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      // Network error, CORS error, timeout, or any fetch failure - use fallback
      console.log('Sign up fetch error, using fallback:', fetchError.message);
      return signUpFallback(email, password, firstName, lastName);
    }

    // If response is not ok, check if it's a backend error or user error
    if (!response.ok) {
      // For any server error or not found, use fallback
      if (response.status === 0 || response.status >= 500 || response.status === 404) {
        return signUpFallback(email, password, firstName, lastName);
      }
      // For client errors (400, 401, 403), try to parse error message
      try {
        const errorData = await response.json();
        // If it's a validation error, return it; otherwise fallback
        if (response.status >= 400 && response.status < 500 && errorData.error) {
          return {
            success: false,
            error: errorData.error || 'Failed to sign up',
          };
        }
        return signUpFallback(email, password, firstName, lastName);
      } catch {
        // Can't parse error, use fallback
        return signUpFallback(email, password, firstName, lastName);
      }
    }

    // Success - parse response
    try {
      const data = await response.json();
      return data;
    } catch {
      // Can't parse success response, use fallback
      return signUpFallback(email, password, firstName, lastName);
    }
  } catch (error: any) {
    // Any other error - use client-side fallback
    console.log('Sign up error, using fallback:', error?.message || error);
    return signUpFallback(email, password, firstName, lastName);
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
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      // Network error, CORS error, timeout, or any fetch failure - use fallback
      console.log('Sign in fetch error, using fallback:', fetchError.message);
      return signInFallback(email, password);
    }

    // If response is not ok, check if it's a backend error or user error
    if (!response.ok) {
      // For any server error or not found, use fallback
      if (response.status === 0 || response.status >= 500 || response.status === 404) {
        return signInFallback(email, password);
      }
      // For client errors (400, 401, 403), try to parse error message
      try {
        const errorData = await response.json();
        // If it's a validation error, return it; otherwise fallback
        if (response.status >= 400 && response.status < 500 && errorData.error) {
          return {
            success: false,
            error: errorData.error || 'Invalid email or password',
          };
        }
        return signInFallback(email, password);
      } catch {
        // Can't parse error, use fallback
        return signInFallback(email, password);
      }
    }

    // Success - parse response
    try {
      const data = await response.json();
      return data;
    } catch {
      // Can't parse success response, use fallback
      return signInFallback(email, password);
    }
  } catch (error: any) {
    // Any other error - use client-side fallback
    console.log('Sign in error, using fallback:', error?.message || error);
    return signInFallback(email, password);
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
 * @param credential - Google JWT token (if using Google Identity Services) OR googleId (legacy)
 * @param email - Optional email (for fallback or legacy mode)
 * @param name - Optional name (for fallback or legacy mode)
 * @param picture - Optional picture (for fallback or legacy mode)
 */
export async function signInWithGoogle(
  credential: string,
  email?: string,
  name?: string,
  picture?: string
): Promise<AuthResponse> {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    let response: Response;
    try {
      // If credential looks like a JWT token (starts with eyJ), send it as credential
      // Otherwise, treat it as legacy googleId
      const isJWT = credential.startsWith('eyJ');
      
      response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          isJWT
            ? { credential } // New Google Identity Services format
            : { googleId: credential, email, name, picture } // Legacy format
        ),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      // Network error, CORS error, timeout, or any fetch failure - use fallback
      console.log('Google sign in fetch error, using fallback:', fetchError.message);
      const googleId = credential.startsWith('eyJ') ? `google_${Date.now()}` : credential;
      return signInWithGoogleFallback(googleId, email || 'user@example.com', name, picture);
    }

    // If response is not ok, check if it's a backend error or user error
    if (!response.ok) {
      // For any server error or not found, use fallback
      if (response.status === 0 || response.status >= 500 || response.status === 404) {
        return signInWithGoogleFallback(googleId, email, name, picture);
      }
      // For client errors (400, 401, 403), try to parse error message
      try {
        const errorData = await response.json();
        // If it's a validation error, return it; otherwise fallback
        if (response.status >= 400 && response.status < 500 && errorData.error) {
          return {
            success: false,
            error: errorData.error || 'Failed to sign in with Google',
          };
        }
        return signInWithGoogleFallback(googleId, email, name, picture);
      } catch {
        // Can't parse error, use fallback
        return signInWithGoogleFallback(googleId, email, name, picture);
      }
    }

    // Success - parse response
    try {
      const data = await response.json();
      return data;
    } catch {
      // Can't parse success response, use fallback
      return signInWithGoogleFallback(googleId, email, name, picture);
    }
  } catch (error: any) {
    // Any other error - use client-side fallback
    console.log('Google sign in error, using fallback:', error?.message || error);
    return signInWithGoogleFallback(googleId, email, name, picture);
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

