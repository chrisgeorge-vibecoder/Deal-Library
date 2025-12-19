import { NextRequest, NextResponse } from 'next/server';
import { MarketInsightsService } from '@/lib/services/marketInsightsService';
import { GeographicLevel } from '@/types/censusData';

const marketInsightsService = new MarketInsightsService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metricId, geoLevel, limit = 50, includeCommercialZips = false } = body;

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

    if (!geoLevel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: geoLevel'
        },
        { status: 400 }
      );
    }

    const validGeoLevels: GeographicLevel[] = ['region', 'state', 'cbsa', 'county', 'city', 'zip'];
    if (!validGeoLevels.includes(geoLevel as GeographicLevel)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid geoLevel. Must be one of: ${validGeoLevels.join(', ')}`
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching top ${limit} markets by ${metricId} at ${geoLevel} level ${includeCommercialZips ? '(including commercial ZIPs)' : '(residential only)'}`);

    const topMarkets = await marketInsightsService.getTopMarketsByMetric(
      metricId,
      geoLevel as GeographicLevel,
      limit,
      includeCommercialZips
    );

    return NextResponse.json({
      success: true,
      metricId,
      geoLevel,
      markets: topMarkets,
      count: topMarkets.length
    });
  } catch (error) {
    console.error('Error fetching top markets:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch top markets',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}




