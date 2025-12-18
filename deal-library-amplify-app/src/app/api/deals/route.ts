import { NextRequest, NextResponse } from 'next/server';
// Try top-level import pattern like diagnose endpoint which works
import { AppsScriptService } from '@/lib/services/appsScriptService';
import { DealsController } from '@/lib/controllers/dealsController';

export async function GET(request: NextRequest) {
  try {
    // EXACT SAME PATTERN AS test-env endpoint which works
    // Start with direct env var access before any other code
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    
    // Debug output matching test-env pattern exactly
    console.log('🔍 /api/deals GET - Env var check (matching test-env pattern):', {
      hasAppsScriptUrl: !!appsScriptUrl,
      appsScriptUrlLength: appsScriptUrl?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).filter(k => 
        k.includes('GOOGLE') || k.includes('APPS') || k.includes('GEMINI')
      ),
      timestamp: new Date().toISOString(),
    });
    
    if (!appsScriptUrl) {
      // Return error with debug info matching test-env structure exactly
      const debugInfo = {
        routeHandler: {
          hasAppsScriptUrl: false,
          appsScriptUrlLength: 0,
          nodeEnv: process.env.NODE_ENV,
          allEnvKeys: Object.keys(process.env).filter(k => 
            k.includes('GOOGLE') || k.includes('APPS') || k.includes('GEMINI')
          ),
          timestamp: new Date().toISOString(),
        },
      };
      
      console.error('❌ /api/deals GET - GOOGLE_APPS_SCRIPT_URL not available:', debugInfo);
      
      return NextResponse.json({
        deals: [],
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 0,
        error: 'GOOGLE_APPS_SCRIPT_URL environment variable is required to fetch real deals',
        configError: true,
        debug: debugInfo,
        help: 'Check /api/deals/test-env - it shows env vars ARE accessible, so this is route-specific. This suggests a Next.js route handling issue on AWS Amplify.',
      }, { status: 500 });
    }
    
    // Parse query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      search: searchParams.get('search') || undefined,
      targeting: searchParams.get('targeting') || undefined,
      environment: searchParams.get('environment') || undefined,
      mediaType: searchParams.get('mediaType') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '1000'),
    };

    // Parse date range if provided
    const dateStart = searchParams.get('dateStart');
    const dateEnd = searchParams.get('dateEnd');
    let dateRange = undefined;
    if (dateStart || dateEnd) {
      dateRange = {
        start: dateStart || undefined,
        end: dateEnd || undefined,
      };
    }

    // Get all deals using AppsScriptService directly (same pattern as diagnose endpoint)
    // Using top-level import like diagnose endpoint which works
    console.log('🔍 API Route: Creating AppsScriptService with env var available:', !!appsScriptUrl);
    const appsScriptService = new AppsScriptService();
    console.log('🔍 API Route: Calling getAllDeals()');
    const allDeals = await appsScriptService.getAllDeals();
    console.log('✅ API Route: Got', allDeals.length, 'deals');
    
    // Use controller for filtering (top-level import like diagnose endpoint)
    const controller = new DealsController();
    
    // Build DealFilters object for the filterDeals method
    const dealFilters: any = {
      search: filters.search,
      targeting: filters.targeting,
      environment: filters.environment,
      mediaType: filters.mediaType,
      page: filters.page,
      limit: filters.limit,
    };
    
    if (dateRange) {
      dealFilters.dateRange = dateRange;
    }
    
    // Use the controller's filterDeals method
    // This ensures consistent filtering logic
    const filteredDeals = controller.filterDeals(allDeals, dealFilters);
    
    // Pagination
    const total = filteredDeals.length;
    const totalPages = Math.ceil(total / filters.limit);
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedDeals = filteredDeals.slice(startIndex, endIndex);

    return NextResponse.json({
      deals: paginatedDeals,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('❌ Error fetching deals:', errorMessage);
    console.error('❌ Error stack:', errorStack);
    
    // Check if the error is about missing GOOGLE_APPS_SCRIPT_URL
    const isConfigError = errorMessage.includes('GOOGLE_APPS_SCRIPT_URL') || 
                         errorMessage.includes('not configured') ||
                         errorMessage.includes('not available');
    
    // Add debug info to help diagnose - using direct process.env access like test-env
    const debugInfo = {
      routeHandler: {
        hasAppsScriptUrl: !!process.env.GOOGLE_APPS_SCRIPT_URL,
        urlLength: process.env.GOOGLE_APPS_SCRIPT_URL?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        allGoogleEnvKeys: Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('APPS')),
        timestamp: new Date().toISOString(),
      },
      errorMessage,
      errorStack: errorStack?.substring(0, 500), // First 500 chars of stack
    };
    
    // Return proper error response with helpful message
    return NextResponse.json(
      {
        deals: [],
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 0,
        error: errorMessage,
        configError: isConfigError,
        debug: debugInfo,
        help: isConfigError ? 'Please ensure GOOGLE_APPS_SCRIPT_URL is set in AWS Amplify Environment Variables (not Secrets, unless you know how to access secrets in Next.js API routes)' : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Use top-level import (already imported above)
    const controller = new DealsController();
    const result = await controller.createDealFromBody(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}

