import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Service - Singleton wrapper for Supabase client
 * Handles database connectivity for census data, commerce audience segments, and caching
 */
export class SupabaseService {
  private static instance: SupabaseClient | null = null;
  private static serviceRoleInstance: SupabaseClient | null = null;

  /**
   * Get or create Supabase client instance (using anon key)
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
   * Get Supabase client with service role key (for admin operations like storage)
   */
  public static getServiceRoleClient(): SupabaseClient {
    if (!SupabaseService.serviceRoleInstance) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error(
          'Supabase service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY or fallback to SUPABASE_ANON_KEY.'
        );
      }

      console.log('🔌 Initializing Supabase service role client...');
      console.log('🔌 Using key format:', serviceRoleKey.length > 50 ? 'JWT Token' : 'Short Key');
      
      SupabaseService.serviceRoleInstance = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
        },
      });
      console.log('✅ Supabase service role client initialized');
    }

    return SupabaseService.serviceRoleInstance;
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
    SupabaseService.serviceRoleInstance = null;
  }
}

