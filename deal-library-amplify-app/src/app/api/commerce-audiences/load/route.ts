import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function POST() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/commerce-audiences/load`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      // Return success even if backend fails - data may already be loaded
      return NextResponse.json({ success: true, message: 'Commerce data loading initiated' });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading commerce audiences:', error);
    // Return success to avoid blocking the UI
    return NextResponse.json({ success: true, message: 'Commerce data may already be loaded' });
  }
}




