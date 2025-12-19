import { NextRequest, NextResponse } from 'next/server';
import { audienceInsightsService } from '@/lib/services/audienceInsightsService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Timeout for report generation
// Note: AWS Amplify has a 60s limit for serverless functions
// We set this to 58 seconds to leave a small buffer for response formatting
const API_TIMEOUT_MS = process.env.NODE_ENV === 'production' 
  ? 58000  // 58 seconds for production (leaves 2s buffer for Amplify 60s limit)
  : 90000; // 90 seconds for development (more forgiving)

export async function POST(request: NextRequest) {
  // Create a timeout promise that rejects after API_TIMEOUT_MS
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('API request timeout - serverless function limit reached'));
    }, API_TIMEOUT_MS);
  });

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
          message: 'The request body must be valid JSON.',
          report: null,
          recommendedDeals: []
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
          message: 'Request body must be an object.',
          report: null,
          recommendedDeals: []
        },
        { status: 400 }
      );
    }

    const segment = body.segment || body.audienceSegment;
    const category = body.category || 'General';
    const includeCommercialZips = body.includeCommercialZips || false;
    
    // Validate input
    if (!segment || typeof segment !== 'string' || segment.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid input',
          message: 'Segment name is required and must be a non-empty string',
          report: null,
          recommendedDeals: []
        },
        { status: 400 }
      );
    }
    
    const skipStrategicContent = body.skipStrategicContent === true;
    console.log('🎯 Generating audience insights report:', { segment, category, includeCommercialZips, skipStrategicContent });
    
    // Race between report generation and timeout
    // Skip strategic content (Gemini calls) for faster initial response - can be loaded separately
    const reportPromise = audienceInsightsService.generateReport(segment.trim(), category, includeCommercialZips, skipStrategicContent);
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
    console.error('   Error type:', error?.constructor?.name);
    console.error('   Error message:', error?.message);
    console.error('   Error stack:', error?.stack?.substring(0, 500));
    
    // If it's a timeout, return a specific error
    if (error.message?.includes('timeout') || error.name === 'AbortError' || error.message?.includes('timeout')) {
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
    
    // Check for specific error types
    const errorMessage = error?.message || 'Unknown error occurred';
    let statusCode = 500;
    let userMessage = errorMessage;
    
    // Handle validation errors
    if (errorMessage.includes('required') || errorMessage.includes('must be')) {
      statusCode = 400;
      userMessage = errorMessage;
    }
    // Handle data not found errors
    else if (errorMessage.includes('No geographic data') || errorMessage.includes('No valid demographic data')) {
      statusCode = 404;
      userMessage = `No data found for this segment. Please verify the segment name is correct and try again.`;
    }
    // Handle service unavailable errors
    else if (errorMessage.includes('not available') || errorMessage.includes('not loaded')) {
      statusCode = 503;
      userMessage = 'The data service is temporarily unavailable. Please try again in a few moments.';
    }
    
    // For other errors, return a 500 with error details
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate audience insights report',
        message: userMessage,
        report: null,
        recommendedDeals: []
      },
      { status: statusCode }
    );
  }
}
