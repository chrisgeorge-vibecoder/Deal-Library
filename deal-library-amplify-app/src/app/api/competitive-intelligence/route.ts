import { NextRequest, NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const controller = getDealsController();
    const result = await controller.generateCompetitiveIntelligenceDirect(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating competitive intelligence:', error);
    return NextResponse.json(
      { error: 'Failed to generate competitive intelligence' },
      { status: 500 }
    );
  }
}
