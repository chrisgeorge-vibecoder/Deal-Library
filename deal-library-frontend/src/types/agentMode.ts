/**
 * Agent Mode Types
 * Types for the comprehensive recommendation generation feature
 */

import { Deal } from './deal';

/**
 * Raw advertiser brief (free-text input from user)
 */
export interface AdvertiserBrief {
  rawBrief: string; // The complete text pasted by the user
  timestamp: Date;
}

/**
 * Parsed brief with extracted structured information
 */
export interface ParsedBrief {
  advertiserName: string;
  targetAudiences: string[]; // Array of audience descriptions
  campaignObjectives: string[]; // Array of objectives
  budgetRange?: string; // Optional budget if mentioned
  budgetValue?: number; // Parsed numeric budget (midpoint or minimum)
  budgetNotes?: string; // Additional context like "minimum" or "up to"
  geographicFocus?: string; // Optional geographic targeting
  keyProducts?: string[]; // Products/services mentioned
  timeline?: string; // Campaign timeline if mentioned
  additionalContext?: string; // Any other relevant info
  industry?: string; // Optional industry classification
}

/**
 * Progress update for streaming to frontend
 */
export interface ProgressUpdate {
  type: 'progress' | 'complete' | 'error';
  step: number; // Current step (1-10)
  totalSteps: number; // Total steps (10)
  stepName: string; // Human-readable step name
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  message?: string; // Additional details
  timestamp: Date;
  percentComplete: number; // 0-100
}

/**
 * Results from individual analysis components
 */
export interface AnalysisResults {
  // Parsed brief
  parsedBrief: ParsedBrief;
  
  // Audience data
  audiences: {
    segments: any[]; // Audience taxonomy segments
    count: number;
  };
  
  // Deal recommendations
  deals: {
    recommendations: Deal[];
    count: number;
  };
  
  // Personas
  personas: {
    profiles: any[];
    count: number;
  };
  
  // Audience insights reports
  audienceInsights: {
    reports: any[];
    count: number;
  };
  
  // Market sizing data (enhanced with Strategy Card format)
  marketSizing: {
    totalAddressableMarket: number;
    reachEstimate: number;
    demographicBreakdown: any;
    aiGenerated?: boolean;
    aiSummary?: string;
    totalMarketSize?: string;
    growthRate?: string;
    addressableMarket?: string;
    addressableValue?: string;
    growthTrends?: {
      growthRate?: string;
      seasonality?: string;
      keyOpportunities?: string[];
      forecastPeriod?: string;
      emergingTrends?: string[];
    };
    marketInsights?: {
      keyDrivers?: string[];
      barriers?: string[];
      opportunities?: string[];
      competitiveDensity?: string;
      marketMaturity?: string;
    };
    advertisingImplications?: {
      recommendedChannels?: string[];
      optimalSpend?: string;
      targetingStrategy?: string;
      seasonalityRecommendations?: string;
    };
  };
  
  // Geographic analysis
  geographic: {
    topMarkets: any[];
    coverageMap: any;
  };
  
  // SWOT analysis (enhanced to support Strategy Card format with titles/descriptions)
  swot: {
    strengths: Array<string | { title: string; description: string }>;
    weaknesses: Array<string | { title: string; description: string }>;
    opportunities: Array<string | { title: string; description: string }>;
    threats: Array<string | { title: string; description: string }>;
    summary?: string;
    recommendedActions?: string[];
  };
  
  // Company/Advertiser profile
  companyProfile: {
    industry: string;
    competitiveLandscape: string;
    marketPosition: string;
  };
  
  // Strategic insights (NEW)
  strategy?: {
    competitors?: string[];
    differentiators?: string[];
    marketTiers?: {
      tier1: string[];
      tier2: string[];
      rationale: string;
    };
    dayparting?: {
      optimal: string[];
      rationale: string;
    };
  };
  
  // Any errors encountered
  errors: {
    step: string;
    error: string;
  }[];
}

/**
 * Complete comprehensive report
 */
export interface ComprehensiveReport {
  // Metadata
  advertiserName: string;
  generatedDate: Date;
  
  // Analysis results
  results: AnalysisResults;
  
  // Formatted markdown report
  markdownReport: string;
  
  // Summary statistics
  summary: {
    totalAudiences: number;
    totalDeals: number;
    totalPersonas: number;
    estimatedReach: number;
    recommendedBudget: string;
    recommendedBudgetValue?: number;
    recommendedBudgetNotes?: string;
  };
}

/**
 * Analysis step configuration
 */
export interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  order: number;
  weight: number; // Contribution to overall progress (0-1)
}


