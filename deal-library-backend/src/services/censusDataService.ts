/**
 * Census Data Service for processing and querying US Census data
 * Handles zip code demographic analysis and Commerce Audience mapping
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  CensusZipCodeData, 
  CensusInsights, 
  CensusQueryFilters, 
  CommerceAudienceZipMapping,
  CensusDataImportResult,
  CensusDemographics,
  CensusEconomics,
  CensusGeography
} from '../types/censusData';

interface RawCensusRow {
  zip: string;
  lat: string;
  lng: string;
  city: string;
  state_id: string;
  state_name: string;
  zcta: string;  // NEW: "TRUE" or "FALSE" - indicates if this is a real ZCTA
  county_name: string;
  population: string;
  age_median: string;
  age_under_10: string;
  age_10_to_19: string;
  age_20s: string;
  age_30s: string;
  age_40s: string;
  age_50s: string;
  age_60s: string;
  age_70s: string;
  age_over_80: string;
  income_household_median: string;
  education_bachelors: string;
  education_graduate: string;
  race_white: string;
  race_black: string;
  race_asian: string;
  hispanic: string;
  family_size: string;
  commute_time: string;
  home_value: string;
  rent_median: string;
  home_ownership: string;
  unemployment_rate: string;
  poverty: string;
  cbsa_name: string;
  cbsa_metro: string;
  // NEW TIER 1 LIFESTYLE FIELDS
  self_employed: string;
  married: string;
  family_dual_income: string;
  education_stem_degree: string;
  charitable_givers: string;
}

export class CensusDataService {
  private static instance: CensusDataService | null = null;
  private censusData: Map<string, CensusZipCodeData> = new Map();
  private isLoaded: boolean = false;
  private dataPath: string;

  constructor() {
    this.dataPath = path.join(__dirname, '../../data/uszips.csv');
  }

  // Singleton pattern to share loaded census data across all services
  public static getInstance(): CensusDataService {
    if (!CensusDataService.instance) {
      CensusDataService.instance = new CensusDataService();
    }
    return CensusDataService.instance;
  }

  /**
   * Load census data from CSV file
   */
  public async loadCensusData(): Promise<CensusDataImportResult> {
    console.log('📊 Loading US Census data from CSV...');
    
    const result: CensusDataImportResult = {
      success: false,
      recordsProcessed: 0,
      recordsImported: 0,
      errors: [],
      summary: {
        totalZipCodes: 0,
        states: [],
        averagePopulation: 0,
        averageIncome: 0
      }
    };

    try {
      if (!fs.existsSync(this.dataPath)) {
        throw new Error(`Census data file not found: ${this.dataPath}`);
      }

      const csvContent = fs.readFileSync(this.dataPath, 'utf-8');
      const lines = csvContent.split('\n');
      const header = lines[0]?.split(',').map(h => h.replace(/"/g, '')) || [];
      
      console.log(`📈 Processing ${lines.length - 1} census records...`);

      const stateSet = new Set<string>();
      let totalPopulation = 0;
      let totalIncome = 0;
      let validRecords = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;

        result.recordsProcessed++;

        try {
      const row = this.parseCSVLine(line, header);
      const censusData = this.convertToCensusData(row);
      
      // **CHANGE**: Keep all ZIPs including zero-population for city/state data
      if (censusData?.zipCode) {
            this.censusData.set(censusData.zipCode, censusData);
            result.recordsImported++;
            validRecords++;
            
            stateSet.add(censusData.geography.state);
            // Only add to totals if population > 0
            if (censusData.population > 0) {
              totalPopulation += censusData.population;
              totalIncome += censusData.economics.householdIncome.median;
            }
          }
        } catch (error) {
          result.errors.push({
            row: i + 1,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: line.substring(0, 100) + '...'
          });
        }
      }

      result.success = true;
      result.summary.totalZipCodes = this.censusData.size;
      result.summary.states = Array.from(stateSet).sort();
      result.summary.averagePopulation = validRecords > 0 ? Math.round(totalPopulation / validRecords) : 0;
      result.summary.averageIncome = validRecords > 0 ? Math.round(totalIncome / validRecords) : 0;

      this.isLoaded = true;

      console.log(`✅ Census data loaded successfully:`);
      console.log(`   📍 ${result.summary.totalZipCodes} zip codes`);
      console.log(`   🏛️ ${result.summary.states.length} states`);
      console.log(`   👥 Average population: ${result.summary.averagePopulation.toLocaleString()}`);
      console.log(`   💰 Average income: $${result.summary.averageIncome.toLocaleString()}`);

    } catch (error) {
      console.error('❌ Failed to load census data:', error);
      result.errors.push({
        row: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return result;
  }

  /**
   * Parse a CSV line with proper handling of quoted fields
   */
  private parseCSVLine(line: string, headers: string[]): RawCensusRow {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    return row as RawCensusRow;
  }

  /**
   * Convert raw CSV row to structured census data
   */
  private convertToCensusData(row: RawCensusRow): CensusZipCodeData | null {
    try {
      const zipCode = row.zip?.replace(/"/g, '').trim();
      if (!zipCode || zipCode.length !== 5) return null;

      // **FILTER OUT NON-ZCTAs**: Only include true ZCTAs (populated areas)
      // Non-ZCTAs are P.O. boxes, military bases, etc. with no residential population
      // This prevents ~7,700 non-residential ZIPs from skewing our demographic analysis
      const isZCTA = row.zcta?.replace(/"/g, '').trim().toUpperCase() === 'TRUE';
      if (!isZCTA) {
        return null; // Skip non-ZCTA ZIP codes entirely
      }

      const population = parseInt(row.population) || 0;
      
      return {
        zipCode,
        latitude: parseFloat(row.lat) || 0,
        longitude: parseFloat(row.lng) || 0,
        population,
        demographics: this.parseDemographics(row),
        economics: this.parseEconomics(row),
        geography: this.parseGeography(row),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error converting row to census data:', error);
      return null;
    }
  }

  private parseDemographics(row: RawCensusRow): CensusDemographics {
    const ageMedian = parseFloat(row.age_median) || 0;
    const educationBachelors = parseFloat(row.education_bachelors) || 0;
    const educationGraduate = parseFloat(row.education_graduate) || 0;
    
    // Parse actual age brackets from census data
    const ageUnder10 = parseFloat(row.age_under_10) || 0;
    const age10to19 = parseFloat(row.age_10_to_19) || 0;
    const age20s = parseFloat(row.age_20s) || 0;
    const age30s = parseFloat(row.age_30s) || 0;
    const age40s = parseFloat(row.age_40s) || 0;
    const age50s = parseFloat(row.age_50s) || 0;
    const age60s = parseFloat(row.age_60s) || 0;
    const age70s = parseFloat(row.age_70s) || 0;
    const ageOver80 = parseFloat(row.age_over_80) || 0;
    
    return {
      ageMedian,
      ageDistribution: {
        under18: ageUnder10 + age10to19,  // Combine under 10 and 10-19
        age18to24: age20s * 0.3,  // Approximate (20-24 is ~30% of 20s)
        age25to44: (age20s * 0.7) + age30s + (age40s * 0.5),  // 25-29 + 30s + 40-44
        age45to64: (age40s * 0.5) + age50s + (age60s * 0.5),  // 45-49 + 50s + 60-64
        age65plus: (age60s * 0.5) + age70s + ageOver80  // 65-69 + 70s + 80+
      },
      ethnicity: {
        white: parseFloat(row.race_white) || 0,
        black: parseFloat(row.race_black) || 0,
        hispanic: parseFloat(row.hispanic) || 0,
        asian: parseFloat(row.race_asian) || 0,
        nativeAmerican: 0,
        pacificIslander: 0,
        other: 0,
        twoOrMore: 0
      },
      education: {
        lessThanHighSchool: 0,
        highSchoolGraduate: 0,
        someCollege: 0,
        bachelorDegree: educationBachelors,
        graduateDegree: educationGraduate
      },
      householdSize: {
        average: parseFloat(row.family_size) || 0,
        median: parseFloat(row.family_size) || 0
      },
      lifestyle: {
        selfEmployed: parseFloat(row.self_employed) || 0,
        married: parseFloat(row.married) || 0,
        dualIncome: parseFloat(row.family_dual_income) || 0,
        commuteTime: parseFloat(row.commute_time) || 0,
        charitableGivers: parseFloat(row.charitable_givers) || 0,
        stemDegree: parseFloat(row.education_stem_degree) || 0
      }
    };
  }

  private parseEconomics(row: RawCensusRow): CensusEconomics {
    const medianIncome = parseFloat(row.income_household_median) || 0;
    
    return {
      householdIncome: {
        median: medianIncome,
        average: medianIncome,
        distribution: {
          under25k: 0,
          between25k50k: 0,
          between50k75k: 0,
          between75k100k: 0,
          between100k150k: 0,
          between150k200k: 0,
          over200k: 0
        }
      },
      povertyRate: parseFloat(row.poverty) || 0,
      unemploymentRate: parseFloat(row.unemployment_rate) || 0,
      employmentBySector: {
        agriculture: 0,
        construction: 0,
        manufacturing: 0,
        retail: 0,
        healthcare: 0,
        education: 0,
        technology: 0,
        finance: 0,
        government: 0,
        other: 0
      }
    };
  }

  private parseGeography(row: RawCensusRow): CensusGeography {
    const metroArea = row.cbsa_name?.replace(/"/g, '').trim() || '';
    const isMetro = row.cbsa_metro === 'TRUE';
    
    return {
      state: row.state_name?.replace(/"/g, '').trim() || '',
      county: row.county_name?.replace(/"/g, '').trim() || '',
      city: row.city?.replace(/"/g, '').trim() || '',
      metroArea,
      urbanRural: this.determineUrbanRural(isMetro, parseFloat(row.population) || 0),
      commuteTime: {
        average: parseFloat(row.commute_time) || 0,
        median: parseFloat(row.commute_time) || 0,
        distribution: {
          under15min: 0,
          between15to30min: 0,
          between30to45min: 0,
          between45to60min: 0,
          over60min: 0
        }
      },
      housing: {
        medianHomeValue: parseFloat(row.home_value) || 0,
        medianRent: parseFloat(row.rent_median) || 0,
        ownerOccupiedRate: parseFloat(row.home_ownership) || 0,
        averageBedrooms: 0
      }
    };
  }

  private determineUrbanRural(isMetro: boolean, population: number): 'urban' | 'suburban' | 'rural' {
    if (isMetro && population > 50000) return 'urban';
    if (isMetro && population > 10000) return 'suburban';
    return 'rural';
  }

  /**
   * Query census data with filters
   */
  public async queryCensusData(filters: CensusQueryFilters): Promise<CensusInsights> {
    if (!this.isLoaded) {
      await this.loadCensusData();
    }

    console.log('🔍 Querying census data with filters:', filters);

    let filteredData = Array.from(this.censusData.values());

    // Apply filters
    if (filters.zipCodes && filters.zipCodes.length > 0) {
      filteredData = filteredData.filter(data => filters.zipCodes!.includes(data.zipCode));
    }

    if (filters.states && filters.states.length > 0) {
      filteredData = filteredData.filter(data => filters.states!.includes(data.geography.state));
    }

    if (filters.incomeRange) {
      filteredData = filteredData.filter(data => 
        data.economics.householdIncome.median >= filters.incomeRange!.min &&
        data.economics.householdIncome.median <= filters.incomeRange!.max
      );
    }

    if (filters.ageRange) {
      filteredData = filteredData.filter(data => 
        data.demographics.ageMedian >= filters.ageRange!.min &&
        data.demographics.ageMedian <= filters.ageRange!.max
      );
    }

    if (filters.urbanRural && filters.urbanRural.length > 0) {
      filteredData = filteredData.filter(data => 
        filters.urbanRural!.includes(data.geography.urbanRural)
      );
    }

    if (filters.commuteTime) {
      filteredData = filteredData.filter(data => 
        data.geography.commuteTime.average <= filters.commuteTime!.max
      );
    }

    return this.generateInsights(filteredData);
  }

  /**
   * Generate insights from filtered census data
   */
  private generateInsights(zipCodes: CensusZipCodeData[]): CensusInsights {
    if (zipCodes.length === 0) {
      return {
        summary: {
          totalPopulation: 0,
          averageIncome: 0,
          dominantDemographics: {
            age: 'N/A',
            ethnicity: 'N/A',
            education: 'N/A',
            urbanRural: 'N/A'
          }
        },
        zipCodes: [],
        analytics: {
          incomeDistribution: [],
          ageDistribution: [],
          educationDistribution: [],
          commutePatterns: [],
          topMetroAreas: []
        },
        opportunities: []
      };
    }

    const totalPopulation = zipCodes.reduce((sum, zip) => sum + zip.population, 0);
    const averageIncome = zipCodes.reduce((sum, zip) => sum + zip.economics.householdIncome.median, 0) / zipCodes.length;
    const averageAge = zipCodes.reduce((sum, zip) => sum + zip.demographics.ageMedian, 0) / zipCodes.length;

    // Find dominant demographics
    const dominantEthnicity = this.findDominantEthnicity(zipCodes);
    const dominantEducation = this.findDominantEducation(zipCodes);
    const dominantUrbanRural = this.findDominantUrbanRural(zipCodes);

    // Generate analytics
    const incomeDistribution = this.generateIncomeDistribution(zipCodes);
    const ageDistribution = this.generateAgeDistribution(zipCodes);
    const educationDistribution = this.generateEducationDistribution(zipCodes);
    const commutePatterns = this.generateCommutePatterns(zipCodes);
    const topMetroAreas = this.generateTopMetroAreas(zipCodes);

    // Identify opportunities
    const opportunities = this.identifyOpportunities(zipCodes);

    return {
      summary: {
        totalPopulation,
        averageIncome,
        dominantDemographics: {
          age: this.formatAgeRange(averageAge),
          ethnicity: dominantEthnicity,
          education: dominantEducation,
          urbanRural: dominantUrbanRural
        }
      },
      zipCodes: zipCodes.slice(0, 100), // Limit to top 100 for performance
      analytics: {
        incomeDistribution,
        ageDistribution,
        educationDistribution,
        commutePatterns,
        topMetroAreas
      },
      opportunities
    };
  }

  private findDominantEthnicity(zipCodes: CensusZipCodeData[]): string {
    const totals = { white: 0, black: 0, hispanic: 0, asian: 0 };
    
    zipCodes.forEach(zip => {
      totals.white += zip.demographics.ethnicity.white;
      totals.black += zip.demographics.ethnicity.black;
      totals.hispanic += zip.demographics.ethnicity.hispanic;
      totals.asian += zip.demographics.ethnicity.asian;
    });

    const dominant = Object.entries(totals).reduce((a, b) => a[1] > b[1] ? a : b);
    return dominant[0];
  }

  private findDominantEducation(zipCodes: CensusZipCodeData[]): string {
    const totals = { bachelors: 0, graduate: 0 };
    
    zipCodes.forEach(zip => {
      totals.bachelors += zip.demographics.education.bachelorDegree;
      totals.graduate += zip.demographics.education.graduateDegree;
    });

    const totalCollege = totals.bachelors + totals.graduate;
    if (totalCollege > 30) return 'College-educated';
    if (totalCollege > 20) return 'Some college';
    return 'High school';
  }

  private findDominantUrbanRural(zipCodes: CensusZipCodeData[]): string {
    const counts = { urban: 0, suburban: 0, rural: 0 };
    
    zipCodes.forEach(zip => {
      counts[zip.geography.urbanRural]++;
    });

    return Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  private formatAgeRange(age: number): string {
    if (age < 30) return 'Young (under 30)';
    if (age < 40) return 'Young adults (30-39)';
    if (age < 50) return 'Middle-aged (40-49)';
    if (age < 60) return 'Mature adults (50-59)';
    return 'Senior (60+)';
  }

  private generateIncomeDistribution(zipCodes: CensusZipCodeData[]): Array<{range: string, percentage: number, population: number}> {
    const ranges = [
      { min: 0, max: 50000, label: 'Under $50k' },
      { min: 50000, max: 75000, label: '$50k-$75k' },
      { min: 75000, max: 100000, label: '$75k-$100k' },
      { min: 100000, max: 150000, label: '$100k-$150k' },
      { min: 150000, max: Infinity, label: 'Over $150k' }
    ];

    return ranges.map(range => {
      const matching = zipCodes.filter(zip => 
        zip.economics.householdIncome.median >= range.min && 
        zip.economics.householdIncome.median < range.max
      );
      const population = matching.reduce((sum, zip) => sum + zip.population, 0);
      
      return {
        range: range.label,
        percentage: (matching.length / zipCodes.length) * 100,
        population
      };
    });
  }

  private generateAgeDistribution(zipCodes: CensusZipCodeData[]): Array<{range: string, percentage: number, population: number}> {
    const ranges = [
      { min: 0, max: 30, label: 'Under 30' },
      { min: 30, max: 40, label: '30-39' },
      { min: 40, max: 50, label: '40-49' },
      { min: 50, max: 60, label: '50-59' },
      { min: 60, max: Infinity, label: '60+' }
    ];

    return ranges.map(range => {
      const matching = zipCodes.filter(zip => 
        zip.demographics.ageMedian >= range.min && 
        zip.demographics.ageMedian < range.max
      );
      const population = matching.reduce((sum, zip) => sum + zip.population, 0);
      
      return {
        range: range.label,
        percentage: (matching.length / zipCodes.length) * 100,
        population
      };
    });
  }

  private generateEducationDistribution(zipCodes: CensusZipCodeData[]): Array<{level: string, percentage: number, population: number}> {
    const levels = [
      { min: 0, max: 20, label: 'High School' },
      { min: 20, max: 40, label: 'Some College' },
      { min: 40, max: 60, label: 'Bachelor\'s' },
      { min: 60, max: 100, label: 'Graduate' }
    ];

    return levels.map(level => {
      const matching = zipCodes.filter(zip => {
        const collegeRate = zip.demographics.education.bachelorDegree + zip.demographics.education.graduateDegree;
        return collegeRate >= level.min && collegeRate < level.max;
      });
      const population = matching.reduce((sum, zip) => sum + zip.population, 0);
      
      return {
        level: level.label,
        percentage: (matching.length / zipCodes.length) * 100,
        population
      };
    });
  }

  private generateCommutePatterns(zipCodes: CensusZipCodeData[]): Array<{time: string, percentage: number, population: number}> {
    const ranges = [
      { min: 0, max: 20, label: 'Under 20 min' },
      { min: 20, max: 30, label: '20-30 min' },
      { min: 30, max: 45, label: '30-45 min' },
      { min: 45, max: 60, label: '45-60 min' },
      { min: 60, max: Infinity, label: 'Over 60 min' }
    ];

    return ranges.map(range => {
      const matching = zipCodes.filter(zip => 
        zip.geography.commuteTime.average >= range.min && 
        zip.geography.commuteTime.average < range.max
      );
      const population = matching.reduce((sum, zip) => sum + zip.population, 0);
      
      return {
        time: range.label,
        percentage: (matching.length / zipCodes.length) * 100,
        population
      };
    });
  }

  private generateTopMetroAreas(zipCodes: CensusZipCodeData[]): Array<{name: string, zipCodes: number, population: number}> {
    const metroCounts = new Map<string, { zipCodes: number, population: number }>();
    
    zipCodes.forEach(zip => {
      const metro = zip.geography.metroArea;
      if (metro) {
        const current = metroCounts.get(metro) || { zipCodes: 0, population: 0 };
        metroCounts.set(metro, {
          zipCodes: current.zipCodes + 1,
          population: current.population + zip.population
        });
      }
    });

    return Array.from(metroCounts.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.population - a.population)
      .slice(0, 10);
  }

  private identifyOpportunities(zipCodes: CensusZipCodeData[]): Array<{
    type: 'high_income' | 'young_professionals' | 'family_communities' | 'tech_hubs' | 'emerging_markets';
    description: string;
    zipCodes: string[];
    potential: 'high' | 'medium' | 'low';
  }> {
    const opportunities: Array<{
      type: 'high_income' | 'young_professionals' | 'family_communities' | 'tech_hubs' | 'emerging_markets';
      description: string;
      zipCodes: string[];
      potential: 'high' | 'medium' | 'low';
    }> = [];

    // High income opportunity
    const highIncomeZips = zipCodes.filter(zip => zip.economics.householdIncome.median > 100000);
    if (highIncomeZips.length > 0) {
      opportunities.push({
        type: 'high_income',
        description: `High-income communities with median household income over $100k`,
        zipCodes: highIncomeZips.map(zip => zip.zipCode),
        potential: highIncomeZips.length > 10 ? 'high' : 'medium'
      });
    }

    // Young professionals
    const youngZips = zipCodes.filter(zip => zip.demographics.ageMedian < 35 && zip.demographics.education.bachelorDegree > 30);
    if (youngZips.length > 0) {
      opportunities.push({
        type: 'young_professionals',
        description: `Young, educated professionals (under 35, 30%+ college-educated)`,
        zipCodes: youngZips.map(zip => zip.zipCode),
        potential: youngZips.length > 5 ? 'high' : 'medium'
      });
    }

    // Family communities
    const familyZips = zipCodes.filter(zip => zip.demographics.householdSize.average > 3 && zip.economics.householdIncome.median > 75000);
    if (familyZips.length > 0) {
      opportunities.push({
        type: 'family_communities',
        description: `Family-oriented communities with larger households and good income`,
        zipCodes: familyZips.map(zip => zip.zipCode),
        potential: familyZips.length > 5 ? 'high' : 'medium'
      });
    }

    return opportunities;
  }

  /**
   * Get census data for specific zip codes
   */
  public async getZipCodeData(zipCodes: string[]): Promise<CensusZipCodeData[]> {
    if (!this.isLoaded) {
      await this.loadCensusData();
    }

    return zipCodes
      .map(zip => this.censusData.get(zip))
      .filter((data): data is CensusZipCodeData => data !== undefined);
  }

  /**
   * Search zip codes by location name
   */
  public async searchZipCodesByLocation(query: string): Promise<CensusZipCodeData[]> {
    if (!this.isLoaded) {
      await this.loadCensusData();
    }

    const queryLower = query.toLowerCase();
    const allZipCodes = Array.from(this.censusData.values());
    
    // Check if this is a state-level query
    const isStateQuery = this.isStateQuery(queryLower);
    
    if (isStateQuery) {
      // For state queries, prioritize exact state matches and return all ZIP codes sorted by population
      const stateMatches = allZipCodes.filter(zip => 
        zip.geography.state.toLowerCase() === queryLower
      ).sort((a, b) => b.population - a.population);
      
      // If we have state matches, return them (up to 1000 for state-level analysis)
      if (stateMatches.length > 0) {
        console.log(`📍 Found ${stateMatches.length} ZIP codes for state: ${queryLower}`);
        return stateMatches.slice(0, 1000);
      }
    }
    
    // For other queries, use the original logic but with better prioritization
    const exactStateMatches = allZipCodes.filter(zip => 
      zip.geography.state.toLowerCase() === queryLower
    );
    
    const exactCityMatches = allZipCodes.filter(zip => 
      zip.geography.city.toLowerCase() === queryLower
    );
    
    const partialMatches = allZipCodes.filter(zip => 
      zip.geography.city.toLowerCase().includes(queryLower) ||
      zip.geography.county.toLowerCase().includes(queryLower) ||
      zip.geography.state.toLowerCase().includes(queryLower) ||
      zip.geography.metroArea.toLowerCase().includes(queryLower)
    );
    
    // Combine and deduplicate, prioritizing exact matches
    const results = [...exactStateMatches, ...exactCityMatches, ...partialMatches];
    const uniqueResults = results.filter((zip, index, self) => 
      index === self.findIndex(z => z.zipCode === zip.zipCode)
    );
    
    return uniqueResults.slice(0, 50);
  }

  /**
   * Check if query is likely a state name
   */
  private isStateQuery(query: string): boolean {
    const states = [
      'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
      'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
      'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
      'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire',
      'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio',
      'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota',
      'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia',
      'wisconsin', 'wyoming', 'dc', 'washington dc'
    ];
    
    return states.includes(query);
  }

  /**
   * Get data status
   */
  public getDataStatus(): { loaded: boolean, totalZipCodes: number } {
    return {
      loaded: this.isLoaded,
      totalZipCodes: this.censusData.size
    };
  }
}
