import { NextRequest, NextResponse } from 'next/server';
import { audienceInsightsService } from '@/lib/services/audienceInsightsService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// AWS Amplify serverless functions have timeout limits (10-30 seconds)
// We need to ensure we return before that limit
const API_TIMEOUT_MS = 25000; // 25 seconds - leave buffer for Amplify timeout

export async function POST(request: NextRequest) {
  // Create a timeout promise that rejects after API_TIMEOUT_MS
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('API request timeout - serverless function limit reached'));
    }, API_TIMEOUT_MS);
  });

  try {
    const body = await request.json();
    const segment = body.segment || body.audienceSegment;
    const category = body.category || 'General';
    const includeCommercialZips = body.includeCommercialZips || false;
    
    console.log('🎯 Generating audience insights report:', { segment, category, includeCommercialZips });
    
    // Race between report generation and timeout
    const reportPromise = audienceInsightsService.generateReport(segment, category, includeCommercialZips);
    const report = await Promise.race([reportPromise, timeoutPromise]);
    
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
  } catch (error: any) {
    console.error('❌ Error generating audience insights report:', error);
    
    // If it's a timeout, return a specific error
    if (error.message?.includes('timeout') || error.name === 'AbortError') {
      console.error('⏰ Request timed out before completion');
      return NextResponse.json(
        { 
          success: false,
          error: 'Request timeout',
          message: 'The audience insights report generation took too long. Please try again with a different segment.',
          report: null,
          recommendedDeals: []
        },
        { status: 504 } // Gateway Timeout
      );
    }
    
    // For other errors, return a 500 with error details
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate audience insights report',
        message: error.message || 'Unknown error occurred',
        report: null,
        recommendedDeals: []
      },
      { status: 500 }
    );
  }
}
