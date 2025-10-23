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

export interface MarketingNews {
  id: string;
  headline: string;
  source: string;
  synopsis: string;
  url: string;
  publishDate: string;
  relevanceScore: number;
  companies?: string[];
  keyInsights?: string[];
}

export interface CompetitiveIntelligence {
  id: string;
  competitorOrIndustry: string;
  competitiveAnalysis: {
    mainCompetitors: Array<{ name: string; positioning: string; keyStrengths: string[] }>;
    marketPositioning: string;
    differentiationOpportunities: string[];
  };
  messagingAnalysis: {
    commonThemes: string[];
    messagingGaps: string[];
    toneAndVoice: string;
  };
  strategicRecommendations: {
    positioning: string[];
    messaging: string[];
    channels: string[];
  };
  sources?: Array<{ title: string; url: string; note?: string }>;
  sampleData?: boolean;
}

export interface ContentStrategy {
  id: string;
  industryOrTopic: string;
  trendingTopics: Array<{ topic: string; relevance: string; trend: string }>;
  contentRecommendations: {
    formats: Array<{ format: string; rationale: string; priority: string }>;
    platforms: string[];
    frequency: string;
  };
  seoOpportunities: {
    keywords: string[];
    contentGaps: string[];
    competitorAnalysis: string;
  };
  editorialCalendar: Array<{
    timeframe: string;
    themes: string[];
    contentIdeas: string[];
  }>;
  sources?: Array<{ title: string; url: string; note?: string }>;
  sampleData?: boolean;
}

export interface BrandStrategy {
  id: string;
  brandOrCategory: string;
  positioning: {
    currentPerception: string;
    targetPosition: string;
    differentiators: string[];
  };
  messagingFramework: {
    coreMessage: string;
    supportingMessages: string[];
    proofPoints: string[];
  };
  brandVoice: {
    toneAttributes: string[];
    voiceGuidelines: string;
    dosDonts: { dos: string[]; donts: string[] };
  };
  strategicRecommendations: string[];
  sources?: Array<{ title: string; url: string; note?: string }>;
  sampleData?: boolean;
}

export interface SavedCard {
  type: 'deal' | 'persona' | 'audience-insights' | 'market-sizing' | 'geo-cards' | 'research' | 'marketing-swot' | 'company-profile' | 'marketing-news' | 'competitive-intelligence' | 'content-strategy' | 'brand-strategy' | 'strategy-brief';
  data: Deal | Persona | AudienceInsights | MarketSizing | GeoCard | MarketingSWOT | CompanyProfile | MarketingNews | CompetitiveIntelligence | ContentStrategy | BrandStrategy | any;
  savedAt: string;
}
