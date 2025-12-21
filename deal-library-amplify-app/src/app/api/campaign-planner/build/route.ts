import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Timeout for campaign proposal generation
// AWS Amplify has a 60s limit for serverless functions
// We set this to 55 seconds to leave buffer for response formatting
const API_TIMEOUT_MS = process.env.NODE_ENV === 'production' 
  ? 55000  // 55 seconds for production (leaves 5s buffer for Amplify 60s limit)
  : 90000; // 90 seconds for development (more forgiving)

export async function POST(request: NextRequest) {
  console.log('📥 Campaign Planner Build API route called');
  
  // Create a timeout promise that rejects after API_TIMEOUT_MS
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('API request timeout - serverless function limit reached'));
    }, API_TIMEOUT_MS);
  });

  try {
    // Lazy import to catch import errors
    let ProposalBuilderService;
    try {
      const module = await import('@/lib/services/proposalBuilderService');
      ProposalBuilderService = module.ProposalBuilderService;
    } catch (importError) {
      console.error('❌ Failed to import ProposalBuilderService:', importError);
      return NextResponse.json(
        { 
          error: 'Failed to load ProposalBuilderService',
          message: importError instanceof Error ? importError.message : 'Unknown import error',
          details: process.env.NODE_ENV === 'development' ? String(importError) : undefined
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { advertiserName, selectedAudiences, campaignObjective, budgetRange, geographicFocus } = body;

    console.log('📋 Building proposal with:', { advertiserName, selectedAudiences, campaignObjective });

    // Validate input
    if (!advertiserName || !selectedAudiences || !Array.isArray(selectedAudiences) || selectedAudiences.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: advertiserName and selectedAudiences' },
        { status: 400 }
      );
    }

    if (!campaignObjective) {
      return NextResponse.json(
        { error: 'Missing required field: campaignObjective' },
        { status: 400 }
      );
    }

    // Build proposal with timeout protection
    const proposalBuilder = new ProposalBuilderService();
    const report = await Promise.race([
      proposalBuilder.buildProposal({
        advertiserName,
        selectedAudiences,
        campaignObjective,
        budgetRange,
        geographicFocus
      }),
      timeoutPromise
    ]) as any;

    console.log('✅ Proposal built successfully');
    return NextResponse.json({
      success: true,
      report
    });
  } catch (error: any) {
    console.error('❌ Error building proposal:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    
    // Check if it's a timeout error
    if (error.message?.includes('timeout') || error.name === 'AbortError') {
      console.error('⏰ Campaign proposal generation timed out before completion');
      return NextResponse.json(
        { 
          success: false,
          error: 'Request timeout',
          message: 'The proposal generation took too long. Please try again or reduce the number of audiences.',
        },
        { status: 504 } // Gateway Timeout
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to build proposal',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

