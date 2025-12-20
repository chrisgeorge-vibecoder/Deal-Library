import { NextRequest, NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

// Timeout for competitive intelligence generation
// AWS Amplify has a 60s limit for serverless functions
// We set this to 55 seconds to leave buffer for response formatting
const API_TIMEOUT_MS = process.env.NODE_ENV === 'production' ? 55000 : 90000; // 90 seconds for development (more forgiving)

export async function POST(request: NextRequest) {
  // Create a timeout promise that rejects after API_TIMEOUT_MS
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('API request timeout - serverless function limit reached'));
    }, API_TIMEOUT_MS);
  });

  let result: any = null;
  try {
    const body = await request.json();
    console.log('⚔️ Competitive Intelligence API called with:', body);
    
    const controller = getDealsController();
    
    // Race between competitive intelligence generation and timeout
    result = await Promise.race([
      controller.generateCompetitiveIntelligenceDirect(body),
      timeoutPromise
    ]);
    
    // Ensure consistent response format
    if (result && result.success !== undefined) {
      // Result already has success field, return as-is
      return NextResponse.json(result);
    } else if (result && result.error) {
      // Result has error but no success field, wrap it
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    } else {
      // Unexpected result format
      console.error('⚔️ Unexpected result format from generateCompetitiveIntelligenceDirect:', result);
      return NextResponse.json({
        success: false,
        error: 'Unexpected response format from competitive intelligence service'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ Error generating competitive intelligence:', error);
    
    // Check if it's a timeout error
    if (error.message?.includes('timeout') || error.name === 'AbortError' || (result && result.error === 'timeout')) {
      console.error('⏰ Request timed out before completion');
      return NextResponse.json(
        { 
          success: false,
          error: 'Request timeout',
          message: 'The competitive intelligence request took too long. Please try again with a simpler query, or try again later.'
        },
        { status: 504 } // Gateway Timeout
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate competitive intelligence';
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}
