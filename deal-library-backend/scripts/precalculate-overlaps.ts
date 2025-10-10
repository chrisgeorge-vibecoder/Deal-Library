/**
 * One-time script to pre-calculate behavioral overlaps for all Commerce Audience segment pairs
 * This dramatically speeds up Audience Insights queries from ~27s to ~3s
 */

import * as fs from 'fs';
import * as path from 'path';
import { commerceAudienceService } from '../src/services/commerceAudienceService';

interface SegmentOverlap {
  segment1: string;
  segment2: string;
  overlapPercentage: number;
  intersection: number;
  union: number;
  timestamp: string;
}

async function precalculateOverlaps() {
  console.log('🚀 Starting overlap pre-calculation...\n');
  
  // Load commerce audience data
  console.log('📦 Loading commerce audience data...');
  const loadResult = await commerceAudienceService.loadCommerceData();
  if (!loadResult.success) {
    console.error('❌ Failed to load commerce data:', loadResult.message);
    process.exit(1);
  }
  console.log(`✅ Loaded ${loadResult.stats?.totalRecords.toLocaleString()} records\n`);

  // Get all segments
  const allSegments = commerceAudienceService.getAudienceSegments().map(s => s.name);
  console.log(`📊 Found ${allSegments.length} audience segments`);
  
  const totalPairs = (allSegments.length * (allSegments.length - 1)) / 2;
  console.log(`🔢 Need to calculate ${totalPairs.toLocaleString()} unique pairs\n`);

  const overlaps: SegmentOverlap[] = [];
  const startTime = Date.now();
  let processed = 0;
  const zipLimitPerSegment = 200; // Use top 200 ZIPs per segment for overlap calculation

  // Create a cache for segment ZIP sets to avoid re-fetching
  console.log('🗂️  Building ZIP code cache for all segments...');
  const zipCache = new Map<string, Set<string>>();
  
  for (const segment of allSegments) {
    const zips = commerceAudienceService.searchZipCodesByAudience(segment, zipLimitPerSegment);
    zipCache.set(segment, new Set(zips.map((z: any) => z.zipCode)));
  }
  console.log(`✅ Cached ZIP codes for ${allSegments.length} segments\n`);

  console.log('⚙️  Calculating overlaps...');
  
  // Calculate overlaps for all pairs
  for (let i = 0; i < allSegments.length; i++) {
    const segment1 = allSegments[i];
    if (!segment1) continue;
    
    const segment1Zips = zipCache.get(segment1);
    if (!segment1Zips) continue;

    for (let j = i + 1; j < allSegments.length; j++) {
      const segment2 = allSegments[j];
      if (!segment2) continue;
      
      const segment2Zips = zipCache.get(segment2);
      if (!segment2Zips) continue;

      // Calculate Jaccard similarity (intersection / union)
      const intersection = new Set([...segment1Zips].filter(z => segment2Zips.has(z)));
      const union = new Set([...segment1Zips, ...segment2Zips]);
      const overlapPercentage = union.size > 0 ? (intersection.size / union.size) * 100 : 0;

      // Store the overlap
      overlaps.push({
        segment1,
        segment2,
        overlapPercentage,
        intersection: intersection.size,
        union: union.size,
        timestamp: new Date().toISOString()
      });

      processed++;
      
      // Progress indicator every 1000 pairs
      if (processed % 1000 === 0) {
        const elapsed = Date.now() - startTime;
        const rate = processed / (elapsed / 1000);
        const remaining = (totalPairs - processed) / rate;
        console.log(`   Progress: ${processed.toLocaleString()}/${totalPairs.toLocaleString()} pairs (${(processed/totalPairs*100).toFixed(1)}%) - ETA: ${Math.round(remaining)}s`);
      }
    }
  }

  const elapsed = (Date.now() - startTime) / 1000;
  console.log(`\n✅ Calculated ${overlaps.length.toLocaleString()} overlaps in ${elapsed.toFixed(1)}s`);
  console.log(`   Average: ${(overlaps.length / elapsed).toFixed(0)} pairs/second\n`);

  // Sort by overlap percentage (highest first) for easier lookup of top overlaps
  overlaps.sort((a, b) => b.overlapPercentage - a.overlapPercentage);

  // Save to JSON file
  const outputPath = path.join(__dirname, '../data/segment-overlaps.json');
  const outputData = {
    metadata: {
      totalSegments: allSegments.length,
      totalPairs: overlaps.length,
      zipLimitPerSegment,
      calculatedAt: new Date().toISOString(),
      calculationTimeSeconds: elapsed
    },
    overlaps
  };

  console.log('💾 Saving overlaps to file...');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`✅ Saved to: ${outputPath}`);
  console.log(`   File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB\n`);

  // Print some statistics
  const topOverlaps = overlaps.slice(0, 10);
  console.log('📈 Top 10 highest overlaps:');
  topOverlaps.forEach((overlap, i) => {
    console.log(`   ${i + 1}. ${overlap.segment1} ↔ ${overlap.segment2}: ${overlap.overlapPercentage.toFixed(2)}%`);
  });

  console.log(`\n🎉 Pre-calculation complete!`);
  console.log(`   Queries will now be ~10x faster!\n`);
}

// Run the script
precalculateOverlaps()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

