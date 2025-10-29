import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { SupabaseService } from '../src/services/supabaseService';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Audience Taxonomy Migration Script
 * Migrates Sovrn Taxonomy data from CSV to Supabase
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
 * Convert string to number, handling empty strings and commas
 */
function toNumber(value: string | undefined): number | null {
  if (!value || value.trim() === '' || value.toLowerCase() === 'null') {
    return null;
  }
  // Remove quotes and commas from numbers like "8,123,981"
  const cleanValue = value.replace(/[",]/g, '');
  const num = parseFloat(cleanValue);
  return isNaN(num) ? null : num;
}

/**
 * Convert string to boolean
 */
function toBoolean(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'yes' || value === '1' || value?.toUpperCase() === 'TRUE';
}

/**
 * Clean string value
 */
function cleanString(value: string | undefined): string {
  return value?.replace(/^"|"$/g, '').trim() || '';
}

/**
 * Migrate Audience Taxonomy Data
 */
async function migrateAudienceTaxonomy(): Promise<MigrationStats> {
  console.log('\n🎯 === MIGRATING AUDIENCE TAXONOMY DATA ===\n');
  
  const stats: MigrationStats = {
    totalRecords: 0,
    successfulInserts: 0,
    failedInserts: 0,
    startTime: Date.now()
  };
  
  const supabase = SupabaseService.getClient();
  const csvPath = path.join(__dirname, '../data/Sovrn Taxonomy (AI Project).csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Taxonomy data file not found: ${csvPath}`);
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0] || '');
  
  console.log(`📈 Processing ${lines.length - 1} taxonomy records...`);
  console.log(`📋 Headers: ${headers.join(', ')}`);
  
  // Process in batches of 100 (smaller than census due to larger records)
  const BATCH_SIZE = 100;
  const dataLines = lines.slice(1);
  
  for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
    const batch = dataLines.slice(i, Math.min(i + BATCH_SIZE, dataLines.length));
    const taxonomyRecords = [];
    
    for (const line of batch) {
      stats.totalRecords++;
      const values = parseCSVLine(line);
      
      if (values.length < 10) {
        console.log(`⚠️ Skipping invalid line ${stats.totalRecords}: ${line.substring(0, 50)}...`);
        continue;
      }
      
      // CSV Column mapping based on headers
      // 0: Segment Type, 1: Sovrn Segment ID, 2: Sovrn Parent Segment ID, 3: Segment Name, 
      // 4: Segment Description, 5: Tier Number, 6: Tier 1, 7: Tier 2, 8: Tier 3, 9: Tier 4, 
      // 10: Tier 5, 11: Tier 6, 12: Full Path, 13: CPM, 14: % Media Cost, 15: Actively Generated,
      // 16: 7 Day Sovrn Cookie Scale Global, 17: 7 Day Sovrn Cookie Scale US, 
      // 18: 7 Day HEM Scale US, 19: 1 Day Average IP Scale Rolling 7 Days Global
      
      const record = {
        segment_type: cleanString(values[0]),
        sovrn_segment_id: cleanString(values[1]),
        sovrn_parent_segment_id: cleanString(values[2]),
        segment_name: cleanString(values[3]),
        segment_description: cleanString(values[4]),
        tier_number: toNumber(values[5]),
        tier_1: cleanString(values[6]),
        tier_2: cleanString(values[7]),
        tier_3: cleanString(values[8]),
        tier_4: cleanString(values[9]),
        tier_5: cleanString(values[10]),
        tier_6: cleanString(values[11]),
        full_path: cleanString(values[12]),
        cpm: toNumber(values[13]?.replace('$', '')),
        media_cost_percent: toNumber(values[14]),
        actively_generated: toBoolean(values[15]),
        scale_7day_global: toNumber(values[16]),
        scale_7day_us: toNumber(values[17]),
        scale_hem_us: toNumber(values[18]),
        scale_1day_ip: toNumber(values[19])
      };
      
      // Validate required fields
      if (!record.sovrn_segment_id || !record.segment_name) {
        console.log(`⚠️ Skipping record with missing ID or name: ${record.sovrn_segment_id}`);
        stats.failedInserts++;
        continue;
      }
      
      taxonomyRecords.push(record);
    }
    
    // Batch insert
    if (taxonomyRecords.length > 0) {
      try {
        const { data, error } = await supabase
          .from('audience_taxonomy')
          .upsert(taxonomyRecords, { 
            onConflict: 'sovrn_segment_id',
            ignoreDuplicates: false 
          });
        
        if (error) {
          console.error(`❌ Batch insert failed for records ${i}-${i + batch.length}:`, error.message);
          stats.failedInserts += taxonomyRecords.length;
        } else {
          stats.successfulInserts += taxonomyRecords.length;
          console.log(`✅ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${taxonomyRecords.length} records (${stats.successfulInserts}/${stats.totalRecords})`);
        }
      } catch (err) {
        console.error(`❌ Exception during batch insert:`, err);
        stats.failedInserts += taxonomyRecords.length;
      }
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  stats.endTime = Date.now();
  return stats;
}

/**
 * Main migration runner
 */
async function main() {
  console.log('🚀 Starting Audience Taxonomy Migration...\n');
  
  try {
    const stats = await migrateAudienceTaxonomy();
    
    const duration = ((stats.endTime! - stats.startTime) / 1000).toFixed(2);
    
    console.log('\n📊 === MIGRATION COMPLETE ===\n');
    console.log(`Total Records Processed: ${stats.totalRecords}`);
    console.log(`✅ Successful Inserts: ${stats.successfulInserts}`);
    console.log(`❌ Failed Inserts: ${stats.failedInserts}`);
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📈 Success Rate: ${((stats.successfulInserts / stats.totalRecords) * 100).toFixed(2)}%`);
    
    if (stats.failedInserts > 0) {
      console.log('\n⚠️ Some records failed to insert. Check logs above for details.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();


