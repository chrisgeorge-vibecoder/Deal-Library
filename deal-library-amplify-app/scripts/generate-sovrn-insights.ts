/**
 * Generate Sovrn Insights from Launchpad Data
 * 
 * This script analyzes the audienceInsightsReports data to extract
 * surprising comparisons, demographic insights, and geographic opportunities
 * to populate the Sovrn Insights tool with data-backed content.
 * 
 * Usage:
 *   npx ts-node scripts/generate-sovrn-insights.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the audience insights data
const audienceInsightsPath = path.join(__dirname, '../src/data/audienceInsightsReports.ts');

interface BehavioralOverlap {
  segment: string;
  overlapPercentage: number;
  insight: string;
  overIndex: number;
  topMarkets: Array<{
    city: string;
    state: string;
    overIndex: number;
  }>;
}

interface GeoHotspot {
  zipCode: string;
  city: string;
  state: string;
  density: number;
  population?: number;
  overIndex: number;
}

interface Lifestyle {
  selfEmployed: number;
  married: number;
  dualIncome: number;
  avgCommuteTime: number;
  charitableGivers: number;
  stemDegree: number;
}

interface Demographics {
  incomeDistribution: Array<{ bracket: string; percentage: number; nationalAvg: number }>;
  educationLevels: Array<{ level: string; percentage: number }>;
  ageDistribution: Array<{ bracket: string; percentage: number }>;
  lifestyle?: Lifestyle;
  medianHomeValue?: number;
  homeOwnership?: number;
  avgHouseholdSize?: number;
}

interface AudienceReport {
  segment: string;
  category: string;
  executiveSummary: string;
  personaName: string;
  personaEmoji: string;
  keyMetrics: {
    medianHHI: number;
    medianHHIvsNational: number;
    medianHHIvsCommerce: number;
    topAgeBracket: string;
    educationLevel: number;
    educationVsNational: number;
    educationVsCommerce: number;
  };
  geographicHotspots: GeoHotspot[];
  demographics: Demographics;
  behavioralOverlap: BehavioralOverlap[];
}

interface SovrnInsight {
  id: string;
  headline: string;
  didYouKnow: string;
  marketingImplication: string;
  category: 'Consumer Profiles' | 'Lifestyle & Values' | 'Regional Markets' | 'City Insights' | 'Data Discoveries';
  tags: string[];
  featured?: boolean;
}

// US National averages for comparison
const US_NATIONAL = {
  medianHHI: 70784,
  educationBachelors: 34.6,
  selfEmployed: 11.8,
  married: 47.5,
  dualIncome: 53.4,
  charitableGivers: 22.1,
  stemDegree: 34.6,
  homeOwnership: 65.4,
  avgCommuteTime: 26.7,
};

function formatPercent(value: number, decimals: number = 1): string {
  return value.toFixed(decimals) + '%';
}

function formatMoney(value: number): string {
  return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatDiff(value: number, baseline: number): string {
  const diff = ((value / baseline) - 1) * 100;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${diff.toFixed(0)}%`;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateInsightsFromData(): SovrnInsight[] {
  // Read the raw file content
  const fileContent = fs.readFileSync(audienceInsightsPath, 'utf-8');
  
  // Extract the JSON object using regex
  const jsonMatch = fileContent.match(/export const audienceInsightsReports[^=]*=\s*(\{[\s\S]*\});?\s*$/);
  if (!jsonMatch) {
    console.error('Could not parse audienceInsightsReports');
    return [];
  }

  let reports: Record<string, AudienceReport>;
  try {
    // Clean up the JSON string and parse
    const jsonStr = jsonMatch[1].replace(/,(\s*[}\]])/g, '$1');
    reports = eval('(' + jsonStr + ')');
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return [];
  }

  const insights: SovrnInsight[] = [];
  const segments = Object.keys(reports);
  
  console.log(`\n📊 Found ${segments.length} audience segments to analyze\n`);

  // 1. CONSUMER PROFILES - Demographics & Income insights
  console.log('📈 Generating Consumer Profile insights...');
  for (const segmentName of segments) {
    const report = reports[segmentName];
    if (!report.keyMetrics) continue;

    const metrics = report.keyMetrics;
    const lifestyle = report.demographics?.lifestyle;
    
    // High-income segments
    if (metrics.medianHHIvsNational > 20) {
      insights.push({
        id: `income-${slugify(segmentName)}`,
        headline: `${segmentName} Buyers Earn ${formatDiff(metrics.medianHHI, US_NATIONAL.medianHHI)} More`,
        didYouKnow: `${segmentName} shoppers have a median household income of ${formatMoney(metrics.medianHHI)}—${formatPercent(metrics.medianHHIvsNational)} above the national average of ${formatMoney(US_NATIONAL.medianHHI)}. ${metrics.educationLevel > 50 ? `They're also ${formatPercent(metrics.educationLevel)} college-educated.` : ''}`,
        marketingImplication: metrics.medianHHIvsNational > 30 
          ? 'Premium positioning and quality messaging will resonate. These buyers can afford and expect the best.'
          : 'These consumers have discretionary income for considered purchases. Value-add messaging outperforms discount-driven approaches.',
        category: 'Consumer Profiles',
        tags: [segmentName.toLowerCase(), 'income', 'affluent', 'premium'],
      });
    }

    // High-education segments
    if (metrics.educationVsNational > 40 && lifestyle?.stemDegree && lifestyle.stemDegree > 40) {
      insights.push({
        id: `stem-${slugify(segmentName)}`,
        headline: `${segmentName} Shoppers: ${formatPercent(lifestyle.stemDegree)} STEM-Educated`,
        didYouKnow: `${segmentName} buyers have one of the highest STEM education rates at ${formatPercent(lifestyle.stemDegree)}—${formatDiff(lifestyle.stemDegree, US_NATIONAL.stemDegree)} above the national average. These are analytical, data-driven decision-makers.`,
        marketingImplication: 'Lead with specifications, comparisons, and evidence-based claims. These buyers research thoroughly before purchasing.',
        category: 'Consumer Profiles',
        tags: [segmentName.toLowerCase(), 'STEM', 'education', 'analytical'],
      });
    }
  }

  // 2. LIFESTYLE & VALUES insights
  console.log('💡 Generating Lifestyle & Values insights...');
  for (const segmentName of segments) {
    const report = reports[segmentName];
    const lifestyle = report.demographics?.lifestyle;
    if (!lifestyle) continue;

    // Self-employment insights
    if (lifestyle.selfEmployed > 15) {
      insights.push({
        id: `entrepreneur-${slugify(segmentName)}`,
        headline: `${formatPercent(lifestyle.selfEmployed)} of ${segmentName} Buyers Are Self-Employed`,
        didYouKnow: `${segmentName} shoppers have a ${formatPercent(lifestyle.selfEmployed)} self-employment rate—${formatDiff(lifestyle.selfEmployed, US_NATIONAL.selfEmployed)} above the national average of ${formatPercent(US_NATIONAL.selfEmployed)}. Many are entrepreneurs, freelancers, or small business owners.`,
        marketingImplication: 'B2E (business-to-entrepreneur) messaging resonates. Position products as business investments, not just personal purchases.',
        category: 'Lifestyle & Values',
        tags: [segmentName.toLowerCase(), 'entrepreneurs', 'self-employed', 'business'],
      });
    }

    // Charitable giving insights
    if (lifestyle.charitableGivers > 28) {
      insights.push({
        id: `charity-${slugify(segmentName)}`,
        headline: `${segmentName} Buyers Give ${formatDiff(lifestyle.charitableGivers, US_NATIONAL.charitableGivers)} More to Charity`,
        didYouKnow: `${segmentName} shoppers are ${formatPercent(lifestyle.charitableGivers)} charitable givers—significantly above the national average of ${formatPercent(US_NATIONAL.charitableGivers)}. These are values-driven consumers who support causes they believe in.`,
        marketingImplication: 'Cause marketing and social impact messaging will outperform purely transactional approaches. Partner with relevant nonprofits for authentic alignment.',
        category: 'Lifestyle & Values',
        tags: [segmentName.toLowerCase(), 'charity', 'values', 'cause-marketing'],
      });
    }

    // Dual-income insights
    if (lifestyle.dualIncome > 58) {
      insights.push({
        id: `dual-income-${slugify(segmentName)}`,
        headline: `${formatPercent(lifestyle.dualIncome)} of ${segmentName} Buyers Are Dual-Income`,
        didYouKnow: `${segmentName} households are ${formatPercent(lifestyle.dualIncome)} dual-income—${formatDiff(lifestyle.dualIncome, US_NATIONAL.dualIncome)} above the national average. Time is their scarcest resource.`,
        marketingImplication: 'Lead with convenience and time-saving benefits. "Save 10 hours per month" resonates more than "Save $50."',
        category: 'Lifestyle & Values',
        tags: [segmentName.toLowerCase(), 'dual-income', 'time-saving', 'convenience'],
      });
    }
  }

  // 3. GEOGRAPHIC OPPORTUNITIES - Over-indexing insights
  console.log('🗺️ Generating Geographic Opportunity insights...');
  for (const segmentName of segments) {
    const report = reports[segmentName];
    if (!report.geographicHotspots || report.geographicHotspots.length === 0) continue;

    const topSpot = report.geographicHotspots[0];
    if (topSpot.overIndex > 10000) {
      insights.push({
        id: `geo-${slugify(segmentName)}-${slugify(topSpot.city)}`,
        headline: `${topSpot.city}: ${(topSpot.overIndex / 100).toFixed(0)}x Over-Index for ${segmentName}`,
        didYouKnow: `${topSpot.city}, ${topSpot.state} over-indexes for ${segmentName} shoppers by ${topSpot.overIndex.toLocaleString()}%—that's ${(topSpot.overIndex / 100).toFixed(0)}x the national average. This ZIP (${topSpot.zipCode}) has a concentration of ${topSpot.density.toLocaleString()} active buyers.`,
        marketingImplication: `Hyperlocal targeting in ${topSpot.city} will dramatically outperform broad geo-targeting. Consider OOH, local partnerships, and geo-fenced digital campaigns.`,
        category: 'Regional Markets',
        tags: [segmentName.toLowerCase(), topSpot.city.toLowerCase(), topSpot.state.toLowerCase(), 'geographic', 'over-index'],
      });
    }
  }

  // 4. DATA DISCOVERIES - Paradoxical Pairings from behavioral overlap
  console.log('🔍 Generating Data Discovery insights (Paradoxical Pairings)...');
  const paradoxicalPairs: Array<{segment1: string; segment2: string; overlap: number; insight: string; report: AudienceReport}> = [];
  
  for (const segmentName of segments) {
    const report = reports[segmentName];
    if (!report.behavioralOverlap) continue;

    for (const overlap of report.behavioralOverlap) {
      // Look for surprising/paradoxical combinations
      const isPotentiallyParadoxical = 
        // Different categories suggest unexpected overlap
        (segmentName.toLowerCase().includes('tech') && overlap.segment.toLowerCase().includes('outdoor')) ||
        (segmentName.toLowerCase().includes('fitness') && overlap.segment.toLowerCase().includes('food')) ||
        (segmentName.toLowerCase().includes('luxury') && overlap.segment.toLowerCase().includes('budget')) ||
        // High overlap between seemingly unrelated categories
        (overlap.overlapPercentage > 40 && !overlap.segment.toLowerCase().includes(segmentName.toLowerCase().split(' ')[0])) ||
        // Any overlap above 50% is noteworthy
        overlap.overlapPercentage > 50;

      if (isPotentiallyParadoxical) {
        paradoxicalPairs.push({
          segment1: segmentName,
          segment2: overlap.segment,
          overlap: overlap.overlapPercentage,
          insight: overlap.insight,
          report: report,
        });
      }
    }
  }

  // Generate insights for top paradoxical pairs
  const uniquePairs = new Map<string, typeof paradoxicalPairs[0]>();
  for (const pair of paradoxicalPairs) {
    const key = [pair.segment1, pair.segment2].sort().join('|');
    if (!uniquePairs.has(key) || uniquePairs.get(key)!.overlap < pair.overlap) {
      uniquePairs.set(key, pair);
    }
  }

  const sortedPairs = Array.from(uniquePairs.values()).sort((a, b) => b.overlap - a.overlap);
  
  for (const pair of sortedPairs.slice(0, 25)) {
    const lifestyle = pair.report.demographics?.lifestyle;
    const metrics = pair.report.keyMetrics;
    
    let didYouKnow = `${pair.segment1} shoppers show a ${pair.overlap}% overlap with ${pair.segment2} buyers. `;
    
    if (lifestyle) {
      didYouKnow += `Both groups share key traits: ${lifestyle.dualIncome > 55 ? `${formatPercent(lifestyle.dualIncome)} dual-income, ` : ''}`;
      didYouKnow += `${metrics ? formatMoney(metrics.medianHHI) + ' median income' : ''}`;
      if (lifestyle.stemDegree > 40) didYouKnow += `, ${formatPercent(lifestyle.stemDegree)} STEM-educated`;
      didYouKnow += '.';
    }

    insights.push({
      id: `paradox-${slugify(pair.segment1)}-${slugify(pair.segment2)}`,
      headline: `${pair.segment1} Buyers Also Shop ${pair.segment2}`,
      didYouKnow: didYouKnow,
      marketingImplication: pair.insight || `Cross-promote between ${pair.segment1} and ${pair.segment2} categories. These buyers respond to bundled offers and lifestyle-based messaging.`,
      category: 'Data Discoveries',
      tags: [pair.segment1.toLowerCase(), pair.segment2.toLowerCase(), 'cross-purchase', 'paradox', 'overlap'],
    });
  }

  // 5. CITY INSIGHTS - Top markets with demographic context
  console.log('🏙️ Generating City Insights...');
  const cityData = new Map<string, {segments: string[]; totalOverIndex: number; avgIncome: number}>();
  
  for (const segmentName of segments) {
    const report = reports[segmentName];
    if (!report.geographicHotspots) continue;

    for (const hotspot of report.geographicHotspots.slice(0, 5)) {
      const key = `${hotspot.city}, ${hotspot.state}`;
      if (!cityData.has(key)) {
        cityData.set(key, { segments: [], totalOverIndex: 0, avgIncome: 0 });
      }
      const data = cityData.get(key)!;
      data.segments.push(segmentName);
      data.totalOverIndex += hotspot.overIndex;
      if (report.keyMetrics) {
        data.avgIncome = (data.avgIncome + report.keyMetrics.medianHHI) / 2 || report.keyMetrics.medianHHI;
      }
    }
  }

  // Top cities by diversity of high-indexing categories
  const topCities = Array.from(cityData.entries())
    .filter(([_, data]) => data.segments.length >= 3)
    .sort((a, b) => b[1].segments.length - a[1].segments.length)
    .slice(0, 10);

  for (const [cityState, data] of topCities) {
    const [city, state] = cityState.split(', ');
    insights.push({
      id: `city-${slugify(city)}`,
      headline: `${city}: Top Market for ${data.segments.length} Categories`,
      didYouKnow: `${city}, ${state} is a geographic hotspot for ${data.segments.slice(0, 4).join(', ')}${data.segments.length > 4 ? ` and ${data.segments.length - 4} more categories` : ''}. Average shopper income: ${formatMoney(data.avgIncome)}.`,
      marketingImplication: `${city} is a high-value market for multi-category advertisers. Test campaigns here before broader rollout.`,
      category: 'City Insights',
      tags: [city.toLowerCase(), state.toLowerCase(), 'geographic', 'hotspot', 'multi-category'],
    });
  }

  console.log(`\n✅ Generated ${insights.length} insights total\n`);
  return insights;
}

function appendInsightsToFile(newInsights: SovrnInsight[]): void {
  const outputPath = path.join(__dirname, '../src/data/sovrnInsights.ts');
  
  // Read existing file
  const existingContent = fs.readFileSync(outputPath, 'utf-8');
  
  // Find the closing of the sovrnInsights array ("];")
  // We need to insert new insights before the closing bracket
  const arrayEndMatch = existingContent.match(/(\n\];)\s*\n\n\/\/ Helper function/);
  
  if (!arrayEndMatch) {
    console.error('Could not find the end of sovrnInsights array');
    return;
  }

  // Get existing insight IDs to avoid duplicates
  const existingIds = new Set<string>();
  const idMatches = existingContent.matchAll(/id: ['"]([^'"]+)['"]/g);
  for (const match of idMatches) {
    existingIds.add(match[1]);
  }

  // Filter out duplicates
  const uniqueNewInsights = newInsights.filter(insight => !existingIds.has(insight.id));
  
  if (uniqueNewInsights.length === 0) {
    console.log('No new unique insights to add (all already exist)');
    return;
  }

  // Format new insights as JavaScript objects
  const newInsightsStr = uniqueNewInsights.map(insight => `
  // AUTO-GENERATED FROM LAUNCHPAD DATA
  {
    id: '${insight.id}',
    headline: '${insight.headline.replace(/'/g, "\\'")}',
    didYouKnow: '${insight.didYouKnow.replace(/'/g, "\\'")}',
    marketingImplication: '${insight.marketingImplication.replace(/'/g, "\\'")}',
    category: '${insight.category}',
    tags: [${insight.tags.map(t => `'${t}'`).join(', ')}],
  },`).join('\n');

  // Insert new insights before the closing bracket
  const insertPosition = arrayEndMatch.index!;
  const newContent = 
    existingContent.slice(0, insertPosition) + 
    newInsightsStr + 
    existingContent.slice(insertPosition);

  fs.writeFileSync(outputPath, newContent, 'utf-8');
  
  console.log(`\n📝 Appended ${uniqueNewInsights.length} new insights to ${outputPath}`);
  console.log(`   (${newInsights.length - uniqueNewInsights.length} duplicates skipped)`);
  
  // Count total insights
  const totalIds = (newContent.match(/id: ['"][^'"]+['"]/g) || []).length;
  console.log(`   Total insights now: ${totalIds}`);
}

// Main execution
console.log('🚀 Generating Sovrn Insights from Launchpad Data...\n');
const insights = generateInsightsFromData();

if (insights.length > 0) {
  appendInsightsToFile(insights);
  console.log('\n✅ Done! New Sovrn Insights have been appended from Launchpad data.');
} else {
  console.error('\n❌ No insights generated. Check the data source.');
}

