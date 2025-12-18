import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function GET() {
  try {
    // Try to fetch from backend first (only if API_BASE_URL is set and not localhost)
    const isProduction = process.env.NODE_ENV === 'production';
    const hasBackendURL = API_BASE_URL && !API_BASE_URL.includes('localhost');
    
    if (hasBackendURL) {
      try {
        console.log(`🔄 Attempting to fetch from backend: ${API_BASE_URL}`);
        // Create timeout controller for fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${API_BASE_URL}/api/audience-geo-analysis/segments`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Successfully fetched segments from backend');
          return NextResponse.json(data);
        } else {
          console.warn(`⚠️ Backend responded with status ${response.status}`);
        }
      } catch (backendError: any) {
        console.warn('⚠️ Backend unavailable, falling back to local service:', backendError?.message || backendError);
      }
    } else {
      console.log('🔄 Skipping backend (localhost or not configured), using local service...');
    }
    
    // Fallback to local service (works in all environments)
    console.log('🔄 Using local commerce audience service...');
    const { getDealsController } = await import('@/lib/controllers/dealsControllerWrapper');
    const controller = getDealsController();
    const result = await controller.getCommerceAudienceSegmentsDirect();
    console.log(`✅ Local service returned ${result.segments?.length || 0} segments`);
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ ===== ERROR in /api/audience-geo-analysis/segments =====');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : { raw: error };
    
    return NextResponse.json(
      { 
        success: false, 
        segments: [], 
        error: errorMessage,
        errorDetails: errorDetails
      },
      { status: 500 }
    );
  }
}


