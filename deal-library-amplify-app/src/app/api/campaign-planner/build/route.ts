import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('📥 Campaign Planner Build API route called');
  
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

    // Build proposal
    const proposalBuilder = new ProposalBuilderService();
    const report = await proposalBuilder.buildProposal({
      advertiserName,
      selectedAudiences,
      campaignObjective,
      budgetRange,
      geographicFocus
    });

    console.log('✅ Proposal built successfully');
    return NextResponse.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('❌ Error building proposal:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        error: 'Failed to build proposal',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

