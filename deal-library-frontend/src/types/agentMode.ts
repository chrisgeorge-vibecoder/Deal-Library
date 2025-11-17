/**
 * Agent Mode Types - Frontend
 * Types for the comprehensive recommendation generation feature
 */

/**
 * Progress update from backend SSE stream
 */
export interface ProgressUpdate {
  type: 'progress' | 'complete' | 'error';
  step: number;
  totalSteps: number;
  stepName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  message?: string;
  timestamp: string;
  percentComplete: number;
}

/**
 * Analysis results from backend
 */
export interface AnalysisResults {
  parsedBrief: {
    advertiserName: string;
    targetAudiences: string[];
    campaignObjectives: string[];
    budgetRange?: string;
    budgetValue?: number;
    budgetNotes?: string;
    geographicFocus?: string;
    keyProducts?: string[];
    timeline?: string;
    additionalContext?: string;
  };
  audiences: {
    segments: any[];
    count: number;
  };
  deals: {
    recommendations: any[];
    count: number;
  };
  personas: {
    profiles: any[];
    count: number;
  };
  audienceInsights: {
    reports: any[];
    count: number;
  };
  marketSizing: {
    totalAddressableMarket: number;
    reachEstimate: number;
    demographicBreakdown: any;
  };
  geographic: {
    topMarkets: any[];
    coverageMap: any;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  companyProfile: {
    industry: string;
    competitiveLandscape: string;
    marketPosition: string;
  };
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
  errors: {
    step: string;
    error: string;
  }[];
}

/**
 * Comprehensive report response
 */
export interface ComprehensiveReport {
  advertiserName: string;
  generatedDate: string;
  markdownReport: string;
  results: AnalysisResults;
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
 * Agent Mode state
 */
export interface AgentModeState {
  isEnabled: boolean;
  isGenerating: boolean;
  progress: ProgressUpdate | null;
  report: ComprehensiveReport | null;
  error: string | null;
}


