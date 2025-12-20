import { NextRequest, NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

// Timeout for audience insights generation
// AWS Amplify has a 60s limit for serverless functions
// We set this to 55 seconds to leave buffer for response formatting
const API_TIMEOUT_MS = process.env.NODE_ENV === 'production' 
  ? 55000  // 55 seconds for production (leaves 5s buffer for Amplify 60s limit)
  : 90000; // 90 seconds for development (more forgiving)

export async function POST(request: NextRequest) {
  // Create a timeout promise that rejects after API_TIMEOUT_MS
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('API request timeout - serverless function limit reached'));
    }, API_TIMEOUT_MS);
  });

  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request body',
          message: 'The request body must be valid JSON.',
          audienceInsights: [],
          aiResponse: ''
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request body',
          message: 'Request body must be an object.',
          audienceInsights: [],
          aiResponse: ''
        },
        { status: 400 }
      );
    }

    const controller = getDealsController();
    if (!controller) {
      console.error('DealsController is not available');
      return NextResponse.json(
        { 
          success: false,
          error: 'Service unavailable',
          message: 'The audience insights service is not available.',
          audienceInsights: [],
          aiResponse: ''
        },
        { status: 503 }
      );
    }

    let result;
    try {
      // Race between insights generation and timeout
      const insightsPromise = controller.generateAudienceInsightsDirect(body);
      result = await Promise.race([insightsPromise, timeoutPromise]);
    } catch (controllerError: any) {
      console.error('Error in generateAudienceInsightsDirect:', controllerError);
      
      // Check if it's a timeout error
      if (controllerError.message?.includes('timeout')) {
        console.error('⏰ Request timed out before completion');
        return NextResponse.json(
          { 
            success: false,
            error: 'Request timeout',
            message: 'The audience insights generation took too long. Please try a simpler query or try again.',
            audienceInsights: [],
            aiResponse: ''
          },
          { status: 504 } // Gateway Timeout
        );
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to generate audience insights',
          message: controllerError instanceof Error ? controllerError.message : 'An unknown error occurred.',
          audienceInsights: [],
          aiResponse: ''
        },
        { status: 500 }
      );
    }
    
    // Ensure result is an object
    if (!result || typeof result !== 'object') {
      console.error('Invalid result from generateAudienceInsightsDirect:', result);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid response from service',
          message: 'The service returned an invalid response.',
          audienceInsights: [],
          aiResponse: ''
        },
        { status: 500 }
      );
    }
    
    // If the result indicates failure, return appropriate error response
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to generate audience insights',
          message: result.message || 'Please try again.',
          audienceInsights: result.audienceInsights || [],
          aiResponse: result.aiResponse || ''
        },
        { status: 500 }
      );
    }
    
    // Ensure successful result has required fields
    const responseData = {
      success: true,
      audienceInsights: result.audienceInsights || [],
      aiResponse: result.aiResponse || 'Here are the audience insights for your query.'
    };
    
    // Return successful result
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Unexpected error generating audience insights:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate audience insights',
        message: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        audienceInsights: [],
        aiResponse: ''
      },
      { status: 500 }
    );
  }
}
