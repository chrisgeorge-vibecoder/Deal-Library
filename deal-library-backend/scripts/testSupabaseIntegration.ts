import * as dotenv from 'dotenv';
import * as path from 'path';
import { SupabaseService } from '../src/services/supabaseService';
import { CensusDataService } from '../src/services/censusDataService';
import { commerceAudienceService } from '../src/services/commerceAudienceService';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testSupabaseIntegration() {
  console.log('\n🧪 === TESTING SUPABASE INTEGRATION ===\n');
  
  const isEnabled = process.env.USE_SUPABASE === 'true';
  console.log(`📊 USE_SUPABASE: ${isEnabled ? 'TRUE ✅' : 'FALSE (CSV mode)'}\n`);
  
  try {
    // Test 1: Supabase Connection
    console.log('1️⃣  Testing Supabase connection...');
    if (isEnabled) {
      const supabase = SupabaseService.getClient();
      const { data, error } = await supabase.from('census_data').select('count').limit(1);
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Connection failed: ${error.message}`);
      }
      console.log('   ✅ Supabase connected\n');
    } else {
      console.log('   ⏭️  Skipped (Supabase disabled)\n');
    }
    
    // Test 2: Census Data Loading
    console.log('2️⃣  Testing Census Data loading...');
    const censusService = CensusDataService.getInstance();
    const censusResult = await censusService.loadCensusData();
    
    console.log(`   ✅ Census loaded: ${censusResult.summary.totalZipCodes.toLocaleString()} ZIP codes`);
    console.log(`   📍 States: ${censusResult.summary.states.length}`);
    console.log(`   💰 Avg Income: $${censusResult.summary.averageIncome.toLocaleString()}\n`);
    
    // Test 3: Commerce Audience Loading
    console.log('3️⃣  Testing Commerce Audience loading...');
    const commerceResult = await commerceAudienceService.loadCommerceData();
    
    console.log(`   ✅ Commerce loaded: ${commerceResult.stats?.totalRecords.toLocaleString()} records`);
    console.log(`   🎯 Segments: ${commerceResult.stats?.audienceSegments.length}\n`);
    
    // Test 4: Query Performance
    console.log('4️⃣  Testing query performance...');
    const startTime = Date.now();
    const audioSegment = commerceAudienceService.searchZipCodesByAudience('Audio', 100);
    const queryTime = Date.now() - startTime;
    
    console.log(`   ✅ Query completed in ${queryTime}ms`);
    console.log(`   📊 Found ${audioSegment.length} ZIP codes for "Audio"\n`);
    
    // Test 5: Admin Status Endpoint
    if (isEnabled) {
      console.log('5️⃣  Testing Supabase table counts...');
      const supabase = SupabaseService.getClient();
      
      const [censusCount, commerceCount, overlapCount] = await Promise.all([
        supabase.from('census_data').select('*', { count: 'exact', head: true }),
        supabase.from('commerce_audience_segments').select('*', { count: 'exact', head: true }),
        supabase.from('audience_overlaps').select('*', { count: 'exact', head: true })
      ]);
      
      console.log(`   📊 census_data: ${censusCount.count?.toLocaleString()} records`);
      console.log(`   📊 commerce_audience_segments: ${commerceCount.count?.toLocaleString()} records`);
      console.log(`   📊 audience_overlaps: ${overlapCount.count?.toLocaleString()} records\n`);
    }
    
    // Summary
    console.log('✅ ============================================');
    console.log('✅  ALL TESTS PASSED!');
    console.log('✅ ============================================\n');
    console.log(`📊 Mode: ${isEnabled ? 'Supabase' : 'CSV (fallback)'}`);
    console.log(`🎯 Ready for: ${isEnabled ? 'Production with Supabase' : 'Testing with CSV'}`);
    console.log(`\n💡 To enable Supabase in production:`);
    console.log(`   1. Set USE_SUPABASE=true in .env`);
    console.log(`   2. Restart backend server`);
    console.log(`   3. Monitor logs for "Supabase mode enabled"\n`);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env');
    console.error('   2. Check Supabase project is active');
    console.error('   3. Verify migration completed successfully');
    console.error('   4. Try setting USE_SUPABASE=false to test CSV fallback\n');
    process.exit(1);
  }
}

testSupabaseIntegration().catch(console.error);

