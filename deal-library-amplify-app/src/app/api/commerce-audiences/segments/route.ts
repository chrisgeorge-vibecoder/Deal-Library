import { NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

export async function GET() {
  try {
    console.log('🔄 Fetching commerce audience segments from local service...');
    const controller = getDealsController();
    const result = await controller.getCommerceAudienceSegmentsDirect();
    console.log(`✅ Local service returned ${result.segments?.length || 0} segments`);
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ ===== ERROR in /api/commerce-audiences/segments =====');
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
