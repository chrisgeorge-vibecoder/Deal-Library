import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/services/geminiService';
import { AudienceSearchService } from '@/lib/services/audienceSearchService';
import { AudienceSearchFilters } from '@/lib/types/audienceTaxonomy';

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
    // Parse request body
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

    // Validate required fields
    if (!body || typeof body !== 'object' || !body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          message: 'Query is required and must be a string.'
        },
        { status: 400 }
      );
    }

    const { query, filters } = body;

    console.log(`🔍 Audience search request: "${query}"`);

    // Initialize services
    let geminiService: GeminiService;
    try {
      // Try to get Supabase client if available
      const supabase = process.env.USE_SUPABASE === 'true' 
        ? (await import('@/lib/services/supabaseService')).SupabaseService.getClient()
        : null;
      geminiService = new GeminiService(supabase || undefined);
    } catch (error) {
      console.error('Error initializing GeminiService:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Service unavailable',
          message: 'Failed to initialize search service. Please check your API key configuration.'
        },
        { status: 503 }
      );
    }

    const searchService = new AudienceSearchService(geminiService);

    // Race between the actual search and the timeout
    const results = await Promise.race([
      searchService.searchAudiences(query, filters as AudienceSearchFilters),
      timeoutPromise
    ]);

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error: any) {
    console.error('❌ Error searching audiences:', error);
    
    // Handle timeout specifically
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request timeout',
          message: 'The search request took too long. Please try a more specific query.'
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search audiences',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

