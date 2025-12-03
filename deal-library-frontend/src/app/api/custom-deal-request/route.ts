import { NextRequest, NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const controller = getDealsController();
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
