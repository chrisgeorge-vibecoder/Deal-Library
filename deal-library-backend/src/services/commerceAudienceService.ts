import * as fs from 'fs';
import * as path from 'path';
import { SupabaseService } from './supabaseService';

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

  /**
   * Check if a category should be excluded from results
   */
  private isExcludedCategory(categoryName: string): boolean {
    return EXCLUDED_CATEGORIES.some(excluded => 
      categoryName.toLowerCase() === excluded.toLowerCase()
    );
  }

  constructor() {
    this.dataFilePath = path.join(__dirname, '../../data/commerce_audience_segments.csv');
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
    if (this.useSupabase) {
      return this.loadFromSupabase();
    } else {
      return this.loadFromCSV();
    }
  }

  /**
   * Load commerce audience data from Supabase
   */
  private async loadFromSupabase(): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      console.log('📊 Loading Commerce Audience segments data from Supabase...');
      
      const supabase = SupabaseService.getClient();
      
      // Fetch commerce records with pagination for better performance
      const pageSize = 2000;
      let allRecords: any[] = [];
      let offset = 0;
      
      // Load data in chunks to avoid memory issues
      while (true) {
        const { data: records, error } = await supabase
          .from('commerce_audience_segments')
          .select('sanitized_value, weight, audience_name, seed, dt')
          .order('sanitized_value')
          .range(offset, offset + pageSize - 1);
      
        if (error) {
          throw new Error(`Supabase query failed: ${error.message}`);
        }
        
        if (!records || records.length === 0) {
          break; // No more records
        }
        
        allRecords = [...allRecords, ...records];
        offset += pageSize;
        
        console.log(`📈 Loaded ${allRecords.length} commerce records so far...`);
      }
      
      if (allRecords.length === 0) {
        console.warn('⚠️  No commerce data found in Supabase, falling back to CSV');
        return this.loadFromCSV();
      }
      
      console.log(`📈 Processing ${allRecords.length} total commerce records from Supabase...`);
      
      this.commerceData = [];
      
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
      
      console.log(`✅ Commerce audience data loaded from Supabase:`);
      console.log(`   📍 ${stats.totalRecords.toLocaleString()} ZIP codes`);
      console.log(`   🎯 ${stats.audienceSegments.length} audience segments`);
      console.log(`   📊 Average weight: ${stats.averageWeight.toFixed(0)}`);
      
      return {
        success: true,
        message: 'Commerce audience data loaded from Supabase successfully',
        stats
      };
      
    } catch (error) {
      console.error('Error loading commerce data from Supabase:', error);
      console.log('⚠️  Falling back to CSV loading...');
      return this.loadFromCSV();
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
    // Sample segments matching the frontend's expected categories
    const sampleSegments = [
      'Animals & Pet Supplies', 'Cat Supplies', 'Dog Supplies', 'Pet Supplies',
      'Activewear', 'Clothing', 'Shoes', 'Outerwear', 'Sunglasses',
      'Home Appliances', 'Small Kitchen Appliances', 'Vacuums',
      'Antiques', 'Artwork', 'Posters & Prints',
      'TVs', 'Cameras & Photography', 'Audio Equipment',
      'Luggage & Bags', 'Camping & Hiking', 'Cycling', 'Fitness Equipment',
      'Baby Care', 'Baby & Toddler Toys', 'Nursing & Feeding',
      'Office Supplies', 'Office Instruments', 'Desk Accessories',
      'Food', 'Beverages', 'Bakery', 'Grocery', 'Sweets & Treats',
      'Home Decor', 'Furniture', 'Bedding', 'Bathroom Accessories',
      'Toys & Games', 'Board Games', 'Puzzles', 'Action Figures',
      'Vitamins & Supplements', 'Personal Care', 'Oral Care',
      'Hardware', 'Building Materials', 'Plumbing Fixtures & Equipment',
      'Apparel', 'Arts & Crafts', 'Bags & Luggage', 'Cameras & Optics',
      'Electronics', 'Health & Beauty', 'Home & Garden', 'Media',
      'Sporting Goods', 'Toys', 'Vehicles & Parts'
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
   * Get all available audience segments (excludes problematic categories)
   * Supports lazy loading - will auto-load data if not already loaded
   */
  async getAudienceSegmentsAsync(): Promise<AudienceSegment[]> {
    // Lazy load data if not already loaded
    if (!this.isLoaded) {
      console.log('🔄 Commerce data not loaded, triggering lazy load...');
      await this.loadCommerceData();
    }
    return this.getAudienceSegments();
  }

  /**
   * Get all available audience segments (excludes problematic categories)
   * Synchronous version - returns empty array if data not loaded
   */
  getAudienceSegments(): AudienceSegment[] {
    const segmentMap = new Map<string, { totalZipCodes: number; totalWeight: number }>();

    for (const item of this.commerceData) {
      // Skip excluded categories
      if (this.isExcludedCategory(item.audienceName)) continue;
      
      const existing = segmentMap.get(item.audienceName) || { totalZipCodes: 0, totalWeight: 0 };
      segmentMap.set(item.audienceName, {
        totalZipCodes: existing.totalZipCodes + 1,
        totalWeight: existing.totalWeight + item.weight
      });
    }

    return Array.from(segmentMap.entries()).map(([name, data]) => ({
      name,
      totalZipCodes: data.totalZipCodes,
      totalWeight: data.totalWeight,
      averageWeight: data.totalWeight / data.totalZipCodes
    }));
  }

  /**
   * Get audience segments for specific ZIP codes only
   * Returns segments aggregated only from the provided ZIP codes
   */
  getSegmentsForZipCodes(zipCodes: string[]): AudienceSegment[] {
    if (!this.isLoaded || zipCodes.length === 0) {
      return [];
    }

    const zipSet = new Set(zipCodes);
    const segmentMap = new Map<string, { totalZipCodes: number; totalWeight: number }>();

    // Filter to only the specified ZIP codes
    for (const item of this.commerceData) {
      if (!zipSet.has(item.zipCode)) continue;
      if (this.isExcludedCategory(item.audienceName)) continue;

      const existing = segmentMap.get(item.audienceName) || { totalZipCodes: 0, totalWeight: 0 };
      segmentMap.set(item.audienceName, {
        totalZipCodes: existing.totalZipCodes + 1,
        totalWeight: existing.totalWeight + item.weight
      });
    }

    return Array.from(segmentMap.entries()).map(([name, data]) => ({
      name,
      totalZipCodes: data.totalZipCodes,
      totalWeight: data.totalWeight,
      averageWeight: data.totalWeight / data.totalZipCodes
    }));
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
   * Search ZIP codes by audience segment (excludes problematic categories)
   */
  searchZipCodesByAudience(audienceName: string, limit: number = 50): CommerceAudienceData[] {
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
