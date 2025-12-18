import { NextRequest, NextResponse } from 'next/server';
import { MarketInsightsService } from '@/lib/services/marketInsightsService';
import { GeographicLevel } from '@/types/censusData';

const marketInsightsService = new MarketInsightsService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, geoLevel, limit = 20, includeCommercialZips = false } = body;

    // Validation
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: query'
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

    console.log(`🔍 Searching markets: "${query}" at ${geoLevel} level`);

    const searchResults = await marketInsightsService.searchMarkets(
      query.trim(),
      geoLevel as GeographicLevel,
      limit,
      includeCommercialZips
    );

    return NextResponse.json({
      success: true,
      query,
      geoLevel,
      markets: searchResults,
      count: searchResults.length
    });
  } catch (error) {
    console.error('Error searching markets:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search markets',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

