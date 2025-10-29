/**
 * Audience Search Service
 * AI-powered natural language search for Sovrn Audience Taxonomy
 */

import { GeminiService } from './geminiService';
import { AudienceTaxonomyService } from './audienceTaxonomyService';
import { CensusDataService } from './censusDataService';
import { CommerceAudienceService } from './commerceAudienceService';
import { SupabaseService } from './supabaseService';
import {
  AudienceTaxonomySegment,
  AudienceSearchFilters,
  EnrichedAudienceCard,
  CategorizedSearchResults,
  CommerceInsight,
  GeographicInsight
} from '../types/audienceTaxonomy';

interface SegmentScore {
  segment: AudienceTaxonomySegment;
  score: number;
  relevanceReason: string;
}

export class AudienceSearchService {
  private geminiService: GeminiService;
  private taxonomyService: AudienceTaxonomyService;
  private censusService: CensusDataService;
  private commerceService: CommerceAudienceService;
  private useSupabase: boolean;

  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
    this.taxonomyService = AudienceTaxonomyService.getInstance();
    this.censusService = CensusDataService.getInstance();
    this.commerceService = new CommerceAudienceService();
    this.useSupabase = process.env.USE_SUPABASE === 'true';
    
    // Load commerce data
    this.commerceService.loadCommerceData().catch(err => {
      console.error('Error loading commerce data:', err);
    });
  }

  /**
   * Main search method: Natural language query to categorized audience results
   */
  async searchAudiences(
    query: string,
    filters?: AudienceSearchFilters
  ): Promise<CategorizedSearchResults> {
    console.log(`🔍 Searching audiences for: "${query}"`);

    // Check cache first
    if (this.useSupabase) {
      const cached = await this.getCachedSearch(query, filters);
      if (cached) {
        console.log('✅ Returning cached search results');
        return cached;
      }
    }

    // Step 1: Use Gemini to extract intent and keywords
    const searchIntent = await this.extractSearchIntent(query);
    console.log(`🎯 Search intent:`, searchIntent);

    // Step 2: Get all taxonomy segments
    const allSegments = await this.taxonomyService.getTaxonomyData();

    // Step 3: Apply filters
    let filteredSegments = allSegments;
    if (filters) {
      if (filters.segmentType) {
        filteredSegments = filteredSegments.filter(s => s.segmentType === filters.segmentType);
      }
      if (filters.maxCPM !== undefined) {
        filteredSegments = filteredSegments.filter(s => s.cpm <= filters.maxCPM!);
      }
      if (filters.activelyGenerated !== undefined) {
        filteredSegments = filteredSegments.filter(s => s.activelyGenerated === filters.activelyGenerated);
      }
      if (filters.minScale !== undefined) {
        filteredSegments = filteredSegments.filter(s =>
          (s.scale7DayUS && s.scale7DayUS >= filters.minScale!) ||
          (s.scale1DayIP && s.scale1DayIP >= filters.minScale!)
        );
      }
    }

    // Step 4: Score and rank segments using Gemini
    const scoredSegments = await this.scoreSegments(filteredSegments, searchIntent);

    // Step 5: Categorize into Best-Fit, High-Value, and Related
    const bestFit = scoredSegments.slice(0, 8); // Top 8
    const highValue = scoredSegments.slice(8, 13); // Next 5
    const related = scoredSegments.slice(13, 18); // Next 5

    // Step 6: Enrich each segment with commerce & geographic insights
    const enrichedBestFit = await Promise.all(
      bestFit.map(s => this.enrichSegment(s.segment, s.relevanceReason))
    );
    const enrichedHighValue = await Promise.all(
      highValue.map(s => this.enrichSegment(s.segment, s.relevanceReason))
    );
    const enrichedRelated = await Promise.all(
      related.map(s => this.enrichSegment(s.segment, s.relevanceReason))
    );

    const results: CategorizedSearchResults = {
      bestFit: enrichedBestFit,
      highValue: enrichedHighValue,
      related: enrichedRelated,
      query,
      totalFound: scoredSegments.length
    };

    // Cache results
    if (this.useSupabase) {
      await this.cacheSearchResults(query, filters, results);
    }

    return results;
  }

  /**
   * Extract search intent and keywords using Gemini
   */
  private async extractSearchIntent(query: string): Promise<any> {
    const prompt = `You are analyzing a marketing campaign query to identify target audiences.

Query: "${query}"

Extract the following information in JSON format:
{
  "productCategory": "Main product or service category",
  "targetDemographic": "Target demographic characteristics (age, income, lifestyle)",
  "campaignGoal": "Primary campaign objective",
  "keywords": ["relevant", "keywords", "for", "matching"],
  "intendedAudiences": ["Specific audience types that would be relevant"]
}

Be specific and actionable. Focus on characteristics that can match to audience segments.`;

    try {
      const result = await this.geminiService['model'].generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback
      return {
        productCategory: query,
        keywords: query.split(' '),
        intendedAudiences: []
      };
    } catch (error) {
      console.error('Error extracting search intent:', error);
      return {
        productCategory: query,
        keywords: query.split(' '),
        intendedAudiences: []
      };
    }
  }

  /**
   * Score and rank segments based on relevance
   */
  private async scoreSegments(
    segments: AudienceTaxonomySegment[],
    searchIntent: any
  ): Promise<SegmentScore[]> {
    console.log(`📊 Scoring ${segments.length} segments...`);

    // Build segment summaries for Gemini
    const segmentSummaries = segments.map(s => ({
      id: s.sovrnSegmentId,
      name: s.segmentName,
      path: s.fullPath,
      description: s.segmentDescription,
      type: s.segmentType,
      cpm: s.cpm
    }));

    // Batch process in groups of 50
    const BATCH_SIZE = 50;
    const allScores: SegmentScore[] = [];

    for (let i = 0; i < segmentSummaries.length; i += BATCH_SIZE) {
      const batch = segmentSummaries.slice(i, i + BATCH_SIZE);
      
      const prompt = `You are a marketing strategist matching audience segments to campaign goals.

Campaign Query: "${searchIntent.productCategory}"
Target Demographic: ${searchIntent.targetDemographic || 'Not specified'}
Campaign Goal: ${searchIntent.campaignGoal || 'Not specified'}

Available Audience Segments (${batch.length}):
${batch.map((s, idx) => `${idx + 1}. ${s.name} - ${s.description} (Path: ${s.path})`).join('\n')}

Task: Score each segment from 0-100 based on relevance to the campaign. Return ONLY a JSON array:
[
  {"id": "segment_id", "score": 95, "reason": "Why this segment is highly relevant"},
  {"id": "segment_id", "score": 70, "reason": "Why this is moderately relevant"},
  ...
]

Focus on: audience behavior, purchase intent, demographic fit, and campaign objectives.`;

      try {
        const result = await this.geminiService['model'].generateContent(prompt);
        const responseText = result.response.text();
        
        // Extract JSON array
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const scores = JSON.parse(jsonMatch[0]);
          
          for (const scoreData of scores) {
            const segment = segments.find(s => s.sovrnSegmentId === scoreData.id);
            if (segment) {
              allScores.push({
                segment,
                score: scoreData.score,
                relevanceReason: scoreData.reason
              });
            }
          }
        }
      } catch (error) {
        console.error('Error scoring batch:', error);
        // Fallback: simple keyword matching
        for (const summary of batch) {
          const segment = segments.find(s => s.sovrnSegmentId === summary.id)!;
          const score = this.calculateFallbackScore(segment, searchIntent);
          allScores.push({
            segment,
            score,
            relevanceReason: 'Matched based on keyword relevance'
          });
        }
      }
    }

    // Sort by score descending
    return allScores.sort((a, b) => b.score - a.score);
  }

  /**
   * Fallback scoring using keyword matching
   */
  private calculateFallbackScore(
    segment: AudienceTaxonomySegment,
    searchIntent: any
  ): number {
    let score = 0;
    const searchText = [
      searchIntent.productCategory,
      ...(searchIntent.keywords || [])
    ].join(' ').toLowerCase();
    
    const segmentText = [
      segment.segmentName,
      segment.segmentDescription,
      segment.fullPath
    ].join(' ').toLowerCase();
    
    // Count keyword matches
    for (const keyword of searchIntent.keywords || []) {
      if (segmentText.includes(keyword.toLowerCase())) {
        score += 20;
      }
    }
    
    // Boost commerce audiences
    if (segment.segmentType === 'Commerce Audience') {
      score += 10;
    }
    
    // Boost actively generated
    if (segment.activelyGenerated) {
      score += 5;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Enrich segment with commerce insights and geographic data
   */
  private async enrichSegment(
    segment: AudienceTaxonomySegment,
    strategicHook: string
  ): Promise<EnrichedAudienceCard> {
    // Get commerce insights
    const commerceInsights = await this.getCommerceInsights(segment);
    
    // Get geographic insights
    const geographicInsights = await this.getGeographicInsights(segment);
    
    // Determine data sources
    const dataSources: string[] = ['Sovrn Audience Taxonomy'];
    if (commerceInsights.length > 0) {
      dataSources.push('Sovrn Commerce Data');
    }
    if (geographicInsights.length > 0) {
      dataSources.push('US Census Bureau');
    }
    
    return {
      segment,
      strategicHook,
      commerceInsights,
      geographicInsights,
      dataSources
    };
  }

  /**
   * Get commerce cross-purchase insights for segment
   */
  private async getCommerceInsights(
    segment: AudienceTaxonomySegment
  ): Promise<CommerceInsight[]> {
    // Map taxonomy segment to commerce audience name
    const commerceAudienceName = this.mapToCommerceAudience(segment);
    
    if (!commerceAudienceName || segment.segmentType !== 'Commerce Audience') {
      return [];
    }
    
    try {
      // Search for ZIP codes associated with this audience
      const zipData = this.commerceService.searchZipCodesByAudience(commerceAudienceName, 50);
      
      if (!zipData || zipData.length === 0) {
        return [];
      }
      
      // Create a generic commerce insight
      const insights: CommerceInsight[] = [{
        primaryCategory: segment.segmentName,
        crossPurchases: ['Related commerce segments'],
        insight: `This audience shows strong purchase intent in the ${segment.tier2 || segment.tier1} category`,
        overlapPercentage: undefined
      }];
      
      return insights;
    } catch (error) {
      console.error('Error getting commerce insights:', error);
      return [];
    }
  }

  /**
   * Get geographic insights (top CBSAs where audience over-indexes)
   */
  private async getGeographicInsights(
    segment: AudienceTaxonomySegment
  ): Promise<GeographicInsight[]> {
    const commerceAudienceName = this.mapToCommerceAudience(segment);
    
    if (!commerceAudienceName || segment.segmentType !== 'Commerce Audience') {
      return [];
    }
    
    try {
      // Get top ZIPs for this audience
      const topZips = this.commerceService.searchZipCodesByAudience(commerceAudienceName, 100);
      
      if (!topZips || topZips.length === 0) {
        return [];
      }
      
      // Aggregate by CBSA
      const cbsaMap = new Map<string, { zips: string[], totalWeight: number, population: number }>();
      
      for (const zip of topZips) {
        const zipDataArray = await this.censusService.getZipCodeData([zip.zipCode]);
        if (zipDataArray && zipDataArray.length > 0) {
          const zipData = zipDataArray[0];
          if (zipData && zipData.geography && zipData.geography.metroArea) {
            const metroArea = zipData.geography.metroArea;
            const existing = cbsaMap.get(metroArea) || { zips: [], totalWeight: 0, population: 0 };
            existing.zips.push(zip.zipCode);
            existing.totalWeight += zip.weight;
            existing.population += zipData.population || 0;
            cbsaMap.set(metroArea, existing);
          }
        }
      }
      
      // Sort by total weight and get top 3
      const sortedCBSAs = Array.from(cbsaMap.entries())
        .sort((a, b) => b[1].totalWeight - a[1].totalWeight)
        .slice(0, 3);
      
      const results: GeographicInsight[] = [];
      
      for (const [cbsaName, data] of sortedCBSAs) {
        // Extract state from CBSA name (usually "City, ST")
        const stateMatch = cbsaName.match(/,\s*([A-Z]{2})/);
        const state: string = (stateMatch && stateMatch[1]) ? stateMatch[1] : 'US';
        
        // Calculate over-index (simplified)
        const avgWeight = topZips.reduce((sum: number, z) => sum + z.weight, 0) / topZips.length;
        const overIndex = ((data.totalWeight / data.zips.length) / avgWeight) * 100;
        
        results.push({
          cbsaName,
          state,
          overIndex: Math.round(overIndex),
          population: data.population
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error getting geographic insights:', error);
      return [];
    }
  }

  /**
   * Map taxonomy segment to commerce audience name
   */
  private mapToCommerceAudience(segment: AudienceTaxonomySegment): string | null {
    // For Commerce Audience segments, try to find matching audience in commerce data
    if (segment.segmentType === 'Commerce Audience') {
      // The segment name might directly match or need transformation
      // e.g., "Luxury Vehicle Shoppers" -> "Automotive > Luxury Vehicle Shoppers"
      return segment.segmentName;
    }
    return null;
  }

  /**
   * Get cached search results
   */
  private async getCachedSearch(
    query: string,
    filters?: AudienceSearchFilters
  ): Promise<CategorizedSearchResults | null> {
    try {
      const supabase = SupabaseService.getClient();
      
      const { data, error } = await supabase
        .from('audience_search_cache')
        .select('*')
        .eq('query', query)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error || !data || data.length === 0) {
        return null;
      }
      
      const cached = data[0];
      
      // Check if filters match
      const cachedFilters = cached.filters || {};
      const requestFilters = filters || {};
      
      if (JSON.stringify(cachedFilters) === JSON.stringify(requestFilters)) {
        return cached.results as CategorizedSearchResults;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached search:', error);
      return null;
    }
  }

  /**
   * Cache search results
   */
  private async cacheSearchResults(
    query: string,
    filters: AudienceSearchFilters | undefined,
    results: CategorizedSearchResults
  ): Promise<void> {
    try {
      const supabase = SupabaseService.getClient();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour TTL
      
      await supabase
        .from('audience_search_cache')
        .insert({
          query,
          filters: filters || {},
          results,
          expires_at: expiresAt.toISOString()
        });
      
      console.log('✅ Cached search results');
    } catch (error) {
      console.error('Error caching search results:', error);
    }
  }

  /**
   * Get detailed segment by ID
   */
  async getSegmentDetails(segmentId: string): Promise<EnrichedAudienceCard | null> {
    const segment = await this.taxonomyService.getSegmentById(segmentId);
    
    if (!segment) {
      return null;
    }
    
    return this.enrichSegment(
      segment,
      'This audience segment matches your targeting criteria.'
    );
  }
}

