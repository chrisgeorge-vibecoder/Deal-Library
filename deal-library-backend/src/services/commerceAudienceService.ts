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

export class CommerceAudienceService {
  private commerceData: CommerceAudienceData[] = [];
  private isLoaded = false;
  private dataFilePath: string;
  private useSupabase: boolean;

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
      
      // Fetch all commerce records (need to override default 1000 limit)
      const { data: records, error } = await supabase
        .from('commerce_audience_segments')
        .select('sanitized_value, weight, audience_name, seed, dt')
        .limit(5000000); // Request up to 5M records
      
      if (error) {
        throw new Error(`Supabase query failed: ${error.message}`);
      }
      
      if (!records || records.length === 0) {
        console.warn('⚠️  No commerce data found in Supabase, falling back to CSV');
        return this.loadFromCSV();
      }
      
      console.log(`📈 Processing ${records.length} commerce records from Supabase...`);
      
      this.commerceData = [];
      
      for (const record of records) {
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
   * Get all available audience segments
   */
  getAudienceSegments(): AudienceSegment[] {
    const segmentMap = new Map<string, { totalZipCodes: number; totalWeight: number }>();

    for (const item of this.commerceData) {
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
