import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Browser-safe Supabase configuration from environment variables
const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

let clientInstance: SupabaseClient | null = null;

/**
 * Checks if Supabase client configuration is provided in the environment.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
}

/**
 * Retrieves the singleton Supabase client instance for client-side queries.
 * Returns null if Supabase environment variables are not yet configured,
 * enabling seamless local-first offline fallback.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    });
  }

  return clientInstance;
}
