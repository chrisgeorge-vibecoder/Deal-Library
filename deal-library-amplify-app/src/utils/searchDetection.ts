/**
 * Smart search detection utility for Geo Insights
 * Determines if a query is location-based or audience segment-based
 */

import { SearchType } from '@/types/zipInsights';

// Common audience segment keywords
const AUDIENCE_KEYWORDS = [
  'luxury', 'pet', 'tech', 'health', 'fitness', 'beauty', 'fashion',
  'food', 'travel', 'home', 'auto', 'finance', 'education', 'entertainment',
  'gaming', 'sports', 'outdoor', 'family', 'young', 'senior', 'professional',
  'affluent', 'budget', 'premium', 'organic', 'sustainable', 'eco',
  'urban', 'suburban', 'rural', 'millennial', 'gen-z', 'baby-boomer',
  'high-income', 'middle-income', 'low-income', 'college-educated',
  'entrepreneur', 'remote-worker', 'commuter', 'retiree', 'parent',
  'single', 'married', 'divorced', 'widowed', 'student', 'graduate'
];

// Location indicators
const LOCATION_KEYWORDS = [
  'zip', 'city', 'county', 'state', 'dma', 'metro', 'region', 'area',
  'neighborhood', 'district', 'borough', 'township', 'village', 'hamlet'
];

/**
 * Detect search type based on query content
 */
export function detectSearchType(query: string): SearchType {
  const queryLower = query.toLowerCase().trim();
  
  // Check for ZIP code pattern (5 digits)
  if (/^\d{5}$/.test(queryLower)) {
    return 'location';
  }
  
  // Check for location keywords
  const hasLocationKeywords = LOCATION_KEYWORDS.some(keyword => 
    queryLower.includes(keyword)
  );
  
  // Check for audience segment keywords
  const hasAudienceKeywords = AUDIENCE_KEYWORDS.some(keyword => 
    queryLower.includes(keyword)
  );
  
  // Check for common city/state patterns
  const hasLocationPattern = /^(san|new|los|las|fort|mount|saint|st\.?|north|south|east|west)\s+\w+/i.test(queryLower) ||
                            /^[a-z\s]+,\s*[a-z]{2}$/i.test(queryLower); // City, State pattern
  
  // Determine type based on indicators
  if (hasLocationKeywords || hasLocationPattern) {
    return 'location';
  }
  
  if (hasAudienceKeywords) {
    return 'audience-segment';
  }
  
  // Default to location for ambiguous queries
  return 'location';
}

/**
 * Extract search intent from query
 */
export function extractSearchIntent(query: string): {
  type: SearchType;
  keywords: string[];
  confidence: number;
} {
  const type = detectSearchType(query);
  const queryLower = query.toLowerCase().trim();
  
  // Extract relevant keywords based on type
  let keywords: string[] = [];
  let confidence = 0.5; // Default confidence
  
  if (type === 'location') {
    // Extract location-related terms
    keywords = LOCATION_KEYWORDS.filter(keyword => 
      queryLower.includes(keyword)
    );
    
    // Increase confidence for ZIP codes and clear location patterns
    if (/^\d{5}$/.test(queryLower)) {
      confidence = 0.95;
    } else if (hasLocationPattern(queryLower)) {
      confidence = 0.85;
    }
  } else {
    // Extract audience segment terms
    keywords = AUDIENCE_KEYWORDS.filter(keyword => 
      queryLower.includes(keyword)
    );
    
    // Increase confidence for multiple audience keywords
    if (keywords.length > 1) {
      confidence = 0.8;
    } else if (keywords.length === 1) {
      confidence = 0.7;
    }
  }
  
  return { type, keywords, confidence };
}

/**
 * Check if query has location pattern
 */
function hasLocationPattern(query: string): boolean {
  return /^(san|new|los|las|fort|mount|saint|st\.?|north|south|east|west)\s+\w+/i.test(query) ||
         /^[a-z\s]+,\s*[a-z]{2}$/i.test(query); // City, State pattern
}

/**
 * Generate search suggestions based on type
 */
export function generateSearchSuggestions(query: string, type: SearchType): string[] {
  const queryLower = query.toLowerCase().trim();
  
  if (type === 'location') {
    return [
      'Try: "90210" (Beverly Hills, CA)',
      'Try: "San Francisco, CA"',
      'Try: "Los Angeles County"',
      'Try: "New York DMA"'
    ];
  } else {
    return [
      'Try: "Luxury Pet Owners"',
      'Try: "Tech Enthusiasts"',
      'Try: "High-Income Families"',
      'Try: "College-Educated Millennials"'
    ];
  }
}


