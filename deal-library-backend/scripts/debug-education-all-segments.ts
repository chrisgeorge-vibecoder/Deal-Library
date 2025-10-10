/**
 * Debug Education Levels Across All Segments
 * 
 * This script will:
 * 1. Load commerce baseline
 * 2. Test 10 random segments
 * 3. Check education calculation methodology
 * 4. Compare vs commerce baseline
 * 5. Identify if there's a systematic bias
 */

import { commerceAudienceService } from '../src/services/commerceAudienceService';
import { CensusDataService } from '../src/services/censusDataService';
import { commerceBaselineService } from '../src/services/commerceBaselineService';

async function debugEducation() {
  console.log('🔍 EDUCATION LEVEL DEBUG - ALL SEGMENTS\n');
  console.log('═'.repeat(80));
  
  try {
    // Step 1: Load commerce baseline
    console.log('\n📊 STEP 1: Load Commerce Baseline');
    const baseline = await commerceBaselineService.getBaseline();
    console.log(`   Commerce Baseline Education: ${baseline.educationBachelorsPlus.toFixed(1)}%`);
    
    // Step 2: Get all segments
    console.log('\n📊 STEP 2: Get Sample Segments');
    const allSegments = commerceAudienceService.getAllSegments();
    console.log(`   Total segments available: ${allSegments.length}`);
    
    // Test 10 random segments
    const testSegments = [
      'Audio',
      'Pet Supplies',
      'Baby & Toddler Clothing',
      'Golf',
      'Office Furniture',
      'Computer Components',
      'Vitamins & Supplements',
      'Gardening',
      'Toys',
      'Running'
    ].filter(s => allSegments.includes(s));
    
    console.log(`   Testing ${testSegments.length} segments\n`);
    
    // Step 3: Analyze each segment
    const censusService = CensusDataService.getInstance();
    const results: any[] = [];
    
    for (const segment of testSegments) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📦 SEGMENT: ${segment}`);
      console.log(`${'─'.repeat(80)}`);
      
      // Get top 50 ZIPs for this segment
      const topZips = commerceAudienceService.searchZipCodesByAudience(segment, 50);
      console.log(`   Top ZIPs: ${topZips.length}`);
      
      // Calculate weighted education
      let weightedEducation = 0;
      let totalWeight = 0;
      let zipsWithData = 0;
      let zipsWithoutData = 0;
      let sampleEducationValues: number[] = [];
      
      for (const zip of topZips) {
        const census = censusService.getCensusDataForZip(zip.zipCode);
        const weight = zip.weight;
        
        if (census && census.demographics?.education) {
          const bachelor = census.demographics.education.bachelorDegree || 0;
          const graduate = census.demographics.education.graduateDegree || 0;
          const education = bachelor + graduate;
          
          weightedEducation += education * weight;
          totalWeight += weight;
          zipsWithData++;
          
          if (sampleEducationValues.length < 5) {
            sampleEducationValues.push(education);
            console.log(`      ZIP ${zip.zipCode}: ${education.toFixed(1)}% Bachelor's+ (weight: ${weight.toLocaleString()})`);
          }
        } else {
          zipsWithoutData++;
        }
      }
      
      const avgEducation = totalWeight > 0 ? (weightedEducation / totalWeight) : 0;
      const vsCommerce = ((avgEducation / baseline.educationBachelorsPlus) - 1) * 100;
      
      console.log(`\n   📊 EDUCATION CALCULATION:`);
      console.log(`      Weighted Education: ${avgEducation.toFixed(1)}%`);
      console.log(`      Commerce Baseline: ${baseline.educationBachelorsPlus.toFixed(1)}%`);
      console.log(`      vs Commerce: ${vsCommerce >= 0 ? '+' : ''}${vsCommerce.toFixed(1)}%`);
      console.log(`      ZIPs with data: ${zipsWithData} / ${topZips.length}`);
      console.log(`      Sample values: ${sampleEducationValues.map(v => v.toFixed(1) + '%').join(', ')}`);
      
      results.push({
        segment,
        education: avgEducation,
        vsCommerce,
        zipsWithData,
        totalZips: topZips.length,
        sampleValues: sampleEducationValues
      });
    }
    
    // Step 4: Analyze results
    console.log(`\n\n${'═'.repeat(80)}`);
    console.log('📊 SUMMARY: Education vs Commerce Baseline');
    console.log(`${'═'.repeat(80)}\n`);
    
    const aboveBaseline = results.filter(r => r.vsCommerce > 0);
    const belowBaseline = results.filter(r => r.vsCommerce < 0);
    const nearBaseline = results.filter(r => Math.abs(r.vsCommerce) <= 5);
    
    console.log(`✅ ABOVE Commerce Baseline (+): ${aboveBaseline.length}`);
    aboveBaseline.forEach(r => {
      console.log(`   • ${r.segment}: ${r.education.toFixed(1)}% (${r.vsCommerce >= 0 ? '+' : ''}${r.vsCommerce.toFixed(1)}%)`);
    });
    
    console.log(`\n⚠️  NEAR Commerce Baseline (±5%): ${nearBaseline.length}`);
    nearBaseline.forEach(r => {
      console.log(`   • ${r.segment}: ${r.education.toFixed(1)}% (${r.vsCommerce >= 0 ? '+' : ''}${r.vsCommerce.toFixed(1)}%)`);
    });
    
    console.log(`\n❌ BELOW Commerce Baseline (-): ${belowBaseline.length}`);
    belowBaseline.forEach(r => {
      console.log(`   • ${r.segment}: ${r.education.toFixed(1)}% (${r.vsCommerce >= 0 ? '+' : ''}${r.vsCommerce.toFixed(1)}%)`);
    });
    
    // Check if there's a systematic bias
    console.log(`\n\n${'═'.repeat(80)}`);
    console.log('🔍 BIAS ANALYSIS');
    console.log(`${'═'.repeat(80)}\n`);
    
    const avgVsCommerce = results.reduce((sum, r) => sum + r.vsCommerce, 0) / results.length;
    console.log(`   Average vs Commerce: ${avgVsCommerce >= 0 ? '+' : ''}${avgVsCommerce.toFixed(1)}%`);
    
    if (avgVsCommerce < -10) {
      console.log(`   ⚠️  SYSTEMATIC NEGATIVE BIAS DETECTED!`);
      console.log(`   All segments average ${avgVsCommerce.toFixed(1)}% BELOW commerce baseline.`);
      console.log(`   This suggests a methodological issue.`);
    } else if (avgVsCommerce > 10) {
      console.log(`   ⚠️  SYSTEMATIC POSITIVE BIAS DETECTED!`);
      console.log(`   All segments average ${avgVsCommerce.toFixed(1)}% ABOVE commerce baseline.`);
      console.log(`   This suggests a methodological issue.`);
    } else {
      console.log(`   ✅ No systematic bias detected.`);
      console.log(`   Results are reasonably distributed around commerce baseline.`);
    }
    
    // Check raw education values
    console.log(`\n\n${'═'.repeat(80)}`);
    console.log('🔍 RAW EDUCATION VALUES ACROSS SAMPLES');
    console.log(`${'═'.repeat(80)}\n`);
    
    results.forEach(r => {
      console.log(`   ${r.segment}:`);
      console.log(`      Sample ZIPs: ${r.sampleValues.map(v => v.toFixed(1) + '%').join(', ')}`);
      console.log(`      Weighted Avg: ${r.education.toFixed(1)}%`);
      console.log(`      Commerce Baseline: ${baseline.educationBachelorsPlus.toFixed(1)}%`);
    });
    
    console.log(`\n\n✅ Debug complete!\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run debug
debugEducation().catch(console.error);



