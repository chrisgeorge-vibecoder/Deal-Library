import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/audience-geo-analysis/segments`);
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching audience geo segments:', error);
    return NextResponse.json(
      { success: false, segments: [], error: 'Failed to fetch segments from backend' },
      { status: 500 }
    );
  }
}

