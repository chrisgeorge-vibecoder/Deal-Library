import { NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

export async function GET() {
  try {
    const controller = getDealsController();
    const result = await controller.getCensusDataStatusDirect();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting census status:', error);
    return NextResponse.json(
      { error: 'Failed to get census status', loaded: false },
      { status: 500 }
    );
  }
}
