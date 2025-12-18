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

  try {
    const body = await request.json();
    const controller = getDealsController();
    
    // Race between the actual search and the timeout
    const result = await Promise.race([
      controller.searchDealsAIDirect(body),
      timeoutPromise
    ]);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Error searching deals:', error);
    
    // If it's a timeout, return a specific error
    if (error.message?.includes('timeout') || error.name === 'AbortError') {
      console.error('⏰ Request timed out before completion');
      return NextResponse.json(
        { 
          success: false,
          error: 'Request timeout',
          message: 'The search request took too long. Please try again with a simpler query or fewer deals.',
          deals: [],
          aiResponse: 'I apologize, but the search request timed out. This can happen when processing many deals. Please try a more specific query or try again.',
          searchMethod: 'timeout-error'
        },
        { status: 504 } // Gateway Timeout
      );
    }
    
    // For other errors, return a 500 with error details
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search deals',
        message: error.message || 'Unknown error occurred',
        deals: [],
        aiResponse: 'I encountered an error while searching. Please try again.'
      },
      { status: 500 }
    );
  }
}
