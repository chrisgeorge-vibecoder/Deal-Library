import { NextResponse } from 'next/server';

let dealsController: any = null;

async function getDealsController() {
  if (!dealsController) {
    const { DealsController } = await import('@/lib/controllers/dealsController');
    dealsController = new DealsController();
  }
  return dealsController;
}

export async function GET() {
  try {
    const controller = await getDealsController();
    const result = await controller.getCensusDataStatusDirect();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting census status:', error);
    return NextResponse.json(
      { error: 'Failed to get census status' },
      { status: 500 }
    );
  }
}

