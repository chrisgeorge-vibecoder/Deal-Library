import { NextRequest, NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

// AWS Amplify serverless functions have timeout limits (10-30 seconds)
// We need to ensure we return before that limit
const API_TIMEOUT_MS = 25000; // 25 seconds - leave buffer for Amplify timeout

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
    const controller = getDealsController();
    
    // Race between the actual market sizing generation and the timeout
    result = await Promise.race([
      controller.generateMarketSizingDirect(body),
      timeoutPromise
    ]);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Error generating market sizing:', error);
    
    // If it's a timeout, return a specific error
    if (error.message?.includes('timeout') || error.name === 'AbortError' || (result && result.error === 'timeout')) {
      console.error('⏰ Request timed out before completion');
      return NextResponse.json(
        { 
          success: false,
          error: 'Request timeout',
          message: 'The market sizing request took too long. Market sizing analysis can be complex and may take up to 20 seconds. Please try again with a more specific query, or try again later.',
          marketSizing: [],
          aiResponse: 'I apologize, but the market sizing request timed out. This can happen with complex queries. Please try a more specific query (e.g., "vitamin supplements market" instead of "vitamin buyers market sizing and competitive landscape") or try again.'
        },
        { status: 504 } // Gateway Timeout
      );
    }
    
    // For other errors, return a 500 with error details
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate market sizing',
        message: error.message || 'Unknown error occurred',
        marketSizing: [],
        aiResponse: 'I encountered an error while generating market sizing. Please try again.'
      },
      { status: 500 }
    );
  }
}
