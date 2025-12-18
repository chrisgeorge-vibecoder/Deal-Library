import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function GET(request: NextRequest) {
  try {
    // Check if backend URL is configured and valid (not localhost or empty)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const isLocalhost = API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');
    const isEmpty = !apiUrl || apiUrl.trim() === '';
    
    if (isEmpty || isLocalhost) {
      console.warn('⚠️ Backend API URL not configured or using localhost. Returning empty deals array.');
      return NextResponse.json(
        { deals: [], message: 'Backend API not configured' },
        { status: 200 }
      );
    }

    // Proxy to backend API for reliable deal fetching
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/deals`, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`⚠️ Backend responded with status: ${response.status}. Returning empty deals array.`);
        return NextResponse.json(
          { deals: [], message: 'Backend unavailable' },
          { status: 200 }
        );
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // Re-throw to be caught by outer catch block
      throw fetchError;
    }
  } catch (error) {
    // Catch all errors (network errors, timeouts, parse errors, etc.)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('⚠️ Error fetching deals from backend:', errorMessage);
    
    // Always return 200 with empty deals array instead of 500
    // This allows the frontend to handle gracefully with mock data
    return NextResponse.json(
      { deals: [], message: 'Backend unavailable' },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const controller = getDealsController();
    const result = await controller.createDealFromBody(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}

