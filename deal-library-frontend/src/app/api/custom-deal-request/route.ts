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
    const result = await controller.submitCustomDealRequestDirect(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error submitting custom deal request:', error);
    return NextResponse.json(
      { error: 'Failed to submit custom deal request' },
      { status: 500 }
    );
  }
}

