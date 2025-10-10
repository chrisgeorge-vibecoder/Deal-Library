import * as fs from 'fs';
import * as path from 'path';

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

  constructor() {
    this.dataFilePath = path.join(__dirname, '../../data/commerce_audience_segments.csv');
  }

  /**
   * Load commerce audience data from CSV file
   */
  async loadCommerceData(): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      console.log('📊 Loading Commerce Audience segments data from CSV...');
      
      if (!fs.existsSync(this.dataFilePath)) {
        return {
          success: false,
          message: 'Commerce audience segments CSV file not found'
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
