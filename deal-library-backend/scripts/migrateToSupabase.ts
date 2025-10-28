import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { SupabaseService } from '../src/services/supabaseService';
import { PersonaService } from '../src/services/personaService';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Supabase Migration Script
 * Migrates census data, commerce audience segments, audience overlaps, and personas from CSV/JSON files to Supabase
 */

interface MigrationStats {
  totalRecords: number;
  successfulInserts: number;
  failedInserts: number;
  startTime: number;
  endTime?: number;
}

/**
 * Parse CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Convert string to number, handling empty strings
 */
function toNumber(value: string | undefined): number | null {
  if (!value || value.trim() === '' || value.toLowerCase() === 'null') {
    return null;
  }
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

/**
 * Convert string to boolean
 */
function toBoolean(value: string | undefined): boolean {
  return value?.toUpperCase() === 'TRUE' || value === '1';
}

/**
 * Migrate Census Data (41K records)
 */
async function migrateCensusData(): Promise<MigrationStats> {
  console.log('\n📊 === MIGRATING CENSUS DATA ===\n');
  
  const stats: MigrationStats = {
    totalRecords: 0,
    successfulInserts: 0,
    failedInserts: 0,
    startTime: Date.now()
  };
  
  const supabase = SupabaseService.getClient();
  const csvPath = path.join(__dirname, '../data/uszips.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Census data file not found: ${csvPath}`);
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0] || '');
  
  console.log(`📈 Processing ${lines.length - 1} census records...`);
  console.log(`📋 Headers: ${headers.length} columns`);
  
  // Process in batches of 1000
  const BATCH_SIZE = 1000;
  const dataLines = lines.slice(1);
  
  for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
    const batch = dataLines.slice(i, Math.min(i + BATCH_SIZE, dataLines.length));
    const censusRecords = [];
    
    for (const line of batch) {
      stats.totalRecords++;
      const values = parseCSVLine(line);
      
      if (values.length < 10) continue; // Skip invalid lines
      
      const record = {
        zip: values[0]?.replace(/"/g, ''),
        lat: toNumber(values[1]),
        lng: toNumber(values[2]),
        city: values[3]?.replace(/"/g, ''),
        state_id: values[4]?.replace(/"/g, ''),
        state_name: values[5]?.replace(/"/g, ''),
        zcta: toBoolean(values[6]),
        population: toNumber(values[8]),
        density: toNumber(values[9]),
        age_median: toNumber(values[18]),
        age_under_10: toNumber(values[19]),
        age_10_to_19: toNumber(values[20]),
        age_20s: toNumber(values[21]),
        age_30s: toNumber(values[22]),
        age_40s: toNumber(values[23]),
        age_50s: toNumber(values[24]),
        age_60s: toNumber(values[25]),
        age_70s: toNumber(values[26]),
        age_over_80: toNumber(values[27]),
        income_household_median: toNumber(values[39]),
        education_bachelors: toNumber(values[62]),
        education_graduate: toNumber(values[63]),
        education_stem_degree: toNumber(values[65]),
        race_white: toNumber(values[74]),
        race_black: toNumber(values[75]),
        race_asian: toNumber(values[76]),
        hispanic: toNumber(values[79]),
        family_size: toNumber(values[36]),
        married: toNumber(values[32]),
        family_dual_income: toNumber(values[37]),
        commute_time: toNumber(values[83]),
        home_value: toNumber(values[55]),
        rent_median: toNumber(values[56]),
        rent_burden: toNumber(values[57]),
        home_ownership: toNumber(values[54]),
        unemployment_rate: toNumber(values[67]),
        poverty: toNumber(values[81]),
        self_employed: toNumber(values[68]),
        veteran: toNumber(values[85]),
        charitable_givers: toNumber(values[86]),
        cbsa_name: values[87]?.replace(/"/g, ''),
        cbsa_metro: toBoolean(values[88]),
        county_name: values[11]?.replace(/"/g, '')
      };
      
      censusRecords.push(record);
    }
    
    // Insert batch
    if (censusRecords.length > 0) {
      const { data, error } = await supabase
        .from('census_data')
        .upsert(censusRecords, { onConflict: 'zip' });
      
      if (error) {
        console.error(`❌ Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
        if (error.message.includes('overflow') && censusRecords.length > 0) {
          // Log first record to debug which field is overflowing
          console.error('   Sample record:', JSON.stringify(censusRecords[0], null, 2).substring(0, 500));
        }
        stats.failedInserts += censusRecords.length;
      } else {
        stats.successfulInserts += censusRecords.length;
        console.log(`✅ Batch ${i / BATCH_SIZE + 1}: Inserted ${censusRecords.length} records (${stats.successfulInserts}/${stats.totalRecords})`);
      }
    }
  }
  
  stats.endTime = Date.now();
  const duration = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
  
  console.log(`\n✅ Census Data Migration Complete!`);
  console.log(`   Total: ${stats.totalRecords}`);
  console.log(`   Success: ${stats.successfulInserts}`);
  console.log(`   Failed: ${stats.failedInserts}`);
  console.log(`   Duration: ${duration}s\n`);
  
  return stats;
}

/**
 * Migrate Commerce Audience Segments (4.3M records)
 */
async function migrateCommerceAudience(): Promise<MigrationStats> {
  console.log('\n🛒 === MIGRATING COMMERCE AUDIENCE SEGMENTS ===\n');
  
  const stats: MigrationStats = {
    totalRecords: 0,
    successfulInserts: 0,
    failedInserts: 0,
    startTime: Date.now()
  };
  
  const supabase = SupabaseService.getClient();
  const csvPath = path.join(__dirname, '../data/commerce_audience_segments.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Commerce audience file not found: ${csvPath}`);
  }
  
  console.log(`📦 Reading commerce audience file (this may take a moment)...`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  console.log(`📈 Processing ${lines.length - 1} commerce records...`);
  console.log(`⏱️  Estimated time: 10-15 minutes for 4.3M records\n`);
  
  // Process in batches of 5000 (larger batches for performance)
  const BATCH_SIZE = 5000;
  const dataLines = lines.slice(1); // Skip header
  
  for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
    const batch = dataLines.slice(i, Math.min(i + BATCH_SIZE, dataLines.length));
    const commerceRecords = [];
    
    for (const line of batch) {
      stats.totalRecords++;
      const values = line.split(',');
      
      if (values.length < 6) continue; // Skip invalid lines
      
      const record = {
        sanitized_value: values[0],
        seed: values[1],
        dt: values[2],
        weight: toNumber(values[3]) || 0,
        label: values[4],
        audience_name: values[5]
      };
      
      commerceRecords.push(record);
    }
    
    // Insert batch
    if (commerceRecords.length > 0) {
      const { data, error } = await supabase
        .from('commerce_audience_segments')
        .insert(commerceRecords);
      
      if (error) {
        console.error(`❌ Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
        stats.failedInserts += commerceRecords.length;
      } else {
        stats.successfulInserts += commerceRecords.length;
        const progress = ((stats.successfulInserts / (dataLines.length)) * 100).toFixed(1);
        console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${commerceRecords.length} records | Progress: ${progress}% (${stats.successfulInserts.toLocaleString()}/${dataLines.length.toLocaleString()})`);
      }
    }
  }
  
  stats.endTime = Date.now();
  const duration = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
  const minutes = (parseFloat(duration) / 60).toFixed(1);
  
  console.log(`\n✅ Commerce Audience Migration Complete!`);
  console.log(`   Total: ${stats.totalRecords.toLocaleString()}`);
  console.log(`   Success: ${stats.successfulInserts.toLocaleString()}`);
  console.log(`   Failed: ${stats.failedInserts.toLocaleString()}`);
  console.log(`   Duration: ${minutes} minutes\n`);
  
  return stats;
}

/**
 * Migrate Audience Overlaps (3.7K records)
 */
async function migrateAudienceOverlaps(): Promise<MigrationStats> {
  console.log('\n🔄 === MIGRATING AUDIENCE OVERLAPS ===\n');
  
  const stats: MigrationStats = {
    totalRecords: 0,
    successfulInserts: 0,
    failedInserts: 0,
    startTime: Date.now()
  };
  
  const supabase = SupabaseService.getClient();
  const csvPath = path.join(__dirname, '../data/199_Audience_Overlap_Data.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.warn(`⚠️  Audience overlap file not found: ${csvPath} - skipping`);
    return stats;
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  console.log(`📈 Processing ${lines.length - 1} overlap records...`);
  
  // Process in batches of 500
  const BATCH_SIZE = 500;
  const dataLines = lines.slice(1); // Skip header
  
  for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
    const batch = dataLines.slice(i, Math.min(i + BATCH_SIZE, dataLines.length));
    const overlapRecords = [];
    
    for (const line of batch) {
      stats.totalRecords++;
      const values = parseCSVLine(line);
      
      if (values.length < 4) continue;
      
      const record = {
        section_header: values[0],
        field_name: values[1],
        data_value: values[2],
        use_case: values[3],
        segment_name: values[2], // Use data_value as segment name
        segment_id: '', // Will be populated if we have segment ID mapping
      };
      
      overlapRecords.push(record);
    }
    
    if (overlapRecords.length > 0) {
      const { data, error } = await supabase
        .from('audience_overlaps')
        .insert(overlapRecords);
      
      if (error) {
        console.error(`❌ Error inserting batch:`, error.message);
        stats.failedInserts += overlapRecords.length;
      } else {
        stats.successfulInserts += overlapRecords.length;
        console.log(`✅ Inserted ${overlapRecords.length} overlap records (${stats.successfulInserts}/${stats.totalRecords})`);
      }
    }
  }
  
  stats.endTime = Date.now();
  const duration = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
  
  console.log(`\n✅ Audience Overlaps Migration Complete!`);
  console.log(`   Total: ${stats.totalRecords}`);
  console.log(`   Success: ${stats.successfulInserts}`);
  console.log(`   Failed: ${stats.failedInserts}`);
  console.log(`   Duration: ${duration}s\n`);
  
  return stats;
}

/**
 * Migrate Personas from PersonaService (hard-coded personas)
 */
async function migratePersonas(): Promise<MigrationStats> {
  console.log('\n👤 === MIGRATING PERSONAS ===\n');
  
  const stats: MigrationStats = {
    totalRecords: 0,
    successfulInserts: 0,
    failedInserts: 0,
    startTime: Date.now()
  };
  
  const supabase = SupabaseService.getClient();
  const personaService = new PersonaService();
  const allPersonas = personaService.getAllPersonas();
  
  console.log(`📈 Processing ${allPersonas.length} personas...`);
  
  const personaRecords = allPersonas.map(persona => ({
    segment_id: persona.segmentId,
    segment_name: persona.personaName,
    persona_name: persona.personaName,
    emoji: persona.emoji,
    category: persona.category,
    core_insight: persona.coreInsight,
    creative_hooks: persona.creativeHooks,
    media_targeting: persona.mediaTargeting,
    audience_motivation: persona.audienceMotivation,
    actionable_strategy: persona.actionableStrategy,
    is_dynamic: false
  }));
  
  stats.totalRecords = personaRecords.length;
  
  const { data, error } = await supabase
    .from('generated_personas')
    .insert(personaRecords);
  
  if (error) {
    console.error(`❌ Error inserting personas:`, error.message);
    stats.failedInserts = personaRecords.length;
  } else {
    stats.successfulInserts = personaRecords.length;
    console.log(`✅ Inserted ${personaRecords.length} personas`);
  }
  
  stats.endTime = Date.now();
  const duration = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
  
  console.log(`\n✅ Personas Migration Complete!`);
  console.log(`   Total: ${stats.totalRecords}`);
  console.log(`   Success: ${stats.successfulInserts}`);
  console.log(`   Failed: ${stats.failedInserts}`);
  console.log(`   Duration: ${duration}s\n`);
  
  return stats;
}

/**
 * Main migration function
 */
async function main() {
  console.log('\n🚀 ============================================');
  console.log('🚀  SUPABASE DATA MIGRATION');
  console.log('🚀 ============================================\n');
  
  const totalStartTime = Date.now();
  
  try {
    // Verify Supabase connection
    console.log('🔌 Verifying Supabase connection...');
    const supabase = SupabaseService.getClient();
    const { data, error } = await supabase.from('census_data').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
    
    console.log('✅ Supabase connection verified\n');
    
    // Run migrations
    const censusStats = await migrateCensusData();
    const commerceStats = await migrateCommerceAudience();
    const overlapStats = await migrateAudienceOverlaps();
    const personaStats = await migratePersonas();
    
    // Summary
    const totalEndTime = Date.now();
    const totalDuration = ((totalEndTime - totalStartTime) / 1000).toFixed(2);
    const totalMinutes = (parseFloat(totalDuration) / 60).toFixed(1);
    
    console.log('\n🎉 ============================================');
    console.log('🎉  MIGRATION COMPLETE!');
    console.log('🎉 ============================================\n');
    console.log(`📊 Summary:`);
    console.log(`   Census Data: ${censusStats.successfulInserts.toLocaleString()} records`);
    console.log(`   Commerce Segments: ${commerceStats.successfulInserts.toLocaleString()} records`);
    console.log(`   Audience Overlaps: ${overlapStats.successfulInserts.toLocaleString()} records`);
    console.log(`   Personas: ${personaStats.successfulInserts} records`);
    console.log(`\n⏱️  Total Duration: ${totalMinutes} minutes`);
    console.log(`\n✅ Next Steps:`);
    console.log(`   1. Verify data in Supabase dashboard`);
    console.log(`   2. Update .env: USE_SUPABASE=true`);
    console.log(`   3. Restart backend server`);
    console.log(`   4. Test application functionality\n`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Verify SUPABASE_URL and SUPABASE_ANON_KEY are set in .env');
    console.error('   2. Ensure schema has been created in Supabase');
    console.error('   3. Check Supabase project is active and accessible\n');
    process.exit(1);
  }
}

// Run migration
main().catch(console.error);

