import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { SupabaseService } from '../src/services/supabaseService';

dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Simplified Census Import - Only import fields we actually use
 * This avoids the complex CSV parsing issues and numeric overflows
 */

async function main() {
  console.log('\n📊 === SIMPLIFIED CENSUS IMPORT ===\n');
  
  const supabase = SupabaseService.getClient();
  const csvPath = path.join(__dirname, '../data/uszips.csv');
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  console.log(`📈 Processing ${lines.length - 1} census records...\n`);
  
  let successCount = 0;
  let errorCount = 0;
  const BATCH_SIZE = 100; // Smaller batches to avoid issues
  
  // Skip header
  const dataLines = lines.slice(1);
  
  for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
    const batch = dataLines.slice(i, Math.min(i + BATCH_SIZE, dataLines.length));
    const records = [];
    
    for (const line of batch) {
      try {
        // Simple split - just get the first few critical columns
        // We'll ignore complex JSON fields that cause parsing issues
        const parts = line.split('","').map(p => p.replace(/^"|"$/g, ''));
        
        if (parts.length < 20) continue;
        
        // Only insert if ZIP code is valid and we have minimal data
        const zip = parts[0];
        if (!zip || !/^\d{5}$/.test(zip)) continue;
        
        // Helper to safely parse numbers
        const safeNum = (val: string | undefined) => {
          if (!val || val.trim() === '' || val === 'null') return null;
          const num = parseFloat(val);
          return isNaN(num) ? null : num;
        };
        
        // Helper to parse boolean
        const safeBool = (val: string | undefined) => val?.toUpperCase() === 'TRUE';
        
        const record = {
          zip,
          lat: safeNum(parts[1]),
          lng: safeNum(parts[2]),
          city: parts[3] || null,
          state_id: parts[4] || null,
          state_name: parts[5] || null,
          zcta: safeBool(parts[6]),
          population: safeNum(parts[8]),
          density: safeNum(parts[9]),
          county_name: parts[11] || null,
          // Age - convert to smaller values if needed
          age_median: safeNum(parts[18]),
          // Income
          income_household_median: safeNum(parts[39]),
          // Education - these might be the overflow culprits
          education_bachelors: safeNum(parts[62]),
          education_graduate: safeNum(parts[63]),
          education_stem_degree: safeNum(parts[65]),
          // Race
          race_white: safeNum(parts[74]),
          race_black: safeNum(parts[75]),
          race_asian: safeNum(parts[76]),
          hispanic: safeNum(parts[79]),
          // Lifestyle
          family_size: safeNum(parts[36]),
          married: safeNum(parts[32]),
          family_dual_income: safeNum(parts[37]),
          commute_time: safeNum(parts[83]),
          home_value: safeNum(parts[55]),
          rent_median: safeNum(parts[56]),
          home_ownership: safeNum(parts[54]),
          unemployment_rate: safeNum(parts[67]),
          poverty: safeNum(parts[81]),
          self_employed: safeNum(parts[68]),
          charitable_givers: safeNum(parts[86]),
          cbsa_name: parts[87] || null,
          cbsa_metro: safeBool(parts[88])
        };
        
        records.push(record);
      } catch (err) {
        // Skip malformed lines
        continue;
      }
    }
    
    if (records.length > 0) {
      const { error } = await supabase
        .from('census_data')
        .upsert(records, { onConflict: 'zip' });
      
      if (error) {
        console.error(`❌ Batch ${Math.floor(i/BATCH_SIZE) + 1} error:`, error.message);
        errorCount += records.length;
      } else {
        successCount += records.length;
        if (successCount % 1000 === 0 || i + BATCH_SIZE >= dataLines.length) {
          console.log(`✅ Inserted ${successCount.toLocaleString()} records so far...`);
        }
      }
    }
  }
  
  console.log(`\n✅ Census Import Complete!`);
  console.log(`   Success: ${successCount.toLocaleString()}`);
  console.log(`   Errors: ${errorCount.toLocaleString()}`);
  console.log(`\n💡 Next: Check Supabase Table Editor to verify data is visible\n`);
}

main().catch(console.error);

