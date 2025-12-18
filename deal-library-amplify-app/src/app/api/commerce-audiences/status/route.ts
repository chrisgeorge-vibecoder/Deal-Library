import { NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

export async function GET() {
  try {
    console.log('🔍 Checking commerce audience status...');
    
    // Check local service status
    const { commerceAudienceService } = await import('@/lib/services/commerceAudienceService');
    const status = commerceAudienceService.getStatus();
    
    // Check Supabase configuration
    const { SupabaseService } = await import('@/lib/services/supabaseService');
    const isSupabaseEnabled = SupabaseService.isEnabled();
    const hasSupabaseUrl = !!process.env.SUPABASE_URL;
    const hasSupabaseKey = !!process.env.SUPABASE_ANON_KEY;
    
    return NextResponse.json({
      isLoaded: status.isLoaded,
      totalRecords: status.totalRecords,
      audienceSegments: status.audienceSegments?.length || 0,
      supabase: {
        enabled: isSupabaseEnabled,
        urlConfigured: hasSupabaseUrl,
        keyConfigured: hasSupabaseKey,
        useSupabaseEnv: process.env.USE_SUPABASE
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        useSupabase: process.env.USE_SUPABASE
      }
    });
  } catch (error) {
    console.error('Error getting commerce audience status:', error);
    return NextResponse.json({
      isLoaded: false,
      totalRecords: 0,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
