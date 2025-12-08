import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return empty categories - research library requires Supabase
    return NextResponse.json({
      success: true,
      categories: []
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', categories: [] },
      { status: 500 }
    );
  }
}
