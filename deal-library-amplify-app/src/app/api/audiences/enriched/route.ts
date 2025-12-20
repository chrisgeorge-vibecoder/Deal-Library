import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface MarketIntelligencePack {
  segmentId: string;
  segmentName: string;
  fullPath: string;
  category: string;
  generatedAt: string;
  detailedInsight: string;
  exampleAdvertisers: Array<{
    name: string;
    type: "brand" | "category";
    rationale: string;
  }>;
  currentTrends: Array<{
    trend: string;
    relevance: string;
    timeframe: "2025" | "2026";
  }>;
  strategicHook: {
    headline: string;
    emotionalDriver: string;
    callToAction: string;
  };
}

// Cache the enriched data
let enrichedDataCache: Record<string, MarketIntelligencePack> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function loadEnrichedData(): Record<string, MarketIntelligencePack> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (enrichedDataCache && (now - cacheTimestamp) < CACHE_TTL) {
    return enrichedDataCache;
  }
  
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'enriched-audiences.json');
    
    if (!fs.existsSync(dataPath)) {
      return {};
    }
    
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    enrichedDataCache = JSON.parse(fileContent);
    cacheTimestamp = now;
    
    return enrichedDataCache || {};
  } catch (error) {
    console.error('Error loading enriched audiences data:', error);
    return {};
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const segmentId = searchParams.get('segmentId');
    
    if (!segmentId) {
      return NextResponse.json(
        { success: false, error: 'segmentId parameter is required' },
        { status: 400 }
      );
    }
    
    const enrichedData = loadEnrichedData();
    const pack = enrichedData[segmentId];
    
    if (!pack) {
      return NextResponse.json(
        { success: false, error: 'Enriched data not found for this segment' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: pack
    });
  } catch (error) {
    console.error('Error in enriched audiences API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load enriched data' },
      { status: 500 }
    );
  }
}

