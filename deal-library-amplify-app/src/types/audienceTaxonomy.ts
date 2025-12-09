/**
 * Audience Taxonomy Types
 * Type definitions for Sovrn Audience Taxonomy data structures
 */

export interface AudienceTaxonomySegment {
  segmentType: string;
  sovrnSegmentId: string;
  sovrnParentSegmentId: string;
  segmentName: string;
  segmentDescription: string;
  tierNumber: number;
  tier1: string;
  tier2: string;
  tier3: string;
  tier4: string;
  tier5: string;
  tier6: string;
  fullPath: string;
  cpm: number;
  mediaPercentCost: number;
  activelyGenerated: boolean;
  scale7DayGlobal?: number;
  scale7DayUS?: number;
  scaleHEMUS?: number;
  scale1DayIP?: number;
}

export interface AudienceSearchFilters {
  segmentType?: 'Commerce Audience' | 'Interest';
  maxCPM?: number;
  activelyGenerated?: boolean;
  minScale?: number;
}

export interface CommerceInsight {
  primaryCategory: string;
  crossPurchases: string[];
  insight: string;
  overlapPercentage?: number;
}

export interface GeographicInsight {
  cbsaName: string;
  state: string;
  overIndex: number;
  population?: number;
}

export interface EnrichedAudienceCard {
  segment: AudienceTaxonomySegment;
  strategicHook: string;
  commerceInsights: CommerceInsight[];
  geographicInsights: GeographicInsight[];
  dataSources: string[];
}

export interface CategorizedSearchResults {
  bestFit: EnrichedAudienceCard[];
  highValue: EnrichedAudienceCard[];
  related: EnrichedAudienceCard[];
  query: string;
  totalFound: number;
}

export interface AudienceSearchCacheEntry {
  id?: string;
  query: string;
  filters: AudienceSearchFilters;
  results: CategorizedSearchResults;
  createdAt: Date;
  expiresAt: Date;
}

