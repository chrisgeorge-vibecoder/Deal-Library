import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check environment variable configuration
 * Access at: /api/deals/debug
 */
export async function GET() {
  try {
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const appsScriptSecret = process.env.APPS_SCRIPT_SHARED_SECRET;
    
    // Don't expose the full URL in response, just show if it's set
    const debugInfo = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasAppsScriptUrl: !!appsScriptUrl,
        appsScriptUrlLength: appsScriptUrl?.length || 0,
        appsScriptUrlPrefix: appsScriptUrl ? appsScriptUrl.substring(0, 30) + '...' : null,
        hasAppsScriptSecret: !!appsScriptSecret,
        appsScriptSecretLength: appsScriptSecret?.length || 0,
      },
      instructions: {
        variableName: 'GOOGLE_APPS_SCRIPT_URL',
        location: 'AWS Amplify → App settings → Environment variables',
        note: 'Should NOT have NEXT_PUBLIC_ prefix (this is server-side only)',
        example: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
      },
      troubleshooting: {
        ifNotSet: 'Add GOOGLE_APPS_SCRIPT_URL to AWS Amplify Environment Variables and redeploy',
        ifSetButNotWorking: 'Check that the URL is correct and the Apps Script is deployed as a web app',
        redeploy: 'After adding environment variables, you must redeploy the app for changes to take effect',
      },
    };
    
    console.log('🔍 Deals API Debug Info:', JSON.stringify(debugInfo, null, 2));
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    const errorInfo = {
      status: 'ERROR',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
    
    console.error('❌ Debug endpoint error:', errorInfo);
    
    return NextResponse.json(errorInfo, { status: 500 });
  }
}


