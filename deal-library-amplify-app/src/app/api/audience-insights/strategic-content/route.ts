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

    const { segment, category, demographics, overlaps, geoIntelligence, commerceBaseline } = body;

    // Validate required fields
    if (!segment || typeof segment !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Segment is required and must be a string.'
        },
        { status: 400 }
      );
    }

    if (!demographics || typeof demographics !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Demographics is required and must be an object.'
        },
        { status: 400 }
      );
    }

    console.log('✨ Generating strategic content for:', segment);
    console.log('   Demographics keys:', Object.keys(demographics || {}));
    console.log('   Overlaps count:', overlaps?.length || 0);
    console.log('   Commerce baseline:', commerceBaseline ? 'provided' : 'using defaults');

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

    console.log('✅ Strategic content generated successfully:', {
      hasExecutiveSummary: !!strategicContent.executiveSummary,
      hasStrategicInsights: !!strategicContent.strategicInsights,
      personaName: strategicContent.personaName,
      personaEmoji: strategicContent.personaEmoji
    });

    return NextResponse.json({
      success: true,
      executiveSummary: strategicContent.executiveSummary,
      strategicInsights: strategicContent.strategicInsights,
      personaName: strategicContent.personaName,
      personaEmoji: strategicContent.personaEmoji,
      personaDescription: strategicContent.personaDescription
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

