/**
 * Market Insights Service
 * Transforms raw census data into actionable market intelligence
 * Supports Top Market Identification and Market Profile Deep Dive
 */

import { CensusDataService, STATE_TO_REGION } from './censusDataService';
import {
  CensusZipCodeData,
  GeographicLevel,
  MarketInsightsMetric,
  TopMarket,
  MarketProfile,
  MarketAttribute,
  StrategicInsight
} from '../types/censusData';

interface AggregatedMarket {
  name: string;
  geoLevel: GeographicLevel;
  population: number;
  zipCodes: CensusZipCodeData[];
  // All possible metrics
  [key: string]: any;
}

export class MarketInsightsService {
  private censusService: CensusDataService;
  private aggregatedDataCache: Map<string, AggregatedMarket[]> = new Map();
  private nationalBenchmark: any = null;
  private normalizationRanges: {
    householdIncomeMedian: { min: number; max: number };
    medianHomeValue: { min: number; max: number };
    rentBurden: { min: number; max: number };
    charitableGivers: { min: number; max: number };
    veteran: { min: number; max: number };
  } | null = null;

  constructor() {
    this.censusService = CensusDataService.getInstance();
  }

  /**
   * Get available metrics for market analysis
   */
  public getAvailableMetrics(): MarketInsightsMetric[] {
    return [
      // Demographics
      { id: 'population', name: 'Total Population', category: 'Demographics', column: 'population', format: 'number', description: 'Total residential population' },
      { id: 'age_median', name: 'Median Age', category: 'Demographics', column: 'ageMedian', format: 'number', description: 'Median age of population' },
      { id: 'age_under_10', name: 'Population Under 10', category: 'Demographics', column: 'ageUnder10', format: 'percentage', description: 'Percentage of population under 10 years old' },
      { id: 'age_10_to_19', name: 'Population 10-19', category: 'Demographics', column: 'age10to19', format: 'percentage', description: 'Percentage of population aged 10-19' },
      { id: 'age_20s', name: 'Population in 20s', category: 'Demographics', column: 'age20s', format: 'percentage', description: 'Percentage of population in their 20s' },
      { id: 'age_30s', name: 'Population in 30s', category: 'Demographics', column: 'age30s', format: 'percentage', description: 'Percentage of population in their 30s' },
      { id: 'age_40s', name: 'Population in 40s', category: 'Demographics', column: 'age40s', format: 'percentage', description: 'Percentage of population in their 40s' },
      { id: 'age_50s', name: 'Population in 50s', category: 'Demographics', column: 'age50s', format: 'percentage', description: 'Percentage of population in their 50s' },
      { id: 'age_60s', name: 'Population in 60s', category: 'Demographics', column: 'age60s', format: 'percentage', description: 'Percentage of population in their 60s' },
      { id: 'age_over_65', name: 'Population 65+', category: 'Demographics', column: 'age65plus', format: 'percentage', description: 'Percentage of population aged 65 and over' },
      { id: 'age_70s', name: 'Population in 70s', category: 'Demographics', column: 'age70s', format: 'percentage', description: 'Percentage of population in their 70s' },
      { id: 'age_over_80', name: 'Population 80+', category: 'Demographics', column: 'ageOver80', format: 'percentage', description: 'Percentage of population aged 80 and over' },
      { id: 'male', name: 'Male Population', category: 'Demographics', column: 'male', format: 'percentage', description: 'Percentage of male population' },
      { id: 'female', name: 'Female Population', category: 'Demographics', column: 'female', format: 'percentage', description: 'Percentage of female population' },
      
      // Racial & Ethnic Diversity
      { id: 'race_white', name: 'White Population', category: 'Racial & Ethnic Diversity', column: 'white', format: 'percentage', description: 'Percentage of White population' },
      { id: 'race_black', name: 'Black Population', category: 'Racial & Ethnic Diversity', column: 'black', format: 'percentage', description: 'Percentage of Black/African American population' },
      { id: 'race_asian', name: 'Asian Population', category: 'Racial & Ethnic Diversity', column: 'asian', format: 'percentage', description: 'Percentage of Asian population' },
      { id: 'hispanic', name: 'Hispanic Population', category: 'Racial & Ethnic Diversity', column: 'hispanic', format: 'percentage', description: 'Percentage of Hispanic/Latino population' },
      
      // Socioeconomics
      { id: 'income_household_median', name: 'Median Household Income', category: 'Socioeconomics', column: 'householdIncomeMedian', format: 'currency', description: 'Median annual household income' },
      { id: 'income_individual_median', name: 'Median Individual Income', category: 'Socioeconomics', column: 'individualIncomeMedian', format: 'currency', description: 'Median annual individual income' },
      { id: 'income_household_six_figure', name: 'Six-Figure Households', category: 'Socioeconomics', column: 'sixFigureHouseholds', format: 'percentage', description: 'Percentage of households earning $100k+' },
      { id: 'poverty', name: 'Poverty Rate', category: 'Socioeconomics', column: 'povertyRate', format: 'percentage', description: 'Percentage of population below poverty line' },
      { id: 'unemployment_rate', name: 'Unemployment Rate', category: 'Socioeconomics', column: 'unemploymentRate', format: 'percentage', description: 'Percentage of labor force unemployed' },
      
      // Housing & Wealth
      { id: 'home_value', name: 'Median Home Value', category: 'Housing & Wealth', column: 'medianHomeValue', format: 'currency', description: 'Median value of owner-occupied homes' },
      { id: 'rent_median', name: 'Median Rent', category: 'Housing & Wealth', column: 'medianRent', format: 'currency', description: 'Median monthly rent' },
      { id: 'home_ownership', name: 'Homeownership Rate', category: 'Housing & Wealth', column: 'homeownershipRate', format: 'percentage', description: 'Percentage of owner-occupied housing units' },
      
      // Education & Social
      { id: 'education_college_or_above', name: 'College Educated', category: 'Education & Social', column: 'collegeEducated', format: 'percentage', description: 'Percentage with bachelor\'s degree or higher' },
      { id: 'education_bachelors', name: "Bachelor's Degree", category: 'Education & Social', column: 'bachelorDegree', format: 'percentage', description: 'Percentage with bachelor\'s degree' },
      { id: 'education_stem_degree', name: 'STEM Degree', category: 'Education & Social', column: 'stemDegree', format: 'percentage', description: 'Percentage with STEM degree' },
      { id: 'married', name: 'Married Population', category: 'Education & Social', column: 'married', format: 'percentage', description: 'Percentage of population that is married' },
      { id: 'family_dual_income', name: 'Dual-Income Families', category: 'Education & Social', column: 'dualIncome', format: 'percentage', description: 'Percentage of families with dual income' },
      
      // Work & Lifestyle
      { id: 'commute_time', name: 'Average Commute Time', category: 'Work & Lifestyle', column: 'commuteTime', format: 'number', description: 'Average commute time in minutes' },
      { id: 'self_employed', name: 'Self-Employed', category: 'Work & Lifestyle', column: 'selfEmployed', format: 'percentage', description: 'Percentage of self-employed workers' },
      { id: 'family_size', name: 'Average Household Size', category: 'Work & Lifestyle', column: 'householdSizeAverage', format: 'number', description: 'Average number of people per household' },
      { id: 'charitable_givers', name: 'Charitable Givers', category: 'Work & Lifestyle', column: 'charitableGivers', format: 'percentage', description: 'Percentage who donate to charity' },
      
      // Derived Metrics (Advanced Indices)
      { id: 'consumer_wealth_index', name: 'Consumer Wealth Index', category: 'Socioeconomics', column: 'consumerWealthIndex', format: 'number', description: 'Composite score (0-100) measuring disposable income capacity' },
      { id: 'community_cohesion_score', name: 'Community Cohesion Score', category: 'Education & Social', column: 'communityCohesionScore', format: 'number', description: 'Composite score (0-100) measuring civic engagement and community ties' },
    ];
  }

  /**
   * Get top zip codes ranked by a specific metric
   * Returns up to 5000 zip codes for campaign targeting
   */
  public async getTopZipCodesByMetric(
    metricId: string,
    limit: number = 5000,
    includeCommercialZips: boolean = false
  ): Promise<any[]> {
    console.log(`🔍 Getting top ${limit} zip codes by ${metricId}`);

    // Get all census data (Note: CensusDataService already filters to ZCTA=TRUE by default)
    const allZipData = await this.censusService.getAllCensusData();

    // Find the metric definition
    const metric = this.getAvailableMetrics().find(m => m.id === metricId);
    if (!metric) {
      throw new Error(`Unknown metric: ${metricId}`);
    }

    // Create a temporary market object for each zip to use extractMetricValue
    const zipCodeData = allZipData.map(zipData => {
      const tempMarket = {
        name: zipData.zipCode,
        geoLevel: 'zip' as GeographicLevel,
        population: zipData.population,
        zipCodes: [zipData],
        // Copy all relevant metrics
        ageMedian: zipData.demographics.ageMedian,
        householdIncomeMedian: zipData.economics.householdIncome.median,
        collegeEducated: zipData.demographics.education.bachelorDegree + zipData.demographics.education.graduateDegree,
        povertyRate: zipData.economics.povertyRate,
        unemploymentRate: zipData.economics.unemploymentRate,
        medianHomeValue: zipData.geography.housing.medianHomeValue,
        medianRent: zipData.geography.housing.medianRent,
        homeownershipRate: zipData.geography.housing.ownerOccupiedRate,
        sixFigureHouseholds: zipData.economics.householdIncome.sixFigurePercentage,
        // Age cohorts
        ageUnder10: zipData.demographics.ageCohorts?.ageUnder10 || 0,
        age10to19: zipData.demographics.ageCohorts?.age10to19 || 0,
        age20s: zipData.demographics.ageCohorts?.age20s || 0,
        age30s: zipData.demographics.ageCohorts?.age30s || 0,
        age40s: zipData.demographics.ageCohorts?.age40s || 0,
        age50s: zipData.demographics.ageCohorts?.age50s || 0,
        age60s: zipData.demographics.ageCohorts?.age60s || 0,
        age70s: zipData.demographics.ageCohorts?.age70s || 0,
        ageOver80: zipData.demographics.ageCohorts?.ageOver80 || 0,
        age65plus: zipData.demographics.ageDistribution.age65plus,
        // Ethnicity
        white: zipData.demographics.ethnicity.white,
        black: zipData.demographics.ethnicity.black,
        asian: zipData.demographics.ethnicity.asian,
        hispanic: zipData.demographics.ethnicity.hispanic,
        // Education
        bachelorDegree: zipData.demographics.education.bachelorDegree,
        stemDegree: zipData.demographics.lifestyle?.stemDegree || 0,
        // Social
        married: zipData.demographics.lifestyle?.married || 0,
        dualIncome: zipData.demographics.lifestyle?.dualIncome || 0,
        // Work & Lifestyle
        commuteTime: zipData.geography.commuteTime.average,
        selfEmployed: zipData.demographics.lifestyle?.selfEmployed || 0,
        householdSizeAverage: zipData.demographics.householdSize || 0,
        charitableGivers: zipData.demographics.lifestyle?.charitableGivers || 0,
      };

      const value = this.extractMetricValue(tempMarket, metric.column);
      
      return {
        zipCode: zipData.zipCode,
        city: zipData.geography.city,
        state: zipData.geography.state,
        county: zipData.geography.county,
        population: zipData.population,
        metricValue: value,
        formattedValue: this.formatValue(value, metric.format)
      };
    });

    // Sort by metric value (highest first) and take top N
    return zipCodeData
      .filter(z => !isNaN(z.metricValue) && z.metricValue !== null && z.metricValue !== undefined)
      .sort((a, b) => b.metricValue - a.metricValue)
      .slice(0, limit);
  }

  /**
   * Get top markets ranked by a specific metric
   */
  public async getTopMarketsByMetric(
    metricId: string,
    geoLevel: GeographicLevel,
    limit: number = 50,
    includeCommercialZips: boolean = false
  ): Promise<TopMarket[]> {
    console.log(`🔍 Getting top markets by ${metricId} at ${geoLevel} level`);

    // Get aggregated data for the geographic level
    const markets = await this.getAggregatedMarkets(geoLevel, includeCommercialZips);
    
    // Find the metric definition
    const metric = this.getAvailableMetrics().find(m => m.id === metricId);
    if (!metric) {
      throw new Error(`Unknown metric: ${metricId}`);
    }

    // Extract and sort by metric value, calculate opportunity scores
    const rankedMarkets = markets
      .map(market => {
        const value = this.extractMetricValue(market, metric.column);
        const oppScore = this.calculateOpportunityScore(market);
        return {
          name: market.name,
          geoLevel: market.geoLevel,
          value,
          population: market.population,
          opportunityScore: oppScore.score,
          tier: oppScore.tier,
          market // keep reference for scoring
        };
      })
      .filter(m => m.value !== null && m.value !== undefined && !isNaN(m.value))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
      .map((market, index) => {
        const competitiveIntel = this.calculateCompetitiveIntelligence(market.market, index + 1, market.opportunityScore || 0);
        console.log(`🔍 Competitive intel for ${market.name} (rank ${index + 1}):`, competitiveIntel);
        return {
          rank: index + 1,
          name: market.name,
          geoLevel: market.geoLevel,
          value: market.value,
          population: market.population,
          formattedValue: this.formatValue(market.value, metric.format),
          opportunityScore: market.opportunityScore,
          tier: market.tier,
          ...competitiveIntel
        };
      });

    console.log(`✅ Found ${rankedMarkets.length} top markets`);
    return rankedMarkets;
  }

  /**
   * Get comprehensive market profile
   */
  public async getMarketProfile(
    geoLevel: GeographicLevel,
    marketName: string,
    includeCommercialZips: boolean = false
  ): Promise<MarketProfile> {
    console.log(`📊 Getting market profile for ${marketName} (${geoLevel})`);

    // Get aggregated markets
    const markets = await this.getAggregatedMarkets(geoLevel, includeCommercialZips);
    const market = markets.find(m => m.name === marketName);

    if (!market) {
      throw new Error(`Market not found: ${marketName}`);
    }

    // Calculate national benchmark if not cached
    if (!this.nationalBenchmark) {
      this.nationalBenchmark = await this.calculateNationalBenchmark();
    }

    // Get all metrics as attributes
    const metrics = this.getAvailableMetrics();
    const attributes: MarketAttribute[] = metrics.map(metric => {
      const value = this.extractMetricValue(market, metric.column);
      const nationalAvg = this.extractMetricValue(this.nationalBenchmark, metric.column);
      const percentDiff = nationalAvg ? ((value - nationalAvg) / nationalAvg) * 100 : 0;

      return {
        name: metric.name,
        value,
        formattedValue: this.formatValue(value, metric.format),
        nationalAverage: nationalAvg,
        percentDifference: percentDiff,
        category: metric.category,
        format: metric.format
      };
    }).filter(attr => !isNaN(attr.value));

    // Generate strategic snapshot
    const strategicSnapshot = this.generateStrategicSnapshot(attributes);

    // Classify market archetype
    const archetypeData = this.classifyMarketArchetype(market);

    // Generate geographic hierarchy
    const geographicHierarchy = this.generateGeographicHierarchy(market);

    // Find similar markets
    const similarMarkets = await this.findSimilarMarkets(market, geoLevel, includeCommercialZips, 5);

    // Calculate Poverty Ratio
    const povertyRatio = this.nationalBenchmark && this.nationalBenchmark.povertyRate > 0
      ? (market.povertyRate || 0) / this.nationalBenchmark.povertyRate
      : 1;

    return {
      name: market.name,
      geoLevel: market.geoLevel,
      population: market.population,
      geographicHierarchy,
      attributes,
      strategicSnapshot: {
        ...strategicSnapshot,
        archetype: archetypeData.archetype,
        bestFor: archetypeData.bestFor,
        lifeStageSegment: market.lifeStageSegment || 'Established/Mixed',
        consumerWealthIndex: market.consumerWealthIndex || 0,
        communityCohesionScore: market.communityCohesionScore || 0,
        povertyRatio: povertyRatio
      },
      similarMarkets
    };
  }

  /**
   * Aggregate ZIP-level data to higher geographic levels
   */
  private async getAggregatedMarkets(geoLevel: GeographicLevel, includeCommercialZips: boolean = false): Promise<AggregatedMarket[]> {
    // Create cache key that includes the commercial ZIP filter
    const cacheKey = `${geoLevel}_${includeCommercialZips}`;
    
    // Check cache first
    if (this.aggregatedDataCache.has(cacheKey)) {
      return this.aggregatedDataCache.get(cacheKey)!;
    }

    console.log(`🔄 Aggregating data to ${geoLevel} level...`);
    let allZipData = await this.censusService.getAllCensusData();
    
    // Filter out commercial ZIPs if not included
    if (!includeCommercialZips) {
      // Note: The CensusDataService already filters to ZCTA=TRUE during loading
      // So by default, commercial ZIPs are already excluded
    }

    let aggregated: AggregatedMarket[] = [];

    switch (geoLevel) {
      case 'region':
        aggregated = this.aggregateByRegion(allZipData);
        break;
      case 'state':
        aggregated = this.aggregateByState(allZipData);
        break;
      case 'cbsa':
        aggregated = this.aggregateByCBSA(allZipData);
        break;
      case 'county':
        aggregated = this.aggregateByCounty(allZipData);
        break;
      case 'city':
        aggregated = this.aggregateByCity(allZipData);
        break;
      case 'zip':
        aggregated = this.aggregateByZip(allZipData);
        break;
    }

    // Calculate normalization ranges for derived metrics if not already done
    const hadRanges = this.normalizationRanges !== null;
    this.calculateNormalizationRanges(aggregated);
    
    // If we just calculated new ranges, invalidate the national benchmark cache
    // so it gets recalculated with the new derived metrics
    if (!hadRanges && this.normalizationRanges) {
      this.nationalBenchmark = null;
      console.log('🔄 National benchmark cache cleared - will recalculate with derived metrics');
    }

    // Calculate derived metrics for each market
    console.log('🔢 Calculating derived metrics (CWI, CCS, Life Stage)...');
    aggregated.forEach(market => {
      market.consumerWealthIndex = this.calculateConsumerWealthIndex(market);
      market.communityCohesionScore = this.calculateCommunityCohesionScore(market);
      market.lifeStageSegment = this.determineLifeStageSegment(market);
    });

    // Cache the result with the commercial ZIP filter in the key
    this.aggregatedDataCache.set(cacheKey, aggregated);
    console.log(`✅ Aggregated ${aggregated.length} markets at ${geoLevel} level with derived metrics`);

    return aggregated;
  }

  /**
   * Aggregate by Census Bureau Region
   */
  private aggregateByRegion(zipData: CensusZipCodeData[]): AggregatedMarket[] {
    const regions = new Map<string, CensusZipCodeData[]>();

    zipData.forEach(zip => {
      const region = this.censusService.getRegionForState(zip.geography.state);
      if (region && region.trim()) {
        if (!regions.has(region)) {
          regions.set(region, []);
        }
        regions.get(region)!.push(zip);
      }
    });

    return Array.from(regions.entries()).map(([name, zips]) => 
      this.aggregateZipsToMarket(name, 'region', zips)
    );
  }

  /**
   * Aggregate by State
   */
  private aggregateByState(zipData: CensusZipCodeData[]): AggregatedMarket[] {
    const states = new Map<string, CensusZipCodeData[]>();

    zipData.forEach(zip => {
      const state = zip.geography.state;
      if (state && state.trim()) {
        if (!states.has(state)) {
          states.set(state, []);
        }
        states.get(state)!.push(zip);
      }
    });

    return Array.from(states.entries()).map(([name, zips]) => 
      this.aggregateZipsToMarket(name, 'state', zips)
    );
  }

  /**
   * Aggregate by CBSA (Core-Based Statistical Area)
   */
  private aggregateByCBSA(zipData: CensusZipCodeData[]): AggregatedMarket[] {
    const cbsas = new Map<string, CensusZipCodeData[]>();

    zipData.forEach(zip => {
      const cbsa = zip.geography.metroArea;
      if (cbsa && cbsa.trim()) {
        if (!cbsas.has(cbsa)) {
          cbsas.set(cbsa, []);
        }
        cbsas.get(cbsa)!.push(zip);
      }
    });

    return Array.from(cbsas.entries()).map(([name, zips]) => 
      this.aggregateZipsToMarket(name, 'cbsa', zips)
    );
  }

  /**
   * Aggregate by County
   */
  private aggregateByCounty(zipData: CensusZipCodeData[]): AggregatedMarket[] {
    const counties = new Map<string, CensusZipCodeData[]>();

    zipData.forEach(zip => {
      const county = zip.geography.county;
      const state = zip.geography.state;
      const key = `${county}, ${state}`;
      if (county && county.trim()) {
        if (!counties.has(key)) {
          counties.set(key, []);
        }
        counties.get(key)!.push(zip);
      }
    });

    return Array.from(counties.entries()).map(([name, zips]) => 
      this.aggregateZipsToMarket(name, 'county', zips)
    );
  }

  /**
   * Aggregate by City
   */
  private aggregateByCity(zipData: CensusZipCodeData[]): AggregatedMarket[] {
    const cities = new Map<string, CensusZipCodeData[]>();

    zipData.forEach(zip => {
      const city = zip.geography.city;
      const state = zip.geography.state;
      const key = `${city}, ${state}`;
      if (city && city.trim()) {
        if (!cities.has(key)) {
          cities.set(key, []);
        }
        cities.get(key)!.push(zip);
      }
    });

    return Array.from(cities.entries()).map(([name, zips]) => 
      this.aggregateZipsToMarket(name, 'city', zips)
    );
  }

  /**
   * "Aggregate" by ZIP (essentially return as-is with proper structure)
   */
  private aggregateByZip(zipData: CensusZipCodeData[]): AggregatedMarket[] {
    return zipData.map(zip => 
      this.aggregateZipsToMarket(zip.zipCode, 'zip', [zip])
    );
  }

  /**
   * Aggregate multiple ZIPs into a single market
   * Uses population-weighted averages for percentages
   */
  private aggregateZipsToMarket(
    name: string,
    geoLevel: GeographicLevel,
    zips: CensusZipCodeData[]
  ): AggregatedMarket {
    const totalPopulation = zips.reduce((sum, zip) => sum + zip.population, 0);

    // Helper: Calculate population-weighted average
    const weightedAvg = (getValue: (zip: CensusZipCodeData) => number): number => {
      if (totalPopulation === 0) return 0;
      const sum = zips.reduce((acc, zip) => {
        const value = getValue(zip);
        return acc + (value * zip.population);
      }, 0);
      return sum / totalPopulation;
    };

    return {
      name,
      geoLevel,
      population: totalPopulation,
      zipCodes: zips,
      
      // Demographics
      ageMedian: weightedAvg(z => z.demographics.ageMedian),
      ageUnder10: weightedAvg(z => z.demographics.ageCohorts?.ageUnder10 || 0),
      age10to19: weightedAvg(z => z.demographics.ageCohorts?.age10to19 || 0),
      age18to24: weightedAvg(z => z.demographics.ageDistribution.age18to24),
      age20s: weightedAvg(z => z.demographics.ageCohorts?.age20s || 0),
      age30s: weightedAvg(z => z.demographics.ageCohorts?.age30s || 0),
      age40s: weightedAvg(z => z.demographics.ageCohorts?.age40s || 0),
      age50s: weightedAvg(z => z.demographics.ageCohorts?.age50s || 0),
      age60s: weightedAvg(z => z.demographics.ageCohorts?.age60s || 0),
      age65plus: weightedAvg(z => z.demographics.ageDistribution.age65plus),
      age70s: weightedAvg(z => z.demographics.ageCohorts?.age70s || 0),
      ageOver80: weightedAvg(z => z.demographics.ageCohorts?.ageOver80 || 0),
      male: 50, // Would need raw data to calculate properly
      female: 50,
      
      // Racial & Ethnic Diversity
      white: weightedAvg(z => z.demographics.ethnicity.white),
      black: weightedAvg(z => z.demographics.ethnicity.black),
      asian: weightedAvg(z => z.demographics.ethnicity.asian),
      hispanic: weightedAvg(z => z.demographics.ethnicity.hispanic),
      
      // Socioeconomics
      householdIncomeMedian: weightedAvg(z => z.economics.householdIncome.median),
      individualIncomeMedian: weightedAvg(z => z.economics.householdIncome.median * 0.65), // Approximation
      sixFigureHouseholds: weightedAvg(z => z.economics.householdIncome.sixFigurePercentage),
      povertyRate: weightedAvg(z => z.economics.povertyRate),
      unemploymentRate: weightedAvg(z => z.economics.unemploymentRate),
      
      // Housing & Wealth
      medianHomeValue: weightedAvg(z => z.geography.housing.medianHomeValue),
      medianRent: weightedAvg(z => z.geography.housing.medianRent),
      homeownershipRate: weightedAvg(z => z.geography.housing.ownerOccupiedRate),
      
      // Education & Social
      collegeEducated: weightedAvg(z => z.demographics.education.bachelorDegree + z.demographics.education.graduateDegree),
      bachelorDegree: weightedAvg(z => z.demographics.education.bachelorDegree),
      stemDegree: weightedAvg(z => z.demographics.lifestyle?.stemDegree || 0),
      married: weightedAvg(z => z.demographics.lifestyle?.married || 0),
      dualIncome: weightedAvg(z => z.demographics.lifestyle?.dualIncome || 0),
      
      // Work & Lifestyle
      commuteTime: weightedAvg(z => z.demographics.lifestyle?.commuteTime || 0),
      selfEmployed: weightedAvg(z => z.demographics.lifestyle?.selfEmployed || 0),
      householdSizeAverage: weightedAvg(z => z.demographics.householdSize.average),
      charitableGivers: weightedAvg(z => z.demographics.lifestyle?.charitableGivers || 0),
      veteran: weightedAvg(z => z.demographics.lifestyle?.veteran || 0),
      rentBurden: weightedAvg(z => z.demographics.lifestyle?.rentBurden || 0)
    };
  }

  /**
   * Calculate national benchmark (aggregation of all data)
   */
  private async calculateNationalBenchmark(): Promise<AggregatedMarket> {
    const allZipData = await this.censusService.getAllCensusData();
    const benchmark = this.aggregateZipsToMarket('United States', 'region', allZipData);
    
    // Calculate derived metrics for the national benchmark
    // Note: Normalization ranges should already be calculated from getAggregatedMarkets
    if (this.normalizationRanges) {
      benchmark.consumerWealthIndex = this.calculateConsumerWealthIndex(benchmark);
      benchmark.communityCohesionScore = this.calculateCommunityCohesionScore(benchmark);
      benchmark.lifeStageSegment = this.determineLifeStageSegment(benchmark);
    }
    
    return benchmark;
  }

  /**
   * Extract metric value from aggregated market
   */
  private extractMetricValue(market: any, column: string): number {
    return market[column] || 0;
  }

  /**
   * Format value based on metric type
   */
  private formatValue(value: number, format: 'number' | 'percentage' | 'currency'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }

    switch (format) {
      case 'currency':
        return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
      default:
        return value.toString();
    }
  }

  /**
   * Generate strategic snapshot with top strengths and concerns
   */
  private generateStrategicSnapshot(attributes: MarketAttribute[]): {
    topStrengths: StrategicInsight[];
    bottomConcerns: StrategicInsight[];
    summary: string;
  } {
    // Sort by absolute percent difference
    const sortedByDiff = [...attributes]
      .filter(attr => !isNaN(attr.percentDifference))
      .sort((a, b) => Math.abs(b.percentDifference) - Math.abs(a.percentDifference));

    // Top 3 strengths (positive differences)
    const topStrengths: StrategicInsight[] = sortedByDiff
      .filter(attr => attr.percentDifference > 0)
      .slice(0, 3)
      .map(attr => ({
        attribute: attr.name,
        value: attr.value,
        formattedValue: attr.formattedValue,
        comparison: `${Math.abs(attr.percentDifference).toFixed(1)}% above national average`,
        impact: 'positive' as const
      }));

    // Bottom 3 concerns (negative differences)
    const bottomConcerns: StrategicInsight[] = sortedByDiff
      .filter(attr => attr.percentDifference < 0)
      .slice(0, 3)
      .map(attr => ({
        attribute: attr.name,
        value: attr.value,
        formattedValue: attr.formattedValue,
        comparison: `${Math.abs(attr.percentDifference).toFixed(1)}% below national average`,
        impact: 'negative' as const
      }));

    // Generate summary
    const summary = this.generateSummaryText(topStrengths, bottomConcerns);

    return {
      topStrengths,
      bottomConcerns,
      summary
    };
  }

  /**
   * Generate natural language summary
   */
  private generateSummaryText(strengths: StrategicInsight[], concerns: StrategicInsight[]): string {
    const strengthsText = strengths.length > 0 
      ? `This market stands out for ${strengths.map(s => s.attribute.toLowerCase()).join(', ')}.`
      : '';
    
    const concernsText = concerns.length > 0
      ? ` Key areas for consideration include ${concerns.map(c => c.attribute.toLowerCase()).join(', ')}.`
      : '';

    return strengthsText + concernsText || 'This market aligns closely with national averages across most metrics.';
  }

  /**
   * Generate geographic hierarchy for a market
   */
  private generateGeographicHierarchy(market: AggregatedMarket): {
    region?: string;
    state?: string;
    cbsa?: string;
    county?: string;
    city?: string;
  } {
    const hierarchy: {
      region?: string;
      state?: string;
      cbsa?: string;
      county?: string;
      city?: string;
    } = {};

    // Get a representative ZIP code from the market
    const sampleZip = market.zipCodes && market.zipCodes.length > 0 ? market.zipCodes[0] : null;
    
    if (!sampleZip) {
      return hierarchy;
    }

    // Build hierarchy based on market level
    switch (market.geoLevel) {
      case 'zip':
        hierarchy.city = sampleZip.geography.city;
        hierarchy.county = sampleZip.geography.county;
        hierarchy.cbsa = sampleZip.geography.metroArea;
        hierarchy.state = sampleZip.geography.state;
        hierarchy.region = this.censusService.getRegionForState(sampleZip.geography.state);
        break;
      
      case 'city':
        hierarchy.county = sampleZip.geography.county;
        hierarchy.cbsa = sampleZip.geography.metroArea;
        hierarchy.state = sampleZip.geography.state;
        hierarchy.region = this.censusService.getRegionForState(sampleZip.geography.state);
        break;
      
      case 'county':
        hierarchy.cbsa = sampleZip.geography.metroArea;
        hierarchy.state = sampleZip.geography.state;
        hierarchy.region = this.censusService.getRegionForState(sampleZip.geography.state);
        break;
      
      case 'cbsa':
        hierarchy.state = sampleZip.geography.state;
        hierarchy.region = this.censusService.getRegionForState(sampleZip.geography.state);
        break;
      
      case 'state':
        hierarchy.region = this.censusService.getRegionForState(sampleZip.geography.state);
        break;
      
      case 'region':
        // Region is the top level, no hierarchy above it
        break;
    }

    // Clean up empty values
    if (hierarchy.city === '') delete hierarchy.city;
    if (hierarchy.county === '') delete hierarchy.county;
    if (hierarchy.cbsa === '') delete hierarchy.cbsa;
    if (hierarchy.state === '') delete hierarchy.state;
    if (hierarchy.region === '') delete hierarchy.region;

    return hierarchy;
  }

  /**
   * Classify Market Archetype based on demographic and economic characteristics
   */
  private classifyMarketArchetype(market: AggregatedMarket): {
    archetype: string;
    bestFor: string[];
  } {
    const income = market.householdIncomeMedian || 0;
    const education = market.collegeEducated || 0;
    const age65plus = market.age65plus || 0;
    const age20s = market.age20s || 0;
    const age30s = market.age30s || 0;
    const stemDegree = market.stemDegree || 0;
    const selfEmployed = market.selfEmployed || 0;
    const homeownership = market.homeownershipRate || 0;
    const familySize = market.householdSizeAverage || 0;
    const unemploymentRate = market.unemploymentRate || 0;

    // Decision tree for archetype classification
    let archetype = 'Diverse Market';
    let bestFor: string[] = [];

    // Affluent College Town
    if (income > 70000 && education > 40 && (age20s + age30s) > 30) {
      archetype = 'Affluent College Town';
      bestFor = ['Higher education marketing', 'Tech products', 'Premium brands', 'Career services'];
    }
    // Retirement Destination
    else if (age65plus > 25 && unemploymentRate < 5 && homeownership > 65) {
      archetype = 'Retirement Destination';
      bestFor = ['Healthcare services', 'Financial planning', 'Leisure & travel', 'Home services'];
    }
    // Tech Hub
    else if (stemDegree > 15 && income > 75000 && (age20s + age30s + market.age40s) > 50) {
      archetype = 'Tech Hub';
      bestFor = ['B2B software', 'Tech recruitment', 'Coworking spaces', 'Professional services'];
    }
    // Manufacturing Hub
    else if (selfEmployed > 8 && income >= 45000 && income <= 70000 && education < 35) {
      archetype = 'Manufacturing Hub';
      bestFor = ['Industrial equipment', 'Trade schools', 'B2B services', 'Transportation'];
    }
    // Suburban Family Market
    else if (familySize > 2.8 && homeownership > 65 && income >= 55000) {
      archetype = 'Suburban Family Market';
      bestFor = ['Family products', 'Education services', 'Home improvement', 'Automotive'];
    }
    // Urban Metro
    else if (familySize < 2.5 && homeownership < 50 && (market.race_white < 60 || education > 35)) {
      archetype = 'Urban Metro';
      bestFor = ['Entertainment & dining', 'Fashion & lifestyle', 'Transit services', 'Cultural events'];
    }
    // Young Professional
    else if ((age20s + age30s) > 35 && income > 55000 && education > 30) {
      archetype = 'Young Professional Market';
      bestFor = ['Career development', 'Fitness & wellness', 'Dining & entertainment', 'Financial services'];
    }
    // Middle America
    else if (income >= 40000 && income <= 65000 && education >= 20 && education <= 40) {
      archetype = 'Middle America';
      bestFor = ['Retail', 'Consumer goods', 'Family services', 'Auto & home'];
    }

    return { archetype, bestFor };
  }

  /**
   * Calculate Market Opportunity Score (0-100)
   * Uses B2C-weighted scoring: Population (30%), Income (25%), Education (20%), Age 18-65 (15%), Density (10%)
   */
  public calculateOpportunityScore(market: AggregatedMarket): { score: number; tier: string; breakdown: any } {
    // Normalize values to 0-100 scale
    const normalize = (value: number, min: number, max: number): number => {
      if (max === min) return 50;
      return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    };

    // Define reasonable ranges for normalization
    const ranges = {
      population: { min: 0, max: 10000000 },
      income: { min: 20000, max: 150000 },
      education: { min: 0, max: 100 },
      workingAge: { min: 0, max: 100 },
      density: { min: 0, max: 5000 } // people per sq mile estimate
    };

    // Extract values with fallbacks
    const population = market.population || 0;
    const income = market.householdIncomeMedian || 0;
    const education = market.collegeEducated || 0;
    
    // Calculate working age population (18-65) - approximate from age distribution
    const workingAge = 100 - (market.ageUnder10 || 0) - (market.age10to19 || 0) - (market.age65plus || 0);
    
    // Estimate density (population / typical ZIP area)
    const estimatedArea = market.zipCodes ? market.zipCodes.length * 10 : 10; // rough estimate
    const density = population / estimatedArea;

    // Normalize each component
    const normalizedScores = {
      population: normalize(population, ranges.population.min, ranges.population.max),
      income: normalize(income, ranges.income.min, ranges.income.max),
      education: normalize(education, ranges.education.min, ranges.education.max),
      workingAge: normalize(workingAge, ranges.workingAge.min, ranges.workingAge.max),
      density: normalize(density, ranges.density.min, ranges.density.max)
    };

    // B2C Weights
    const weights = {
      population: 0.30,
      income: 0.25,
      education: 0.20,
      workingAge: 0.15,
      density: 0.10
    };

    // Calculate weighted score
    const score = Math.round(
      normalizedScores.population * weights.population +
      normalizedScores.income * weights.income +
      normalizedScores.education * weights.education +
      normalizedScores.workingAge * weights.workingAge +
      normalizedScores.density * weights.density
    );

    // Determine tier
    let tier = 'Standard';
    if (score >= 80) tier = 'Gold';
    else if (score >= 60) tier = 'Silver';
    else if (score >= 40) tier = 'Bronze';

    return {
      score,
      tier,
      breakdown: {
        population: { raw: population, normalized: Math.round(normalizedScores.population), weight: weights.population },
        income: { raw: income, normalized: Math.round(normalizedScores.income), weight: weights.income },
        education: { raw: education, normalized: Math.round(normalizedScores.education), weight: weights.education },
        workingAge: { raw: Math.round(workingAge), normalized: Math.round(normalizedScores.workingAge), weight: weights.workingAge },
        density: { raw: Math.round(density), normalized: Math.round(normalizedScores.density), weight: weights.density }
      }
    };
  }

  /**
   * Calculate normalization ranges for derived metrics
   * Pre-calculates min/max values across all markets for CWI and CCS scoring
   */
  private calculateNormalizationRanges(markets: AggregatedMarket[]): void {
    if (this.normalizationRanges) return; // Already calculated

    const ranges = {
      householdIncomeMedian: { min: Infinity, max: -Infinity },
      medianHomeValue: { min: Infinity, max: -Infinity },
      rentBurden: { min: Infinity, max: -Infinity },
      charitableGivers: { min: Infinity, max: -Infinity },
      veteran: { min: Infinity, max: -Infinity }
    };

    markets.forEach(market => {
      const income = market.householdIncomeMedian || 0;
      const homeValue = market.medianHomeValue || 0;
      const rentBurden = market.rentBurden || 0;
      const charitable = market.charitableGivers || 0;
      const veteran = market.veteran || 0;

      if (income > 0) {
        ranges.householdIncomeMedian.min = Math.min(ranges.householdIncomeMedian.min, income);
        ranges.householdIncomeMedian.max = Math.max(ranges.householdIncomeMedian.max, income);
      }
      if (homeValue > 0) {
        ranges.medianHomeValue.min = Math.min(ranges.medianHomeValue.min, homeValue);
        ranges.medianHomeValue.max = Math.max(ranges.medianHomeValue.max, homeValue);
      }
      if (rentBurden > 0) {
        ranges.rentBurden.min = Math.min(ranges.rentBurden.min, rentBurden);
        ranges.rentBurden.max = Math.max(ranges.rentBurden.max, rentBurden);
      }
      if (charitable > 0) {
        ranges.charitableGivers.min = Math.min(ranges.charitableGivers.min, charitable);
        ranges.charitableGivers.max = Math.max(ranges.charitableGivers.max, charitable);
      }
      if (veteran > 0) {
        ranges.veteran.min = Math.min(ranges.veteran.min, veteran);
        ranges.veteran.max = Math.max(ranges.veteran.max, veteran);
      }
    });

    // Handle edge cases where min/max weren't set
    Object.keys(ranges).forEach(key => {
      const range = ranges[key as keyof typeof ranges];
      if (range.min === Infinity) range.min = 0;
      if (range.max === -Infinity) range.max = 100;
    });

    this.normalizationRanges = ranges;
    console.log('✅ Normalization ranges calculated:', this.normalizationRanges);
  }

  /**
   * Calculate Consumer Wealth Index (CWI)
   * Composite score (0-100) measuring disposable income capacity
   * Formula: 40% median income + 35% home value + 25% inverse rent burden
   */
  private calculateConsumerWealthIndex(market: AggregatedMarket): number {
    if (!this.normalizationRanges) {
      return 0; // Ranges not yet calculated
    }

    const income = market.householdIncomeMedian || 0;
    const homeValue = market.medianHomeValue || 0;
    const rentBurden = market.rentBurden || 0;

    // Helper: Normalize value to 0-100 scale
    const normalize = (value: number, min: number, max: number): number => {
      if (max === min || value === 0) return 0;
      return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    };

    // Normalize each component
    const normalizedIncome = normalize(
      income,
      this.normalizationRanges.householdIncomeMedian.min,
      this.normalizationRanges.householdIncomeMedian.max
    );

    const normalizedHomeValue = normalize(
      homeValue,
      this.normalizationRanges.medianHomeValue.min,
      this.normalizationRanges.medianHomeValue.max
    );

    // Inverse rent burden: higher burden = lower score
    // Use mathematical inverse: 1/rentBurden, then normalize and scale
    const invertedRentBurden = rentBurden > 0 ? (1 / rentBurden) * 100 : 0;
    const normalizedInvertedRentBurden = normalize(
      invertedRentBurden,
      0,
      (1 / this.normalizationRanges.rentBurden.min) * 100 // Max inverse is when rent burden is minimum
    );

    // Apply weights: 40% income, 35% home value, 25% inverted rent burden
    const cwi = Math.round(
      normalizedIncome * 0.40 +
      normalizedHomeValue * 0.35 +
      normalizedInvertedRentBurden * 0.25
    );

    return Math.max(0, Math.min(100, cwi)); // Ensure 0-100 range
  }

  /**
   * Calculate Community Cohesion Score (CCS)
   * Composite score (0-100) measuring civic engagement and community ties
   * Formula: 50% charitable givers + 50% veteran population
   */
  private calculateCommunityCohesionScore(market: AggregatedMarket): number {
    if (!this.normalizationRanges) {
      return 0; // Ranges not yet calculated
    }

    const charitable = market.charitableGivers || 0;
    const veteran = market.veteran || 0;

    // Helper: Normalize value to 0-100 scale
    const normalize = (value: number, min: number, max: number): number => {
      if (max === min || value === 0) return 0;
      return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    };

    // Normalize each component
    const normalizedCharitable = normalize(
      charitable,
      this.normalizationRanges.charitableGivers.min,
      this.normalizationRanges.charitableGivers.max
    );

    const normalizedVeteran = normalize(
      veteran,
      this.normalizationRanges.veteran.min,
      this.normalizationRanges.veteran.max
    );

    // Apply equal weights: 50% each
    const ccs = Math.round(
      normalizedCharitable * 0.50 +
      normalizedVeteran * 0.50
    );

    return Math.max(0, Math.min(100, ccs)); // Ensure 0-100 range
  }

  /**
   * Determine Life Stage Segmentation
   * Categorizes markets based on dominant demographic cohorts
   * When multiple match, uses strength of secondary criteria for tie-breaking
   */
  private determineLifeStageSegment(market: AggregatedMarket): string {
    const age65plus = market.age65plus || 0;
    const age20s = market.age20s || 0;
    const age30s = market.age30s || 0;
    const familySize = market.householdSizeAverage || 0;
    const married = market.married || 0;
    const collegeEducated = market.collegeEducated || 0;

    // Track which segments match and their secondary criteria strength
    const matches: { segment: string; primaryScore: number; secondaryScore: number }[] = [];

    // 1. Retirement/Empty Nester
    if (age65plus > 25 && familySize < 2.5) {
      matches.push({
        segment: 'Retirement/Empty Nester',
        primaryScore: age65plus,
        secondaryScore: (2.5 - familySize) * 20 // Higher score for smaller families
      });
    }

    // 2. Grower (Family)
    if (familySize >= 3.0 && age30s >= 15 && married > 45) {
      matches.push({
        segment: 'Grower (Family)',
        primaryScore: familySize * 20, // Normalize family size contribution
        secondaryScore: age30s + married // Combined strength of secondary criteria
      });
    }

    // 3. Starter (Young Professional)
    if ((age20s + age30s) > 30 && collegeEducated > 40) {
      matches.push({
        segment: 'Starter (Young Professional)',
        primaryScore: age20s + age30s,
        secondaryScore: collegeEducated
      });
    }

    // If no matches, return default
    if (matches.length === 0) {
      return 'Established/Mixed';
    }

    // If single match, return it
    if (matches.length === 1) {
      return matches[0]?.segment || 'Established/Mixed';
    }

    // Multiple matches: prioritize by strength of secondary criteria
    matches.sort((a, b) => {
      // First compare secondary scores
      if (b.secondaryScore !== a.secondaryScore) {
        return b.secondaryScore - a.secondaryScore;
      }
      // If tied, compare primary scores
      return b.primaryScore - a.primaryScore;
    });

    return matches[0]?.segment || 'Established/Mixed';
  }

  /**
   * Find similar markets based on demographic and economic similarity
   * Uses cosine similarity with weighted features
   */
  private async findSimilarMarkets(
    targetMarket: AggregatedMarket,
    geoLevel: GeographicLevel,
    includeCommercialZips: boolean,
    limit: number = 5
  ): Promise<any[]> {
    console.log(`\n🔍 Finding similar markets for: ${targetMarket.name} (${geoLevel})`);
    
    // Get all markets at the same geographic level
    const allMarkets = await this.getAggregatedMarkets(geoLevel, includeCommercialZips);
    console.log(`📊 Comparing against ${allMarkets.length} markets`);
    
    // Define key features for comparison
    const features = [
      'ageMedian',
      'collegeEducated',
      'householdIncomeMedian',
      'sixFigureHouseholds',
      'homeOwnership',
      'poverty',
      'unemployment',
      'white',
      'black',
      'hispanic',
      'asian'
    ];

    // Calculate similarity scores
    const similarities = allMarkets
      .filter(m => m.name !== targetMarket.name) // Exclude self
      .map(market => {
        const score = this.calculateCosineSimilarity(targetMarket, market, features);
        return { market, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Format similar markets with key attributes
    return similarities.map(({ market, score }) => {
      const rawScore = score;
      const multiplied = score * 1000;
      const floored = Math.floor(multiplied);  // Use floor instead of round
      const finalScore = floored / 10;
      
      console.log(`🔍 Similar Market: ${market.name}`);
      console.log(`   Raw score: ${rawScore}`);
      console.log(`   × 1000: ${multiplied}`);
      console.log(`   Floored: ${floored}`);
      console.log(`   Final (÷ 10): ${finalScore}%`);
      
      return {
        name: market.name,
        similarityScore: finalScore,
        population: market.population,
        keyAttributes: [
          {
            name: 'Median Age',
            value: market.ageMedian || 0,
            formattedValue: market.ageMedian ? `${market.ageMedian.toFixed(1)} years` : 'N/A'
          },
          {
            name: 'Median Household Income',
            value: market.householdIncomeMedian || 0,
            formattedValue: market.householdIncomeMedian ? `$${Math.round(market.householdIncomeMedian).toLocaleString()}` : 'N/A'
          },
          {
            name: 'College Educated',
            value: market.collegeEducated || 0,
            formattedValue: market.collegeEducated ? `${market.collegeEducated.toFixed(1)}%` : 'N/A'
          }
        ]
      };
    });
  }

  /**
   * Calculate cosine similarity between two markets
   * Based on selected features
   */
  private calculateCosineSimilarity(
    market1: AggregatedMarket,
    market2: AggregatedMarket,
    features: string[]
  ): number {
    // Extract feature vectors
    const vector1: number[] = [];
    const vector2: number[] = [];

    features.forEach(feature => {
      const val1 = this.extractMetricValue(market1, feature);
      const val2 = this.extractMetricValue(market2, feature);
      
      // Normalize by feature range to give equal weight
      if (!isNaN(val1) && !isNaN(val2)) {
        vector1.push(val1);
        vector2.push(val2);
      }
    });

    if (vector1.length === 0) return 0;

    // Calculate cosine similarity
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      const v1 = vector1[i] || 0;
      const v2 = vector2[i] || 0;
      dotProduct += v1 * v2;
      magnitude1 += v1 * v1;
      magnitude2 += v2 * v2;
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    const similarity = dotProduct / (magnitude1 * magnitude2);
    
    console.log(`📐 Cosine Similarity Calculation:`);
    console.log(`   Vector length: ${vector1.length}`);
    console.log(`   Dot product: ${dotProduct}`);
    console.log(`   Magnitude 1: ${magnitude1}`);
    console.log(`   Magnitude 2: ${magnitude2}`);
    console.log(`   Similarity: ${similarity}`);
    
    return similarity;
  }

  /**
   * Calculate competitive intelligence indicators
   * Hidden Gem: Lower rank but high opportunity score
   * Saturation Level: Based on population density and income concentration
   */
  private calculateCompetitiveIntelligence(
    market: AggregatedMarket,
    rank: number,
    opportunityScore: number
  ): {
    hiddenGem: boolean;
    saturationLevel: 'Low' | 'Medium' | 'High';
  } {
    // Hidden Gem: Ranks 11-30 with opportunity score >= 60
    const hiddenGem = rank > 10 && rank <= 30 && opportunityScore >= 60;

    // Saturation Level: Based on density and income distribution
    const density = market.density || 0;
    const medianIncome = market.medianHouseholdIncome || 0;
    
    let saturationLevel: 'Low' | 'Medium' | 'High';
    
    // High saturation: Very dense areas with high incomes (competitive markets)
    if (density > 2000 && medianIncome > 75000) {
      saturationLevel = 'High';
    }
    // Medium saturation: Moderate density or moderate income
    else if (density > 500 || medianIncome > 60000) {
      saturationLevel = 'Medium';
    }
    // Low saturation: Lower density and income (opportunity markets)
    else {
      saturationLevel = 'Low';
    }

    return {
      hiddenGem,
      saturationLevel
    };
  }
}

