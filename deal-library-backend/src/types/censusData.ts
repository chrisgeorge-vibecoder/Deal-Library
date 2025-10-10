/**
 * TypeScript interfaces for US Census Data integration
 * Supports demographic, geographic, and economic data for zip code analysis
 */

export interface CensusZipCodeData {
  zipCode: string;
  latitude: number;
  longitude: number;
  population: number;
  demographics: CensusDemographics;
  economics: CensusEconomics;
  geography: CensusGeography;
  lastUpdated: string;
}

export interface CensusDemographics {
  ageMedian: number;
  ageDistribution: {
    under18: number;
    age18to24: number;
    age25to44: number;
    age45to64: number;
    age65plus: number;
  };
  ethnicity: {
    white: number;
    black: number;
    hispanic: number;
    asian: number;
    nativeAmerican: number;
    pacificIslander: number;
    other: number;
    twoOrMore: number;
  };
  education: {
    lessThanHighSchool: number;
    highSchoolGraduate: number;
    someCollege: number;
    bachelorDegree: number;
    graduateDegree: number;
  };
  householdSize: {
    average: number;
    median: number;
  };
  lifestyle?: {
    selfEmployed: number;
    married: number;
    dualIncome: number;
    commuteTime: number;
    charitableGivers: number;
    stemDegree: number;
  };
}

export interface CensusEconomics {
  householdIncome: {
    median: number;
    average: number;
    distribution: {
      under25k: number;
      between25k50k: number;
      between50k75k: number;
      between75k100k: number;
      between100k150k: number;
      between150k200k: number;
      over200k: number;
    };
  };
  povertyRate: number;
  unemploymentRate: number;
  employmentBySector: {
    agriculture: number;
    construction: number;
    manufacturing: number;
    retail: number;
    healthcare: number;
    education: number;
    technology: number;
    finance: number;
    government: number;
    other: number;
  };
}

export interface CensusGeography {
  state: string;
  county: string;
  city: string;
  metroArea: string;
  urbanRural: 'urban' | 'suburban' | 'rural';
  commuteTime: {
    average: number;
    median: number;
    distribution: {
      under15min: number;
      between15to30min: number;
      between30to45min: number;
      between45to60min: number;
      over60min: number;
    };
  };
  housing: {
    medianHomeValue: number;
    medianRent: number;
    ownerOccupiedRate: number;
    averageBedrooms: number;
  };
}

export interface CommerceAudienceZipMapping {
  audienceId: string;
  audienceName: string;
  zipCodes: Array<{
    zipCode: string;
    weight: number; // 0-1, represents the strength of this audience in this zip
    reach: number; // estimated reach in this zip code
  }>;
  totalReach: number;
  topZipCodes: Array<{
    zipCode: string;
    weight: number;
    reach: number;
    demographics: CensusZipCodeData;
  }>;
}

export interface CensusQueryFilters {
  zipCodes?: string[];
  states?: string[];
  counties?: string[];
  metroAreas?: string[];
  incomeRange?: {
    min: number;
    max: number;
  };
  ageRange?: {
    min: number;
    max: number;
  };
  educationLevel?: 'high_school' | 'some_college' | 'bachelor' | 'graduate';
  ethnicity?: string[];
  urbanRural?: ('urban' | 'suburban' | 'rural')[];
  commuteTime?: {
    max: number;
  };
}

export interface CensusInsights {
  summary: {
    totalPopulation: number;
    averageIncome: number;
    dominantDemographics: {
      age: string;
      ethnicity: string;
      education: string;
      urbanRural: string;
    };
  };
  zipCodes: CensusZipCodeData[];
  analytics: {
    incomeDistribution: Array<{ range: string; percentage: number; population: number }>;
    ageDistribution: Array<{ range: string; percentage: number; population: number }>;
    educationDistribution: Array<{ level: string; percentage: number; population: number }>;
    commutePatterns: Array<{ time: string; percentage: number; population: number }>;
    topMetroAreas: Array<{ name: string; zipCodes: number; population: number }>;
  };
  opportunities: Array<{
    type: 'high_income' | 'young_professionals' | 'family_communities' | 'tech_hubs' | 'emerging_markets';
    description: string;
    zipCodes: string[];
    potential: 'high' | 'medium' | 'low';
  }>;
}

export interface CensusDataImportResult {
  success: boolean;
  recordsProcessed: number;
  recordsImported: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  summary: {
    totalZipCodes: number;
    states: string[];
    averagePopulation: number;
    averageIncome: number;
  };
}
