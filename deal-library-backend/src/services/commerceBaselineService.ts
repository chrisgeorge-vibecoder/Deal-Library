/**
 * Commerce Baseline Service
 * 
 * Calculates demographic baseline for "typical online shoppers" by aggregating
 * commerce activity across ALL segments and finding the top ZIPs by total weight.
 * 
 * This provides a fair comparison baseline for individual segments, avoiding the
 * selection bias of comparing high-commerce ZIPs to the US national average.
 */

import { commerceAudienceService } from './commerceAudienceService';
import { CensusDataService } from './censusDataService';
import * as fs from 'fs';
import * as path from 'path';

interface CommerceBaseline {
  medianHHI: number;
  medianAge: number;
  educationBachelorsPlus: number;
  homeOwnership: number;
  avgHouseholdSize: number;
  homeValue: number;
  // NEW: Lifestyle metrics
  selfEmployed?: number;
  married?: number;
  dualIncome?: number;
  avgCommuteTime?: number;
  charitableGivers?: number;
  stemDegree?: number;
  // Meta
  calculatedAt: Date;
  zipCount: number;
  totalCommerceWeight: number;
}

export class CommerceBaselineService {
  private static instance: CommerceBaselineService | null = null;
  private baseline: CommerceBaseline | null = null;
  private lastCalculated: Date | null = null;
  private censusDataService: CensusDataService;
  private cacheFilePath: string;
  
  constructor() {
    this.censusDataService = CensusDataService.getInstance();
    this.cacheFilePath = path.join(__dirname, '../../data/commerce_baseline_cache.json');
    // Try to load from cache on initialization
    this.loadFromCache();
  }
  
  /**
   * Singleton pattern to ensure only one instance exists
   */
  public static getInstance(): CommerceBaselineService {
    if (!CommerceBaselineService.instance) {
      CommerceBaselineService.instance = new CommerceBaselineService();
    }
    return CommerceBaselineService.instance;
  }
  
  /**
   * Load baseline from persistent cache file
   */
  private loadFromCache(): void {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const data = JSON.parse(fs.readFileSync(this.cacheFilePath, 'utf-8'));
        this.baseline = {
          ...data,
          calculatedAt: new Date(data.calculatedAt)
        };
        this.lastCalculated = this.baseline.calculatedAt;
        console.log(`✅ Loaded commerce baseline from cache (calculated ${this.lastCalculated?.toLocaleString() || 'unknown'})`);
      }
    } catch (error) {
      console.error('⚠️  Failed to load commerce baseline cache:', error);
    }
  }
  
  /**
   * Save baseline to persistent cache file
   */
  private saveToCache(): void {
    try {
      if (this.baseline) {
        fs.writeFileSync(this.cacheFilePath, JSON.stringify(this.baseline, null, 2));
        console.log(`💾 Saved commerce baseline to cache`);
      }
    } catch (error) {
      console.error('⚠️  Failed to save commerce baseline cache:', error);
    }
  }
  
  /**
   * Get the commerce baseline, calculating if needed or cached value is stale
   */
  async getBaseline(): Promise<CommerceBaseline> {
    // Return cached baseline if calculated within last 7 days (increased from 24h)
    if (this.baseline && this.lastCalculated) {
      const hoursSinceCalculation = (Date.now() - this.lastCalculated.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCalculation < 168) { // 7 days = 168 hours
        console.log(`📊 Using cached commerce baseline (${hoursSinceCalculation.toFixed(1)}h old)`);
        return this.baseline;
      }
    }
    
    // Otherwise, calculate fresh baseline
    return this.calculateBaseline();
  }
  
  /**
   * Calculate commerce baseline from all segments
   * 
   * NEW METHODOLOGY: Instead of aggregating top ZIPs by total activity (which biases toward
   * wealthy multi-category urban areas), we calculate the MEDIAN of all segment medians.
   * This gives us the true "typical online shopper" baseline.
   */
  private async calculateBaseline(): Promise<CommerceBaseline> {
    console.log('📊 Calculating commerce audience baseline (SEGMENT MEDIAN approach)...');
    console.log('   This represents the median "online shopper" across all 196 segments');
    
    const startTime = Date.now();
    
    // Get all segment names
    const allSegments = commerceAudienceService.getAudienceSegments();
    console.log(`   Analyzing ${allSegments.length} commerce segments individually...`);
    
    // NEW APPROACH: Calculate median demographics for each segment, then find median of medians
    const segmentMedians: Array<{
      segment: string;
      income: number;
      education: number;
      age: number;
      homeOwnership: number;
      householdSize: number;
      homeValue: number;
      selfEmployed: number;
      married: number;
      dualIncome: number;
      commuteTime: number;
      charitableGivers: number;
      stemDegree: number;
    }> = [];
    
    let totalSegmentsProcessed = 0;
    
    for (const segment of allSegments) {
      // Get top 50 ZIPs for this segment (their primary markets)
      const segmentData = commerceAudienceService.searchZipCodesByAudience(
        segment.name,
        50  // Top 50 ZIPs
      );
      
      if (segmentData.length === 0) continue;
      
      // Get census data for these ZIPs
      const zipCodes = segmentData.map(z => z.zipCode);
      const censusDataArray = await this.censusDataService.getZipCodeData(zipCodes);
      const censusDataMap = new Map(censusDataArray.map(data => [data.zipCode, data]));
      
      // Filter to only ZIPs with valid census data (population > 0)
      const validZips = segmentData.filter(z => {
        const census = censusDataMap.get(z.zipCode);
        return census && census.population > 0;
      });
      
      if (validZips.length === 0) continue;
      
      // Calculate weighted averages for THIS segment
      let totalWeight = 0;
      let weightedIncome = 0;
      let weightedEducation = 0;
      let weightedAge = 0;
      let weightedHomeOwnership = 0;
      let weightedHouseholdSize = 0;
      let weightedHomeValue = 0;
      let weightedSelfEmployed = 0;
      let weightedMarried = 0;
      let weightedDualIncome = 0;
      let weightedCommuteTime = 0;
      let weightedCharitableGivers = 0;
      let weightedStemDegree = 0;
      
      validZips.forEach(zip => {
        const census = censusDataMap.get(zip.zipCode);
        if (!census) return;
        
        const weight = zip.weight;
        totalWeight += weight;
        
        weightedIncome += (census.economics?.householdIncome?.median || 0) * weight;
        weightedAge += (census.demographics?.ageMedian || 0) * weight;
        
        const education = (census.demographics?.education?.bachelorDegree || 0) + 
                         (census.demographics?.education?.graduateDegree || 0);
        weightedEducation += education * weight;
        
        weightedHomeOwnership += (census.geography?.housing?.ownerOccupiedRate || 0) * weight;
        weightedHouseholdSize += (census.demographics?.householdSize?.average || 0) * weight;
        weightedHomeValue += (census.geography?.housing?.medianHomeValue || 0) * weight;
        weightedSelfEmployed += (census.demographics?.lifestyle?.selfEmployed || 0) * weight;
        weightedMarried += (census.demographics?.lifestyle?.married || 0) * weight;
        weightedDualIncome += (census.demographics?.lifestyle?.dualIncome || 0) * weight;
        weightedCommuteTime += (census.demographics?.lifestyle?.commuteTime || 0) * weight;
        weightedCharitableGivers += (census.demographics?.lifestyle?.charitableGivers || 0) * weight;
        weightedStemDegree += (census.demographics?.lifestyle?.stemDegree || 0) * weight;
      });
      
      // Calculate median for this segment
      if (totalWeight > 0) {
        segmentMedians.push({
          segment: segment.name,
          income: weightedIncome / totalWeight,
          education: weightedEducation / totalWeight,
          age: weightedAge / totalWeight,
          homeOwnership: weightedHomeOwnership / totalWeight,
          householdSize: weightedHouseholdSize / totalWeight,
          homeValue: weightedHomeValue / totalWeight,
          selfEmployed: weightedSelfEmployed / totalWeight,
          married: weightedMarried / totalWeight,
          dualIncome: weightedDualIncome / totalWeight,
          commuteTime: weightedCommuteTime / totalWeight,
          charitableGivers: weightedCharitableGivers / totalWeight,
          stemDegree: weightedStemDegree / totalWeight
        });
      }
      
      totalSegmentsProcessed++;
      
      // Log progress every 50 segments
      if (totalSegmentsProcessed % 50 === 0) {
        console.log(`   Progress: ${totalSegmentsProcessed}/${allSegments.length} segments analyzed`);
      }
    }
    
    console.log(`   ✅ Calculated medians for ${segmentMedians.length} segments`);
    
    // Calculate MEDIAN of all segment medians (true baseline!)
    const sortedIncomes = segmentMedians.map(s => s.income).sort((a, b) => a - b);
    const sortedEducation = segmentMedians.map(s => s.education).sort((a, b) => a - b);
    const sortedAge = segmentMedians.map(s => s.age).sort((a, b) => a - b);
    const sortedHomeOwnership = segmentMedians.map(s => s.homeOwnership).sort((a, b) => a - b);
    const sortedHouseholdSize = segmentMedians.map(s => s.householdSize).sort((a, b) => a - b);
    const sortedHomeValue = segmentMedians.map(s => s.homeValue).sort((a, b) => a - b);
    const sortedSelfEmployed = segmentMedians.map(s => s.selfEmployed).sort((a, b) => a - b);
    const sortedMarried = segmentMedians.map(s => s.married).sort((a, b) => a - b);
    const sortedDualIncome = segmentMedians.map(s => s.dualIncome).sort((a, b) => a - b);
    const sortedCommuteTime = segmentMedians.map(s => s.commuteTime).sort((a, b) => a - b);
    const sortedCharitableGivers = segmentMedians.map(s => s.charitableGivers).sort((a, b) => a - b);
    const sortedStemDegree = segmentMedians.map(s => s.stemDegree).sort((a, b) => a - b);
    
    const getMedian = (arr: number[]) => {
      if (arr.length === 0) return 0;
      const mid = Math.floor(arr.length / 2);
      return arr.length % 2 === 0 
        ? ((arr[mid - 1] || 0) + (arr[mid] || 0)) / 2 
        : (arr[mid] || 0);
    };
    
    // Calculate final baseline values as MEDIAN of segment medians
    this.baseline = {
      medianHHI: Math.round(getMedian(sortedIncomes)),
      medianAge: Math.round(getMedian(sortedAge) * 10) / 10,
      educationBachelorsPlus: Math.round(getMedian(sortedEducation) * 10) / 10,
      homeOwnership: Math.round(getMedian(sortedHomeOwnership) * 10) / 10,
      avgHouseholdSize: Math.round(getMedian(sortedHouseholdSize) * 10) / 10,
      homeValue: Math.round(getMedian(sortedHomeValue)),
      // Lifestyle metrics
      selfEmployed: Math.round(getMedian(sortedSelfEmployed) * 10) / 10,
      married: Math.round(getMedian(sortedMarried) * 10) / 10,
      dualIncome: Math.round(getMedian(sortedDualIncome) * 10) / 10,
      avgCommuteTime: Math.round(getMedian(sortedCommuteTime) * 10) / 10,
      charitableGivers: Math.round(getMedian(sortedCharitableGivers) * 10) / 10,
      stemDegree: Math.round(getMedian(sortedStemDegree) * 10) / 10,
      // Meta
      calculatedAt: new Date(),
      zipCount: segmentMedians.length,
      totalCommerceWeight: 0  // Not applicable with new methodology
    };
    
    this.lastCalculated = new Date();
    
    // Save to persistent cache
    this.saveToCache();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('✅ Commerce baseline calculated successfully (SEGMENT MEDIAN approach)');
    console.log(`   Method: Median of ${segmentMedians.length} segment medians`);
    console.log(`   `);
    console.log(`   📊 BASELINE VALUES (Median "Online Shopper"):`);
    console.log(`      Income: $${this.baseline.medianHHI.toLocaleString()}`);
    console.log(`         Range: $${(sortedIncomes[0] || 0).toFixed(0)} - $${(sortedIncomes[sortedIncomes.length - 1] || 0).toFixed(0)}`);
    console.log(`      Education: ${this.baseline.educationBachelorsPlus}%`);
    console.log(`         Range: ${(sortedEducation[0] || 0).toFixed(1)}% - ${(sortedEducation[sortedEducation.length - 1] || 0).toFixed(1)}%`);
    console.log(`      Age: ${this.baseline.medianAge} years`);
    console.log(`      Home Ownership: ${this.baseline.homeOwnership}%`);
    console.log(`      Household Size: ${this.baseline.avgHouseholdSize} people`);
    console.log(`      Home Value: $${this.baseline.homeValue.toLocaleString()}`);
    console.log(`   `);
    console.log(`   🆕 LIFESTYLE BASELINE:`);
    console.log(`      Self-Employed: ${this.baseline.selfEmployed}%`);
    console.log(`      Married: ${this.baseline.married}%`);
    console.log(`      Dual Income: ${this.baseline.dualIncome}%`);
    console.log(`      Avg Commute: ${this.baseline.avgCommuteTime} min`);
    console.log(`      Charitable: ${this.baseline.charitableGivers}%`);
    console.log(`      STEM: ${this.baseline.stemDegree}%`);
    console.log(`   `);
    console.log(`   ⏱️  Calculation time: ${duration}s`);
    
    return this.baseline;
  }
  
  /**
   * Force recalculation of baseline (useful for testing or data updates)
   */
  async recalculate(): Promise<CommerceBaseline> {
    console.log('🔄 Force recalculating commerce baseline...');
    this.baseline = null;
    this.lastCalculated = null;
    return this.calculateBaseline();
  }
  
  /**
   * Get baseline info without recalculating
   */
  getBaselineInfo(): { exists: boolean; age?: string; baseline?: CommerceBaseline } {
    if (!this.baseline || !this.lastCalculated) {
      return { exists: false };
    }
    
    const hoursSinceCalculation = (Date.now() - this.lastCalculated.getTime()) / (1000 * 60 * 60);
    const age = hoursSinceCalculation < 1 
      ? `${Math.round(hoursSinceCalculation * 60)} minutes`
      : `${hoursSinceCalculation.toFixed(1)} hours`;
    
    return {
      exists: true,
      age,
      baseline: this.baseline
    };
  }
}

// Export singleton instance
export const commerceBaselineService = CommerceBaselineService.getInstance();

