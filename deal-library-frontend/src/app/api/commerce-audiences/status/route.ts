import { NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

export async function GET() {
  try {
    const controller = getDealsController();
    const result = await controller.getCommerceAudienceStatusDirect();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting commerce audience status:', error);
    return NextResponse.json(
      { error: 'Failed to get commerce audience status', loaded: false },
      { status: 500 }
    );
  }
}
