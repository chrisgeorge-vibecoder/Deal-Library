import { NextRequest, NextResponse } from 'next/server';
import { MarketInsightsService } from '@/lib/services/marketInsightsService';

const marketInsightsService = new MarketInsightsService();

export async function GET(request: NextRequest) {
  try {
    const metrics = marketInsightsService.getAvailableMetrics();
    return NextResponse.json({
      success: true,
      metrics,
      count: metrics.length
    });
  } catch (error) {
    console.error('Error fetching available metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch available metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


