import { NextRequest, NextResponse } from 'next/server';

let dealsController: any = null;

async function getDealsController() {
  if (!dealsController) {
    const { DealsController } = await import('@/lib/controllers/dealsController');
    dealsController = new DealsController();
  }
  return dealsController;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const controller = await getDealsController();
    const deal = await controller.getDealByIdDirect(params.id);
    
    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(deal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const controller = await getDealsController();
    const result = await controller.updateDealDirect(params.id, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json(
      { error: 'Failed to update deal' },
      { status: 500 }
    );
  }
}

