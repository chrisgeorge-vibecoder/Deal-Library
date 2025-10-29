/**
 * Audience Taxonomy Frontend Types
 */

// Base segment type matching CSV structure (for Browse mode)
export interface AudienceSegment {
  segmentType: string;
  sovrnSegmentId: string;
  sovrnParentSegmentId: string;
  segmentName: string;
  segmentDescription: string;
  tierNumber: number;
  tier1?: string;
  tier2?: string;
  tier3?: string;
  tier4?: string;
  tier5?: string;
  tier6?: string;
  fullPath: string;
  cpm: number;
  mediaPercentCost: number;
  activelyGenerated: boolean;
}

// Legacy type alias for backward compatibility
export type AudienceTaxonomySegment = AudienceSegment;

// Filter options for browsing and searching
export interface AudienceSearchFilters {
  segmentType?: 'Commerce Audience' | 'Interest';
  maxCPM?: number;
  maxMediaPercentCost?: number;
  activelyGeneratedOnly?: boolean;
  tier1?: string;
  tier2?: string;
}

// Enriched types for AI search (optional, secondary feature)
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
  segment: AudienceSegment;
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
