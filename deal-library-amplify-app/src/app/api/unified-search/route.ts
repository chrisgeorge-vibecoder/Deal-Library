import { NextRequest, NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

// Timeout for unified search
// AWS Amplify has a 60s limit for serverless functions
// We set this to 55 seconds to leave buffer for response formatting
const API_TIMEOUT_MS = process.env.NODE_ENV === 'production' ? 55000 : 90000;

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
    
    // Race between unified search and timeout
    const result = await Promise.race([
      controller.unifiedSearchDirect(body),
      timeoutPromise
    ]);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in unified search:', error);
    
    // Check if it's a timeout error
    if (error.message?.includes('timeout') || error.name === 'AbortError') {
      console.error('⏰ Unified search timed out before completion');
      return NextResponse.json(
        { 
          success: false,
          error: 'Request timeout',
          message: 'The search request took too long. Please try a simpler query or try again.',
          personas: [],
          deals: [],
          marketSizing: [],
          marketingNews: [],
          contentStrategy: [],
          brandStrategy: [],
          competitiveIntelligence: [],
          companyProfiles: []
        },
        { status: 504 } // Gateway Timeout
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to perform unified search',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
