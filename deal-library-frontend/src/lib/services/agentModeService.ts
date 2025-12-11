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
import { SupabaseService } from './supabaseService';
import { Deal } from '../types/deal';
import {
  AdvertiserBrief,
  ParsedBrief,
  ProgressUpdate,
  AnalysisResults,
  ComprehensiveReport,
  AnalysisStep
} from '../types/agentMode';
import * as crypto from 'crypto';

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
          estimatedReach: Math.max(0, results.marketSizing.reachEstimate || 0),
          recommendedBudget: parsedBrief.budgetRange || (parsedBrief.budgetValue ? this.formatBudget(parsedBrief.budgetValue) : 'TBD'),
          recommendedBudgetValue: parsedBrief.budgetValue,
          recommendedBudgetNotes: parsedBrief.budgetNotes
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
      const budgetInfo = this.extractBudgetInfo(brief.rawBrief);
      console.log(`   Budget: ${budgetInfo?.formatted || 'N/A'}`);
      
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
        budgetRange: budgetInfo?.formatted,
        budgetValue: budgetInfo?.approxValue,
        budgetNotes: budgetInfo?.note,
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
      const budgetInfo = this.extractBudgetInfo(brief.rawBrief);
      const parsedBrief = {
        advertiserName: this.extractAdvertiserName(brief.rawBrief),
        targetAudiences: this.extractAudiences(brief.rawBrief),
        campaignObjectives: this.extractObjectives(brief.rawBrief),
        budgetRange: budgetInfo?.formatted || undefined,
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
    
    // Run critical analyses first - audiences and deals in parallel
    const analyses = await Promise.allSettled([
      this.findAudiences(parsedBrief, progressCallback).catch(err => {
        results.errors.push({ step: 'audiences', error: err.message });
        return { segments: [], count: 0 };
      }),
      this.findDeals(parsedBrief, progressCallback).catch(err => {
        results.errors.push({ step: 'deals', error: err.message });
        return { recommendations: [], count: 0 };
      })
    ]);

    // Extract results
    if (analyses[0].status === 'fulfilled') results.audiences = analyses[0].value;
    if (analyses[1].status === 'fulfilled') results.deals = analyses[1].value;

    // NOW generate personas with access to actual audience segments
    // This allows us to use audienceInsightsService for rich persona data
    results.personas = await this.generatePersonas(parsedBrief, results.audiences, progressCallback).catch(err => {
      results.errors.push({ step: 'personas', error: err.message });
      return { profiles: [], count: 0 };
    });

    // Generate audience insights for first target audience (separate from personas)
    results.audienceInsights = await this.generateAudienceInsights(parsedBrief, progressCallback).catch(err => {
      results.errors.push({ step: 'insights', error: err.message });
      return { reports: [], count: 0 };
    });

    // Now run market sizing with access to actual audience data
    results.marketSizing = await this.calculateMarketSizing(parsedBrief, results.audiences, progressCallback).catch(err => {
      results.errors.push({ step: 'sizing', error: err.message });
      return { totalAddressableMarket: 0, reachEstimate: 0, demographicBreakdown: {} };
    });

    // Run geographic analysis with access to audience data
    results.geographic = await this.analyzeGeographic(parsedBrief, results.audiences, progressCallback).catch(err => {
      results.errors.push({ step: 'geographic', error: err.message });
      return { topMarkets: [], coverageMap: {} };
    });

    // Generate strategic insights FIRST (includes AI competitive intelligence)
    console.log('🎯 Generating strategic insights...');
    results.strategy = await this.generateStrategyInsights(parsedBrief, progressCallback);

    // Continue with remaining analyses (SWOT now has access to strategy insights)
    const remainingAnalyses = await Promise.allSettled([
      this.buildSWOT(parsedBrief, results.strategy, progressCallback).catch(err => {
        results.errors.push({ step: 'swot', error: err.message });
        return { strengths: [], weaknesses: [], opportunities: [], threats: [] };
      }),
      this.researchCompany(parsedBrief, progressCallback).catch(err => {
        results.errors.push({ step: 'profile', error: err.message });
        return { industry: '', competitiveLandscape: '', marketPosition: '' };
      })
    ]);

    if (remainingAnalyses[0].status === 'fulfilled') results.swot = remainingAnalyses[0].value;
    if (remainingAnalyses[1].status === 'fulfilled') results.companyProfile = remainingAnalyses[1].value;

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
            bestFitNames: result.bestFit?.slice(0, 3).map((s: any) => s.segment?.segmentName || s.segmentName || s.segment?.name || s.name || 'unnamed') || []
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
      const dedupedSegments = Array.from(
        new Map(allSegments.map(seg => [seg.sovrnSegmentId || seg.id, seg])).values()
      );
      
      console.log(`📦 After deduplication: ${dedupedSegments.length} segments`);

      // Filter out obviously irrelevant segments based on original query intent
      const filteredSegments = this.filterIrrelevantSegments(dedupedSegments, parsedBrief.targetAudiences, baseQueries);
      console.log(`🔍 After relevance filtering: ${filteredSegments.length} segments (removed ${dedupedSegments.length - filteredSegments.length})`);
      
      const uniqueSegments = filteredSegments
        .slice(0, 25) // Increase to 25 segments for LabCorp-quality results (was 10)
        .map(segment => this.normalizeSegment(segment));

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
   * Filter out segments that are clearly irrelevant to the original search intent
   */
  private filterIrrelevantSegments(segments: any[], targetAudiences: string[], baseQueries: string[]): any[] {
    const coreKeywords = this.extractCoreKeywords(targetAudiences, baseQueries);
    const coreThemes = this.extractCoreThemes(targetAudiences, baseQueries);
    
    console.log(`   Core keywords for filtering:`, Array.from(coreKeywords).join(', '));
    console.log(`   Core themes:`, Array.from(coreThemes).join(', '));
    
    // Filter segments
    const filtered = segments.filter(seg => {
      // Get segment name from various possible locations
      const rawSeg = seg.segment || seg;
      const segmentName = (rawSeg.segmentName || rawSeg.name || seg.segmentName || seg.name || '').toLowerCase();
      const segmentDesc = (rawSeg.segmentDescription || rawSeg.description || seg.segmentDescription || seg.description || '').toLowerCase();
      const fullPath = (rawSeg.fullPath || seg.fullPath || '').toLowerCase();
      const searchText = `${segmentName} ${segmentDesc} ${fullPath}`;
      
      // If the segment has no identifiable name, skip filtering - keep it for now
      if (!segmentName && !segmentDesc && !fullPath) {
        console.log(`   ⚠️ Segment with no name/desc found, keeping anyway`);
        return true;
      }
      
      // Check if segment relates to any core keyword
      const hasKeywordMatch = Array.from(coreKeywords).some(keyword => 
        searchText.includes(keyword)
      );
      
      // Check if segment relates to any core theme
      const hasThemeMatch = this.segmentMatchesThemes(searchText, coreThemes);
      
      // Keep segment if it matches keywords OR themes
      const isRelevant = hasKeywordMatch || hasThemeMatch;
      
      if (!isRelevant && segmentName) {
        console.log(`   ❌ Filtering out irrelevant: ${segmentName}`);
      }
      
      return isRelevant;
    });
    
    return filtered;
  }

  private extractCoreKeywords(targetAudiences: string[], baseQueries?: string[]): Set<string> {
    const coreKeywords = new Set<string>();
    const combinedQueries = baseQueries && baseQueries.length > 0
      ? [...targetAudiences, ...baseQueries]
      : [...targetAudiences];
    
    for (const query of combinedQueries) {
      const words = query.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) { // Ignore short words like "for", "the", etc.
          coreKeywords.add(word);
          if (word.endsWith('s')) {
            const singular = word.replace(/s$/, '');
            if (singular.length > 3) {
              coreKeywords.add(singular);
            }
          }
          if (word.includes('-')) {
            coreKeywords.add(word.replace(/-/g, ' '));
          }
        }
      });
    }
    return coreKeywords;
  }

  private extractCoreThemes(targetAudiences: string[], baseQueries?: string[]): Set<string> {
    const coreThemes = new Set<string>();
    const combinedQueries = baseQueries && baseQueries.length > 0
      ? [...targetAudiences, ...baseQueries]
      : [...targetAudiences];
    
    for (const query of combinedQueries) {
      const queryLower = query.toLowerCase();
      if (queryLower.includes('basketball') || queryLower.includes('sports') || queryLower.includes('athletic')) {
        coreThemes.add('sports_fitness');
      }
      if (queryLower.includes('pet') || queryLower.includes('dog') || queryLower.includes('cat')) {
        coreThemes.add('pets');
      }
      if (queryLower.includes('parent') || queryLower.includes('mom') || queryLower.includes('dad')) {
        coreThemes.add('family');
      }
      if (queryLower.includes('professional') || queryLower.includes('business')) {
        coreThemes.add('business');
      }
      if (queryLower.includes('coffee') || queryLower.includes('food') || queryLower.includes('beverage')) {
        coreThemes.add('food_beverage');
      }
    }
    return coreThemes;
  }

  private segmentMatchesThemes(searchText: string, coreThemes: Set<string>): boolean {
    return Array.from(coreThemes).some(theme => {
      switch(theme) {
        case 'sports_fitness':
          return searchText.includes('sport') || searchText.includes('athletic') || 
                 searchText.includes('fitness') || searchText.includes('exercise') ||
                 searchText.includes('basketball') || searchText.includes('football') ||
                 searchText.includes('workout') || searchText.includes('active') ||
                 searchText.includes('training') || searchText.includes('gym');
        case 'pets':
          return searchText.includes('pet') || searchText.includes('dog') || 
                 searchText.includes('cat') || searchText.includes('animal');
        case 'family':
          return searchText.includes('parent') || searchText.includes('mom') || 
                 searchText.includes('dad') || searchText.includes('family') || 
                 searchText.includes('child') || searchText.includes('baby');
        case 'business':
          return searchText.includes('business') || searchText.includes('professional') || 
                 searchText.includes('career') || searchText.includes('office');
        case 'food_beverage':
          return searchText.includes('food') || searchText.includes('beverage') || 
                 searchText.includes('coffee') || searchText.includes('dining') || 
                 searchText.includes('restaurant') || searchText.includes('grocery');
        default:
          return false;
      }
    });
  }

  private normalizeSegment(enrichedSegment: any): any {
    const seg = enrichedSegment.segment || enrichedSegment;
    const segmentName = seg.segmentName || seg.name || enrichedSegment.segmentName || enrichedSegment.name;

    return {
      ...enrichedSegment,
      segment: seg,
      segmentName,
      segmentDescription: this.buildSegmentDescription(seg, enrichedSegment),
      segmentType: seg.segmentType || enrichedSegment.segmentType,
      scale7DayUS: seg.scale7DayUS || seg.scale || seg['scale_7day_us'] || enrichedSegment.scale7DayUS || null,
      cpm: seg.cpm || enrichedSegment.cpm || null,
      tier1: seg.tier1 || enrichedSegment.tier1,
      tier2: seg.tier2 || enrichedSegment.tier2,
      tier3: seg.tier3 || enrichedSegment.tier3,
      dataSources: enrichedSegment.dataSources || [],
      strategicHook: enrichedSegment.strategicHook || seg.strategicHook || ''
    };
  }

  private buildSegmentDescription(seg: any, enrichedSegment: any): string {
    if (seg.segmentDescription) return seg.segmentDescription;
    if (seg.description) return seg.description;
    if (enrichedSegment?.strategicHook) return enrichedSegment.strategicHook;

    const tiers = [seg.tier1, seg.tier2, seg.tier3].filter(Boolean);
    if (tiers.length > 0) {
      return `Audience interested in ${tiers.join(' › ')}`;
    }

    return 'High-value audience segment identified from Sovrn taxonomy and commerce signals.';
  }

  private isPersonaContentRelevant(persona: any, coreKeywords: Set<string>, coreThemes: Set<string>): boolean {
    const combinedText = [
      persona.personaName || persona.name || '',
      persona.category || '',
      persona.coreInsight || persona.description || '',
      persona.segmentName || '',
      (persona.audienceMotivation || ''),
      Array.isArray(persona.creativeHooks) ? persona.creativeHooks.join(' ') : '',
      Array.isArray(persona.mediaTargeting) ? persona.mediaTargeting.join(' ') : ''
    ].join(' ').toLowerCase();

    const normalizedKeywords = new Set<string>();
    for (const keyword of coreKeywords) {
      if (keyword.length <= 3) continue;
      normalizedKeywords.add(keyword);
      if (keyword.endsWith('s')) {
        const singular = keyword.replace(/s$/, '');
        if (singular.length > 3) normalizedKeywords.add(singular);
      }
      if (keyword.endsWith('ers')) {
        const base = keyword.replace(/ers$/, 'er');
        if (base.length > 3) normalizedKeywords.add(base);
      }
    }

    const keywordMatches = Array.from(normalizedKeywords).filter(keyword => combinedText.includes(keyword));
    // Simple theme matching: check if any theme appears in the combined text
    const themeMatches = coreThemes.size > 0 ? Array.from(coreThemes).some(theme => combinedText.includes(theme.toLowerCase())) : false;

    if (normalizedKeywords.size > 0 && keywordMatches.length === 0) {
      return false;
    }

    if (normalizedKeywords.size === 0 && coreThemes.size > 0) {
      return themeMatches;
    }

    return keywordMatches.length > 0 || themeMatches;
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
      
      // Detect advertiser category for context-aware keyword expansion
      const advertiserCategory = this.detectAdvertiserCategory(parsedBrief.advertiserName, parsedBrief.keyProducts || []);
      console.log(`🏷️  Detected advertiser category: ${advertiserCategory}`);
      
      // Expand keywords to include variations (for better matching)
      const baseKeywords = [
        parsedBrief.advertiserName, // Include advertiser name (e.g., "Chewy")
        ...parsedBrief.targetAudiences,
        ...parsedBrief.campaignObjectives,
        ...(parsedBrief.keyProducts || [])
      ].filter(Boolean); // Remove any undefined/empty values
      
      const expandedKeywords = this.expandDealKeywords(baseKeywords, advertiserCategory);
      console.log(`🔍 Searching deals with ${expandedKeywords.length} keywords:`, expandedKeywords.slice(0, 10).join(', '));

      // Score and rank deals by relevance
      const scoredDeals = allDeals.map((deal: Deal) => {
        const searchText = `${deal.dealName} ${deal.description} ${deal.targeting}`.toLowerCase();
        let score = 0;
        
        // Boost score for category-relevant deals
        if (advertiserCategory === 'automotive' && 
            (searchText.includes('automotive') || searchText.includes('vehicle') || 
             searchText.includes('car') || searchText.includes('auto') || 
             searchText.includes('truck') || searchText.includes('suv'))) {
          score += 5; // Strong boost for category match
        }
        
        // Penalize category-mismatched deals (e.g., baby deals for automotive)
        if (advertiserCategory === 'automotive' && 
            (searchText.includes('baby') || searchText.includes('toddler') || 
             searchText.includes('infant') || searchText.includes('nursery'))) {
          score -= 10; // Strong penalty for category mismatch
        }
        
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
   * Detect advertiser category for context-aware matching
   */
  private detectAdvertiserCategory(advertiserName: string, keyProducts: string[]): string {
    const nameLower = advertiserName.toLowerCase();
    const productsLower = keyProducts.join(' ').toLowerCase();
    const combined = `${nameLower} ${productsLower}`;
    
    // Automotive
    if (combined.includes('dodge') || combined.includes('ford') || combined.includes('chevrolet') ||
        combined.includes('toyota') || combined.includes('honda') || combined.includes('nissan') ||
        combined.includes('bmw') || combined.includes('mercedes') || combined.includes('audi') ||
        combined.includes('car') || combined.includes('vehicle') || combined.includes('automotive') ||
        combined.includes('auto') || combined.includes('truck') || combined.includes('suv')) {
      return 'automotive';
    }
    
    // Pet/Animal
    if (combined.includes('chewy') || combined.includes('pet') || combined.includes('animal')) {
      return 'pet';
    }
    
    // Baby/Children
    if (combined.includes('baby') || combined.includes('toddler') || combined.includes('infant') ||
        combined.includes('children') || combined.includes('kids')) {
      return 'baby';
    }
    
    // Sports/Athletic
    if (combined.includes('nike') || combined.includes('adidas') || combined.includes('athletic') ||
        combined.includes('sport') || combined.includes('fitness') || combined.includes('exercise')) {
      return 'sports';
    }
    
    // Electronics/Audio
    if (combined.includes('sonos') || combined.includes('bose') || combined.includes('audio') ||
        combined.includes('speaker') || combined.includes('electronics')) {
      return 'electronics';
    }
    
    return 'general';
  }

  /**
   * Expand deal search keywords to include variations (with advertiser context)
   */
  private expandDealKeywords(baseKeywords: string[], advertiserCategory: string = 'general'): string[] {
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
      
      // Automotive variations (for Dodge, Ford, etc.)
      if (lower.includes('dodge') || lower.includes('ford') || lower.includes('car') || 
          lower.includes('vehicle') || lower.includes('automotive') || lower.includes('auto') ||
          lower.includes('truck') || lower.includes('suv') || advertiserCategory === 'automotive') {
        expanded.add('automotive');
        expanded.add('vehicle');
        expanded.add('car');
        expanded.add('auto');
        expanded.add('truck');
        expanded.add('suv');
        expanded.add('driving');
        expanded.add('transportation');
        expanded.add('family vehicle');
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
      
      // Family/Parenting variations (context-aware)
      if (lower.includes('mom') || lower.includes('mother') || lower.includes('parent')) {
        expanded.add('family');
        expanded.add('household');
        
        // Only expand to baby/toddler if advertiser is in baby/children category
        if (advertiserCategory === 'baby' || advertiserCategory === 'general') {
          expanded.add('children');
          expanded.add('baby');
          expanded.add('toddler');
          expanded.add('kids');
        }
        
        // For automotive, expand to vehicle/family vehicle terms instead
        if (advertiserCategory === 'automotive') {
          expanded.add('vehicle');
          expanded.add('car');
          expanded.add('automotive');
          expanded.add('family vehicle');
          expanded.add('suv');
          expanded.add('minivan');
          expanded.add('family car');
        }
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
   * Step 4: Generate personas using Audience Insights for matched segments
   */
  private async generatePersonas(
    parsedBrief: ParsedBrief,
    audiences: { segments: any[]; count: number },
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<{ profiles: any[]; count: number }> {
    this.emitProgress(progressCallback, 4, 'personas', 'in_progress', 'Generating audience personas...');
    console.log('👤 Generating personas from audience segments...');

    try {
      const personas: any[] = [];
      const personaKeywordSet = this.extractCoreKeywords(parsedBrief.targetAudiences);
      const personaThemeSet = this.extractCoreThemes(parsedBrief.targetAudiences);
      const basePersonaQueries = parsedBrief.targetAudiences.slice(0, 2);
      
      let personaSegments = audiences.segments || [];
      if (personaSegments.length > 0) {
        const filteredForPersonas = this.filterIrrelevantSegments(
          personaSegments,
          parsedBrief.targetAudiences,
          basePersonaQueries
        );
        if (filteredForPersonas.length > 0) {
          personaSegments = filteredForPersonas;
        }
      }
      
      // PRIORITY 1: Use rich Audience Insights for matched segments (top 3)
      if (personaSegments && personaSegments.length > 0) {
        console.log(`   ✓ Found ${personaSegments.length} audience segments - generating rich personas...`);
        
        const topSegments = personaSegments.slice(0, 3);
        const personaPromises = topSegments.map(async (enrichedSegment) => {
          try {
            const segment = enrichedSegment.segment || enrichedSegment;
            const segmentName = segment.segmentName || segment.name;
            
            if (!segmentName) return null;
            
            console.log(`   📊 Generating rich persona for: ${segmentName}`);
            
            // Generate full Audience Insights report (includes demographics, behavioral overlaps, messaging recommendations)
            const insightsReport = await audienceInsightsService.generateReport(segmentName);
            
            // Transform Audience Insights into Persona format
            const personaCandidate = {
              personaName: insightsReport.personaName,
              emoji: insightsReport.personaEmoji,
              category: insightsReport.category,
              coreInsight: insightsReport.executiveSummary,
              creativeHooks: insightsReport.strategicInsights?.messagingRecommendations || [],
              mediaTargeting: insightsReport.strategicInsights?.channelRecommendations || [],
              audienceMotivation: insightsReport.strategicInsights?.targetPersona || '',
              demographics: {
                medianIncome: insightsReport.keyMetrics?.medianHHI,
                topAge: insightsReport.keyMetrics?.topAgeBracket,
                educationLevel: insightsReport.keyMetrics?.educationLevel,
                topMarkets: insightsReport.geographicHotspots?.slice(0, 5).map(h => `${h.city}, ${h.state}`)
              },
              behavioralOverlap: insightsReport.behavioralOverlap?.slice(0, 3),
              segmentName: segmentName,
              isAIGenerated: true
            };

            if (!this.isPersonaContentRelevant(personaCandidate, personaKeywordSet, personaThemeSet)) {
              console.warn(`⚠️ Persona for ${segmentName} did not match core keywords, discarding.`);
              return null;
            }

            return personaCandidate;
          } catch (error) {
            console.warn(`⚠️ Could not generate rich persona for segment:`, error);
            return null;
          }
        });
        
        const richPersonas = (await Promise.all(personaPromises)).filter(p => p !== null);
        personas.push(...richPersonas);
        console.log(`   ✅ Generated ${richPersonas.length} rich AI personas`);
      }
      
      // PRIORITY 2: Fill gaps with static PersonaService personas
      if (personas.length < 3) {
        console.log(`   Searching static personas to fill gaps...`);
        const allPersonas = this.personaService.getAllPersonas();
        
        const relevantPersonas = allPersonas.filter(persona => {
          const searchText = `${persona.category} ${persona.personaName} ${persona.coreInsight}`.toLowerCase();
          const matchesKeyword = Array.from(personaKeywordSet).some(keyword => searchText.includes(keyword));
          return matchesKeyword && this.isPersonaContentRelevant(persona, personaKeywordSet, personaThemeSet);
        });
        
        if (relevantPersonas.length > 0) {
          const needed = 3 - personas.length;
          personas.push(...relevantPersonas.slice(0, needed));
          console.log(`   ✓ Added ${Math.min(needed, relevantPersonas.length)} static personas`);
        }
      }
      
      // PRIORITY 3: Generate synthetic personas as last resort
      if (personas.length < 3) {
        console.log(`   Generating synthetic personas as fallback...`);
        
        for (const audience of parsedBrief.targetAudiences.slice(0, 3 - personas.length)) {
          const syntheticPersona = this.generateSyntheticPersona(audience, parsedBrief);
          personas.push(syntheticPersona);
        }
      }
      
      console.log(`   ✅ Total personas: ${personas.length} (${personas.filter(p => p.isAIGenerated).length} AI-generated)`);
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

      const INSIGHTS_TIMEOUT_MS = 30000; // 30 second timeout per audience

      for (const audience of audiences) {
        try {
          const report = await Promise.race([
            audienceInsightsService.generateReport(audience),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Audience insights generation timeout')), INSIGHTS_TIMEOUT_MS)
            )
          ]) as any;
          
          reports.push({
            audience,
            ...(report && typeof report === 'object' ? report : {})
          });
        } catch (error) {
          console.warn(`⚠️ Could not generate insights for ${audience}:`, error);
          console.warn(`   Falling back to lightweight insight for ${audience}`);
          reports.push(this.generateFallbackInsight(audience));
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
   * Generate lightweight fallback insight when rich insights fail or timeout
   */
  private generateFallbackInsight(audience: string) {
    return {
      audience,
      segment: audience,
      executiveSummary: `Audience insights for ${audience} are unavailable at this time. We recommend focusing on core demographic and behavioral signals collected from matched audience segments.`,
      personaName: `${audience} Audience`,
      personaEmoji: '📊',
      strategicInsights: {
        messagingRecommendations: [
          `Highlight the value proposition that resonates most with ${audience}.`,
          'Leverage performance creative variations and iterate quickly based on engagement.'
        ],
        channelRecommendations: [
          'Mix of CTV + high-impact mobile inventory for reach',
          'Retarget engaged users via programmatic display and social extensions'
        ],
        targetPersona: `Reach ${audience} with tailored creative and offers.`
      },
      keyMetrics: {
        medianHHI: null,
        medianHHIvsNational: null,
        medianHHIvsCommerce: null,
        topAgeBracket: null,
        educationLevel: null,
        educationVsNational: null,
        educationVsCommerce: null
      },
      geographicHotspots: [],
      demographics: {},
      behavioralOverlap: []
    };
  }

  /**
   * Step 6: Calculate market sizing using Gemini AI (matching Strategy Card format)
   */
  private async calculateMarketSizing(
    parsedBrief: ParsedBrief,
    audiences: { segments: any[]; count: number },
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<{ 
    totalAddressableMarket: number; 
    reachEstimate: number; 
    demographicBreakdown: any;
    aiGenerated?: boolean;
    aiSummary?: string;
    totalMarketSize?: string;
    growthRate?: string;
    addressableMarket?: string;
    addressableValue?: string;
    growthTrends?: any;
    marketInsights?: any;
  }> {
    this.emitProgress(progressCallback, 6, 'sizing', 'in_progress', 'Generating market sizing analysis...');
    console.log('📈 Generating AI-enhanced market sizing (Strategy Card format)...');

    try {
      // First, try to get AI-generated market sizing (matching Strategy Card format)
      let aiMarketSizing: any = null;
      const targetAudience = parsedBrief.targetAudiences.join(' and ') || parsedBrief.advertiserName;
      const marketSizingQuery = `What is the market size of ${targetAudience}?`;
      
      console.log(`   📊 Generating AI market sizing for: "${marketSizingQuery}"`);
      
      try {
        const geminiResult = await this.geminiService.generateMarketSizing(marketSizingQuery, []);
        if (geminiResult && geminiResult.marketSizing && geminiResult.marketSizing.length > 0) {
          aiMarketSizing = geminiResult.marketSizing[0];
          console.log(`   ✅ AI market sizing generated: ${aiMarketSizing.marketName}`);
        }
      } catch (geminiError) {
        console.warn('   ⚠️ Gemini market sizing failed, using audience-based calculation:', geminiError);
      }
      
      // Ensure commerce data is loaded for demographic analysis
      if (!commerceAudienceService['isLoaded']) {
        console.log('   Loading commerce data for demographic analysis...');
        try {
          const loadResult = await commerceAudienceService.loadCommerceData();
          if (!loadResult.success) {
            console.warn('⚠️  Commerce data loading failed, demographics will be limited:', loadResult.message);
          }
        } catch (error) {
          console.warn('⚠️  Commerce data loading error, continuing without commerce data:', error);
        }
      }
      
      // Calculate reach from actual audience segments
      let totalReach = 0;
      let segmentCount = 0;
      const demographicData: any = {
        ageDistribution: {},
        incomeDistribution: {},
        educationDistribution: {},
        urbanRuralMix: {}
      };

      let usedFallbackMarkets = false;
      if (audiences.segments && audiences.segments.length > 0) {
        console.log(`   Analyzing ${audiences.segments.length} audience segments...`);
        
        // Calculate reach from segments
        // IMPORTANT: We use MAX reach instead of SUM to avoid double-counting overlapping audiences
        // Multiple fitness/athletic segments will have significant overlap
        let maxReach = 0;
        const segmentReaches: Array<{name: string, reach: number}> = [];
        
        for (const enrichedSegment of audiences.segments) {
          // Segments come back enriched - unwrap to get the actual segment data
          const segment = enrichedSegment.segment || enrichedSegment;
          
          // Try different property names for scale data
          const scale = segment.scale7DayUS || segment['scale_7day_us'] || segment.scale || 0;
          if (scale > 0) {
            segmentReaches.push({
              name: segment.segmentName || segment.name,
              reach: scale
            });
            maxReach = Math.max(maxReach, scale);
            segmentCount++;
            console.log(`   ${segment.segmentName || segment.name}: ${(scale / 1000000).toFixed(1)}M reach`);
          } else {
            // If no scale property, log the segment structure for debugging
            if (segmentCount === 0) {
              console.log(`   Debug - Enriched segment has 'segment' property:`, !!enrichedSegment.segment);
              console.log(`   Debug - Sample properties:`, Object.keys(segment).slice(0, 10).join(', '));
            }
          }
        }
        
        // Use max reach as the base, then add 20% for each additional top segment (capped at 50% increase)
        // This accounts for some incremental reach from complementary segments without massive double-counting
        if (segmentReaches.length > 1) {
          const topSegments = segmentReaches.sort((a, b) => b.reach - a.reach).slice(0, 5);
          if (topSegments[0]) {
            totalReach = topSegments[0].reach; // Start with largest segment
            
            // Add incremental reach from other top segments (diminishing returns)
            for (let i = 1; i < topSegments.length; i++) {
              const segment = topSegments[i];
              if (segment) {
                const incrementalPct = 0.15 / i; // 15% for 2nd segment, 7.5% for 3rd, 5% for 4th, etc.
                totalReach += segment.reach * incrementalPct;
              }
            }
          }
          
          console.log(`   📊 Using max reach model: ${(maxReach / 1000000).toFixed(1)}M base + incremental from top segments`);
          console.log(`   📈 Adjusted reach: ${(totalReach / 1000000).toFixed(1)}M (vs ${(segmentReaches.reduce((sum, s) => sum + s.reach, 0) / 1000000).toFixed(1)}M if summed)`);
        } else {
          totalReach = maxReach;
        }

        // Get demographic insights from top 3 segments using commerce data
        const topSegments = audiences.segments.slice(0, 3); // Reduced to 3 for performance
        console.log(`   Gathering demographics from ${topSegments.length} top segments...`);
        
        for (const enrichedSegment of topSegments) {
          // Unwrap enriched segment to get actual segment data (outside try for catch block access)
          const segment = enrichedSegment.segment || enrichedSegment;
          const segmentName = segment.segmentName || segment.name;
          if (!segmentName) continue;

          try {
            console.log(`   Analyzing demographics for: ${segmentName}`);

            // Get top ZIPs for this segment
            const audienceData = commerceAudienceService.searchZipCodesByAudience(segmentName, 50);
            
            if (!audienceData || audienceData.length === 0) {
              console.log(`   No data for ${segmentName}`);
              continue;
            }

            // Get census data for these ZIPs
            const zipCodes = audienceData.slice(0, 30).map((item: any) => item.zipCode);
            const censusDataArray = await this.censusDataService.getZipCodeData(zipCodes);
            
            // Aggregate weighted demographics
            let totalWeight = 0;
            const ageGroups: { [key: string]: number } = {};
            const incomeGroups: { [key: string]: number } = {};
            const educationGroups: { [key: string]: number } = {};

            for (const item of audienceData.slice(0, 30)) {
              const census = censusDataArray.find(c => c.zipCode === item.zipCode);
              if (!census || !census.population) continue;

              const weight = item.weight;
              totalWeight += weight;

              // Age distribution (from median age)
              if (census.demographics?.ageMedian) {
                const ageGroup = this.getAgeGroup(census.demographics.ageMedian);
                ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + weight;
              }

              // Income distribution
              if (census.economics?.householdIncome?.median) {
                const incomeGroup = this.getIncomeGroup(census.economics.householdIncome.median);
                incomeGroups[incomeGroup] = (incomeGroups[incomeGroup] || 0) + weight;
              }

              // Education (bachelor's + graduate degree percentages)
              if (census.demographics?.education) {
                const bachelorsPct = (census.demographics.education.bachelorDegree || 0) + 
                                    (census.demographics.education.graduateDegree || 0);
                const eduGroup = bachelorsPct > 50 ? "Bachelor's or higher" : 
                                bachelorsPct > 25 ? "Some college" : "High school or less";
                educationGroups[eduGroup] = (educationGroups[eduGroup] || 0) + weight;
              }
            }

            // Convert to percentages and aggregate
            if (totalWeight > 0) {
              for (const group in ageGroups) {
                const value = ageGroups[group];
                if (value !== undefined) {
                  const percentage = (value / totalWeight) * 100;
                  demographicData.ageDistribution[group] = 
                    (demographicData.ageDistribution[group] || 0) + percentage;
                }
              }
              for (const group in incomeGroups) {
                const value = incomeGroups[group];
                if (value !== undefined) {
                  const percentage = (value / totalWeight) * 100;
                  demographicData.incomeDistribution[group] = 
                    (demographicData.incomeDistribution[group] || 0) + percentage;
                }
              }
              for (const group in educationGroups) {
                const value = educationGroups[group];
                if (value !== undefined) {
                  const percentage = (value / totalWeight) * 100;
                  demographicData.educationDistribution[group] = 
                    (demographicData.educationDistribution[group] || 0) + percentage;
                }
              }
            }

          } catch (error) {
            console.warn(`⚠️ Could not fetch demographics for ${segment.segmentName}:`, error);
          }
        }

        // Average the demographic percentages across segments
        const segmentsAnalyzed = topSegments.length;
        if (segmentsAnalyzed > 0 && Object.keys(demographicData.ageDistribution).length > 0) {
          for (const key in demographicData.ageDistribution) {
            demographicData.ageDistribution[key] /= segmentsAnalyzed;
          }
          for (const key in demographicData.incomeDistribution) {
            demographicData.incomeDistribution[key] /= segmentsAnalyzed;
          }
          for (const key in demographicData.educationDistribution) {
            demographicData.educationDistribution[key] /= segmentsAnalyzed;
          }
          console.log(`   ✅ Demographics aggregated from ${segmentsAnalyzed} segments`);
        }
      }

      // If no audience data, use reasonable defaults
      if (totalReach === 0) {
        console.log('   No audience data available, using estimated market size');
        totalReach = 30000000; // 30M default
      }

      // Apply sanity caps to reach estimate to prevent unrealistic numbers
      const REACH_CAP = 120000000; // 120M upper bound for 7-day reach
      if (totalReach > REACH_CAP) {
        console.warn(`⚠️ Reach estimate ${totalReach.toLocaleString()} exceeds cap (${REACH_CAP.toLocaleString()}) - clamping to cap.`);
        totalReach = REACH_CAP;
      }
      
      // Calculate TAM as 2.5x reach estimate (standard market sizing ratio) and cap to avoid unrealistic totals
      let tam = Math.round(totalReach * 2.5);
      const TAM_CAP = 250000000; // 250M upper bound
      if (tam > TAM_CAP) {
        console.warn(`⚠️ TAM ${tam.toLocaleString()} exceeds cap (${TAM_CAP.toLocaleString()}) - clamping to cap.`);
        tam = TAM_CAP;
      }

      console.log(`✅ Market sizing calculated:`);
      console.log(`   Reach: ${(totalReach / 1000000).toFixed(1)}M (from ${segmentCount} segments)`);
      console.log(`   TAM: ${(tam / 1000000).toFixed(1)}M`);
      
      // Build comprehensive sizing result including AI data
      const sizing: any = {
        totalAddressableMarket: tam,
        reachEstimate: totalReach,
        demographicBreakdown: demographicData
      };
      
      // Merge AI-generated market sizing data if available
      if (aiMarketSizing) {
        sizing.aiGenerated = true;
        sizing.aiSummary = aiMarketSizing.aiResponse || `The ${aiMarketSizing.marketName || targetAudience} market represents a significant opportunity with ${aiMarketSizing.totalMarketSize || 'substantial'} total market size.`;
        sizing.totalMarketSize = aiMarketSizing.totalMarketSize;
        sizing.growthRate = aiMarketSizing.growthRate;
        sizing.addressableMarket = aiMarketSizing.addressableMarket;
        sizing.addressableValue = aiMarketSizing.addressableValue;
        sizing.growthTrends = aiMarketSizing.growthTrends;
        sizing.marketInsights = aiMarketSizing.marketInsights;
        sizing.advertisingImplications = aiMarketSizing.advertisingImplications;
        
        console.log(`   ✨ Enhanced with AI insights: ${sizing.totalMarketSize || 'N/A'} market, ${sizing.growthRate || 'N/A'} growth`);
      }
      
      this.emitProgress(progressCallback, 6, 'sizing', 'completed', `Market sizing: ${sizing.totalMarketSize || (totalReach / 1000000).toFixed(1) + 'M reach'}`, 72);
      return sizing;
    } catch (error) {
      console.error('❌ Market sizing failed:', error);
      // Return fallback values
      return {
        totalAddressableMarket: 50000000,
        reachEstimate: 0, // Don't use 30M default
        demographicBreakdown: {}
      };
    }
  }

  /**
   * Step 7: Analyze geographic distribution from actual audience data
   */
  private async analyzeGeographic(
    parsedBrief: ParsedBrief,
    audiences: { segments: any[]; count: number },
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<{ topMarkets: any[]; coverageMap: any }> {
    this.emitProgress(progressCallback, 7, 'geographic', 'in_progress', 'Analyzing geographic distribution...');
    console.log('🗺️ Analyzing geographic distribution from audience data...');

    try {
      // Ensure commerce data is loaded for geographic analysis
      if (!commerceAudienceService['isLoaded']) {
        console.log('   Loading commerce data for geographic analysis...');
        try {
          const loadResult = await commerceAudienceService.loadCommerceData();
          console.log(`   Commerce data loaded: ${loadResult.success} (${loadResult.message})`);
          if (!loadResult.success) {
            console.warn('⚠️  Geographic analysis may be limited without commerce data');
          }
        } catch (error) {
          console.error('❌ Commerce data loading failed:', error);
          console.warn('⚠️  Continuing without commerce data - geographic results will be limited');
        }
      }
      
      const topMarkets: any[] = [];
      const marketConcentrationMap: { [key: string]: number } = {};
      const cityDataMap: { [key: string]: any } = {}; // Store city metadata

      if (audiences.segments && audiences.segments.length > 0) {
        console.log(`   Analyzing geography for ${audiences.segments.length} audience segments...`);
        
        // Get top ZIPs for each audience segment using commerceAudienceService
        for (const enrichedSegment of audiences.segments.slice(0, 5)) { // Analyze top 5 segments for performance
          // Unwrap enriched segment to get actual segment data (outside try for catch block access)
          const segment = enrichedSegment.segment || enrichedSegment;
          const segmentName = segment.segmentName || segment.name;
          if (!segmentName) continue;

          try {
            console.log(`   Getting top ZIPs for: ${segmentName}`);
            
            // Get geographic distribution for this segment using commerce data
            const audienceData = commerceAudienceService.searchZipCodesByAudience(segmentName, 30);

            if (!audienceData || audienceData.length === 0) {
              console.log(`   No geo data found for ${segmentName}`);
              continue;
            }

            console.log(`   Found ${audienceData.length} ZIPs for ${segmentName}`);

            // Get census data for these ZIPs
            const zipCodes = audienceData.slice(0, 20).map((item: any) => item.zipCode);
            const censusDataArray = await this.censusDataService.getZipCodeData(zipCodes);
            const censusDataMap = new Map(censusDataArray.map(data => [data.zipCode, data]));

            // Calculate national baseline for over-indexing
            const totalSegmentWeight = audienceData.reduce((sum: any, item: any) => sum + item.weight, 0);
            const estimatedUSPopulation = 330000000;
            const nationalPenetration = totalSegmentWeight / estimatedUSPopulation;
            
            console.log(`   📊 National baseline: ${(nationalPenetration * 1000).toFixed(3)} per 1,000 people`);
            
            // Aggregate market data by city
            // Track urban/rural classifications for mode calculation
            const cityUrbanRuralMap: { [key: string]: { urban: number, suburban: number, rural: number } } = {};
            const cityWeightMap: { [key: string]: number } = {}; // Track total weight per city
            const cityPopulationMap: { [key: string]: number } = {}; // Track total population per city
            
            for (const item of audienceData.slice(0, 20)) {
              const censusData = censusDataMap.get(item.zipCode);
              if (!censusData || !censusData.population) continue;

              const city = censusData.geography?.city || 'Unknown';
              const state = censusData.geography?.state || 'Unknown';
              
              if (city === 'Unknown' || state === 'Unknown') continue;

              const marketKey = `${city}, ${state}`;
              
              // Aggregate weights and populations by city
              if (!cityDataMap[marketKey]) {
                cityDataMap[marketKey] = {
                  city,
                  state,
                  population: 0,
                  medianIncome: censusData.economics?.householdIncome?.median || 0,
                  urbanRural: 'suburban', // Will be calculated from mode
                  zipCodesCount: 0
                };
                cityUrbanRuralMap[marketKey] = { urban: 0, suburban: 0, rural: 0 };
                cityWeightMap[marketKey] = 0;
                cityPopulationMap[marketKey] = 0;
              }
              
              // Aggregate weight and population
              if (cityWeightMap[marketKey] !== undefined) {
                cityWeightMap[marketKey] += item.weight;
              }
              if (cityPopulationMap[marketKey] !== undefined) {
                cityPopulationMap[marketKey] += censusData.population;
              }
              if (cityDataMap[marketKey]) {
                cityDataMap[marketKey].zipCodesCount++;
              }
              
              // Track urban/rural classifications for mode calculation
              const urbanRuralType = (censusData.geography?.urbanRural || 'suburban').toLowerCase();
              const urbanRuralData = cityUrbanRuralMap[marketKey];
              if (urbanRuralData) {
                if (urbanRuralType === 'urban') {
                  urbanRuralData.urban++;
                } else if (urbanRuralType === 'rural') {
                  urbanRuralData.rural++;
                } else {
                  urbanRuralData.suburban++;
                }
              }
              
              // Update max income across ZIPs
              if (censusData.economics?.householdIncome?.median) {
                cityDataMap[marketKey].medianIncome = Math.max(
                  cityDataMap[marketKey].medianIncome,
                  censusData.economics.householdIncome.median
                );
              }
            }
            
            // Calculate over-index (concentration) for each city relative to national baseline
            for (const marketKey in cityWeightMap) {
              const totalWeight = cityWeightMap[marketKey];
              const totalPopulation = cityPopulationMap[marketKey];
              
              if (totalWeight !== undefined && totalPopulation !== undefined && totalPopulation > 0 && nationalPenetration > 0) {
                const cityPenetration = totalWeight / totalPopulation;
                const overIndex = cityPenetration / nationalPenetration;
                
                // Store as decimal (will be converted to percentage in report)
                // e.g., 1.5 = 150% (1.5x national average)
                marketConcentrationMap[marketKey] = overIndex;
                if (cityDataMap[marketKey]) {
                  cityDataMap[marketKey].population = totalPopulation;
                }
                
                console.log(`   📍 ${marketKey}: ${overIndex.toFixed(2)}x national average`);
              }
            }
            
            // Calculate mode (most common) urban/rural classification for each city
            for (const marketKey in cityUrbanRuralMap) {
              const counts = cityUrbanRuralMap[marketKey];
              if (counts && cityDataMap[marketKey]) {
                const maxCount = Math.max(counts.urban, counts.suburban, counts.rural);
                
                if (counts.urban === maxCount) {
                  cityDataMap[marketKey].urbanRural = 'urban';
                } else if (counts.rural === maxCount) {
                  cityDataMap[marketKey].urbanRural = 'rural';
                } else {
                  cityDataMap[marketKey].urbanRural = 'suburban';
                }
                
                console.log(`   🏙️ ${marketKey}: ${cityDataMap[marketKey].urbanRural} (${counts.urban}U/${counts.suburban}S/${counts.rural}R)`);
              }
            }
          } catch (error) {
            console.warn(`⚠️ Could not get geo data for segment ${segment.segmentName}:`, error);
          }
        }

        // Build markets array from aggregated data
        for (const marketKey in marketConcentrationMap) {
          const cityData = cityDataMap[marketKey];
          const overIndex = marketConcentrationMap[marketKey];
          if (!cityData || !cityData.zipCodesCount || overIndex === undefined) continue;
          
          // overIndex is already calculated as cityPenetration / nationalPenetration
          // e.g., 1.5 means 150% of national average (1.5x)
          // No need to divide by zipCodesCount anymore
          
          topMarkets.push({
            city: cityData.city,
            state: cityData.state,
            concentration: overIndex, // Already an over-index ratio
            population: cityData.population,
            medianIncome: cityData.medianIncome,
            urbanRural: cityData.urbanRural,
            zipCodesCount: cityData.zipCodesCount,
            opportunityScore: 0 // Will be calculated below
          });
        }

        // Apply sanity filters to topMarkets
        const MAX_CONCENTRATION = 6.0; // 600% (6x national average)
        for (const market of topMarkets) {
          if (market.concentration > MAX_CONCENTRATION) {
            console.warn(`⚠️ Market ${market.city}, ${market.state} concentration ${market.concentration.toFixed(2)}x exceeds cap (${MAX_CONCENTRATION}x) - clamping.`);
            market.concentration = MAX_CONCENTRATION;
          }

          // Validate urban/rural classification for major metros
          const normalizedCity = `${market.city}, ${market.state}`.toLowerCase();
          const majorMetroOverrides: Record<string, 'urban' | 'suburban'> = {
            'new york, new york': 'urban',
            'chicago, illinois': 'urban',
            'los angeles, california': 'urban',
            'san francisco, california': 'urban',
            'boston, massachusetts': 'urban',
            'seattle, washington': 'urban',
            'washington, district of columbia': 'urban',
            'brooklyn, new york': 'urban',
            'jersey city, new jersey': 'urban'
          };

          if (majorMetroOverrides[normalizedCity]) {
            const expected = majorMetroOverrides[normalizedCity];
            if (market.urbanRural !== expected) {
              console.warn(`⚠️ Market ${market.city}, ${market.state} classified as ${market.urbanRural}, overriding to ${expected}.`);
              market.urbanRural = expected;
            }
          }
        }

        // Calculate opportunity scores and sort
        for (const market of topMarkets) {
          market.opportunityScore = this.calculateOpportunityScore(market);
        }

        // Sort by opportunity score (combination of concentration and population)
        topMarkets.sort((a, b) => b.opportunityScore - a.opportunityScore);
        
        console.log(`✅ Geographic analysis complete: ${topMarkets.length} markets identified`);
        if (topMarkets.length > 0) {
          console.log(`   Top market: ${topMarkets[0].city}, ${topMarkets[0].state} (score: ${topMarkets[0].opportunityScore.toFixed(2)}, conc: ${(topMarkets[0].concentration * 100).toFixed(2)}%)`);
        }
      } else {
        console.log('   No audience segments available for geographic analysis');
      }

      let usedFallbackMarkets = false;
      if (topMarkets.length === 0) {
        console.warn('⚠️ No geographic markets identified from data - using intelligent fallback markets.');
        const fallbackMarkets = this.generateFallbackMarkets(parsedBrief);
        fallbackMarkets.forEach(market => {
          market.opportunityScore = this.calculateOpportunityScore(market);
        });
        topMarkets.push(...fallbackMarkets);
        usedFallbackMarkets = true;
      }

      const geographic = {
        topMarkets: topMarkets.slice(0, 15), // Return top 15 markets
        coverageMap: {
          totalMarkets: topMarkets.length,
          geographicFocus: parsedBrief.geographicFocus || 'US National',
          note: usedFallbackMarkets
            ? 'Fallback market set based on audience archetype and national performance patterns'
            : 'Markets ranked by opportunity score (concentration × population)'
        }
      };
      
      this.emitProgress(progressCallback, 7, 'geographic', 'completed', `Identified ${topMarkets.length} key markets`, 80);
      return geographic;
    } catch (error) {
      console.error('❌ Geographic analysis failed:', error);
      console.error('   Error details:', (error as any).stack);
      return { 
        topMarkets: [], 
        coverageMap: { 
          note: 'Geographic targeting available at ZIP code level',
          geographicFocus: parsedBrief.geographicFocus || 'US National'
        } 
      };
    }
  }

  /**
   * Calculate opportunity score for a market
   * Combines concentration (audience density) with population (market size)
   */
  private calculateOpportunityScore(market: any): number {
    const concentrationScore = market.concentration || 0;
    const populationScore = Math.log10(market.population || 10000) / 6; // Normalize to 0-1 scale
    const incomeBoost = market.medianIncome > 75000 ? 1.2 : 1.0; // Boost for high-income markets
    
    // Weighted formula: 70% concentration, 30% population, with income boost
    return (concentrationScore * 0.7 + populationScore * 0.3) * incomeBoost;
  }

  /**
   * Provide sensible fallback markets when real geo data is unavailable
   */
  private generateFallbackMarkets(parsedBrief: ParsedBrief): any[] {
    const audiencesText = (parsedBrief.targetAudiences || []).join(' ').toLowerCase();
    const contextText = `${parsedBrief.additionalContext || ''}`.toLowerCase();

    const isSportsCampaign = /sport|basketball|athlet|fitness|gym|active|runner/.test(audiencesText + contextText);
    const isTravelCampaign = /travel|airline|hotel|tourism|vacation/.test(audiencesText + contextText);
    const isLuxuryCampaign = /luxury|premium|affluent|wealth|fashion|designer/.test(audiencesText + contextText);

    const sportsMarkets = [
      { city: 'New York', state: 'NY', concentration: 1.35, population: 8400000, medianIncome: 82000, urbanRural: 'urban', zipCodesCount: 25 },
      { city: 'Los Angeles', state: 'CA', concentration: 1.30, population: 3900000, medianIncome: 76000, urbanRural: 'urban', zipCodesCount: 20 },
      { city: 'Chicago', state: 'IL', concentration: 1.28, population: 2700000, medianIncome: 72000, urbanRural: 'urban', zipCodesCount: 15 },
      { city: 'Dallas', state: 'TX', concentration: 1.22, population: 1350000, medianIncome: 72000, urbanRural: 'urban', zipCodesCount: 12 },
      { city: 'Atlanta', state: 'GA', concentration: 1.24, population: 500000, medianIncome: 71000, urbanRural: 'urban', zipCodesCount: 10 },
      { city: 'Miami', state: 'FL', concentration: 1.20, population: 470000, medianIncome: 68000, urbanRural: 'urban', zipCodesCount: 9 }
    ];

    const travelMarkets = [
      { city: 'New York', state: 'NY', concentration: 1.32, population: 8400000, medianIncome: 82000, urbanRural: 'urban', zipCodesCount: 25 },
      { city: 'Los Angeles', state: 'CA', concentration: 1.25, population: 3900000, medianIncome: 76000, urbanRural: 'urban', zipCodesCount: 20 },
      { city: 'Chicago', state: 'IL', concentration: 1.18, population: 2700000, medianIncome: 72000, urbanRural: 'urban', zipCodesCount: 15 },
      { city: 'San Francisco', state: 'CA', concentration: 1.22, population: 880000, medianIncome: 112000, urbanRural: 'urban', zipCodesCount: 8 },
      { city: 'Seattle', state: 'WA', concentration: 1.16, population: 760000, medianIncome: 97000, urbanRural: 'urban', zipCodesCount: 8 },
      { city: 'Denver', state: 'CO', concentration: 1.14, population: 720000, medianIncome: 82000, urbanRural: 'urban', zipCodesCount: 7 }
    ];

    const luxuryMarkets = [
      { city: 'New York', state: 'NY', concentration: 1.40, population: 8400000, medianIncome: 82000, urbanRural: 'urban', zipCodesCount: 25 },
      { city: 'Los Angeles', state: 'CA', concentration: 1.32, population: 3900000, medianIncome: 76000, urbanRural: 'urban', zipCodesCount: 20 },
      { city: 'San Francisco', state: 'CA', concentration: 1.28, population: 880000, medianIncome: 112000, urbanRural: 'urban', zipCodesCount: 9 },
      { city: 'Chicago', state: 'IL', concentration: 1.20, population: 2700000, medianIncome: 72000, urbanRural: 'urban', zipCodesCount: 15 },
      { city: 'Dallas', state: 'TX', concentration: 1.18, population: 1350000, medianIncome: 82000, urbanRural: 'urban', zipCodesCount: 12 },
      { city: 'Boston', state: 'MA', concentration: 1.22, population: 690000, medianIncome: 89000, urbanRural: 'urban', zipCodesCount: 8 }
    ];

    const generalMarkets = [
      { city: 'New York', state: 'NY', concentration: 1.28, population: 8400000, medianIncome: 82000, urbanRural: 'urban', zipCodesCount: 25 },
      { city: 'Los Angeles', state: 'CA', concentration: 1.24, population: 3900000, medianIncome: 76000, urbanRural: 'urban', zipCodesCount: 20 },
      { city: 'Chicago', state: 'IL', concentration: 1.20, population: 2700000, medianIncome: 72000, urbanRural: 'urban', zipCodesCount: 15 },
      { city: 'Dallas', state: 'TX', concentration: 1.16, population: 1350000, medianIncome: 72000, urbanRural: 'urban', zipCodesCount: 12 },
      { city: 'Atlanta', state: 'GA', concentration: 1.14, population: 500000, medianIncome: 71000, urbanRural: 'urban', zipCodesCount: 10 },
      { city: 'Seattle', state: 'WA', concentration: 1.12, population: 760000, medianIncome: 97000, urbanRural: 'urban', zipCodesCount: 9 }
    ];

    let selectedMarkets = generalMarkets;
    if (isSportsCampaign) {
      selectedMarkets = sportsMarkets;
    } else if (isTravelCampaign) {
      selectedMarkets = travelMarkets;
    } else if (isLuxuryCampaign) {
      selectedMarkets = luxuryMarkets;
    }

    return selectedMarkets.map(market => ({
      ...market
    }));
  }

  /**
   * Group median age into age ranges
   */
  private getAgeGroup(medianAge: number): string {
    if (medianAge < 25) return '18-24';
    if (medianAge < 35) return '25-34';
    if (medianAge < 45) return '35-44';
    if (medianAge < 55) return '45-54';
    if (medianAge < 65) return '55-64';
    return '65+';
  }

  /**
   * Group household income into income ranges
   */
  private getIncomeGroup(income: number): string {
    if (income < 35000) return 'Under $35K';
    if (income < 50000) return '$35K-$50K';
    if (income < 75000) return '$50K-$75K';
    if (income < 100000) return '$75K-$100K';
    if (income < 150000) return '$100K-$150K';
    return '$150K+';
  }

  /**
   * Step 8: Build SWOT analysis (Enhanced with AI competitive intelligence and strategy cards)
   */
  private async buildSWOT(
    parsedBrief: ParsedBrief,
    strategy: any,
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<{ strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] }> {
    this.emitProgress(progressCallback, 8, 'swot', 'in_progress', 'Building SWOT analysis...');
    console.log('📋 Building AI-enhanced SWOT analysis...');

    try {
      // Try to fetch Marketing SWOT card for this company first
      let swotFromCard: any = null;
      let swotResult: any = null;
      try {
        console.log(`   🔍 Searching for Marketing SWOT card for "${parsedBrief.advertiserName}"...`);
        swotResult = await this.geminiService.generateMarketingSWOT(parsedBrief.advertiserName);
        
        if (swotResult && swotResult.swot) {
          swotFromCard = swotResult.swot;
          console.log(`   ✅ Found Marketing SWOT card with ${swotFromCard.strengths?.length || 0} strengths`);
        }
      } catch (error) {
        console.log(`   ⚠️ Could not fetch Marketing SWOT card:`, error);
      }
      
      // If we have SWOT card data, use it as the primary source - preserve full structure
      if (swotFromCard) {
        // Preserve the full SWOT structure with titles and descriptions
        const swot: any = {
          strengths: swotFromCard.strengths?.slice(0, 5) || [],
          weaknesses: swotFromCard.weaknesses?.slice(0, 5) || [],
          opportunities: swotFromCard.opportunities?.slice(0, 5) || [],
          threats: swotFromCard.threats?.slice(0, 5) || [],
          summary: swotResult?.summary || undefined,
          recommendedActions: swotResult?.recommendedActions || undefined
        };
        
        // Augment with strategy insights if available
        if (strategy && strategy.isAIGenerated) {
          console.log('   ✨ Augmenting Marketing SWOT card with competitive strategy insights...');
          
          // Add top differentiator to Opportunities if not already present
          if (strategy.differentiators && strategy.differentiators.length > 0) {
            const topDiff = strategy.differentiators[0]?.split(':')[0]?.trim();
            const diffExists = swot.opportunities.some((o: any) => {
              const text = typeof o === 'string' ? o : (o.title || '');
              return text.includes(topDiff);
            });
            if (topDiff && !diffExists) {
              swot.opportunities.push({
                title: 'Market Differentiation',
                description: topDiff
              });
            }
          }
          
          // Add top competitor as threat if not already present
          if (strategy.competitors && strategy.competitors.length > 0) {
            const threatExists = swot.threats.some((t: any) => {
              const text = typeof t === 'string' ? t : (t.title || '');
              return text.includes('competitive pressure');
            });
            if (!threatExists) {
              swot.threats.push({
                title: 'Competitive Pressure',
                description: 'Intense competition from both established brands and new market entrants'
              });
            }
          }
        }
        
        this.emitProgress(progressCallback, 8, 'swot', 'completed', 'SWOT analysis complete (using Marketing SWOT card)', 87);
        return swot;
      }
      
      // Fallback: Start with rule-based contextual SWOT
      const baseSWOT = this.generateContextualSWOT(parsedBrief);
      
      // Augment with AI competitive intelligence if available
      if (strategy && strategy.isAIGenerated) {
        console.log('   ✅ Augmenting contextual SWOT with AI competitive insights...');
        
        // Add differentiation opportunities to Opportunities
        if (strategy.differentiators && strategy.differentiators.length > 0) {
          strategy.differentiators.slice(0, 2).forEach((diff: string) => {
            const parts = diff.split(':');
            const simplified = (parts[0] || diff).trim(); // Extract key point
            if (!baseSWOT.opportunities.some(o => o.includes(simplified))) {
              baseSWOT.opportunities.push(`Market differentiation: ${simplified}`);
            }
          });
        }
        
        // Add messaging gaps as Opportunities
        if (strategy.messagingGaps && strategy.messagingGaps.length > 0) {
          strategy.messagingGaps.slice(0, 1).forEach((gap: string) => {
            baseSWOT.opportunities.push(`Messaging opportunity: ${gap}`);
          });
        }
        
        // Extract competitive threats from competitor positioning
        if (strategy.competitors && strategy.competitors.length > 0) {
          const topCompetitor = strategy.competitors[0].split(' - ')[0];
          baseSWOT.threats.unshift(`Strong competition from ${topCompetitor} and established market leaders`);
        }
        
        // Add strategic recommendations as Strengths (if they align)
        if (strategy.strategicRecommendations?.positioning) {
          const recommendation = strategy.strategicRecommendations.positioning[0];
          if (recommendation) {
            baseSWOT.strengths.push(`Strategic positioning: ${recommendation}`);
          }
        }
        
        console.log(`   ✨ SWOT enhanced with ${strategy.differentiators?.length || 0} differentiators`);
      }
      
      this.emitProgress(progressCallback, 8, 'swot', 'completed', 'SWOT analysis complete', 87);
      return baseSWOT;
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
   * Generate AI-powered competitive intelligence with caching
   */
  private async generateAICompetitiveIntelligence(
    parsedBrief: ParsedBrief
  ): Promise<any | null> {
    try {
      // Check cache first
      const cached = await this.getCachedCompetitiveIntelligence(parsedBrief);
      if (cached) {
        return cached;
      }

      console.log('🤖 Generating AI competitive intelligence...');
      
      // Build query for Gemini
      const query = parsedBrief.advertiserName 
        ? `${parsedBrief.advertiserName} in ${parsedBrief.industry || 'their industry'}`
        : `${parsedBrief.industry || 'the industry'} for ${parsedBrief.keyProducts?.join(', ') || 'these products'}`;

      // Call Gemini for competitive intelligence
      const aiResponse = await this.geminiService.generateCompetitiveIntelligence(query);
      
      if (aiResponse.success && aiResponse.data) {
        const intelligence = {
          competitors: aiResponse.data.competitiveAnalysis?.mainCompetitors?.map((c: any) => 
            `${c.name} - ${c.positioning}`) || [],
          differentiators: aiResponse.data.competitiveAnalysis?.differentiationOpportunities || [],
          messagingGaps: aiResponse.data.messagingAnalysis?.messagingGaps || [],
          commonThemes: aiResponse.data.messagingAnalysis?.commonThemes || [],
          strategicRecommendations: aiResponse.data.strategicRecommendations || {},
          sources: aiResponse.data.sources || []
        };

        // Cache the result
        await this.cacheCompetitiveIntelligence(parsedBrief, intelligence);
        
        console.log(`✅ AI competitive intelligence generated:`);
        console.log(`   Competitors: ${intelligence.competitors.length}`);
        console.log(`   Differentiators: ${intelligence.differentiators.length}`);
        
        return intelligence;
      }

      return null;
    } catch (error) {
      console.warn('⚠️ AI competitive intelligence failed:', error);
      return null;
    }
  }

  /**
   * Generate strategic insights (Enhanced with AI competitive intelligence)
   * Includes: competitors, differentiators, market tiers, dayparting
   */
  private async generateStrategyInsights(
    parsedBrief: ParsedBrief,
    progressCallback: (update: ProgressUpdate) => void
  ): Promise<any> {
    console.log('🎯 Generating strategic insights...');
    
    try {
      // PRIORITY 1: Try AI competitive intelligence first (with caching)
      let competitorAnalysis;
      const aiIntelligence = await this.generateAICompetitiveIntelligence(parsedBrief);
      
      if (aiIntelligence) {
        // Use AI-generated insights
        console.log('✅ Using AI competitive intelligence');
        competitorAnalysis = {
          competitors: aiIntelligence.competitors,
          differentiators: aiIntelligence.differentiators,
          messagingGaps: aiIntelligence.messagingGaps,
          strategicRecommendations: aiIntelligence.strategicRecommendations,
          isAIGenerated: true
        };
      } else {
        // PRIORITY 2: Fallback to rule-based competitors from hardcoded lists
        console.log('⚠️ Falling back to rule-based competitive analysis');
        const rulebased = this.strategyGenerator.generateCompetitorAnalysis(parsedBrief);
        competitorAnalysis = {
          competitors: rulebased.competitors,
          differentiators: rulebased.differentiators,
          isAIGenerated: false
        };
      }
      
      // Generate other strategic components (fast, no API calls)
      const marketTiers = this.strategyGenerator.generateMarketTiers(parsedBrief);
      const dayparting = this.strategyGenerator.generateDayparting(parsedBrief);
      
      const strategy = {
        ...competitorAnalysis,
        marketTiers,
        dayparting
      };
      
      console.log(`✅ Strategic insights generated:`);
      console.log(`   Competitors: ${strategy.competitors.length} (AI: ${strategy.isAIGenerated})`);
      console.log(`   Differentiators: ${strategy.differentiators.length}`);
      console.log(`   Tier 1 markets: ${strategy.marketTiers.tier1.length}`);
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
   * Extract budget information from brief text (normalized string + numeric approximation)
   */
  private extractBudgetInfo(text: string): { formatted: string; approxValue: number; note?: string } | undefined {
    if (!text) return undefined;

    const normalized = text.replace(/[\u2013\u2014]/g, '-');
    const budgetKeywords = /(budget|media spend|ad spend|spend|investment|allocation|marketing spend|budgeted)/i;

    const candidateSentences = normalized
      .split(/[\.\n]/)
      .map(sentence => sentence.trim())
      .filter(sentence => budgetKeywords.test(sentence));

    const blocks = candidateSentences.length > 0 ? candidateSentences : [normalized];

    for (const block of blocks) {
      const parsed = this.parseBudgetBlock(block);
      if (parsed) {
        return parsed;
      }
    }

    return undefined;
  }

  private parseBudgetBlock(block: string): { formatted: string; approxValue: number; note?: string } | undefined {
    const rangePatterns = [
      /\$?\s*([\d,.]+)\s*(k|m|b|bn|thousand|million|billion)?\s*(?:-|–|—|to|through|and)\s*\$?\s*([\d,.]+)\s*(k|m|b|bn|thousand|million|billion)?/i,
      /between\s+\$?\s*([\d,.]+)\s*(k|m|b|bn|thousand|million|billion)?\s+(?:and|to)\s+\$?\s*([\d,.]+)\s*(k|m|b|bn|thousand|million|billion)?/i
    ];

    for (const pattern of rangePatterns) {
      const match = block.match(pattern);
      if (match && match[1] && match[3]) {
        const min = this.parseBudgetAmount(match[1], match[2]);
        const max = this.parseBudgetAmount(match[3], match[4]);
        if (isFinite(min) && isFinite(max) && max >= min) {
          const formatted = `${this.formatBudget(min)}-${this.formatBudget(max)}`;
          return {
            formatted,
            approxValue: (min + max) / 2
          };
        }
      }
    }

    const upToMatch = block.match(/up to\s+\$?\s*([\d,.]+)\s*(k|m|b|bn|thousand|million|billion)?/i);
    if (upToMatch && upToMatch[1]) {
      const max = this.parseBudgetAmount(upToMatch[1], upToMatch[2]);
      if (isFinite(max)) {
        return {
          formatted: `Up to ${this.formatBudget(max)}`,
          approxValue: max / 2,
          note: 'up_to'
        };
      }
    }

    const plusMatch = block.match(/\$?\s*([\d,.]+)\s*(k|m|b|bn|thousand|million|billion)?\s*(\+|plus|or more|minimum|min)/i);
    if (plusMatch && plusMatch[1]) {
      const value = this.parseBudgetAmount(plusMatch[1], plusMatch[2]);
      if (isFinite(value)) {
        const formatted = `${this.formatBudget(value)}+`;
        return {
          formatted,
          approxValue: value,
          note: 'minimum'
        };
      }
    }

    const singleMatch = block.match(/\$?\s*([\d,.]+(?:\.\d{1,2})?)\s*(k|m|b|bn|thousand|million|billion)?/i);
    if (singleMatch && singleMatch[1]) {
      const value = this.parseBudgetAmount(singleMatch[1], singleMatch[2]);
      if (isFinite(value)) {
        return {
          formatted: this.formatBudget(value),
          approxValue: value
        };
      }
    }

    return undefined;
  }

  private parseBudgetAmount(numStr: string, multiplier?: string): number {
    const cleaned = numStr.replace(/,/g, '');
    let value = parseFloat(cleaned);
    if (isNaN(value)) return NaN;

    const mult = multiplier?.toLowerCase();
    if (!mult) return value;

    if (['k', 'thousand'].includes(mult)) {
      value *= 1_000;
    } else if (['m', 'million'].includes(mult)) {
      value *= 1_000_000;
    } else if (['b', 'bn', 'billion'].includes(mult)) {
      value *= 1_000_000_000;
    }

    return value;
  }

  private formatBudget(amount: number): string {
    if (!isFinite(amount) || amount <= 0) return '$0';
    if (amount >= 1_000_000_000) {
      const billions = amount / 1_000_000_000;
      return `$${billions % 1 === 0 ? billions.toFixed(0) : billions.toFixed(1)}B`;
    }
    if (amount >= 1_000_000) {
      const millions = amount / 1_000_000;
      return `$${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      const thousands = amount / 1_000;
      return `$${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
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

  /**
   * ============================================================================
   * CAMPAIGN INTELLIGENCE CACHE METHODS
   * ============================================================================
   */

  /**
   * Generate cache key for campaign intelligence
   */
  private generateCacheKey(parsedBrief: ParsedBrief): string {
    const keyComponents = [
      parsedBrief.advertiserName || 'unknown',
      parsedBrief.industry || 'general',
      (parsedBrief.keyProducts || []).slice(0, 3).join(','),
      (parsedBrief.campaignObjectives || []).slice(0, 2).join(',')
    ].join('|').toLowerCase();

    return crypto.createHash('md5').update(keyComponents).digest('hex');
  }

  /**
   * Get cached competitive intelligence
   */
  private async getCachedCompetitiveIntelligence(parsedBrief: ParsedBrief): Promise<any | null> {
    try {
      const useSupabase = process.env.USE_SUPABASE === 'true';
      if (!useSupabase) return null;

      const cacheKey = this.generateCacheKey(parsedBrief);
      const supabase = SupabaseService.getClient();

      const { data, error } = await supabase
        .from('campaign_intelligence_cache')
        .select('competitive_intelligence, expires_at')
        .eq('cache_key', cacheKey)
        .single();

      if (error || !data) {
        return null;
      }

      // Check if cache has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        console.log('⏰ Campaign intelligence cache expired');
        return null;
      }

      console.log('✅ Using cached competitive intelligence');
      return data.competitive_intelligence;
    } catch (error) {
      console.warn('⚠️ Error fetching cached competitive intelligence:', error);
      return null;
    }
  }

  /**
   * Save competitive intelligence to cache
   */
  private async cacheCompetitiveIntelligence(
    parsedBrief: ParsedBrief,
    intelligence: any
  ): Promise<void> {
    try {
      const useSupabase = process.env.USE_SUPABASE === 'true';
      if (!useSupabase) return;

      const cacheKey = this.generateCacheKey(parsedBrief);
      const supabase = SupabaseService.getClient();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await supabase
        .from('campaign_intelligence_cache')
        .upsert({
          cache_key: cacheKey,
          advertiser_name: parsedBrief.advertiserName || 'Unknown',
          industry: parsedBrief.industry || 'General',
          products: parsedBrief.keyProducts || [],
          objectives: parsedBrief.campaignObjectives || [],
          competitive_intelligence: intelligence,
          expires_at: expiresAt.toISOString()
        }, { onConflict: 'cache_key' });

      console.log('💾 Cached competitive intelligence (24h TTL)');
    } catch (error) {
      console.warn('⚠️ Error caching competitive intelligence:', error);
    }
  }
}

