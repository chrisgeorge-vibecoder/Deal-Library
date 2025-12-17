import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return empty studies - research library requires Supabase
    return NextResponse.json({
      success: true,
      studies: [],
      message: 'Research library available when Supabase is configured'
    });
  } catch (error) {
    console.error('Error fetching research studies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research studies', studies: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      message: 'Research library creation requires Supabase',
      data: body
    });
  } catch (error) {
    console.error('Error creating research study:', error);
    return NextResponse.json(
      { error: 'Failed to create research study' },
      { status: 500 }
    );
  }
}
