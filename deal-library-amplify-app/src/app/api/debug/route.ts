import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Log environment info
    const debugInfo = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
        useSupabase: process.env.USE_SUPABASE,
      },
      cwd: process.cwd(),
      memoryUsage: process.memoryUsage(),
    };
    
    console.log('DEBUG ENDPOINT HIT:', JSON.stringify(debugInfo, null, 2));
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    const errorInfo = {
      status: 'ERROR',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
    
    console.error('DEBUG ENDPOINT ERROR:', JSON.stringify(errorInfo, null, 2));
    
    return NextResponse.json(errorInfo, { status: 500 });
  }
}

