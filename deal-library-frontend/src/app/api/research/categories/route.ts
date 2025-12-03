import { NextResponse } from 'next/server';

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
        categories: []
      }, { status: 503 });
    }
    
    const result = await controller.getCategoriesDirect();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', categories: [] },
      { status: 500 }
    );
  }
}

