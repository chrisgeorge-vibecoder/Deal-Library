/**
 * Script to generate LinkedIn post insights from Commerce Audiences
 * 
 * This script:
 * 1. Loads commerce audience data from database
 * 2. Uses 10 specific audiences
 * 3. Generates comprehensive insights reports for each
 * 4. Extracts 10 "Did you know?" insights per audience (with highest indexing markets)
 * 5. Generates punchy/humorous intros for each post
 * 6. Outputs results in JSON format ready for LinkedIn posts
 */

import { commerceAudienceService } from '../src/services/commerceAudienceService';
import { audienceInsightsService } from '../src/services/audienceInsightsService';
import * as fs from 'fs';
import * as path from 'path';

interface LinkedInInsight {
  audience: string;
  insight: string;
  data: string | number;
  context: string;
}

interface AudienceInsightsBundle {
  audienceName: string;
  insights: LinkedInInsight[];
  reportSummary: string;
}

/**
 * Get all unique Commerce Audience names from loaded data
 */
function getAllCommerceAudiences(): string[] {
  console.log('🔍 Fetching all unique Commerce Audiences from loaded data...\n');
  
  // Use the commerce service's built-in method to get all segments
  const segments = commerceAudienceService.getAudienceSegments();
  
  if (!segments || segments.length === 0) {
    throw new Error('No commerce audiences found. Make sure data is loaded.');
  }
  
  // Extract just the audience names
  const audienceNames = segments.map(seg => seg.name);
  
  console.log(`✅ Found ${audienceNames.length} unique Commerce Audiences\n`);
  
  return audienceNames;
}

/**
 * Randomly select N items from an array
 */
function getRandomSelection<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Extract 10 "Did you know?" insights from an audience report
 */
function extractDidYouKnowInsights(audienceName: string, report: any): LinkedInInsight[] {
  const insights: LinkedInInsight[] = [];
  
  try {
    // Insight 1: Income vs National Average
    if (report.keyMetrics?.medianHHI && report.keyMetrics?.medianHHIvsNational) {
      const direction = report.keyMetrics.medianHHIvsNational > 0 ? 'higher' : 'lower';
      const percentage = Math.abs(report.keyMetrics.medianHHIvsNational).toFixed(1);
      insights.push({
        audience: audienceName,
        insight: `Income Level`,
        data: `$${report.keyMetrics.medianHHI.toLocaleString()} median HHI`,
        context: `${percentage}% ${direction} than the national average`
      });
    }
    
    // Insight 2: Income vs Commerce Baseline
    if (report.keyMetrics?.medianHHI && report.keyMetrics?.medianHHIvsCommerce !== undefined) {
      const direction = report.keyMetrics.medianHHIvsCommerce > 0 ? 'higher' : 'lower';
      const percentage = Math.abs(report.keyMetrics.medianHHIvsCommerce).toFixed(1);
      insights.push({
        audience: audienceName,
        insight: `Purchasing Power`,
        data: `${percentage}% ${direction} income`,
        context: `compared to average online shoppers`
      });
    }
    
    // Insight 3: Education Level vs National
    if (report.keyMetrics?.educationLevel && report.keyMetrics?.educationVsNational) {
      const direction = report.keyMetrics.educationVsNational > 0 ? 'higher' : 'lower';
      const percentage = Math.abs(report.keyMetrics.educationVsNational).toFixed(1);
      insights.push({
        audience: audienceName,
        insight: `Education Level`,
        data: `${report.keyMetrics.educationLevel.toFixed(1)}% Bachelor's degree or higher`,
        context: `${percentage}% ${direction} than national average`
      });
    }
    
    // Insight 4: Education vs Commerce Baseline
    if (report.keyMetrics?.educationLevel && report.keyMetrics?.educationVsCommerce !== undefined) {
      const direction = report.keyMetrics.educationVsCommerce > 0 ? 'higher' : 'lower';
      const percentage = Math.abs(report.keyMetrics.educationVsCommerce).toFixed(1);
      insights.push({
        audience: audienceName,
        insight: `Education vs Online Shoppers`,
        data: `${percentage}% ${direction} education level`,
        context: `compared to typical e-commerce audience`
      });
    }
    
    // Insight 5: HIGHEST INDEXING MARKETS (using overIndex data)
    if (report.geographicHotspots && report.geographicHotspots.length >= 3) {
      // Sort by overIndex (highest first) and get top 3
      const sortedByIndex = [...report.geographicHotspots]
        .filter((h: any) => h.overIndex && h.overIndex > 0)
        .sort((a: any, b: any) => (b.overIndex || 0) - (a.overIndex || 0))
        .slice(0, 3);
      
      if (sortedByIndex.length >= 3) {
        const topIndexedMarkets = sortedByIndex
          .map((h: any) => `${h.city}, ${h.state} (${h.overIndex.toFixed(1)}x)`)
          .join(' • ');
        insights.push({
          audience: audienceName,
          insight: `Highest Indexing Markets`,
          data: topIndexedMarkets,
          context: `Most concentrated markets - audience over-indexes vs. national average`
        });
      }
    }
    
    // Insight 6: Age Demographics
    if (report.keyMetrics?.topAgeBracket) {
      const ageBracket = report.keyMetrics.topAgeBracket;
      const ageDistribution = report.demographics?.ageDistribution || [];
      const topAgeData = ageDistribution.find((a: any) => a.bracket === ageBracket);
      const percentage = topAgeData ? topAgeData.percentage.toFixed(0) : 'N/A';
      insights.push({
        audience: audienceName,
        insight: `Primary Age Group`,
        data: `Ages ${ageBracket}`,
        context: `Represents ${percentage}% of this audience segment`
      });
    }
    
    // Insight 7: Household Size
    if (report.demographics?.avgHouseholdSize) {
      const hhSize = report.demographics.avgHouseholdSize.toFixed(1);
      const comparison = report.demographics.avgHouseholdSize > 2.5 ? 'larger families' : 'smaller households';
      insights.push({
        audience: audienceName,
        insight: `Household Composition`,
        data: `${hhSize} average household size`,
        context: `Indicates ${comparison} - important for product sizing and packaging`
      });
    }
    
    // Insight 8: Homeownership & Home Value
    if (report.demographics?.homeOwnership && report.demographics?.medianHomeValue) {
      const ownership = report.demographics.homeOwnership.toFixed(0);
      const homeValue = (report.demographics.medianHomeValue / 1000).toFixed(0);
      insights.push({
        audience: audienceName,
        insight: `Homeownership & Wealth`,
        data: `${ownership}% homeowners, $${homeValue}K median home value`,
        context: `Indicates market affluence and stability`
      });
    }
    
    // Insight 9: Lifestyle - Multiple characteristics
    if (report.demographics?.lifestyle) {
      const lifestyle = report.demographics.lifestyle;
      const traits: string[] = [];
      if (lifestyle.selfEmployed > 15) traits.push(`${lifestyle.selfEmployed.toFixed(0)}% self-employed`);
      if (lifestyle.married > 50) traits.push(`${lifestyle.married.toFixed(0)}% married`);
      if (lifestyle.dualIncome > 50) traits.push(`${lifestyle.dualIncome.toFixed(0)}% dual income`);
      
      if (traits.length > 0) {
        insights.push({
          audience: audienceName,
          insight: `Lifestyle Profile`,
          data: traits.join(' • '),
          context: `Key demographic characteristics for targeting`
        });
      }
    }
    
    // Insight 10: Behavioral overlap (top related segment)
    if (report.behavioralOverlap && report.behavioralOverlap.length > 0) {
      const topOverlap = report.behavioralOverlap[0];
      insights.push({
        audience: audienceName,
        insight: `Cross-Shopping Behavior`,
        data: `${topOverlap.overlapPercentage.toFixed(0)}% also shop ${topOverlap.segment}`,
        context: `Opportunity for bundled offers and category expansion`
      });
    }
    
    // Insight 11 (bonus): Second behavioral overlap
    if (report.behavioralOverlap && report.behavioralOverlap.length > 1) {
      const secondOverlap = report.behavioralOverlap[1];
      insights.push({
        audience: audienceName,
        insight: `Secondary Interest`,
        data: `${secondOverlap.overlapPercentage.toFixed(0)}% also shop ${secondOverlap.segment}`,
        context: `Additional cross-sell opportunity`
      });
    }
    
    // Insight 12 (bonus): Urban/Rural split
    if (report.demographics?.urbanRuralDistribution && report.demographics.urbanRuralDistribution.length > 0) {
      const topType = report.demographics.urbanRuralDistribution[0];
      insights.push({
        audience: audienceName,
        insight: `Geographic Distribution`,
        data: `${topType.percentage.toFixed(0)}% ${topType.type}`,
        context: `Informs media buying and delivery strategies`
      });
    }
    
    // Insight 13 (bonus): Commute time (if notable)
    if (report.demographics?.lifestyle?.avgCommuteTime) {
      const commute = report.demographics.lifestyle.avgCommuteTime.toFixed(0);
      insights.push({
        audience: audienceName,
        insight: `Commute Patterns`,
        data: `${commute} minute average commute`,
        context: `Insights for podcast/radio/mobile targeting`
      });
    }
    
  } catch (error) {
    console.error(`⚠️  Error extracting insights for ${audienceName}:`, error);
  }
  
  // Return exactly 10 insights (or as many as we could generate)
  return insights.slice(0, 10);
}

/**
 * Generate a punchy, humorous, or provocative intro based on insights
 */
function generatePunchyIntro(audienceName: string, insights: LinkedInInsight[], reportSummary: string): string {
  // Extract key data points
  const incomeInsight = insights.find(i => i.insight.includes('Income') || i.insight.includes('Purchasing'));
  const educationInsight = insights.find(i => i.insight.includes('Education'));
  const ageInsight = insights.find(i => i.insight.includes('Age'));
  const marketInsight = insights.find(i => i.insight.includes('Index'));
  const crossShopInsight = insights.find(i => i.insight.includes('Cross-Shopping') || i.insight.includes('Secondary'));
  
  const intros = [
    // Income-based intros
    incomeInsight && String(incomeInsight.data).includes('lower') ? 
      `Think ${audienceName} buyers are rolling in cash? Think again. These savvy shoppers are proving you don't need a six-figure salary to have expensive tastes.` : null,
    
    incomeInsight && String(incomeInsight.data).includes('higher') ?
      `${audienceName} shoppers aren't messing around - and their wallets prove it. Here's who's really spending money in this category.` : null,
    
    // Education-based intros
    educationInsight && String(educationInsight.data).includes('lower') ?
      `Surprise: ${audienceName} buyers don't have Ivy League diplomas. Turns out, you don't need a PhD to know what you want.` : null,
    
    educationInsight && String(educationInsight.data).includes('higher') ?
      `${audienceName} shoppers are basically walking diplomas. Here's what happens when the overachievers go shopping.` : null,
    
    // Cross-shopping intros
    crossShopInsight ?
      `Plot twist: ${audienceName} buyers are also secretly obsessed with something completely unexpected. The data tells a wild story.` : null,
    
    // Age-based intros
    ageInsight && String(ageInsight.data).includes('30-39') ?
      `Millennials conquered avocado toast, now they're dominating ${audienceName}. Here's the data that explains everything.` : null,
    
    ageInsight && String(ageInsight.data).includes('40-49') ?
      `Gen X is quietly winning at ${audienceName} - and nobody's talking about it. Time to shine a light on the real buyers.` : null,
    
    ageInsight && String(ageInsight.data).includes('50-59') ?
      `Forget the stereotypes. ${audienceName} shoppers are redefining what it means to age like fine wine.` : null,
    
    // Market-based intros
    marketInsight ?
      `Not all cities are created equal when it comes to ${audienceName}. Some markets are absolutely crushing it - like, 10x crushing it.` : null,
    
    // Generic punchy intros
    `Breaking: ${audienceName} buyers are not who you think they are. The data just destroyed every assumption.`,
    
    `${audienceName} shoppers are a fascinating paradox - and the numbers prove it. Buckle up for some surprising insights.`,
    
    `If your ${audienceName} marketing strategy doesn't account for these 10 facts, you're leaving money on the table. 💰`,
    
    `${audienceName} audience decoded: What 2 million shopping behaviors reveal about who's really buying (and why).`,
    
    `The ${audienceName} market just got interesting. These 10 insights explain why your competitors are doing it all wrong.`,
    
    `${audienceName} buyers are playing a completely different game than you think. Here's what the data reveals.`,
    
    `Controversial take: Everything you know about ${audienceName} shoppers is probably wrong. Here's what the data actually says.`,
  ].filter((intro): intro is string => intro !== null);
  
  // Pick a random intro from the available options
  return intros[Math.floor(Math.random() * intros.length)] || 
    `${audienceName} shoppers are full of surprises. Here are 10 data-backed insights you need to know.`;
}

/**
 * Format insights as LinkedIn post content
 */
function formatAsLinkedInPosts(bundles: AudienceInsightsBundle[]): string {
  let output = '';
  
  bundles.forEach((bundle, index) => {
    output += `\n${'='.repeat(80)}\n`;
    output += `LINKEDIN POST #${index + 1}: ${bundle.audienceName}\n`;
    output += `${'='.repeat(80)}\n\n`;
    
    // Generate punchy intro
    const intro = generatePunchyIntro(bundle.audienceName, bundle.insights, bundle.reportSummary);
    output += `${intro}\n\n`;
    
    output += `🎯 Did You Know?\n\n`;
    
    bundle.insights.forEach((insight, i) => {
      output += `${i + 1}. ${insight.insight}\n`;
      output += `   📊 ${insight.data}\n`;
      output += `   💡 ${insight.context}\n\n`;
    });
    
    output += `---\n`;
    output += `These data-driven insights are powered by Sovrn's Commerce Audience Intelligence platform, analyzing real shopping behavior across millions of consumers.\n\n`;
    output += `#AudienceInsights #CommerceData #TargetedMarketing #${bundle.audienceName.replace(/[^a-zA-Z0-9]/g, '')}\n\n`;
  });
  
  return output;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 LinkedIn Insights Generator for Commerce Audiences\n');
  console.log('=' .repeat(80));
  console.log('\n');
  
  try {
    // Step 1: Load commerce data
    console.log('📊 Loading commerce audience data...\n');
    const loadResult = await commerceAudienceService.loadCommerceData();
    if (!loadResult.success) {
      throw new Error(loadResult.message);
    }
    
    // Step 2: Get all unique audiences
    const allAudiences = getAllCommerceAudiences();
    console.log(`📋 Available audiences: ${allAudiences.slice(0, 5).join(', ')}... and ${allAudiences.length - 5} more\n`);
    
    // Step 3: User-specified audiences (Health & Beauty segment)
    const selectedAudiences = [
      'Health & Beauty',
      'Cosmetics',
      'Hairdressing & Cosmetology'
    ];
    console.log('🎯 Selected audiences (Health & Beauty segment):\n');
    selectedAudiences.forEach((aud, i) => console.log(`   ${i + 1}. ${aud}`));
    console.log('\n');
    
    // Step 4: Generate reports for each audience
    const insightBundles: AudienceInsightsBundle[] = [];
    
    for (let i = 0; i < selectedAudiences.length; i++) {
      const audienceName = selectedAudiences[i];
      
      // TypeScript guard: ensure audienceName is defined
      if (!audienceName) {
        console.log(`⚠️  Skipping undefined audience at index ${i}\n`);
        continue;
      }
      
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📈 Processing ${i + 1}/${selectedAudiences.length}: ${audienceName}`);
      console.log(`${'─'.repeat(80)}\n`);
      
      try {
        // Generate full insights report
        const report = await audienceInsightsService.generateReport(audienceName, undefined, false);
        
        // Extract 10 "Did you know?" insights
        const insights = extractDidYouKnowInsights(audienceName, report);
        
        if (insights.length > 0) {
          insightBundles.push({
            audienceName,
            insights,
            reportSummary: report.executiveSummary || 'No summary available'
          });
          
          console.log(`✅ Extracted ${insights.length} insights for ${audienceName}\n`);
        } else {
          console.log(`⚠️  No insights could be extracted for ${audienceName}\n`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to generate report for ${audienceName}:`, error);
        console.log(`   Skipping this audience and continuing...\n`);
      }
    }
    
    // Step 5: Format and output results
    console.log(`\n${'='.repeat(80)}`);
    console.log('📝 GENERATING LINKEDIN POSTS');
    console.log(`${'='.repeat(80)}\n`);
    
    const linkedInContent = formatAsLinkedInPosts(insightBundles);
    
    // Save to file
    const outputDir = path.join(__dirname, '../../');
    const outputFile = path.join(outputDir, 'linkedin-commerce-insights.txt');
    fs.writeFileSync(outputFile, linkedInContent, 'utf-8');
    
    // Also save as JSON for programmatic use
    const jsonOutputFile = path.join(outputDir, 'linkedin-commerce-insights.json');
    fs.writeFileSync(jsonOutputFile, JSON.stringify(insightBundles, null, 2), 'utf-8');
    
    console.log('✅ SUCCESS!\n');
    console.log(`📄 Text output saved to: ${outputFile}`);
    console.log(`📄 JSON output saved to: ${jsonOutputFile}`);
    console.log(`\n📊 Generated ${insightBundles.length} audience insight bundles`);
    console.log(`📝 Total insights: ${insightBundles.reduce((sum, b) => sum + b.insights.length, 0)}`);
    console.log('\n');
    
    // Print preview
    console.log('📋 PREVIEW OF FIRST POST:\n');
    console.log(linkedInContent.split('='.repeat(80))[1]);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

// Run the script
main().then(() => {
  console.log('\n✅ Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});

