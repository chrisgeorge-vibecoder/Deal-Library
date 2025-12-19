import { NextRequest, NextResponse } from 'next/server';
import { MarketInsightsService } from '@/lib/services/marketInsightsService';
import { commerceAudienceService } from '@/lib/services/commerceAudienceService';
import { GeographicLevel } from '@/types/censusData';

const marketInsightsService = new MarketInsightsService();

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          message: 'The request body must be valid JSON.'
        },
        { status: 400 }
      );
    }

    // Validate body structure
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          message: 'Request body must be an object.'
        },
        { status: 400 }
      );
    }

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
    if (zipCodes.length > 0 && zipCodes.length <= 20) {
      console.log(`   📍 Sample ZIP codes: ${zipCodes.slice(0, 10).join(', ')}${zipCodes.length > 10 ? '...' : ''}`);
    } else if (zipCodes.length > 20) {
      console.log(`   📍 Sample ZIP codes: ${zipCodes.slice(0, 5).join(', ')}... (${zipCodes.length} total)`);
    }

    // Check commerce data status (but don't force full load - let getSegmentsWithOverIndex handle on-demand loading)
    const status = commerceAudienceService.getStatus();
    console.log(`   📊 Commerce data status: isLoaded=${status.isLoaded}, totalRecords=${status.totalRecords}`);
    
    // Note: We're NOT loading full data here. Instead, getSegmentsWithOverIndex will use
    // on-demand loading for specific ZIP codes, which is much faster and avoids timeouts.
    if (status.isLoaded && status.totalRecords > 0) {
      console.log(`   ✅ Commerce data already loaded: ${status.totalRecords} records available`);
    } else {
      console.log('   ⚡ Will use on-demand loading for specific ZIP codes (faster than full load)');
    }

    // Get commerce segments with over-index for these ZIP codes, optionally filtered by category
    let segments;
    try {
      console.log(`   🔍 Getting segments with over-index for ${zipCodes.length} ZIP codes...`);
      segments = await commerceAudienceService.getSegmentsWithOverIndex(
        zipCodes,
        10, // outlierPercentile
        categoryFilter
      );
      console.log(`   ✅ Retrieved ${segments.length} segments`);
      
      if (segments.length === 0) {
        // Diagnostic: Check if there's any commerce data for these ZIP codes at all
        const commerceStatus = commerceAudienceService.getStatus();
        console.log(`   ⚠️ No segments found. Commerce data status: ${commerceStatus.totalRecords} total records, ${commerceStatus.audienceSegments.length} segments available`);
        
        // Check if any of the ZIP codes have commerce data (even if no segments pass filters)
        const testSegments = commerceAudienceService.getSegmentsForZipCodes(zipCodes.slice(0, 10)); // Test first 10 ZIPs
        console.log(`   🔬 Diagnostic: First 10 ZIPs returned ${testSegments.length} segments before filtering`);
      }
    } catch (segmentError) {
      console.error('   ❌ Error getting segments:', segmentError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to get commerce segments',
          message: segmentError instanceof Error ? segmentError.message : 'Unknown error getting segments'
        },
        { status: 500 }
      );
    }

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

