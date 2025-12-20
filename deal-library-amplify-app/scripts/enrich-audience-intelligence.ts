/**
 * Audience Market Intelligence Pack Enrichment Pipeline
 * 
 * This script iterates through all audience segments from the Sovrn Taxonomy CSV
 * and generates CMO-level Market Intelligence Packs using Gemini 2.5 Pro with
 * Google Search grounding.
 * 
 * Usage:
 *   npm run enrich:audiences                    # Full run (1,342 segments)
 *   npm run enrich:audiences -- --limit=5       # Test with 5 segments
 *   npm run enrich:audiences -- --resume        # Resume from checkpoint
 *   npm run enrich:audiences -- --segment="Pet Supplies"  # Target specific segment
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { parse } from 'csv-parse/sync';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

// TypeScript interfaces
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

interface SegmentRow {
  segmentType: string;
  segmentId: string;
  parentId: string;
  segmentName: string;
  description: string;
  fullPath: string;
  category: string;
}

interface ProgressState {
  lastProcessedIndex: number;
  completedSegmentIds: string[];
  failedSegments: Array<{
    id: string;
    name: string;
    error: string;
    retryCount: number;
  }>;
  startedAt: string;
  lastUpdatedAt: string;
}

// Configuration
const PROGRESS_FILE = path.join(__dirname, 'progress.json');
const OUTPUT_FILE = path.join(__dirname, '../public/data/enriched-audiences.json');
const TAXONOMY_CSV = path.join(__dirname, '../public/data/Sovrn Taxonomy (AI Project).csv');
const BASE_DELAY_MS = 1500; // 1.5 seconds between requests
const CHECKPOINT_INTERVAL = 10; // Save progress every 10 segments
const GIT_COMMIT_INTERVAL = 100; // Commit and push to GitHub every 100 segments
const MAX_RETRIES = 3;
const MAX_BACKOFF_SECONDS = 64;

// Banned generic phrases
const BANNED_PHRASES = [
  "in today's fast-paced world",
  "this audience values quality",
  "in today's digital age",
  "in an ever-changing world",
  "in today's competitive landscape"
];

/**
 * Parse CSV taxonomy file
 */
function parseTaxonomyCSV(): SegmentRow[] {
  console.log('📖 Reading taxonomy CSV...');
  const csvContent = fs.readFileSync(TAXONOMY_CSV, 'utf-8');
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  
  const segments: SegmentRow[] = [];
  
  for (const record of records) {
    // Skip header row if it doesn't have segment ID
    if (!record['Sovrn Segment ID'] || record['Sovrn Segment ID'] === 'Sovrn Segment ID') {
      continue;
    }
    
    segments.push({
      segmentType: record['Segment Type'] || '',
      segmentId: record['Sovrn Segment ID'] || '',
      parentId: record['Sovrn Parent Segment ID'] || '',
      segmentName: record['Segment Name'] || '',
      description: record['Segment Description'] || '',
      fullPath: record['Full Path'] || '',
      category: record['Tier 1'] || 'General'
    });
  }
  
  console.log(`   ✅ Parsed ${segments.length} segments`);
  return segments;
}

/**
 * Load progress state from checkpoint
 */
function loadProgress(): ProgressState | null {
  if (!fs.existsSync(PROGRESS_FILE)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('   ⚠️  Could not load progress file, starting fresh');
    return null;
  }
}

/**
 * Save progress state to checkpoint
 */
function saveProgress(state: ProgressState): void {
  state.lastUpdatedAt = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

/**
 * Load existing enriched data
 */
function loadEnrichedData(): Record<string, MarketIntelligencePack> {
  if (!fs.existsSync(OUTPUT_FILE)) {
    return {};
  }
  
  try {
    const content = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('   ⚠️  Could not load existing enriched data, starting fresh');
    return {};
  }
}

/**
 * Save enriched data
 */
function saveEnrichedData(data: Record<string, MarketIntelligencePack>): void {
  const sortedData: Record<string, MarketIntelligencePack> = {};
  const sortedKeys = Object.keys(data).sort();
  
  for (const key of sortedKeys) {
    sortedData[key] = data[key];
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedData, null, 2), 'utf-8');
}

/**
 * Create CMO-level prompt for Market Intelligence Pack
 */
function createCMOPrompt(segment: SegmentRow): string {
  return `You are a CMO-level Strategy Consultant with 20+ years of experience at Fortune 500 companies. Your task is to generate a comprehensive Market Intelligence Pack for the audience segment "${segment.segmentName}".

SEGMENT CONTEXT:
- Segment Name: ${segment.segmentName}
- Full Path: ${segment.fullPath}
- Description: ${segment.description}
- Category: ${segment.category}

CRITICAL REQUIREMENTS - READ CAREFULLY:

1. DETAILED INSIGHT (2-3 sentences):
   - Analyze the audience's typical lifestyle, core values, and primary purchase triggers
   - Be specific and data-driven - avoid generic statements
   - Focus on what makes this audience unique, not what applies to everyone
   - ❌ FORBIDDEN: "In today's fast-paced world", "This audience values quality", "In today's digital age"
   - ✅ REQUIRED: Specific behavioral insights, lifestyle patterns, or demographic characteristics

2. EXAMPLE ADVERTISERS (exactly 5 entries):
   - Provide 5 real-world brands OR specific "Advertiser Types" (e.g., "Luxury SUV Manufacturers")
   - Mix of both brands and categories is acceptable
   - Each entry must include:
     * name: The brand name (e.g., "Chewy") or category (e.g., "Premium Pet Food Brands")
     * type: Either "brand" or "category"
     * rationale: 1-2 sentences explaining why this advertiser should target this segment

3. CURRENT TRENDS (2-3 trends):
   - Each trend must be specific to 2025 or 2026
   - Use Google Search grounding to find current, real trends (not generic predictions)
   - Each trend must include:
     * trend: The specific trend description (e.g., "Subscription-based pet care services are growing 40% YoY")
     * relevance: How this trend specifically relates to the "${segment.segmentName}" audience
     * timeframe: Either "2025" or "2026"

4. STRATEGIC HOOK:
   - headline: A punchy, specific messaging angle that would resonate with this group (avoid generic phrases)
   - emotionalDriver: The core emotion or motivation to tap into (be specific, not "quality" or "value")
   - callToAction: Suggested CTA direction tailored to this audience's behavior

QUALITY STANDARDS:
- NO generic marketing speak
- NO phrases like "In today's fast-paced world" or "This audience values quality"
- YES to specific brands, real trends, and actionable insights
- YES to data-driven observations about lifestyle and behavior

OUTPUT FORMAT (JSON only, no markdown, no explanations):
{
  "detailedInsight": "2-3 sentences of specific, non-generic analysis",
  "exampleAdvertisers": [
    {
      "name": "Brand or Category Name",
      "type": "brand",
      "rationale": "Why this advertiser fits"
    }
  ],
  "currentTrends": [
    {
      "trend": "Specific 2025/2026 trend with data if available",
      "relevance": "How it relates to this segment",
      "timeframe": "2025"
    }
  ],
  "strategicHook": {
    "headline": "Punchy, specific messaging angle",
    "emotionalDriver": "Core emotion to tap into",
    "callToAction": "Suggested CTA direction"
  }
}

Return ONLY valid JSON, no additional text or markdown formatting.`;
}

/**
 * Validate generated pack quality
 */
function validatePackQuality(pack: Partial<MarketIntelligencePack>, segmentName: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check detailedInsight
  if (!pack.detailedInsight || pack.detailedInsight.length < 100) {
    issues.push(`detailedInsight must be at least 100 characters (got ${pack.detailedInsight?.length || 0})`);
  }
  
  // Check for banned phrases
  const allText = JSON.stringify(pack).toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (allText.includes(phrase.toLowerCase())) {
      issues.push(`Contains banned phrase: "${phrase}"`);
    }
  }
  
  // Check exampleAdvertisers
  if (!pack.exampleAdvertisers || pack.exampleAdvertisers.length !== 5) {
    issues.push(`exampleAdvertisers must have exactly 5 entries (got ${pack.exampleAdvertisers?.length || 0})`);
  } else {
    for (let i = 0; i < pack.exampleAdvertisers.length; i++) {
      const adv = pack.exampleAdvertisers[i];
      if (!adv.name || adv.name.trim().length === 0) {
        issues.push(`exampleAdvertisers[${i}].name is missing`);
      }
      if (!adv.type || (adv.type !== 'brand' && adv.type !== 'category')) {
        issues.push(`exampleAdvertisers[${i}].type must be "brand" or "category"`);
      }
      if (!adv.rationale || adv.rationale.length < 20) {
        issues.push(`exampleAdvertisers[${i}].rationale is too short`);
      }
    }
  }
  
  // Check currentTrends
  if (!pack.currentTrends || pack.currentTrends.length < 2 || pack.currentTrends.length > 3) {
    issues.push(`currentTrends must have 2-3 entries (got ${pack.currentTrends?.length || 0})`);
  } else {
    for (let i = 0; i < pack.currentTrends.length; i++) {
      const trend = pack.currentTrends[i];
      if (!trend.trend || trend.trend.length < 30) {
        issues.push(`currentTrends[${i}].trend is too short`);
      }
      if (!trend.timeframe || (trend.timeframe !== '2025' && trend.timeframe !== '2026')) {
        issues.push(`currentTrends[${i}].timeframe must be "2025" or "2026"`);
      }
      if (!trend.relevance || trend.relevance.length < 20) {
        issues.push(`currentTrends[${i}].relevance is too short`);
      }
    }
  }
  
  // Check strategicHook
  if (!pack.strategicHook) {
    issues.push('strategicHook is missing');
  } else {
    if (!pack.strategicHook.headline || pack.strategicHook.headline.length < 20) {
      issues.push('strategicHook.headline is too short');
    }
    if (!pack.strategicHook.emotionalDriver || pack.strategicHook.emotionalDriver.length < 10) {
      issues.push('strategicHook.emotionalDriver is too short');
    }
    if (!pack.strategicHook.callToAction || pack.strategicHook.callToAction.length < 10) {
      issues.push('strategicHook.callToAction is too short');
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Generate Market Intelligence Pack for a segment
 */
async function generateIntelligencePack(
  segment: SegmentRow,
  genAI: GoogleGenerativeAI,
  retryCount: number = 0
): Promise<MarketIntelligencePack> {
  const prompt = createCMOPrompt(segment);
  
  // Create grounded model with Google Search
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 16384,
    },
    tools: [{
      googleSearch: {}
    } as any] // Type assertion needed for Google Search grounding
  });
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handle markdown code blocks if present)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const parsed = JSON.parse(jsonText);
    
    // Build complete pack
    const pack: MarketIntelligencePack = {
      segmentId: segment.segmentId,
      segmentName: segment.segmentName,
      fullPath: segment.fullPath,
      category: segment.category,
      generatedAt: new Date().toISOString(),
      detailedInsight: parsed.detailedInsight || '',
      exampleAdvertisers: parsed.exampleAdvertisers || [],
      currentTrends: parsed.currentTrends || [],
      strategicHook: parsed.strategicHook || {
        headline: '',
        emotionalDriver: '',
        callToAction: ''
      }
    };
    
    // Validate quality
    const validation = validatePackQuality(pack, segment.segmentName);
    if (!validation.valid) {
      throw new Error(`Quality validation failed: ${validation.issues.join('; ')}`);
    }
    
    return pack;
    
  } catch (error) {
    if (error instanceof Error) {
      // Check for rate limit or quota errors
      const errorMessage = error.message.toLowerCase();
      if ((errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate limit')) && retryCount < MAX_RETRIES) {
        const backoffSeconds = Math.min(Math.pow(2, retryCount), MAX_BACKOFF_SECONDS);
        console.log(`   ⏳ Rate limited, backing off for ${backoffSeconds}s (retry ${retryCount + 1}/${MAX_RETRIES})`);
        await sleep(backoffSeconds * 1000);
        return generateIntelligencePack(segment, genAI, retryCount + 1);
      }
    }
    throw error;
  }
}

/**
 * Commit and push enriched data to GitHub
 */
async function commitAndPushToGit(completedCount: number, totalCount: number): Promise<void> {
  const gitRepoPath = path.join(__dirname, '../..');
  
  try {
    // Check if we're in a git repository
    try {
      execSync('git rev-parse --git-dir', { cwd: gitRepoPath, stdio: 'ignore' });
    } catch {
      console.log('   ⚠️  Not in a git repository, skipping commit');
      return;
    }
    
    // Check if there are changes to commit
    try {
      const status = execSync('git status --porcelain', { cwd: gitRepoPath, encoding: 'utf-8' });
      if (!status.includes('enriched-audiences.json')) {
        console.log('   ℹ️  No changes to enriched-audiences.json, skipping commit');
        return;
      }
    } catch (error) {
      console.log('   ⚠️  Could not check git status, skipping commit');
      return;
    }
    
    console.log('   📤 Committing and pushing to GitHub...');
    
    // Stage the enriched data file
    execSync(`git add public/data/enriched-audiences.json`, { 
      cwd: gitRepoPath,
      stdio: 'inherit'
    });
    
    // Commit with descriptive message
    const commitMessage = `feat: Update enriched audience intelligence packs (${completedCount}/${totalCount} segments completed)`;
    execSync(`git commit -m "${commitMessage}"`, { 
      cwd: gitRepoPath,
      stdio: 'inherit'
    });
    
    // Push to GitHub
    execSync('git push', { 
      cwd: gitRepoPath,
      stdio: 'inherit'
    });
    
    console.log(`   ✅ Successfully pushed to GitHub (${completedCount}/${totalCount} segments)`);
    
  } catch (error) {
    // Don't fail the entire process if git operations fail
    console.warn('   ⚠️  Git commit/push failed (continuing anyway):', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format time duration
 */
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

/**
 * Main enrichment function
 */
async function enrichAudiences(): Promise<void> {
  console.log('\n' + '═'.repeat(80));
  console.log('  🚀 AUDIENCE MARKET INTELLIGENCE PACK ENRICHMENT');
  console.log('  Generating CMO-level insights for all audience segments');
  console.log('═'.repeat(80) + '\n');
  
  // Check for API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY environment variable is required');
    process.exit(1);
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const segmentArg = args.find(arg => arg.startsWith('--segment='));
  const resumeFlag = args.includes('--resume');
  
  const limit = limitArg ? parseInt(limitArg.split('=')[1] || '0') : undefined;
  const specificSegment = segmentArg ? segmentArg.split('=')[1] || '' : undefined;
  
  // Load segments
  const allSegments = parseTaxonomyCSV();
  
  // Filter segments if needed
  let segmentsToProcess = allSegments;
  if (specificSegment) {
    segmentsToProcess = segmentsToProcess.filter(s => 
      s.segmentName.toLowerCase().includes(specificSegment.toLowerCase())
    );
    console.log(`   🔍 Filtered to segments matching "${specificSegment}"`);
  }
  
  // Load progress if resuming
  let progress: ProgressState | null = null;
  let startIndex = 0;
  let enrichedData: Record<string, MarketIntelligencePack> = {};
  
  if (resumeFlag) {
    progress = loadProgress();
    if (progress) {
      console.log(`   📦 Resuming from checkpoint (${progress.completedSegmentIds.length} already completed)`);
      enrichedData = loadEnrichedData();
      startIndex = progress.lastProcessedIndex + 1;
      
      // Filter out already completed segments
      const completedSet = new Set(progress.completedSegmentIds);
      segmentsToProcess = segmentsToProcess.filter((s, idx) => {
        if (idx < startIndex) {
          return false; // Skip already processed
        }
        if (completedSet.has(s.segmentId)) {
          return false; // Skip completed
        }
        return true;
      });
    }
  } else {
    enrichedData = loadEnrichedData();
  }
  
  // Apply limit if specified
  if (limit && limit > 0) {
    segmentsToProcess = segmentsToProcess.slice(0, limit);
    console.log(`   📊 Limited to first ${limit} segments`);
  }
  
  console.log(`   ✅ Processing ${segmentsToProcess.length} segments\n`);
  
  // Initialize or load progress state
  if (!progress) {
    progress = {
      lastProcessedIndex: startIndex - 1,
      completedSegmentIds: Object.keys(enrichedData),
      failedSegments: [],
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    };
  }
  
  // Statistics
  let successful = 0;
  let failed = 0;
  const startTime = Date.now();
  
  // Process segments
  for (let i = 0; i < segmentsToProcess.length; i++) {
    const segment = segmentsToProcess[i];
    if (!segment) continue;
    
    const globalIndex = startIndex + i;
    const segmentStart = Date.now();
    
    console.log(`\n[${globalIndex + 1}/${allSegments.length}] Processing: ${segment.segmentName} (${segment.segmentId})`);
    
    try {
      const pack = await generateIntelligencePack(segment, genAI);
      enrichedData[segment.segmentId] = pack;
      successful++;
      
      progress.lastProcessedIndex = globalIndex;
      progress.completedSegmentIds.push(segment.segmentId);
      
      // Remove from failed list if it was there
      progress.failedSegments = progress.failedSegments.filter(f => f.id !== segment.segmentId);
      
      const duration = (Date.now() - segmentStart) / 1000;
      console.log(`   ✅ Generated in ${duration.toFixed(1)}s`);
      
      // Save checkpoint every N segments
      if ((i + 1) % CHECKPOINT_INTERVAL === 0) {
        saveProgress(progress);
        saveEnrichedData(enrichedData);
        console.log(`   💾 Checkpoint saved (${successful} successful, ${failed} failed)`);
      }
      
      // Commit and push to GitHub every 100 segments
      if ((i + 1) % GIT_COMMIT_INTERVAL === 0) {
        saveProgress(progress);
        saveEnrichedData(enrichedData);
        const totalCompleted = progress.completedSegmentIds.length;
        await commitAndPushToGit(totalCompleted, allSegments.length);
      }
      
      // Rate limiting delay
      if (i < segmentsToProcess.length - 1) {
        await sleep(BASE_DELAY_MS);
      }
      
    } catch (error) {
      failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Failed: ${errorMessage}`);
      
      // Track failed segment
      const existingFailed = progress.failedSegments.find(f => f.id === segment.segmentId);
      if (existingFailed) {
        existingFailed.retryCount++;
        existingFailed.error = errorMessage;
      } else {
        progress.failedSegments.push({
          id: segment.segmentId,
          name: segment.segmentName,
          error: errorMessage,
          retryCount: 1
        });
      }
      
      // Save progress even on failure
      saveProgress(progress);
    }
    
    // Progress update
    const elapsed = (Date.now() - startTime) / 1000;
    const avgPerSegment = elapsed / (i + 1);
    const remaining = (segmentsToProcess.length - i - 1) * avgPerSegment;
    
    console.log(`   Progress: ${successful} successful, ${failed} failed | ETA: ${formatTime(remaining)}`);
  }
  
  // Final save
  saveProgress(progress);
  saveEnrichedData(enrichedData);
  
  // Summary
  const totalElapsed = (Date.now() - startTime) / 1000;
  console.log('\n' + '═'.repeat(80));
  console.log('  📊 ENRICHMENT COMPLETE - SUMMARY');
  console.log('═'.repeat(80));
  console.log(`
  Total Processed:  ${segmentsToProcess.length}
  ✅ Successful:     ${successful}
  ❌ Failed:         ${failed}
  
  ⏱️  Total Time:     ${formatTime(totalElapsed)}
  📈 Avg per Segment: ${successful > 0 ? (totalElapsed / successful).toFixed(1) : 0}s
  `);
  
  if (progress.failedSegments.length > 0) {
    console.log('  ❌ Failed Segments:');
    progress.failedSegments.forEach(f => {
      console.log(`     - ${f.name} (${f.id}): ${f.error} (${f.retryCount} retries)`);
    });
  }
  
  console.log(`\n  📁 Output saved to: ${OUTPUT_FILE}`);
  console.log(`  💾 Progress saved to: ${PROGRESS_FILE}`);
  console.log('\n' + '═'.repeat(80));
  
  if (failed > 0) {
    console.log('⚠️  Some segments failed. Re-run with --resume to retry them.');
    process.exit(1);
  } else {
    console.log('✅ All segments enriched successfully!');
    process.exit(0);
  }
}

// Run the script
enrichAudiences().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

