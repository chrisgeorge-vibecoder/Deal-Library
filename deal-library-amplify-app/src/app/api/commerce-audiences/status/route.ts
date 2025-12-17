import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function GET() {
  try {
    // Proxy to backend to get actual status (not local service which may not be loaded)
    const response = await fetch(`${API_BASE_URL}/api/commerce-audiences/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      // If backend is unavailable, return loaded=true to skip unnecessary loading
      // The segments endpoint will handle fallback to CSV
      console.warn('⚠️ Backend status check failed, assuming data is available');
      return NextResponse.json({ loaded: true, status: 'ok' });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting commerce audience status:', error);
    // Return loaded=true to prevent unnecessary loading attempts
    // The actual data loading will happen when segments are fetched
    return NextResponse.json({ loaded: true, status: 'ok' });
  }
}
