import { commerceAudienceService } from './commerceAudienceService';
import { CensusDataService } from './censusDataService';
import { GeminiService } from './geminiService';
import { commerceBaselineService } from './commerceBaselineService';
import { SupabaseService } from './supabaseService';
import * as fs from 'fs';
import * as path from 'path';

interface AudienceInsightsReport {
  segment: string;
  category: string;
  executiveSummary: string;
  personaName: string;  // AI-generated persona name
  personaEmoji: string;  // Emoji for category
  personaDescription?: string;  // AI-generated visual persona description
  keyMetrics: {
    medianHHI: number;
    medianHHIvsNational: number;
    medianHHIvsCommerce: number;  // NEW: vs commerce baseline
    topAgeBracket: string;
    educationLevel: number;
    educationVsNational: number;
    educationVsCommerce: number;  // NEW: vs commerce baseline
  };
  geographicHotspots: Array<{
    zipCode: string;
    city: string;
    state: string;
    density: number;
  }>;
  demographics: {
    incomeDistribution: Array<{ bracket: string; percentage: number; nationalAvg: number }>;
    educationLevels: Array<{ level: string; percentage: number }>;
    ageDistribution: Array<{ bracket: string; percentage: number }>;
    // Additional Census data
    ethnicity?: {
      white: number;
      black: number;
      hispanic: number;
      asian: number;
    };
    lifestyle?: {
      selfEmployed: number;
      married: number;
      dualIncome: number;
      avgCommuteTime: number;
      charitableGivers: number;
      stemDegree: number;
    };
    medianHomeValue?: number;
    homeOwnership?: number;
    avgHouseholdSize?: number;
    urbanRuralDistribution?: Array<{ type: string; percentage: number }>;
  };
  behavioralOverlap: Array<{
    segment: string;
    overlapPercentage: number;
    insight: string;
    overIndex?: number;
    topMarkets?: Array<{city: string; state: string; overIndex: number; descriptor?: string}>;
  }>;
  strategicInsights: {
    targetPersona: string;
    messagingRecommendations: string[];
    channelRecommendations: string[];
  };
}

class AudienceInsightsService {
  private censusDataService: CensusDataService;
  private geminiService: GeminiService | null = null;
  private overlapsCache: Map<string, any[]> | null = null;
  private overIndexCache: Map<string, any> = new Map(); // Cache for over-indexing calculations
  private aiResponseCache: Map<string, any> = new Map(); // Cache for AI responses
  private overlapsFilePath: string;
  private reportCache: Map<string, { report: AudienceInsightsReport; timestamp: number }> = new Map(); // Cache for generated reports
  private reportCacheTimeout: number = 1000 * 60 * 60; // 1 hour cache
  private useSupabase: boolean;
  
  constructor() {
    // Use singleton instance to share loaded census data across requests
    this.censusDataService = CensusDataService.getInstance();
    this.overlapsFilePath = path.join(__dirname, '../../data/199_Audience_Overlap_Data.csv');
    this.useSupabase = process.env.USE_SUPABASE === 'true';
    
    // Try to load pre-calculated overlaps from CSV
    this.loadOverlapsCache();
    
    // Don't initialize Gemini in constructor - it will be lazy-loaded when first needed
    
    console.log('🚀 AudienceInsightsService: Constructor called - updated code is running!');
    
    if (this.useSupabase) {
      console.log('💾 AudienceInsightsService: Supabase caching enabled');
    }
  }
  
  /**
   * Get or initialize Gemini service (lazy loading)
   */
  private getGeminiService(): GeminiService | null {
    if (this.geminiService === null) {
      try {
        // Initialize Gemini with Supabase if available for RAG support
        const supabase = process.env.USE_SUPABASE === 'true' ? require('./supabaseService').SupabaseService.getClient() : null;
        this.geminiService = new GeminiService(supabase);
        console.log('✅ Gemini service initialized for Audience Insights');
      } catch (error) {
        console.warn('⚠️  Gemini service not available - will use fallback insights');
        return null;
      }
    }
    return this.geminiService;
  }
  
  /**
   * Load pre-calculated overlaps from CSV file (user-level overlap data)
   */
  private loadOverlapsCache(): void {
    try {
      if (fs.existsSync(this.overlapsFilePath)) {
        console.log(`📊 Loading user-level overlap data from CSV: ${this.overlapsFilePath}`);
        
        const csvContent = fs.readFileSync(this.overlapsFilePath, 'utf-8');
        const lines = csvContent.split('\n');
        
        // Build a map: segment -> array of overlaps
        this.overlapsCache = new Map();
        
        let currentSegment: string | null = null;
        let overlapCount = 0;
        
        for (const line of lines) {
          const parts = line.split(',').map(p => p.trim());
          
          if (parts.length >= 3) {
            const section = parts[0];
            const field = parts[1];
            const value = parts[2];
            
            // Track current segment
            if (field === 'Segment Name' && value && value !== '[Brief description of the audience\'s primary product affinity.]') {
              currentSegment = value;
              if (!this.overlapsCache.has(currentSegment)) {
                this.overlapsCache.set(currentSegment, []);
              }
            }
            
            // Extract overlap data from "Top Overlap" rows
            if (currentSegment && field && field.startsWith('Top Overlap') && value && value.includes('(') && value.includes('%')) {
              try {
                // Parse "Oral Care (24%)" format
                const namePart = value.split('(')[0];
                const pctPart = value.split('(')[1]?.split(')')[0];
                
                if (!namePart || !pctPart) continue;
                
                const name = namePart.trim();
                const pctStr = pctPart.trim().replace('%', '');
                const percentage = parseFloat(pctStr);
                
                // Only add valid overlap data (not template placeholders)
                if (name && !isNaN(percentage) && !name.startsWith('[')) {
                  const existingOverlaps = this.overlapsCache.get(currentSegment)!;
                  // Check for duplicates - if segment already exists, keep the higher percentage
                  const existingIndex = existingOverlaps.findIndex(o => o.segment === name);
                  
                  if (existingIndex >= 0) {
                    // Update if new percentage is higher
                    if (percentage > existingOverlaps[existingIndex].overlapPercentage) {
                      existingOverlaps[existingIndex].overlapPercentage = percentage;
                      console.log(`   🔄 Updated duplicate: ${currentSegment} → ${name} (kept ${percentage}%)`);
                    }
                  } else {
                    // Add new overlap
                    existingOverlaps.push({
                      segment: name,
                      overlapPercentage: percentage
                    });
                    overlapCount++;
                  }
                }
              } catch (e) {
                // Skip malformed rows
              }
            }
          }
        }
        
        console.log(`✅ Loaded user-level overlap data from CSV`);
        console.log(`   📊 ${this.overlapsCache.size} segments with overlap data`);
        console.log(`   🔗 ${overlapCount} total overlap relationships`);
        
        // Show sample to verify data quality
        if (this.overlapsCache.has('Coffee')) {
          const coffeeOverlaps = this.overlapsCache.get('Coffee')!;
          console.log(`   ☕ Coffee overlaps: ${coffeeOverlaps.slice(0, 3).map(o => `${o.segment} (${o.overlapPercentage}%)`).join(', ')}`);
        }
      } else {
        console.log(`⚠️  Overlap CSV not found at: ${this.overlapsFilePath}`);
        this.overlapsCache = null;
      }
    } catch (error) {
      console.error('❌ Error loading overlaps from CSV:', error);
      this.overlapsCache = null;
    }
  }
  
  /**
   * Generate comprehensive audience insights report
   */
  async generateReport(segment: string, category?: string, includeCommercialZips: boolean = false): Promise<AudienceInsightsReport> {
    const startTime = Date.now();
    
    // Check cache first (Supabase or in-memory)
    const cacheKey = `${segment}|${category}|${includeCommercialZips}`;
    
    if (this.useSupabase) {
      const cachedReport = await this.getFromSupabaseCache(cacheKey);
      if (cachedReport) {
        console.log(`💨 Returning cached report from Supabase for "${segment}"`);
        return cachedReport;
      }
    } else {
      const cached = this.reportCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < this.reportCacheTimeout)) {
        console.log(`💨 Returning cached report for "${segment}" (${((Date.now() - cached.timestamp) / 1000 / 60).toFixed(1)} minutes old)`);
        return cached.report;
      }
    }
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎯 Generating Audience Insights Report for: "${segment}"`);
    console.log(`   Include Commercial ZIPs: ${includeCommercialZips ? 'YES' : 'NO (residential only)'}`);
    console.log(`${'='.repeat(80)}\n`);

    // Step 0: Get commerce baseline for comparison
    let stepStart = Date.now();
    const commerceBaseline = await commerceBaselineService.getBaseline();
    console.log(`📊 Commerce baseline: $${commerceBaseline.medianHHI.toLocaleString()}, ${commerceBaseline.educationBachelorsPlus}% edu (${Date.now() - stepStart}ms)`);

    // Step 1: Get top geographic concentration
    stepStart = Date.now();
    const topZipCodes = await this.getTopGeographicConcentration(segment, 50, includeCommercialZips);
    console.log(`📍 Found ${topZipCodes.length} high-concentration ZIP codes (${Date.now() - stepStart}ms)`);

    // Step 2: Aggregate demographics from census data
    stepStart = Date.now();
    const demographics = await this.aggregateDemographics(topZipCodes);
    console.log(`📊 Aggregated demographics for ${demographics.validZipCount} ZIPs (${Date.now() - stepStart}ms)`);
    
    // Step 2.5: Extract geographic intelligence
    stepStart = Date.now();
    const geoIntelligence = this.extractGeographicIntelligence(topZipCodes);
    console.log(`🗺️  Identified top markets: ${geoIntelligence.topCities.slice(0, 3).map(c => c.city).join(', ')} (${Date.now() - stepStart}ms)`);

    // Step 3: Calculate behavioral overlaps
    stepStart = Date.now();
    const overlaps = await this.calculateBehavioralOverlaps(segment);
    console.log(`🔗 Identified ${overlaps.length} overlapping segments (${Date.now() - stepStart}ms)`);
    
    // Step 3.5: Calculate commerce baseline comparisons
    console.log(`🔍 DEBUG: commerceBaseline values:`, {
      medianHHI: commerceBaseline?.medianHHI,
      educationBachelorsPlus: commerceBaseline?.educationBachelorsPlus,
      demographicsMedianHHI: demographics.medianHHI,
      demographicsEducation: demographics.educationBachelors
    });
    
    const medianHHIvsCommerce = commerceBaseline?.medianHHI ? ((demographics.medianHHI / commerceBaseline.medianHHI) - 1) * 100 : null;
    const educationVsCommerce = commerceBaseline?.educationBachelorsPlus ? ((demographics.educationBachelors / commerceBaseline.educationBachelorsPlus) - 1) * 100 : null;
    console.log(`📊 vs Commerce: Income ${medianHHIvsCommerce !== null ? (medianHHIvsCommerce > 0 ? '+' : '') + medianHHIvsCommerce.toFixed(1) + '%' : 'N/A'}, Education ${educationVsCommerce !== null ? (educationVsCommerce > 0 ? '+' : '') + educationVsCommerce.toFixed(1) + '%' : 'N/A'}`);

    // Step 4: Generate strategic insights with Gemini
    stepStart = Date.now();
    const strategicInsights = await this.generateStrategicInsights(
      segment,
      category || 'General',
      demographics,
      overlaps,
      geoIntelligence,
      commerceBaseline  // Pass baseline to Gemini
    );
    console.log(`✨ Generated strategic insights with Gemini (${Date.now() - stepStart}ms)`);

    // Step 5: Generate executive summary with Gemini
    stepStart = Date.now();
    const executiveSummary = await this.generateExecutiveSummary(
      segment,
      demographics,
      overlaps,
      geoIntelligence,
      commerceBaseline  // Pass baseline to Gemini
    );
    console.log(`📝 Generated executive summary (${Date.now() - stepStart}ms)\n`);
    
    // Generate AI-powered persona with visual description
    stepStart = Date.now();
    const personaResult = await this.generateAIPersona(segment, category || 'General', demographics, overlaps, geoIntelligence, commerceBaseline);
    console.log(`👤 Generated AI persona: "${personaResult.name}" ${personaResult.emoji} (${Date.now() - stepStart}ms)`);

    // Compile final report
    const report: AudienceInsightsReport = {
      segment,
      category: category || 'General',
      executiveSummary,
      personaName: personaResult.name,
      personaEmoji: personaResult.emoji,
      personaDescription: personaResult.description,  // NEW: Visual persona description
      keyMetrics: {
        medianHHI: demographics.medianHHI,
        medianHHIvsNational: demographics.medianHHIvsNational,
        medianHHIvsCommerce: medianHHIvsCommerce ?? 0,  // NEW - default to 0 if null
        topAgeBracket: demographics.topAgeBracket,
        educationLevel: demographics.educationBachelors,
        educationVsNational: demographics.educationVsNational,
        educationVsCommerce: educationVsCommerce ?? 0,  // NEW - default to 0 if null
      },
      geographicHotspots: topZipCodes.map((zip, index) => ({
        zipCode: zip.zipCode,
        city: zip.city || 'Unknown',
        state: zip.state || 'Unknown',
        density: zip.weight,
        population: zip.population,  // ADD: population from census data
        overIndex: zip.overIndex     // ADD: over-index calculation
      })),
      demographics: {
        incomeDistribution: demographics.incomeDistribution,
        educationLevels: demographics.educationLevels,
        ageDistribution: demographics.ageDistribution,
        // Additional Census data
        ethnicity: demographics.ethnicity,
        lifestyle: demographics.lifestyle,
        medianHomeValue: demographics.medianHomeValue,
        homeOwnership: demographics.homeOwnership,
        avgHouseholdSize: demographics.avgHouseholdSize,
        urbanRuralDistribution: demographics.urbanRuralDistribution,
      },
      behavioralOverlap: overlaps,
      strategicInsights,
    };

    // Cache the report (Supabase or in-memory)
    if (this.useSupabase) {
      await this.saveToSupabaseCache(cacheKey, segment, category || 'General', report);
    } else {
      this.reportCache.set(cacheKey, { report, timestamp: Date.now() });
    }
    console.log(`💾 Report cached for "${segment}"`);
    console.log(`⏱️  TOTAL REPORT GENERATION TIME: ${((Date.now() - startTime) / 1000).toFixed(2)}s\n`);

    return report;
  }

  /**
   * Get recommended deals for a segment using simple keyword matching
   */
  async getRecommendedDeals(segment: string, category?: string, allDeals?: any[]): Promise<any[]> {
    if (!allDeals || allDeals.length === 0) {
      console.log('⚠️  No deals available for matching');
      return [];
    }

    const segmentLower = segment.toLowerCase();
    const categoryLower = (category || '').toLowerCase();
    
    // Create keyword list from segment and category
    const keywords = [
      ...segmentLower.split(/[\s&]+/),
      ...categoryLower.split(/[\s&,]+/)
    ].filter(k => k.length > 2); // Filter out short words like "to", "of", etc.

    console.log(`🔍 Matching deals for "${segment}" using keywords: ${keywords.join(', ')}`);

    // Score each deal based on keyword matches
    const scoredDeals = allDeals.map(deal => {
      const dealText = `${deal.dealName || ''} ${deal.description || ''} ${deal.audienceSegment || ''} ${deal.category || ''}`.toLowerCase();
      
      let score = 0;
      
      // Exact segment name match = high score
      if (dealText.includes(segmentLower)) {
        score += 10;
      }
      
      // Category match = medium score
      if (category && dealText.includes(categoryLower)) {
        score += 5;
      }
      
      // Keyword matches = lower score
      keywords.forEach(keyword => {
        if (dealText.includes(keyword)) {
          score += 1;
        }
      });
      
      return { deal, score };
    });

    // Return top 3 deals with score > 0
    const topDeals = scoredDeals
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.deal);

    console.log(`✅ Found ${topDeals.length} matching deals for "${segment}"`);
    topDeals.forEach((deal, i) => {
      console.log(`   ${i + 1}. ${deal.dealName}`);
    });

    return topDeals;
  }

  /**
   * Get top ZIP codes by audience concentration
   */
  private async getTopGeographicConcentration(
    segment: string, 
    limit: number = 50, 
    includeCommercialZips: boolean = false
  ): Promise<Array<{
    zipCode: string;
    weight: number;
    city?: string;
    state?: string;
    population?: number;
    overIndex?: number;
    penetration?: number;
  }>> {
    console.log(`🔍 Getting top geo concentration for: "${segment}"`);
    
    const audienceData = commerceAudienceService.searchZipCodesByAudience(segment, limit * 2); // Get more to account for filtering
    
    if (!audienceData || audienceData.length === 0) {
      console.log(`⚠️  No audience data found for segment: "${segment}"`);
      return [];
    }

    console.log(`📊 Found ${audienceData.length} ZIP codes for "${segment}"`);
    
    // Sort by weight (descending) and take top N
    const topZips = audienceData
      .sort((a: any, b: any) => b.weight - a.weight)
      .slice(0, limit);

    // Calculate total weight for this segment (for national baseline)
    const totalSegmentWeight = audienceData.reduce((sum: number, item: any) => sum + item.weight, 0);
    const estimatedUSPopulation = 330000000; // US population for baseline calculation
    const nationalPenetration = totalSegmentWeight / estimatedUSPopulation;
    
    console.log(`📈 Segment baseline: ${totalSegmentWeight.toLocaleString()} total weight, ${(nationalPenetration * 1000).toFixed(3)} per 1000 people nationally`);

    // Enrich with census data for city/state AND calculate over-index
    const zipCodes = topZips.map((item: any) => item.zipCode);
    const censusDataArray = await this.censusDataService.getZipCodeData(zipCodes);
    const censusDataMap = new Map(censusDataArray.map(data => [data.zipCode, data]));
    
    // Filter to only include ZIPs that have census data (true ZCTAs)
    // This removes non-ZCTA ZIPs like P.O. boxes, military bases, etc.
    let validTopZips = topZips.filter((item: any) => censusDataMap.has(item.zipCode));
    
    console.log(`🏘️  Filtered to ${validTopZips.length} true ZCTA ZIPs (removed ${topZips.length - validTopZips.length} non-ZCTAs like P.O. boxes)`);
    
    // Filter out downtown commercial ZIPs if not requested
    if (!includeCommercialZips) {
      const beforeFilter = validTopZips.length;
      validTopZips = validTopZips.filter((item: any) => {
        const census = censusDataMap.get(item.zipCode);
        const population = census?.population || 0;
        return population >= 10000;  // Exclude ZIPs with < 10k population (likely downtown commercial)
      });
      const filtered = beforeFilter - validTopZips.length;
      if (filtered > 0) {
        console.log(`🏢 Filtered out ${filtered} downtown commercial ZIPs (population < 10k)`);
      }
    }
    
    const enrichedZips = validTopZips.map((item: any) => {
      const censusData = censusDataMap.get(item.zipCode);
      const population = censusData?.population || 0;
      
      // Calculate over-index score (only if population > 0)
      let overIndex = undefined;
      let penetration = undefined;
      
      if (population > 0 && nationalPenetration > 0) {
        penetration = item.weight / population;  // Weight per capita for this ZIP
        overIndex = (penetration / nationalPenetration) * 100;  // Index vs national average
      }
      
      return {
        zipCode: item.zipCode,
        weight: item.weight,
        city: censusData?.geography?.city || undefined,
        state: censusData?.geography?.state || undefined,
        population,
        overIndex,
        penetration
      };
    });
    
    // Log how many ZIPs have missing city/state data
    const missingCityState = enrichedZips.filter(z => !z.city || !z.state).length;
    if (missingCityState > 0) {
      console.log(`   ⚠️  ${missingCityState} ZIPs missing city/state data (likely zero population in census)`);
    }
    
    // Log over-indexing insights
    const zipsWithOverIndex = enrichedZips.filter(z => z.overIndex !== undefined);
    if (zipsWithOverIndex.length > 0) {
      const topOverIndexZips = zipsWithOverIndex
        .sort((a, b) => (b.overIndex || 0) - (a.overIndex || 0))
        .slice(0, 5);
      
      console.log(`📊 Over-indexing insights (top 5 by penetration):`);
      topOverIndexZips.forEach((zip, i) => {
        console.log(`   ${i + 1}. ${zip.zipCode} (${zip.city}, ${zip.state}): ${zip.overIndex?.toFixed(0)}% over-index (weight: ${zip.weight.toLocaleString()}, pop: ${zip.population?.toLocaleString()})`);
      });
    }

    console.log(`✅ Returning ${enrichedZips.length} ZIP codes`);
    if (enrichedZips.length > 0 && enrichedZips[0]) {
      console.log(`   #1 by volume: ${enrichedZips[0].zipCode} (${enrichedZips[0].city}, ${enrichedZips[0].state}) - weight: ${enrichedZips[0].weight.toLocaleString()}${enrichedZips[0].overIndex ? `, ${enrichedZips[0].overIndex.toFixed(0)}% over-index` : ''}`);
    }

    return enrichedZips;
  }

  /**
   * Aggregate demographics across top ZIP codes
   */
  private async aggregateDemographics(topZips: Array<{ zipCode: string; weight: number }>) {
    console.log(`📊 Aggregating demographics for ${topZips.length} ZIP codes`);

    // Get national averages for benchmarking (hardcoded for now)
    const nationalAvg = {
      medianHouseholdIncome: 70420,
      medianHomeValue: 300000,
      medianAge: 38.5,
      educationBachelors: 35,
      homeOwnership: 65,
      marriedRate: 48,
      avgHouseholdSize: 2.5,
      childrenInHousehold: 32,
      selfEmployed: 6,
      laborForceParticipation: 63
    };

    // Fetch census data for all ZIPs at once
    const zipCodes = topZips.map(item => item.zipCode);
    const censusDataArray = await this.censusDataService.getZipCodeData(zipCodes);
    const censusDataMap = new Map(censusDataArray.map(data => [data.zipCode, data]));

    let totalWeight = 0;
    let weightedIncome = 0;
    let weightedAge = 0;
    let weightedEducation = 0;
    let weightedHomeValue = 0;
    let weightedHomeOwnership = 0;
    let weightedHouseholdSize = 0;
    let weightedWhite = 0;
    let weightedHispanic = 0;
    let weightedAsian = 0;
    let weightedBlack = 0;
    let validZipCount = 0;

    const ageBuckets: Record<string, number> = {};
    const incomeBuckets: Record<string, number> = {};
    const educationBuckets: Record<string, number> = {};
    const urbanRuralBuckets: Record<string, number> = {};
    
    // NEW: Track weighted age distribution by decade
    let weightedAge0to9 = 0;
    let weightedAge10to19 = 0;
    let weightedAge20to29 = 0;
    let weightedAge30to39 = 0;
    let weightedAge40to49 = 0;
    let weightedAge50to59 = 0;
    let weightedAge60to69 = 0;
    let weightedAge70plus = 0;
    
    // NEW: Track lifestyle metrics
    let weightedSelfEmployed = 0;
    let weightedMarried = 0;
    let weightedDualIncome = 0;
    let weightedCommuteTime = 0;
    let weightedCharitableGivers = 0;
    let weightedStemDegree = 0;
    
    // Track family and employment patterns
    let zipsWith50kPlus = 0;
    let zipsWith100kPlus = 0;
    let zipsWith150kPlus = 0;
    let zipsWithChildren = 0;
    let zipsUrban = 0;
    let zipsSuburban = 0;
    let zipsRural = 0;

    // Aggregate weighted demographics
    topZips.forEach(item => {
      const census = censusDataMap.get(item.zipCode);
      
      if (census && census.population > 0) {
        validZipCount++;
        const weight = item.weight;
        totalWeight += weight;

        // Weighted averages - EXPANDED
        const income = census.economics?.householdIncome?.median || nationalAvg.medianHouseholdIncome;
        const homeValue = census.geography?.housing?.medianHomeValue || nationalAvg.medianHomeValue;
        const homeOwnership = census.geography?.housing?.ownerOccupiedRate || nationalAvg.homeOwnership;
        const age = census.demographics?.ageMedian || nationalAvg.medianAge;
        
        // FIX: Education should include BOTH bachelor's AND graduate degrees
        const bachelorsDegree = census.demographics?.education?.bachelorDegree || 0;
        const graduateDegree = census.demographics?.education?.graduateDegree || 0;
        const education = bachelorsDegree + graduateDegree || nationalAvg.educationBachelors;
        
        const householdSize = census.demographics?.householdSize?.average || nationalAvg.avgHouseholdSize;
        
        weightedIncome += income * weight;
        weightedAge += age * weight;
        weightedEducation += education * weight;
        weightedHomeValue += homeValue * weight;
        weightedHomeOwnership += homeOwnership * weight;
        weightedHouseholdSize += householdSize * weight;
        
        // Ethnicity tracking
        weightedWhite += (census.demographics?.ethnicity?.white || 0) * weight;
        weightedHispanic += (census.demographics?.ethnicity?.hispanic || 0) * weight;
        weightedAsian += (census.demographics?.ethnicity?.asian || 0) * weight;
        weightedBlack += (census.demographics?.ethnicity?.black || 0) * weight;
        
        // Age distribution tracking - convert census brackets to 10-year decades
        const censusAge = census.demographics?.ageDistribution;
        if (censusAge) {
          // Census has: under18, age18to24, age25to44, age45to64, age65plus
          // Convert to decades:
          weightedAge0to9 += (censusAge.under18 * 0.56) * weight; // ~56% of under-18 is 0-9
          weightedAge10to19 += ((censusAge.under18 * 0.44) + (censusAge.age18to24 * 0.29)) * weight; // 44% of under-18 (10-17) + 29% of 18-24 (18-19)
          weightedAge20to29 += ((censusAge.age18to24 * 0.71) + (censusAge.age25to44 * 0.26)) * weight; // 71% of 18-24 (20-24) + 26% of 25-44 (25-29)
          weightedAge30to39 += (censusAge.age25to44 * 0.53) * weight; // 53% of 25-44 is 30-39
          weightedAge40to49 += ((censusAge.age25to44 * 0.21) + (censusAge.age45to64 * 0.48)) * weight; // 21% of 25-44 (40-44) + 48% of 45-64 (45-49)
          weightedAge50to59 += (censusAge.age45to64 * 0.52) * weight; // 52% of 45-64 is 50-59
          weightedAge60to69 += (censusAge.age65plus * 0.45) * weight; // ~45% of 65+ is 60-69
          weightedAge70plus += (censusAge.age65plus * 0.55) * weight; // ~55% of 65+ is 70+
        }
        
        // NEW: Lifestyle tracking
        weightedSelfEmployed += (census.demographics?.lifestyle?.selfEmployed || 0) * weight;
        weightedMarried += (census.demographics?.lifestyle?.married || 0) * weight;
        weightedDualIncome += (census.demographics?.lifestyle?.dualIncome || 0) * weight;
        weightedCommuteTime += (census.demographics?.lifestyle?.commuteTime || 0) * weight;
        weightedCharitableGivers += (census.demographics?.lifestyle?.charitableGivers || 0) * weight;
        weightedStemDegree += (census.demographics?.lifestyle?.stemDegree || 0) * weight;
        
        // Track income thresholds
        if (income >= 50000) zipsWith50kPlus++;
        if (income >= 100000) zipsWith100kPlus++;
        if (income >= 150000) zipsWith150kPlus++;
        
        // Track family presence (household size > 2.5 suggests children)
        if (householdSize > 2.5) zipsWithChildren++;
        
        // Track urbanicity
        const urbanRural = census.geography?.urbanRural || 'suburban';
        if (urbanRural === 'urban') zipsUrban++;
        else if (urbanRural === 'suburban') zipsSuburban++;
        else zipsRural++;
        urbanRuralBuckets[urbanRural] = (urbanRuralBuckets[urbanRural] || 0) + weight;

        // Bucket age (use already-declared variable)
        let ageBracket = '';
        if (age < 30) ageBracket = 'Under 30';
        else if (age < 40) ageBracket = '30-39';
        else if (age < 50) ageBracket = '40-49';
        else if (age < 60) ageBracket = '50-59';
        else ageBracket = '60+';
        ageBuckets[ageBracket] = (ageBuckets[ageBracket] || 0) + weight;

        // Bucket income (use already-declared variable)
        let incomeBracket = '';
        if (income < 50000) incomeBracket = 'Under $50k';
        else if (income < 75000) incomeBracket = '$50k-$75k';
        else if (income < 100000) incomeBracket = '$75k-$100k';
        else if (income < 150000) incomeBracket = '$100k-$150k';
        else incomeBracket = '$150k+';
        incomeBuckets[incomeBracket] = (incomeBuckets[incomeBracket] || 0) + weight;

        // Bucket education (use already-declared variable)
        let educationBracket = '';
        if (education < 20) educationBracket = 'High School or Less';
        else if (education < 30) educationBracket = 'Some College';
        else if (education < 40) educationBracket = 'Bachelor\'s Degree';
        else educationBracket = 'Graduate Degree';
        educationBuckets[educationBracket] = (educationBuckets[educationBracket] || 0) + weight;
      }
    });

    // Calculate final weighted averages
    const medianHHI = totalWeight > 0 ? weightedIncome / totalWeight : nationalAvg.medianHouseholdIncome;
    const medianAge = totalWeight > 0 ? weightedAge / totalWeight : nationalAvg.medianAge;
    const educationBachelors = totalWeight > 0 ? weightedEducation / totalWeight : nationalAvg.educationBachelors;
    const medianHomeValue = totalWeight > 0 ? weightedHomeValue / totalWeight : nationalAvg.medianHomeValue;
    const homeOwnership = totalWeight > 0 ? weightedHomeOwnership / totalWeight : nationalAvg.homeOwnership;
    const avgHouseholdSize = totalWeight > 0 ? weightedHouseholdSize / totalWeight : nationalAvg.avgHouseholdSize;
    
    // Ethnicity percentages
    const whitePercent = totalWeight > 0 ? (weightedWhite / totalWeight) : 60;
    const hispanicPercent = totalWeight > 0 ? (weightedHispanic / totalWeight) : 18;
    const asianPercent = totalWeight > 0 ? (weightedAsian / totalWeight) : 6;
    const blackPercent = totalWeight > 0 ? (weightedBlack / totalWeight) : 13;
    
    // NEW: Lifestyle percentages
    const selfEmployed = totalWeight > 0 ? (weightedSelfEmployed / totalWeight) : 0;
    const married = totalWeight > 0 ? (weightedMarried / totalWeight) : 0;
    const dualIncome = totalWeight > 0 ? (weightedDualIncome / totalWeight) : 0;
    const avgCommuteTime = totalWeight > 0 ? (weightedCommuteTime / totalWeight) : 0;
    const charitableGivers = totalWeight > 0 ? (weightedCharitableGivers / totalWeight) : 0;
    const stemDegree = totalWeight > 0 ? (weightedStemDegree / totalWeight) : 0;

    // Calculate vs national percentages
    const medianHHIvsNational = ((medianHHI - nationalAvg.medianHouseholdIncome) / nationalAvg.medianHouseholdIncome) * 100;
    const educationVsNational = ((educationBachelors - nationalAvg.educationBachelors) / nationalAvg.educationBachelors) * 100;
    const homeValueVsNational = ((medianHomeValue - nationalAvg.medianHomeValue) / nationalAvg.medianHomeValue) * 100;
    const homeOwnershipVsNational = ((homeOwnership - nationalAvg.homeOwnership) / nationalAvg.homeOwnership) * 100;
    const householdSizeVsNational = ((avgHouseholdSize - nationalAvg.avgHouseholdSize) / nationalAvg.avgHouseholdSize) * 100;
    
    // Find dominant urbanicity
    const topUrbanRural = Object.entries(urbanRuralBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] || 'suburban';

    // Convert buckets to percentages and sort by income order
    const incomeBracketOrder: Record<string, number> = {
      'Under $50k': 1,
      '$50k-$75k': 2,
      '$75k-$100k': 3,
      '$100k-$150k': 4,
      '$150k+': 5
    };
    
    const incomeDistribution = Object.entries(incomeBuckets)
      .map(([bracket, count]) => ({
        bracket,
        percentage: (count / totalWeight) * 100,
        nationalAvg: this.getNationalIncomeBracketAvg(bracket),
      }))
      .sort((a, b) => (incomeBracketOrder[a.bracket] || 999) - (incomeBracketOrder[b.bracket] || 999));

    const educationLevels = Object.entries(educationBuckets).map(([level, count]) => ({
      level,
      percentage: (count / totalWeight) * 100,
    }));

    // NEW: Create 10-year age buckets from weighted decades
    const ageDistribution = [
      { bracket: '0-9', percentage: totalWeight > 0 ? (weightedAge0to9 / totalWeight) : 0 },
      { bracket: '10-19', percentage: totalWeight > 0 ? (weightedAge10to19 / totalWeight) : 0 },
      { bracket: '20-29', percentage: totalWeight > 0 ? (weightedAge20to29 / totalWeight) : 0 },
      { bracket: '30-39', percentage: totalWeight > 0 ? (weightedAge30to39 / totalWeight) : 0 },
      { bracket: '40-49', percentage: totalWeight > 0 ? (weightedAge40to49 / totalWeight) : 0 },
      { bracket: '50-59', percentage: totalWeight > 0 ? (weightedAge50to59 / totalWeight) : 0 },
      { bracket: '60-69', percentage: totalWeight > 0 ? (weightedAge60to69 / totalWeight) : 0 },
      { bracket: '70+', percentage: totalWeight > 0 ? (weightedAge70plus / totalWeight) : 0 }
    ].filter(item => item.percentage > 0.5);  // Only show brackets with >0.5% population
    
    // Find top age bracket from actual census distribution
    const topAgeBracket = ageDistribution.length > 0
      ? [...ageDistribution].sort((a, b) => b.percentage - a.percentage)[0]?.bracket || '25-44'
      : '25-44';
    
    const urbanRuralDistribution = Object.entries(urbanRuralBuckets).map(([type, count]) => ({
      type,
      percentage: (count / totalWeight) * 100,
    }));

    // Generate insights
    const sixFigureRate = validZipCount > 0 ? (zipsWith100kPlus / validZipCount) * 100 : 0;
    const affluenceLevel = medianHHI > 100000 ? 'Affluent' : medianHHI > 75000 ? 'Upper-Middle' : medianHHI > 50000 ? 'Middle' : 'Lower-Middle';
    const educationProfile = educationBachelors < 20 ? 'Blue-Collar/Trade-Skilled' : educationBachelors < 35 ? 'Mixed Education' : 'College-Educated';
    const familyProfile = avgHouseholdSize > 2.8 ? 'Family-Focused' : avgHouseholdSize > 2.2 ? 'Couples & Small Families' : 'Singles & Couples';
    const locationProfile = topUrbanRural === 'urban' ? 'Urban Professionals' : topUrbanRural === 'suburban' ? 'Suburban Homeowners' : 'Rural/Small Town';

    console.log(`   Median HHI: ${medianHHI.toFixed(0)} (${medianHHIvsNational >= 0 ? '+' : ''}${medianHHIvsNational.toFixed(1)}% vs national) - ${affluenceLevel}`);
    console.log(`   Top age bracket: ${topAgeBracket}, Median: ${medianAge.toFixed(1)}`);
    console.log(`   Education (Bachelor's+): ${educationBachelors.toFixed(1)}% (${educationVsNational >= 0 ? '+' : ''}${educationVsNational.toFixed(1)}% vs national) - ${educationProfile}`);
    console.log(`   Family: ${familyProfile} (avg ${avgHouseholdSize.toFixed(1)} people, ${householdSizeVsNational >= 0 ? '+' : ''}${householdSizeVsNational.toFixed(1)}% vs national)`);
    console.log(`   Location: ${locationProfile} (${homeOwnership.toFixed(0)}% homeowners, median home value $${medianHomeValue.toFixed(0)})`);
    console.log(`   Six-figure households: ${sixFigureRate.toFixed(0)}%`);
    console.log(`   🆕 LIFESTYLE: SelfEmp ${selfEmployed.toFixed(1)}%, Married ${married.toFixed(1)}%, DualInc ${dualIncome.toFixed(1)}%, Commute ${avgCommuteTime.toFixed(0)}min, Charity ${charitableGivers.toFixed(1)}%, STEM ${stemDegree.toFixed(1)}%`);

    return {
      // Core metrics
      medianHHI,
      medianHHIvsNational,
      medianAge,
      topAgeBracket,
      educationBachelors,
      educationVsNational,
      
      // NEW: Expanded metrics
      medianHomeValue,
      homeValueVsNational,
      homeOwnership,
      homeOwnershipVsNational,
      avgHouseholdSize,
      householdSizeVsNational,
      sixFigureRate,
      
      // Ethnicity
      ethnicity: {
        white: whitePercent,
        hispanic: hispanicPercent,
        asian: asianPercent,
        black: blackPercent
      },
      
      // NEW: Lifestyle metrics
      lifestyle: {
        selfEmployed,
        married,
        dualIncome,
        avgCommuteTime,
        charitableGivers,
        stemDegree
      },
      
      // Distributions
      incomeDistribution,
      educationLevels,
      ageDistribution,
      urbanRuralDistribution,
      
      // Interpretive labels
      affluenceLevel,
      educationProfile,
      familyProfile,
      locationProfile,
      
      // Counts
      validZipCount,
      zipsWith100kPlus,
      zipsWithChildren,
    };
  }

  /**
   * Extract geographic intelligence from top ZIP codes
   */
  private extractGeographicIntelligence(topZips: Array<{ zipCode: string; weight: number; city?: string; state?: string; population?: number; overIndex?: number; penetration?: number }>) {
    // Group by city and state
    const cityMap = new Map<string, { city: string; state: string; zipCount: number; totalWeight: number; zips: string[] }>();
    const stateMap = new Map<string, { state: string; zipCount: number; totalWeight: number }>();
    
    topZips.forEach(zip => {
      if (zip.city && zip.state) {
        const cityKey = `${zip.city}, ${zip.state}`;
        if (!cityMap.has(cityKey)) {
          cityMap.set(cityKey, { city: zip.city, state: zip.state, zipCount: 0, totalWeight: 0, zips: [] });
        }
        const cityData = cityMap.get(cityKey)!;
        cityData.zipCount++;
        cityData.totalWeight += zip.weight;
        cityData.zips.push(zip.zipCode);
      }
      
      if (zip.state) {
        if (!stateMap.has(zip.state)) {
          stateMap.set(zip.state, { state: zip.state, zipCount: 0, totalWeight: 0 });
        }
        const stateData = stateMap.get(zip.state)!;
        stateData.zipCount++;
        stateData.totalWeight += zip.weight;
      }
    });
    
    // Sort and get top cities
    const topCities = Array.from(cityMap.values())
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .slice(0, 10)
      .map((city, index) => ({
        rank: index + 1,
        city: city.city,
        state: city.state,
        zipCount: city.zipCount,
        zips: city.zips,
        weight: city.totalWeight
      }));
    
    // Sort and get top states
    const topStates = Array.from(stateMap.values())
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .slice(0, 10)
      .map((state, index) => ({
        rank: index + 1,
        state: state.state,
        zipCount: state.zipCount,
        weight: state.totalWeight
      }));
    
    // Calculate regional patterns
    const westCoast = ['California', 'Oregon', 'Washington', 'Nevada'];
    const eastCoast = ['New York', 'New Jersey', 'Massachusetts', 'Pennsylvania', 'Virginia', 'Maryland', 'District of Columbia'];
    const south = ['Texas', 'Florida', 'Georgia', 'North Carolina', 'Tennessee'];
    const midwest = ['Illinois', 'Michigan', 'Ohio', 'Wisconsin', 'Minnesota'];
    
    let westWeight = 0, eastWeight = 0, southWeight = 0, midwestWeight = 0, otherWeight = 0;
    const totalWeightForRegions = Array.from(stateMap.values()).reduce((sum, s) => sum + s.totalWeight, 0);
    
    stateMap.forEach(stateData => {
      if (westCoast.includes(stateData.state)) westWeight += stateData.totalWeight;
      else if (eastCoast.includes(stateData.state)) eastWeight += stateData.totalWeight;
      else if (south.includes(stateData.state)) southWeight += stateData.totalWeight;
      else if (midwest.includes(stateData.state)) midwestWeight += stateData.totalWeight;
      else otherWeight += stateData.totalWeight;
    });
    
    // Identify top over-indexing ZIPs (passion markets)
    // Filter to valid ZCTAs with population > 1,000 to exclude small/special-use areas
    const zipsWithOverIndex = topZips.filter(z => 
      z.overIndex !== undefined && 
      z.population && 
      z.population > 1000 &&  // Lowered from 5000 to include more suburbs
      z.city && z.state  // Must have valid location data
    );
    const topOverIndexZips = zipsWithOverIndex
      .sort((a, b) => (b.overIndex || 0) - (a.overIndex || 0))
      .slice(0, 10)
      .map((zip, index) => ({
        rank: index + 1,
        zipCode: zip.zipCode,
        city: zip.city || 'Unknown',
        state: zip.state || 'Unknown',
        weight: zip.weight,
        population: zip.population || 0,
        overIndex: zip.overIndex || 0,
        penetration: zip.penetration || 0
      }));
    
    return {
      topCities,
      topStates,
      regionalDistribution: {
        westCoast: totalWeightForRegions > 0 ? (westWeight / totalWeightForRegions) * 100 : 0,
        eastCoast: totalWeightForRegions > 0 ? (eastWeight / totalWeightForRegions) * 100 : 0,
        south: totalWeightForRegions > 0 ? (southWeight / totalWeightForRegions) * 100 : 0,
        midwest: totalWeightForRegions > 0 ? (midwestWeight / totalWeightForRegions) * 100 : 0,
        other: totalWeightForRegions > 0 ? (otherWeight / totalWeightForRegions) * 100 : 0
      },
      topOverIndexZips
    };
  }

  /**
   * Calculate behavioral overlaps with other segments
   */
  private async calculateBehavioralOverlaps(targetSegment: string, limit: number = 7): Promise<Array<{
    segment: string;
    overlapPercentage: number;
    insight: string;
    overIndex?: number;
    topMarkets?: Array<{city: string; state: string; overIndex: number; descriptor?: string}>;
  }>> {
    console.log(`🔗 Calculating behavioral overlaps for: "${targetSegment}"`);

    // **FAST PATH: Use pre-calculated overlaps if available**
    if (this.overlapsCache && this.overlapsCache.has(targetSegment)) {
      const cachedOverlaps = this.overlapsCache.get(targetSegment)!;
      
      // Sort by overlap percentage and take top N
      const sortedOverlaps = cachedOverlaps
        .sort((a, b) => b.overlapPercentage - a.overlapPercentage)
        .slice(0, limit);
      
      // Track all market scores across overlaps for differentiation analysis
      const allMarketScores = new Map<string, Map<string, number>>(); // marketName -> segmentName -> score

      // Generate insights for each overlap with over-indexing analysis
      const topOverlaps = await Promise.all(
        sortedOverlaps.map(async overlap => {
          console.log(`🔍 Processing overlap: ${targetSegment} + ${overlap.segment}`);
          const insight = await this.generateOverlapInsight(targetSegment, overlap.segment, overlap.overlapPercentage);
          const overIndexData = await this.calculateOverIndexing(targetSegment, overlap.segment);
          
          console.log(`🎯 Over-index data for ${targetSegment} + ${overlap.segment}:`, {
            overIndex: overIndexData.overIndex,
            topMarkets: overIndexData.topMarkets?.map(m => `${m.city}, ${m.state} (${m.overIndex.toFixed(1)}x)`) || []
          });
          
          // Track market scores for differentiation analysis
          if (overIndexData.topMarkets) {
            overIndexData.topMarkets.forEach(market => {
              const marketKey = `${market.city}, ${market.state}`;
              if (!allMarketScores.has(marketKey)) {
                allMarketScores.set(marketKey, new Map());
              }
              allMarketScores.get(marketKey)!.set(overlap.segment, market.overIndex);
            });
          }
          
          return {
            segment: overlap.segment,
            overlapPercentage: overlap.overlapPercentage,
            insight,
            ...overIndexData
          };
        })
      );
      
      console.log(`   ⚡ Using pre-calculated overlaps (instant lookup!)`);
      console.log(`   ✅ Found top ${topOverlaps.length} overlapping segments`);
      topOverlaps.forEach((overlap, i) => {
        console.log(`      ${i + 1}. ${overlap.segment}: ${overlap.overlapPercentage.toFixed(1)}% overlap`);
      });
      
      // NUCLEAR GEOGRAPHIC DIVERSITY: Force completely different markets with strict rotation
      const usedMarkets = new Set<string>();
      const recalculatedOverlaps = topOverlaps.map((overlap, index) => {
        if (!overlap.topMarkets) return overlap;
        
        // Get ALL available markets (not just top 3)
        const allAvailableMarkets = overlap.topMarkets;
        
        // For each segment, find markets that haven't been used yet
        const unusedMarkets = allAvailableMarkets.filter(market => {
          const marketKey = `${market.city}, ${market.state}`;
          return !usedMarkets.has(marketKey);
        });
        
        // If we have enough unused markets, use them. Otherwise, use the best available.
        let selectedMarkets;
        if (unusedMarkets.length >= 3) {
          selectedMarkets = unusedMarkets.slice(0, 3);
        } else {
          // Mix unused markets with some lower-ranked markets for diversity
          const remainingNeeded = 3 - unusedMarkets.length;
          const lowerRankedMarkets = allAvailableMarkets
            .filter(market => {
              const marketKey = `${market.city}, ${market.state}`;
              return !usedMarkets.has(marketKey) && !unusedMarkets.some(um => `${um.city}, ${um.state}` === marketKey);
            })
            .slice(0, remainingNeeded);
          
          selectedMarkets = [...unusedMarkets, ...lowerRankedMarkets];
        }
        
        // Mark these markets as used for future segments
        selectedMarkets.forEach(market => {
          const marketKey = `${market.city}, ${market.state}`;
          usedMarkets.add(marketKey);
        });
        
        console.log(`🎯 NUCLEAR DIVERSITY for ${overlap.segment}:`, selectedMarkets.map(m => `${m.city}, ${m.state} (${m.overIndex.toFixed(1)}x)`));
        
        return {
          ...overlap,
          topMarkets: selectedMarkets.map(m => ({
            city: m.city,
            state: m.state,
            overIndex: m.overIndex
          }))
        };
      });
      
      return recalculatedOverlaps;
    }

    // **FALLBACK: Calculate on-the-fly if cache not available**
    console.log(`   ⚠️  Pre-calculated overlaps not available, calculating on-the-fly...`);
    
    // Get all segments
    const allSegments = commerceAudienceService.getAudienceSegments().map(s => s.name);
    
    // Get target segment's ZIP codes (use top 100 for faster processing)
    const targetZips = commerceAudienceService.searchZipCodesByAudience(targetSegment, 100);
    const targetZipSet = new Set(targetZips.map((z: any) => z.zipCode));

    console.log(`   Target segment has ${targetZipSet.size} ZIP codes`);
    
    // Sample random segments for speed
    const maxSegmentsToCheck = 30;
    let segmentsToCheck = allSegments.filter(s => s !== targetSegment);
    
    if (segmentsToCheck.length > maxSegmentsToCheck) {
      segmentsToCheck = segmentsToCheck
        .sort(() => Math.random() - 0.5)
        .slice(0, maxSegmentsToCheck);
    }
    
    console.log(`   Calculating overlaps with ${segmentsToCheck.length} segments (sampled)...`);

    // Calculate overlap with sampled segments
    const overlaps: Array<{ segment: string; overlapPercentage: number; insight: string }> = [];
    
    for (const segment of segmentsToCheck) {
      const segmentZips = commerceAudienceService.searchZipCodesByAudience(segment, 100);
      const segmentZipSet = new Set(segmentZips.map((z: any) => z.zipCode));

      const intersection = new Set([...targetZipSet].filter(z => segmentZipSet.has(z)));
      const union = new Set([...targetZipSet, ...segmentZipSet]);
      const overlapPercentage = union.size > 0 ? (intersection.size / union.size) * 100 : 0;

      if (overlapPercentage > 0) {
        const insight = await this.generateOverlapInsight(targetSegment, segment, overlapPercentage);
        overlaps.push({
          segment,
          overlapPercentage,
          insight,
        });
      }
    }

    const topOverlaps = overlaps
      .sort((a, b) => b.overlapPercentage - a.overlapPercentage)
      .slice(0, limit);

    console.log(`   ✅ Found top ${topOverlaps.length} overlapping segments`);
    topOverlaps.forEach((overlap, i) => {
      console.log(`      ${i + 1}. ${overlap.segment}: ${overlap.overlapPercentage.toFixed(1)}% overlap`);
    });

    return topOverlaps;
  }

  /**
   * Generate overlap insight - use AI for high-overlap cases to avoid repetitive generic insights
   */
  private async generateOverlapInsight(targetSegment: string, overlapSegment: string, percentage: number): Promise<string> {
    // First try static insights for speed
    const staticInsight = this.generateStaticOverlapInsight(targetSegment, overlapSegment, percentage);
    
    // Use AI for meaningful overlaps (lowered threshold to 10%) or when static insights are generic
    const shouldUseAI = percentage > 10 && (
      staticInsight.includes('share similar lifestyles and shopping behaviors') ||
      staticInsight.includes('This') && staticInsight.includes('overlap reveals a shared interest area') ||
      staticInsight.includes('comprehensive shoppers') ||
      staticInsight.includes('broader interest or need') ||
      staticInsight.includes('demographic similarities') ||
      staticInsight.includes('Strong') && staticInsight.includes('overlap reveals these aren\'t random buyers') ||
      staticInsight.includes('purposeful consumers with coordinated purchase patterns') ||
      staticInsight.includes('qualified, high-intent audiences') ||
      staticInsight.includes('Strong') && staticInsight.includes('overlap reveals') ||
      staticInsight.includes('purposeful consumers') ||
      staticInsight.includes('qualified, high-intent') ||
      staticInsight.includes('Strong') && staticInsight.includes('overlap reveals these aren\'t random buyers') ||
      staticInsight.includes('purposeful consumers with coordinated purchase patterns') ||
      staticInsight.includes('qualified, high-intent audiences making planned investments')
    );
    
    // Debug logging
    console.log(`🔍 AI Decision for ${targetSegment} ↔ ${overlapSegment} (${percentage.toFixed(1)}%):`, {
      shouldUseAI,
      percentage,
      staticInsight: staticInsight.substring(0, 100) + '...'
    });
    
    if (shouldUseAI) {
      console.log(`🤖 Using AI to generate cross-purchase insight for ${targetSegment} ↔ ${overlapSegment} (${percentage.toFixed(1)}%)`);
      
      try {
        const aiInsight = await this.generateAICrossPurchaseInsight(targetSegment, overlapSegment, percentage);
        if (aiInsight && aiInsight.trim().length > 50) {
          return aiInsight;
        }
      } catch (error) {
        console.warn(`⚠️ AI insight generation failed for ${targetSegment} ↔ ${overlapSegment}, using static fallback:`, error);
      }
    }
    
    return staticInsight;
  }

  /**
   * Calculate over-indexing analysis for overlap segments with improved geographic diversity
   */
  private async calculateOverIndexing(targetSegment: string, overlapSegment: string): Promise<{
    overIndex?: number;
    topMarkets?: Array<{city: string; state: string; overIndex: number; descriptor?: string}>;
  }> {
    try {
      // OPTIMIZATION: Skip cache for now to test new algorithm
      const cacheKey = `${targetSegment}|${overlapSegment}`;
      // if (this.overIndexCache && this.overIndexCache.has(cacheKey)) {
      //   console.log(`💨 Using cached over-indexing for ${targetSegment} + ${overlapSegment}`);
      //   return this.overIndexCache.get(cacheKey)!;
      // }
      
      console.log(`🔍 calculateOverIndexing: ${targetSegment} + ${overlapSegment}`);
      
      // Get ZIP data for both segments - get more data for better diversity
      const targetZips = commerceAudienceService.searchZipCodesByAudience(targetSegment, 200);
      const overlapZips = commerceAudienceService.searchZipCodesByAudience(overlapSegment, 200);
      
      console.log(`📊 Found ${targetZips.length} target ZIPs and ${overlapZips.length} overlap ZIPs`);
      
      if (!targetZips || !overlapZips || targetZips.length === 0 || overlapZips.length === 0) {
        console.log(`⚠️ No ZIP data found for ${targetSegment} or ${overlapSegment}`);
        return {};
      }

      // Create maps for efficient lookup
      const targetZipsMap = new Map(targetZips.map((z: any) => [z.zipCode, z]));
      const overlapZipsMap = new Map(overlapZips.map((z: any) => [z.zipCode, z]));

      // Find common ZIPs
      const targetZipSet = new Set(targetZips.map((z: any) => z.zipCode));
      const overlapZipSet = new Set(overlapZips.map((z: any) => z.zipCode));
      const commonZips = [...targetZipSet].filter(zip => overlapZipSet.has(zip));
      
      if (commonZips.length === 0) {
        return {};
      }

      // Calculate weighted overlap for each common ZIP
      const zipOverlapScores = commonZips.map(zipCode => {
        const targetData = targetZipsMap.get(zipCode);
        const overlapData = overlapZipsMap.get(zipCode);
        
        if (!targetData || !overlapData) return null;
        
        // Weight by the product of both weights (strong in both = higher score)
        const overlapScore = Math.sqrt(targetData.weight * overlapData.weight);
        
        return { zipCode, overlapScore, targetWeight: targetData.weight, overlapWeight: overlapData.weight };
      }).filter(Boolean);

      if (zipOverlapScores.length === 0) {
        return {};
      }

      // Get census data for common ZIPs to get city/state information
      const censusDataArray = await this.censusDataService.getZipCodeData(commonZips);
      const censusDataMap = new Map(censusDataArray.map(data => [data.zipCode, data]));

      // Aggregate to city level with weighted scores
      const cityScores = new Map();
      zipOverlapScores.forEach(zip => {
        if (!zip) return;
        const census = censusDataMap.get(zip.zipCode);
        if (!census) return;
        
        const cityKey = `${census.geography.city}, ${census.geography.state}`;
        const existing = cityScores.get(cityKey) || { score: 0, count: 0, totalWeight: 0 };
        cityScores.set(cityKey, {
          score: existing.score + zip.overlapScore,
          count: existing.count + 1,
          totalWeight: existing.totalWeight + (zip.targetWeight || 0) + (zip.overlapWeight || 0)
        });
      });

      // Enhanced geographic diversity algorithm
      const validZipScores = zipOverlapScores.filter((zip): zip is NonNullable<typeof zip> => zip !== null);
      let topMarkets = this.selectDiverseMarkets(validZipScores, censusDataMap, targetSegment, overlapSegment);

      // Fallback: If we don't have enough cities with census data, use ZIP-based approach
      if (topMarkets.length < 2 || (topMarkets.length === 1 && topMarkets[0]?.city === 'Chicago')) {
        console.log(`⚠️ Limited census data (${topMarkets.length} cities), using ZIP-based fallback`);
        const zipBasedMarkets = zipOverlapScores
          .filter(Boolean)
          .sort((a, b) => {
            if (!a || !b) return 0;
            return (b.overlapScore || 0) - (a.overlapScore || 0);
          })
          .slice(0, 3)
          .map((zip) => {
            if (!zip) return { city: 'Unknown', state: 'Various', overIndex: 0 };
            return {
              city: `ZIP ${zip.zipCode}`,
              state: 'Various',
              overIndex: zip.overlapScore || 0
            };
          });
        
        if (zipBasedMarkets.length > 0) {
          topMarkets = zipBasedMarkets;
          console.log(`✅ Using ZIP-based markets:`, zipBasedMarkets.map(m => `${m.city} (${m.overIndex.toFixed(2)})`));
        }
      }

      // Calculate overall over-indexing for the segment pair
      const totalOverlapScore = zipOverlapScores.reduce((sum, zip) => {
        if (!zip) return sum;
        return sum + (zip.overlapScore || 0);
      }, 0);
      
      // Improved over-indexing calculation to prevent 100x bug
      const expectedOverlap = Math.sqrt(targetZips.length * overlapZips.length) * 0.1;
      let overIndex = 1; // Default to 1x (no over-indexing)
      
      console.log('🚨 BEFORE CALCULATION:', { expectedOverlap, totalOverlapScore, overIndex });
      
      if (expectedOverlap > 0 && totalOverlapScore > 0) {
        const rawOverIndex = totalOverlapScore / expectedOverlap;
        overIndex = Math.max(1, Math.min(rawOverIndex, 10));
        console.log('🚨 AFTER CALCULATION:', { rawOverIndex, cappedOverIndex: overIndex });
      }

      console.log(`🔍 Geographic overlap analysis for ${targetSegment} + ${overlapSegment}:`, {
        commonZips: commonZips.length,
        zipOverlapScores: zipOverlapScores.length,
        cityScoresSize: cityScores.size,
        topMarkets: topMarkets.map(m => `${m.city}, ${m.state} (${m.overIndex.toFixed(2)})`),
        overallOverIndex: overIndex.toFixed(2)
      });
      
      const returnValue = {
        overIndex: overIndex > 1.5 ? overIndex : undefined, // Only show if significantly over-indexed
        topMarkets: topMarkets.length > 0 ? topMarkets : undefined
      };
      
      // OPTIMIZATION: Cache the result
      this.overIndexCache.set(cacheKey, returnValue);
      
      return returnValue;
    } catch (error) {
      console.warn('Failed to calculate over-indexing:', error);
      return {};
    }
  }

  /**
   * Select geographically diverse markets using overlap-type aware algorithm
   */
  private selectDiverseMarkets(
    zipOverlapScores: Array<{
      zipCode: string;
      overlapScore: number;
      targetWeight: number;
      overlapWeight: number;
    }>, 
    censusDataMap: Map<string, any>,
    targetSegment?: string,
    overlapSegment?: string
  ): Array<{city: string; state: string; overIndex: number; descriptor?: string}> {
    
    // Enrich ZIP scores with census data and calculate overlap-type aware diversity scores
    const enrichedZips = zipOverlapScores.map(zip => {
      const census = censusDataMap.get(zip.zipCode);
      if (!census) return null;
      
      // Calculate overlap-type aware diversity score
      const populationWeight = Math.log(Math.max(census.population, 1000)); // Log scale to reduce big city bias
      
      // Apply overlap-type specific weighting
      let overlapTypeWeight = 1;
      if (targetSegment && overlapSegment) {
        const overlapType = `${targetSegment.toLowerCase()}+${overlapSegment.toLowerCase()}`;
        
        // Family-focused overlaps (Toys, Baby, etc.) favor family suburbs
        if (overlapSegment.toLowerCase().includes('toy') || 
            overlapSegment.toLowerCase().includes('baby') ||
            overlapSegment.toLowerCase().includes('child')) {
          // Favor suburban areas with families
          const familyWeight = census.demographics?.householdSize > 2.5 ? 1.5 : 0.8;
          overlapTypeWeight *= familyWeight;
        }
        
        // Health/fitness overlaps favor health-conscious cities
        if (overlapSegment.toLowerCase().includes('fitness') || 
            overlapSegment.toLowerCase().includes('nutrition') ||
            overlapSegment.toLowerCase().includes('health')) {
          // Favor cities with higher education and income (health-conscious)
          const healthWeight = census.economics?.householdIncome?.median > 80000 ? 1.3 : 0.9;
          overlapTypeWeight *= healthWeight;
        }
        
        // Home/garden overlaps favor homeowner markets
        if (overlapSegment.toLowerCase().includes('home') || 
            overlapSegment.toLowerCase().includes('garden') ||
            overlapSegment.toLowerCase().includes('lawn')) {
          // Favor areas with high homeownership
          const homeWeight = census.geography?.housing?.ownerOccupiedRate > 0.6 ? 1.4 : 0.8;
          overlapTypeWeight *= homeWeight;
        }
      }
      
      const diversityScore = zip.overlapScore * populationWeight * overlapTypeWeight;
      
      return {
        zipCode: zip.zipCode,
        overlapScore: zip.overlapScore,
        diversityScore,
        population: census.population,
        city: census.geography.city,
        state: census.geography.state
      };
    }).filter((zip): zip is NonNullable<typeof zip> => zip !== null);

    if (enrichedZips.length === 0) return [];

    const selectedMarkets: Array<{city: string; state: string; overIndex: number; descriptor?: string}> = [];

    // NEW STRATEGY: Focus on OVER-INDEXING rather than raw popularity
    // Calculate over-indexing for each city based on relative performance vs average
    const overIndexedCities = enrichedZips.map(zip => {
      // Calculate relative over-index: how much this city's overlap score 
      // exceeds the average overlap score across all cities
      const avgOverlapScore = enrichedZips.reduce((sum, z) => sum + z.overlapScore, 0) / enrichedZips.length;
      const relativeOverIndex = avgOverlapScore > 0 ? zip.overlapScore / avgOverlapScore : 1;

      // Apply population weighting to balance market size with behavior strength
      const populationFactor = Math.log10(Math.max(zip.population, 1000)) / 5; // Normalize 10K-1M population to 0.8-1.2
      const balancedOverIndex = relativeOverIndex * (0.7 + (populationFactor * 0.3));

      // Cap at reasonable range (1-15x)
      const overIndex = Math.max(1, Math.min(balancedOverIndex, 15));
      
      return {
        ...zip,
        overIndex: overIndex,
        // Use over-index as primary sorting criteria
        diversityScore: overIndex * Math.log(Math.max(zip.population, 1000)) // Weight by population size
      };
    }).sort((a, b) => b.overIndex - a.overIndex); // Sort by over-indexing, not raw scores

    // Sort by balanced over-index score (already calculated above)
    const sortedCities = overIndexedCities
      .sort((a, b) => b.overIndex - a.overIndex);

    // Return top 25 markets (ultra-aggressive diversity will happen in calling method)
    const usedCities = new Set<string>();
    for (const city of sortedCities) {
      if (selectedMarkets.length >= 25) break;
      
      const cityKey = `${city.city}, ${city.state}`;
      if (!usedCities.has(cityKey)) {
        selectedMarkets.push({
          city: city.city,
          state: city.state,
          overIndex: city.overIndex,
          descriptor: this.generateMarketDescriptor(city.city, city.state, 'General', city.overIndex)
        });
        usedCities.add(cityKey);
      }
    }


    console.log(`🎯 Selected diverse markets:`, selectedMarkets.map(m => `${m.city}, ${m.state} (${m.overIndex.toFixed(2)}x)`));
    
    return selectedMarkets;
  }

  /**
   * Generate descriptive characteristics for a market
   */
  private generateMarketDescriptor(city: string, state: string, region: string, overIndex: number): string {
    const descriptors: string[] = [];
    
    // Regional characteristics
    switch (region) {
      case 'West':
        descriptors.push('tech-forward', 'outdoor lifestyle');
        break;
      case 'South':
        descriptors.push('family-oriented', 'growing suburbs');
        break;
      case 'Midwest':
        descriptors.push('affordable housing', 'family values');
        break;
      case 'Northeast':
        descriptors.push('urban density', 'high education');
        break;
    }
    
    // City-specific characteristics
    const cityLower = city.toLowerCase();
    if (cityLower.includes('chicago')) {
      descriptors.push('diverse neighborhoods', 'affordable luxury');
    } else if (cityLower.includes('dallas')) {
      descriptors.push('business hub', 'rapid growth');
    } else if (cityLower.includes('atlanta')) {
      descriptors.push('southern charm', 'corporate headquarters');
    } else if (cityLower.includes('new york')) {
      descriptors.push('cultural capital', 'high income');
    } else if (cityLower.includes('washington')) {
      descriptors.push('government center', 'educated workforce');
    } else if (cityLower.includes('las vegas')) {
      descriptors.push('entertainment hub', 'tourism economy');
    } else if (cityLower.includes('brooklyn')) {
      descriptors.push('creative community', 'urban renewal');
    } else if (cityLower.includes('jersey city')) {
      descriptors.push('commuter hub', 'diverse population');
    }
    
    // Over-indexing characteristics
    if (overIndex >= 15) {
      descriptors.push('highly concentrated');
    } else if (overIndex >= 10) {
      descriptors.push('strong presence');
    } else if (overIndex >= 5) {
      descriptors.push('emerging market');
    }
    
    // Combine descriptors
    if (descriptors.length === 0) {
      return 'diverse market';
    }
    
    return descriptors.slice(0, 3).join(', ');
  }

  /**
   * Get geographic context for overlap insights
   */
  private async getGeographicOverlapContext(targetSegment: string, overlapSegment: string): Promise<string> {
    try {
      // Get top ZIPs for both segments
      const targetZips = commerceAudienceService.searchZipCodesByAudience(targetSegment, 50);
      const overlapZips = commerceAudienceService.searchZipCodesByAudience(overlapSegment, 50);
      
      if (!targetZips || !overlapZips || targetZips.length === 0 || overlapZips.length === 0) {
        return '';
      }

      // Find common ZIPs
      const targetZipSet = new Set(targetZips.map((z: any) => z.zipCode));
      const overlapZipSet = new Set(overlapZips.map((z: any) => z.zipCode));
      const commonZips = [...targetZipSet].filter(zip => overlapZipSet.has(zip));
      
      if (commonZips.length === 0) {
        return '';
      }

      // Get census data for common ZIPs to get city/state information
      const censusDataArray = await this.censusDataService.getZipCodeData(commonZips);
      const censusDataMap = new Map(censusDataArray.map(data => [data.zipCode, data]));

      // Get geographic distribution of common ZIPs
      const commonZipData = targetZips.filter((z: any) => commonZips.includes(z.zipCode));
      const topCities = commonZipData
        .slice(0, 3)
        .map((z: any) => {
          const censusData = censusDataMap.get(z.zipCode);
          return censusData ? `${censusData.geography.city}, ${censusData.geography.state}` : null;
        })
        .filter(city => city !== null)
        .join(', ');

      return topCities ? `Strongest overlap in: ${topCities}` : '';
    } catch (error) {
      console.warn('Failed to get geographic context:', error);
      return '';
    }
  }

  /**
   * Generate static overlap insight with comprehensive product category logic
   */
  private generateStaticOverlapInsight(targetSegment: string, overlapSegment: string, percentage: number): string {
    const target = targetSegment.toLowerCase();
    const overlap = overlapSegment.toLowerCase();
    
    // IMPROVED APPROACH: More specific, actionable insights with better pattern matching
    
    // Cycling-specific patterns (high priority for cycling enthusiasts)
    if (target.includes('cycling') || target.includes('bike') || target.includes('bicycle')) {
      if (overlap.includes('sport') || overlap.includes('athletic') || overlap.includes('fitness') || overlap.includes('sporting goods')) {
        return `Cycling enthusiasts are active athletes who invest in comprehensive sports equipment and fitness gear, creating natural cross-selling opportunities for performance apparel, training equipment, and recovery products.`;
      }
      if (overlap.includes('outdoor') || overlap.includes('recreation') || overlap.includes('camping')) {
        return `Cycling enthusiasts are outdoor recreation enthusiasts who invest in camping gear, hiking equipment, and outdoor activities, creating opportunities for adventure travel and outdoor lifestyle products.`;
      }
      if (overlap.includes('furniture') || overlap.includes('outdoor') || overlap.includes('patio')) {
        return `Cycling enthusiasts often have active outdoor lifestyles and invest in outdoor furniture and patio equipment for entertaining and relaxation after rides, creating opportunities for outdoor living and entertainment products.`;
      }
      if (overlap.includes('grooming') || overlap.includes('shaving') || overlap.includes('personal care')) {
        return `Cycling enthusiasts maintain active lifestyles that require regular grooming and personal care, creating opportunities for performance-oriented grooming products and subscription services.`;
      }
      if (overlap.includes('alcohol') || overlap.includes('beverage') || overlap.includes('wine')) {
        return `Cycling enthusiasts enjoy social gatherings and post-ride celebrations, purchasing alcoholic beverages for entertaining and relaxation, indicating a sophisticated lifestyle that values both fitness and social experiences.`;
      }
      if (overlap.includes('nutrition') || overlap.includes('supplement') || overlap.includes('protein')) {
        return `Cycling enthusiasts are performance-focused athletes who invest in nutrition supplements, protein products, and specialized sports nutrition to optimize their training and recovery.`;
      }
    }
    
    // Pet-specific patterns (high priority for pet-related segments)
    if (target.includes('dog') || target.includes('cat') || target.includes('pet')) {
      if (overlap.includes('vehicle') || overlap.includes('car') || overlap.includes('auto')) {
        return `Pet owners frequently purchase car accessories such as seat covers, barriers, and carriers for safely and comfortably transporting their pets.`;
      }
      if (overlap.includes('bed') || overlap.includes('furniture') || overlap.includes('home')) {
        return `Pet owners are creating pet-friendly living spaces, purchasing furniture and home goods that accommodate their pets' needs while maintaining household aesthetics.`;
      }
      if (overlap.includes('medical') || overlap.includes('health') || overlap.includes('care')) {
        return `Pet owners prioritize their pets' health and wellness, investing in medical supplies and health products to ensure their pets' long-term wellbeing.`;
      }
      if (overlap.includes('food') || overlap.includes('nutrition') || overlap.includes('diet')) {
        return `Pet owners are health-conscious about their pets' nutrition, purchasing premium food and dietary supplements alongside their own health products.`;
      }
    }
    
    // Vehicle-specific patterns
    if (target.includes('vehicle') || target.includes('car') || target.includes('auto')) {
      if (overlap.includes('pet') || overlap.includes('dog') || overlap.includes('cat')) {
        return `Car owners frequently purchase pet accessories for safe and comfortable pet transportation, including seat covers, barriers, and carriers.`;
      }
      if (overlap.includes('tool') || overlap.includes('repair') || overlap.includes('maintenance')) {
        return `Vehicle owners are hands-on maintainers who invest in tools and repair supplies to keep their vehicles in optimal condition.`;
      }
      if (overlap.includes('electronic') || overlap.includes('gps') || overlap.includes('audio')) {
        return `Vehicle owners upgrade their driving experience with technology, purchasing electronics and accessories that enhance safety, navigation, and entertainment.`;
      }
    }
    
    // Home/Furniture patterns
    if ((overlap.includes('chair') || overlap.includes('bed') || overlap.includes('furniture') || overlap.includes('shelf') || overlap.includes('table')) && 
        !target.includes('furniture')) {
      return `Consumers purchasing ${targetSegment} are often setting up or upgrading their homes, creating natural bundling opportunities with furniture and home goods as they invest in their living spaces during active home improvement or lifestyle transition phases.`;
    }
    
    // Technology patterns
    if (overlap.includes('laptop') || overlap.includes('computer') || overlap.includes('software') || overlap.includes('network')) {
      if (target.includes('pet') || target.includes('dog') || target.includes('cat')) {
        return `Pet owners include remote workers and tech professionals who invest in laptops and computing equipment, creating opportunities for home office products, productivity software, and tech accessories.`;
      }
      return `${targetSegment} buyers include remote workers and tech professionals who invest in laptops and computing equipment, creating opportunities for home office products, productivity software, and tech accessories.`;
    }
    
    // Entertainment patterns
    if (overlap.includes('event') || overlap.includes('ticket') || overlap.includes('party') || overlap.includes('entertainment')) {
      return `${targetSegment} buyers are experience-oriented consumers who invest in both products and experiences, purchasing event tickets and entertainment alongside tangible goods, indicating disposable income and a balanced lifestyle that values both possessions and memories.`;
    }
    
    // Health/Medical patterns
    if (overlap.includes('medical') || overlap.includes('first aid') || overlap.includes('health care')) {
      return `${targetSegment} buyers are health-conscious and proactive, investing in medical supplies and health products alongside their purchases, reflecting a practical approach to wellness and preparedness for their families.`;
    }
    
    // Baby/Parenting patterns
    if ((overlap.includes('baby') || overlap.includes('infant') || overlap.includes('toddler') || overlap.includes('nursery')) && 
        !target.includes('baby') && !target.includes('toddler')) {
      return `${targetSegment} buyers include new or expecting parents who are simultaneously preparing for their children's arrival or growth, purchasing baby products alongside household and personal items during this high-spending life stage.`;
    }
    
    // Apparel patterns
    if ((overlap.includes('clothing') || overlap.includes('dress') || overlap.includes('shoe') || overlap.includes('apparel')) && 
        !target.includes('clothing') && !target.includes('apparel')) {
      return `${targetSegment} buyers often refresh multiple aspects of their lifestyle simultaneously, purchasing clothing and apparel alongside other products as they update their wardrobes and living spaces in coordinated shopping sessions.`;
    }
    
    // Photography patterns
    if ((overlap.includes('photograph') || overlap.includes('camera') || overlap.includes('lens')) && 
        !target.includes('camera') && !target.includes('photo')) {
      return `${targetSegment} buyers include photography enthusiasts and content creators who document their interests and lifestyle, creating cross-selling opportunities for camera accessories, storage solutions, and display products.`;
    }
    
    // High-overlap fallback for segments with >60% overlap
    if (percentage > 60) {
      return `This ${percentage.toFixed(0)}% overlap indicates a highly engaged audience with strong cross-category purchase intent, representing qualified buyers who demonstrate sophisticated shopping behavior and higher lifetime value potential through their demonstrated cross-category purchase patterns.`;
    }
    
    // Pattern: Any product + Toys/Games → Parents or gift-givers
    if ((overlap.includes('toy') || overlap.includes('game') || overlap.includes('puzzle')) && 
        !target.includes('toy') && !target.includes('game')) {
      return `${targetSegment} buyers include parents, gift-givers, and family-oriented individuals who purchase toys and games for children or family entertainment, indicating household spending patterns beyond personal use.`;
    }
    
    // Educational Toys - Specific category
    if (target.includes('educational toy') || target.includes('learning toy') || target.includes('stem toy')) {
      if (overlap.includes('media') || overlap.includes('book') || overlap.includes('video')) return 'Educational toy buyers prioritize child development and learning, investing in educational media, books, and content that complement hands-on toys to create comprehensive learning experiences for their children.';
      if (overlap.includes('toy') || overlap.includes('game')) return 'Parents purchasing educational toys actively seek diverse learning tools, buying both educational and general toys to balance skill development with fun, creating opportunities for bundled toy collections.';
      if (overlap.includes('circuit') || overlap.includes('electronic') || overlap.includes('tech')) return 'Educational toy buyers, especially those focused on STEM learning, invest in electronics and building kits like circuit boards to foster technical skills and hands-on problem-solving in their children.';
      if (overlap.includes('software') || overlap.includes('computer')) return 'Parents buying educational toys embrace digital learning, purchasing educational software and computer equipment to provide multi-modal learning experiences combining physical and digital educational tools.';
      if (overlap.includes('book') || overlap.includes('reading')) return 'Educational toy buyers value literacy and learning, purchasing books alongside toys to create rich educational environments that combine reading, play, and hands-on learning.';
    }
    
    // Pattern: Any product + Luggage/Travel bags → Travelers
    if ((overlap.includes('luggage') || overlap.includes('suitcase') || overlap.includes('travel bag')) && 
        !target.includes('luggage') && !target.includes('travel')) {
      return `${targetSegment} buyers include travelers who purchase luggage and travel accessories, creating opportunities for travel-sized products, portable versions, or items that enhance their on-the-go lifestyle.`;
    }
    
    // Pattern: Any product + Cosmetic bags/accessories → Organized consumers
    if (overlap.includes('cosmetic') || overlap.includes('toiletry bag') || overlap.includes('organizer')) {
      return `${targetSegment} buyers value organization and portability, purchasing cosmetic bags and organizers to efficiently store and transport their purchases, indicating receptiveness to storage solutions and organizational products.`;
    }
    
    // Pattern: Any product + Household Supplies → Practical homemakers
    if (overlap.includes('household suppl') || overlap.includes('home suppl')) {
      return `${targetSegment} buyers are practical, home-focused individuals who regularly purchase household essentials and cleaning supplies, indicating routine shopping patterns and receptiveness to bundled household product offerings.`;
    }
    
    // Pattern: Any product + Exercise/Fitness → Active lifestyle
    if ((overlap.includes('exercise') || overlap.includes('fitness') || overlap.includes('workout')) && !target.includes('fitness') && !target.includes('sport')) {
      return `${targetSegment} buyers maintain active, health-conscious lifestyles, investing in fitness and exercise products alongside their purchases, creating cross-selling opportunities for wellness, nutrition, and athletic products.`;
    }
    
    // Pattern: Any product + Laptops/Computers → Tech professionals
    if ((overlap.includes('laptop') || overlap.includes('computer') || overlap.includes('pc')) && !target.includes('computer') && !target.includes('laptop')) {
      return `${targetSegment} buyers include remote workers and tech professionals who invest in laptops and computing equipment, creating opportunities for home office products, productivity software, and tech accessories.`;
    }
    
    // Pattern: Any product + Grooming/Personal care → Self-care focused
    if ((overlap.includes('shaving') || overlap.includes('grooming') || overlap.includes('personal care')) && !target.includes('grooming')) {
      return `${targetSegment} buyers value personal care and grooming, maintaining daily self-care routines that create opportunities for subscription services and complementary wellness products.`;
    }
    
    // Pattern: Any product + Alcoholic Beverages → Social/entertaining consumers
    if ((overlap.includes('alcohol') || overlap.includes('wine') || overlap.includes('beer') || overlap.includes('spirit')) && 
        !target.includes('alcohol') && !target.includes('beverage')) {
      return `${targetSegment} buyers enjoy social entertaining and relaxation rituals, purchasing alcoholic beverages to complement their lifestyle, indicating sophistication and willingness to invest in quality experiences beyond basic necessities.`;
    }
    
    // Pattern: Pool & Spa + Food Service → Hosting/entertaining lifestyle
    if ((target.includes('pool') || target.includes('spa') || target.includes('hot tub') || target.includes('Pool & Spa')) && 
        (overlap.includes('food') || overlap.includes('restaurant') || overlap.includes('delivery') || overlap.includes('catering') || overlap.includes('Food Service'))) {
      return `Pool & Spa buyers are frequently hosting guests and entertaining, making them prime targets for food delivery services like Uber Eats or DoorDash who can conveniently deliver meals while they're relaxing by the pool instead of spending time in the kitchen.`;
    }
    
    // Pattern: Food Service + Pool & Spa → Entertaining lifestyle
    if ((target.includes('food') || target.includes('restaurant') || target.includes('delivery') || target.includes('catering') || target.includes('Food Service')) && 
        (overlap.includes('pool') || overlap.includes('spa') || overlap.includes('hot tub') || overlap.includes('Pool & Spa'))) {
      return `Food service buyers who also purchase Pool & Spa products are creating complete entertaining experiences, investing in both the infrastructure for hosting (pools, spas) and the convenience of food delivery to maximize their time with guests rather than cooking.`;
    }
    
    // Audio & Electronics
    if (target.includes('audio') || target.includes('speaker') || target.includes('headphone')) {
      if (overlap.includes('nursing') || overlap.includes('baby') || overlap.includes('feeding')) return 'New parents frequently purchase audio products like wireless headphones or smart speakers to listen to podcasts, audiobooks, or calming music during extended nursing and feeding sessions, allowing them to stay engaged or relax hands-free without disturbing their baby.';
      if (overlap.includes('speaker')) return 'Customers investing in speakers are typically building or enhancing a complete audio setup, creating a prime opportunity to cross-sell complementary components like receivers, amplifiers, or high-resolution audio sources to power and optimize their listening experience.';
      if (overlap.includes('gaming') || overlap.includes('console')) return 'Video game console buyers seek immersive experiences and competitive advantages, driving demand for high-quality audio products like gaming headsets or surround sound systems to enhance gameplay, clear communication, and deeper immersion.';
      if (overlap.includes('home')) return 'Audio enthusiasts often invest in smart home systems and home theater setups, creating natural ecosystem purchases for integrated entertainment experiences.';
      if (overlap.includes('automotive') || overlap.includes('vehicle')) return 'Audio buyers frequently upgrade car audio systems and invest in portable speakers for vehicles, seeking premium sound quality in all environments.';
      if (overlap.includes('computer')) return 'Computer and audio equipment are frequently purchased together by tech enthusiasts building complete workstation or entertainment setups.';
      if (overlap.includes('camera') || overlap.includes('video')) return 'Content creators and videographers need high-quality audio equipment to complement their camera gear, ensuring professional-grade sound capture for their productions.';
    }
    
    // Apparel & Outerwear
    if (target.includes('outerwear') || target.includes('jacket') || target.includes('coat')) {
      if (overlap.includes('camping') || overlap.includes('hiking')) return 'Camping & Hiking enthusiasts require performance-driven outerwear to protect against unpredictable weather and maintain comfort during their outdoor adventures, creating a prime opportunity to cross-promote technical jackets and pants as essential gear for preparedness.';
      if (overlap.includes('camera') || overlap.includes('optic')) return 'Outdoor photographers and nature enthusiasts need durable, weather-protective outerwear to comfortably endure extended periods in diverse environments. Promote technical outerwear with features like accessible pockets and weather resistance, highlighting how it enhances their ability to capture moments while protecting themselves and their valuable equipment.';
      if (overlap.includes('ski') || overlap.includes('snow')) return 'Winter sports enthusiasts require specialized insulated outerwear with moisture-wicking and windproof capabilities to maintain comfort and safety in extreme cold weather conditions.';
      if (overlap.includes('apparel') || overlap.includes('clothing')) return 'Fashion-conscious consumers who purchase outerwear often complete their wardrobe with coordinating apparel pieces to create cohesive, stylish outfits for various occasions and weather conditions.';
    }
    
    // Baby & Toddler
    if (target.includes('baby') || target.includes('toddler') || target.includes('nursing') || target.includes('infant')) {
      if (overlap.includes('home') || overlap.includes('furniture')) return 'New parents need to baby-proof their homes and create safe nursery spaces, driving purchases of safety equipment, furniture, and storage solutions alongside baby care products.';
      if (overlap.includes('automotive') || overlap.includes('vehicle')) return 'Parents frequently purchase car seats, strollers, and other travel accessories as they prepare for mobility with their children, creating natural cross-selling opportunities.';
      if (overlap.includes('clothing') || overlap.includes('apparel')) return 'Parents buy baby clothes in multiples across various sizes, often coordinating with their own wardrobe for family photos and outings.';
      if (overlap.includes('health') || overlap.includes('beauty') || overlap.includes('foot care')) return 'New parents invest in specialized baby health and hygiene products, from skincare to thermometers, as they prioritize their infant\'s wellbeing.';
      if (overlap.includes('cook') || overlap.includes('bak') || overlap.includes('kitchen')) return 'Parents with babies are preparing more homemade meals, baby food, and nutritious snacks, driving purchases of cookware, baking supplies, and kitchen equipment as they prioritize healthy eating for their growing families.';
      if (overlap.includes('camping') || overlap.includes('hiking') || overlap.includes('outdoor')) return 'Active parents who purchase baby safety products also invest in outdoor gear and camping equipment, seeking to maintain their adventurous lifestyle while safely including their young children in family activities.';
      if (overlap.includes('fitness') || overlap.includes('exercise')) return 'Health-conscious parents prioritize both their baby\'s safety and their own wellness, purchasing fitness equipment and exercise products as they work to regain pre-pregnancy fitness and maintain healthy, active family lifestyles.';
    }
    
    // Sporting Goods
    if (target.includes('golf') || target.includes('sport') || target.includes('fitness')) {
      if (overlap.includes('apparel') || overlap.includes('clothing')) return 'Sports enthusiasts purchase specialized performance clothing, shoes, and accessories to enhance comfort, functionality, and style during their activities.';
      if (overlap.includes('automotive') || overlap.includes('vehicle')) return 'Active sports enthusiasts need specialized vehicle accessories for transporting equipment safely, from golf club holders to bike racks and storage solutions.';
      if (overlap.includes('outdoor') || overlap.includes('camping')) return 'Active individuals often enjoy multiple outdoor activities, leading to purchases of camping, hiking, and other recreational gear to support their adventurous lifestyle.';
      if (overlap.includes('electronics')) return 'Fitness and sports enthusiasts invest in wearable technology, GPS devices, and performance tracking equipment to monitor progress and optimize their training.';
    }
    
    // Home & Garden
    if (target.includes('home') || target.includes('garden') || target.includes('furniture')) {
      if (overlap.includes('tool') || overlap.includes('hardware')) return 'Home improvement projects often require specialized tools and equipment, driving cross-category purchases as homeowners tackle DIY projects and maintenance tasks.';
      if (overlap.includes('automotive')) return 'Homeowners frequently need automotive supplies for maintaining their vehicles, power equipment, and outdoor tools, creating natural bundling opportunities.';
      if (overlap.includes('outdoor') || overlap.includes('patio')) return 'Home and garden enthusiasts often expand into outdoor living spaces, purchasing patio furniture, grills, and recreational equipment to enhance their property.';
      if (overlap.includes('decor') || overlap.includes('art')) return 'Homeowners invest in decorative items and artwork to personalize their living spaces, creating opportunities to cross-sell complementary home accessories.';
    }
    
    // Plumbing & Hardware
    if (target.includes('plumbing') || target.includes('plumber') || target.includes('pipe') || target.includes('faucet')) {
      if (overlap.includes('clean')) return 'Plumbing projects often create cleaning needs, and homeowners tackling plumbing repairs simultaneously invest in cleaning supplies to maintain their bathrooms, kitchens, and work areas during and after installations.';
      if (overlap.includes('tool') || overlap.includes('hardware')) return 'DIY plumbers and homeowners need specialized tools like pipe wrenches, drain snakes, and sealants, creating bundled purchasing opportunities for plumbing and hardware supplies.';
      if (overlap.includes('home') || overlap.includes('furniture') || overlap.includes('chair')) return 'Homeowners undertaking plumbing repairs are often in the midst of broader home renovation or maintenance projects, making them receptive to furniture and home improvement cross-sells during their active project phase.';
      if (overlap.includes('medical') || overlap.includes('health')) return 'Homeowners are practical, maintenance-focused individuals who take a DIY approach to both home repairs and personal health, investing in preventive care and first-aid supplies alongside home improvement needs.';
      if (overlap.includes('food') || overlap.includes('beverage')) return 'Active homeowners managing plumbing projects often stock up on household essentials including food and beverages, reflecting their practical, bulk-buying mindset during home improvement shopping trips.';
      if (overlap.includes('event') || overlap.includes('ticket')) return 'Homeowners investing in plumbing are typically established, family-oriented individuals who also spend on experiences and entertainment, indicating disposable income and a balanced approach to home maintenance and leisure.';
    }
    
    // Pet Supplies
    if (target.includes('pet') || target.includes('animal') || target.includes('dog') || target.includes('cat')) {
      if (overlap.includes('home') || overlap.includes('furniture')) return 'Pet owners often need home modifications like gates, furniture protection, pet beds, and specialized storage solutions to accommodate their pets comfortably.';
      if (overlap.includes('automotive') || overlap.includes('vehicle')) return 'Pet owners frequently purchase car accessories such as seat covers, barriers, and carriers for safely and comfortably transporting their pets.';
      if (overlap.includes('outdoor') || overlap.includes('camping')) return 'Pet owners who enjoy outdoor activities purchase camping gear, hiking accessories, and travel products designed for adventures with their furry companions.';
      if (overlap.includes('health') || overlap.includes('grooming')) return 'Pet owners invest in grooming supplies and health products to maintain their pets\' wellbeing, creating opportunities for subscription and repeat purchases.';
    }
    
    // Technology & Computers
    if (target.includes('computer') || target.includes('tech') || target.includes('electronic')) {
      if (overlap.includes('audio') || overlap.includes('speaker')) return 'Computer users purchase audio equipment like speakers, headsets, and microphones to enhance their workstation or gaming setup for better sound quality and communication.';
      if (overlap.includes('home') || overlap.includes('furniture')) return 'Tech enthusiasts invest in smart home devices, home office furniture, and organizational solutions to create optimized work-from-home or entertainment environments.';
      if (overlap.includes('gaming')) return 'Computer users frequently purchase gaming accessories, peripherals, and entertainment equipment to enhance their leisure and productivity experiences.';
      if (overlap.includes('camera') || overlap.includes('video')) return 'Tech-savvy consumers invest in cameras and video equipment for content creation, video conferencing, or creative projects, complementing their computer setups.';
    }
    
    // Cameras & Photography
    if (target.includes('camera') || target.includes('photo') || target.includes('optic')) {
      if (overlap.includes('outdoor') || overlap.includes('camping')) return 'Photography enthusiasts who venture outdoors need rugged camera bags, weather protection, and specialized accessories for capturing nature and landscape photography.';
      if (overlap.includes('computer') || overlap.includes('tech')) return 'Photographers require powerful computers and storage solutions for editing high-resolution images and videos, managing large media libraries, and professional post-production work.';
      if (overlap.includes('travel') || overlap.includes('luggage')) return 'Travel photographers invest in specialized camera bags, protective cases, and travel accessories to safely transport their valuable equipment on adventures.';
    }
    
    // Food & Beverage
    if (target.includes('coffee') || target.includes('tea') || target.includes('beverage') || target.includes('wine') || target.includes('beer') || target.includes('alcohol')) {
      if (overlap.includes('food') || overlap.includes('condiment') || overlap.includes('sauce')) return 'Food and beverage enthusiasts often purchase complementary items together, creating natural pairing opportunities for coffee with breakfast items, wine with gourmet foods, or craft beer with snacks and appetizers.';
      if (overlap.includes('kitchen') || overlap.includes('home') || overlap.includes('furniture') || overlap.includes('bed')) return 'Coffee and beverage enthusiasts create comfortable home rituals, investing in furniture, bedding, and home goods to enhance their morning routines and relaxation spaces where they enjoy their favorite drinks.';
      if (overlap.includes('subscription') || overlap.includes('gift')) return 'Premium beverage buyers appreciate quality and convenience, making them prime candidates for subscription services, gift sets, and curated product bundles.';
      if (overlap.includes('clean')) return 'Coffee, tea, and wine enthusiasts need specialized cleaning products to maintain their equipment, glassware, and brewing devices, creating cross-selling opportunities for maintenance supplies.';
      if (overlap.includes('book') || overlap.includes('music') || overlap.includes('entertain')) return 'Beverage consumers often pair drinks with relaxation and entertainment, purchasing books, music, or streaming subscriptions to enhance their leisure time rituals.';
      if (overlap.includes('advertis') || overlap.includes('marketing') || overlap.includes('business')) return 'Coffee buyers, especially those in professional services and marketing, fuel their workdays with caffeine, creating opportunities for workplace-focused product bundles and professional development resources.';
      if (overlap.includes('vision') || overlap.includes('health') || overlap.includes('care') || overlap.includes('foot')) return 'Health-conscious coffee and tea drinkers invest in wellness products, viewing beverages as part of their daily self-care routine alongside vitamins, supplements, and health monitoring.';
      if (overlap.includes('software') || overlap.includes('computer') || overlap.includes('tech')) return 'Professional coffee drinkers, especially remote workers and tech professionals, purchase software and productivity tools to optimize their home office setups where coffee fuels their workday.';
      if (overlap.includes('sign') || overlap.includes('office decor') || overlap.includes('display')) return 'Coffee shop owners and home entertainers purchase signage, menu boards, and decorative displays to create inviting spaces that showcase their beverage offerings and enhance the customer or guest experience.';
    }
    
    // Health & Wellness
    if (target.includes('vitamin') || target.includes('supplement') || target.includes('medical') || target.includes('health care') || target.includes('first aid')) {
      if (overlap.includes('fitness') || overlap.includes('sport') || overlap.includes('athletic')) return 'Health-conscious consumers who purchase vitamins and supplements often invest in fitness equipment and athletic gear, reflecting a holistic approach to wellness and performance optimization.';
      if (overlap.includes('food') || overlap.includes('organic') || overlap.includes('nutrition')) return 'Supplement buyers prioritize nutrition and wellness, frequently purchasing organic foods, protein powders, and healthy snacks as part of their comprehensive health regimen.';
      if (overlap.includes('book') || overlap.includes('education')) return 'Health-focused consumers actively research wellness topics, investing in educational materials, health books, and online courses to inform their supplement and health product choices.';
      if (overlap.includes('home') || overlap.includes('clean')) return 'Wellness-oriented individuals extend their health consciousness to their living spaces, purchasing natural cleaning products, air purifiers, and home organization solutions.';
      if (overlap.includes('baby') || overlap.includes('family')) return 'Health-conscious parents prioritize wellness for their entire family, purchasing vitamins, supplements, and medical supplies for both themselves and their children.';
    }
    
    // Office & Business Supplies
    if (target.includes('office') || target.includes('business suppli') || target.includes('stationery') || target.includes('printer')) {
      if (overlap.includes('computer') || overlap.includes('tech') || overlap.includes('software')) return 'Office supply buyers are setting up or maintaining workspaces, creating natural bundling opportunities with computers, software, and tech accessories for complete home office solutions.';
      if (overlap.includes('furniture') || overlap.includes('chair') || overlap.includes('desk')) return 'Professionals purchasing office supplies are often furnishing their workspaces, making them receptive to ergonomic furniture, storage solutions, and organizational systems.';
      if (overlap.includes('coffee') || overlap.includes('snack') || overlap.includes('food')) return 'Office workers and home-based professionals stock their workspaces with coffee, snacks, and beverages to fuel productivity during long work sessions.';
      if (overlap.includes('book') || overlap.includes('education')) return 'Business supply buyers value organization and productivity, often investing in educational materials, business books, and professional development resources.';
      if (overlap.includes('clean')) return 'Organized professionals maintain clean, efficient workspaces, purchasing cleaning supplies, sanitizers, and organizational products alongside office essentials.';
    }
    
    // Books & Educational Materials
    if (target.includes('book') || target.includes('education') || target.includes('learning')) {
      if (overlap.includes('coffee') || overlap.includes('tea') || overlap.includes('beverage')) return 'Book lovers often create cozy reading rituals pairing their favorite books with coffee, tea, or wine, making beverages natural complementary purchases.';
      if (overlap.includes('furniture') || overlap.includes('chair') || overlap.includes('lighting')) return 'Avid readers invest in comfortable reading spaces, purchasing chairs, lamps, bookshelves, and furniture to create dedicated reading nooks.';
      if (overlap.includes('office') || overlap.includes('stationery')) return 'Book buyers value learning and note-taking, often purchasing journals, highlighters, bookmarks, and office supplies to enhance their reading experience.';
      if (overlap.includes('gift') || overlap.includes('subscription')) return 'Book enthusiasts appreciate curated experiences, making them prime candidates for book subscriptions, gift sets, and literary merchandise.';
      if (overlap.includes('tech') || overlap.includes('tablet') || overlap.includes('e-reader')) return 'Modern readers embrace both physical and digital formats, purchasing tablets, e-readers, and accessories to complement their book collections.';
    }
    
    // Art & Creative Supplies
    if (target.includes('art suppli') || target.includes('craft') || target.includes('creative')) {
      if (overlap.includes('furniture') || overlap.includes('storage') || overlap.includes('organiz')) return 'Artists and crafters need dedicated creative spaces, investing in storage solutions, craft tables, and organizational systems to manage their materials and projects.';
      if (overlap.includes('book') || overlap.includes('education') || overlap.includes('instruction')) return 'Creative enthusiasts constantly learn new techniques, purchasing instructional books, online courses, and educational materials to develop their artistic skills.';
      if (overlap.includes('gift') || overlap.includes('party')) return 'Craft enthusiasts create personalized gifts and decorations, frequently purchasing supplies for handmade presents, party favors, and special occasion projects.';
      if (overlap.includes('office') || overlap.includes('paper')) return 'Artists and crafters use office supplies as creative materials, cross-purchasing paper, adhesives, cutting tools, and organizational products for their projects.';
    }
    
    // Fashion Accessories
    if (target.includes('jewelry') || target.includes('watch') || target.includes('accessory')) {
      if (overlap.includes('clothing') || overlap.includes('apparel') || overlap.includes('fashion')) return 'Fashion-conscious consumers who invest in jewelry and watches are building complete outfits, creating opportunities to cross-sell coordinating apparel and accessories.';
      if (overlap.includes('gift') || overlap.includes('occasion')) return 'Jewelry and watches are popular gift items for special occasions, with buyers often purchasing gift wrap, cards, and complementary presents for birthdays, anniversaries, and holidays.';
      if (overlap.includes('beauty') || overlap.includes('cosmetic') || overlap.includes('fragrance')) return 'Style-conscious consumers view fashion, beauty, and accessories as interconnected, investing in jewelry to complement their beauty routines and fragrance choices.';
      if (overlap.includes('luggage') || overlap.includes('travel')) return 'Fashion-forward travelers purchase jewelry cases, travel organizers, and protective accessories to safely transport their valuable items during trips.';
    }
    
    // Luggage & Travel Gear
    if (target.includes('luggage') || target.includes('travel bag') || target.includes('suitcase') || target.includes('backpack')) {
      if (overlap.includes('clothing') || overlap.includes('apparel')) return 'Travelers purchasing luggage are often preparing for trips, creating natural bundling opportunities with travel clothing, packing cubes, and weather-appropriate apparel.';
      if (overlap.includes('camera') || overlap.includes('electronic') || overlap.includes('tech')) return 'Modern travelers protect their devices and gear, investing in specialized bags, electronics organizers, and protective cases alongside their main luggage.';
      if (overlap.includes('book') || overlap.includes('entertain')) return 'Travelers stock up on entertainment for long journeys, purchasing books, magazines, headphones, and portable entertainment to enhance their travel experience.';
      if (overlap.includes('health') || overlap.includes('personal care')) return 'Frequent travelers invest in travel-sized toiletries, first aid kits, and health essentials to stay prepared and comfortable during trips.';
      if (overlap.includes('gift') || overlap.includes('souvenir')) return 'Travel enthusiasts often purchase gifts and souvenirs during trips, creating opportunities for luggage accessories, gift bags, and expandable storage solutions.';
    }
    
    // Vehicles & Transportation
    if (target.includes('motorcycle') || target.includes('bicycle') || target.includes('bike') || target.includes('marine') || target.includes('boat')) {
      if (overlap.includes('apparel') || overlap.includes('clothing') || overlap.includes('safety')) return 'Vehicle enthusiasts invest in specialized safety gear, protective clothing, helmets, and weather-resistant apparel designed for their specific mode of transportation.';
      if (overlap.includes('tool') || overlap.includes('maintenance') || overlap.includes('repair')) return 'Vehicle owners are DIY-oriented, purchasing tools, maintenance supplies, and repair equipment to service their motorcycles, bicycles, or boats themselves.';
      if (overlap.includes('storage') || overlap.includes('garage') || overlap.includes('rack')) return 'Vehicle owners need storage solutions, investing in racks, covers, locks, and garage organization systems to protect and maintain their investments.';
      if (overlap.includes('camera') || overlap.includes('gopro') || overlap.includes('action')) return 'Adventure enthusiasts document their experiences, purchasing action cameras, mounts, and recording equipment to capture their rides and journeys.';
      if (overlap.includes('outdoor') || overlap.includes('camping')) return 'Motorcycle and bicycle enthusiasts embrace outdoor adventures, frequently purchasing camping gear, hiking equipment, and outdoor accessories for extended trips.';
    }
    
    // Musical Instruments & Audio
    if (target.includes('musical instrument') || target.includes('guitar') || target.includes('piano') || target.includes('drum')) {
      if (overlap.includes('audio') || overlap.includes('speaker') || overlap.includes('headphone')) return 'Musicians invest in audio equipment to practice, record, and enhance their sound, creating bundled opportunities for amplifiers, headphones, and recording interfaces.';
      if (overlap.includes('furniture') || overlap.includes('storage') || overlap.includes('stand')) return 'Musicians need dedicated spaces for practice and storage, purchasing stands, cases, furniture, and organizational solutions for their instruments and equipment.';
      if (overlap.includes('book') || overlap.includes('education') || overlap.includes('lesson')) return 'Aspiring musicians invest in education, purchasing method books, sheet music, online courses, and instructional materials to develop their skills.';
      if (overlap.includes('gift')) return 'Musical instruments are meaningful gifts for birthdays, holidays, and milestones, with buyers often purchasing accessories, cases, and starter bundles.';
    }
    
    // Party Supplies & Celebrations
    if (target.includes('party') || target.includes('celebration') || target.includes('event') || target.includes('decoration')) {
      if (overlap.includes('food') || overlap.includes('beverage') || overlap.includes('cake')) return 'Event planners purchase food, beverages, and catering supplies alongside decorations to create complete party experiences for their celebrations.';
      if (overlap.includes('gift') || target.includes('card')) return 'Party hosts buy gifts, gift wrap, and greeting cards for the guests of honor, creating natural bundling opportunities with party supplies.';
      if (overlap.includes('furniture') || overlap.includes('table') || overlap.includes('chair')) return 'Event hosts invest in entertaining furniture, renting or purchasing tables, chairs, and serving pieces to accommodate guests during celebrations.';
      if (overlap.includes('music') || overlap.includes('entertain') || overlap.includes('game')) return 'Successful parties need entertainment, driving purchases of music playlists, party games, and entertainment equipment alongside decorations.';
      if (overlap.includes('camera') || overlap.includes('photo')) return 'Memory-making is central to celebrations, with party hosts investing in photo props, instant cameras, and photo booth equipment to capture special moments.';
    }
    
    // General insights based on overlap percentage and segment similarity
    if (percentage > 50) {
      return `Strong ${percentage.toFixed(0)}% overlap reveals these aren't random buyers—they're purposeful consumers with coordinated purchase patterns. This represents qualified, high-intent audiences making planned investments across complementary lifestyle categories.`;
    } else if (percentage > 30) {
      return `Moderate ${percentage.toFixed(0)}% overlap indicates strategic consumers who coordinate purchases across ${overlap} and ${target} categories, suggesting sophisticated shopping behavior and higher lifetime value potential through their demonstrated cross-category purchase intent.`;
    } else {
      return `This ${percentage.toFixed(0)}% overlap reveals a shared interest area that can be leveraged for targeted campaigns, particularly through content marketing that highlights the lifestyle connections between ${overlap} and ${target} products.`;
    }
  }

  /**
   * Generate AI-powered cross-purchase insights using Gemini with enhanced context
   */
  private async generateAICrossPurchaseInsight(targetSegment: string, overlapSegment: string, percentage: number): Promise<string> {
    const gemini = this.getGeminiService();
    if (!gemini) {
      throw new Error('Gemini service not available');
    }

    // Get geographic context for enhanced insights
    const geographicContext = await this.getGeographicOverlapContext(targetSegment, overlapSegment);

    const prompt = `You are analyzing cross-purchase patterns from real commerce transaction data. Your task is to generate a COMPELLING, ACTIONABLE insight that reveals the specific mindset and motivations driving this consumer overlap.

TARGET AUDIENCE: "${targetSegment}"
OVERLAP AUDIENCE: "${overlapSegment}" 
OVERLAP PERCENTAGE: ${percentage.toFixed(1)}%
${geographicContext ? `GEOGRAPHIC CONTEXT: ${geographicContext}` : ''}

TASK: Generate a SINGLE insight (2-3 sentences max) that reveals the SPECIFIC CONSUMER MINDSET and underlying motivations, with actionable implications for marketing.

STRICTLY FORBIDDEN - DO NOT USE ANY OF THESE GENERIC PHRASES:
   - "share similar lifestyles and shopping behaviors"
   - "prime cross-selling opportunities" 
   - "bundled promotions and targeted messaging"
   - "broader interest or need"
   - "show cross-category purchase behavior"
   - "comprehensive shoppers"
   - "related categories"
   - "demographic similarities"
   - "market segment overlap"
   - "Cross-category buyers demonstrating broader lifestyle interests"
   - "This X% overlap reveals a shared interest area"

REQUIREMENTS:
1. Dig into the SPECIFIC PSYCHOLOGICAL PROFILE and motivations
2. Identify the EXACT MINDSET, values, or life circumstances driving both purchases
3. Think about the CONTEXT, timing, or decision-making process
4. Focus on ACTIONABLE HUMAN BEHAVIOR, not category descriptions
5. Consider life circumstances, personal goals, or situational needs
6. Make it COMPELLING and SPECIFIC - avoid generic statements
7. Include SPECIFIC CROSS-SELLING STRATEGIES (not just "content marketing")
8. Mention GEOGRAPHIC or DEMOGRAPHIC patterns if relevant
9. Suggest TIMING or SEQUENCING of purchases

EXAMPLES OF DEEP, ACTIONABLE INSIGHTS:
- "Pool & Spa buyers are frequently hosting guests and entertaining, making them prime targets for food delivery services like Uber Eats or DoorDash who can conveniently deliver meals while they're relaxing by the pool instead of spending time in the kitchen."
- "Condoms and shaving & grooming buyers are both preparing for intimate encounters - they're conscientious about personal presentation and responsible preparation for physical relationships."
- "3D printer and activewear buyers share a maker mentality: they're hands-on innovators who prefer creating solutions over buying ready-made products, applying this DIY approach to both technology and fitness."
- "Building materials and activewear buyers embody a 'fixer' mindset - they're practical people who take control of their environment through both home improvement projects and personal fitness maintenance."
- "Baby & Toddler buyers include new parents who are simultaneously preparing for their children while purchasing items for themselves, creating natural cross-category shopping patterns during this high-spending life stage."

Now analyze "${targetSegment}" and "${overlapSegment}" with ${percentage.toFixed(1)}% overlap. Think about the SPECIFIC MINDSET and MOTIVATIONS of someone who buys both. Generate ONE compelling, actionable insight:`;

    try {
      const result = await gemini['model'].generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean up the response and ensure it's a reasonable length
      let insight = responseText.trim();
      
      // Remove any quotes if the entire response is wrapped in them
      if (insight.startsWith('"') && insight.endsWith('"')) {
        insight = insight.slice(1, -1);
      }
      
      // Ensure it's not too long for the UI (max ~200 characters), but keep complete thoughts
      if (insight.length > 200) {
        // Try to find complete sentences that fit within the limit
        const sentences = insight.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
        let result = '';
        let charCount = 0;
        
        for (let sentence of sentences) {
          sentence = sentence.trim();
          // Add back punctuation and space
          const sentenceWithPunctuation = sentence + '.';
          const testLength = charCount + sentenceWithPunctuation.length + (result ? 1 : 0);
          
          if (testLength <= 200) {
            result = result ? result + ' ' + sentenceWithPunctuation : sentenceWithPunctuation;
            charCount = testLength;
          } else {
            break;
          }
        }
        
        if (result.length > 0) {
          insight = result;
        } else {
          // Fallback: truncate at word boundary
          const words = insight.substring(0, 200).split(' ');
          words.pop(); // Remove last word that might be cut off
          insight = words.join(' ');
        }
      }
      
      return insight;
    } catch (error) {
      console.error(`Error generating AI cross-purchase insight:`, error);
      throw error;
    }
  }

  /**
   * Generate strategic insights with Gemini
   */
  /**
   * Generate AI-powered persona with visual description
   */
  private async generateAIPersona(
    segment: string,
    category: string,
    demographics: any,
    overlaps: any[],
    geoIntelligence: any,
    commerceBaseline: any
  ): Promise<{ name: string; emoji: string; description: string }> {
    // OPTIMIZATION: Check cache first
    const cacheKey = `persona_${segment}_${category}`;
    if (this.aiResponseCache.has(cacheKey)) {
      console.log(`💨 Using cached AI persona for ${segment}`);
      return this.aiResponseCache.get(cacheKey);
    }
    
    console.log(`👤 Generating AI persona for: "${segment}"`);

    const vsCommerce = {
      income: ((demographics.medianHHI / commerceBaseline.medianHHI) - 1) * 100,
      education: ((demographics.educationBachelors / commerceBaseline.educationBachelorsPlus) - 1) * 100,
    };

    const prompt = `You are creating a vivid, memorable persona for the "${segment}" audience (${category} category).

DATA CONTEXT:
- Income: $${demographics.medianHHI.toFixed(0)} (${vsCommerce.income >= 0 ? '+' : ''}${vsCommerce.income.toFixed(1)}% vs typical online shopper)
- Age: ${demographics.topAgeBracket}, median ${demographics.medianAge.toFixed(1)} years
- Education: ${demographics.educationProfile}
- Family: ${demographics.familyProfile}, ${demographics.avgHouseholdSize.toFixed(1)} people per household
- Location: ${geoIntelligence.topCities.slice(0, 3).map((c: any) => `${c.city} ${c.state}`).join(', ')}
- Lifestyle: ${demographics.lifestyle?.selfEmployed && demographics.lifestyle.selfEmployed > 12 ? `${demographics.lifestyle.selfEmployed.toFixed(0)}% entrepreneurs, ` : ''}${demographics.lifestyle?.avgCommuteTime && demographics.lifestyle.avgCommuteTime > 25 ? `${demographics.lifestyle.avgCommuteTime.toFixed(0)}-min commute, ` : ''}${demographics.lifestyle?.stemDegree && demographics.lifestyle.stemDegree > 15 ? `tech-savvy (${demographics.lifestyle.stemDegree.toFixed(0)}% STEM), ` : ''}${demographics.lifestyle?.charitableGivers && demographics.lifestyle.charitableGivers > 40 ? `values-driven (${demographics.lifestyle.charitableGivers.toFixed(0)}% donate)` : 'typical lifestyle'}
- Top Overlap: ${overlaps[0]?.segment || 'N/A'} (${overlaps[0]?.overlapPercentage.toFixed(1) || '0'}%)

TASK: Create a persona that brings this audience to life visually and emotionally.

Return ONLY valid JSON in this exact format:
{
  "name": "The [Adjective] [Segment] [Descriptor]" (e.g., "The Affluent Coffee Enthusiast", "The Family-First Baby Monitor Parent", "The Tech-Savvy Fitness Tracker User"),
  "emoji": "single emoji that represents this category/segment" (e.g., ☕ for coffee, 👶 for baby products, 💪 for fitness),
  "description": "Paint a vivid picture in 2-3 sentences. Describe what they LOOK like doing on a typical Saturday morning, what's in their shopping cart, where they live, what they care about. Make it visual and specific - cite the data (income, location, lifestyle) but make it human and relatable. Example: 'Picture them at 7am in their suburban Ashburn home, brewing premium coffee while meal-prepping organic lunches for their two kids before a $95k dual-income workday. Their Amazon cart mixes baby monitors with home office upgrades—safety and productivity in equal measure. They're nest-builders: 78% homeowners who research extensively, prioritize wellness (62% buy organic), and invest in long-term quality over quick fixes.'"
}`;

    const gemini = this.getGeminiService();
    if (!gemini) {
      console.log('⚠️  Gemini not available, using rule-based persona');
      return {
        name: this.generatePersonaName(segment, demographics, overlaps, commerceBaseline),
        emoji: this.getEmojiForCategory(category, segment),
        description: `The ${segment} audience represents ${demographics.affluenceLevel.toLowerCase()} consumers with a median income of $${demographics.medianHHI.toFixed(0)}, primarily in the ${demographics.topAgeBracket} age range, concentrated in ${geoIntelligence.topCities[0]?.city}, ${geoIntelligence.topCities[0]?.state} and similar markets.`
      };
    }

    try {
      const result = await gemini['model'].generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonStr = responseText.substring(firstBrace, lastBrace + 1);
        const persona = JSON.parse(jsonStr);
        console.log(`✅ AI Persona: "${persona.name}" ${persona.emoji}`);
        this.aiResponseCache.set(cacheKey, persona);
        return persona;
      }
      
      throw new Error('Could not extract JSON from Gemini response');
    } catch (error) {
      console.error('❌ Error generating AI persona:', error);
      const fallback = {
        name: this.generatePersonaName(segment, demographics, overlaps, commerceBaseline),
        emoji: this.getEmojiForCategory(category, segment),
        description: `The ${segment} audience represents ${demographics.affluenceLevel.toLowerCase()} consumers with a median income of $${demographics.medianHHI.toFixed(0)}, primarily in the ${demographics.topAgeBracket} age range, concentrated in ${geoIntelligence.topCities[0]?.city}, ${geoIntelligence.topCities[0]?.state} and similar markets.`
      };
      this.aiResponseCache.set(cacheKey, fallback);
      return fallback;
    }
  }

  private async generateStrategicInsights(
    segment: string,
    category: string,
    demographics: any,
    overlaps: any[],
    geoIntelligence: any,
    commerceBaseline: any  // NEW: commerce baseline for context
  ) {
    // OPTIMIZATION: Check cache first
    const cacheKey = `strategic_${segment}_${category}`;
    if (this.aiResponseCache.has(cacheKey)) {
      console.log(`💨 Using cached strategic insights for ${segment}`);
      return this.aiResponseCache.get(cacheKey);
    }
    
    console.log(`✨ Generating strategic insights with Gemini for: "${segment}"`);
    
    // Calculate commerce baseline comparisons
    const vsCommerce = {
      income: ((demographics.medianHHI / commerceBaseline.medianHHI) - 1) * 100,
      education: ((demographics.educationBachelors / commerceBaseline.educationBachelorsPlus) - 1) * 100,
    };

    const prompt = `You are Gemini 2.5 Flash, analyzing real purchase data from Sovrn's 2M+ commerce transactions combined with US Census demographics for 41,000+ ZIP codes.

MISSION: Generate world-class, data-driven marketing strategy for the "${segment}" Commerce Audience (${category} category) that a Fortune 500 CMO would pay $50,000 for.

=== IMPORTANT CONTEXT: SELECTION BIAS ===
This segment is PRE-SELECTED from high-commerce-activity ZIPs. ALL commerce segments over-index vs US national average due to:
1. Higher purchasing power (online shoppers have more disposable income)
2. Tech access (internet, devices, credit cards)
3. Peak earning age (30-50 typical)

THEREFORE: Focus on comparing to "Commerce Baseline" (typical online shopper) NOT national average.

COMMERCE BASELINE (Typical Online Shopper):
- Median HHI: $${commerceBaseline.medianHHI.toLocaleString()}
- Education: ${commerceBaseline.educationBachelorsPlus.toFixed(1)}% Bachelor's+
- Age: ${commerceBaseline.medianAge.toFixed(1)} years

${segment} vs Commerce Baseline:
- Income: ${vsCommerce.income >= 0 ? '+' : ''}${vsCommerce.income.toFixed(1)}% ${vsCommerce.income > 15 ? '(Above-Average Shopper)' : vsCommerce.income > -15 ? '(Typical Shopper)' : '(Value-Conscious Shopper)'}
- Education: ${vsCommerce.education >= 0 ? '+' : ''}${vsCommerce.education.toFixed(1)}% ${vsCommerce.education > 15 ? '(More Educated)' : vsCommerce.education > -15 ? '(Typical Education)' : '(Trade-Skilled/Blue-Collar)'}

THIS IS THE KEY DIFFERENTIATION - use this to position the segment!

=== RICH DEMOGRAPHIC CONTEXT ===
Based on top ${demographics.validZipCount} ZIPs representing this audience:

INCOME & AFFLUENCE:
- Median Household Income: $${demographics.medianHHI.toFixed(0)}
- vs US National: ${demographics.medianHHIvsNational >= 0 ? '+' : ''}${demographics.medianHHIvsNational.toFixed(1)}% (ignore - selection bias)
- vs Commerce Baseline: ${vsCommerce.income >= 0 ? '+' : ''}${vsCommerce.income.toFixed(1)}% ⭐ USE THIS
- Affluence Level: ${demographics.affluenceLevel}
- Six-figure households: ${demographics.sixFigureRate.toFixed(0)}% (vs 22% national)
- Income distribution: ${demographics.incomeDistribution.map((d: any) => `${d.bracket}: ${d.percentage.toFixed(0)}%`).join(', ')}

AGE & LIFE STAGE:
- Median Age: ${demographics.medianAge.toFixed(1)} years
- Dominant bracket: ${demographics.topAgeBracket}
- Distribution: ${demographics.ageDistribution.map((d: any) => `${d.bracket}: ${d.percentage.toFixed(0)}%`).join(', ')}

EDUCATION & EMPLOYMENT:
- Bachelor's degree+: ${demographics.educationBachelors.toFixed(1)}% (${demographics.educationVsNational >= 0 ? '+' : ''}${demographics.educationVsNational.toFixed(1)}% vs national)
- Profile: ${demographics.educationProfile}
- KEY INSIGHT: ${demographics.educationProfile === 'Blue-Collar/Trade-Skilled' ? 'Despite higher income, lower formal education suggests skilled trades, entrepreneurship, or technical expertise' : demographics.educationProfile === 'College-Educated' ? 'Professional/knowledge workers with formal credentials' : 'Mixed backgrounds with diverse skill sets'}

FAMILY & HOUSEHOLD:
- Profile: ${demographics.familyProfile}
- Average household size: ${demographics.avgHouseholdSize.toFixed(1)} people (${demographics.householdSizeVsNational >= 0 ? '+' : ''}${demographics.householdSizeVsNational.toFixed(1)}% vs 2.5 national)
- ZIPs with likely children: ${demographics.zipsWithChildren} of ${demographics.validZipCount} (${(demographics.zipsWithChildren / demographics.validZipCount * 100).toFixed(0)}%)
- Married: ${demographics.lifestyle?.married?.toFixed(1) || 'N/A'}% (${demographics.lifestyle?.married && demographics.lifestyle.married > 50 ? 'joint purchasing decisions, family focus' : 'singles-oriented products'})
- Dual Income: ${demographics.lifestyle?.dualIncome?.toFixed(1) || 'N/A'}% (${demographics.lifestyle?.dualIncome && demographics.lifestyle.dualIncome > 60 ? 'premium buyers, time-constrained' : 'single-income households'})
- KEY INSIGHT: ${demographics.avgHouseholdSize > 2.8 ? 'Larger households suggest families with children - family-oriented messaging recommended' : demographics.avgHouseholdSize > 2.2 ? 'Typical couples/small families' : 'Singles and couples without children'}

LIFESTYLE & WORK:
- Self-Employed: ${demographics.lifestyle?.selfEmployed?.toFixed(1) || 'N/A'}% ${demographics.lifestyle?.selfEmployed && demographics.lifestyle.selfEmployed > 12 ? '⭐ (high - entrepreneurs, B2B opportunity, flexible schedules)' : ''}
- Avg Commute: ${demographics.lifestyle?.avgCommuteTime?.toFixed(0) || 'N/A'} minutes ${demographics.lifestyle?.avgCommuteTime && demographics.lifestyle.avgCommuteTime > 30 ? '⭐ (long - car audio, podcasts, convenience products)' : demographics.lifestyle?.avgCommuteTime && demographics.lifestyle.avgCommuteTime > 0 ? '(moderate commute)' : ''}
- STEM Degree: ${demographics.lifestyle?.stemDegree?.toFixed(1) || 'N/A'}% ${demographics.lifestyle?.stemDegree && demographics.lifestyle.stemDegree > 15 ? '⭐ (high - tech-savvy, early adopters, complex features OK)' : '(avoid technical jargon)'}
- Charitable Givers: ${demographics.lifestyle?.charitableGivers?.toFixed(1) || 'N/A'}% ${demographics.lifestyle?.charitableGivers && demographics.lifestyle.charitableGivers > 40 ? '⭐ (high - values-driven, ethical brands, sustainability, CSR messaging)' : ''}
- KEY INSIGHT: ${demographics.lifestyle?.selfEmployed && demographics.lifestyle.selfEmployed > 12 ? 'High entrepreneurship = B2B cross-sell opportunities, home office products' : ''}${demographics.lifestyle?.avgCommuteTime && demographics.lifestyle.avgCommuteTime > 30 ? 'Long commutes = target 7-9am & 5-7pm with audio/car products, podcasts, convenience' : ''}${demographics.lifestyle?.stemDegree && demographics.lifestyle.stemDegree > 15 ? 'Tech-savvy = early adopter positioning, technical details welcome' : 'Avoid jargon, focus on benefits over features'}${demographics.lifestyle?.charitableGivers && demographics.lifestyle.charitableGivers > 40 ? 'Values-driven = emphasize social impact, sustainability, ethical sourcing' : ''}

HOUSING & LOCATION:
- Profile: ${demographics.locationProfile}
- Home ownership: ${demographics.homeOwnership.toFixed(0)}% (${demographics.homeOwnershipVsNational >= 0 ? '+' : ''}${demographics.homeOwnershipVsNational.toFixed(1)}% vs national)
- Median home value: $${demographics.medianHomeValue.toFixed(0)} (${demographics.homeValueVsNational >= 0 ? '+' : ''}${demographics.homeValueVsNational.toFixed(1)}% vs national)
- Urban/Suburban/Rural: ${demographics.urbanRuralDistribution.map((d: any) => `${d.type}: ${d.percentage.toFixed(0)}%`).join(', ')}

ETHNICITY (for cultural relevance):
- White: ${demographics.ethnicity.white.toFixed(0)}%, Hispanic: ${demographics.ethnicity.hispanic.toFixed(0)}%, Asian: ${demographics.ethnicity.asian.toFixed(0)}%, Black: ${demographics.ethnicity.black.toFixed(0)}%

=== GEOGRAPHIC INTELLIGENCE ===

TOP 5 VOLUME MARKETS (where most audience IS):
${geoIntelligence.topCities.slice(0, 5).map((c: any, i: number) => 
  `${i + 1}. ${c.city}, ${c.state} (${c.zipCount} ZIPs: ${c.zips.slice(0, 3).join(', ')}${c.zipCount > 3 ? '...' : ''})`
).join('\n')}

TOP 5 STATES (by audience volume):
${geoIntelligence.topStates.slice(0, 5).map((s: any, i: number) => 
  `${i + 1}. ${s.state} (${s.zipCount} ZIPs)`
).join('\n')}

TOP 5 PASSION MARKETS (highest over-indexing - where audience DOMINATES):
${geoIntelligence.topOverIndexZips && geoIntelligence.topOverIndexZips.length > 0 ? 
  geoIntelligence.topOverIndexZips.slice(0, 5).map((z: any, i: number) => 
    `${i + 1}. ${z.city}, ${z.state} (ZIP ${z.zipCode}): ${z.overIndex.toFixed(0)}% over-index ⭐ (weight: ${z.weight.toLocaleString()}, pop: ${z.population.toLocaleString()})`
  ).join('\n') : 
  'Data not available for passion markets analysis'}

REGIONAL PATTERNS:
- West Coast: ${geoIntelligence.regionalDistribution.westCoast.toFixed(0)}% (tech hubs, high income)
- East Coast: ${geoIntelligence.regionalDistribution.eastCoast.toFixed(0)}% (urban, professional)
- South: ${geoIntelligence.regionalDistribution.south.toFixed(0)}% (suburban, family-focused)
- Midwest: ${geoIntelligence.regionalDistribution.midwest.toFixed(0)}% (practical, value-conscious)

KEY GEOGRAPHIC INSIGHTS:
- Look for markets appearing in BOTH volume and passion lists → highest ROI potential
- Passion markets reveal cultural fit and niche opportunities for testing
- Volume markets show where to scale after testing

=== BEHAVIORAL OVERLAPS (what else they buy) ===
${overlaps.map((o, i) => `${i + 1}. ${o.segment} (${o.overlapPercentage.toFixed(1)}% overlap)`).join('\n')}

=== YOUR TASK ===

Synthesize ALL the data above into specific, actionable insights. Be SPECIFIC - cite actual cities, percentages, and data points.

EXAMPLE OF EXCELLENCE (for "Baby Monitors" segment):
"targetPersona": "Affluent first-time parents (median age 31, income $95k, 78% homeowners) concentrated in high-growth suburban metros like Ashburn VA and Frisco TX. They're nest-builders making long-term investments—62% purchased homes within 2 years and show 62% overlap with Organic Baby Food, revealing a 'wellness-first parenting' philosophy. Despite being tech-savvy (42% work in tech), they prioritize safety over features and research extensively before purchase."

NOW generate insights of this caliber for "${segment}". Ground EVERY claim in the data above.

Return as JSON:
{
  "targetPersona": "A vivid, 5-sentence narrative synthesizing ALL the data (demographics, geography, overlaps). Include: life stage, WHERE they live (cite top 2-3 cities), income level, family structure, what drives purchases, and non-obvious insights from overlaps. Ground EVERY detail in the data. Use **bold** formatting for key characteristics and important data points.",
  
  "messagingRecommendations": [
    {
      "valueProposition": "Not keywords - VALUE PROPOSITIONS tied to data. E.g., 'Premium Quality for Growing Families'. Use **bold** for key value points.",
      "dataBacking": "cite specific data: 60% suburban homeowners, 45% with children, avg household 3.2 people. Use **bold** for key statistics.",
      "emotionalBenefit": "functional AND emotional benefits. Use **bold** for key emotional drivers.",
      "campaignReady": true
    }
  ],
  
  "channelRecommendations": [
    {
      "platform": "Instagram Reels",
      "targeting": "25-40 year-olds in [TOP 3 CITIES from data]",
      "contentType": "specific content type based on overlaps",
      "timing": "WHEN based on commute times, work schedules",
      "rationale": "Cite the data that supports this recommendation",
      "estimatedPerformance": {
        "expectedCTR": "2.1-2.8%",
        "targetCPM": "$12-18",
        "conversionRate": "1.2-2.1%"
      }
    }
  ],

  "implementationRoadmap": {
    "phase1": {
      "duration": "2-3 weeks",
      "budget": "$5,000-$8,000",
      "actions": [
        "Launch geo-targeted campaigns in top 3 markets",
        "Test 3-4 creative variants per platform"
      ],
      "successMetrics": {
        "CTR": ">2.0%",
        "CPA": "<$65",
        "ROAS": ">3.5x"
      }
    },
    "phase2": {
      "duration": "4-6 weeks",
      "budget": "$15,000-$25,000",
      "actions": [
        "Scale winning creative to additional markets",
        "Implement advanced attribution tracking"
      ],
      "successMetrics": {
        "Volume": "800+ conversions",
        "Efficiency": "20% improvement in CPA"
      }
    }
  },

  "competitiveIntelligence": {
    "marketPosition": "How this segment compares to category averages",
    "whiteSpaceOpportunities": ["Untapped channels or messaging angles"],
    "differentiationAdvantages": ["What makes this audience unique vs competitors"]
  },

  "seasonalOptimization": {
    "peakPeriods": ["When this audience is most active"],
    "opportunityWindows": ["Best times for testing new campaigns"],
    "budgetAllocation": ["Recommended spend distribution across calendar year"]
  }
}

Return ONLY valid JSON, no additional text.`;

    const gemini = this.getGeminiService();
    if (!gemini) {
      console.log('⚠️  Gemini not available, using fallback strategic insights');
      return this.getFallbackStrategicInsights(segment);
    }

    try {
      // Call Gemini directly for JSON generation (not through analyzeQuery which is for deals)
      const result = await gemini['model'].generateContent(prompt);
      const responseText = result.response.text();
      
      console.log(`📄 Raw Gemini response length: ${responseText.length} chars`);
      
      // Parse JSON from response - try multiple strategies
      let insights;
      let jsonStr = ''; // Declare at function scope
      
      // Strategy 1: Extract JSON from code block
      let codeBlockMatch = responseText.match(/```json\s*(\{[\s\S]*\})\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonStr = codeBlockMatch[1];
        try {
          insights = JSON.parse(jsonStr);
          console.log('✅ Parsed JSON from code block');
          this.aiResponseCache.set(cacheKey, insights);
          return insights;
        } catch (e) {
          console.log('⚠️  Code block JSON parse failed, trying alternative extraction');
          // Save the extracted JSON for debugging
          console.log('📄 Extracted JSON length:', jsonStr.length);
        }
      }
      
      // Strategy 2: Try to extract just the JSON object between first { and last }
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = responseText.substring(firstBrace, lastBrace + 1);
        try {
          insights = JSON.parse(jsonStr);
          console.log('✅ Parsed JSON using brace matching');
          this.aiResponseCache.set(cacheKey, insights);
          return insights;
        } catch (e) {
          console.log('⚠️  Brace matching parse failed');
          // Try writing to temp file for debugging
          try {
            fs.writeFileSync('/tmp/gemini_response_debug.json', jsonStr);
            console.log('📝 Saved problematic JSON to /tmp/gemini_response_debug.json');
          } catch (writeError) {
            // Ignore write errors
          }
        }
      }
      
      // Strategy 3: Look for raw JSON object (greedy match)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          insights = JSON.parse(jsonMatch[0]);
          console.log('✅ Parsed raw JSON');
          this.aiResponseCache.set(cacheKey, insights);
          return insights;
        } catch (e) {
          console.log('⚠️  Raw JSON parse failed:', e);
        }
      }
      
      // Strategy 4: Try to fix incomplete JSON by closing arrays and objects
      if (jsonStr) {
        try {
          let fixed = jsonStr.trim();
          // Count braces and brackets
          const openBraces = (fixed.match(/\{/g) || []).length;
          const closeBraces = (fixed.match(/\}/g) || []).length;
          const openBrackets = (fixed.match(/\[/g) || []).length;
          const closeBrackets = (fixed.match(/\]/g) || []).length;
          
          // If we have unclosed arrays, close them
          for (let i = 0; i < openBrackets - closeBrackets; i++) {
            fixed += '\n]';
          }
          // If we have unclosed objects, close them
          for (let i = 0; i < openBraces - closeBraces; i++) {
            fixed += '\n}';
          }
          
          insights = JSON.parse(fixed);
          console.log('✅ Parsed JSON after fixing incomplete structure');
          this.aiResponseCache.set(cacheKey, insights);
          return insights;
        } catch (e) {
          console.log('⚠️  Could not fix incomplete JSON:', e);
        }
      }
      
      // Fallback if parsing fails
      console.log('⚠️  All JSON parsing strategies failed, using fallback');
      // OPTIMIZATION: Cache the result
      this.aiResponseCache.set(cacheKey, insights);
      return insights;
    } catch (error) {
      console.error('❌ Error generating strategic insights:', error);
      const fallback = this.getFallbackStrategicInsights(segment);
      this.aiResponseCache.set(cacheKey, fallback);
      return fallback;
    }
  }

  /**
   * Generate executive summary with Gemini
   */
  private async generateExecutiveSummary(
    segment: string,
    demographics: any,
    overlaps: any[],
    geoIntelligence: any,
    commerceBaseline: any  // NEW: commerce baseline for context
  ): Promise<string> {
    // OPTIMIZATION: Check cache first
    const cacheKey = `executive_${segment}`;
    if (this.aiResponseCache.has(cacheKey)) {
      console.log(`💨 Using cached executive summary for ${segment}`);
      return this.aiResponseCache.get(cacheKey);
    }
    
    // Calculate commerce baseline comparison
    const vsCommerce = {
      income: ((demographics.medianHHI / commerceBaseline.medianHHI) - 1) * 100,
      education: ((demographics.educationBachelors / commerceBaseline.educationBachelorsPlus) - 1) * 100,
    };
    console.log(`📝 Generating executive summary with Gemini`);

    const prompt = `You are a senior marketing analyst presenting to a Fortune 500 CMO. Summarize the "${segment}" Commerce Audience in a way that makes them immediately understand WHO this audience is and WHY it matters.

COMPLETE DATA CONTEXT:
- Demographics: ${demographics.affluenceLevel} ($${demographics.medianHHI.toFixed(0)} median income)
  - vs Commerce Baseline: ${vsCommerce.income >= 0 ? '+' : ''}${vsCommerce.income.toFixed(1)}% ${vsCommerce.income > 15 ? '(WEALTHIER than typical shopper)' : vsCommerce.income > -15 ? '(TYPICAL shopper income)' : '(VALUE-CONSCIOUS shopper)'} ⭐
  - vs National: ${demographics.medianHHIvsNational >= 0 ? '+' : ''}${demographics.medianHHIvsNational.toFixed(1)}% (ignore - selection bias)
- Age: ${demographics.topAgeBracket}
- Education: ${demographics.educationProfile}
  - vs Commerce Baseline: ${vsCommerce.education >= 0 ? '+' : ''}${vsCommerce.education.toFixed(1)}% ${vsCommerce.education < -15 ? '(TRADE-SKILLED/BLUE-COLLAR despite high income!)' : vsCommerce.education > 15 ? '(MORE EDUCATED than typical shopper)' : '(TYPICAL education)'} ⭐
- Family: ${demographics.familyProfile} (${demographics.avgHouseholdSize.toFixed(1)} people per household${demographics.lifestyle?.married ? `, ${demographics.lifestyle.married.toFixed(0)}% married${demographics.lifestyle.dualIncome && demographics.lifestyle.dualIncome > 60 ? ', mostly dual-income' : ''}` : ''})
- Lifestyle: ${demographics.lifestyle?.selfEmployed && demographics.lifestyle.selfEmployed > 12 ? `${demographics.lifestyle.selfEmployed.toFixed(0)}% entrepreneurs/self-employed, ` : ''}${demographics.lifestyle?.avgCommuteTime && demographics.lifestyle.avgCommuteTime > 25 ? `${demographics.lifestyle.avgCommuteTime.toFixed(0)}-min avg commute, ` : ''}${demographics.lifestyle?.stemDegree && demographics.lifestyle.stemDegree > 15 ? `${demographics.lifestyle.stemDegree.toFixed(0)}% STEM-educated (tech-savvy), ` : ''}${demographics.lifestyle?.charitableGivers && demographics.lifestyle.charitableGivers > 40 ? `${demographics.lifestyle.charitableGivers.toFixed(0)}% charitable (values-driven)` : 'typical work patterns'}
- Location: ${demographics.locationProfile} (${demographics.homeOwnership.toFixed(0)}% homeowners, $${demographics.medianHomeValue.toFixed(0)} median home value)
- Top Markets: ${geoIntelligence.topCities.slice(0, 3).map((c: any) => `${c.city} ${c.state}`).join(', ')}
- Key Overlap: ${overlaps[0]?.segment || 'N/A'} (${overlaps[0]?.overlapPercentage.toFixed(1) || '0'}%)

IMPORTANT: Use Commerce Baseline comparisons (⭐) to position this segment. They show true differentiation from other online shoppers.

Write a compelling 3-sentence executive summary that:
1. Opens with the SINGLE most defining characteristic vs OTHER ONLINE SHOPPERS (use commerce baseline data)
2. Describes WHERE they live and their life stage (cite top 2 markets + family/housing data)  
3. Reveals a NON-OBVIOUS insight from the overlaps or demographics that changes how you'd market to them

Be specific. Cite actual numbers. Make it memorable.`;

    const gemini = this.getGeminiService();
    if (!gemini) {
      console.log('⚠️  Gemini not available, using fallback executive summary');
      return `The ${segment} audience indexes ${demographics.medianHHIvsNational >= 0 ? 'higher' : 'lower'} than the national average in household income, with a median of $${demographics.medianHHI.toFixed(0)}. This audience is primarily concentrated in the ${demographics.topAgeBracket} age bracket and shows strong overlap with ${overlaps[0]?.segment || 'related segments'}, indicating complementary purchase behaviors.`;
    }

    try {
      // Call Gemini directly for text generation
      const result = await gemini['model'].generateContent(prompt);
      const responseText = result.response.text();
      const summary = responseText.trim();
      this.aiResponseCache.set(cacheKey, summary);
      return summary;
    } catch (error) {
      console.error('❌ Error generating executive summary:', error);
      return `The ${segment} audience indexes ${demographics.medianHHIvsNational >= 0 ? 'higher' : 'lower'} than the national average in household income, with a median of $${demographics.medianHHI.toFixed(0)}. This audience is primarily concentrated in the ${demographics.topAgeBracket} age bracket and shows strong overlap with ${overlaps[0]?.segment || 'related segments'}, indicating complementary purchase behaviors.`;
    }
  }

  /**
   * Fallback strategic insights if Gemini fails
   */
  private getFallbackStrategicInsights(segment: string) {
    return {
      targetPersona: `The ${segment} audience represents a distinct consumer group with specific purchase behaviors and preferences. They are likely to be influenced by value, quality, and brand reputation when making purchase decisions. Understanding their demographics and overlapping interests provides key insights for effective targeting.`,
      messagingRecommendations: ['Value', 'Quality', 'Convenience', 'Trust', 'Innovation'],
      channelRecommendations: [
        'Digital display advertising on premium content sites',
        'Social media platforms targeting the identified age demographic',
        'Email marketing campaigns with personalized product recommendations'
      ],
    };
  }

  /**
   * Get national average for income bracket (mock data)
   */
  private getNationalIncomeBracketAvg(bracket: string): number {
    const brackets: Record<string, number> = {
      'Under $50k': 35,
      '$50k-$75k': 25,
      '$75k-$100k': 18,
      '$100k-$150k': 15,
      '$150k+': 7,
    };
    return brackets[bracket] || 20;
  }
  
  /**
   * Generate persona name based on segment characteristics
   */
  private generatePersonaName(segment: string, demographics: any, overlaps: any[], commerceBaseline: any): string {
    const incomeVsCommerce = ((demographics.medianHHI / commerceBaseline.medianHHI) - 1) * 100;
    const educationVsCommerce = ((demographics.educationBachelors / commerceBaseline.educationBachelorsPlus) - 1) * 100;
    const isFamily = demographics.avgHouseholdSize > 2.8;
    const topOverlap = overlaps[0]?.segment || '';
    
    // Pattern matching for persona names based on data characteristics
    if (educationVsCommerce < -15 && incomeVsCommerce >= -10 && isFamily) {
      return `The Practical ${segment} Family Builder`;
    } else if (educationVsCommerce < -15 && incomeVsCommerce >= -10) {
      return `The Hands-On ${segment} Professional`;
    } else if (incomeVsCommerce > 15 && educationVsCommerce > 10) {
      return `The Affluent ${segment} Enthusiast`;
    } else if (incomeVsCommerce > 15) {
      return `The Premium ${segment} Buyer`;
    } else if (isFamily && topOverlap.toLowerCase().includes('baby')) {
      return `The Family-First ${segment} Parent`;
    } else if (isFamily) {
      return `The Family-Focused ${segment} Shopper`;
    } else if (incomeVsCommerce < -15) {
      return `The Value-Conscious ${segment} Buyer`;
    } else {
      return `The ${segment} Consumer`;
    }
  }
  
  /**
   * Get emoji for product category or segment
   */
  private getEmojiForCategory(category: string, segment?: string): string {
    // First, check for segment-specific emojis
    if (segment) {
      const segmentEmojis: Record<string, string> = {
        // Sporting Goods - Specific Sports
        'Golf': '⛳',
        'Tennis': '🎾',
        'Basketball': '🏀',
        'Baseball': '⚾',
        'Football': '🏈',
        'Soccer': '⚽',
        'Swimming': '🏊',
        'Cycling': '🚴',
        'Running': '🏃',
        'Fitness': '💪',
        'Yoga': '🧘',
        'Camping & Hiking': '🏕️',
        'Fishing': '🎣',
        'Hunting & Shooting': '🎯',
        'Winter Sports': '⛷️',
        'Water Sports': '🏄',
        
        // Electronics - Specific Products
        'Audio': '🎧',
        'Video': '📹',
        'Cameras & Optics': '📷',
        'Computer Components': '🖥️',
        'Computers': '💻',
        'Tablet Computers': '📱',
        'Mobile Phones': '📱',
        'Gaming': '🎮',
        'Video Game Consoles': '🎮',
        'Televisions': '📺',
        'Speakers': '🔊',
        
        // Animals & Pet Supplies
        'Dog Supplies': '🐕',
        'Cat Supplies': '🐈',
        'Pet Supplies': '🐾',
        'Live Animals': '🐾',
        
        // Food & Beverage
        'Coffee': '☕',
        'Tea': '🍵',
        'Alcoholic Beverages': '🍷',
        'Beer': '🍺',
        'Wine': '🍷',
        
        // Apparel
        'Shoes': '👟',
        'Dresses': '👗',
        'Activewear': '🏃',
        'Sunglasses': '🕶️',
        
        // Baby & Toddler
        'Baby & Toddler': '👶',
        'Baby & Toddler Clothing': '👶',
        'Baby Safety': '👶',
        'Nursing & Feeding': '🍼',
        
        // Health & Beauty
        'Foot Care': '🦶',
        'Vision Care': '👓',
        'Skin Care': '🧴',
        'Hair Care': '💇',
        'Oral Care': '🦷',
        'Makeup': '💄',
        'Fragrances': '🌸',
        'Vitamins & Supplements': '💊',
        'Personal Care': '🧼',
        'Shaving & Grooming': '🪒',
        'Bath & Body': '🛁',
        
        // Home & Garden
        'Gardening': '🌱',
        'Outdoor Living': '🏡',
        'Kitchen': '🍳',
        'Laundry Supplies': '🧺',
        'Cleaning Supplies': '🧹',
        
        // Vehicles
        'Motorcycles': '🏍️',
        'Marine Vehicles': '⛵',
        'Bicycles': '🚴',
        'Vehicle Parts & Accessories': '🚗'
      };
      
      if (segmentEmojis[segment]) {
        return segmentEmojis[segment];
      }
    }
    
    // Fallback to category-level emojis
    const categoryEmojis: Record<string, string> = {
      'Animals & Pet Supplies': '🐾',
      'Apparel & Accessories': '👗',
      'Arts & Entertainment': '🎨',
      'Baby & Toddler': '👶',
      'Business & Industrial': '🏭',
      'Cameras & Optics': '📷',
      'Electronics': '💻',
      'Food, Beverages & Tobacco': '🍽️',
      'Furniture': '🛋️',
      'Hardware': '🔧',
      'Health & Beauty': '💄',
      'Home & Garden': '🏡',
      'Luggage & Bags': '🎒',
      'Media': '📺',
      'Office Supplies': '📎',
      'Software': '💿',
      'Sporting Goods': '⚽',
      'Toys & Games': '🎮',
      'Vehicles & Parts': '🚗',
      'General': '🎯'
    };
    
    return categoryEmojis[category] || '🎯';
  }

  /**
   * Get cached report from Supabase
   */
  private async getFromSupabaseCache(cacheKey: string): Promise<AudienceInsightsReport | null> {
    try {
      const supabase = SupabaseService.getClient();
      
      const { data, error } = await supabase
        .from('audience_reports_cache')
        .select('report_data, created_at, expires_at')
        .eq('cache_key', cacheKey)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      // Check if cache has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        console.log(`⏰ Cache expired for key: ${cacheKey}`);
        return null;
      }
      
      return data.report_data as AudienceInsightsReport;
      
    } catch (error) {
      console.error('Error fetching from Supabase cache:', error);
      return null;
    }
  }

  /**
   * Save report to Supabase cache
   */
  private async saveToSupabaseCache(
    cacheKey: string, 
    segment: string, 
    category: string, 
    report: AudienceInsightsReport
  ): Promise<void> {
    try {
      const supabase = SupabaseService.getClient();
      
      const expiresAt = new Date(Date.now() + this.reportCacheTimeout);
      
      const { error } = await supabase
        .from('audience_reports_cache')
        .upsert({
          cache_key: cacheKey,
          segment,
          category,
          report_data: report,
          expires_at: expiresAt.toISOString()
        }, { onConflict: 'cache_key' });
      
      if (error) {
        console.error('Error saving to Supabase cache:', error.message);
        // Fallback to in-memory cache
        this.reportCache.set(cacheKey, { report, timestamp: Date.now() });
      } else {
        console.log(`💾 Report cached in Supabase (expires: ${expiresAt.toLocaleTimeString()})`);
      }
      
    } catch (error) {
      console.error('Error with Supabase cache:', error);
      // Fallback to in-memory cache
      this.reportCache.set(cacheKey, { report, timestamp: Date.now() });
    }
  }
}

export const audienceInsightsService = new AudienceInsightsService();

