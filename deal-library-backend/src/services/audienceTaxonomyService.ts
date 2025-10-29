/**
 * Audience Taxonomy Service
 * Manages Sovrn Audience Taxonomy data with Supabase + CSV fallback
 */

import * as fs from 'fs';
import * as path from 'path';
import { SupabaseService } from './supabaseService';
import { 
  AudienceTaxonomySegment, 
  AudienceSearchFilters 
} from '../types/audienceTaxonomy';

interface RawTaxonomyRow {
  segment_type: string;
  sovrn_segment_id: string;
  sovrn_parent_segment_id: string;
  segment_name: string;
  segment_description: string;
  tier_number: number;
  tier_1: string;
  tier_2: string;
  tier_3: string;
  tier_4: string;
  tier_5: string;
  tier_6: string;
  full_path: string;
  cpm: number;
  media_cost_percent: number;
  actively_generated: boolean;
  scale_7day_global?: number;
  scale_7day_us?: number;
  scale_hem_us?: number;
  scale_1day_ip?: number;
}

export class AudienceTaxonomyService {
  private static instance: AudienceTaxonomyService | null = null;
  private taxonomyData: Map<string, AudienceTaxonomySegment> = new Map();
  private isLoaded: boolean = false;
  private dataPath: string;
  private useSupabase: boolean;

  constructor() {
    this.dataPath = path.join(__dirname, '../../data/Sovrn Taxonomy (AI Project).csv');
    this.useSupabase = process.env.USE_SUPABASE === 'true';
    
    if (this.useSupabase) {
      console.log('🎯 AudienceTaxonomyService: Supabase mode enabled');
    } else {
      console.log('🎯 AudienceTaxonomyService: CSV mode (fallback)');
    }
  }

  // Singleton pattern to share loaded taxonomy data across all services
  public static getInstance(): AudienceTaxonomyService {
    if (!AudienceTaxonomyService.instance) {
      AudienceTaxonomyService.instance = new AudienceTaxonomyService();
    }
    return AudienceTaxonomyService.instance;
  }

  /**
   * Load taxonomy data from Supabase or CSV
   */
  async loadData(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    if (this.useSupabase) {
      try {
        await this.loadFromSupabase();
        this.isLoaded = true;
        return;
      } catch (error) {
        console.error('❌ Failed to load from Supabase, falling back to CSV:', error);
      }
    }

    // Fallback to CSV
    await this.loadFromCSV();
    this.isLoaded = true;
  }

  /**
   * Load taxonomy data from Supabase
   */
  private async loadFromSupabase(): Promise<void> {
    console.log('📥 Loading taxonomy data from Supabase...');
    const supabase = SupabaseService.getClient();
    
    const { data, error } = await supabase
      .from('audience_taxonomy')
      .select('*')
      .order('tier_number', { ascending: true });
    
    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error('No taxonomy data found in Supabase');
    }
    
    // Map database records to AudienceTaxonomySegment
    for (const row of data as RawTaxonomyRow[]) {
      const segment: AudienceTaxonomySegment = {
        segmentType: row.segment_type,
        sovrnSegmentId: row.sovrn_segment_id,
        sovrnParentSegmentId: row.sovrn_parent_segment_id,
        segmentName: row.segment_name,
        segmentDescription: row.segment_description,
        tierNumber: row.tier_number,
        tier1: row.tier_1 || '',
        tier2: row.tier_2 || '',
        tier3: row.tier_3 || '',
        tier4: row.tier_4 || '',
        tier5: row.tier_5 || '',
        tier6: row.tier_6 || '',
        fullPath: row.full_path,
        cpm: row.cpm,
        mediaPercentCost: row.media_cost_percent,
        activelyGenerated: row.actively_generated,
        scale7DayGlobal: row.scale_7day_global,
        scale7DayUS: row.scale_7day_us,
        scaleHEMUS: row.scale_hem_us,
        scale1DayIP: row.scale_1day_ip
      };
      
      this.taxonomyData.set(segment.sovrnSegmentId, segment);
    }
    
    console.log(`✅ Loaded ${this.taxonomyData.size} taxonomy segments from Supabase`);
  }

  /**
   * Load taxonomy data from CSV
   */
  private async loadFromCSV(): Promise<void> {
    console.log('📥 Loading taxonomy data from CSV...');
    
    if (!fs.existsSync(this.dataPath)) {
      throw new Error(`Taxonomy CSV file not found: ${this.dataPath}`);
    }
    
    const csvContent = fs.readFileSync(this.dataPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      
      if (values.length < 10) continue;
      
      const segment: AudienceTaxonomySegment = {
        segmentType: this.cleanString(values[0]),
        sovrnSegmentId: this.cleanString(values[1]),
        sovrnParentSegmentId: this.cleanString(values[2]),
        segmentName: this.cleanString(values[3]),
        segmentDescription: this.cleanString(values[4]),
        tierNumber: this.toNumber(values[5]) || 0,
        tier1: this.cleanString(values[6]),
        tier2: this.cleanString(values[7]),
        tier3: this.cleanString(values[8]),
        tier4: this.cleanString(values[9]),
        tier5: this.cleanString(values[10]),
        tier6: this.cleanString(values[11]),
        fullPath: this.cleanString(values[12]),
        cpm: this.toNumber(values[13]?.replace('$', '')) || 0,
        mediaPercentCost: this.toNumber(values[14]) || 0,
        activelyGenerated: this.toBoolean(values[15]),
        scale7DayGlobal: this.toNumber(values[16]),
        scale7DayUS: this.toNumber(values[17]),
        scaleHEMUS: this.toNumber(values[18]),
        scale1DayIP: this.toNumber(values[19])
      };
      
      if (segment.sovrnSegmentId) {
        this.taxonomyData.set(segment.sovrnSegmentId, segment);
      }
    }
    
    console.log(`✅ Loaded ${this.taxonomyData.size} taxonomy segments from CSV`);
  }

  /**
   * Get all taxonomy segments
   */
  async getTaxonomyData(): Promise<AudienceTaxonomySegment[]> {
    await this.loadData();
    return Array.from(this.taxonomyData.values());
  }

  /**
   * Get segment by ID
   */
  async getSegmentById(id: string): Promise<AudienceTaxonomySegment | undefined> {
    await this.loadData();
    return this.taxonomyData.get(id);
  }

  /**
   * Get segment by name
   */
  async getSegmentByName(name: string): Promise<AudienceTaxonomySegment | undefined> {
    await this.loadData();
    const segments = Array.from(this.taxonomyData.values());
    return segments.find(s => 
      s.segmentName.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Search segments by keyword (simple text matching)
   */
  async searchSegments(keyword: string): Promise<AudienceTaxonomySegment[]> {
    await this.loadData();
    const lowerKeyword = keyword.toLowerCase();
    const segments = Array.from(this.taxonomyData.values());
    
    return segments.filter(s => 
      s.segmentName.toLowerCase().includes(lowerKeyword) ||
      s.segmentDescription.toLowerCase().includes(lowerKeyword) ||
      s.fullPath.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * Filter segments by criteria
   */
  async filterSegments(filters: AudienceSearchFilters): Promise<AudienceTaxonomySegment[]> {
    await this.loadData();
    let segments = Array.from(this.taxonomyData.values());
    
    if (filters.segmentType) {
      segments = segments.filter(s => s.segmentType === filters.segmentType);
    }
    
    if (filters.maxCPM !== undefined) {
      segments = segments.filter(s => s.cpm <= filters.maxCPM!);
    }
    
    if (filters.activelyGenerated !== undefined) {
      segments = segments.filter(s => s.activelyGenerated === filters.activelyGenerated);
    }
    
    if (filters.minScale !== undefined) {
      segments = segments.filter(s => 
        (s.scale7DayUS && s.scale7DayUS >= filters.minScale!) ||
        (s.scale1DayIP && s.scale1DayIP >= filters.minScale!)
      );
    }
    
    return segments;
  }

  /**
   * Get segments by tier
   */
  async getSegmentsByTier(tier: number, tierValue?: string): Promise<AudienceTaxonomySegment[]> {
    await this.loadData();
    const segments = Array.from(this.taxonomyData.values());
    
    let filtered = segments.filter(s => s.tierNumber === tier);
    
    if (tierValue) {
      const tierKey = `tier${tier}` as keyof AudienceTaxonomySegment;
      filtered = filtered.filter(s => s[tierKey] === tierValue);
    }
    
    return filtered;
  }

  /**
   * Get child segments for a parent
   */
  async getChildSegments(parentId: string): Promise<AudienceTaxonomySegment[]> {
    await this.loadData();
    const segments = Array.from(this.taxonomyData.values());
    return segments.filter(s => s.sovrnParentSegmentId === parentId);
  }

  /**
   * Reload data (for admin operations)
   */
  async reload(): Promise<void> {
    this.isLoaded = false;
    this.taxonomyData.clear();
    await this.loadData();
  }

  /**
   * Get statistics about loaded data
   */
  async getStats() {
    await this.loadData();
    
    const segments = Array.from(this.taxonomyData.values());
    const commerceCount = segments.filter(s => s.segmentType === 'Commerce Audience').length;
    const interestCount = segments.filter(s => s.segmentType === 'Interest').length;
    const activeCount = segments.filter(s => s.activelyGenerated).length;
    
    return {
      totalSegments: segments.length,
      commerceAudiences: commerceCount,
      interests: interestCount,
      activelyGenerated: activeCount,
      averageCPM: segments.reduce((sum, s) => sum + s.cpm, 0) / segments.length,
      tierDistribution: {
        tier1: segments.filter(s => s.tierNumber === 1).length,
        tier2: segments.filter(s => s.tierNumber === 2).length,
        tier3: segments.filter(s => s.tierNumber === 3).length,
        tier4: segments.filter(s => s.tierNumber === 4).length,
        tier5: segments.filter(s => s.tierNumber === 5).length,
        tier6: segments.filter(s => s.tierNumber === 6).length
      }
    };
  }

  // Helper methods for CSV parsing
  private parseCSVLine(line: string): string[] {
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

  private cleanString(value: string | undefined): string {
    return value?.replace(/^"|"$/g, '').trim() || '';
  }

  private toNumber(value: string | undefined): number | undefined {
    if (!value || value.trim() === '' || value.toLowerCase() === 'null') {
      return undefined;
    }
    const cleanValue = value.replace(/[",]/g, '');
    const num = parseFloat(cleanValue);
    return isNaN(num) ? undefined : num;
  }

  private toBoolean(value: string | undefined): boolean {
    return value?.trim().toLowerCase() === 'yes' || 
           value === '1' || 
           value?.toUpperCase() === 'TRUE';
  }
}

