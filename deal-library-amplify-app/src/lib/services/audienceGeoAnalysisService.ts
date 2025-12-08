import { commerceAudienceService } from './commerceAudienceService';
import { CensusDataService } from './censusDataService';

export interface GeoConcentrationAnalysis {
  rank: number;
  zipCode: string;
  city: string;
  state: string;
  audienceWeight: number;
  medianHouseholdIncome: number;
  medianHomeValue: number;
  medianAge: number;
  educationBachelors: number;
  homeOwnership: number;
  incomeIndex: number;
  homeValueIndex: number;
  ageIndex: number;
  educationIndex: number;
  homeOwnershipIndex: number;
}

export interface BenchmarkProfile {
  medianHouseholdIncome: number;
  medianHomeValue: number;
  medianAge: number;
  educationBachelors: number;
  homeOwnership: number;
  scope: string;
}

export interface AudienceGeoInsightReport {
  audienceSegment: string;
  geoScope: string;
  executiveSummary: string;
  benchmarkProfile: BenchmarkProfile;
  top10GeoConcentration: GeoConcentrationAnalysis[];
  geoPersonaProfile: string;
  commercialImplications: {
    productPositioning: string;
    dealLibraryCategory: string;
    positioningRationale: string;
    strongestTrend: {
      metric: string;
      deviation: number;
      marketingImplication: string;
    };
  };
  generatedAt: Date;
}

export class AudienceGeoAnalysisService {
  private censusDataService: CensusDataService;

  constructor() {
    this.censusDataService = new CensusDataService();
  }
  
  /**
   * Generate comprehensive audience geo-analysis report
   */
  async generateAudienceGeoDeepDive(
    audienceSegment: string, 
    geoScope?: string
  ): Promise<AudienceGeoInsightReport> {
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔍 Starting Audience Geo-Deep-Dive for: "${audienceSegment}"${geoScope ? ` in ${geoScope}` : ''}`);
    console.log(`${'='.repeat(80)}\n`);
    
    // Step 1: Get top ZIP codes by audience weight
    const topZipCodes = await this.getTopGeoConcentration(audienceSegment, geoScope);
    
    if (topZipCodes.length === 0) {
      throw new Error(`No audience data found for segment: ${audienceSegment}`);
    }
    
    // Step 2: Establish benchmark profile
    const benchmarkProfile = await this.calculateBenchmarkProfile(geoScope);
    
    // Step 3: Get detailed demographic data for top ZIP codes
    const geoConcentrationAnalysis = await this.performComparativeAnalysis(
      topZipCodes, 
      benchmarkProfile
    );
    
    // Step 4: Generate insights using Gemini
    const insights = await this.generateInsightsWithGemini(
      audienceSegment,
      geoScope || 'US National',
      geoConcentrationAnalysis,
      benchmarkProfile
    );
    
    return {
      audienceSegment,
      geoScope: geoScope || 'US National',
      executiveSummary: insights.executiveSummary,
      benchmarkProfile,
      top10GeoConcentration: geoConcentrationAnalysis,
      geoPersonaProfile: insights.geoPersonaProfile,
      commercialImplications: insights.commercialImplications,
      generatedAt: new Date()
    };
  }
  
  /**
   * Get top 10 ZIP codes by audience weight within geo scope
   */
  private async getTopGeoConcentration(
    audienceSegment: string, 
    geoScope?: string
  ): Promise<Array<{ zipCode: string; weight: number }>> {
    
    console.log(`🔍 getTopGeoConcentration called for: "${audienceSegment}"`);
    
    const audienceData = commerceAudienceService.searchZipCodesByAudience(
      audienceSegment, 
      100 // Get more to filter by geo scope if needed
    );
    
    console.log(`📊 Found ${audienceData.length} ZIP codes for "${audienceSegment}"`);
    if (audienceData.length > 0 && audienceData[0]) {
      console.log(`   Top ZIP: ${audienceData[0].zipCode} (weight: ${audienceData[0].weight})`);
    }
    
    let filteredData = audienceData;
    
    // If geo scope is specified, filter by location
    if (geoScope && geoScope !== 'US National') {
      // For now, we'll get all data and let Gemini handle geo filtering
      // In future iterations, we can add more sophisticated geo filtering
      console.log(`📍 Geo scope specified: ${geoScope} - using top results`);
    }
    
    const result = filteredData
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 50) // Get more ZIP codes to account for missing census data
      .map(item => ({
        zipCode: item.zipCode,
        weight: item.weight
      }));
    
    console.log(`✅ Returning ${result.length} ZIP codes for analysis`);
    
    return result;
  }
  
  /**
   * Calculate benchmark profile for comparison
   */
  private async calculateBenchmarkProfile(geoScope?: string): Promise<BenchmarkProfile> {
    // For now, use US national averages
    // In future iterations, we can calculate regional benchmarks
    
    const sampleZipCodes = ['10001', '90210', '60601', '75201', '33101']; // Major city samples
    const censusData = await this.censusDataService.getZipCodeData(sampleZipCodes);
    
    if (!censusData || censusData.length === 0) {
      // Fallback to reasonable defaults
      return {
        medianHouseholdIncome: 70420, // US average from census data
        medianHomeValue: 300000,
        medianAge: 38.5,
        educationBachelors: 35,
        homeOwnership: 65,
        scope: geoScope || 'US National'
      };
    }
    
    const data = censusData;
    const count = data.length;
    
    const benchmark = {
      medianHouseholdIncome: data.reduce((sum: number, zip: any) => 
        sum + (zip.economics?.householdIncome?.median || 70420), 0) / count,
      medianHomeValue: data.reduce((sum: number, zip: any) => 
        sum + (zip.geography?.housing?.medianHomeValue || 300000), 0) / count,
      medianAge: data.reduce((sum: number, zip: any) => 
        sum + (zip.demographics?.ageMedian || 38.5), 0) / count,
      educationBachelors: data.reduce((sum: number, zip: any) => 
        sum + (zip.demographics?.education?.bachelorDegree || 35), 0) / count,
      homeOwnership: data.reduce((sum: number, zip: any) => 
        sum + (zip.geography?.housing?.ownerOccupiedRate || 65), 0) / count,
      scope: geoScope || 'US National'
    };
    
    return benchmark;
  }
  
  /**
   * Perform comparative analysis between top ZIP codes and benchmark
   */
  private async performComparativeAnalysis(
    topZipCodes: Array<{ zipCode: string; weight: number }>,
    benchmarkProfile: BenchmarkProfile
  ): Promise<GeoConcentrationAnalysis[]> {
    
    const zipCodeList = topZipCodes.map(item => item.zipCode);
    const censusData = await this.censusDataService.getZipCodeData(zipCodeList);
    
    if (!censusData || censusData.length === 0) {
      throw new Error('Failed to retrieve census data for analysis');
    }
    
    // Keep ALL top ZIPs, even if they don't have census data
    // We'll use fallback values for missing data
    console.log(`📍 Processing ${topZipCodes.length} ZIP codes`);
    const withCensusData = topZipCodes.filter(item => {
      const zipData = censusData.find((zip: any) => zip.zipCode === item.zipCode);
      return zipData !== undefined && zipData.population > 0;
    }).length;
    console.log(`   ${withCensusData} have complete census data, ${topZipCodes.length - withCensusData} will use fallback values`);
    console.log(`📊 Top 3 ZIPs by audience weight:`);
    topZipCodes.slice(0, 3).forEach((item, i) => {
      const zipInfo = censusData.find((zip: any) => zip.zipCode === item.zipCode);
      const hasData = zipInfo && zipInfo.population > 0;
      console.log(`   ${i+1}. ${item.zipCode}: weight ${item.weight} ${hasData ? '✅' : '⚠️ (using fallback)'}`);
    });

    return topZipCodes.slice(0, 10).map((item, index) => {
      const zipData = censusData.find((zip: any) => zip.zipCode === item.zipCode);
      
      // Use census data if available, otherwise use benchmark (national average) as fallback
      const income = zipData?.economics?.householdIncome?.median || benchmarkProfile.medianHouseholdIncome;
      const homeValue = zipData?.geography?.housing?.medianHomeValue || benchmarkProfile.medianHomeValue;
      const age = zipData?.demographics?.ageMedian || benchmarkProfile.medianAge;
      const education = zipData?.demographics?.education?.bachelorDegree || benchmarkProfile.educationBachelors;
      const homeOwnership = zipData?.geography?.housing?.ownerOccupiedRate || benchmarkProfile.homeOwnership;
      
      return {
        rank: index + 1,
        zipCode: item.zipCode,
        city: zipData?.geography?.city || 'Unknown',
        state: zipData?.geography?.state || 'Unknown',
        audienceWeight: item.weight,
        medianHouseholdIncome: income,
        medianHomeValue: homeValue,
        medianAge: age,
        educationBachelors: education,
        homeOwnership: homeOwnership,
        incomeIndex: ((income - benchmarkProfile.medianHouseholdIncome) / benchmarkProfile.medianHouseholdIncome) * 100,
        homeValueIndex: ((homeValue - benchmarkProfile.medianHomeValue) / benchmarkProfile.medianHomeValue) * 100,
        ageIndex: ((age - benchmarkProfile.medianAge) / benchmarkProfile.medianAge) * 100,
        educationIndex: ((education - benchmarkProfile.educationBachelors) / benchmarkProfile.educationBachelors) * 100,
        homeOwnershipIndex: ((homeOwnership - benchmarkProfile.homeOwnership) / benchmarkProfile.homeOwnership) * 100
      };
    });
  }
  
  /**
   * Generate insights using Gemini AI
   */
  private async generateInsightsWithGemini(
    audienceSegment: string,
    geoScope: string,
    geoConcentrationAnalysis: GeoConcentrationAnalysis[],
    benchmarkProfile: BenchmarkProfile
  ): Promise<{
    executiveSummary: string;
    geoPersonaProfile: string;
    commercialImplications: {
      productPositioning: string;
      dealLibraryCategory: string;
      positioningRationale: string;
      strongestTrend: {
        metric: string;
        deviation: number;
        marketingImplication: string;
      };
    };
  }> {
    
    // This will be implemented with Gemini service
    // For now, return structured insights
    
    const topZip = geoConcentrationAnalysis[0];
    const avgIncomeIndex = geoConcentrationAnalysis.reduce((sum, item) => sum + item.incomeIndex, 0) / geoConcentrationAnalysis.length;
    const avgEducationIndex = geoConcentrationAnalysis.reduce((sum, item) => sum + item.educationIndex, 0) / geoConcentrationAnalysis.length;
    
    // Find strongest deviation
    const deviations = [
      { metric: 'Income', avg: Math.abs(avgIncomeIndex), sign: avgIncomeIndex },
      { metric: 'Education', avg: Math.abs(avgEducationIndex), sign: avgEducationIndex },
      { metric: 'Age', avg: Math.abs(geoConcentrationAnalysis[0]?.ageIndex || 0), sign: geoConcentrationAnalysis[0]?.ageIndex || 0 },
      { metric: 'Home Value', avg: Math.abs(geoConcentrationAnalysis[0]?.homeValueIndex || 0), sign: geoConcentrationAnalysis[0]?.homeValueIndex || 0 }
    ];
    
    const strongestDeviation = deviations.reduce((max, current) => 
      current.avg > max.avg ? current : max
    );
    
    const executiveSummary = `The ${audienceSegment} audience shows highest concentration in ${topZip?.city || 'Unknown'}, ${topZip?.state || 'Unknown'} (${topZip?.zipCode || 'Unknown'}), with ${strongestDeviation.sign > 0 ? 'above' : 'below'}-average ${strongestDeviation.metric.toLowerCase()} being the defining characteristic across the top 10 ZIP codes.`;
    
    const geoPersonaProfile = `This ${audienceSegment} audience represents a ${avgIncomeIndex > 20 ? 'high-income' : avgIncomeIndex < -20 ? 'value-focused' : 'middle-income'} demographic concentrated in ${avgEducationIndex > 20 ? 'highly educated' : 'mixed education'} communities. They are characterized by ${avgIncomeIndex > 0 ? 'above-average purchasing power' : 'price-sensitive behavior'} and ${avgEducationIndex > 0 ? 'sophisticated decision-making' : 'practical consumption patterns'}. This geographic concentration suggests a ${avgIncomeIndex > 20 ? 'premium positioning' : 'value-oriented'} approach would resonate most effectively with this audience segment.`;
    
    const productPositioning = avgIncomeIndex > 20 ? 'Luxury' : avgIncomeIndex > 0 ? 'Premium' : avgIncomeIndex > -20 ? 'Value' : 'Budget';
    const dealCategory = avgIncomeIndex > 20 ? 'Exclusive Early Access' : avgIncomeIndex > 0 ? 'High-Value Service Add-ons' : 'Deep Discounts';
    
    return {
      executiveSummary,
      geoPersonaProfile,
      commercialImplications: {
        productPositioning,
        dealLibraryCategory: dealCategory,
        positioningRationale: `Based on ${avgIncomeIndex > 0 ? 'above-average income levels' : 'below-average income levels'} and ${avgEducationIndex > 0 ? 'higher education attainment' : 'lower education levels'}, this audience ${avgIncomeIndex > 0 ? 'responds well to premium offerings' : 'prioritizes value and savings'}.`,
        strongestTrend: {
          metric: strongestDeviation.metric,
          deviation: strongestDeviation.sign,
          marketingImplication: strongestDeviation.sign > 0 ? 
            `Leverage their above-average ${strongestDeviation.metric.toLowerCase()} to justify premium positioning and exclusive offers.` :
            `Address their below-average ${strongestDeviation.metric.toLowerCase()} with value-focused messaging and accessible pricing.`
        }
      }
    };
  }
  
  /**
   * Get available audience segments
   */
  getAvailableAudienceSegments(): string[] {
    return commerceAudienceService.getAudienceSegments().map(segment => segment.name);
  }
  
  /**
   * Get service status
   */
  getStatus(): { isReady: boolean; audienceSegments: number; censusDataLoaded: boolean } {
    const audienceStatus = commerceAudienceService.getStatus();
    const censusStatus = this.censusDataService.getDataStatus();
    
    return {
      isReady: audienceStatus.isLoaded && censusStatus.loaded,
      audienceSegments: audienceStatus.audienceSegments.length,
      censusDataLoaded: censusStatus.loaded
    };
  }
}

export const audienceGeoAnalysisService = new AudienceGeoAnalysisService();
