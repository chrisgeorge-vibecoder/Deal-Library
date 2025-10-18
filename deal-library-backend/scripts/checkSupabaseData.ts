import * as dotenv from 'dotenv';
import * as path from 'path';
import { SupabaseService } from '../src/services/supabaseService';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  console.log('\n🔍 Checking Supabase Data...\n');
  
  const supabase = SupabaseService.getClient();
  
  // Test census_data
  console.log('1. Checking census_data table...');
  const { data: censusData, error: censusError, count: censusCount } = await supabase
    .from('census_data')
    .select('*', { count: 'exact', head: false })
    .limit(5);
  
  console.log(`   Count: ${censusCount}`);
  console.log(`   Error: ${censusError?.message || 'None'}`);
  console.log(`   Sample data: ${censusData?.length || 0} records\n`);
  
  if (censusData && censusData.length > 0) {
    console.log('   First record:', JSON.stringify(censusData[0], null, 2).substring(0, 300));
  }
  
  // Test commerce_audience_segments
  console.log('\n2. Checking commerce_audience_segments table...');
  const { data: commerceData, error: commerceError, count: commerceCount } = await supabase
    .from('commerce_audience_segments')
    .select('*', { count: 'exact', head: false })
    .limit(5);
  
  console.log(`   Count: ${commerceCount}`);
  console.log(`   Error: ${commerceError?.message || 'None'}`);
  console.log(`   Sample data: ${commerceData?.length || 0} records\n`);
  
  if (commerceData && commerceData.length > 0) {
    console.log('   First record:', JSON.stringify(commerceData[0], null, 2));
  }
  
  // Test audience_overlaps
  console.log('\n3. Checking audience_overlaps table...');
  const { data: overlapData, error: overlapError, count: overlapCount } = await supabase
    .from('audience_overlaps')
    .select('*', { count: 'exact', head: false })
    .limit(5);
  
  console.log(`   Count: ${overlapCount}`);
  console.log(`   Error: ${overlapError?.message || 'None'}`);
  console.log(`   Sample data: ${overlapData?.length || 0} records\n`);
}

main().catch(console.error);

