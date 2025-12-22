import { NextRequest, NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

// AWS Amplify serverless functions have timeout limits (varies by tier, typically 10-30 seconds)
// Increased to 35 seconds to allow for complex market sizing queries (controller has 32s timeout)
const API_TIMEOUT_MS = 35000; // 35 seconds - leave buffer for Amplify timeout

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  const debugId = `api-market-sizing-${Date.now()}`;
  
  console.log(`📊 [${debugId}] Market sizing API route called`);
  
  // Create a timeout promise that rejects after API_TIMEOUT_MS
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const elapsed = Date.now() - requestStartTime;
      console.error(`⏰ [${debugId}] API route timeout: ${elapsed}ms elapsed (limit: ${API_TIMEOUT_MS}ms)`);
      reject(new Error(`API request timeout - serverless function limit reached after ${elapsed}ms`));
    }, API_TIMEOUT_MS);
  });

  let result: any = null;
  try {
    const body = await request.json();
    console.log(`📊 [${debugId}] Request body parsed:`, {
      hasQuery: !!body.query,
      query: body.query?.substring(0, 100), // Log first 100 chars
      hasConversationHistory: !!(body.conversationHistory && body.conversationHistory.length > 0)
    });
    
    const controller = getDealsController();
    if (!controller) {
      console.error(`❌ [${debugId}] DealsController not available`);
      return NextResponse.json(
        { 
          success: false,
          error: 'Service unavailable',
          message: 'Controller service is not initialized',
          marketSizing: [],
          aiResponse: 'Service is temporarily unavailable. Please try again later.'
        },
        { status: 503 }
      );
    }
    
    console.log(`📊 [${debugId}] Starting generateMarketSizingDirect...`);
    const controllerStartTime = Date.now();
    
    // Race between the actual market sizing generation and the timeout
    result = await Promise.race([
      controller.generateMarketSizingDirect(body),
      timeoutPromise
    ]);
    
    const controllerElapsed = Date.now() - controllerStartTime;
    const totalElapsed = Date.now() - requestStartTime;
    
    console.log(`✅ [${debugId}] Market sizing API completed successfully:`, {
      success: result.success,
      hasMarketSizing: !!(result.marketSizing && result.marketSizing.length > 0),
      marketSizingCount: result.marketSizing?.length || 0,
      controllerElapsed: `${controllerElapsed}ms`,
      totalElapsed: `${totalElapsed}ms`
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    const totalElapsed = Date.now() - requestStartTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ [${debugId}] Error in market sizing API route (elapsed: ${totalElapsed}ms):`, {
      error: errorMessage,
      errorName: error instanceof Error ? error.name : typeof error,
      result: result ? { success: result.success, error: result.error } : null
    });
    
    // If it's a timeout, return a specific error
    if (errorMessage.includes('timeout') || error.name === 'AbortError' || (result && result.error === 'timeout')) {
      console.error(`⏰ [${debugId}] Confirmed timeout - total elapsed: ${totalElapsed}ms`);
      return NextResponse.json(
        { 
          success: false,
          error: 'Request timeout',
          message: `The market sizing request timed out after ${Math.round(totalElapsed/1000)}s. Market sizing analysis can be complex and may take 30+ seconds for detailed queries. Please try a more specific query, or try again later.`,
          marketSizing: [],
          aiResponse: `Market sizing generation timed out. The query may be too complex. Please try a more specific query or try again later.`,
          debugInfo: {
            debugId,
            elapsedMs: totalElapsed,
            timeoutLimit: API_TIMEOUT_MS
          }
        },
        { status: 504 } // Gateway Timeout
      );
    }
    
    // For other errors, return a 500 with error details
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate market sizing',
        message: errorMessage || 'Unknown error occurred',
        marketSizing: [],
        aiResponse: 'I encountered an error while generating market sizing. Please try again.',
        debugInfo: {
          debugId,
          elapsedMs: totalElapsed
        }
      },
      { status: 500 }
    );
  }
}
