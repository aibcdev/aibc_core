/**
 * Supabase Client
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Gracefully handle missing Supabase config - don't throw errors
let supabase: ReturnType<typeof createClient> | null = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  supabase = null;
}

export { supabase };

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!supabase;
}

