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
    const result = await controller.getCommerceAudienceSegmentsDirect();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting commerce audience segments:', error);
    return NextResponse.json(
      { error: 'Failed to get commerce audience segments' },
      { status: 500 }
    );
  }
}

