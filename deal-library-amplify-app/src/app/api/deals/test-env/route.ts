import { NextResponse } from 'next/server';

/**
 * Minimal test endpoint to check environment variable access
 * This tests if env vars are accessible at all in API routes
 */
export async function GET() {
  try {
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const geminiKey = process.env.GEMINI_API_KEY;
    
    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      envVars: {
        hasAppsScriptUrl: !!appsScriptUrl,
        appsScriptUrlLength: appsScriptUrl?.length || 0,
        appsScriptUrlPrefix: appsScriptUrl ? appsScriptUrl.substring(0, 30) + '...' : null,
        hasGeminiKey: !!geminiKey,
        geminiKeyLength: geminiKey?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        allEnvKeys: Object.keys(process.env).filter(k => 
          k.includes('GOOGLE') || k.includes('APPS') || k.includes('GEMINI')
        ),
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}




