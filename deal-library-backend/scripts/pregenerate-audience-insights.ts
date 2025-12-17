/**
 * Pre-generate Commerce Audience Insights for all segments
 * 
 * This script generates and caches audience insights reports for all 199 segments,
 * making subsequent queries instantaneous (<100ms instead of ~35s).
 * 
 * Usage:
 *   npm run pregenerate-insights              # Generate all segments
 *   npm run pregenerate-insights -- --limit=10  # Generate first 10 only (for testing)
 *   npm run pregenerate-insights -- --segment="Pet Supplies"  # Generate specific segment
 * 
 * The script:
 * 1. Loads commerce audience data
 * 2. Gets all unique segment names
 * 3. Generates reports using audienceInsightsService (with Gemini Pro)
 * 4. Caches results in Supabase with 30-day TTL
 * 
 * Estimated time: ~100 minutes for all 199 segments (30s each)
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { commerceAudienceService } from '../src/services/commerceAudienceService';
import { audienceInsightsService } from '../src/services/audienceInsightsService';
import { CensusDataService } from '../src/services/censusDataService';

interface GenerationStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  totalTime: number;
  averageTime: number;
}

async function pregenerateInsights(): Promise<void> {
  console.log('\n' + '═'.repeat(80));
  console.log('  🚀 PRE-GENERATING COMMERCE AUDIENCE INSIGHTS');
  console.log('  This will generate and cache reports for instant retrieval');
  console.log('═'.repeat(80) + '\n');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const segmentArg = args.find(arg => arg.startsWith('--segment='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1] || '0') : undefined;
  const specificSegment = segmentArg ? segmentArg.split('=')[1] || '' : undefined;

  // Step 1: Load commerce audience data
  console.log('📦 Step 1: Loading commerce audience data...');
  const loadResult = await commerceAudienceService.loadCommerceData();
  if (!loadResult.success) {
    console.error('❌ Failed to load commerce data:', loadResult.message);
    process.exit(1);
  }
  console.log(`   ✅ Loaded ${loadResult.stats?.totalRecords?.toLocaleString() || 'N/A'} records\n`);

  // Step 2: Load census data
  console.log('📊 Step 2: Loading census data...');
  const censusService = CensusDataService.getInstance();
  await censusService.loadCensusData();
  console.log('   ✅ Census data ready\n');

  // Step 3: Get all segments
  console.log('📋 Step 3: Getting audience segments...');
  let allSegments = commerceAudienceService.getAudienceSegments()
    .map(s => s.name)
    .sort();

  if (specificSegment) {
    allSegments = allSegments.filter(s => 
      s.toLowerCase().includes(specificSegment.toLowerCase())
    );
    console.log(`   🔍 Filtered to segments matching "${specificSegment}"`);
  }

  if (limit && limit > 0) {
    allSegments = allSegments.slice(0, limit);
    console.log(`   📊 Limited to first ${limit} segments`);
  }

  console.log(`   ✅ Found ${allSegments.length} segments to process\n`);

  // Step 4: Generate reports
  console.log('🎯 Step 4: Generating insights reports...\n');
  
  const stats: GenerationStats = {
    total: allSegments.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    totalTime: 0,
    averageTime: 0
  };

  const startTime = Date.now();
  const failedSegments: string[] = [];

  for (let i = 0; i < allSegments.length; i++) {
    const segment = allSegments[i];
    if (!segment) continue;
    
    const segmentStart = Date.now();
    
    console.log(`\n[${'─'.repeat(70)}]`);
    console.log(`[${i + 1}/${allSegments.length}] Processing: "${segment}"`);
    console.log(`[${'─'.repeat(70)}]`);

    try {
      // Pre-generate the report with 30-day TTL
      await audienceInsightsService.pregenerateReport(segment, 'Commerce');
      
      const duration = (Date.now() - segmentStart) / 1000;
      stats.successful++;
      stats.totalTime += duration;
      
      console.log(`✅ Generated in ${duration.toFixed(1)}s`);
      
      // Progress update
      const elapsed = (Date.now() - startTime) / 1000;
      const avgPerSegment = elapsed / (i + 1);
      const remaining = (allSegments.length - i - 1) * avgPerSegment;
      
      console.log(`   Progress: ${stats.successful}/${stats.total} (${((i + 1) / stats.total * 100).toFixed(1)}%)`);
      console.log(`   Elapsed: ${formatTime(elapsed)} | ETA: ${formatTime(remaining)}`);
      
      // Add a small delay between segments to avoid rate limiting
      if (i < allSegments.length - 1) {
        await sleep(1000);
      }
      
    } catch (error) {
      const duration = (Date.now() - segmentStart) / 1000;
      stats.failed++;
      failedSegments.push(segment);
      
      console.error(`❌ Failed after ${duration.toFixed(1)}s:`, error instanceof Error ? error.message : error);
      
      // Continue to next segment
      continue;
    }
  }

  // Calculate final stats
  const totalElapsed = (Date.now() - startTime) / 1000;
  stats.averageTime = stats.successful > 0 ? stats.totalTime / stats.successful : 0;

  // Print summary
  console.log('\n' + '═'.repeat(80));
  console.log('  📊 GENERATION COMPLETE - SUMMARY');
  console.log('═'.repeat(80));
  console.log(`
  Total Segments:    ${stats.total}
  ✅ Successful:      ${stats.successful}
  ❌ Failed:          ${stats.failed}
  ⏭️  Skipped:         ${stats.skipped}
  
  ⏱️  Total Time:      ${formatTime(totalElapsed)}
  📈 Avg per Segment: ${stats.averageTime.toFixed(1)}s
  `);

  if (failedSegments.length > 0) {
    console.log('  ❌ Failed Segments:');
    failedSegments.forEach((s: string) => console.log(`     - ${s}`));
  }

  console.log('\n' + '═'.repeat(80));
  
  if (stats.failed > 0) {
    console.log('⚠️  Some segments failed. Re-run the script to retry them.');
    process.exit(1);
  } else {
    console.log('✅ All segments pre-generated successfully!');
    console.log('   Future queries will return cached results instantly.');
    process.exit(0);
  }
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(0)}s`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the script
pregenerateInsights().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

