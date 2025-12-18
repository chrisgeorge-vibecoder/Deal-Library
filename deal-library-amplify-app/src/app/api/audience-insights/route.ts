import { NextRequest, NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const controller = getDealsController();
    const result = await controller.generateAudienceInsightsDirect(body);
    
    // If the result indicates failure, return appropriate error response
    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to generate audience insights',
          message: result.message || 'Please try again.'
        },
        { status: 500 }
      );
    }
    
    // Return successful result
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating audience insights:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate audience insights',
        message: error instanceof Error ? error.message : 'Please try again.'
      },
      { status: 500 }
    );
  }
}
