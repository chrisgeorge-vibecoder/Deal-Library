import { NextRequest, NextResponse } from 'next/server';
import { DealsController } from '@/lib/controllers/dealsController';
import { AppsScriptService } from '@/lib/services/appsScriptService';
import { cacheService } from '@/lib/services/cacheService';

// Create a singleton instance of the deals controller
let dealsControllerInstance: DealsController | null = null;

function getDealsController(): DealsController {
  // Always create a new instance - the AppsScriptService checks env vars at runtime
  // Creating fresh instances avoids any potential singleton caching issues
  dealsControllerInstance = new DealsController();
  return dealsControllerInstance;
}

// Helper to get deals directly using AppsScriptService (like diagnose endpoint does)
async function getAllDealsDirect(): Promise<any[]> {
  console.log('🔍 getAllDealsDirect: Creating AppsScriptService directly');
  const appsScriptService = new AppsScriptService();
  console.log('🔍 getAllDealsDirect: Calling getAllDeals()');
  const deals = await appsScriptService.getAllDeals();
  console.log('✅ getAllDealsDirect: Got', deals.length, 'deals');
  return deals;
}

export async function GET(request: NextRequest) {
  try {
    // Debug: Log environment variable status (without exposing the actual URL)
    const hasAppsScriptUrl = !!process.env.GOOGLE_APPS_SCRIPT_URL;
    console.log('🔍 API Route Environment check:', {
      hasAppsScriptUrl,
      appsScriptUrlLength: process.env.GOOGLE_APPS_SCRIPT_URL?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      urlPrefix: process.env.GOOGLE_APPS_SCRIPT_URL?.substring(0, 50) || 'NOT SET',
      allGoogleEnvKeys: Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('APPS')),
    });
    
    const controller = getDealsController();
    console.log('🔍 Controller obtained, about to call getAllDeals()');
    
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

    // Get all deals - try direct method first (like diagnose endpoint)
    console.log('🔍 API Route: Getting deals using direct method (like diagnose endpoint)');
    let allDeals: any[];
    try {
      // Use direct method that works in diagnose endpoint
      allDeals = await getAllDealsDirect();
      console.log('✅ API Route: getAllDealsDirect() returned', allDeals.length, 'deals');
    } catch (directError) {
      console.error('❌ Direct method failed, trying controller method:', directError);
      // Fallback to controller method
      allDeals = await controller.getAllDeals();
      console.log('✅ API Route: controller.getAllDeals() returned', allDeals.length, 'deals');
    }
    
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
                         errorMessage.includes('not configured');
    
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
        help: isConfigError ? 'Please ensure GOOGLE_APPS_SCRIPT_URL is set in AWS Amplify Environment Variables (not Secrets, unless you know how to access secrets in Next.js API routes)' : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const controller = getDealsController();
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

