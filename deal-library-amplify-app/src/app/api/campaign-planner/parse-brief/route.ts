import { NextRequest, NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const controller = getDealsController();
    const result = await controller.parseBriefDirect(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error parsing brief:', error);
    return NextResponse.json(
      { error: 'Failed to parse brief' },
      { status: 500 }
    );
  }
}
