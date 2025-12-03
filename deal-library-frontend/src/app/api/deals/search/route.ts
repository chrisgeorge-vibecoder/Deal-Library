import { NextRequest, NextResponse } from 'next/server';

let dealsController: any = null;

async function getDealsController() {
  if (!dealsController) {
    const { DealsController } = await import('@/lib/controllers/dealsController');
    dealsController = new DealsController();
  }
  return dealsController;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const controller = await getDealsController();
    
    // Create mock request/response for the controller
    const result = await controller.searchDealsAIDirect(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error searching deals:', error);
    return NextResponse.json(
      { error: 'Failed to search deals' },
      { status: 500 }
    );
  }
}

