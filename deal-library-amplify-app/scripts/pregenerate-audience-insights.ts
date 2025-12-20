/**
 * Pre-generate Audience Insights Reports for Build-Time
 * 
 * This script generates all audience insights reports at build time,
 * ensuring perfect quality, proper emoji encoding, and instant runtime loading.
 * 
 * Usage:
 *   npm run pregenerate:insights
 *   npm run pregenerate:insights -- --limit=10  # Test with 10 segments
 *   npm run pregenerate:insights -- --segment="Coffee"  # Generate specific segment
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import services
import { audienceInsightsService } from '../src/lib/services/audienceInsightsService';
import { commerceAudienceService } from '../src/lib/services/commerceAudienceService';
import { commerceBaselineService } from '../src/lib/services/commerceBaselineService';
import { CensusDataService } from '../src/lib/services/censusDataService';

interface GenerationStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  totalTime: number;
  averageTime: number;
}

interface QualityCheckResult {
  passed: boolean;
  issues: string[];
}

/**
 * Enhanced chain-of-thought prompt for strategic insights
 */
function createChainOfThoughtPrompt(
  segment: string,
  category: string,
  demographics: any,
  overlaps: any[],
  geoIntelligence: any,
  commerceBaseline: any
): string {
  const vsCommerce = {
    income: ((demographics.medianHHI / commerceBaseline.medianHHI) - 1) * 100,
    education: ((demographics.educationBachelors / commerceBaseline.educationBachelorsPlus) - 1) * 100,
  };

  return `You are Gemini 2.5 Flash, analyzing real purchase data from Sovrn's 2M+ commerce transactions combined with US Census demographics for 41,000+ ZIP codes.

MISSION: Generate world-class, data-driven marketing strategy for the "${segment}" Commerce Audience (${category} category) that a Fortune 500 CMO would pay $50,000 for.

=== CHAIN-OF-THOUGHT REASONING REQUIRED ===

STEP 1: ANALYSIS PHASE
First, analyze the demographic data for "${segment}":
- What makes this audience unique vs. typical online shoppers?
- What specific data points stand out (income: $${demographics.medianHHI.toFixed(0)}, education: ${demographics.educationBachelors.toFixed(1)}%, location: ${geoIntelligence.topCities[0]?.city || 'N/A'})?
- What behavioral overlaps reveal about their lifestyle? (${overlaps.slice(0, 3).map((o: any) => `${o.segment} (${o.overlapPercentage.toFixed(1)}%)`).join(', ')})
- What geographic patterns indicate about their preferences? (Top markets: ${geoIntelligence.topCities.slice(0, 3).map((c: any) => `${c.city}, ${c.state}`).join(', ')})

STEP 2: INSIGHT GENERATION PHASE
Based on your analysis, generate insights:
- What specific marketing opportunities exist for "${segment}" buyers?
- What messaging would resonate with their unique characteristics (${demographics.affluenceLevel}, ${demographics.familyProfile})?
- Which channels align with their lifestyle patterns (${demographics.lifestyle?.avgCommuteTime ? `${demographics.lifestyle.avgCommuteTime}min commute` : 'work patterns'})?
- What competitive advantages can be leveraged?

STEP 3: STRATEGY DEVELOPMENT PHASE
Develop actionable strategy:
- Specific campaign recommendations with data backing (cite: income $${demographics.medianHHI.toFixed(0)}, ${demographics.topAgeBracket} age, ${geoIntelligence.topCities[0]?.city || 'top markets'})
- Channel recommendations with rationale tied to ${segment} buyer behavior
- Implementation roadmap with budgets based on audience size
- Success metrics tied to audience characteristics

=== IMPORTANT CONTEXT: SELECTION BIAS ===
This segment is PRE-SELECTED from high-commerce-activity ZIPs. ALL commerce segments over-index vs US national average due to:
1. Higher purchasing power (online shoppers have more disposable income)
2. Tech access (internet, devices, credit cards)
3. Peak earning age (30-50 typical)

THEREFORE: Focus on comparing to "Commerce Baseline" (typical online shopper) NOT national average.

COMMERCE BASELINE (Typical Online Shopper):
- Median HHI: $${commerceBaseline.medianHHI.toLocaleString()}
- Education: ${commerceBaseline.educationBachelorsPlus.toFixed(1)}% Bachelor's+
- Age: ${commerceBaseline.medianAge.toFixed(1)} years

${segment} vs Commerce Baseline:
- Income: ${vsCommerce.income >= 0 ? '+' : ''}${vsCommerce.income.toFixed(1)}% ${vsCommerce.income > 15 ? '(Above-Average Shopper)' : vsCommerce.income > -15 ? '(Typical Shopper)' : '(Value-Conscious Shopper)'}
- Education: ${vsCommerce.education >= 0 ? '+' : ''}${vsCommerce.education.toFixed(1)}% ${vsCommerce.education > 15 ? '(More Educated)' : vsCommerce.education > -15 ? '(Typical Education)' : '(Trade-Skilled/Blue-Collar)'}

THIS IS THE KEY DIFFERENTIATION - use this to position the segment!

=== RICH DEMOGRAPHIC CONTEXT ===
Based on top ${demographics.validZipCount} ZIPs representing this audience:

INCOME & AFFLUENCE:
- Median Household Income: $${demographics.medianHHI.toFixed(0)}
- vs Commerce Baseline: ${vsCommerce.income >= 0 ? '+' : ''}${vsCommerce.income.toFixed(1)}% ⭐ USE THIS
- Affluence Level: ${demographics.affluenceLevel}
- Six-figure households: ${demographics.sixFigureRate.toFixed(0)}%

AGE & LIFE STAGE:
- Median Age: ${demographics.medianAge.toFixed(1)} years
- Dominant bracket: ${demographics.topAgeBracket}

EDUCATION & EMPLOYMENT:
- Bachelor's degree+: ${demographics.educationBachelors.toFixed(1)}%
- Profile: ${demographics.educationProfile}

FAMILY & HOUSEHOLD:
- Profile: ${demographics.familyProfile}
- Average household size: ${demographics.avgHouseholdSize.toFixed(1)} people
- ZIPs with likely children: ${demographics.zipsWithChildren} of ${demographics.validZipCount}

LIFESTYLE & WORK:
- Self-Employed: ${demographics.lifestyle?.selfEmployed?.toFixed(1) || 'N/A'}%
- Avg Commute: ${demographics.lifestyle?.avgCommuteTime?.toFixed(0) || 'N/A'} minutes
- STEM Degree: ${demographics.lifestyle?.stemDegree?.toFixed(1) || 'N/A'}%

HOUSING & LOCATION:
- Profile: ${demographics.locationProfile}
- Home ownership: ${demographics.homeOwnership.toFixed(0)}%
- Median home value: $${demographics.medianHomeValue.toFixed(0)}
- Urban/Suburban/Rural: ${demographics.urbanRuralDistribution.map((d: any) => `${d.type}: ${d.percentage.toFixed(0)}%`).join(', ')}

=== GEOGRAPHIC INTELLIGENCE ===

TOP 5 VOLUME MARKETS (where most audience IS):
${geoIntelligence.topCities.slice(0, 5).map((c: any, i: number) => 
  `${i + 1}. ${c.city}, ${c.state} (${c.zipCount} ZIPs)`
).join('\n')}

TOP 5 PASSION MARKETS (highest over-indexing):
${geoIntelligence.topOverIndexZips && geoIntelligence.topOverIndexZips.length > 0 ? 
  geoIntelligence.topOverIndexZips.slice(0, 5).map((z: any, i: number) => 
    `${i + 1}. ${z.city}, ${z.state} (ZIP ${z.zipCode}): ${z.overIndex.toFixed(0)}% over-index`
  ).join('\n') : 
  'Data not available'}

=== BEHAVIORAL OVERLAPS (what else they buy) ===
${overlaps.map((o: any, i: number) => `${i + 1}. ${o.segment} (${o.overlapPercentage.toFixed(1)}% overlap)`).join('\n')}

=== CRITICAL QUALITY REQUIREMENTS ===

❌ DO NOT generate generic marketing advice like:
- "Use digital channels" (too vague)
- "Target demographics" (not specific)
- "Social media marketing" (generic)
- "Email campaigns" (no context)

✅ DO generate specific, data-driven recommendations:
- "Target 35-44 year-olds in ${geoIntelligence.topCities[0]?.city || 'top markets'} with $${demographics.medianHHI.toFixed(0)}+ income"
- "Focus on ${demographics.familyProfile.toLowerCase()} messaging for ${segment} buyers who also purchase ${overlaps[0]?.segment || 'related products'}"
- "Leverage ${geoIntelligence.topCities[0]?.city || 'top market'} over-indexing (${geoIntelligence.topOverIndexZips?.[0]?.overIndex?.toFixed(0) || 'high'}% above average)"

✅ REQUIREMENTS:
- Mention "${segment}" specifically (not just "this audience")
- Cite at least 3 specific data points per recommendation (income, age, cities, percentages)
- Mention specific cities/markets (not just "urban areas" or "major metros")
- Minimum 150 words per recommendation section
- All recommendations must be actionable and campaign-ready

CRITICAL - PERSONA FORMAT REQUIREMENTS (APPLIES ONLY TO targetPersona FIELD):
⚠️  THE FOLLOWING RULES APPLY **ONLY** TO THE targetPersona FIELD - NOT TO OTHER FIELDS ⚠️
❌ DO NOT include statistics, percentages, or numerical comparisons
❌ DO NOT write "median age X", "income $X", "X% homeowners", etc.
✅ DO write in a humanized, storytelling style
✅ DO describe daily life, motivations, challenges, and pain points
✅ DO make it visual and relatable - bring the person to life
✅ DO use **bold** for personality traits, NOT for statistics

Return as JSON:
{
  "targetPersona": "⚠️  HUMANIZED STORY ONLY - NO STATISTICS ⚠️  Write a visual 5-sentence persona. Describe their typical day, where they live (mention ${geoIntelligence.topCities[0]?.city || 'a city'} naturally as part of the story), what they care about, their goals and challenges, and why they buy ${segment}. Make it emotional and relatable WITHOUT using ANY statistics or percentages. Use **bold** for personality traits and values ONLY.",
  
  "messagingRecommendations": [
    {
      "valueProposition": "✅ USE DATA HERE - VALUE PROPOSITIONS tied to specific data. E.g., 'Premium Quality for ${demographics.familyProfile} Families in ${geoIntelligence.topCities[0]?.city || 'Top Markets'}'. Use **bold** for key value points.",
      "dataBacking": "✅ CITE SPECIFIC DATA: ${demographics.homeOwnership.toFixed(0)}% homeowners, ${demographics.avgHouseholdSize.toFixed(1)} avg household size, $${demographics.medianHHI.toFixed(0)} median income in ${geoIntelligence.topCities[0]?.city || 'top markets'}. Use **bold** for key statistics.",
      "emotionalBenefit": "Functional AND emotional benefits for ${segment} buyers. Use **bold** for key emotional drivers.",
      "campaignReady": true
    }
  ],
  
  "channelRecommendations": [
    {
      "platform": "Instagram Reels",
      "targeting": "${demographics.topAgeBracket} year-olds in ${geoIntelligence.topCities.slice(0, 3).map((c: any) => c.city).join(', ')}",
      "contentType": "Specific content type based on ${segment} buyer overlaps with ${overlaps[0]?.segment || 'related products'}",
      "timing": "Based on ${demographics.lifestyle?.avgCommuteTime ? `${demographics.lifestyle.avgCommuteTime}min commute` : 'work'} patterns and ${segment} purchase behavior",
      "rationale": "Cite specific data: ${demographics.topAgeBracket} age group, ${geoIntelligence.topCities[0]?.city || 'top market'} concentration, ${overlaps[0]?.overlapPercentage.toFixed(1)}% also buy ${overlaps[0]?.segment || 'related products'}",
      "estimatedPerformance": {
        "expectedCTR": "2.1-2.8%",
        "targetCPM": "$12-18",
        "conversionRate": "1.2-2.1%"
      }
    }
  ],

  "implementationRoadmap": {
    "phase1": {
      "duration": "2-3 weeks",
      "budget": "$5,000-$8,000",
      "actions": [
        "Launch geo-targeted campaigns in ${geoIntelligence.topCities.slice(0, 3).map((c: any) => c.city).join(', ')}",
        "Test 3-4 creative variants per platform targeting ${segment} buyers"
      ],
      "successMetrics": {
        "CTR": ">2.0%",
        "CPA": "<$65",
        "ROAS": ">3.5x"
      }
    },
    "phase2": {
      "duration": "4-6 weeks",
      "budget": "$15,000-$25,000",
      "actions": [
        "Scale winning creative to additional ${segment} markets",
        "Implement advanced attribution tracking"
      ],
      "successMetrics": {
        "Volume": "800+ conversions",
        "Efficiency": "20% improvement in CPA"
      }
    }
  },

  "competitiveIntelligence": {
    "marketPosition": "How ${segment} buyers compare to category averages (cite: $${demographics.medianHHI.toFixed(0)} income, ${demographics.educationBachelors.toFixed(1)}% education)",
    "whiteSpaceOpportunities": ["Untapped channels or messaging angles specific to ${segment}"],
    "differentiationAdvantages": ["What makes ${segment} audience unique vs competitors (cite specific data)"]
  },

  "seasonalOptimization": {
    "peakPeriods": ["When ${segment} buyers are most active (cite data if available)"],
    "opportunityWindows": ["Best times for testing new ${segment} campaigns"],
    "budgetAllocation": ["Recommended spend distribution for ${segment} audience across calendar year"]
  }
}

Return ONLY valid JSON, no additional text.`;
}

/**
 * Quality validation for strategic insights
 */
function validateStrategicInsightsQuality(
  insights: any,
  segment: string
): QualityCheckResult {
  const issues: string[] = [];
  
  // Check for generic phrases
  const genericPhrases = [
    'digital channels',
    'target demographics',
    'social media',
    'email marketing',
    'online advertising'
  ];
  
  const content = JSON.stringify(insights).toLowerCase();
  
  // Check if generic phrases appear without specific context
  for (const phrase of genericPhrases) {
    if (content.includes(phrase)) {
      // Check if it's used with specific data
      const hasSpecificData = 
        content.includes(segment.toLowerCase()) ||
        content.match(/\$\d+/) || // Has dollar amounts
        content.match(/\d+%/); // Has percentages
      
      if (!hasSpecificData) {
        issues.push(`Generic phrase "${phrase}" used without specific data context`);
      }
    }
  }
  
  // Check messaging recommendations
  if (insights.messagingRecommendations) {
    for (const rec of insights.messagingRecommendations) {
      if (!rec.dataBacking || rec.dataBacking.length < 50) {
        issues.push('Messaging recommendation missing detailed data backing');
      }
      
      // Count data citations (percentages, dollar amounts, cities)
      const dataCitations = (
        (rec.dataBacking?.match(/\d+%|%\d+|\$\d+|\d+\.\d+%/) || []).length +
        (rec.dataBacking?.match(/[A-Z][a-z]+, [A-Z]{2}/g) || []).length // City, State format
      );
      
      if (dataCitations < 2) {
        issues.push(`Messaging recommendation has insufficient data citations (found ${dataCitations}, need at least 2)`);
      }
      
      if (!rec.dataBacking?.toLowerCase().includes(segment.toLowerCase())) {
        issues.push(`Messaging recommendation does not mention segment "${segment}"`);
      }
    }
  }
  
  // Check channel recommendations
  if (insights.channelRecommendations) {
    for (const rec of insights.channelRecommendations) {
      if (!rec.rationale || rec.rationale.length < 50) {
        issues.push('Channel recommendation missing detailed rationale');
      }
      
      // Check for specific cities
      const hasCities = /[A-Z][a-z]+, [A-Z]{2}/.test(rec.targeting || '');
      if (!hasCities) {
        issues.push('Channel recommendation targeting lacks specific cities');
      }
    }
  }
  
  // Check target persona (should NOT have stats)
  if (insights.targetPersona) {
    const hasStats = /\d+%|\$\d+|median|average|vs\.|compared to/i.test(insights.targetPersona);
    if (hasStats) {
      issues.push('Target persona contains statistics (should be humanized story only)');
    }
  }
  
  // Minimum length checks
  if (insights.targetPersona && insights.targetPersona.length < 200) {
    issues.push('Target persona too short (minimum 200 characters)');
  }
  
  if (insights.messagingRecommendations && insights.messagingRecommendations.length < 2) {
    issues.push('Need at least 2 messaging recommendations');
  }
  
  if (insights.channelRecommendations && insights.channelRecommendations.length < 2) {
    issues.push('Need at least 2 channel recommendations');
  }
  
  return {
    passed: issues.length === 0,
    issues
  };
}

/**
 * Verify emoji encoding
 */
function verifyEmoji(emoji: string): boolean {
  try {
    // Verify UTF-8 encoding
    const buffer = Buffer.from(emoji, 'utf8');
    const decoded = buffer.toString('utf8');
    
    // Check if emoji is valid Unicode
    if (decoded !== emoji) {
      return false;
    }
    
    // Check if it's a single emoji (not multiple)
    // This is a simple check - emoji can be complex
    const codePoints = Array.from(emoji);
    if (codePoints.length === 0) {
      return false;
    }
    
    // Log emoji for verification
    console.log(`   ✅ Emoji verified: ${emoji} (${codePoints.length} code point(s))`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Emoji verification failed:`, error);
    return false;
  }
}

/**
 * Generate report for a single segment with quality validation
 */
async function generateReportWithQuality(
  segment: string,
  category: string,
  retryCount: number = 0
): Promise<any> {
  const maxRetries = 2;
  
  try {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`Processing: "${segment}" (${category})`);
    if (retryCount > 0) {
      console.log(`   Retry attempt ${retryCount + 1}/${maxRetries + 1}`);
    }
    
    // Generate full report (with strategic content)
    const report = await audienceInsightsService.generateReport(
      segment,
      category,
      false, // includeCommercialZips
      false  // skipStrategicContent - we want full content
    );
    
    // Verify emoji (will be verified again after generation)
    const emoji = report.personaEmoji || '🎯';
    if (!verifyEmoji(emoji)) {
      console.warn(`   ⚠️  Emoji verification failed, will use fallback`);
    }
    
    // Validate strategic insights quality
    if (report.strategicInsights) {
      const qualityCheck = validateStrategicInsightsQuality(report.strategicInsights, segment);
      
      if (!qualityCheck.passed) {
        console.warn(`   ⚠️  Quality check failed:`);
        qualityCheck.issues.forEach(issue => console.warn(`      - ${issue}`));
        
        if (retryCount < maxRetries) {
          console.log(`   🔄 Retrying with enhanced prompt...`);
          // Clear cache to force regeneration
          const cacheKey = `strategic_v4_${segment}_${category}`;
          (audienceInsightsService as any).aiResponseCache?.delete(cacheKey);
          
          // Retry
          return generateReportWithQuality(segment, category, retryCount + 1);
        } else {
          console.error(`   ❌ Quality check failed after ${maxRetries + 1} attempts`);
          throw new Error(`Quality validation failed: ${qualityCheck.issues.join('; ')}`);
        }
      } else {
        console.log(`   ✅ Quality check passed`);
      }
    }
    
    console.log(`   ✅ Generated successfully`);
    return report;
    
  } catch (error) {
    console.error(`   ❌ Error:`, error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Format report for TypeScript export
 */
function formatReportForExport(report: any): string {
  // Convert report to formatted TypeScript object
  const formatted = JSON.stringify(report, null, 2)
    .replace(/"/g, '"') // Use single quotes for better readability
    .replace(/'/g, "\\'") // Escape single quotes
    .replace(/^/gm, '  '); // Indent
  
  return formatted;
}

/**
 * Export reports to TypeScript file
 */
function exportReportsToTypeScript(
  reports: Record<string, any>,
  outputPath: string
): void {
  const timestamp = new Date().toISOString();
  
  let content = `/**
 * Pre-generated Audience Insights Reports
 * 
 * This file contains pre-generated reports for all audience segments.
 * Generated at build time to ensure instant loading and perfect quality.
 * 
 * Last Generated: ${timestamp}
 * Total Reports: ${Object.keys(reports).length}
 * 
 * DO NOT EDIT THIS FILE MANUALLY
 * Regenerate using: npm run pregenerate:insights
 */

import type { PreGeneratedAudienceReport } from './audienceInsightsReports';

export const audienceInsightsReports: Record<string, PreGeneratedAudienceReport> = {
`;

  // Sort segments alphabetically for consistency
  const sortedSegments = Object.keys(reports).sort();
  
  for (const segment of sortedSegments) {
    const report = reports[segment];
    
    // Convert to JSON and format for TypeScript
    const reportJson = JSON.stringify(report, null, 2)
      .split('\n')
      .map((line, index) => {
        // Add indentation (2 spaces per level)
        if (index === 0) return line;
        // Count leading spaces to determine indentation level
        const match = line.match(/^(\s*)/);
        const indent = match ? match[1].length : 0;
        return '  ' + '  '.repeat(Math.floor(indent / 2)) + line.trimStart();
      })
      .join('\n');
    
    // Escape the segment name if it contains special characters
    const escapedSegment = segment.replace(/"/g, '\\"');
    content += `  "${escapedSegment}": ${reportJson},\n\n`;
  }
  
  content += `};\n`;
  
  // Write to file with UTF-8 encoding
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`\n✅ Exported ${Object.keys(reports).length} reports to ${outputPath}`);
  console.log(`   File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
}

/**
 * Main pre-generation function
 */
async function pregenerateInsights(): Promise<void> {
  console.log('\n' + '═'.repeat(80));
  console.log('  🚀 PRE-GENERATING AUDIENCE INSIGHTS REPORTS');
  console.log('  Build-time generation for instant loading and perfect quality');
  console.log('═'.repeat(80) + '\n');
  
  // Step 0: Load census data
  console.log('📊 Step 0: Loading census data...');
  const censusService = CensusDataService.getInstance();
  await censusService.loadCensusData();
  console.log('   ✅ Census data ready\n');
  
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
  
  // Step 2: Get all segments
  console.log('📋 Step 2: Getting audience segments...');
  let allSegments = commerceAudienceService.getAudienceSegments()
    .map((s: any) => ({ name: s.name, category: s.category || 'General' }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
  
  if (specificSegment) {
    allSegments = allSegments.filter((s: any) => 
      s.name.toLowerCase().includes(specificSegment.toLowerCase())
    );
    console.log(`   🔍 Filtered to segments matching "${specificSegment}"`);
  }
  
  if (limit && limit > 0) {
    allSegments = allSegments.slice(0, limit);
    console.log(`   📊 Limited to first ${limit} segments`);
  }
  
  console.log(`   ✅ Found ${allSegments.length} segments to process\n`);
  
  // Step 3: Generate reports
  console.log('🎯 Step 3: Generating insights reports...\n');
  
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
  const generatedReports: Record<string, any> = {};
  
  for (let i = 0; i < allSegments.length; i++) {
    const segmentInfo = allSegments[i];
    if (!segmentInfo) continue;
    
    const segmentStart = Date.now();
    const segment = segmentInfo.name;
    const category = segmentInfo.category || 'General';
    
    try {
      const report = await generateReportWithQuality(segment, category);
      
      // Ensure emoji is set correctly (should already be set by service, but verify)
      if (!report.personaEmoji || report.personaEmoji === '👤') {
        // Use category-based fallback emoji mapping
        const categoryEmojiMap: Record<string, string> = {
          'Animals & Pet Supplies': '🐾',
          'Apparel & Accessories': '👗',
          'Arts & Entertainment': '🎨',
          'Baby & Toddler': '👶',
          'Business & Industrial': '🏭',
          'Cameras & Optics': '📷',
          'Electronics': '💻',
          'Food, Beverages & Tobacco': '🍽️',
          'Furniture': '🛋️',
          'Hardware': '🔧',
          'Health & Beauty': '💄',
          'Home & Garden': '🏡',
          'Luggage & Bags': '🎒',
          'Media': '📺',
          'Office Supplies': '📎',
          'Software': '💿',
          'Sporting Goods': '⚽',
          'Toys & Games': '🎮',
          'Vehicles & Parts': '🚗',
          'General': '🎯'
        };
        const fallbackEmoji = categoryEmojiMap[category] || '🎯';
        report.personaEmoji = fallbackEmoji;
        verifyEmoji(fallbackEmoji);
      }
      
      generatedReports[segment] = report;
      
      const duration = (Date.now() - segmentStart) / 1000;
      stats.successful++;
      stats.totalTime += duration;
      
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
  
  // Step 4: Export to TypeScript
  if (stats.successful > 0) {
    console.log('\n📝 Step 4: Exporting reports to TypeScript...');
    const outputPath = path.join(__dirname, '../src/data/audienceInsightsReports.ts');
    exportReportsToTypeScript(generatedReports, outputPath);
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
    console.log('   Reports are ready for instant loading at runtime.');
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

