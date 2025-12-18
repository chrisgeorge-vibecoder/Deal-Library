import { NextRequest, NextResponse } from 'next/server';
import { MarketInsightsService } from '@/lib/services/marketInsightsService';
import { commerceAudienceService } from '@/lib/services/commerceAudienceService';
import { GeographicLevel } from '@/types/censusData';

const marketInsightsService = new MarketInsightsService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { geoLevel, marketName, includeCommercialZips = false, categoryFilter } = body;

    // Validation
    if (!geoLevel || !marketName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: geoLevel and marketName'
        },
        { status: 400 }
      );
    }

    const categoryLabel = categoryFilter && categoryFilter !== 'All Categories' 
      ? ` [${categoryFilter}]` 
      : '';
    console.log(`🛒 Getting commerce data for ${marketName} (${geoLevel})${categoryLabel}`);
    console.log(`   📝 categoryFilter received: "${categoryFilter}" (type: ${typeof categoryFilter})`);

    // Get the ZIP codes for this market
    const zipCodes = await marketInsightsService.getMarketZipCodes(
      geoLevel as GeographicLevel,
      marketName,
      includeCommercialZips
    );

    if (zipCodes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Market not found or has no ZIP codes'
        },
        { status: 404 }
      );
    }

    console.log(`   📍 Found ${zipCodes.length} ZIP codes for ${marketName}`);

    // Get commerce segments with over-index for these ZIP codes, optionally filtered by category
    const segments = await commerceAudienceService.getSegmentsWithOverIndex(
      zipCodes,
      10, // outlierPercentile
      categoryFilter
    );

    // Debug: Log the categories of returned segments
    if (categoryFilter && categoryFilter !== 'All Categories') {
      const categoryCounts = segments.reduce((acc, seg) => {
        acc[seg.level1Category] = (acc[seg.level1Category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log(`   📊 Segments by category after filter:`, categoryCounts);
    }

    // Sort by total weight (popularity in this market)
    const sortedByPopularity = [...segments]
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .slice(0, 10);

    // Sort by over-index (how much this market over-indexes vs national)
    const sortedByOverIndex = [...segments]
      .sort((a, b) => b.overIndex - a.overIndex)
      .slice(0, 10);

    console.log(`   ✅ Found ${segments.length} segments, top by popularity: ${sortedByPopularity[0]?.name} (${sortedByPopularity[0]?.level1Category}), top by over-index: ${sortedByOverIndex[0]?.name} (${sortedByOverIndex[0]?.level1Category})`);

    return NextResponse.json({
      success: true,
      marketName,
      geoLevel,
      zipCodeCount: zipCodes.length,
      totalSegments: segments.length,
      categoryFilter: categoryFilter || 'All Categories',
      topByPopularity: sortedByPopularity,
      topByOverIndex: sortedByOverIndex
    });
  } catch (error) {
    console.error('Error fetching market commerce data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch market commerce data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

