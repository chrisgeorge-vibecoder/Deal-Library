import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Force dynamic rendering - ensures route runs at request time with full env var access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // CRITICAL: Match test-env/diagnose pattern EXACTLY - check env var FIRST
    // These routes have NO NextRequest parameter and they WORK
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    
    if (!appsScriptUrl) {
      return NextResponse.json({
        deals: [],
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 0,
        error: 'GOOGLE_APPS_SCRIPT_URL environment variable is required to fetch real deals',
        configError: true,
        debug: {
          hasAppsScriptUrl: false,
          nodeEnv: process.env.NODE_ENV,
          allEnvKeys: Object.keys(process.env).filter(k => 
            k.includes('GOOGLE') || k.includes('APPS') || k.includes('GEMINI')
          ),
        },
      }, { status: 500 });
    }
    
    // Parse query parameters - use request object (we need it for query params)
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

    // Get all deals - use EXACT same pattern as diagnose endpoint which WORKS
    // Diagnose uses top-level import, so we'll match that pattern
    const { AppsScriptService } = await import('@/lib/services/appsScriptService');
    const appsScriptService = new AppsScriptService();
    const allDeals = await appsScriptService.getAllDeals();
    
    // Import controller for filtering
    const { DealsController } = await import('@/lib/controllers/dealsController');
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
    // Dynamic import to ensure env vars are available
    const { DealsController } = await import('@/lib/controllers/dealsController');
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

