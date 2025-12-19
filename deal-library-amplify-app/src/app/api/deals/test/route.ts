import { NextResponse } from 'next/server';
import { AppsScriptService } from '@/lib/services/appsScriptService';

/**
 * Test endpoint to diagnose deals fetching issues
 * Access at: /api/deals/test
 */
export async function GET() {
  try {
    const testResults: any = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      steps: [],
    };

    // Step 1: Check environment variable
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    testResults.steps.push({
      step: 1,
      name: 'Check Environment Variable',
      passed: !!appsScriptUrl,
      details: {
        hasAppsScriptUrl: !!appsScriptUrl,
        urlLength: appsScriptUrl?.length || 0,
        urlPrefix: appsScriptUrl ? appsScriptUrl.substring(0, 50) + '...' : null,
      },
    });

    if (!appsScriptUrl) {
      testResults.status = 'FAILED';
      testResults.error = 'GOOGLE_APPS_SCRIPT_URL not set';
      return NextResponse.json(testResults);
    }

    // Step 2: Initialize AppsScriptService
    let appsScriptService: AppsScriptService;
    try {
      appsScriptService = new AppsScriptService();
      testResults.steps.push({
        step: 2,
        name: 'Initialize AppsScriptService',
        passed: true,
        details: 'Service initialized successfully',
      });
    } catch (error) {
      testResults.steps.push({
        step: 2,
        name: 'Initialize AppsScriptService',
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      });
      testResults.status = 'FAILED';
      return NextResponse.json(testResults);
    }

    // Step 3: Test health endpoint
    try {
      const healthResult = await appsScriptService.healthCheck();
      testResults.steps.push({
        step: 3,
        name: 'Test Health Endpoint',
        passed: true,
        details: healthResult,
      });
    } catch (error) {
      testResults.steps.push({
        step: 3,
        name: 'Test Health Endpoint',
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      });
      testResults.status = 'WARNING';
    }

    // Step 4: Test getAllDeals
    try {
      const deals = await appsScriptService.getAllDeals();
      testResults.steps.push({
        step: 4,
        name: 'Fetch Deals',
        passed: true,
        details: {
          dealCount: deals.length,
          firstDeal: deals.length > 0 ? {
            id: deals[0].id,
            dealName: deals[0].dealName,
            dealId: deals[0].dealId,
          } : null,
        },
      });
      testResults.totalDeals = deals.length;
    } catch (error) {
      testResults.steps.push({
        step: 4,
        name: 'Fetch Deals',
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      testResults.status = 'FAILED';
      testResults.error = error instanceof Error ? error.message : String(error);
    }

    console.log('🔍 Deals Test Results:', JSON.stringify(testResults, null, 2));
    
    return NextResponse.json(testResults);
  } catch (error) {
    const errorInfo = {
      status: 'ERROR',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };
    
    console.error('❌ Test endpoint error:', errorInfo);
    
    return NextResponse.json(errorInfo, { status: 500 });
  }
}


