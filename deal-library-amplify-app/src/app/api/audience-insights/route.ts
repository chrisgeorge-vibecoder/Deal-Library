import { NextRequest, NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

export async function POST(request: NextRequest) {
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
      result = await controller.generateAudienceInsightsDirect(body);
    } catch (controllerError) {
      console.error('Error in generateAudienceInsightsDirect:', controllerError);
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
