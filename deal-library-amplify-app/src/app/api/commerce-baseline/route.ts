import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { commerceBaselineService } = await import('@/lib/services/commerceBaselineService');
    const baseline = await commerceBaselineService.getBaseline();
    const info = commerceBaselineService.getBaselineInfo();
    
    return NextResponse.json({
      success: true,
      baseline,
      info
    });
  } catch (error) {
    console.error('Error fetching commerce baseline:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch commerce baseline'
      },
      { status: 500 }
    );
  }
}

