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
