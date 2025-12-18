import * as fs from 'fs';
import * as path from 'path';
import { SupabaseService } from './supabaseService';
import { getDataPath } from './dataPath';

export interface CommerceAudienceData {
  zipCode: string;
  weight: number;
  audienceName: string;
  seed: string;
  date: string;
}

export interface AudienceSegment {
  name: string;
  totalZipCodes: number;
  totalWeight: number;
  averageWeight: number;
}

// Categories to exclude from results due to data quality issues
// These categories have artificially inflated data (over-sampled or over-weighted in source data)
const EXCLUDED_CATEGORIES = [
  'Nuts & Seeds',  // 82% ZIP coverage vs ~60% avg - data collection artifact
];

// Google Product Taxonomy Level 1 Categories
// Reference: https://www.google.com/basepages/producttype/taxonomy.en-US.txt
export const LEVEL1_CATEGORIES = [
  'All Categories',
  'Animals & Pet Supplies',
  'Apparel & Accessories',
  'Arts & Entertainment',
  'Baby & Toddler',
  'Business & Industrial',
  'Cameras & Optics',
  'Electronics',
  'Food, Beverages & Tobacco',
  'Furniture',
  'Hardware',
  'Health & Beauty',
  'Home & Garden',
  'Luggage & Bags',
  'Media',
  'Office Supplies',
  'Religious & Ceremonial',
  'Software',
  'Sporting Goods',
  'Toys & Games',
  'Vehicles & Parts',
  'General Merchandise'
] as const;

export type Level1Category = typeof LEVEL1_CATEGORIES[number];

/**
 * Map segment names to Google Product Taxonomy Level 1 categories
 * Reference: https://www.google.com/basepages/producttype/taxonomy.en-US.txt
 */
export function getLevel1Category(segmentName: string): Level1Category {
  const name = segmentName.toLowerCase();
  
  // Helper to check for whole word matches
  const hasWord = (word: string) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(name);
  };

  // Vehicles & Parts
  if (name.includes('vehicle') || name.includes('automotive') || name.includes('radar detector') ||
      hasWord('car') || name.includes('motor') || name.includes('tire') || name.includes('auto part') ||
      name.includes('watercraft') || name.includes('aircraft')) {
    return 'Vehicles & Parts';
  }
  
  // Cameras & Optics (separate from Electronics per Google taxonomy)
  if (name.includes('camera') || name.includes('optic') || name.includes('binocular') ||
      name.includes('telescope') || name.includes('microscope') || name.includes('tripod') ||
      name.includes('photography') || name.includes('lens')) {
    return 'Cameras & Optics';
  }
  
  // Electronics
  if (name.includes('circuit') || name.includes('computer') || name.includes('electronic') ||
      name.includes('audio') || name.includes('video') || name.includes('phone') ||
      name.includes('tablet') || name.includes('gps') || name.includes('smart') ||
      name.includes('gaming') || name.includes('communication') || name.includes('speaker') ||
      name.includes('television') || name.includes('laptop') || name.includes('network') ||
      name.includes('printer') || name.includes('microphone') || name.includes('dvd') ||
      name.includes('console') || name.includes('storage device') || name.includes('component') ||
      name.includes('arcade') || name.includes('radar')) {
    return 'Electronics';
  }
  
  // Software (separate from Electronics per Google taxonomy)
  if (name.includes('software') || name.includes('operating system') || name.includes('antivirus') ||
      name.includes('video game software')) {
    return 'Software';
  }
  
  // Furniture (separate from Home & Garden per Google taxonomy)
  if (name.includes('furniture') || name.includes('mattress') || name.includes('futon') ||
      name.includes('cabinet') || name.includes('shelving') || name.includes('bench') ||
      name.includes('ottoman') || hasWord('desk') || hasWord('sofa') || hasWord('chair') ||
      hasWord('bed') || hasWord('table') && !name.includes('tablet')) {
    return 'Furniture';
  }
  
  // Home & Garden
  if (name.includes('appliance') || name.includes('kitchen') || name.includes('bedding') ||
      name.includes('garden') || name.includes('lawn') || name.includes('home decor') ||
      name.includes('lighting') || name.includes('cleaning') || name.includes('decor') ||
      name.includes('fencing') || name.includes('stove') || name.includes('fireplace') ||
      name.includes('pool & spa') || name.includes('plumbing') || name.includes('cookware') ||
      name.includes('linens') || name.includes('plant') || name.includes('household supply') ||
      name.includes('household supplies') || name.includes('bathroom accessor') ||
      name.includes('laundry') || name.includes('smoking accessor') || name.includes('umbrella') ||
      name.includes('parasol') || name.includes('emergency prep') || name.includes('flood') ||
      name.includes('fire safety')) {
    return 'Home & Garden';
  }
  
  // Food, Beverages & Tobacco (full name per Google taxonomy)
  if (name.includes('food') || name.includes('beverage') || name.includes('grocery') ||
      name.includes('snack') || name.includes('drink') || name.includes('coffee') ||
      hasWord('tea') || name.includes('alcohol') || name.includes('pasta') ||
      name.includes('soup') || name.includes('dairy') || name.includes('bread') ||
      name.includes('juice') || name.includes('seasoning') || name.includes('spice') ||
      name.includes('condiment') || name.includes('sauce') || name.includes('cooking') ||
      name.includes('baking') || name.includes('frozen dessert') || name.includes('water') ||
      name.includes('milk') || name.includes('dip') || name.includes('spread') ||
      name.includes('tobacco') || name.includes('cigarette') || name.includes('cigar')) {
    return 'Food, Beverages & Tobacco';
  }
  
  // Apparel & Accessories
  if (name.includes('apparel') || name.includes('clothing') || name.includes('shoes') ||
      name.includes('jewelry') || hasWord('watch') || name.includes('handbag') ||
      name.includes('fashion') || name.includes('shirt') || name.includes('skirt') || 
      name.includes('shorts') || name.includes('costume') || name.includes('outerwear') ||
      name.includes('activewear') || name.includes('sunglasses') || name.includes('wallet') ||
      (name.includes('dress') && !name.includes('address') && !name.includes('hairdress'))) {
    return 'Apparel & Accessories';
  }
  
  // Luggage & Bags (separate from Apparel per Google taxonomy)
  if (name.includes('luggage') || name.includes('suitcase') || name.includes('briefcase') ||
      name.includes('backpack') || name.includes('duffel') || name.includes('garment bag') ||
      name.includes('diaper bag') || name.includes('messenger bag') || name.includes('tote')) {
    return 'Luggage & Bags';
  }
  
  // Health & Beauty
  if (name.includes('health') || name.includes('beauty') || name.includes('personal care') ||
      name.includes('cosmetic') || name.includes('skincare') || name.includes('vitamin') ||
      name.includes('medical') || name.includes('vision care') || name.includes('oral care') ||
      name.includes('foot care') || name.includes('sleeping aid') || name.includes('condom') ||
      name.includes('feminine') || name.includes('sanitary') || name.includes('shaving') ||
      name.includes('grooming') || name.includes('hair care') || name.includes('hairdress')) {
    return 'Health & Beauty';
  }
  
  // Baby & Toddler (Google taxonomy name, not "Baby & Kids")
  if (name.includes('baby') || name.includes('toddler') || name.includes('nursery') ||
      name.includes('diaper') || name.includes('swaddl') || name.includes('nursing') ||
      name.includes('pacifier') || name.includes('stroller') || name.includes('crib')) {
    return 'Baby & Toddler';
  }
  
  // Toys & Games (separate from Baby & Toddler per Google taxonomy)
  if (name.includes('toy') || name.includes('puzzle') || hasWord('game') ||
      name.includes('indoor game') || name.includes('outdoor play') || name.includes('doll') ||
      name.includes('action figure') || name.includes('building block') || name.includes('lego')) {
    return 'Toys & Games';
  }
  
  // Sporting Goods
  if (name.includes('sport') || name.includes('outdoor recreation') || name.includes('camping') ||
      name.includes('exercise') || name.includes('athletic') || name.includes('bike') ||
      name.includes('golf') || name.includes('cycling') || name.includes('yoga') ||
      name.includes('pilates') || name.includes('hiking') || name.includes('fishing') ||
      name.includes('hunting') || name.includes('boating') || name.includes('swimming') ||
      name.includes('fitness')) {
    return 'Sporting Goods';
  }
  
  // Animals & Pet Supplies (Google taxonomy name)
  if (hasWord('pet') || hasWord('dog') || hasWord('cat') || hasWord('animal') ||
      name.includes('live animal') || name.includes('aquarium') || name.includes('bird supply') ||
      name.includes('fish supply') || name.includes('reptile')) {
    return 'Animals & Pet Supplies';
  }
  
  // Business & Industrial
  if (name.includes('business') || name.includes('industrial') || name.includes('construction') ||
      name.includes('manufacturing') || name.includes('agriculture') || name.includes('forestry') ||
      name.includes('science') || name.includes('laboratory') || name.includes('signage') ||
      name.includes('advertising') || name.includes('marketing') || name.includes('retail') ||
      name.includes('hotel') || name.includes('hospitality') || name.includes('finance') ||
      name.includes('insurance') || name.includes('building material') || name.includes('dentistry') ||
      name.includes('piercing') || name.includes('tattoo')) {
    return 'Business & Industrial';
  }
  
  // Hardware
  if (name.includes('tool') || name.includes('hardware') || name.includes('lock') ||
      hasWord('key') || name.includes('plumbing') || name.includes('electrical') ||
      name.includes('heating') || name.includes('ventilation') || name.includes('hvac')) {
    return 'Hardware';
  }
  
  // Office Supplies
  if (name.includes('office') || name.includes('stationery') || name.includes('desk accessor') ||
      name.includes('filing') || name.includes('presentation')) {
    return 'Office Supplies';
  }
  
  // Arts & Entertainment
  if (hasWord('art') || name.includes('craft') || name.includes('music') ||
      name.includes('entertainment') || name.includes('hobby') || name.includes('event ticket') ||
      name.includes('gift giving') || name.includes('party') || name.includes('film') ||
      name.includes('creative') || name.includes('collectible') || name.includes('musical instrument')) {
    return 'Arts & Entertainment';
  }
  
  // Media (separate from Arts & Entertainment per Google taxonomy)
  if (name.includes('book') || name.includes('magazine') || name.includes('newspaper') ||
      name.includes('dvd') || name.includes('cd') || name.includes('vinyl') ||
      name.includes('sheet music') || name.includes('audiobook')) {
    return 'Media';
  }
  
  // Religious & Ceremonial
  if (name.includes('religious') || name.includes('ceremonial') || name.includes('memorial') ||
      name.includes('wedding ceremony') || name.includes('prayer')) {
    return 'Religious & Ceremonial';
  }
  
  return 'General Merchandise';
}

export class CommerceAudienceService {
  private commerceData: CommerceAudienceData[] = [];
  private isLoaded = false;
  private dataFilePath: string;
  private useSupabase: boolean;

  constructor() {
    this.dataFilePath = getDataPath('commerce_audience_segments.csv');
    this.useSupabase = process.env.USE_SUPABASE === 'true';
    
    if (this.useSupabase) {
      console.log('🛒 CommerceAudienceService: Supabase mode enabled');
    } else {
      console.log('🛒 CommerceAudienceService: CSV mode (fallback)');
    }
  }

  /**
   * Load commerce audience data from Supabase or CSV file
   */
  async loadCommerceData(): Promise<{ success: boolean; message: string; stats?: any }> {
    console.log('🔄 ===== loadCommerceData() called =====');
    console.log(`   useSupabase: ${this.useSupabase}`);
    console.log(`   USE_SUPABASE env: ${process.env.USE_SUPABASE}`);
    
    if (this.useSupabase) {
      try {
        return await this.loadFromSupabase();
      } catch (error) {
        console.error('❌ Supabase load failed, error will be propagated (no CSV fallback)');
        throw error; // Don't fall back - we want to see the real error
      }
    } else {
      console.log('📄 Using CSV loading (USE_SUPABASE is not "true")');
      return this.loadFromCSV();
    }
  }

  /**
   * Load commerce audience data from Supabase
   */
  private async loadFromSupabase(): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      console.log('📊 ===== Loading Commerce Audience segments data from Supabase =====');
      
      // Check if Supabase is enabled
      const isEnabled = SupabaseService.isEnabled();
      console.log(`🔍 USE_SUPABASE environment variable: ${process.env.USE_SUPABASE}`);
      console.log(`🔍 SupabaseService.isEnabled(): ${isEnabled}`);
      
      if (!isEnabled) {
        throw new Error('USE_SUPABASE is not set to "true". Set USE_SUPABASE=true in environment variables.');
      }
      
      // Check environment variables
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;
      
      console.log(`🔍 SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
      console.log(`🔍 SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set (length: ' + supabaseKey.length + ')' : '❌ Missing'}`);
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error(`Supabase credentials missing. SUPABASE_URL: ${supabaseUrl ? 'set' : 'missing'}, SUPABASE_ANON_KEY: ${supabaseKey ? 'set' : 'missing'}`);
      }
      
      console.log('🔌 Getting Supabase client...');
      const supabase = SupabaseService.getClient();
      console.log('✅ Supabase client obtained');
      
      // Test connection by checking if table exists
      console.log('🔍 Testing connection to commerce_audience_segments table...');
      
      // CRITICAL: For serverless environments, we need to significantly reduce data loading
      // Loading 100k records causes timeouts. Load a smaller sample that still provides
      // good coverage across segments and ZIP codes for report generation
      const MAX_RECORDS_TO_LOAD = 10000; // Reduced from 100k to 10k to avoid timeout
      const pageSize = 2000; // Smaller page size for faster queries
      let allRecords: any[] = [];
      let offset = 0;
      let pageCount = 0;
      
      // Add timeout wrapper (15 seconds max for data loading)
      const loadTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Data loading timeout - Supabase query took too long')), 15000);
      });
      
      console.log(`📊 Loading commerce data (limited to ${MAX_RECORDS_TO_LOAD.toLocaleString()} records to avoid timeout)...`);
      
      const loadDataPromise = (async () => {
        // Load data in chunks to avoid memory issues
        while (allRecords.length < MAX_RECORDS_TO_LOAD) {
          pageCount++;
          console.log(`📄 Fetching page ${pageCount} (offset: ${offset}, limit: ${pageSize})...`);
          
          const { data: records, error, count } = await supabase
            .from('commerce_audience_segments')
            .select('sanitized_value, weight, audience_name, seed, dt', { count: 'exact' })
            .order('sanitized_value')
            .range(offset, offset + pageSize - 1);
      
          if (error) {
            console.error('❌ Supabase query error:', error);
            console.error('   Error code:', error.code);
            console.error('   Error message:', error.message);
            console.error('   Error details:', error.details);
            console.error('   Error hint:', error.hint);
            throw new Error(`Supabase query failed: ${error.message} (code: ${error.code})`);
          }
          
          console.log(`   ✅ Page ${pageCount} returned ${records?.length || 0} records`);
          if (count !== null && pageCount === 1) {
            console.log(`   📊 Total records in table: ${count.toLocaleString()}`);
            if (count > MAX_RECORDS_TO_LOAD) {
              console.warn(`   ⚠️  Table has ${count.toLocaleString()} records, but loading only ${MAX_RECORDS_TO_LOAD.toLocaleString()} to avoid timeout`);
            }
          }
          
          if (!records || records.length === 0) {
            console.log(`   ℹ️  No more records (reached end at offset ${offset})`);
            break; // No more records
          }
          
          allRecords = [...allRecords, ...records];
          offset += pageSize;
          
          console.log(`📈 Loaded ${allRecords.length.toLocaleString()} commerce records so far...`);
          
          // Stop if we've reached our limit
          if (allRecords.length >= MAX_RECORDS_TO_LOAD) {
            console.warn(`⚠️  Reached record limit (${MAX_RECORDS_TO_LOAD.toLocaleString()}), stopping pagination`);
            break;
          }
          
          // Safety limit to prevent infinite loops (reduced from 50 to 10 pages)
          if (pageCount >= 10) {
            console.warn('⚠️  Reached page limit (10), stopping pagination');
            break;
          }
        }
        
        console.log(`📊 Total records fetched from Supabase: ${allRecords.length}`);
        return allRecords;
      })();
      
      // Race between data loading and timeout
      try {
        allRecords = await Promise.race([loadDataPromise, loadTimeoutPromise]);
      } catch (timeoutError: any) {
        if (timeoutError.message?.includes('timeout')) {
          console.warn(`⚠️ Data loading timed out after loading ${allRecords.length} records`);
          if (allRecords.length === 0) {
            throw new Error('Data loading timed out before loading any records. This may indicate a database performance issue.');
          }
          console.warn(`   Using ${allRecords.length} records that were loaded before timeout`);
        } else {
          throw timeoutError;
        }
      }
      
      if (allRecords.length === 0) {
        const errorMsg = 'No commerce data found in Supabase table "commerce_audience_segments". Table may be empty or query returned no results.';
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      console.log(`📈 Processing ${allRecords.length} total commerce records from Supabase...`);
      
      this.commerceData = [];
      let processedCount = 0;
      let skippedCount = 0;
      
      for (const record of allRecords) {
        const sanitizedValue = record.sanitized_value;
        
        // Only process US data (NA_US_ prefix)
        if (sanitizedValue && sanitizedValue.startsWith('NA_US_')) {
          const zipCode = sanitizedValue.replace('NA_US_', '');
          
          // Validate ZIP code format (5 digits)
          if (/^\d{5}$/.test(zipCode)) {
            this.commerceData.push({
              zipCode,
              weight: record.weight || 0,
              audienceName: record.audience_name?.trim() || '',
              seed: record.seed?.trim() || '',
              date: record.dt || ''
            });
            processedCount++;
          } else {
            skippedCount++;
            if (skippedCount <= 5) {
              console.log(`   ⚠️  Skipped invalid ZIP: ${zipCode} (from ${sanitizedValue})`);
            }
          }
        } else {
          skippedCount++;
          if (skippedCount <= 5) {
            console.log(`   ⚠️  Skipped non-US record: ${sanitizedValue}`);
          }
        }
      }
      
      console.log(`📊 Processed ${processedCount} valid records, skipped ${skippedCount} invalid records`);
      
      if (this.commerceData.length === 0) {
        const errorMsg = 'No valid US commerce data found after processing. All records were filtered out.';
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      this.isLoaded = true;
      
      const segments = this.getAudienceSegments();
      const stats = {
        totalRecords: this.commerceData.length,
        audienceSegments: segments,
        audienceSegmentCount: segments.length,
        averageWeight: this.commerceData.reduce((sum, item) => sum + item.weight, 0) / this.commerceData.length,
        topZipCodes: this.getTopZipCodesByWeight(5)
      };
      
      console.log(`✅ Commerce audience data loaded from Supabase successfully:`);
      console.log(`   📍 ${stats.totalRecords.toLocaleString()} ZIP codes`);
      console.log(`   🎯 ${stats.audienceSegmentCount} audience segments`);
      console.log(`   📊 Average weight: ${stats.averageWeight.toFixed(0)}`);
      if (segments.length > 0) {
        console.log(`   📋 Sample segments: ${segments.slice(0, 10).map(s => s.name).join(', ')}`);
      }
      
      return {
        success: true,
        message: 'Commerce audience data loaded from Supabase successfully',
        stats
      };
      
    } catch (error) {
      console.error('❌ ===== ERROR loading commerce data from Supabase =====');
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Don't fall back to CSV - throw the error so we can see what's wrong
      throw error;
    }
  }

  /**
   * Load commerce audience data from CSV file (original method, now as fallback)
   */
  private async loadFromCSV(): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      console.log('📊 Loading Commerce Audience segments data from CSV...');
      
      if (!fs.existsSync(this.dataFilePath)) {
        console.warn('⚠️ Commerce audience segments CSV file not found, using sample data');
        this.loadSampleData();
        
        const stats = {
          totalRecords: this.commerceData.length,
          audienceSegments: this.getAudienceSegments(),
          averageWeight: this.commerceData.reduce((sum, item) => sum + item.weight, 0) / this.commerceData.length,
          topZipCodes: this.getTopZipCodesByWeight(5)
        };

        console.log(`✅ Sample commerce audience data loaded successfully:`);
        console.log(`   📍 ${stats.totalRecords} ZIP codes`);
        console.log(`   🎯 ${stats.audienceSegments.length} audience segments`);
        
        return {
          success: true,
          message: 'Sample commerce audience data loaded successfully',
          stats
        };
      }

      const csvContent = fs.readFileSync(this.dataFilePath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      // Skip header row
      const dataLines = lines.slice(1);
      
      this.commerceData = [];
      
      for (const line of dataLines) {
        const [sanitizedValue, seed, date, weightStr, label, audienceName] = line.split(',');
        
        // Only process US data (NA_US_ prefix) and ensure all fields exist
        if (sanitizedValue && sanitizedValue.startsWith('NA_US_') && 
            seed && date && weightStr && audienceName) {
          const zipCode = sanitizedValue.replace('NA_US_', '');
          const weight = parseInt(weightStr) || 0;
          
          // Validate ZIP code format (5 digits)
          if (/^\d{5}$/.test(zipCode)) {
            this.commerceData.push({
              zipCode,
              weight,
              audienceName: audienceName.trim(),
              seed: seed.trim(),
              date: date.trim()
            });
          }
        }
      }

      this.isLoaded = true;

      const stats = {
        totalRecords: this.commerceData.length,
        audienceSegments: this.getAudienceSegments(),
        averageWeight: this.commerceData.reduce((sum, item) => sum + item.weight, 0) / this.commerceData.length,
        topZipCodes: this.getTopZipCodesByWeight(5)
      };

      console.log(`✅ Commerce audience data loaded successfully:`);
      console.log(`   📍 ${stats.totalRecords} ZIP codes`);
      console.log(`   🎯 ${stats.audienceSegments.length} audience segments`);
      console.log(`   📊 Average weight: ${stats.averageWeight.toFixed(0)}`);
      
      return {
        success: true,
        message: 'Commerce audience data loaded successfully',
        stats
      };

    } catch (error) {
      console.error('❌ Error loading commerce audience data:', error);
      return {
        success: false,
        message: `Failed to load commerce audience data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Load sample commerce audience data for demo purposes
   */
  private loadSampleData(): void {
    // Sample segments matching the frontend's expected categories (from getSegmentsForCategory mapping)
    const sampleSegments = [
      // Animals & Pet Supplies
      'Animals & Pet Supplies', 'Cat Supplies', 'Dog Supplies', 'Live Animals', 'Pet Supplies',
      // Apparel & Accessories
      'Activewear', 'Baby & Toddler Clothing', 'Clothing', 'Clothing Accessories',
      'Costumes & Accessories', 'Dresses', 'Outerwear', 'Shirts & Tops', 'Shoes', 'Shorts',
      'Skirts', 'Sunglasses',
      // Arts & Entertainment
      'Arts & Entertainment', 'Books', 'DVDs & Videos', 'Event Tickets', 'Film & Television',
      'Hobbies & Creative Arts', 'Magazines & Newspapers', 'Music & Sound Recordings',
      'Party & Celebration',
      // Baby & Toddler
      'Baby & Toddler', 'Baby & Toddler Furniture', 'Baby Bathing', 'Baby Gift Sets',
      'Baby Health', 'Baby Safety', 'Baby Toys & Activity Equipment', 'Baby Transport',
      'Baby Transport Accessories', 'Diapering', 'Nursing & Feeding', 'Potty Training',
      'Swaddling & Receiving Blankets',
      // Business & Industrial
      'Advertising & Marketing', 'Agriculture', 'Business & Industrial', 'Construction',
      'Finance & Insurance', 'Food Service', 'Forestry & Logging', 'Hotel & Hospitality',
      'Manufacturing', 'Retail', 'Science & Laboratory', 'Signage',
      // Cameras & Optics
      'Camera Lenses', 'Camera Parts & Accessories', 'Cameras', 'Cameras & Optics',
      'Optics', 'Photography',
      // Electronics
      '3D Printers', 'Audio', 'Business & Home Security', 'Circuit Boards & Components',
      'Communications', 'Components', 'Computers', 'Electronics', 'Electronics Accessories',
      'GPS Tracking Devices', 'Laptops', 'Marine Electronics', 'Microphones', 'Mobile Phones',
      'Networking', 'Radar Detectors', 'Speakers', 'Storage Devices', 'Tablet Computers',
      'Televisions', 'Video', 'Video Game Consoles',
      // Food, Beverages & Tobacco
      'Alcoholic Beverages', 'Beverages', 'Coffee', 'Condiments & Sauces',
      'Cooking & Baking Ingredients', 'Dairy Products', 'Dips & Spreads', 'Food Items',
      'Frozen Desserts & Novelties', 'Juice', 'Non-Dairy Milk', 'Nuts & Seeds',
      'Pasta & Noodles', 'Seasonings & Spices', 'Soups & Broths', 'Sports & Energy Drinks',
      'Tea & Infusions', 'Water',
      // Furniture
      'Beds & Accessories', 'Benches', 'Chairs', 'Entertainment Centers & TV Stands',
      'Furniture', 'Furniture Sets', 'Futons', 'Mattresses', 'Office Furniture',
      'Outdoor Furniture', 'Shelving', 'Sofas', 'Tables',
      // Hardware
      'Building Materials', 'Fencing & Barriers', 'Fireplace & Wood Stove Accessories',
      'Fireplaces', 'Hardware', 'Hardware Accessories', 'Locks & Keys', 'Plumbing',
      'Tools', 'Wood Stoves',
      // Health & Beauty
      'Condoms', 'Cosmetic & Toiletry Bags', 'Cosmetics', 'Feminine Sanitary Supplies',
      'Fitness & Nutrition', 'Foot Care', 'Hairdressing & Cosmetology', 'Health & Beauty',
      'Medical', 'Oral Care', 'Personal Care', 'Piercing & Tattooing', 'Shaving & Grooming',
      'Sleeping Aids', 'Vision Care',
      // Home & Garden
      'Bathroom Accessories', 'Cabinets & Storage', 'Cookware & Bakeware', 'Decor',
      'Emergency Preparedness', 'Food & Beverage Carriers', 'Food Service', 'Food Storage',
      'Food Storage Accessories', 'Gardening', 'Home & Garden', 'Household Appliance Accessories',
      'Household Appliances', 'Household Cleaning Supplies', 'Household Paper Products',
      'Household Supplies', 'Kitchen & Dining', 'Kitchen Appliance Accessories',
      'Kitchen Appliances', 'Kitchen Tools & Utensils', 'Laundry Supplies', 'Lawn & Garden',
      'Lighting', 'Linens & Bedding', 'Outdoor Play Equipment', 'Plants', 'Pool & Spa',
      // Luggage & Bags
      'Backpacks', 'Briefcases', 'Duffel Bags', 'Luggage & Bags', 'Messenger Bags', 'Suitcases',
      // Media
      'Media',
      // Office Supplies
      'General Office Supplies', 'Office Equipment', 'Office Supplies',
      // Software
      'Antivirus & Security Software', 'Business & Productivity Software', 'Computer Software',
      'Educational Software', 'Network Software', 'Operating Systems', 'Software',
      // Sporting Goods
      'Athletics', 'Camping & Hiking', 'Cycling', 'Exercise & Fitness', 'Golf',
      'Outdoor Recreation', 'Sporting Goods', 'Sports Toys', 'Winter Sports & Activities',
      'Yoga & Pilates',
      // Toys & Games
      'Arcade Equipment', 'Educational Toys', 'Games', 'Gift Giving', 'Indoor Games',
      'Puzzles', 'Toys', 'Toys & Games',
      // Vehicles & Parts
      'Vehicle Parts & Accessories', 'Vehicles', 'Vehicles & Parts'
    ];

    // Sample ZIP codes from major US metros
    const sampleZips = [
      '10001', '10002', '10003', '10004', '10005', // NYC
      '90001', '90002', '90003', '90004', '90005', // LA
      '60601', '60602', '60603', '60604', '60605', // Chicago
      '75201', '75202', '75203', '75204', '75205', // Dallas
      '33101', '33102', '33109', '33125', '33126', // Miami
      '94102', '94103', '94104', '94105', '94107', // SF
      '98101', '98102', '98103', '98104', '98105', // Seattle
      '02101', '02102', '02103', '02104', '02105', // Boston
      '85001', '85002', '85003', '85004', '85005', // Phoenix
      '19101', '19102', '19103', '19104', '19105'  // Philadelphia
    ];

    const currentDate = new Date().toISOString().split('T')[0] || '2025-01-01';

    // Generate sample data: each segment gets data for each ZIP
    this.commerceData = [];
    for (const segment of sampleSegments) {
      for (const zip of sampleZips) {
        const weight = Math.floor(Math.random() * 900) + 100; // Random weight 100-1000
        this.commerceData.push({
          zipCode: zip,
          weight,
          audienceName: segment,
          seed: 'sample',
          date: currentDate
        });
      }
    }

    this.isLoaded = true;
  }

  /**
   * Get unique audience segment names directly from Supabase (fast - no full data load)
   * This is optimized for dropdown population
   */
  async getSegmentNamesFromSupabase(): Promise<string[]> {
    if (!this.useSupabase) {
      console.log('📋 getSegmentNamesFromSupabase: Supabase not enabled, falling back to local data');
      // If Supabase is not enabled, we need to load local data first
      if (!this.isLoaded) {
        console.log('📋 Local data not loaded, loading now...');
        await this.loadCommerceData();
      }
      return this.getAudienceSegments().map(s => s.name);
    }

    try {
      console.log('📋 getSegmentNamesFromSupabase: Fetching unique segment names from Supabase...');
      const supabase = SupabaseService.getClient();
      
      // OPTIMIZED: Since we know there are only 199 unique segments, we don't need a large limit
      // The view should return all segments quickly, but we'll use a reasonable limit
      const SAMPLE_SIZE = 500; // Much smaller - we only have 199 segments anyway
      
      // Add timeout wrapper (15 seconds max - reduced from 20)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Supabase query timeout')), 15000);
      });
      
      const queryPromise = (async () => {
        // OPTIMIZED: Use RPC function for much better performance
        // The RPC function executes on the database server with optimized query plan
        // This is much faster than querying a view or table directly
        console.log('🚀 Using RPC function get_audience_segment_names for fast segment retrieval...');
        console.log(`   Limit: ${SAMPLE_SIZE}`);
        
        // Add a shorter timeout for RPC (10 seconds)
        const rpcTimeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('RPC function timeout')), 10000);
        });
        
        const rpcCall = supabase.rpc('get_audience_segment_names', {
          limit_count: SAMPLE_SIZE
        });
        
        const { data, error } = await Promise.race([rpcCall, rpcTimeoutPromise]);
        
        if (error) {
          console.error('❌ Supabase RPC error in getSegmentNamesFromSupabase:', error.message);
          console.error('   Error code:', error.code);
          console.error('   Error details:', error);
          
          // If RPC times out, try cache table first (fastest)
          if (error.message?.includes('timeout') || error.code === '57014' || error.message?.includes('RPC function timeout')) {
            console.warn('⚠️ RPC function timed out, trying cache table...');
            
            // Try cache table (fastest option if it exists)
            try {
              const cacheResult = await supabase
                .from('audience_segment_names_cache')
                .select('audience_name')
                .order('audience_name', { ascending: true })
                .limit(SAMPLE_SIZE);
              
              if (!cacheResult.error && cacheResult.data && cacheResult.data.length > 0) {
                const cacheNames = cacheResult.data.map(r => r.audience_name?.trim()).filter(Boolean) as string[];
                console.log(`✅ getSegmentNamesFromSupabase (cache table): Found ${cacheNames.length} segments`);
                return cacheNames.sort();
              }
            } catch (cacheError) {
              console.warn('⚠️ Cache table not available:', cacheError);
            }
            
            console.warn('⚠️ Cache table not available, falling back to view query...');
          }
          
          // If RPC function doesn't exist, fall back to view/table query
          if (error.message?.includes('does not exist') || error.code === '42883' || error.code === '42P01') {
            console.warn('⚠️ RPC function does not exist, falling back to view query...');
            
            // Fallback to view query
            const viewResult = await supabase
              .from('v_audience_segment_names')
              .select('audience_name')
              .order('audience_name', { ascending: true })
              .limit(SAMPLE_SIZE);
            
            if (viewResult.error) {
              // If view also doesn't exist, try direct table query
              console.warn('⚠️ View also does not exist, falling back to direct table query...');
              const tableResult = await supabase
                .from('commerce_audience_segments')
                .select('audience_name')
                .not('audience_name', 'is', null)
                .order('audience_name', { ascending: true })
                .limit(SAMPLE_SIZE);
              
              if (tableResult.error) {
                throw new Error(`All query methods failed. RPC: ${error.message}, View: ${viewResult.error.message}, Table: ${tableResult.error.message}`);
              }
              
              const allNames = (tableResult.data || []).map(r => r.audience_name?.trim()).filter(Boolean) as string[];
              const uniqueNames = Array.from(new Set(allNames));
              console.log(`✅ getSegmentNamesFromSupabase (table fallback): Found ${uniqueNames.length} unique segments`);
              return uniqueNames.sort();
            }
            
            const allNames = (viewResult.data || []).map(r => r.audience_name?.trim()).filter(Boolean) as string[];
            const uniqueNames = Array.from(new Set(allNames));
            console.log(`✅ getSegmentNamesFromSupabase (view fallback): Found ${uniqueNames.length} unique segments`);
            return uniqueNames.sort();
          }
          
          throw new Error(`Supabase RPC failed: ${error.message}`);
        }

        if (!data || data.length === 0) {
          console.warn('⚠️ No data returned from Supabase RPC');
          return [];
        }

        // RPC returns array of objects with audience_name property
        // The function already returns DISTINCT and trimmed values, so we just need to extract them
        const segmentNames = data.map((row: any) => {
          // Handle both object format {audience_name: "..."} and direct string format
          const name = typeof row === 'string' ? row : row.audience_name;
          return name?.trim();
        }).filter(Boolean) as string[];
        
        // RPC already returns DISTINCT, but we'll deduplicate again just to be safe
        const uniqueNames = Array.from(new Set(segmentNames));
        
        console.log(`✅ getSegmentNamesFromSupabase (RPC): Found ${uniqueNames.length} unique segments`);
        console.log(`   Sample segments (first 10): ${uniqueNames.slice(0, 10).join(', ')}`);
        
        return uniqueNames.sort();
      })();
      
      // Race between query and timeout
      const uniqueNames = await Promise.race([queryPromise, timeoutPromise]);
      
      if (uniqueNames.length === 0) {
        console.warn('⚠️ No segments found in Supabase sample query');
        // Don't fall back to full data load - it will timeout
        // Return empty array and let the caller handle it
        return [];
      }
      
      // Return whatever segments we found - even if it's fewer than expected
      // The 50k row sample should give us most segments
      return uniqueNames.sort();
    } catch (error) {
      console.error('❌ Error in getSegmentNamesFromSupabase:', error);
      // Fallback to local method if it fails
      console.log('📋 Falling back to local data due to error');
      if (!this.isLoaded) {
        await this.loadCommerceData();
      }
      if (this.isLoaded) {
        return this.getAudienceSegments().map(s => s.name);
      }
      throw error;
    }
  }

  /**
   * Get all available audience segments (excludes problematic categories)
   */
  getAudienceSegments(): AudienceSegment[] {
    console.log(`📋 getAudienceSegments() called - isLoaded: ${this.isLoaded}, dataLength: ${this.commerceData.length}`);
    
    if (!this.isLoaded || this.commerceData.length === 0) {
      console.error('❌ ERROR: getAudienceSegments() called but no data is loaded!');
      console.error('   isLoaded:', this.isLoaded);
      console.error('   commerceData.length:', this.commerceData.length);
      console.error('   useSupabase:', this.useSupabase);
      console.error('   This indicates data loading failed. Check logs above for errors.');
      return []; // Return empty array so we can see the real error
    }
    
    const segmentMap = new Map<string, { totalZipCodes: number; totalWeight: number }>();

    for (const item of this.commerceData) {
      // Skip excluded categories
      if (this.isExcludedCategory(item.audienceName)) continue;
      
      if (!item.audienceName || item.audienceName.trim() === '') {
        continue; // Skip items with empty audience names
      }
      
      const existing = segmentMap.get(item.audienceName) || { totalZipCodes: 0, totalWeight: 0 };
      segmentMap.set(item.audienceName, {
        totalZipCodes: existing.totalZipCodes + 1,
        totalWeight: existing.totalWeight + item.weight
      });
    }

    const segments = Array.from(segmentMap.entries()).map(([name, data]) => ({
      name,
      totalZipCodes: data.totalZipCodes,
      totalWeight: data.totalWeight,
      averageWeight: data.totalWeight / data.totalZipCodes
    }));
    
    console.log(`✅ getAudienceSegments() returning ${segments.length} segments`);
    if (segments.length > 0) {
      console.log(`   Sample segments: ${segments.slice(0, 5).map(s => s.name).join(', ')}...`);
    }
    
    return segments;
  }

  /**
   * Load commerce data for a specific segment from Supabase (on-demand, much faster)
   */
  async loadSegmentDataFromSupabase(segmentName: string, limit: number = 5000): Promise<CommerceAudienceData[]> {
    if (!this.useSupabase) {
      console.log('📋 loadSegmentDataFromSupabase: Supabase not enabled');
      return [];
    }

    try {
      console.log(`📊 Loading commerce data for segment "${segmentName}" from Supabase...`);
      const supabase = SupabaseService.getClient();
      
      // Add timeout wrapper (10 seconds max)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Segment data loading timeout')), 10000);
      });
      
      const queryPromise = (async () => {
        // Query filtered by segment name - much faster than loading all data
        // Try exact match first (faster), then fall back to case-insensitive partial match
        const trimmedSegment = segmentName.trim();
        let result = await supabase
          .from('commerce_audience_segments')
          .select('sanitized_value, weight, audience_name, seed, dt')
          .eq('audience_name', trimmedSegment) // Exact match for best performance
          .limit(limit);
        
        // If exact match returns no results, try case-insensitive partial match
        if (result.error || !result.data || result.data.length === 0) {
          console.log(`   Exact match failed, trying case-insensitive partial match...`);
          result = await supabase
            .from('commerce_audience_segments')
            .select('sanitized_value, weight, audience_name, seed, dt')
            .ilike('audience_name', `%${trimmedSegment}%`) // Case-insensitive partial match
            .limit(limit);
        }
        
        const { data, error } = result;

        if (error) {
          console.error('❌ Supabase query error in loadSegmentDataFromSupabase:', error.message);
          throw new Error(`Supabase query failed: ${error.message}`);
        }

        if (!data || data.length === 0) {
          console.warn(`⚠️ No data found for segment "${segmentName}"`);
          return [];
        }

        // Process records
        const segmentData: CommerceAudienceData[] = [];
        for (const record of data) {
          const sanitizedValue = record.sanitized_value;
          
          if (sanitizedValue && sanitizedValue.startsWith('NA_US_')) {
            const zipCode = sanitizedValue.replace('NA_US_', '');
            
            if (/^\d{5}$/.test(zipCode)) {
              segmentData.push({
                zipCode,
                weight: record.weight || 0,
                audienceName: record.audience_name?.trim() || '',
                seed: record.seed?.trim() || '',
                date: record.dt || ''
              });
            }
          }
        }

        console.log(`✅ Loaded ${segmentData.length} records for segment "${segmentName}"`);
        return segmentData;
      })();

      const segmentData = await Promise.race([queryPromise, timeoutPromise]);
      return segmentData;
    } catch (error) {
      console.error(`❌ Error loading segment data for "${segmentName}":`, error);
      return [];
    }
  }

  /**
   * Search ZIP codes by audience segment (excludes problematic categories)
   * Now supports on-demand loading from Supabase if data not loaded
   */
  async searchZipCodesByAudience(audienceName: string, limit: number = 50): Promise<CommerceAudienceData[]> {
    // If data not loaded and Supabase is enabled, try loading on-demand for this segment
    if (!this.isLoaded && this.useSupabase) {
      console.log(`📊 Data not loaded, loading on-demand for segment "${audienceName}"...`);
      const segmentData = await this.loadSegmentDataFromSupabase(audienceName, limit * 10); // Load more to account for filtering
      
      if (segmentData.length > 0) {
        // Use the loaded segment data directly
        return segmentData
          .sort((a, b) => b.weight - a.weight)
          .slice(0, limit);
      }
    }
    
    if (!this.isLoaded) {
      console.warn('⚠️ Commerce audience data not loaded');
      return [];
    }

    // Check if the search term matches an excluded category
    if (this.isExcludedCategory(audienceName)) {
      console.log(`   ⚠️ Category "${audienceName}" is excluded due to data quality issues`);
      return [];
    }

    // Filter by segment name (also excluding problematic categories)
    const filtered = this.commerceData.filter(item => 
      item.audienceName.toLowerCase().includes(audienceName.toLowerCase()) &&
      !this.isExcludedCategory(item.audienceName)
    );
    
    // DEDUPLICATE: If multiple rows for same ZIP+segment, keep the one with highest weight
    const zipMap = new Map<string, CommerceAudienceData>();
    
    filtered.forEach(item => {
      const existing = zipMap.get(item.zipCode);
      if (!existing || item.weight > existing.weight) {
        zipMap.set(item.zipCode, item);
      }
    });
    
    // Convert back to array, sort by weight, and limit
    const deduplicated = Array.from(zipMap.values());
    
    console.log(`   🔍 Found ${filtered.length} rows, deduplicated to ${deduplicated.length} unique ZIPs`);
    
    return deduplicated
      .sort((a, b) => b.weight - a.weight) // Sort by weight descending
      .slice(0, limit);
  }

  /**
   * Get audience data for specific ZIP codes (excludes problematic categories)
   */
  getAudienceDataForZipCodes(zipCodes: string[]): CommerceAudienceData[] {
    if (!this.isLoaded) {
      console.warn('⚠️ Commerce audience data not loaded');
      return [];
    }

    const zipCodeSet = new Set(zipCodes);
    return this.commerceData.filter(item => 
      zipCodeSet.has(item.zipCode) && !this.isExcludedCategory(item.audienceName)
    );
  }

  /**
   * Get top ZIP codes by weight for a specific audience (excludes problematic categories)
   */
  getTopZipCodesByWeight(limit: number = 10, audienceName?: string): CommerceAudienceData[] {
    if (!this.isLoaded) {
      console.warn('⚠️ Commerce audience data not loaded');
      return [];
    }

    let filteredData = this.commerceData.filter(item => 
      !this.isExcludedCategory(item.audienceName)
    );
    
    if (audienceName) {
      filteredData = filteredData.filter(item => 
        item.audienceName.toLowerCase().includes(audienceName.toLowerCase())
      );
    }

    return filteredData
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);
  }

  /**
   * Get audience penetration for a ZIP code (excludes problematic categories)
   */
  getAudiencePenetration(zipCode: string): CommerceAudienceData[] {
    if (!this.isLoaded) {
      console.warn('⚠️ Commerce audience data not loaded');
      return [];
    }

    return this.commerceData.filter(item => 
      item.zipCode === zipCode && !this.isExcludedCategory(item.audienceName)
    );
  }

  /**
   * Search audience segments by name (excludes problematic categories)
   */
  searchAudienceSegments(query: string): AudienceSegment[] {
    const segments = this.getAudienceSegments(); // Already excludes problematic categories
    const queryLower = query.toLowerCase();
    
    return segments.filter(segment => 
      segment.name.toLowerCase().includes(queryLower)
    );
  }

  /**
   * Check if a category should be excluded due to data quality issues
   */
  private isExcludedCategory(categoryName: string): boolean {
    return EXCLUDED_CATEGORIES.some(excluded => 
      categoryName.toLowerCase() === excluded.toLowerCase()
    );
  }

  /**
   * Get audience segments for specific ZIP codes only
   * Returns segments aggregated only from the provided ZIP codes
   */
  getSegmentsForZipCodes(zipCodes: string[]): AudienceSegment[] {
    if (!this.isLoaded || zipCodes.length === 0) {
      console.log(`   ⚠️ getSegmentsForZipCodes: isLoaded=${this.isLoaded}, zipCodes.length=${zipCodes.length}`);
      return [];
    }

    const zipSet = new Set(zipCodes);
    const segmentMap = new Map<string, { totalZipCodes: number; totalWeight: number }>();
    
    // Diagnostic: Check how many ZIP codes from the request exist in commerce data
    const uniqueCommerceZips = new Set(this.commerceData.map(item => item.zipCode));
    const matchingZips = zipCodes.filter(zip => uniqueCommerceZips.has(zip));
    const nonMatchingZips = zipCodes.filter(zip => !uniqueCommerceZips.has(zip));
    
    console.log(`   🔍 getSegmentsForZipCodes: Searching ${zipCodes.length} ZIP codes`);
    console.log(`   📊 Found ${matchingZips.length} matching ZIPs in commerce data, ${nonMatchingZips.length} not found`);
    if (matchingZips.length > 0 && matchingZips.length <= 10) {
      console.log(`   ✅ Matching ZIPs: ${matchingZips.slice(0, 10).join(', ')}`);
    } else if (matchingZips.length > 10) {
      console.log(`   ✅ Sample matching ZIPs: ${matchingZips.slice(0, 5).join(', ')}... (${matchingZips.length} total)`);
    }
    if (nonMatchingZips.length > 0 && nonMatchingZips.length <= 10) {
      console.log(`   ⚠️ Non-matching ZIPs: ${nonMatchingZips.slice(0, 10).join(', ')}`);
    } else if (nonMatchingZips.length > 10) {
      console.log(`   ⚠️ Sample non-matching ZIPs: ${nonMatchingZips.slice(0, 5).join(', ')}... (${nonMatchingZips.length} total)`);
    }

    let itemsProcessed = 0;
    let itemsMatched = 0;

    // Filter to only the specified ZIP codes
    for (const item of this.commerceData) {
      itemsProcessed++;
      if (!zipSet.has(item.zipCode)) continue;
      itemsMatched++;
      if (this.isExcludedCategory(item.audienceName)) continue;

      const existing = segmentMap.get(item.audienceName) || { totalZipCodes: 0, totalWeight: 0 };
      segmentMap.set(item.audienceName, {
        totalZipCodes: existing.totalZipCodes + 1,
        totalWeight: existing.totalWeight + item.weight
      });
    }

    const result = Array.from(segmentMap.entries()).map(([name, data]) => ({
      name,
      totalZipCodes: data.totalZipCodes,
      totalWeight: data.totalWeight,
      averageWeight: data.totalWeight / data.totalZipCodes
    }));

    console.log(`   📈 Processed ${itemsProcessed.toLocaleString()} commerce items, ${itemsMatched.toLocaleString()} matched ZIP codes, found ${result.length} segments`);

    return result;
  }

  /**
   * Get segments for ZIP codes with over-index calculation vs national average
   * Filters out top X% most widespread segments (outliers that appear everywhere)
   */
  async getSegmentsWithOverIndex(
    zipCodes: string[],
    outlierPercentile: number = 10,
    categoryFilter?: string
  ): Promise<Array<AudienceSegment & { overIndex: number; level1Category: string }>> {
    if (!this.isLoaded) {
      await this.loadCommerceData();
    }

    // Get national (all) segments for comparison and filtering
    const nationalSegments = this.getAudienceSegments();

    // Calculate the ZIP count threshold for outlier filtering
    // Segments in more ZIPs than this threshold are considered "everywhere" and filtered out
    const sortedByZips = [...nationalSegments].sort((a, b) => b.totalZipCodes - a.totalZipCodes);
    const cutoffIndex = Math.floor(nationalSegments.length * outlierPercentile / 100);
    const cutoffSegment = cutoffIndex > 0 ? sortedByZips[cutoffIndex - 1] ?? undefined : undefined;
    const zipCountThreshold = cutoffSegment?.totalZipCodes ?? Infinity;

    // Create map of non-outlier national segments
    const nationalMap = new Map(
      nationalSegments
        .filter(s => s.totalZipCodes <= zipCountThreshold)
        .map(s => [s.name, s])
    );

    console.log(`   🔍 Outlier filter: removing segments in >${zipCountThreshold.toLocaleString()} ZIPs (top ${outlierPercentile}%)`);
    console.log(`   🏷️ Category filter received in service: "${categoryFilter}" (type: ${typeof categoryFilter})`);
    if (categoryFilter && categoryFilter !== 'All Categories') {
      console.log(`   🏷️ Will filter to category: ${categoryFilter}`);
    }

    // Get segments for the specific market
    const marketSegments = this.getSegmentsForZipCodes(zipCodes);

    // Calculate over-index, filtering out outliers and optionally by category
    const segmentsWithCategory = marketSegments
      .filter(seg => nationalMap.has(seg.name)) // Only include non-outlier segments
      .map(seg => {
        const national = nationalMap.get(seg.name)!;
        const overIndex = Math.round((seg.averageWeight / national.averageWeight) * 100);
        const level1Category = getLevel1Category(seg.name);

        return {
          ...seg,
          overIndex,
          level1Category
        };
      });

    // Debug: Show category distribution before filtering
    if (categoryFilter && categoryFilter !== 'All Categories') {
      const beforeFilter = segmentsWithCategory.reduce((acc, seg) => {
        acc[seg.level1Category] = (acc[seg.level1Category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log(`   📊 Before category filter - segments by category:`, beforeFilter);
      console.log(`   🎯 Looking for category: "${categoryFilter}"`);
    }

    const filteredSegments = segmentsWithCategory.filter(seg => {
      // Apply category filter if specified
      if (!categoryFilter || categoryFilter === 'All Categories') {
        return true;
      }
      const matches = seg.level1Category === categoryFilter;
      return matches;
    });

    if (categoryFilter && categoryFilter !== 'All Categories') {
      console.log(`   ✅ After filter: ${filteredSegments.length} segments match "${categoryFilter}"`);
    }

    return filteredSegments;
  }

  /**
   * Get data loading status
   */
  getStatus(): { isLoaded: boolean; totalRecords: number; audienceSegments: string[] } {
    return {
      isLoaded: this.isLoaded,
      totalRecords: this.commerceData.length,
      audienceSegments: this.getAudienceSegments().map(s => s.name)
    };
  }
}

export const commerceAudienceService = new CommerceAudienceService();
