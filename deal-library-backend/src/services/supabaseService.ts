import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Service - Singleton wrapper for Supabase client
 * Handles database connectivity for census data, commerce audience segments, and caching
 */
export class SupabaseService {
  private static instance: SupabaseClient | null = null;

  /**
   * Get or create Supabase client instance
   */
  public static getClient(): SupabaseClient {
    if (!SupabaseService.instance) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          'Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'
        );
      }

      console.log('🔌 Initializing Supabase client...');
      SupabaseService.instance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false, // Backend doesn't need session persistence
        },
      });
      console.log('✅ Supabase client initialized');
    }

    return SupabaseService.instance;
  }

  /**
   * Check if Supabase is configured and enabled
   */
  public static isEnabled(): boolean {
    return process.env.USE_SUPABASE === 'true';
  }

  /**
   * Reset instance (useful for testing)
   */
  public static reset(): void {
    SupabaseService.instance = null;
  }
}

