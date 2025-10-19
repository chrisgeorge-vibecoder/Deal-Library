export interface PersonaInsights {
  segmentId: string;
  personaName: string;
  emoji: string;
  coreInsight: string;
  creativeHooks: string[];
  mediaTargeting: string[];
  audienceMotivation: string;
  actionableStrategy: {
    creativeHook: string;
    mediaTargeting: string;
  };
}

export interface Persona {
  id: string;
  name: string;
  emoji: string;
  category: string;
  dealCount: number;
  segmentId: string;
  coreInsight: string;
  creativeHooks: string[];
  mediaTargeting: string[];
  audienceMotivation: string;
  actionableStrategy: {
    creativeHook: string;
    mediaTargeting: string;
  };
}

export interface Deal {
  id: string;
  dealName: string;
  dealId: string;
  description: string;
  targeting: string;
  environment: string;
  mediaType: string;
  flightDate: string;
  bidGuidance: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  personaInsights?: PersonaInsights;
}

export interface DealFilters {
  search: string;
  targeting: string;
  environment: string;
  mediaType: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface SearchResult {
  deals: Deal[];
  total: number;
  page: number;
  limit: number;
}

export interface AudienceInsights {
  id: string;
  audienceName: string;
  demographics: {
    ageRange: string;
    incomeRange: string;
    genderSplit: string;
    topLocations: string[];
  };
  behavior: {
    deviceUsage: {
      mobile: number;
      desktop: number;
      tablet: number;
    };
    peakHours: string[];
    purchaseFrequency: string;
    avgOrderValue: string;
  };
  insights: {
    keyCharacteristics: string[];
    interests: string[];
    painPoints: string[];
  };
  sampleData: boolean;
}

export interface MarketSizing {
  id: string;
  marketName: string;
  totalMarketSize: {
    value: string;
    growth: string;
    period: string;
  };
  addressableMarket: {
    value: string;
    percentage: number;
  };
  demographics: {
    totalPopulation: string;
    targetSegment: string;
    penetration: string;
  };
  trends: {
    growthRate: string;
    keyDrivers: string[];
    seasonality: string;
  };
  opportunities: {
    untappedSegments: string[];
    emergingPlatforms: string[];
    geographicExpansion: string[];
  };
  sampleData: boolean;
}

export interface GeoCard {
  id: string;
  audienceName: string;
  topMarkets: {
    region: string;
    percentage: string;
  }[];
  insights: string[];
  totalAddressable: string;
  sampleData: boolean;
  demographics?: {
    population: string;
    medianAge: string;
    medianIncome: string;
    urbanRuralSplit: string;
  };
  marketCharacteristics?: {
    economicProfile: string;
    techAdoption: string;
    mediaConsumption: string;
    purchaseBehavior: string;
  };
  advertisingOpportunities?: {
    optimalChannels: string[];
    peakEngagement: string[];
    creativeConsiderations: string[];
    budgetRecommendations: string;
  };
  competitiveLandscape?: {
    marketSaturation: string;
    keyCompetitors: string[];
    whiteSpaceOpportunities: string[];
  };
  sources?: {
    title: string;
    url: string;
    note?: string;
  }[];
}

export interface MarketingSWOT {
  id: string;
  companyName: string;
  swot: {
    strengths: Array<{ title: string; description: string }>;
    weaknesses: Array<{ title: string; description: string }>;
    opportunities: Array<{ title: string; description: string }>;
    threats: Array<{ title: string; description: string }>;
  };
  summary: string;
  recommendedActions: string[];
  sampleData?: boolean;
}

export interface CompanyProfile {
  id: string;
  stockSymbol: string;
  companyInfo: {
    name: string;
    sector: string;
    marketCap: string;
    recentPrice: string;
  };
  recentPerformance: {
    earningsSummary: string;
    keyMetrics: Array<{ metric: string; value: string; trend: 'positive' | 'negative' | 'neutral' }>;
    executiveSummary: string;
  };
  competitiveAnalysis: {
    mainCompetitors: Array<{ name: string; strength: string }>;
    competitivePosition: string;
    marketShare: string;
  };
  growthOpportunities: Array<{ opportunity: string; potential: string }>;
  investmentOutlook: {
    strengths: string[];
    risks: string[];
    recommendation: string;
  };
  sampleData?: boolean;
}
