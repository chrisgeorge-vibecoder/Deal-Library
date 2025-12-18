import { NextRequest, NextResponse } from 'next/server';
// Don't import services at top level - use dynamic imports to ensure env vars are available

export async function GET(request: NextRequest) {
  try {
    // CRITICAL: Use a function call to force runtime evaluation
    // This prevents Next.js from optimizing/env var access at build time
    const getEnvVar = (key: string) => {
      // Force runtime access by accessing process.env inside a function
      return typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
    };
    
    const appsScriptUrl = getEnvVar('GOOGLE_APPS_SCRIPT_URL');
    
    console.log('🔍 API Route: Runtime env var check:', {
      hasAppsScriptUrl: !!appsScriptUrl,
      urlLength: appsScriptUrl?.length || 0,
      nodeEnv: getEnvVar('NODE_ENV'),
      allProcessEnvKeys: typeof process !== 'undefined' && process.env ? Object.keys(process.env).slice(0, 10) : [],
      allGoogleEnvKeys: typeof process !== 'undefined' && process.env ? Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('APPS')) : [],
    });
    
    if (!appsScriptUrl) {
      // Env var not available - return error immediately
      return NextResponse.json({
        deals: [],
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 0,
        error: 'GOOGLE_APPS_SCRIPT_URL environment variable is required to fetch real deals',
        configError: true,
        debug: {
          routeHandler: {
            hasAppsScriptUrl: false,
            urlLength: 0,
            nodeEnv: typeof process !== 'undefined' && process.env ? process.env.NODE_ENV : 'undefined',
            hasProcess: typeof process !== 'undefined',
            hasProcessEnv: typeof process !== 'undefined' && !!process.env,
            allGoogleEnvKeys: typeof process !== 'undefined' && process.env ? Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('APPS')) : [],
          },
        },
        help: 'Please ensure GOOGLE_APPS_SCRIPT_URL is set in AWS Amplify Environment Variables (not Secrets)',
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
    // Dynamic import ensures module is loaded at runtime when env vars are available
    console.log('🔍 API Route: Dynamically importing AppsScriptService');
    const { AppsScriptService } = await import('@/lib/services/appsScriptService');
    console.log('🔍 API Route: Creating AppsScriptService directly with env var:', !!appsScriptUrl);
    const appsScriptService = new AppsScriptService();
    console.log('🔍 API Route: Calling getAllDeals()');
    const allDeals = await appsScriptService.getAllDeals();
    console.log('✅ API Route: Got', allDeals.length, 'deals');
    
    // Import controller only for filtering (it doesn't need env vars for this)
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
    
    // Add debug info to help diagnose
    const getEnvVar = (key: string) => {
      return typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
    };
    const debugInfo = {
      routeHandler: {
        hasAppsScriptUrl: !!getEnvVar('GOOGLE_APPS_SCRIPT_URL'),
        urlLength: getEnvVar('GOOGLE_APPS_SCRIPT_URL')?.length || 0,
        nodeEnv: getEnvVar('NODE_ENV'),
        hasProcess: typeof process !== 'undefined',
        hasProcessEnv: typeof process !== 'undefined' && !!process.env,
        allGoogleEnvKeys: typeof process !== 'undefined' && process.env ? Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('APPS')) : [],
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

