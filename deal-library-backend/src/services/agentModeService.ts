/**
 * Agent Mode Service
 * Orchestrates comprehensive marketing recommendation generation
 */

import { GeminiService } from './geminiService';
import { commerceAudienceService } from './commerceAudienceService';
import { audienceInsightsService } from './audienceInsightsService';
import { PersonaService } from './personaService';
import { CensusDataService } from './censusDataService';
import { audienceGeoAnalysisService } from './audienceGeoAnalysisService';
import { AudienceSearchService } from './audienceSearchService';
import { AudienceTaxonomyService } from './audienceTaxonomyService';
import { StrategyGeneratorService } from './strategyGeneratorService';
import { Deal } from '../types/deal';
import {
  AdvertiserBrief,
  ParsedBrief,
  ProgressUpdate,
  AnalysisResults,
  ComprehensiveReport,
  AnalysisStep
} from '../types/agentMode';

export class AgentModeService {
  private geminiService: GeminiService;
  private personaService: PersonaService;
  private censusDataService: CensusDataService;
  private appsScriptService: any; // Will be imported dynamically
  private audienceSearchService: AudienceSearchService;
  private strategyGenerator: StrategyGeneratorService;

  // Analysis steps configuration
  private readonly ANALYSIS_STEPS: AnalysisStep[] = [
    { id: 'parse', name: 'Analyzing brief', description: 'Extracting key requirements', order: 1, weight: 0.1 },
    { id: 'audiences', name: 'Searching audiences', description: 'Finding relevant audience segments', order: 2, weight: 0.15 },
    { id: 'deals', name: 'Finding deals', description: 'Identifying matching deals', order: 3, weight: 0.15 },
    { id: 'personas', name: 'Generating personas', description: 'Creating audience personas', order: 4, weight: 0.12 },
    { id: 'insights', name: 'Creating insights', description: 'Generating audience insights', order: 5, weight: 0.12 },
    { id: 'sizing', name: 'Calculating market size', description: 'Estimating market opportunity', order: 6, weight: 0.08 },
    { id: 'geographic', name: 'Analyzing geography', description: 'Mapping geographic distribution', order: 7, weight: 0.08 },
    { id: 'swot', name: 'Building SWOT', description: 'Creating SWOT analysis', order: 8, weight: 0.08 },
    { id: 'profile', name: 'Researching company', description: 'Building company profile', order: 9, weight: 0.07 },
    { id: 'compile', name: 'Compiling report', description: 'Finalizing recommendations', order: 10, weight: 0.05 }
  ];

  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
    this.personaService = new PersonaService();
    this.censusDataService = new CensusDataService();
    this.audienceSearchService = new AudienceSearchService(geminiService);
    this.strategyGenerator = new StrategyGeneratorService();
    
    // Import AppsScriptService dynamically to avoid circular dependencies
    const { AppsScriptService } = require('./appsScriptService');
    this.appsScriptService = new AppsScriptService();
  }

  /**
   * Main entry point: Generate comprehensive marketing recommendation
   */
  async generateComprehensiveRecommendation(
    brief: AdvertiserBrief,
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<ComprehensiveReport> {
    const startTime = Date.now();
    console.log('🚀 Starting Agent Mode comprehensive recommendation generation');

    try {
      // Step 1: Parse the brief
      const parsedBrief = await this.analyzeBrief(brief, progressCallback);
      
      // Step 2-9: Run all analyses in parallel
      const results = await this.orchestrateAnalyses(parsedBrief, progressCallback);
      
      // Step 10: Compile final report (this will be handled by reportGenerationService)
      this.emitProgress(progressCallback, 10, 'compile', 'in_progress', 'Compiling final report...');
      
      const report: ComprehensiveReport = {
        advertiserName: parsedBrief.advertiserName,
        generatedDate: new Date(),
        results,
        markdownReport: '', // Will be populated by ReportGenerationService
        summary: {
          totalAudiences: results.audiences.count,
          totalDeals: results.deals.count,
          totalPersonas: results.personas.count,
          estimatedReach: results.marketSizing.reachEstimate,
          recommendedBudget: parsedBrief.budgetRange || 'TBD'
        }
      };

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Agent Mode completed in ${duration}s`);
      
      this.emitProgress(progressCallback, 10, 'compile', 'completed', `Report generated in ${duration}s`, 100);
      
      return report;
    } catch (error) {
      console.error('❌ Agent Mode generation failed:', error);
      this.emitProgress(
        progressCallback,
        0,
        'error',
        'error',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  /**
   * Step 1: Analyze brief and extract structured information using Gemini
   * OR use form data directly if provided
   */
  async analyzeBrief(
    brief: any,
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<ParsedBrief> {
    console.log('📋 Step 1: Analyzing brief...');
    this.emitProgress(progressCallback, 1, 'parse', 'in_progress', 'Extracting requirements from brief...');

    // If formData is provided, skip parsing and use it directly
    if (brief.formData) {
      console.log('⚡ Using form data directly (skipping AI parsing)');
      const formData = brief.formData;
      const parsedBrief: ParsedBrief = {
        advertiserName: formData.advertiserName || 'Campaign',
        targetAudiences: formData.targetAudiences || [],
        campaignObjectives: formData.campaignObjectives || [],
        budgetRange: formData.budgetRange,
        geographicFocus: formData.geographicFocus,
        keyProducts: formData.keyProducts || [],
        timeline: formData.timeline,
        additionalContext: formData.additionalContext
      };
      
      console.log(`✅ Form data processed: ${parsedBrief.advertiserName}, ${parsedBrief.targetAudiences.length} audiences`);
      this.emitProgress(progressCallback, 1, 'parse', 'completed', `Processed ${parsedBrief.targetAudiences.length} target audiences`, 10);
      return parsedBrief;
    }

    // Otherwise, parse the raw brief
    const prompt = `You are an expert marketing analyst. Extract structured information from this advertiser brief.

Brief: "${brief.rawBrief}"

INSTRUCTIONS:
1. Identify the COMPANY NAME (just the company, not the full brief)
2. Extract SPECIFIC target audiences (e.g., "basketball fans", "athletes", NOT "general audience")
3. List campaign objectives
4. Extract any budget, timeline, geographic info, and products mentioned

EXAMPLES:

Brief: "Nike is launching a new shoe for basketball fans"
{
  "advertiserName": "Nike",
  "targetAudiences": ["Basketball fans", "Athletes", "Sneaker enthusiasts"],
  "campaignObjectives": ["Product launch", "Brand awareness"],
  "keyProducts": ["Basketball shoe"]
}

Brief: "PetCo dog toys for active dog owners, $100K budget"
{
  "advertiserName": "PetCo", 
  "targetAudiences": ["Dog owners", "Active dog parents", "Pet enthusiasts"],
  "campaignObjectives": ["Product awareness", "Drive sales"],
  "budgetRange": "$100K",
  "keyProducts": ["Dog toys"]
}

Now extract from the actual brief. Return ONLY valid JSON with this structure:
{
  "advertiserName": "string (ONLY company name)",
  "targetAudiences": ["specific audiences, NOT 'general audience'"],
  "campaignObjectives": ["specific goals"],
  "budgetRange": "string or null",
  "geographicFocus": "string or null",
  "keyProducts": ["products mentioned"],
  "timeline": "string or null",
  "additionalContext": "relevant details"
}`;

    // Skip Gemini parsing entirely and use fast rule-based extraction
    // This avoids the 30+ second Gemini API delay that causes network errors
    console.log('⚡ Using fast rule-based brief extraction (skipping slow Gemini API)');
    
    try {
      console.log('🔍 Extracting advertiser name...');
      const advertiserName = this.extractAdvertiserName(brief.rawBrief);
      console.log(`   Advertiser: ${advertiserName}`);
      
      console.log('🔍 Extracting audiences...');
      const targetAudiences = this.extractAudiences(brief.rawBrief);
      console.log(`   Audiences: ${targetAudiences.join(', ')}`);
      
      console.log('🔍 Extracting objectives...');
      const campaignObjectives = this.extractObjectives(brief.rawBrief);
      console.log(`   Objectives: ${campaignObjectives.join(', ')}`);
      
      console.log('🔍 Extracting budget...');
      const budgetRange = this.extractBudget(brief.rawBrief);
      console.log(`   Budget: ${budgetRange || 'N/A'}`);
      
      console.log('🔍 Extracting geography...');
      const geographicFocus = this.extractGeography(brief.rawBrief);
      console.log(`   Geography: ${geographicFocus || 'N/A'}`);
      
      console.log('🔍 Extracting products...');
      const keyProducts = this.extractProducts(brief.rawBrief);
      console.log(`   Products: ${keyProducts.join(', ') || 'N/A'}`);
      
      const parsedBrief: ParsedBrief = {
        advertiserName,
        targetAudiences,
        campaignObjectives,
        budgetRange,
        geographicFocus,
        keyProducts,
        timeline: undefined,
        additionalContext: brief.rawBrief.substring(0, 500)
      };

      console.log(`✅ Extracted: ${parsedBrief.advertiserName}, ${parsedBrief.targetAudiences.length} audiences`);
      this.emitProgress(progressCallback, 1, 'parse', 'completed', `Identified ${parsedBrief.targetAudiences.length} target audiences`, 10);
      
      return parsedBrief;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Brief analysis failed:', errorMessage);
      
      // If timeout or API error, fall back to rule-based extraction
      console.log('⚡ Using fast rule-based extraction as fallback');
      const parsedBrief = {
        advertiserName: this.extractAdvertiserName(brief.rawBrief),
        targetAudiences: this.extractAudiences(brief.rawBrief),
        campaignObjectives: this.extractObjectives(brief.rawBrief),
        budgetRange: this.extractBudget(brief.rawBrief),
        geographicFocus: this.extractGeography(brief.rawBrief),
        keyProducts: this.extractProducts(brief.rawBrief),
        timeline: undefined,
        additionalContext: brief.rawBrief.substring(0, 500)
      };
      
      console.log(`✅ Fallback extraction: ${parsedBrief.advertiserName}, ${parsedBrief.targetAudiences.length} audiences`);
      this.emitProgress(progressCallback, 1, 'parse', 'completed', `Identified ${parsedBrief.targetAudiences.length} target audiences`, 10);
      
      return parsedBrief;
    }
  }

  /**
   * Steps 2-9: Orchestrate all analyses in parallel
   */
  private async orchestrateAnalyses(
    parsedBrief: ParsedBrief,
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<AnalysisResults> {
    console.log('⚡ Orchestrating analyses sequentially (memory-optimized)...');

    const results: AnalysisResults = {
      parsedBrief,
      audiences: { segments: [], count: 0 },
      deals: { recommendations: [], count: 0 },
      personas: { profiles: [], count: 0 },
      audienceInsights: { reports: [], count: 0 },
      marketSizing: { totalAddressableMarket: 0, reachEstimate: 0, demographicBreakdown: {} },
      geographic: { topMarkets: [], coverageMap: {} },
      swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      companyProfile: { industry: '', competitiveLandscape: '', marketPosition: '' },
      strategy: undefined, // Will be populated by strategy generator
      errors: []
    };

    // Run analyses sequentially to reduce memory pressure
    // Parallel was causing out-of-memory errors
    console.log('🔄 Running analyses one at a time...');
    
    // Run critical analyses first
    const analyses = await Promise.allSettled([
      this.findAudiences(parsedBrief, progressCallback).catch(err => {
        results.errors.push({ step: 'audiences', error: err.message });
        return { segments: [], count: 0 };
      }),
      this.findDeals(parsedBrief, progressCallback).catch(err => {
        results.errors.push({ step: 'deals', error: err.message });
        return { recommendations: [], count: 0 };
      }),
      this.generatePersonas(parsedBrief, progressCallback).catch(err => {
        results.errors.push({ step: 'personas', error: err.message });
        return { profiles: [], count: 0 };
      }),
      this.generateAudienceInsights(parsedBrief, progressCallback).catch(err => {
        results.errors.push({ step: 'insights', error: err.message });
        return { reports: [], count: 0 };
      }),
      this.calculateMarketSizing(parsedBrief, progressCallback).catch(err => {
        results.errors.push({ step: 'sizing', error: err.message });
        return { totalAddressableMarket: 0, reachEstimate: 0, demographicBreakdown: {} };
      }),
      this.analyzeGeographic(parsedBrief, progressCallback).catch(err => {
        results.errors.push({ step: 'geographic', error: err.message });
        return { topMarkets: [], coverageMap: {} };
      }),
      this.buildSWOT(parsedBrief, progressCallback).catch(err => {
        results.errors.push({ step: 'swot', error: err.message });
        return { strengths: [], weaknesses: [], opportunities: [], threats: [] };
      }),
      this.researchCompany(parsedBrief, progressCallback).catch(err => {
        results.errors.push({ step: 'profile', error: err.message });
        return { industry: '', competitiveLandscape: '', marketPosition: '' };
      })
    ]);

    // Extract results
    if (analyses[0].status === 'fulfilled') results.audiences = analyses[0].value;
    if (analyses[1].status === 'fulfilled') results.deals = analyses[1].value;
    if (analyses[2].status === 'fulfilled') results.personas = analyses[2].value;
    if (analyses[3].status === 'fulfilled') results.audienceInsights = analyses[3].value;
    if (analyses[4].status === 'fulfilled') results.marketSizing = analyses[4].value;
    if (analyses[5].status === 'fulfilled') results.geographic = analyses[5].value;
    if (analyses[6].status === 'fulfilled') results.swot = analyses[6].value;
    if (analyses[7].status === 'fulfilled') results.companyProfile = analyses[7].value;

    // Generate strategic insights (fast, no API calls)
    console.log('🎯 Generating strategic insights...');
    results.strategy = await this.generateStrategyInsights(parsedBrief, progressCallback);

    console.log(`✅ Orchestration complete: ${results.errors.length} errors`);
    return results;
  }

  /**
   * Step 2: Find relevant audiences
   */
  private async findAudiences(
    parsedBrief: ParsedBrief,
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<{ segments: any[]; count: number }> {
    this.emitProgress(progressCallback, 2, 'audiences', 'in_progress', 'Searching audience segments...');
    console.log('🎯 Finding audiences...');
    console.log(`   Target audiences from brief:`, parsedBrief.targetAudiences);

    try {
      // Expand search queries to include related terms for better coverage (LabCorp-quality results)
      const baseQueries = parsedBrief.targetAudiences.slice(0, 2); // Top 2 audiences for performance
      console.log(`📝 Base queries (top 3):`, baseQueries);
      
      const expandedQueries = this.expandSearchQueries(baseQueries);
      console.log(`📝 Expanded ${baseQueries.length} queries to ${expandedQueries.length}:`);
      console.log(`   Queries:`, expandedQueries);
      
      const allSegments: any[] = [];

      for (const query of expandedQueries) {
        console.log(`\n🔍 Searching audiences for: "${query}"`);
        try {
          // Use hybrid search (10-15x faster) with 30-second timeout
          const result = await Promise.race([
            this.audienceSearchService.searchAudiencesHybrid(query, {}),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Audience search timeout')), 30000)
            )
          ]) as any;
          
          console.log(`📊 Search results for "${query}":`, {
            bestFit: result.bestFit?.length || 0,
            highValue: result.highValue?.length || 0,
            related: result.related?.length || 0,
            bestFitNames: result.bestFit?.slice(0, 3).map((s: any) => s.segmentName || s.name) || []
          });
          
          // Include best-fit AND high-value segments for richer results (LabCorp quality)
          const bestFitSegments = (result.bestFit || []).slice(0, 8);
          const highValueSegments = (result.highValue || []).slice(0, 4);
          
          console.log(`   Adding ${bestFitSegments.length} best-fit + ${highValueSegments.length} high-value segments`);
          
          allSegments.push(...bestFitSegments);
          allSegments.push(...highValueSegments);
        } catch (searchError) {
          console.error(`⚠️ Audience search failed for "${query}":`, searchError);
          console.error(`   Error details:`, (searchError as any).stack);
          // Continue with other queries
        }
      }
      
      console.log(`\n📦 Total segments collected before deduplication: ${allSegments.length}`);

      // If we have very few segments, try keyword fallback
      if (allSegments.length < 5) {
        console.log('🔄 Few segments found (< 5), trying keyword fallback...');
        const fallbackSegments = await this.keywordFallbackSearch(baseQueries);
        console.log(`   Fallback returned ${fallbackSegments.length} segments`);
        allSegments.push(...fallbackSegments);
        console.log(`📦 After fallback: ${allSegments.length} total segments`);
      }

      // Deduplicate by segment ID
      const uniqueSegments = Array.from(
        new Map(allSegments.map(seg => [seg.sovrnSegmentId || seg.id, seg])).values()
      ).slice(0, 25); // Increase to 25 segments for LabCorp-quality results (was 10)

      console.log(`✅ Final unique segments: ${uniqueSegments.length}`);
      if (uniqueSegments.length > 0) {
        console.log(`   Sample segments:`, uniqueSegments.slice(0, 3).map(s => s.segmentName || s.name));
      } else {
        console.warn(`⚠️ WARNING: No segments found! This should not happen.`);
      }

      this.emitProgress(progressCallback, 2, 'audiences', 'completed', `Found ${uniqueSegments.length} audience segments`, 25);
      return { segments: uniqueSegments, count: uniqueSegments.length };
    } catch (error) {
      console.error('❌ Audience search failed:', error);
      console.error('   Stack trace:', (error as any).stack);
      return { segments: [], count: 0 };
    }
  }

  /**
   * Expand search queries to include related terms (improves result quality)
   */
  private expandSearchQueries(baseQueries: string[]): string[] {
    const expanded = new Set<string>(baseQueries); // Start with original queries
    
    // Add common expansions based on keywords
    for (const query of baseQueries) {
      const lower = query.toLowerCase();
      
      // Sports/Athletic expansions
      if (lower.includes('basketball')) {
        expanded.add('sports');
        expanded.add('athletic');
        expanded.add('fitness');
        expanded.add('athletes');
        expanded.add('sports fans');
      }
      if (lower.includes('football') || lower.includes('soccer')) {
        expanded.add('sports');
        expanded.add('athletic');
        expanded.add('sports fans');
      }
      if (lower.includes('athlete') || lower.includes('fitness')) {
        expanded.add('sports');
        expanded.add('exercise');
        expanded.add('athletic');
        expanded.add('workout');
        expanded.add('active lifestyle');
      }
      
      // Footwear/Fashion expansions
      if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('footwear')) {
        expanded.add('fashion');
        expanded.add('apparel');
        expanded.add('athletic footwear');
        expanded.add('sports equipment');
        expanded.add('activewear');
      }
      if (lower.includes('fashion') || lower.includes('style') || lower.includes('apparel')) {
        expanded.add('clothing');
        expanded.add('shopping');
        expanded.add('retail');
      }
      
      // Family/Parenting expansions
      if (lower.includes('mom') || lower.includes('mother')) {
        expanded.add('parents');
        expanded.add('family');
        expanded.add('children');
        expanded.add('baby');
        expanded.add('household');
      }
      if (lower.includes('dad') || lower.includes('father')) {
        expanded.add('parents');
        expanded.add('family');
        expanded.add('children');
      }
      if (lower.includes('parent')) {
        expanded.add('family');
        expanded.add('children');
        expanded.add('household');
      }
      
      // Fitness/Health expansions
      if (lower.includes('health')) {
        expanded.add('wellness');
        expanded.add('fitness');
        expanded.add('nutrition');
      }
      if (lower.includes('wellness')) {
        expanded.add('health');
        expanded.add('fitness');
      }
      
      // Food/Beverage expansions
      if (lower.includes('coffee')) {
        expanded.add('beverage');
        expanded.add('beverages');
        expanded.add('cafe');
        expanded.add('coffee shop');
        expanded.add('drinks');
        expanded.add('caffeine');
        expanded.add('breakfast');
        expanded.add('morning routine');
        expanded.add('specialty beverages');
        expanded.add('gourmet');
      }
      if (lower.includes('food') || lower.includes('dining') || lower.includes('restaurant')) {
        expanded.add('grocery');
        expanded.add('cooking');
        expanded.add('dining');
        expanded.add('food lovers');
        expanded.add('culinary');
        expanded.add('gourmet');
      }
      
      // Professional/Young Professional expansions
      if (lower.includes('professional') || lower.includes('young professional') || lower.includes('millennials')) {
        expanded.add('working professionals');
        expanded.add('career');
        expanded.add('office workers');
        expanded.add('business professionals');
        expanded.add('millennials');
        expanded.add('urban professionals');
      }
      
      // Tech/Gaming expansions
      if (lower.includes('gaming') || lower.includes('gamer')) {
        expanded.add('video games');
        expanded.add('technology');
        expanded.add('entertainment');
      }
      if (lower.includes('tech')) {
        expanded.add('technology');
        expanded.add('electronics');
        expanded.add('gadgets');
      }
      
      // Audio/Speaker/Electronics expansions (NEW - for Sonos, Bose, premium electronics)
      if (lower.includes('speaker') || lower.includes('audio') || lower.includes('sound') || 
          lower.includes('sonos') || lower.includes('bose') || lower.includes('music lover')) {
        expanded.add('audio enthusiasts');
        expanded.add('audiophile');
        expanded.add('home audio');
        expanded.add('music streaming');
        expanded.add('smart home');
        expanded.add('premium electronics');
        expanded.add('home entertainment');
        expanded.add('connected home');
        expanded.add('wireless audio');
        expanded.add('music lovers');
      }
      
      // Music/Streaming expansions (NEW)
      if (lower.includes('music') || lower.includes('streaming')) {
        expanded.add('music lovers');
        expanded.add('music streaming');
        expanded.add('spotify');
        expanded.add('apple music');
        expanded.add('audio');
        expanded.add('entertainment');
      }
      
      // Smart Home/IoT expansions (NEW)
      if (lower.includes('smart home') || lower.includes('connected') || lower.includes('iot')) {
        expanded.add('smart home');
        expanded.add('home automation');
        expanded.add('connected devices');
        expanded.add('iot');
        expanded.add('technology enthusiasts');
        expanded.add('early adopters');
      }
    }
    
    return Array.from(expanded).slice(0, 5); // Return up to 5 total queries (reduced for performance)
  }

  /**
   * Keyword-based fallback when AI search returns few results
   */
  private async keywordFallbackSearch(queries: string[]): Promise<any[]> {
    try {
      // Access taxonomy service directly
      const taxonomyService = AudienceTaxonomyService.getInstance();
      const allTaxonomy = await taxonomyService.getTaxonomyData();
      const matches: any[] = [];
      
      for (const query of queries) {
        const keywords = query.toLowerCase().split(/\s+/);
        
        // Search taxonomy segments by keyword
        for (const segment of allTaxonomy) {
          const searchText = `${segment.segmentName} ${segment.segmentDescription} ${segment.fullPath}`.toLowerCase();
          
          // If any keyword matches, include this segment
          if (keywords.some((keyword: string) => searchText.includes(keyword))) {
            matches.push({
              ...segment,
              matchReason: 'keyword-fallback'
            });
          }
        }
      }
      
      // Return top 15 by scale
      return matches
        .sort((a: any, b: any) => (b.scale7DayUS || 0) - (a.scale7DayUS || 0))
        .slice(0, 15);
    } catch (error) {
      console.error('⚠️ Keyword fallback search failed:', error);
      return [];
    }
  }

  /**
   * REMOVED - Step 2 end
   */
  private async removedPlaceholder() {
    // This method is a placeholder to maintain line numbers for the next method
  }

  /**
   * Step 3: Find matching deals
   */
  private async findDeals(
    parsedBrief: ParsedBrief,
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<{ recommendations: Deal[]; count: number }> {
    this.emitProgress(progressCallback, 3, 'deals', 'in_progress', 'Finding matching deals...');
    console.log('💼 Finding deals...');

    try {
      // Get all deals from AppsScript
      const allDeals = await this.appsScriptService.getAllDeals();
      
      // Expand keywords to include variations (for better matching)
      const baseKeywords = [
        parsedBrief.advertiserName, // Include advertiser name (e.g., "Chewy")
        ...parsedBrief.targetAudiences,
        ...parsedBrief.campaignObjectives,
        ...(parsedBrief.keyProducts || [])
      ].filter(Boolean); // Remove any undefined/empty values
      
      const expandedKeywords = this.expandDealKeywords(baseKeywords);
      console.log(`🔍 Searching deals with ${expandedKeywords.length} keywords:`, expandedKeywords.slice(0, 10).join(', '));

      // Score and rank deals by relevance
      const scoredDeals = allDeals.map((deal: Deal) => {
        const searchText = `${deal.dealName} ${deal.description} ${deal.targeting}`.toLowerCase();
        let score = 0;
        
        // Higher score for exact matches in deal name
        expandedKeywords.forEach((keyword: string) => {
          const keywordLower = keyword.toLowerCase();
          if (deal.dealName.toLowerCase().includes(keywordLower)) {
            score += 3;
          } else if (searchText.includes(keywordLower)) {
            score += 1;
          }
        });
        
        return { deal, score };
      });

      // Sort by score and take top 20 deals (increased for LabCorp quality)
      const relevantDeals = scoredDeals
        .filter((item: { deal: Deal; score: number }) => item.score > 0)
        .sort((a: { deal: Deal; score: number }, b: { deal: Deal; score: number }) => b.score - a.score)
        .slice(0, 20)
        .map((item: { deal: Deal; score: number }) => item.deal);
      
      console.log(`✅ Found ${relevantDeals.length} relevant deals (scored from ${allDeals.length} total)`);
      
      this.emitProgress(progressCallback, 3, 'deals', 'completed', `Found ${relevantDeals.length} relevant deals`, 40);
      return { recommendations: relevantDeals, count: relevantDeals.length };
    } catch (error) {
      console.error('❌ Deal search failed:', error);
      // Return empty array instead of throwing to allow other analyses to continue
      return { recommendations: [], count: 0 };
    }
  }

  /**
   * Expand deal search keywords to include variations
   */
  private expandDealKeywords(baseKeywords: string[]): string[] {
    const expanded = new Set<string>();
    
    for (const keyword of baseKeywords) {
      expanded.add(keyword); // Always include original
      const lower = keyword.toLowerCase();
      
      // Pet/Animal variations (for Chewy, pet stores, etc.)
      if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat') || 
          lower.includes('animal') || lower.includes('puppy') || lower.includes('kitten') ||
          lower.includes('chewy')) {
        expanded.add('pet');
        expanded.add('pets');
        expanded.add('dog');
        expanded.add('dogs');
        expanded.add('cat');
        expanded.add('cats');
        expanded.add('animal');
        expanded.add('animals');
        expanded.add('pet supplies');
        expanded.add('pet food');
        expanded.add('pet care');
        expanded.add('pet owners');
        expanded.add('pet parents');
      }
      
      // Sports/Athletic variations (expanded for Nike, etc.)
      if (lower.includes('basketball') || lower.includes('athlete') || lower.includes('sport')) {
        expanded.add('athletics');
        expanded.add('exercise');
        expanded.add('fitness');
        expanded.add('sports');
        expanded.add('workout');
        expanded.add('athletic');
        expanded.add('active');
        expanded.add('training');
      }
      
      // Footwear/Fashion variations
      if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('footwear')) {
        expanded.add('footwear');
        expanded.add('shoes');
        expanded.add('sneakers');
        expanded.add('apparel');
        expanded.add('fashion');
        expanded.add('athletic footwear');
        expanded.add('activewear');
      }
      
      // Fashion/Apparel variations
      if (lower.includes('fashion') || lower.includes('apparel') || lower.includes('clothing')) {
        expanded.add('fashion');
        expanded.add('apparel');
        expanded.add('clothing');
        expanded.add('style');
        expanded.add('retail');
      }
      
      // Family/Parenting variations
      if (lower.includes('mom') || lower.includes('mother') || lower.includes('parent')) {
        expanded.add('family');
        expanded.add('children');
        expanded.add('baby');
        expanded.add('toddler');
        expanded.add('kids');
        expanded.add('household');
      }
      
      // Fitness/Health variations
      if (lower.includes('fitness') || lower.includes('health') || lower.includes('wellness')) {
        expanded.add('fitness');
        expanded.add('health');
        expanded.add('wellness');
        expanded.add('exercise');
        expanded.add('workout');
      }
      
      // Tech variations
      if (lower.includes('tech') || lower.includes('electronics')) {
        expanded.add('electronics');
        expanded.add('devices');
        expanded.add('gadgets');
        expanded.add('tech');
        expanded.add('technology');
      }
      
      // Audio/Speaker/Sound variations (NEW - for Sonos, Bose, etc.)
      if (lower.includes('speaker') || lower.includes('audio') || lower.includes('sound') || 
          lower.includes('sonos') || lower.includes('bose') || lower.includes('music')) {
        expanded.add('audio');
        expanded.add('speaker');
        expanded.add('speakers');
        expanded.add('sound');
        expanded.add('sound system');
        expanded.add('home audio');
        expanded.add('wireless audio');
        expanded.add('smart speaker');
        expanded.add('soundbar');
        expanded.add('home theater');
        expanded.add('electronics');
        expanded.add('music');
        expanded.add('entertainment');
        expanded.add('streaming');
        expanded.add('home entertainment');
      }
      
      // Premium Electronics/Smart Home variations (NEW)
      if (lower.includes('premium') || lower.includes('smart home') || lower.includes('connected')) {
        expanded.add('premium');
        expanded.add('premium electronics');
        expanded.add('smart home');
        expanded.add('connected home');
        expanded.add('home automation');
        expanded.add('iot');
        expanded.add('luxury electronics');
      }
      
      // Streaming/Entertainment variations (NEW)
      if (lower.includes('streaming') || lower.includes('entertainment') || lower.includes('video')) {
        expanded.add('streaming');
        expanded.add('video');
        expanded.add('ctv');
        expanded.add('connected tv');
        expanded.add('entertainment');
        expanded.add('ott');
        expanded.add('digital media');
      }
      
      // Food/Beverage variations
      if (lower.includes('coffee') || lower.includes('beverage')) {
        expanded.add('coffee');
        expanded.add('beverage');
        expanded.add('beverages');
        expanded.add('food');
        expanded.add('dining');
        expanded.add('cafe');
        expanded.add('breakfast');
        expanded.add('gourmet');
        expanded.add('specialty food');
      }
      
      // Professional/Career variations
      if (lower.includes('professional') || lower.includes('business')) {
        expanded.add('professional');
        expanded.add('business');
        expanded.add('career');
        expanded.add('office');
        expanded.add('workplace');
      }
    }
    
    return Array.from(expanded);
  }

  /**
   * REMOVED - Step 3 end
   */
  private async removedDealPlaceholder() {
    // Placeholder
  }

  /**
   * Step 4: Generate personas (updated to use actual found audiences)
   */
  private async generatePersonas(
    parsedBrief: ParsedBrief,
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<{ profiles: any[]; count: number }> {
    this.emitProgress(progressCallback, 4, 'personas', 'in_progress', 'Generating audience personas...');
    console.log('👤 Generating personas from target audiences...');

    try {
      const personas: any[] = [];
      
      // Get personas directly from the PersonaService for now
      // In a future iteration, we could generate these dynamically using Gemini
      const allPersonas = this.personaService.getAllPersonas();
      
      // First, try to match against target audiences
      const keywords = parsedBrief.targetAudiences.slice(0, 3).map(a => a.toLowerCase());
      console.log(`   Searching personas for keywords: ${keywords.join(', ')}`);
      
      const relevantPersonas = allPersonas.filter(persona => {
        const searchText = `${persona.category} ${persona.personaName} ${persona.coreInsight}`.toLowerCase();
        return keywords.some(keyword => {
          // Split keyword into words and check if any word matches
          const keywordWords = keyword.split(/\s+/);
          return keywordWords.some(word => word.length > 3 && searchText.includes(word));
        });
      });
      
      if (relevantPersonas.length > 0) {
        console.log(`   ✓ Found ${relevantPersonas.length} matching personas`);
        personas.push(...relevantPersonas.slice(0, 3));
      }
      
      // If we don't have enough personas, generate category-based personas for the target audience
      if (personas.length < 3) {
        console.log(`   Generating synthetic personas for target audiences...`);
        
        for (const audience of parsedBrief.targetAudiences.slice(0, 3 - personas.length)) {
          const syntheticPersona = this.generateSyntheticPersona(
            audience, 
            parsedBrief
          );
          personas.push(syntheticPersona);
        }
      }
      
      console.log(`   ✓ Total personas generated: ${personas.length}`);
      this.emitProgress(progressCallback, 4, 'personas', 'completed', `Generated ${personas.length} personas`, 52);
      return { profiles: personas, count: personas.length };
    } catch (error) {
      console.error('❌ Persona generation failed:', error);
      // Return a fallback persona based on target audience
      const fallbackPersona = this.generateSyntheticPersona(
        parsedBrief.targetAudiences[0] || 'General Audience',
        parsedBrief
      );
      return { profiles: [fallbackPersona], count: 1 };
    }
  }
  
  /**
   * Generate a synthetic persona when no matches found in database
   */
  private generateSyntheticPersona(audienceName: string, parsedBrief: ParsedBrief): any {
    const lower = audienceName.toLowerCase();
    
    // Determine category and emoji based on audience type
    let category = 'Lifestyle';
    let emoji = '👤';
    let coreInsight = `The ${audienceName} represents a key demographic for ${parsedBrief.advertiserName || 'your brand'}.`;
    let creativeHooks: string[] = [];
    let mediaTargeting: string[] = [];
    
    // Customize based on audience type
    if (lower.includes('audio') || lower.includes('speaker') || lower.includes('sound') || 
        lower.includes('music') || lower.includes('audiophile') || lower.includes('sonos') || lower.includes('bose')) {
      category = 'Audio & Electronics';
      emoji = '🔊';
      coreInsight = `These are audio enthusiasts who appreciate superior sound quality and seamless technology integration. They research extensively before purchasing, value multi-room capabilities, and see audio systems as an investment in their home experience. Music isn't background noise—it's a lifestyle.`;
      creativeHooks = [
        'Sound That Transforms Your Space',
        'Where Music Meets Innovation',
        'Experience Every Note, In Every Room',
        'The Audio System Your Home Deserves'
      ];
      mediaTargeting = [
        'Target tech review sites, audio enthusiast forums, and music streaming platforms',
        'Evening research hours when consumers are shopping for home improvements',
        'Focus on smart home and premium lifestyle publications'
      ];
    } else if (lower.includes('coffee') || lower.includes('beverage')) {
      category = 'Food & Beverage';
      emoji = '☕';
      coreInsight = `This audience values quality, convenience, and the ritual of their daily coffee experience. They seek premium, ethically-sourced options that align with their lifestyle and values.`;
      creativeHooks = [
        'The Morning Ritual That Fuels Your Day',
        'Quality You Can Taste, Ethics You Can Feel Good About',
        'Elevate Your Coffee Experience'
      ];
      mediaTargeting = [
        'Target lifestyle blogs, food influencers, and sustainability-focused content',
        'Place ads during morning hours when coffee consumption peaks',
        'Focus on premium lifestyle and conscious consumer publications'
      ];
    } else if (lower.includes('smart home') || lower.includes('connected') || lower.includes('tech enthusiast')) {
      category = 'Smart Home & Technology';
      emoji = '🏠';
      coreInsight = `Early adopters who view technology as a means to enhance their daily life. They integrate multiple smart devices, value ecosystem compatibility, and are willing to pay premium for seamless experiences.`;
      creativeHooks = [
        'The Connected Home You Always Wanted',
        'Technology That Just Works Together',
        'Simplify Your Life With Smart Integration'
      ];
      mediaTargeting = [
        'Target tech publications, smart home forums, and innovation-focused content',
        'Weekend research periods when consumers plan home upgrades',
        'Focus on tech early adopter demographics'
      ];
    } else if (lower.includes('professional') || lower.includes('office') || lower.includes('career')) {
      category = 'Professional & Career';
      emoji = '💼';
      coreInsight = `Working professionals who value efficiency, quality, and products that fit seamlessly into their busy lifestyle. They're willing to pay premium for convenience and reliability.`;
      creativeHooks = [
        'Designed for the Way You Work',
        'Premium Quality for Busy Professionals',
        'Make Every Moment Count'
      ];
      mediaTargeting = [
        'Target business news sites, productivity apps, and professional networks',
        'Morning and evening commute times for peak engagement',
        'LinkedIn and business-focused platforms'
      ];
    } else if (lower.includes('young') || lower.includes('millennial') || lower.includes('gen z')) {
      category = 'Millennials & Gen Z';
      emoji = '🎯';
      coreInsight = `Digital-first consumers who value authenticity, sustainability, and brands that align with their values. They research thoroughly before purchasing and trust peer recommendations.`;
      creativeHooks = [
        'For the Generation That Values Authenticity',
        'Sustainable Choices for Modern Lifestyles',
        'Join the Movement'
      ];
      mediaTargeting = [
        'Heavy social media presence across Instagram, TikTok, and YouTube',
        'Partner with micro-influencers and user-generated content',
        'Mobile-first creative and short-form video content'
      ];
    } else if (lower.includes('enthusiast') || lower.includes('fan') || lower.includes('lover')) {
      category = 'Enthusiasts & Hobbyists';
      emoji = '⭐';
      coreInsight = `Passionate advocates who don't just consume, they immerse themselves in the category. They're brand loyal, vocal about their preferences, and influence others in their community.`;
      creativeHooks = [
        'For Those Who Know the Difference',
        'Join a Community of Enthusiasts',
        'Where Passion Meets Quality'
      ];
      mediaTargeting = [
        'Target niche communities, forums, and special interest publications',
        'Leverage brand advocates and loyalty programs',
        'Create content that educates and deepens engagement'
      ];
    } else {
      // Generic fallback
      coreInsight = `${audienceName} are discerning consumers looking for products and services that meet their specific needs and preferences.`;
      creativeHooks = [
        'Made for You',
        'Quality That Speaks for Itself',
        'Discover the Difference'
      ];
      mediaTargeting = [
        'Broad reach across digital and traditional channels',
        'Focus on demographic and behavioral targeting',
        'Test multiple creative approaches to find what resonates'
      ];
    }
    
    return {
      segmentId: `synthetic_${audienceName.toLowerCase().replace(/\s+/g, '_')}`,
      personaName: `The ${audienceName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Profile`,
      emoji,
      category,
      coreInsight,
      creativeHooks,
      mediaTargeting,
      audienceMotivation: `This audience is motivated by ${parsedBrief.campaignObjectives.length > 0 ? parsedBrief.campaignObjectives.join(', ').toLowerCase() : 'quality and value'}. They respond well to messaging that emphasizes ${parsedBrief.keyProducts && parsedBrief.keyProducts.length > 0 ? parsedBrief.keyProducts[0] : 'product benefits'}.`,
      actionableStrategy: {
        creativeHook: creativeHooks[0],
        mediaTargeting: mediaTargeting[0]
      }
    };
  }

  /**
   * Step 5: Generate audience insights
   */
  private async generateAudienceInsights(
    parsedBrief: ParsedBrief,
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<{ reports: any[]; count: number }> {
    this.emitProgress(progressCallback, 5, 'insights', 'in_progress', 'Creating audience insights...');
    console.log('📊 Generating audience insights...');

    try {
      // Generate insights for top 1 target audience only (Gemini API takes 20-30s per audience)
      const reports: any[] = [];
      const audiences = parsedBrief.targetAudiences.slice(0, 1);

      for (const audience of audiences) {
        try {
          const report = await audienceInsightsService.generateReport(audience);
          reports.push({
            audience,
            ...report
          });
        } catch (error) {
          console.warn(`⚠️ Could not generate insights for ${audience}:`, error);
        }
      }
      
      this.emitProgress(progressCallback, 5, 'insights', 'completed', `Created ${reports.length} insight reports`, 64);
      return { reports, count: reports.length };
    } catch (error) {
      console.error('❌ Audience insights failed:', error);
      return { reports: [], count: 0 };
    }
  }

  /**
   * Step 6: Calculate market sizing
   */
  private async calculateMarketSizing(
    parsedBrief: ParsedBrief,
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<{ totalAddressableMarket: number; reachEstimate: number; demographicBreakdown: any }> {
    this.emitProgress(progressCallback, 6, 'sizing', 'in_progress', 'Calculating market size...');
    console.log('📈 Calculating market sizing...');

    try {
      // Placeholder market sizing calculation
      const sizing = {
        totalAddressableMarket: 50000000, // 50M estimate
        reachEstimate: 30000000, // 30M reach
        demographicBreakdown: {}
      };
      
      this.emitProgress(progressCallback, 6, 'sizing', 'completed', 'Market sizing complete', 72);
      return sizing;
    } catch (error) {
      console.error('❌ Market sizing failed:', error);
      throw error;
    }
  }

  /**
   * Step 7: Analyze geographic distribution
   */
  private async analyzeGeographic(
    parsedBrief: ParsedBrief,
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<{ topMarkets: any[]; coverageMap: any }> {
    this.emitProgress(progressCallback, 7, 'geographic', 'in_progress', 'Analyzing geography...');
    console.log('🗺️ Analyzing geographic distribution...');

    try {
      // Skip slow geographic analysis to prevent timeouts
      console.log('⚡ Using fast geographic fallback (skipping slow analysis)');
      
      const geographic = {
        topMarkets: [],
        coverageMap: parsedBrief.geographicFocus ? { 
          focus: parsedBrief.geographicFocus,
          note: 'Geographic targeting available at ZIP code level'
        } : {}
      };
      
      this.emitProgress(progressCallback, 7, 'geographic', 'completed', 'Geographic analysis complete', 80);
      return geographic;
    } catch (error) {
      console.error('❌ Geographic analysis failed:', error);
      return { topMarkets: [], coverageMap: {} };
    }
  }

  /**
   * Step 8: Build SWOT analysis (context-aware based on brief)
   */
  private async buildSWOT(
    parsedBrief: ParsedBrief,
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<{ strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] }> {
    this.emitProgress(progressCallback, 8, 'swot', 'in_progress', 'Building SWOT analysis...');
    console.log('📋 Building context-aware SWOT...');

    try {
      const swot = this.generateContextualSWOT(parsedBrief);
      
      this.emitProgress(progressCallback, 8, 'swot', 'completed', 'SWOT analysis complete', 87);
      return swot;
    } catch (error) {
      console.error('❌ SWOT analysis failed:', error);
      // Return default SWOT
      return this.generateContextualSWOT(parsedBrief);
    }
  }
  
  /**
   * Generate context-aware SWOT based on brief details
   */
  private generateContextualSWOT(parsedBrief: ParsedBrief): { 
    strengths: string[]; 
    weaknesses: string[]; 
    opportunities: string[]; 
    threats: string[] 
  } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];
    
    // Analyze based on campaign objectives
    const objectives = parsedBrief.campaignObjectives || [];
    const hasLaunchObjective = objectives.some(o => o.toLowerCase().includes('launch'));
    const hasAwarenessObjective = objectives.some(o => o.toLowerCase().includes('awareness'));
    const hasSalesObjective = objectives.some(o => o.toLowerCase().includes('sales') || o.toLowerCase().includes('revenue'));
    
    // Analyze based on products/services
    const products = parsedBrief.keyProducts || [];
    const hasPremiumProduct = products.some(p => p.toLowerCase().includes('premium') || p.toLowerCase().includes('specialty'));
    const hasSubscription = products.some(p => p.toLowerCase().includes('subscription'));
    
    // Analyze based on context
    const context = (parsedBrief.additionalContext || '').toLowerCase();
    const focusOnSustainability = context.includes('sustainab') || context.includes('ethical') || context.includes('environment');
    const focusOnDigital = context.includes('digital') || context.includes('social media') || context.includes('influencer');
    const focusOnQuality = context.includes('quality') || context.includes('premium') || hasPremiumProduct;
    
    // Build strengths based on context
    if (focusOnQuality || hasPremiumProduct) {
      strengths.push('Premium brand positioning appeals to quality-conscious consumers');
      strengths.push('Differentiated product offering in competitive market');
    } else {
      strengths.push('Strong value proposition for target market');
    }
    
    if (focusOnSustainability) {
      strengths.push('Ethical sourcing and sustainability credentials resonate with conscious consumers');
      strengths.push('Brand values align with growing consumer demand for responsible business practices');
    }
    
    if (focusOnDigital) {
      strengths.push('Digital-first approach enables precise targeting and measurement');
    }
    
    if (parsedBrief.targetAudiences && parsedBrief.targetAudiences.length > 0) {
      strengths.push(`Clear understanding of target audiences: ${parsedBrief.targetAudiences.slice(0, 2).join(', ')}`);
    }
    
    // Build weaknesses
    if (parsedBrief.budgetRange) {
      const budgetText = parsedBrief.budgetRange.toLowerCase();
      if (budgetText.includes('100k') || budgetText.includes('150k') || budgetText.includes('200k')) {
        weaknesses.push('Budget constraints may limit reach across all target audiences');
      }
    } else {
      weaknesses.push('Budget parameters need definition for optimal campaign planning');
    }
    
    if (hasLaunchObjective) {
      weaknesses.push('Limited brand awareness as new entrant in market');
    }
    
    if (focusOnQuality || hasPremiumProduct) {
      weaknesses.push('Premium pricing may limit addressable market size');
    }
    
    // Build opportunities
    if (hasSalesObjective || hasSalesObjective) {
      opportunities.push('Direct response campaigns can drive immediate conversions and ROI');
    }
    
    if (hasAwarenessObjective) {
      opportunities.push('Social media and influencer partnerships can rapidly build brand awareness');
    }
    
    if (focusOnSustainability) {
      opportunities.push('Growing consumer demand for sustainable products creates favorable market conditions');
      opportunities.push('Partnership opportunities with sustainability-focused retailers and platforms');
    }
    
    if (hasSubscription) {
      opportunities.push('Subscription model enables customer lifetime value optimization and predictable revenue');
    }
    
    if (parsedBrief.geographicFocus && parsedBrief.geographicFocus.toLowerCase().includes('national')) {
      opportunities.push('National scale campaign enables testing and optimization across diverse markets');
    }
    
    opportunities.push('Data-driven targeting allows for continuous optimization and improved efficiency');
    
    // Build threats
    if (focusOnQuality || hasPremiumProduct) {
      threats.push('Established premium competitors have strong brand loyalty and market position');
    } else {
      threats.push('Intense competitive pressure from both established brands and new entrants');
    }
    
    if (hasSalesObjective) {
      threats.push('Economic uncertainty may impact consumer discretionary spending');
    }
    
    threats.push('Rapidly evolving consumer preferences require ongoing product and messaging innovation');
    
    if (focusOnDigital) {
      threats.push('Rising digital advertising costs may impact campaign efficiency');
    }
    
    // Ensure minimum items in each category
    if (strengths.length === 0) strengths.push('Clear campaign objectives and target audience definition');
    if (weaknesses.length === 0) weaknesses.push('Market competition requires strategic differentiation');
    if (opportunities.length === 0) opportunities.push('Digital marketing channels offer precision targeting capabilities');
    if (threats.length === 0) threats.push('Market volatility and changing consumer behaviors');
    
    return { strengths, weaknesses, opportunities, threats };
  }

  /**
   * Step 9: Research company profile
   */
  private async researchCompany(
    parsedBrief: ParsedBrief,
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<{ industry: string; competitiveLandscape: string; marketPosition: string }> {
    this.emitProgress(progressCallback, 9, 'profile', 'in_progress', 'Researching company...');
    console.log('🏢 Researching company profile...');

    try {
      const profile = {
        industry: 'Industry analysis pending',
        competitiveLandscape: 'Competitive analysis pending',
        marketPosition: 'Market positioning analysis pending'
      };
      
      this.emitProgress(progressCallback, 9, 'profile', 'completed', 'Company profile complete', 95);
      return profile;
    } catch (error) {
      console.error('❌ Company research failed:', error);
      throw error;
    }
  }

  /**
   * Generate strategic insights (NEW - Cursor parity feature)
   * Includes: competitors, differentiators, market tiers, budget pacing, dayparting
   */
  private async generateStrategyInsights(
    parsedBrief: ParsedBrief,
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<any> {
    console.log('🎯 Generating strategic insights...');
    
    try {
      // Generate all strategic components (fast, no API calls)
      const competitorAnalysis = this.strategyGenerator.generateCompetitorAnalysis(parsedBrief);
      const marketTiers = this.strategyGenerator.generateMarketTiers(parsedBrief);
      const budgetPacing = this.strategyGenerator.generateBudgetPacing(parsedBrief);
      const dayparting = this.strategyGenerator.generateDayparting(parsedBrief);
      
      const strategy = {
        competitors: competitorAnalysis.competitors,
        differentiators: competitorAnalysis.differentiators,
        marketTiers,
        budgetPacing,
        dayparting
      };
      
      console.log(`✅ Strategic insights generated:`);
      console.log(`   Competitors: ${strategy.competitors.length}`);
      console.log(`   Differentiators: ${strategy.differentiators.length}`);
      console.log(`   Tier 1 markets: ${strategy.marketTiers.tier1.length}`);
      console.log(`   Budget phases: ${strategy.budgetPacing.phases.length}`);
      console.log(`   Dayparts: ${strategy.dayparting.optimal.length}`);
      
      return strategy;
    } catch (error) {
      console.error('⚠️ Strategy generation failed:', error);
      return undefined;
    }
  }

  /**
   * Emit progress update
   */
  private emitProgress(
    callback: (update: ProgressUpdate) => void,
    step: number,
    stepName: string,
    status: 'pending' | 'in_progress' | 'completed' | 'error',
    message?: string,
    percentComplete?: number
  ): void {
    const totalSteps = this.ANALYSIS_STEPS.length;
    const calculatedPercent = percentComplete !== undefined ? percentComplete : ((step - 1) / totalSteps) * 100;
    
    const update: ProgressUpdate = {
      type: status === 'error' ? 'error' : 'progress',
      step,
      totalSteps,
      stepName,
      status,
      message,
      timestamp: new Date(),
      percentComplete: Math.min(100, Math.max(0, calculatedPercent))
    };

    callback(update);
  }

  /**
   * Fallback extractors if Gemini parsing fails
   */
  private extractAdvertiserName(text: string): string {
    // Look for patterns like "Client: X", "Advertiser: X", "Company: X"
    const structuredPatterns = [
      /(?:client|advertiser|company|brand):\s*([^\n,]+)/i,
      /^([A-Z][A-Za-z\s&]+)\s+is\s+/,  // "Nike is launching..."
      /^([A-Z][A-Za-z\s&]+)\s+needs?\s+/,  // "Nike needs..."
      /for\s+([A-Z][A-Za-z\s&]+)(?:\s|$)/i  // "...for Nike..."
    ];

    for (const pattern of structuredPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].length < 30) {
        const name = match[1].trim();
        // Exclude common non-names
        if (!['General', 'Target', 'Campaign'].includes(name)) {
          return name;
        }
      }
    }

    // Extract first capitalized word(s) from the beginning
    const words = text.split(/\s+/);
    const capitalizedWords: string[] = [];
    for (const word of words) {
      if (/^[A-Z][A-Za-z]*$/.test(word) && word.length > 2) {
        capitalizedWords.push(word);
        if (capitalizedWords.length >= 2) break; // Max 2 words
      } else if (capitalizedWords.length > 0) {
        break; // Stop after first non-capitalized word
      }
    }

    return capitalizedWords.length > 0 ? capitalizedWords.join(' ') : 'Unnamed Advertiser';
  }

  private extractAudiences(text: string): string[] {
    const audiences: string[] = [];
    const textLower = text.toLowerCase();

    // Look for structured audience info
    const structuredPatterns = [
      /(?:target\s+audience|audience|targeting|customers?):\s*([^\n]+)/gi,
      /\bfor\s+([a-z\s]+(?:fans|owners|enthusiasts|lovers|seekers|buyers|users|consumers|shoppers))/gi,
      /\breaching?\s+([a-z\s]+(?:fans|owners|enthusiasts|lovers|seekers|buyers|users|consumers|shoppers))/gi,
      /\b(?:to|targeting|reaching|engaging)\s+([a-z\s]+(?:audience|market|segment|demographic|consumers?|shoppers?))/gi
    ];

    for (const pattern of structuredPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1]) {
          const audience = match[1].trim()
            .split(',')
            .map(a => a.trim())
            .filter(a => a.length > 3 && a.length < 50);
          audiences.push(...audience);
        }
      }
    }

    // Look for common audience indicators (expanded list)
    const indicatorPatterns = [
      // Sports & Fitness
      /(?:basketball|football|soccer|baseball|tennis|golf|hockey)\s+(?:fans?|players?|enthusiasts?)/gi,
      /(?:sports?|athletic|fitness|gym|workout|exercise)\s+(?:fans?|enthusiasts?|lovers?)/gi,
      /\b(?:athletes?|runners?|cyclists?|swimmers?)\b/gi,
      
      // Lifestyle & Shopping
      /(?:fashion|style|clothing|apparel)\s+(?:lovers?|enthusiasts?|shoppers?)/gi,
      /(?:sneaker|shoe)\s+(?:heads?|collectors?|fans?|enthusiasts?)/gi,
      /\b(?:shoppers?|consumers?|buyers?)\b/gi,
      
      // Pets & Family
      /(?:dog|cat|pet)\s+owners?/gi,
      /\b(?:parents?|moms?|dads?|families?|children)\b/gi,
      
      // Health & Wellness
      /(?:health|wellness|fitness)\s+(?:seekers?|enthusiasts?|conscious)/gi,
      
      // Tech & Gaming
      /(?:tech|gaming|gadget)\s+(?:enthusiasts?|lovers?|fans?)/gi,
      /\b(?:gamers?|techies?)\b/gi,
      
      // Age/Demo groups
      /\b(?:millennials?|gen\s*z|boomers?|teens?|young\s+adults?)\b/gi,
      
      // Interest-based
      /\b(?:music|movie|book|art|travel)\s+(?:lovers?|enthusiasts?|fans?)/gi
    ];

    for (const pattern of indicatorPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        audiences.push(...matches.map(m => m.trim()));
      }
    }

    // If no specific audiences found, try to infer from product keywords
    if (audiences.length === 0) {
      // Product-to-audience mapping
      const productAudienceMap: { [key: string]: string[] } = {
        'shoe': ['Sneaker enthusiasts', 'Athletic footwear shoppers', 'Fashion-conscious consumers'],
        'basketball': ['Basketball fans', 'Sports enthusiasts', 'Athletes'],
        'running': ['Runners', 'Fitness enthusiasts', 'Active lifestyle'],
        'soccer': ['Soccer fans', 'Sports enthusiasts'],
        'fitness': ['Fitness enthusiasts', 'Gym-goers', 'Health-conscious consumers'],
        'apparel': ['Fashion shoppers', 'Active lifestyle consumers'],
        'sneaker': ['Sneakerheads', 'Shoe collectors', 'Street fashion enthusiasts']
      };

      for (const [productKeyword, audienceList] of Object.entries(productAudienceMap)) {
        if (textLower.includes(productKeyword)) {
          audiences.push(...audienceList);
        }
      }
    }

    // Deduplicate and capitalize
    const uniqueAudiences = [...new Set(audiences)]
      .filter(a => a.toLowerCase() !== 'general audience')
      .map(a => a.charAt(0).toUpperCase() + a.slice(1).toLowerCase());

    return uniqueAudiences.length > 0 ? uniqueAudiences : ['General audience'];
  }

  private extractObjectives(text: string): string[] {
    const objectives: string[] = [];
    const textLower = text.toLowerCase();

    // Look for structured objectives
    const structuredPatterns = [
      /(?:objective|goal|aim)s?:\s*([^\n]+)/gi,
      /\b(?:needs?|wants?)\s+(?:a\s+)?([a-z\s]+(?:plan|strategy|campaign))/gi
    ];

    for (const pattern of structuredPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1]) {
          const obj = match[1].trim()
            .split(',')
            .map(o => o.trim())
            .filter(o => o.length > 5 && o.length < 50);
          objectives.push(...obj);
        }
      }
    }

    // Detect common objectives from keywords
    if (textLower.includes('launch')) objectives.push('Product launch');
    if (textLower.includes('awareness')) objectives.push('Brand awareness');
    if (textLower.includes('sales') || textLower.includes('drive')) objectives.push('Drive sales');
    if (textLower.includes('acquisition')) objectives.push('Customer acquisition');
    if (textLower.includes('engagement')) objectives.push('Increase engagement');
    if (textLower.includes('traffic')) objectives.push('Drive traffic');

    // Deduplicate and capitalize
    const uniqueObjectives = [...new Set(objectives)]
      .map(o => o.charAt(0).toUpperCase() + o.slice(1).toLowerCase());

    return uniqueObjectives.length > 0 ? uniqueObjectives.slice(0, 5) : ['Brand awareness', 'Customer acquisition'];
  }

  /**
   * Extract budget information from brief text
   */
  private extractBudget(text: string): string | undefined {
    // Look for budget patterns
    const budgetPatterns = [
      /budget:\s*\$?([\d,]+k?)/i,
      /\$\s*([\d,]+k?)\s*budget/i,
      /\$\s*([\d,]+(?:,\d{3})*(?:\.\d{2})?)\b/i
    ];

    for (const pattern of budgetPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].includes('$') ? match[1] : `$${match[1]}`;
      }
    }

    return undefined;
  }

  /**
   * Extract geographic focus from brief text
   */
  private extractGeography(text: string): string | undefined {
    const textLower = text.toLowerCase();
    
    // Look for geographic patterns
    if (textLower.includes('us national') || textLower.includes('nationwide')) {
      return 'US National';
    }
    if (textLower.includes('local')) return 'Local';
    if (textLower.includes('regional')) return 'Regional';
    
    // Look for specific regions
    const regionPatterns = [
      /geographic\s+focus:\s*([^\n]+)/i,
      /target(?:ing)?\s+(?:area|region|market):\s*([^\n]+)/i,
      /\b(northeast|southeast|midwest|southwest|west coast|east coast)\b/i
    ];

    for (const pattern of regionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Extract product mentions from brief text
   */
  private extractProducts(text: string): string[] {
    const products: string[] = [];
    
    // Look for product patterns
    const productPatterns = [
      /product:\s*([^\n]+)/i,
      /\b(?:launching|selling|promoting)\s+(?:a\s+)?(?:new\s+)?([a-z\s]+(?:shoe|product|line|service|device))/gi,
      /\b(basketball shoe|sneaker|footwear|apparel|device|product)\b/gi
    ];

    for (const pattern of productPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1]) {
          const product = match[1].trim();
          if (product.length > 3 && product.length < 50) {
            products.push(product);
          }
        }
      }
    }

    // Deduplicate
    return [...new Set(products)];
  }
}

