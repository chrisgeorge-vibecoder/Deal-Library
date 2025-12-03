import { NextRequest, NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const controller = getDealsController();
    const result = await controller.generateMarketingSWOTDirect(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating marketing SWOT:', error);
    return NextResponse.json(
      { error: 'Failed to generate marketing SWOT' },
      { status: 500 }
    );
  }
}
