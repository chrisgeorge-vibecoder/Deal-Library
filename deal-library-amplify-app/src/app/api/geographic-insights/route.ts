import { NextRequest, NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const controller = getDealsController();
    const result = await controller.generateGeographicInsightsDirect(body);
    
    // Check if the result indicates an error
    if (result.success === false) {
      console.error('Geographic insights generation failed:', result.error);
      return NextResponse.json(
        { 
          error: result.error || 'Failed to generate geographic insights',
          message: result.error || 'Failed to generate geographic insights'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating geographic insights:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate geographic insights';
    return NextResponse.json(
      { 
        error: errorMessage,
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
