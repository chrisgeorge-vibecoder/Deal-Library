/**
 * Analyze education levels across all commerce segments
 * to verify if low education is a data issue or methodological bias
 */

import { commerceAudienceService } from '../src/services/commerceAudienceService';
import { CensusDataService } from '../src/services/censusDataService';

interface SegmentEducationAnalysis {
  segment: string;
  zipCount: number;
  avgEducationBachelorsPlus: number;
  medianIncome: number;
  avgPopulation: number;
  sampleZips: string[];
}

async function analyzeEducationAcrossSegments() {
  console.log('📊 Analyzing Education Levels Across All Commerce Segments');
  console.log('='.repeat(80));
  
  // Load commerce data
  await commerceAudienceService.loadCommerceData();
  
  // Load census data
  const censusService = CensusDataService.getInstance();
  await censusService.loadCensusData();
  
  const allSegments = commerceAudienceService.getAudienceSegments();
  console.log(`\n📋 Analyzing ${allSegments.length} segments...\n`);
  
  const results: SegmentEducationAnalysis[] = [];
  
  for (const segment of allSegments) {
    // Get top 50 ZIPs for this segment
    const topZips = commerceAudienceService.searchZipCodesByAudience(segment.name, 50);
    
    if (topZips.length === 0) continue;
    
    // Get census data for these ZIPs
    const zipCodes = topZips.map(z => z.zipCode);
    const censusData = await censusService.getZipCodeData(zipCodes);
    
    if (censusData.length === 0) continue;
    
    // Calculate weighted education level
    let totalWeight = 0;
    let weightedEducation = 0;
    let weightedIncome = 0;
    let totalPopulation = 0;
    
    topZips.forEach(zip => {
      const census = censusData.find(c => c.zipCode === zip.zipCode);
      if (!census) return;
      
      const weight = zip.weight;
      const education = (census.demographics?.education?.bachelorDegree || 0) + 
                       (census.demographics?.education?.graduateDegree || 0);
      
      totalWeight += weight;
      weightedEducation += education * weight;
      weightedIncome += (census.economics?.householdIncome?.median || 0) * weight;
      totalPopulation += census.population || 0;
    });
    
    if (totalWeight === 0) continue;
    
    results.push({
      segment: segment.name,
      zipCount: topZips.length,
      avgEducationBachelorsPlus: weightedEducation / totalWeight,
      medianIncome: weightedIncome / totalWeight,
      avgPopulation: totalPopulation / topZips.length,
      sampleZips: topZips.slice(0, 5).map(z => z.zipCode)
    });
  }
  
  // Sort by education level
  results.sort((a, b) => b.avgEducationBachelorsPlus - a.avgEducationBachelorsPlus);
  
  console.log('\n📊 EDUCATION ANALYSIS RESULTS');
  console.log('='.repeat(80));
  
  // Statistics
  const educationLevels = results.map(r => r.avgEducationBachelorsPlus);
  const avgEducation = educationLevels.reduce((sum, val) => sum + val, 0) / educationLevels.length;
  const minEducation = Math.min(...educationLevels);
  const maxEducation = Math.max(...educationLevels);
  
  console.log(`\n📈 OVERALL STATISTICS (across ${results.length} segments):`);
  console.log(`   Average Education (Bachelor's+): ${avgEducation.toFixed(2)}%`);
  console.log(`   Minimum: ${minEducation.toFixed(2)}%`);
  console.log(`   Maximum: ${maxEducation.toFixed(2)}%`);
  console.log(`   US National Average: ~35%`);
  console.log(`   Difference: ${(avgEducation - 35).toFixed(2)}%\n`);
  
  // Top 10 highest education
  console.log('\n🎓 TOP 10 HIGHEST EDUCATION SEGMENTS:');
  console.log('-'.repeat(80));
  results.slice(0, 10).forEach((r, i) => {
    console.log(`${i + 1}. ${r.segment.padEnd(40)} ${r.avgEducationBachelorsPlus.toFixed(2)}% (Income: $${Math.round(r.medianIncome).toLocaleString()})`);
  });
  
  // Bottom 10 lowest education
  console.log('\n📉 BOTTOM 10 LOWEST EDUCATION SEGMENTS:');
  console.log('-'.repeat(80));
  results.slice(-10).reverse().forEach((r, i) => {
    console.log(`${i + 1}. ${r.segment.padEnd(40)} ${r.avgEducationBachelorsPlus.toFixed(2)}% (Income: $${Math.round(r.medianIncome).toLocaleString()})`);
  });
  
  // Distribution buckets
  const buckets = {
    veryLow: results.filter(r => r.avgEducationBachelorsPlus < 15).length,
    low: results.filter(r => r.avgEducationBachelorsPlus >= 15 && r.avgEducationBachelorsPlus < 25).length,
    medium: results.filter(r => r.avgEducationBachelorsPlus >= 25 && r.avgEducationBachelorsPlus < 35).length,
    high: results.filter(r => r.avgEducationBachelorsPlus >= 35 && r.avgEducationBachelorsPlus < 45).length,
    veryHigh: results.filter(r => r.avgEducationBachelorsPlus >= 45).length
  };
  
  console.log('\n📊 EDUCATION DISTRIBUTION:');
  console.log('-'.repeat(80));
  console.log(`   Very Low (<15%):     ${buckets.veryLow} segments (${(buckets.veryLow / results.length * 100).toFixed(1)}%)`);
  console.log(`   Low (15-25%):        ${buckets.low} segments (${(buckets.low / results.length * 100).toFixed(1)}%)`);
  console.log(`   Medium (25-35%):     ${buckets.medium} segments (${(buckets.medium / results.length * 100).toFixed(1)}%)`);
  console.log(`   High (35-45%):       ${buckets.high} segments (${(buckets.high / results.length * 100).toFixed(1)}%)`);
  console.log(`   Very High (45%+):    ${buckets.veryHigh} segments (${(buckets.veryHigh / results.length * 100).toFixed(1)}%)`);
  
  // Check correlation with income
  console.log('\n💰 INCOME vs EDUCATION CORRELATION:');
  console.log('-'.repeat(80));
  
  const highIncomeSegments = results.filter(r => r.medianIncome > 85000);
  const highIncomeAvgEdu = highIncomeSegments.reduce((sum, r) => sum + r.avgEducationBachelorsPlus, 0) / highIncomeSegments.length;
  
  const lowIncomeSegments = results.filter(r => r.medianIncome < 75000);
  const lowIncomeAvgEdu = lowIncomeSegments.reduce((sum, r) => sum + r.avgEducationBachelorsPlus, 0) / lowIncomeSegments.length;
  
  console.log(`   High Income Segments (>$85k): ${highIncomeSegments.length} segments, Avg Education: ${highIncomeAvgEdu.toFixed(2)}%`);
  console.log(`   Low Income Segments (<$75k):  ${lowIncomeSegments.length} segments, Avg Education: ${lowIncomeAvgEdu.toFixed(2)}%`);
  console.log(`   Correlation: ${highIncomeAvgEdu > lowIncomeAvgEdu ? 'POSITIVE (higher income = more education)' : 'NEGATIVE (higher income = less education?!)'}`);
  
  // Sample ZIPs analysis
  console.log('\n📍 SAMPLE: First segment\'s top 5 ZIPs census data:');
  console.log('-'.repeat(80));
  if (results.length > 0 && results[0]) {
    const firstSegment = results[0];
    const sampleCensus = await censusService.getZipCodeData(firstSegment.sampleZips);
    sampleCensus.forEach(census => {
      const edu = (census.demographics?.education?.bachelorDegree || 0) + 
                  (census.demographics?.education?.graduateDegree || 0);
      console.log(`   ${census.zipCode} (${census.geography?.city}, ${census.geography?.state}): ${edu.toFixed(1)}% Bachelor's+, Pop: ${census.population?.toLocaleString()}`);
    });
  }
  
  console.log('\n✅ Analysis complete!');
}

// Run the analysis
analyzeEducationAcrossSegments().catch(console.error);

