import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export interface AuthResponse {
  success: boolean;
  user?: any;
  error?: string;
  session?: any;
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // OAuth redirect will happen automatically
    return {
      success: true,
      data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to sign in with Google'
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, metadata?: {
  firstName?: string;
  lastName?: string;
}): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: metadata?.firstName || '',
          last_name: metadata?.lastName || '',
          full_name: `${metadata?.firstName || ''} ${metadata?.lastName || ''}`.trim() || email.split('@')[0]
        }
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to sign up'
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to sign in'
    };
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to sign out'
    };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return { user: null, error };
    }

    return { user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
}

/**
 * Get current session
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  } catch (error: any) {
    return { session: null, error };
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { session } = await getSession();
  return !!session;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send reset email'
    };
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update password'
    };
  }
}

