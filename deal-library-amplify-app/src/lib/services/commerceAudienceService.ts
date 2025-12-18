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
      
      // Fetch commerce records with pagination for better performance
      const pageSize = 2000;
      let allRecords: any[] = [];
      let offset = 0;
      let pageCount = 0;
      
      // Load data in chunks to avoid memory issues
      while (true) {
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
        if (count !== null) {
          console.log(`   📊 Total records in table: ${count}`);
        }
        
        if (!records || records.length === 0) {
          console.log(`   ℹ️  No more records (reached end at offset ${offset})`);
          break; // No more records
        }
        
        allRecords = [...allRecords, ...records];
        offset += pageSize;
        
        console.log(`📈 Loaded ${allRecords.length} commerce records so far...`);
        
        // Safety limit to prevent infinite loops
        if (pageCount > 100) {
          console.warn('⚠️  Reached page limit (100), stopping pagination');
          break;
        }
      }
      
      console.log(`📊 Total records fetched from Supabase: ${allRecords.length}`);
      
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
      return this.getAudienceSegments().map(s => s.name);
    }

    try {
      console.log('📋 getSegmentNamesFromSupabase: Fetching unique segment names from Supabase...');
      const supabase = SupabaseService.getClient();
      
      // Use a simple query with distinct - much faster than loading all data
      const { data, error } = await supabase
        .from('commerce_audience_segments')
        .select('audience_name')
        .not('audience_name', 'is', null)
        .limit(1000);  // Get up to 1000 unique combinations

      if (error) {
        console.error('❌ Supabase query error in getSegmentNamesFromSupabase:', error.message);
        throw new Error(`Supabase query failed: ${error.message}`);
      }

      // Extract unique segment names
      const allNames = (data || []).map(r => r.audience_name?.trim()).filter(Boolean) as string[];
      const uniqueNames = Array.from(new Set(allNames));
      console.log(`✅ getSegmentNamesFromSupabase: Found ${uniqueNames.length} unique segments`);
      
      return uniqueNames.sort();
    } catch (error) {
      console.error('❌ Error in getSegmentNamesFromSupabase:', error);
      // Fallback to local method if it fails
      if (this.isLoaded) {
        return this.getAudienceSegments().map(s => s.name);
      }
      throw error;
    }
  }

  /**
   * Get all available audience segments
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
   * Search ZIP codes by audience segment
   */
  searchZipCodesByAudience(audienceName: string, limit: number = 50): CommerceAudienceData[] {
    if (!this.isLoaded) {
      console.warn('⚠️ Commerce audience data not loaded');
      return [];
    }

    // Filter by segment name
    const filtered = this.commerceData.filter(item => 
      item.audienceName.toLowerCase().includes(audienceName.toLowerCase())
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
   * Get audience data for specific ZIP codes
   */
  getAudienceDataForZipCodes(zipCodes: string[]): CommerceAudienceData[] {
    if (!this.isLoaded) {
      console.warn('⚠️ Commerce audience data not loaded');
      return [];
    }

    const zipCodeSet = new Set(zipCodes);
    return this.commerceData.filter(item => zipCodeSet.has(item.zipCode));
  }

  /**
   * Get top ZIP codes by weight for a specific audience
   */
  getTopZipCodesByWeight(limit: number = 10, audienceName?: string): CommerceAudienceData[] {
    if (!this.isLoaded) {
      console.warn('⚠️ Commerce audience data not loaded');
      return [];
    }

    let filteredData = this.commerceData;
    
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
   * Get audience penetration for a ZIP code
   */
  getAudiencePenetration(zipCode: string): CommerceAudienceData[] {
    if (!this.isLoaded) {
      console.warn('⚠️ Commerce audience data not loaded');
      return [];
    }

    return this.commerceData.filter(item => item.zipCode === zipCode);
  }

  /**
   * Search audience segments by name
   */
  searchAudienceSegments(query: string): AudienceSegment[] {
    const segments = this.getAudienceSegments();
    const queryLower = query.toLowerCase();
    
    return segments.filter(segment => 
      segment.name.toLowerCase().includes(queryLower)
    );
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
