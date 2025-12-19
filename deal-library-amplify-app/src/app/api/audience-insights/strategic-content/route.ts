import { NextRequest, NextResponse } from 'next/server';
import { audienceInsightsService } from '@/lib/services/audienceInsightsService';

const STRATEGIC_CONTENT_TIMEOUT_MS = 60000; // 60 seconds for strategic content generation

export async function POST(request: NextRequest) {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Strategic content generation timeout'));
    }, STRATEGIC_CONTENT_TIMEOUT_MS);
  });

  try {
    const body = await request.json();
    const { segment, category, demographics, overlaps, geoIntelligence, commerceBaseline } = body;

    // Validate required fields
    if (!segment || !demographics) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Segment and demographics are required.'
        },
        { status: 400 }
      );
    }

    console.log('✨ Generating strategic content for:', segment);

    // Generate strategic content
    const strategicContentPromise = audienceInsightsService.generateStrategicContent(
      segment,
      category || 'General',
      demographics,
      overlaps || [],
      geoIntelligence || { topCities: [], topStates: [], regionalInsights: [] },
      commerceBaseline || { medianHHI: 75000, educationBachelorsPlus: 40, medianAge: 42 }
    );

    const strategicContent = await Promise.race([strategicContentPromise, timeoutPromise]);

    return NextResponse.json({
      success: true,
      ...strategicContent
    });
  } catch (error: any) {
    console.error('❌ Error generating strategic content:', error);
    
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request timeout',
          message: 'Strategic content generation took too long. Please try again.'
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate strategic content',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

