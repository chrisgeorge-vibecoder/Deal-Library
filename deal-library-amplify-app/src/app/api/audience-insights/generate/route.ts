import { NextRequest, NextResponse } from 'next/server';
import { audienceInsightsService } from '@/lib/services/audienceInsightsService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const segment = body.segment || body.audienceSegment;
    const category = body.category || 'General';
    const includeCommercialZips = body.includeCommercialZips || false;
    
    console.log('🎯 Generating audience insights report:', { segment, category, includeCommercialZips });
    
    // Use the local audienceInsightsService directly for proper report generation
    // This service has full access to commerce data, census data, overlaps, and Gemini AI
    const report = await audienceInsightsService.generateReport(segment, category, includeCommercialZips);
    
    console.log('✅ Report generated successfully:', {
      segment: report.segment,
      personaName: report.personaName,
      hotspots: report.geographicHotspots?.length || 0,
      overlaps: report.behavioralOverlap?.length || 0
    });
    
    // Fetch deals from backend to get recommended deals
    let recommendedDeals: any[] = [];
    try {
      const dealsResponse = await fetch(`${API_BASE_URL}/api/deals`);
      if (dealsResponse.ok) {
        const dealsData = await dealsResponse.json();
        const allDeals = dealsData.deals || [];
        
        if (allDeals.length > 0) {
          // Use audienceInsightsService to match deals to this segment
          recommendedDeals = await audienceInsightsService.getRecommendedDeals(segment, category, allDeals);
          console.log(`🎯 Found ${recommendedDeals.length} recommended deals for "${segment}"`);
        }
      }
    } catch (dealsError) {
      console.warn('⚠️ Could not fetch deals for recommendations:', dealsError);
    }
    
    return NextResponse.json({
      success: true,
      report,
      recommendedDeals
    });
  } catch (error) {
    console.error('Error generating audience insights report:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate audience insights report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
