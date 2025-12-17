import { NextResponse } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';

export async function GET() {
  try {
    const controller = getDealsController();
    // Return empty personas for now - actual implementation would use PersonaService
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching personas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    );
  }
}
