// Re-export census data types
export type {
  GeographicLevel,
  MarketInsightsMetric,
  TopMarket,
  MarketAttribute,
  StrategicInsight,
  SimilarMarket,
  MarketProfile,
  CensusZipCodeData,
  CensusDemographics,
  CensusEconomics,
  CensusGeography,
  CommerceAudienceZipMapping,
  CensusQueryFilters,
  CensusInsights,
  CensusDataImportResult
} from './censusData';

export interface PersonaInsights {
  segmentId: string;
  personaName: string;
  emoji: string;
  category: string;
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
  search?: string;
  targeting?: string;
  environment?: string;
  mediaType?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  page?: number;
  limit?: number;
}

export interface SearchResult {
  deals: Deal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomDealRequest {
  companyName: string;
  contactEmail: string;
  campaignObjectives: string;
  targetAudience: string;
  budget?: string;
  timeline?: string;
  additionalNotes?: string;
}

export interface GoogleSheetsRow {
  [key: string]: string | number;
}

// Persona type
export interface Persona {
  id: string;
  name: string;
  emoji: string;
  segmentId: string;
  category: string;
  coreInsight: string;
  creativeHooks: string[];
  mediaTargeting: string[];
  audienceMotivation: string;
  actionableStrategy: {
    creativeHook: string;
    mediaTargeting: string;
  };
  dealCount?: number;
}

// Re-export AudienceInsights from its primary definition
export type { AudienceInsights } from '@/components/AudienceInsightsCard';

// Market Sizing type
export interface MarketSizing {
  market?: string;
  marketName?: string;
  totalAddressableMarket?: string;
  serviceableAddressableMarket?: string;
  serviceableObtainableMarket?: string;
  growthRate?: string;
  keySegments?: Array<{
    name: string;
    size: string;
    percentage: number;
  }>;
  competitiveLandscape?: string;
  opportunities?: string[];
  challenges?: string[];
  [key: string]: any;
}

// Geographic Card type
export interface GeoCard {
  location?: string;
  locationName?: string;
  population?: number;
  demographics?: {
    medianAge?: number;
    medianIncome?: number;
    educationLevel?: string;
  };
  marketPotential?: string;
  keyInsights?: string[];
  recommendations?: string[];
  [key: string]: any;
}

// Marketing SWOT type
export interface MarketingSWOT {
  id?: string;
  company?: string;
  companyName?: string;
  strengths?: string[];
  weaknesses?: string[];
  opportunities?: string[];
  threats?: string[];
  recommendations?: string[];
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  summary?: string;
  recommendedActions?: string[];
  sampleData?: boolean;
}

// Company Profile type
export interface CompanyProfile {
  id?: string;
  name?: string;
  stockSymbol?: string;
  industry?: string;
  description?: string;
  founded?: string;
  headquarters?: string;
  employees?: string;
  revenue?: string;
  keyProducts?: string[];
  targetMarket?: string;
  competitiveAdvantages?: string[];
  challenges?: string[];
  marketingStrategy?: string;
  companyInfo?: any;
  recentPerformance?: any;
  competitiveAnalysis?: any;
  growthOpportunities?: any;
  investmentOutlook?: any;
  sampleData?: boolean;
  [key: string]: any;
}

// Marketing News type
export interface MarketingNews {
  id?: string;
  headline: string;
  summary?: string;
  synopsis?: string;
  source: string;
  date?: string;
  publishDate?: string;
  relevance?: string;
  relevanceScore?: number;
  implications?: string[];
  actionItems?: string[];
  category?: string;
  url?: string;
  companies?: string[];
  keyInsights?: string[];
}

// Competitive Intelligence type
export interface CompetitiveIntelligence {
  company?: string;
  competitors?: Array<{
    name: string;
    marketShare?: string;
    strengths?: string[];
    weaknesses?: string[];
    strategy?: string;
  }>;
  industryTrends?: string[];
  competitiveAdvantages?: string[];
  recommendations?: string[];
  [key: string]: any;
}

// Content Strategy type
export interface ContentStrategy {
  brand?: string;
  targetAudience?: string;
  contentPillars?: Array<{
    theme: string;
    description?: string;
    contentTypes?: string[];
    frequency?: string;
  }>;
  channels?: string[];
  tone?: string;
  keyMessages?: string[];
  kpis?: string[];
  industryOrTopic?: string;
  trendingTopics?: string[];
  contentRecommendations?: any;
  [key: string]: any;
}

// Brand Strategy type
export interface BrandStrategy {
  brandName?: string;
  positioning?: any;
  targetAudience?: string;
  valueProposition?: string;
  brandPersonality?: string[];
  keyMessages?: string[];
  visualIdentity?: any;
  differentiators?: string[];
  competitiveAdvantage?: string;
  [key: string]: any;
}

// Campaign Brief type
export interface CampaignBrief {
  id?: string;
  campaignName?: string;
  client?: string;
  objective?: string;
  targetAudience?: string;
  budget?: string;
  timeline?: string;
  channels?: string[];
  keyMessages?: string[];
  callToAction?: string;
  successMetrics?: string[];
  constraints?: string[];
  creativeDirection?: string;
  [key: string]: any;
}

// Saved Card type - union type for all saveable cards
export type SavedCardType = 
  | 'deal' 
  | 'persona' 
  | 'audience-insights' 
  | 'market-sizing' 
  | 'geo-cards' 
  | 'marketing-swot' 
  | 'company-profile' 
  | 'marketing-news' 
  | 'competitive-intelligence' 
  | 'content-strategy' 
  | 'brand-strategy' 
  | 'campaign-brief' 
  | 'audience-taxonomy' 
  | 'strategic-snapshot' 
  | 'research'
  | 'market-profile'
  | string;

export interface SavedCard {
  type: SavedCardType;
  data: Deal | Persona | MarketSizing | GeoCard | MarketingSWOT | CompanyProfile | MarketingNews | CompetitiveIntelligence | ContentStrategy | BrandStrategy | CampaignBrief | any;
  savedAt: string;
}
