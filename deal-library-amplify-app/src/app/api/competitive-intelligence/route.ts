import { NextRequest, NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('⚔️ Competitive Intelligence API called with:', body);
    
    const controller = getDealsController();
    const result = await controller.generateCompetitiveIntelligenceDirect(body);
    
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
  } catch (error) {
    console.error('❌ Error generating competitive intelligence:', error);
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
