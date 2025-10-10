// Zip Code Based Geo Insights Types

export interface ZipCodeData {
  zipCode: string;
  latitude: number;
  longitude: number;
  population: number;
  demographics: {
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
  };
  economics: {
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
  };
  geography: {
    state: string;
    county: string;
    city: string;
    metroArea: string;
    urbanRural: string;
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
  };
  lastUpdated: string;
}

export interface CensusData {
  zipCode: string;
  medianIncome: number;
  medianAge: number;
  educationLevel: {
    highSchoolOrLess: number;
    someCollege: number;
    bachelorsOrHigher: number;
  };
  ethnicity: {
    white: number;
    black: number;
    hispanic: number;
    asian: number;
    other: number;
  };
  householdSize: {
    average: number;
    distribution: {
      '1': number;
      '2': number;
      '3': number;
      '4': number;
      '5+': number;
    };
  };
}

export interface DMAMapping {
  zipCode: string;
  dmaName: string;
  dmaId: number;
  rank: number;
}

export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  zipCodes: string[];
  totalAudience: number;
  penetrationRate: number;
  averageIncome: number;
  topDMA: string;
  growthRate?: number;
  penetration?: string;
  demographics?: string;
  geographicDistribution?: string;
}

export interface ZipCodeInsights {
  zipCode: string;
  zipCodeData: ZipCodeData;
  censusData: CensusData;
  dmaMapping: DMAMapping;
  audienceSegments: AudienceSegment[];
  marketPenetration: number;
  opportunityScore: number;
  competitiveIndex: number;
  growthPotential: number;
}

export interface MarketAnalysis {
  dmaName: string;
  dmaId: number;
  dma: {
    dmaName: string;
    dmaCode: string;
    totalPopulation: number;
    avgMedianIncome: number;
    audienceSaturation: number;
    growthPotential: number;
  };
  totalZipCodes: number;
  totalPopulation: number;
  totalHouseholds: number;
  averageIncome: number;
  topAudienceSegments: {
    segment: AudienceSegment;
    penetration: number;
    opportunity: number;
  }[];
  marketSaturation: number;
  growthOpportunity: number;
  competitiveLandscape: {
    highSaturation: number;
    mediumSaturation: number;
    lowSaturation: number;
  };
}

// Search types for enhanced Geo Insights
export type SearchType = 'location' | 'audience-segment' | 'audience';

export interface SearchQuery {
  query: string;
  type: SearchType;
  timestamp: Date;
}

export interface SummaryOverview {
  totalPopulation: number;
  averageIncome: number;
  totalZipCodes: number;
  dominantDemographics: {
    age: string;
    ethnicity: string;
    education: string;
    urbanRural: string;
  };
  keyMetrics: {
    medianAge: number;
    unemploymentRate: number;
    homeOwnershipRate: number;
    averageCommuteTime: number;
  };
  topOpportunities: string[];
  marketInsights: string[];
}

export interface GeographicInsightsData {
  searchQuery: SearchQuery;
  summaryOverview: SummaryOverview;
  zipCodeInsights: ZipCodeInsights[];
  marketAnalysis: MarketAnalysis[];
  audienceSegments: AudienceSegment[];
  overview: {
    totalZipCodesAnalyzed: number;
    totalDMAsCovered: number;
    totalAudiencesTracked: number;
    avgAudiencePenetration: number;
  };
  summary: {
    totalZipCodes: number;
    totalMarkets: number;
    averagePenetration: number;
    topOpportunities: string[];
    highGrowthMarkets: string[];
  };
}

export interface ZipCodeUploadResult {
  success: boolean;
  processed: number;
  errors: string[];
  newSegments: AudienceSegment[];
  updatedSegments: AudienceSegment[];
}
