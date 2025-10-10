/**
 * Print Commerce Baseline Values
 */

import { commerceBaselineService } from '../src/services/commerceBaselineService';
import { commerceAudienceService } from '../src/services/commerceAudienceService';

async function printBaseline() {
  console.log('📊 COMMERCE BASELINE ANALYSIS\n');
  console.log('═'.repeat(80));
  
  try {
    // Load commerce data first
    console.log('\nStep 1: Loading commerce data...');
    await commerceAudienceService.loadCommerceData();
    
    // Calculate baseline
    console.log('\nStep 2: Calculating commerce baseline...');
    const baseline = await commerceBaselineService.getBaseline();
    
    console.log('\n' + '═'.repeat(80));
    console.log('📊 COMMERCE BASELINE (Typical Online Shopper)');
    console.log('═'.repeat(80));
    console.log(`\n   Income: $${baseline.medianHHI.toLocaleString()}`);
    console.log(`   Age: ${baseline.medianAge} years`);
    console.log(`   Education: ${baseline.educationBachelorsPlus}%`);
    console.log(`   Home Ownership: ${baseline.homeOwnership}%`);
    console.log(`   Household Size: ${baseline.avgHouseholdSize}`);
    console.log(`   Home Value: $${baseline.homeValue?.toLocaleString() || 'N/A'}`);
    
    console.log('\n' + '═'.repeat(80));
    console.log('💡 INTERPRETATION');
    console.log('═'.repeat(80));
    console.log(`\nThis baseline represents the "typical online shopper" across all`);
    console.log(`top commerce-active ZIPs in the US.`);
    console.log(`\nEducation: ${baseline.educationBachelorsPlus}%`);
    
    if (baseline.educationBachelorsPlus > 45) {
      console.log(`   ⚠️  This is VERY HIGH (above national avg of ~43.8%)`);
      console.log(`   Suggests commerce baseline is capturing highly-educated urban areas`);
    } else if (baseline.educationBachelorsPlus > 40) {
      console.log(`   ✅ This is slightly above national average (~43.8%)`);
    } else if (baseline.educationBachelorsPlus > 35) {
      console.log(`   ⚠️  This is below national average (~43.8%)`);
      console.log(`   But reasonable for commerce-active areas`);
    } else {
      console.log(`   ❌ This is LOW (well below national avg of ~43.8%)`);
      console.log(`   There may be a methodological issue`);
    }
    
    console.log(`\n✅ Analysis complete!\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run
printBaseline().catch(console.error);

