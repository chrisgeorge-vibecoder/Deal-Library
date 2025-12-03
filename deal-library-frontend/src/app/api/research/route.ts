import { NextRequest, NextResponse } from 'next/server';

let researchLibraryController: any = null;

async function getResearchController() {
  if (!researchLibraryController) {
    try {
      const { SupabaseService } = await import('@/lib/services/supabaseService');
      const { ResearchLibraryController } = await import('@/lib/controllers/researchLibraryController');
      
      if (process.env.USE_SUPABASE === 'true') {
        const supabase = SupabaseService.getClient();
        researchLibraryController = new ResearchLibraryController(supabase);
      }
    } catch (error) {
      console.warn('Research Library not available:', error);
    }
  }
  return researchLibraryController;
}

export async function GET() {
  try {
    const controller = await getResearchController();
    
    if (!controller) {
      return NextResponse.json({
        error: 'Research Library Service Unavailable',
        message: 'The research library service is not configured.',
        studies: []
      }, { status: 503 });
    }
    
    const result = await controller.getAllStudiesDirect();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching research studies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research studies', studies: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const controller = await getResearchController();
    
    if (!controller) {
      return NextResponse.json({
        error: 'Research Library Service Unavailable'
      }, { status: 503 });
    }
    
    const body = await request.json();
    const result = await controller.createStudyDirect(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating research study:', error);
    return NextResponse.json(
      { error: 'Failed to create research study' },
      { status: 500 }
    );
  }
}

