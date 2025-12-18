import { NextRequest, NextResponse } from 'next/server';
import { MarketInsightsService } from '@/lib/services/marketInsightsService';
import { GeographicLevel } from '@/types/censusData';

const marketInsightsService = new MarketInsightsService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { geoLevel, marketName, includeCommercialZips = false } = body;

    // Validation
    if (!geoLevel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: geoLevel'
        },
        { status: 400 }
      );
    }

    if (!marketName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: marketName'
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

    console.log(`📊 Fetching market profile for ${marketName} (${geoLevel}) ${includeCommercialZips ? '(including commercial ZIPs)' : '(residential only)'}`);

    const profile = await marketInsightsService.getMarketProfile(
      geoLevel as GeographicLevel,
      marketName,
      includeCommercialZips
    );

    return NextResponse.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error fetching market profile:', error);
    
    // Handle "not found" errors separately
    if (error instanceof Error && error.message.includes('Market not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Market not found',
          message: error.message
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch market profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

