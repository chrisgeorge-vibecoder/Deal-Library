import { NextRequest, NextResponse } from 'next/server';
import { MarketInsightsService } from '@/lib/services/marketInsightsService';

const marketInsightsService = new MarketInsightsService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metricId, limit = 5000, includeCommercialZips = false } = body;

    // Validation
    if (!metricId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: metricId'
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching top ${limit} zip codes by ${metricId} ${includeCommercialZips ? '(including commercial ZIPs)' : '(residential only)'}`);

    const topZipCodes = await marketInsightsService.getTopZipCodesByMetric(
      metricId,
      limit,
      includeCommercialZips
    );

    return NextResponse.json({
      success: true,
      metricId,
      zipCodes: topZipCodes,
      count: topZipCodes.length
    });
  } catch (error) {
    console.error('Error fetching top zip codes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch top zip codes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


