import { Request, Response } from 'express';
import { AppsScriptService } from '../services/appsScriptService';
import { GeminiService, GeminiSearchResult } from '../services/geminiService';
import { EmbeddingService } from '../services/embeddingService';
import { HybridSearchService } from '../services/hybridSearchService';
import { PersonaService } from '../services/personaService';
import { CensusDataService } from '../services/censusDataService';
import { commerceAudienceService } from '../services/commerceAudienceService';
import { audienceGeoAnalysisService } from '../services/audienceGeoAnalysisService';
import { audienceInsightsService } from '../services/audienceInsightsService';
import { coachingService } from '../services/coachingService';
import { Deal, DealFilters, SearchResult, CustomDealRequest } from '../types/deal';
import { CensusQueryFilters } from '../types/censusData';

export class DealsController {
  private appsScriptService: AppsScriptService;
  private geminiService: GeminiService | null = null;
  private embeddingService: EmbeddingService | null = null;
  private hybridSearchService: HybridSearchService | null = null;
  private personaService: PersonaService;
  private censusDataService: CensusDataService;

  constructor() {
    this.appsScriptService = new AppsScriptService();
    this.personaService = new PersonaService();
    this.censusDataService = new CensusDataService();
    
    // Initialize Gemini service only if API key is available
    try {
      // Initialize Gemini with Supabase if available for RAG support
      const supabase = process.env.USE_SUPABASE === 'true' ? require('../services/supabaseService').SupabaseService.getClient() : null;
      this.geminiService = new GeminiService(supabase);
      console.log('✅ Gemini AI service initialized');
    } catch (error) {
      console.log('⚠️  Gemini AI service not available (missing API key)');
      this.geminiService = null;
    }

    // Initialize embedding service
    try {
      this.embeddingService = new EmbeddingService();
      this.hybridSearchService = new HybridSearchService(this.embeddingService, this.geminiService || undefined);
      console.log('✅ Vector embeddings service initialized');
    } catch (error) {
      console.log('⚠️  Vector embeddings service not available:', error);
      this.embeddingService = null;
      this.hybridSearchService = null;
    }
  }

  /**
   * Get all deals (internal method for other controllers)
   */
  async getAllDeals(): Promise<Deal[]> {
    try {
      return await this.appsScriptService.getAllDeals();
    } catch (error) {
      console.error('Error fetching all deals:', error);
      return [];
    }
  }

  /**
   * Get all deals with optional filtering and pagination
   */
  async getDeals(req: Request, res: Response): Promise<void> {
    try {
      const filters: DealFilters = {
        search: req.query.search as string,
        targeting: req.query.targeting as string,
        environment: req.query.environment as string,
        mediaType: req.query.mediaType as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 1000 // Return all deals by default
      };

      // Parse date range if provided
      if (req.query.dateStart || req.query.dateEnd) {
        filters.dateRange = {
          start: req.query.dateStart as string,
          end: req.query.dateEnd as string
        };
      }

      let allDeals: Deal[] = [];
      
      try {
        allDeals = await this.appsScriptService.getAllDeals();
      } catch (error) {
        console.error('❌ Apps Script service unavailable:', error instanceof Error ? error.message : 'Unknown error');
        // Don't fallback to sample deals - require real Apps Script integration
        res.status(503).json({
          error: 'Deals service unavailable',
          message: 'Real deals require Apps Script configuration. Please configure GOOGLE_APPS_SCRIPT_URL.',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
        return;
      }
      
      const filteredDeals = this.filterDeals(allDeals, filters);
      
      // Pagination
      const total = filteredDeals.length;
      const totalPages = Math.ceil(total / filters.limit!);
      const startIndex = (filters.page! - 1) * filters.limit!;
      const endIndex = startIndex + filters.limit!;
      const paginatedDeals = filteredDeals.slice(startIndex, endIndex);

      const result: SearchResult = {
        deals: paginatedDeals,
        total,
        page: filters.page!,
        limit: filters.limit!,
        totalPages
      };

      res.json(result);
    } catch (error) {
      console.error('Error fetching deals:', error);
      res.status(500).json({ 
        error: 'Failed to fetch deals',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a specific deal by ID
   */
  async getDealById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Deal ID is required' });
        return;
      }

      const deal = await this.appsScriptService.getDealById(id);

      if (!deal) {
        res.status(404).json({ error: 'Deal not found' });
        return;
      }

      res.json(deal);
    } catch (error) {
      console.error('Error fetching deal:', error);
      res.status(500).json({ 
        error: 'Failed to fetch deal',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create a new deal
   */
  async createDeal(req: Request, res: Response): Promise<void> {
    try {
      const dealData = req.body;
      
      // Validate required fields
      const requiredFields = ['dealName', 'dealId', 'description', 'targeting', 'environment', 'mediaType', 'flightDate'];
      const missingFields = requiredFields.filter(field => !dealData[field]);
      
      if (missingFields.length > 0) {
        res.status(400).json({ 
          error: 'Missing required fields',
          missingFields 
        });
        return;
      }

      const newDeal = await this.appsScriptService.addDeal(dealData);
      res.status(201).json(newDeal);
    } catch (error) {
      console.error('Error creating deal:', error);
      res.status(500).json({ 
        error: 'Failed to create deal',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update an existing deal
   */
  async updateDeal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!id) {
        res.status(400).json({ error: 'Deal ID is required' });
        return;
      }

      const updatedDeal = await this.appsScriptService.updateDeal(id, updates);
      
      if (!updatedDeal) {
        res.status(404).json({ error: 'Deal not found' });
        return;
      }

      res.json(updatedDeal);
    } catch (error) {
      console.error('Error updating deal:', error);
      res.status(500).json({ 
        error: 'Failed to update deal',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Submit a custom deal request
   */
  async submitCustomDealRequest(req: Request, res: Response): Promise<void> {
    try {
      const requestData: CustomDealRequest = req.body;
      
      // Validate required fields
      const requiredFields = ['companyName', 'contactEmail', 'campaignObjectives', 'targetAudience'];
      const missingFields = requiredFields.filter(field => !requestData[field as keyof CustomDealRequest]);
      
      if (missingFields.length > 0) {
        res.status(400).json({ 
          error: 'Missing required fields',
          missingFields 
        });
        return;
      }

      const result = await this.appsScriptService.submitCustomDealRequest(requestData);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error submitting custom deal request:', error);
      res.status(500).json({ 
        error: 'Failed to submit custom deal request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Correct common typos in user queries to improve intent understanding
   */
  private correctQueryTypos(query: string): { correctedQuery: string; corrections: string[] } {
    const originalQuery = query.trim();
    let correctedQuery = originalQuery;
    const corrections: string[] = [];
    
    const queryLower = correctedQuery.toLowerCase();
    
    // Context-aware typo correction: "shoe" → "show" when it clearly means "show me"
    if (queryLower.includes('shoe')) {
      // Context indicators that suggest "shoe" should be "show"
      const showContextIndicators = [
        'me deals', 'me ', 'deals for', 'market for', 'reaching people',
        'televisions', 'electronics', 'entertainment', 'sports', 'fashion'
      ];
      
      // Negative indicators that suggest "shoe" should stay as "shoe"
      const shoeContextIndicators = [
        'shoe deal', 'shoe purchase', 'footwear', 'clothing', 'apparel', 'fashion accessories'
      ];
      
      const hasShowContext = showContextIndicators.some(indicator => queryLower.includes(indicator));
      const hasShoeContext = shoeContextIndicators.some(indicator => queryLower.includes(indicator));
      
      if (hasShowContext && !hasShoeContext) {
        // Replace "shoe me" first, then standalone "shoe" if context suggests it
        if (queryLower.includes('shoe me')) {
          correctedQuery = correctedQuery.replace(/shoe me/gi, 'show me');
          corrections.push('Corrected "shoe me" to "show me"');
        } else {
          correctedQuery = correctedQuery.replace(/shoe/gi, 'show');
          corrections.push('Corrected "shoe" to "show" based on context indicating search intent');
        }
      }
    }
    
    // Additional common typos for deal search context
    const commonTypos = [
      { pattern: /televison/gi, replacement: 'television', description: 'televison → television' },
      { pattern: /elecronics/gi, replacement: 'electronics', description: 'elecronics → electronics' },
      { pattern: /tecnology/gi, replacement: 'technology', description: 'tecnology → technology' },
      { pattern: /automotve/gi, replacement: 'automotive', description: 'automotve → automotive' },
    ];
    
    commonTypos.forEach(({ pattern, replacement, description }) => {
      if (pattern.test(correctedQuery)) {
        correctedQuery = correctedQuery.replace(pattern, replacement);
        corrections.push(`Corrected "${description}"`);
      }
    });
    
    return { correctedQuery, corrections };
  }

  /**
   * Enhance AI response with correction notice if corrections were made
   */
  private enhanceResponseWithCorrections(aiResponse: string, originalQuery: string, correctedQuery: string, corrections: string[]): string {
    if (corrections.length > 0) {
      const correctionNotice = `\n\n*Note: I corrected your query from "${originalQuery}" to "${correctedQuery}" to better understand your request.`;
      return aiResponse + correctionNotice;
    }
    return aiResponse;
  }

  /**
   * AI-powered search using hybrid vector + Gemini approach
   */
  async searchDealsAI(req: Request, res: Response): Promise<void> {
    try {
      const { query, conversationHistory, forceDeals } = req.body;
      
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        res.status(400).json({ 
          error: 'Search query is required',
          message: 'Please provide a valid search query'
        });
        return;
      }

      // Apply typo correction before processing
      const { correctedQuery, corrections } = this.correctQueryTypos(query);

      console.log(`🔍 Hybrid AI Search request: "${query}"`);
      if (corrections.length > 0) {
        console.log(`🔧 Query corrections applied: ${corrections.join(', ')}`);
        console.log(`📝 Corrected query: "${correctedQuery}"`);
      }

      // Get all deals first with fallback to sample deals
      let allDeals: Deal[] = [];
      
      try {
        allDeals = await this.appsScriptService.getAllDeals();
      } catch (error) {
        console.error('❌ Apps Script service unavailable for search:', error instanceof Error ? error.message : 'Unknown error');
        res.status(503).json({
          error: 'Deals service unavailable',
          message: 'Real deals require Apps Script configuration. Please configure GOOGLE_APPS_SCRIPT_URL.',
          details: error instanceof Error ? error.message : 'Unknown error',
          query: correctedQuery,
          originalQuery: corrections.length > 0 ? query.trim() : undefined,
          corrections: corrections.length > 0 ? corrections : undefined
        });
        return;
      }
      
      if (allDeals.length === 0) {
        res.json({
          deals: [],
          aiResponse: "No deals are currently available from the Apps Script data source.",
          searchMethod: 'apps-script',
          confidence: 0,
          query: correctedQuery,
          originalQuery: corrections.length > 0 ? query.trim() : undefined,
          corrections: corrections.length > 0 ? corrections : undefined
        });
        return;
      }

      // Use Gemini to directly analyze and score all deals
      if (this.geminiService) {
        try {
          console.log('🤖 Using Gemini to analyze and score all deals...');
          
          // Create a comprehensive prompt for Gemini to score all deals
          const dealsSummary = allDeals.map((deal, index) => 
            `${index + 1}. ${deal.dealName} (ID: ${deal.dealId})
             - Description: ${deal.description}
             - Targeting: ${deal.targeting}
             - Media Type: ${deal.mediaType}
             - Environment: ${deal.environment}
             - Bid Guidance: ${deal.bidGuidance}`
          ).join('\n\n');

          const geminiResult = await this.geminiService.analyzeAllDeals(correctedQuery, allDeals, conversationHistory, forceDeals);
          
          // Check if this is a timeout response - if so, use fallback search
          if (geminiResult.searchMethod === 'timeout-fallback') {
            console.log('⏰ Gemini timed out, using fallback search for luxury/fashion query');
            const fallbackResult = this.performFallbackSearch(correctedQuery, allDeals);
            
            // Enhance fallback for luxury/fashion queries
            const queryLower = correctedQuery.toLowerCase();
            const isLuxuryQuery = queryLower.includes('luxury') || queryLower.includes('fashion') || queryLower.includes('accessories');
            
            if (isLuxuryQuery && fallbackResult.deals.length === 0) {
              // Try more specific keyword matching for luxury/fashion
              const luxuryKeywords = ['fashion', 'clothing', 'accessories', 'luxury', 'premium', 'designer', 'apparel'];
              const enhancedDeals = allDeals.filter(deal => {
                const dealText = `${deal.dealName} ${deal.description} ${deal.targeting}`.toLowerCase();
                return luxuryKeywords.some(keyword => dealText.includes(keyword));
              }).slice(0, 6);
              
              if (enhancedDeals.length > 0) {
                fallbackResult.deals = enhancedDeals;
                fallbackResult.aiResponse = `I found ${enhancedDeals.length} deals related to luxury goods and fashion for your query. Due to high demand, I'm showing results from our fallback search.`;
              }
            }
            
            // Use data-driven coaching service for fallback results
            const coaching = await coachingService.generateCoaching(fallbackResult.deals, correctedQuery);
            const enhancedAiResponse = this.enhanceResponseWithCorrections(fallbackResult.aiResponse, query.trim(), correctedQuery, corrections);
            res.json({
              deals: fallbackResult.deals,
              aiResponse: enhancedAiResponse,
              searchMethod: 'fallback-timeout',
              confidence: 0.6,
              query: correctedQuery,
              originalQuery: query.trim(),
              corrections: corrections,
              coaching: coaching
            });
            return;
          }
          
          // Check if this is a general question - if so, return only the AI response
          // UNLESS forceDeals is true, in which case we should still try to return deals
          if (geminiResult.deals.length === 0 && geminiResult.aiResponse && !forceDeals && geminiResult.searchMethod !== 'error-fallback') {
            const enhancedAiResponse = this.enhanceResponseWithCorrections(geminiResult.aiResponse, query.trim(), correctedQuery, corrections);
            res.json({
              deals: [],
              aiResponse: enhancedAiResponse,
              searchMethod: 'gemini-direct',
              confidence: geminiResult.confidence,
              query: correctedQuery,
              originalQuery: corrections.length > 0 ? query.trim() : undefined,
              corrections: corrections.length > 0 ? corrections : undefined,
              isGeneralQuestion: true,
              coaching: geminiResult.coaching
            });
            return;
          }
          
          // If forceDeals is true but no deals were returned, try to find some relevant deals
          if (forceDeals && geminiResult.deals.length === 0) {
            console.log('🔧 Force deals mode: Finding relevant deals despite empty Gemini result');
            // Find deals that match common keywords in the query
            const queryWords = correctedQuery.toLowerCase().split(' ').filter(word => word.length > 2);
            const relevantDeals = allDeals.filter(deal => {
              const dealText = `${deal.dealName} ${deal.description} ${deal.targeting}`.toLowerCase();
              return queryWords.some(word => dealText.includes(word));
            }).slice(0, 4);
            
            if (relevantDeals.length > 0) {
              console.log(`🔧 Found ${relevantDeals.length} relevant deals for force mode`);
              res.json({
                deals: relevantDeals,
                aiResponse: geminiResult.aiResponse || `Here are ${relevantDeals.length} relevant deals for your query.`,
                searchMethod: 'gemini-direct-forced',
                confidence: 0.6,
                query: correctedQuery,
                originalQuery: corrections.length > 0 ? query.trim() : undefined,
                corrections: corrections.length > 0 ? corrections : undefined,
                isGeneralQuestion: false,
                coaching: geminiResult.coaching
              });
              return;
            }
          }
          
          // Post-filter safeguard for known intents (e.g., new parents/baby/toddler)
          const lowerQuery = correctedQuery.toLowerCase();
          const wantsParents = /(new parent|baby|toddler|infant|parents|parenting|moms|mums|mothers|fathers)/.test(lowerQuery);
          const wantsPets = /(pet|animal|dog|cat|integrated pet home manager)/.test(lowerQuery);
          let finalDeals = geminiResult.deals;
          
          // CRITICAL FIX: Force correct deals for specific intent queries
          // This prevents irrelevant deals (like Finance/Political) when user clearly wants parents/pets
          
          if (wantsParents) {
            console.log('👶 Parent query detected, searching for baby/toddler/parent deals...');
            const parentDeals = allDeals.filter(deal => {
              const name = deal.dealName.toLowerCase();
              const desc = (deal.description || '').toLowerCase();
              return name.includes('baby') || 
                     name.includes('toddler') || 
                     name.includes('new parent') || 
                     name.includes('family') ||
                     desc.includes('baby') || 
                     desc.includes('toddler') || 
                     desc.includes('parent');
            }).slice(0, 6);
            
            if (parentDeals.length > 0) {
              console.log(`👶 Found ${parentDeals.length} relevant parent/baby deals, overriding Gemini results`);
              finalDeals = parentDeals;
            } else {
              console.log('👶 No specific parent deals found, keeping Gemini results');
            }
          }
          
          if (wantsPets && finalDeals.length > 0 && !finalDeals.some(deal => 
            deal.dealName.toLowerCase().includes('pet') || 
            deal.dealName.toLowerCase().includes('animal') ||
            deal.dealName.toLowerCase().includes('dog') ||
            deal.dealName.toLowerCase().includes('cat')
          )) {
            console.log('🐾 Pet query detected but got irrelevant deals, forcing pet deals');
            const petDeals = allDeals.filter(deal => {
              const name = deal.dealName.toLowerCase();
              return name.includes('pet') || name.includes('animal') || name.includes('dog') || name.includes('cat');
            }).slice(0, 4);
            
            if (petDeals.length > 0) {
              console.log(`🐾 Found ${petDeals.length} relevant pet deals`);
              finalDeals = petDeals;
            }
          }

          console.log(`✅ Gemini found ${geminiResult.deals.length} relevant deals with confidence ${geminiResult.confidence}`);

          // Add correction notice to AI response if corrections were made
          const enhancedAiResponse = this.enhanceResponseWithCorrections(geminiResult.aiResponse, query.trim(), correctedQuery, corrections);

          res.json({
            deals: finalDeals,
            aiResponse: enhancedAiResponse,
            searchMethod: 'gemini-direct',
            confidence: geminiResult.confidence,
            query: correctedQuery,
            originalQuery: corrections.length > 0 ? query.trim() : undefined,
            corrections: corrections.length > 0 ? corrections : undefined,
            coaching: geminiResult.coaching
          });
          return;

        } catch (geminiError) {
          console.error('❌ Gemini direct analysis failed, falling back to rule-based search:', geminiError);
        }
      }

      // Fallback to Gemini only if hybrid search fails
      if (this.geminiService) {
        try {
          console.log('🤖 Using Gemini for AI search...');
          const geminiResult = await this.geminiService.analyzeQuery(correctedQuery, allDeals, conversationHistory);
          
          // Check if this is also a timeout response
          if (geminiResult.searchMethod === 'timeout-fallback') {
            console.log('⏰ Second Gemini call also timed out, using enhanced fallback search');
            const fallbackResult = this.performFallbackSearch(correctedQuery, allDeals);
            
            // Use data-driven coaching service for fallback results
            const coaching = await coachingService.generateCoaching(fallbackResult.deals, correctedQuery);
            res.json({
              deals: fallbackResult.deals,
              aiResponse: fallbackResult.aiResponse || `I found ${fallbackResult.deals.length} deals using our fallback search method.`,
              searchMethod: 'fallback-double-timeout',
              confidence: 0.6,
              query: correctedQuery,
              originalQuery: corrections.length > 0 ? query.trim() : undefined,
              corrections: corrections.length > 0 ? corrections : undefined,
              coaching: coaching
            });
            return;
          }
          
          console.log(`✅ Gemini found ${geminiResult.deals.length} relevant deals with confidence ${geminiResult.confidence}`);
          
          res.json({
            deals: geminiResult.deals,
            aiResponse: geminiResult.aiResponse,
            searchMethod: 'gemini',
            confidence: geminiResult.confidence,
            query: correctedQuery,
            originalQuery: corrections.length > 0 ? query.trim() : undefined,
            corrections: corrections.length > 0 ? corrections : undefined,
            coaching: geminiResult.coaching
          });
          return;

        } catch (geminiError) {
          console.error('❌ Gemini search failed, falling back to rule-based search:', geminiError);
        }
      } else {
        console.log('🔄 Gemini not available, using rule-based search');
      }
      
      // Fallback to rule-based search
      const fallbackResult = this.performFallbackSearch(correctedQuery, allDeals);
      // Use data-driven coaching service for fallback results
      const coaching = await coachingService.generateCoaching(fallbackResult.deals, correctedQuery);
      
      res.json({
        deals: fallbackResult.deals,
        aiResponse: fallbackResult.aiResponse,
        searchMethod: 'fallback',
        confidence: 0.5,
        query: correctedQuery,
        originalQuery: corrections.length > 0 ? query.trim() : undefined,
        corrections: corrections.length > 0 ? corrections : undefined,
        coaching: coaching
      });

    } catch (error) {
      console.error('❌ AI Search error:', error);
      res.status(500).json({ 
        error: 'Failed to perform AI search',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate fallback coaching data when AI coaching is not available
   */
  private generateFallbackCoaching(query: string, deals: Deal[]): any {
    const lowerQuery = query.toLowerCase();
    
    // Get contextual coaching configurations
    const coachingConfigs = this.getCoachingConfigurations();
    
    // Check each configuration for keyword matches
    for (const config of coachingConfigs) {
      const hasMatch = config.keywords.some(keyword => lowerQuery.includes(keyword));
      if (hasMatch) {
        return {
          ...config.coaching,
          testingFramework: {
            minimumBudget: "$5,000",
            testDuration: "2-4 weeks",
            successMetrics: ["CTR", "conversion rate", "cost per acquisition", "quality score"]
          },
          quickWins: [
            "Start with highest-scoring deals first for immediate impact",
            "Implement A/B testing across different creative formats and audiences",
            "Focus on timing optimization based on audience viewing patterns"
          ],
          scalingPath: [
            "Scale winning creative formats and audience segments based on performance",
            "Expand to similar demographic segments with proven success",
            "Optimize campaigns based on real-time performance data and seasonal trends"
          ]
        };
      }
    }
    
    // Default fallback coaching
    return {
      strategyRationale: "These deals have been selected based on your query targeting specific audience segments and campaign objectives.",
      hiddenOpportunities: ["Consider audience overlap analysis to identify cross-segment opportunities"],
      riskWarnings: [
        "Monitor audience saturation levels in high-performing segments",
        "Watch for competitive pressure and market shifts in key demographics",
        "Ensure creative messaging aligns with audience expectations and platform context"
      ],
      testingFramework: {
        minimumBudget: "$5,000",
        testDuration: "2-4 weeks",
        successMetrics: ["CTR", "conversion rate", "cost per acquisition", "quality score"]
      },
      quickWins: [
        "Start with highest-scoring deals first for immediate impact",
        "Implement A/B testing across different creative formats and audiences",
        "Focus on timing optimization based on audience viewing patterns"
      ],
      scalingPath: [
        "Scale winning creative formats and audience segments based on performance",
        "Expand to similar demographic segments with proven success",
        "Optimize campaigns based on real-time performance data and seasonal trends"
      ],
      competitiveIntelligence: "Market analysis reveals competitive landscape intelligence: Typical CPM ranges $15-45 for premium segments, with 60-80% of competitors focusing on Q4 seasonal pushes. Opportunity exists in Q1-Q2 testing windows when competitive pressure drops 30-40%. Channel saturation varies significantly - mobile gaming shows 70% less competition than traditional display, while CTV sports inventory experiences 3x higher demand. Pricing strategies typically favor premium positioning (2x higher CPM but 40% better engagement) over volume plays in this vertical."
    };
  }

  /**
   * Centralized coaching configurations for different verticals/industries
   * This should be kept in sync with the GeminiService configurations
   */
  private getCoachingConfigurations(): Array<{keywords: string[], coaching: {strategyRationale: string, hiddenOpportunities: string[], riskWarnings?: string[], competitiveIntelligence: string}}> {
    return [
      {
        keywords: ['sports', 'athletic', 'fitness', 'exercise', 'mlb', 'nfl', 'nba', 'football', 'basketball', 'golf'],
        coaching: {
          strategyRationale: "Sports deals target highly engaged audiences during peak viewing moments, providing high brand awareness and engagement during live events and sports content consumption.",
          hiddenOpportunities: [
            "Sports fans show strong cross-purchase behavior with athletic gear and energy drinks",
            "Live sports viewing creates time-sensitive, high-value advertising moments",
            "Sports audiences are highly engaged during games with lower ad-skipping rates"
          ],
          competitiveIntelligence: "Sports CTV competitive landscape: Premium inventory commands $80-200 CPM during live events (3x standard rates), but competition peaks during major tournaments (NFL playoffs, March Madness). 70% of sports advertisers focus Q4-Q1, creating Q2-Q3 testing opportunities with 40% lower CPMs. Early booking (60-90 days) provides 25% cost advantages. Underutilized segments include women's sports (+25% growth, 50% less competition) and regional sports networks (localized targeting at 30% lower rates). Creative themes aligned with game narratives outperform generic messaging by 60%."
        }
      },
      {
        keywords: ['parent', 'baby', 'toddler', 'infant', 'mom', 'dad', 'family', 'parenting'],
        coaching: {
          strategyRationale: "Parent-focused deals target high-value audiences making significant family-related purchases. Parents are research-heavy buyers seeking trusted, safe options for their children.",
          hiddenOpportunities: [
            "Parents show strong cross-purchase behavior between baby products and family services",
            "New parents are in a high-spending lifecycle stage with predictable purchase patterns",
            "Parenting communities have high word-of-mouth influence and brand loyalty potential"
          ],
          competitiveIntelligence: "Parenting market competitive intelligence: High-value but fiercely contested segment with $35-75 CPM ranges (60% above category average). 85% of competitors focus on Q4 baby-related purchases, but Q2-Q3 shows 30% lower competition for family lifestyle products. Safety-focused messaging dominates (80% of campaigns), creating opportunity for innovation positioning. Trusted platform placement (parenting blogs, family apps) commands premium rates but delivers 45% higher engagement than general social. Under-targeted segments include fathers (only 25% of campaigns focus here despite equal purchasing influence) and working parents (flexible timing, higher disposable income)."
        }
      },
      {
        keywords: ['business', 'finance', 'financial', 'banking', 'investment', 'wealth', 'fintech', 'enterprise', 'corporate'],
        coaching: {
          strategyRationale: "Business and finance deals target high-income, decision-making professionals who consume financial content and business news. These audiences have significant purchasing power and make strategic financial decisions.",
          hiddenOpportunities: [
            "Finance professionals show strong cross-purchase behavior with business services and technology solutions",
            "Business decision-makers have predictable quarterly budget cycles and longer sales consideration periods",
            "Financial content consumption patterns correlate with investment and purchasing behaviors during market hours"
          ],
          riskWarnings: [
            "Financial content has high regulatory scrutiny - ensure ad compliance and brand safety",
            "Business audiences are sophisticated and sensitive to overly promotional messaging",
            "Market volatility can significantly impact financial services ad performance",
            "Ensure creative messaging aligns with professional credibility expectations"
          ],
          competitiveIntelligence: "Business/Finance competitive landscape: Premium segment with $50-120 CPM ranges (highest margins in adtech). 75% of competitors concentrate spend during earnings seasons (Q1, Q4), but Q2-Q3 offers 35% lower rates for testing. Thought leadership content dominates (65% of campaigns), but data-driven performance messaging shows 40% higher conversion. LinkedIn commands premium rates but delivers highest quality leads, while CTV business content shows 60% less saturation than anticipated. Key competitive advantage: Most business campaigns target 25-44 age range, but 45-65 decision-makers show 80% higher conversion rates despite 25% less competition."
        }
      },
      {
        keywords: ['pet', 'dog', 'cat', 'animal', 'puppy', 'kitten', 'pet owner'],
        coaching: {
          strategyRationale: "Pet-focused deals target passionate pet owners who prioritize quality and safety for their animals. Pet owners show strong brand loyalty and are willing to pay premium prices for trusted products.",
          hiddenOpportunities: [
            "Pet owners show strong cross-purchase behavior between pet food, toys, and veterinary services",
            "Seasonal patterns align with pet adoption cycles and holidays (Christmas pets, spring training)",
            "Pet communities have high engagement and influencer potential for word-of-mouth marketing"
          ],
          riskWarnings: [
            "Pet owners are highly sensitive to product safety and ingredient quality claims",
            "Regulatory compliance is critical for pet product advertising",
            "Avoid messaging that could be perceived as harmful to animals"
          ],
          competitiveIntelligence: "Pet industry shows strong growth with premium positioning opportunities. Most competitors focus on price messaging, creating opportunity for quality and safety positioning at higher margins."
        }
      },
      {
        keywords: ['luxury', 'fashion', 'premium', 'designer', 'high-end', 'exclusive', 'upscale'],
        coaching: {
          strategyRationale: "Luxury deals target affluent consumers who value quality, exclusivity, and brand prestige. These audiences prioritize experience and craftsmanship over price.",
          hiddenOpportunities: [
            "Luxury consumers cross-shop across categories (fashion, travel, dining, automotive)",
            "Seasonal and gifting occasions drive 70% of luxury purchases",
            "Affluent audiences show strong brand loyalty and lifetime value"
          ],
          riskWarnings: [
            "Premium audiences are sophisticated and sensitive to overt promotional messaging",
            "Brand image and positioning must align with luxury expectations",
            "Avoid price-focused messaging which can damage brand perception"
          ],
          competitiveIntelligence: "Luxury market shows strong resilience with premium audiences less price-sensitive. Opportunity exists in digital luxury experiences and sustainable luxury positioning."
        }
      },
      {
        keywords: ['camping', 'hiking', 'outdoor', 'recreation', 'backpacking', 'tent', 'trail', 'wilderness', 'nature', 'camp'],
        coaching: {
          strategyRationale: "Outdoor recreation deals target adventure-seekers and nature enthusiasts who prioritize quality gear and authentic experiences. These audiences value durability, functionality, and environmental responsibility in their purchases.",
          hiddenOpportunities: [
            "Outdoor enthusiasts show strong cross-purchase behavior between camping, hiking, fishing, and boating gear",
            "Seasonal patterns peak during spring preparation and fall clearance, with steady summer activity",
            "Outdoor communities have high user-generated content potential and strong brand advocacy"
          ],
          riskWarnings: [
            "Outdoor audiences value authenticity and environmental responsibility - avoid greenwashing claims",
            "Seasonal timing is critical - avoid promoting winter gear during summer peak season",
            "Outdoor gear purchases are often research-heavy and comparison-driven"
          ],
          competitiveIntelligence: "Outdoor recreation shows consistent growth with premium quality positioning opportunities. Most competitors focus on price, creating opportunity for durability and performance messaging at higher margins. Peak competition during Q4 holiday season, but Q1-Q2 shows 30% lower rates for spring campaign testing. CPM typically ranges $18-35 for outdoor enthusiasts (40% above general display) with highest engagement during spring gear-up and fall clearance periods."
        }
      },
      // Technology & Electronics
      {
        keywords: ['technology', 'tech', 'electronics', 'electronic', 'gadget', 'device', 'computer', 'software', 'app', 'digital'],
        coaching: {
          strategyRationale: "Technology deals target early adopters and tech-savvy consumers who value innovation, performance, and cutting-edge features. These audiences are well-informed and comparison-shop extensively.",
          hiddenOpportunities: [
            "Tech enthusiasts show strong cross-purchase behavior across electronics, software, and gaming categories",
            "Product launch cycles and holiday seasons drive predictable purchasing patterns",
            "Tech communities have high engagement and user-generated review content"
          ],
          riskWarnings: [
            "Technology audiences are sophisticated and sensitive to outdated or inaccurate technical claims",
            "Rapid innovation cycles require up-to-date messaging and feature accuracy",
            "Price sensitivity varies significantly between early adopters and mainstream buyers"
          ],
          competitiveIntelligence: "Technology market shows high competition with premium positioning for quality and innovation. Most competitors focus on features, creating opportunity for performance and reliability messaging. Peak competition during Q4 holiday season and major product launches. CPM typically ranges $22-45 for tech enthusiasts with highest engagement during product launches and holiday seasons."
        }
      },
      // Healthcare & Wellness
      {
        keywords: ['health', 'healthcare', 'medical', 'wellness', 'fitness', 'pharmacy', 'supplement', 'vitamin', 'medicine'],
        coaching: {
          strategyRationale: "Healthcare deals target health-conscious consumers seeking trusted medical and wellness solutions. These audiences prioritize safety, efficacy, and professional validation in their health decisions.",
          hiddenOpportunities: [
            "Health audiences show strong cross-purchase behavior between supplements, fitness, and medical products",
            "Seasonal patterns align with flu season and New Year health resolutions",
            "Health communities value expert recommendations and clinical validation"
          ],
          riskWarnings: [
            "Healthcare advertising has strict regulatory requirements and compliance standards",
            "Audiences are sensitive to medical claims and require authoritative sources",
            "Avoid making unsubstantiated health claims that could violate advertising guidelines"
          ],
          competitiveIntelligence: "Healthcare market shows strong growth with strict regulatory oversight creating barriers to entry. Most competitors focus on generic health benefits, creating opportunity for clinical validation and professional endorsement messaging at premium margins. CPM typically ranges $25-50 for health audiences with highest engagement during New Year resolutions and flu seasons."
        }
      },
      // Automotive
      {
        keywords: ['auto', 'automotive', 'car', 'vehicle', 'truck', 'motorcycle', 'driving', 'automobile', 'dealer'],
        coaching: {
          strategyRationale: "Automotive deals target vehicle owners and prospective buyers making significant purchases. These audiences value reliability, safety features, and long-term value in their automotive decisions.",
          hiddenOpportunities: [
            "Automotive audiences show strong cross-purchase behavior between vehicles, insurance, and maintenance services",
            "Purchase cycles align with model year releases and end-of-year incentives",
            "Automotive communities value detailed specifications and comparative analysis"
          ],
          riskWarnings: [
            "Automotive advertising requires accuracy in specifications and pricing information",
            "Audiences comparison-shop extensively across multiple dealerships and brands",
            "Seasonal timing is critical - avoid promoting summer vehicles during winter"
          ],
          competitiveIntelligence: "Automotive market shows high competition with regional variations in pricing and availability. Most competitors focus on price, creating opportunity for safety and reliability positioning at higher margins. Peak competition during Q4 year-end sales. CPM typically ranges $35-80 for automotive audiences with highest engagement during model year releases and end-of-year sales."
        }
      },
      // Travel & Hospitality
      {
        keywords: ['travel', 'vacation', 'tourism', 'hotel', 'flight', 'airline', 'booking', 'trip', 'destination'],
        coaching: {
          strategyRationale: "Travel deals target vacation planners and business travelers who value experiences, convenience, and value. These audiences research extensively and book during specific seasonal windows.",
          hiddenOpportunities: [
            "Travel audiences show strong cross-purchase behavior between flights, hotels, and activities",
            "Booking patterns peak during specific seasonal windows (summer vacations, holiday travel)",
            "Travel communities value authentic experiences and local recommendations"
          ],
          riskWarnings: [
            "Travel audiences are price-sensitive and comparison-shop across multiple booking platforms",
            "Seasonal timing is critical - avoid promoting summer destinations during winter",
            "Travel disruption concerns require flexibility messaging and cancellation policies"
          ],
          competitiveIntelligence: "Travel market shows strong recovery with premium positioning for unique experiences. Most competitors focus on price, creating opportunity for experience and convenience messaging at higher margins. Peak competition during major holiday seasons. CPM typically ranges $20-40 for travel audiences with highest engagement during peak booking seasons."
        }
      },
      // Gaming & Entertainment
      {
        keywords: ['gaming', 'video game', 'game', 'gamer', 'entertainment', 'streaming', 'esports', 'console'],
        coaching: {
          strategyRationale: "Gaming deals target passionate gamers and entertainment enthusiasts who value immersive experiences and community engagement. These audiences are highly engaged and brand-loyal to their preferred platforms.",
          hiddenOpportunities: [
            "Gaming audiences show strong cross-purchase behavior between games, hardware, and subscriptions",
            "Purchase patterns align with major game releases and seasonal sales events",
            "Gaming communities have high engagement and influencer marketing potential"
          ],
          riskWarnings: [
            "Gaming audiences are sensitive to authenticity and avoid obviously commercial messaging",
            "Platform exclusivity and hardware compatibility are critical messaging considerations",
            "Avoid outdated gaming references or technology that doesn't align with current standards"
          ],
          competitiveIntelligence: "Gaming market shows explosive growth with premium positioning for exclusive content. Most competitors focus on price, creating opportunity for exclusive access and community features messaging at higher margins. Peak competition during major game releases and holiday seasons. CPM typically ranges $15-35 for gaming audiences with highest engagement during game launches and seasonal sales."
        }
      },
      // Home & Garden
      {
        keywords: ['home', 'furniture', 'decor', 'kitchen', 'garden', 'lawn', 'appliance', 'bedding', 'bathroom'],
        coaching: {
          strategyRationale: "Home & garden deals target homeowners and renters making decisions about their living spaces. These audiences value quality, durability, and aesthetic appeal in home-related purchases.",
          hiddenOpportunities: [
            "Home audiences show strong cross-purchase behavior between furniture, appliances, and home decor",
            "Seasonal patterns align with home improvement seasons (spring, fall) and holiday hosting",
            "Home communities value before/after transformations and design inspiration"
          ],
          riskWarnings: [
            "Home purchases are often expensive and require extensive research and comparison shopping",
            "Seasonal timing is critical for garden and outdoor furniture promotions",
            "Home audiences value quality and durability over price in major purchases"
          ],
          competitiveIntelligence: "Home market shows consistent demand with premium positioning for quality and design. Most competitors focus on price, creating opportunity for quality and aesthetic messaging at higher margins. Peak competition during spring and fall home improvement seasons. CPM typically ranges $18-40 for home audiences with highest engagement during improvement seasons."
        }
      },
      // Food & Beverage
      {
        keywords: ['food', 'restaurant', 'beverage', 'drink', 'coffee', 'wine', 'beer', 'dining', 'cooking', 'recipe'],
        coaching: {
          strategyRationale: "Food & beverage deals target culinary enthusiasts and dining consumers who value taste, quality, and experience. These audiences are influenced by trends, reviews, and social proof.",
          hiddenOpportunities: [
            "Food audiences show strong cross-purchase behavior between dining, cooking, and specialty foods",
            "Seasonal patterns align with holiday dining, summer grilling, and comfort food seasons",
            "Food communities have high social sharing potential and user-generated content"
          ],
          riskWarnings: [
            "Food audiences value authenticity and are sensitive to overly promotional messaging",
            "Dietary restrictions and health consciousness require careful messaging considerations",
            "Food trends change rapidly, requiring up-to-date and culturally sensitive content"
          ],
          competitiveIntelligence: "Food market shows strong social engagement with premium positioning for authentic experiences. Most competitors focus on price, creating opportunity for quality and experience messaging at higher margins. Peak competition during major dining seasons and holidays. CPM typically ranges $12-28 for food audiences with highest engagement during dining seasons."
        }
      },
      // Beauty & Personal Care
      {
        keywords: ['beauty', 'cosmetic', 'skincare', 'makeup', 'personal care', 'grooming', 'hair', 'nail', 'spa'],
        coaching: {
          strategyRationale: "Beauty deals target consumers seeking self-care, confidence, and personal enhancement. These audiences value efficacy, ingredients, and social proof in beauty and personal care decisions.",
          hiddenOpportunities: [
            "Beauty audiences show strong cross-purchase behavior between skincare, makeup, and personal care products",
            "Seasonal patterns align with special occasions, holidays, and self-care trends",
            "Beauty communities have high social sharing potential and influencer marketing effectiveness"
          ],
          riskWarnings: [
            "Beauty audiences are sensitive to ingredient claims and require transparency in product information",
            "Cultural diversity and inclusivity are critical messaging considerations in beauty advertising",
            "Avoid making unsubstantiated beauty claims that could violate advertising standards"
          ],
          competitiveIntelligence: "Beauty market shows strong growth with premium positioning for quality and efficacy. Most competitors focus on price, creating opportunity for ingredient quality and professional endorsement messaging at higher margins. Peak competition during holiday and special occasion seasons. CPM typically ranges $16-35 for beauty audiences with highest engagement during special occasions."
        }
      },
      // Education & Learning
      {
        keywords: ['education', 'learning', 'course', 'training', 'school', 'university', 'college', 'student', 'skill'],
        coaching: {
          strategyRationale: "Education deals target learners and students seeking skill development and knowledge acquisition. These audiences value quality content, practical applicability, and career advancement potential.",
          hiddenOpportunities: [
            "Education audiences show strong cross-purchase behavior between different learning categories and skill development",
            "Enrollment patterns align with academic cycles and career development seasons",
            "Education communities value peer reviews and professional certification outcomes"
          ],
          riskWarnings: [
            "Education audiences require transparency in course outcomes and certification validity",
            "Avoid making unsubstantiated claims about career advancement or salary increases",
            "Quality and accreditation are more important than price for serious learners"
          ],
          competitiveIntelligence: "Education market shows strong demand with premium positioning for quality and outcomes. Most competitors focus on price, creating opportunity for quality and career advancement messaging at higher margins. Peak competition during New Year and academic year starts. CPM typically ranges $14-32 for education audiences with highest engagement during enrollment seasons."
        }
      }
    ];
  }

  /**
   * Fallback search when Gemini fails
   */
  private performFallbackSearch(query: string, deals: Deal[]): {
    deals: Deal[];
    aiResponse: string;
  } {
    const queryLower = query.toLowerCase();
    
    // Extract keywords from query for better matching
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
    
    // Define luxury/fashion keywords for better matching
    const luxuryKeywords = ['luxury', 'fashion', 'accessories', 'clothing', 'apparel', 'premium', 'designer', 'high-end', 'goods', 'market'];
    
    // Check if this is a luxury/fashion query
    const isLuxuryQuery = luxuryKeywords.some(keyword => queryLower.includes(keyword));
    
    // Enhanced keyword matching
    const scoredDeals = deals.map(deal => {
      let score = 0;
      const dealText = `${deal.dealName} ${deal.description} ${deal.targeting} ${deal.mediaType}`.toLowerCase();
      
      // Direct query match (highest priority)
      if (deal.dealName.toLowerCase().includes(queryLower)) score += 10;
      if (deal.description.toLowerCase().includes(queryLower)) score += 8;
      if (deal.targeting.toLowerCase().includes(queryLower)) score += 6;
      
      // Word-by-word matching
      queryWords.forEach(word => {
        if (dealText.includes(word)) {
          score += 3;
        }
      });
      
      // Luxury/fashion specific matching
      if (isLuxuryQuery) {
        luxuryKeywords.forEach(keyword => {
          if (dealText.includes(keyword)) {
            score += 5;
          }
        });
      }
      
      return { deal, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(item => item.deal);

    // If no matches found for luxury queries, try broader matching
    if (scoredDeals.length === 0 && isLuxuryQuery) {
      const broaderMatches = deals.filter(deal => {
        const dealText = `${deal.dealName} ${deal.description}`.toLowerCase();
        return luxuryKeywords.some(keyword => dealText.includes(keyword));
      }).slice(0, 6);
      
      if (broaderMatches.length > 0) {
        return {
          deals: broaderMatches,
          aiResponse: `I found ${broaderMatches.length} deals related to luxury goods and fashion that might be relevant to your query.`
        };
      }
    }

    return {
      deals: scoredDeals,
      aiResponse: `I found ${scoredDeals.length} deals that match your search for "${query}". These are the most relevant options available.`
    };
  }

  /**
   * Generate audience insights using AI
   */
  async generateAudienceInsights(req: Request, res: Response): Promise<void> {
    try {
      const { query, conversationHistory } = req.body;
      
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        res.status(400).json({ 
          error: 'Query is required',
          message: 'Please provide a valid query for audience insights'
        });
        return;
      }

      console.log(`🎯 Audience Insights request: "${query}"`);

      if (!this.geminiService) {
        res.status(503).json({ 
          error: 'AI service not available',
          message: 'Gemini AI service is not configured'
        });
        return;
      }

      try {
        const result = await this.geminiService.generateAudienceInsights(query.trim(), conversationHistory);
        
        // Check if we got empty results and provide fallback for specific query types
        if (result.audienceInsights.length === 0) {
          if (this.isNewParentsQuery(query.trim())) {
            console.log('🎯 New parents query detected, providing fallback insights');
            const fallbackResult = this.generateNewParentsFallbackInsights(query.trim());
            res.json({
              audienceInsights: fallbackResult.audienceInsights,
              aiResponse: fallbackResult.aiResponse,
              query: query.trim()
            });
            return;
          } else if (this.isSportsQuery(query.trim())) {
            console.log('🎯 Sports query detected, providing fallback insights');
            const fallbackResult = this.generateSportsFallbackInsights(query.trim());
            res.json({
              audienceInsights: fallbackResult.audienceInsights,
              aiResponse: fallbackResult.aiResponse,
              query: query.trim()
            });
            return;
          }
        }
        
        console.log(`✅ Generated ${result.audienceInsights.length} audience insights cards`);
        
        res.json({
          audienceInsights: result.audienceInsights,
          aiResponse: result.aiResponse,
          query: query.trim()
        });

      } catch (geminiError) {
        console.error('❌ Gemini audience insights failed:', geminiError);
        
        // Provide fallback for specific query types even on error
        if (this.isNewParentsQuery(query.trim())) {
          console.log('🎯 New parents query detected, providing fallback insights after error');
          const fallbackResult = this.generateNewParentsFallbackInsights(query.trim());
          res.json({
            audienceInsights: fallbackResult.audienceInsights,
            aiResponse: fallbackResult.aiResponse,
            query: query.trim()
          });
          return;
        } else if (this.isSportsQuery(query.trim())) {
          console.log('🎯 Sports query detected, providing fallback insights after error');
          const fallbackResult = this.generateSportsFallbackInsights(query.trim());
          res.json({
            audienceInsights: fallbackResult.audienceInsights,
            aiResponse: fallbackResult.aiResponse,
            query: query.trim()
          });
          return;
        }
        
        res.status(500).json({ 
          error: 'Failed to generate audience insights',
          message: 'AI service encountered an error'
        });
      }

    } catch (error) {
      console.error('❌ Audience Insights error:', error);
      res.status(500).json({ 
        error: 'Failed to generate audience insights',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private isSportsQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    const sportsKeywords = ['mlb', 'nfl', 'nba', 'nhl', 'baseball', 'football', 'basketball', 'hockey', 'soccer', 'tennis', 'golf', 'sports', 'fans', 'fanbase'];
    return sportsKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  private generateSportsFallbackInsights(query: string): {
    audienceInsights: any[];
    aiResponse: string;
  } {
    const audienceName = this.extractSportsAudienceName(query);
    
    const audienceInsight = {
      id: `sports-insight-${Date.now()}`,
      audienceName: audienceName,
      demographics: {
        ageRange: "25-54",
        incomeRange: "$50k+",
        genderSplit: "60% Male, 40% Female",
        topLocations: ["United States", "Urban Areas", "Sports Markets"]
      },
      behavior: {
        deviceUsage: {
          mobile: 45,
          desktop: 35,
          tablet: 20
        },
        peakHours: ["Evening hours", "Weekend afternoons"],
        purchaseFrequency: "Seasonal",
        avgOrderValue: "$75"
      },
      insights: {
        keyCharacteristics: [
          "High engagement with sports content",
          "Brand loyalty to teams and players",
          "Social media active during games",
          "Community-driven purchasing decisions"
        ],
        interests: ["Sports", "Entertainment", "Social Media", "Team Merchandise"],
        painPoints: ["Ad fatigue", "Content discovery", "Finding relevant content"]
      },
      creativeGuidance: {
        messagingTone: "Authentic and passionate",
        visualStyle: "Dynamic, energetic, team colors",
        keyMessages: ["Team pride", "Community", "Excellence", "Tradition"],
        avoidMessaging: ["Generic", "Non-sports related", "Inauthentic"]
      },
      mediaStrategy: {
        preferredChannels: ["CTV", "Mobile Apps", "Social Media", "Sports Websites"],
        optimalTiming: ["Game days", "Season starts", "Playoff periods"],
        creativeFormats: ["Video", "Interactive Display", "Live Streaming"],
        targetingApproach: "Interest + Geographic + Behavioral + Team Affiliation"
      },
      sources: [
        { "title": "Sports Marketing Research", "url": "https://example.com", "note": "Industry benchmarks" },
        { "title": "Fan Engagement Studies", "url": "https://example.com", "note": "Behavioral insights" }
      ]
    };

    return {
      audienceInsights: [audienceInsight],
      aiResponse: `Here are comprehensive insights about ${audienceName} based on sports marketing research and fan behavior analysis.`
    };
  }

  private extractSportsAudienceName(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('mlb') && lowerQuery.includes('fan')) return 'MLB Baseball Fans';
    if (lowerQuery.includes('nfl') && lowerQuery.includes('fan')) return 'NFL Football Fans';
    if (lowerQuery.includes('nba') && lowerQuery.includes('fan')) return 'NBA Basketball Fans';
    if (lowerQuery.includes('nhl') && lowerQuery.includes('fan')) return 'NHL Hockey Fans';
    if (lowerQuery.includes('baseball') && lowerQuery.includes('fan')) return 'Baseball Fans';
    if (lowerQuery.includes('football') && lowerQuery.includes('fan')) return 'Football Fans';
    if (lowerQuery.includes('basketball') && lowerQuery.includes('fan')) return 'Basketball Fans';
    if (lowerQuery.includes('hockey') && lowerQuery.includes('fan')) return 'Hockey Fans';
    if (lowerQuery.includes('soccer') && lowerQuery.includes('fan')) return 'Soccer Fans';
    
    // Generic sports fans
    if (lowerQuery.includes('sports') && lowerQuery.includes('fan')) return 'Sports Fans';
    if (lowerQuery.includes('fan')) return 'Sports Fans';
    
    // Default
    return 'Sports Fans';
  }

  private isNewParentsQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    const newParentsKeywords = ['new parents', 'parents', 'parenting', 'new mom', 'new dad', 'expecting', 'pregnancy', 'baby', 'toddler', 'family with children'];
    return newParentsKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  private generateNewParentsFallbackInsights(query: string): {
    audienceInsights: any[];
    aiResponse: string;
  } {
    const audienceInsight = {
      id: `new-parents-insight-${Date.now()}`,
      audienceName: "New Parents",
      demographics: {
        ageRange: "25-40",
        incomeRange: "$50k-$100k+",
        genderSplit: "55% Female, 45% Male",
        topLocations: ["Suburban Areas", "Urban Centers", "Family-Friendly Communities"]
      },
      behavior: {
        deviceUsage: {
          mobile: 65,
          desktop: 25,
          tablet: 10
        },
        peakHours: ["Early morning", "Evening after bedtime", "Weekend mornings"],
        purchaseFrequency: "High",
        avgOrderValue: "$85"
      },
      insights: {
        keyCharacteristics: [
          "Value-conscious shoppers",
          "Research-heavy purchasing decisions",
          "Social media active for parenting advice",
          "Time-pressed but quality-focused"
        ],
        interests: ["Family Safety", "Child Development", "Budget Management", "Health & Wellness", "Convenience"],
        painPoints: ["Time constraints", "Budget pressure", "Information overload", "Finding trusted brands"]
      },
      creativeGuidance: {
        messagingTone: "Supportive, trustworthy, and understanding",
        visualStyle: "Warm, family-focused, clean and safe",
        keyMessages: ["Safety first", "Family time", "Quality for your family", "Convenience"],
        avoidMessaging: ["Overwhelming", "Too technical", "Expensive without value"]
      },
      mediaStrategy: {
        preferredChannels: ["Mobile Apps", "Social Media", "CTV", "Email Marketing"],
        optimalTiming: ["Early morning", "Evening", "Weekend mornings"],
        creativeFormats: ["Video testimonials", "User-generated content", "Educational content"],
        targetingApproach: "Interest + Life Stage + Behavioral + Geographic"
      },
      sources: [
        { "title": "New Parent Marketing Research", "url": "https://example.com", "note": "Parenting behavior insights" }
      ]
    };

    return {
      audienceInsights: [audienceInsight],
      aiResponse: `Here are comprehensive insights about New Parents based on your query. This audience represents a significant opportunity for family-focused brands like Old Navy.`
    };
  }

  /**
   * Unified search across all card types
   */
  async unifiedSearch(req: Request, res: Response): Promise<void> {
    try {
      const { query, cardType = 'all', cardTypes } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Query is required and must be a string'
        });
        return;
      }

      // Handle both single cardType and array of cardTypes for multiple selection
      const rawRequestedTypes = cardTypes && Array.isArray(cardTypes) ? cardTypes : (cardType === 'all' ? ['deals', 'personas', 'audience-insights', 'market-sizing', 'geographic'] : [cardType]);
      
      // Normalize card type names (handle frontend/backend naming inconsistencies)
      const requestedTypes = rawRequestedTypes.map(type => {
        if (type === 'geo-cards') return 'geographic';
        return type;
      });
      
      console.log(`🔍 Unified search: "${query}", types: ${JSON.stringify(requestedTypes)}`);

      const results: any = {
        deals: [],
        personas: [],
        audienceInsights: [],
        marketSizing: [],
        geoCards: []
      };

      // Search deals if requested
      if (requestedTypes.includes('deals')) {
        try {
          const deals = await this.appsScriptService.getAllDeals();
          if (deals && deals.length > 0) {
            // Simple keyword matching for now
            const filteredDeals = deals.filter(deal => 
              deal.dealName.toLowerCase().includes(query.toLowerCase()) ||
              deal.description.toLowerCase().includes(query.toLowerCase()) ||
              deal.environment.toLowerCase().includes(query.toLowerCase())
            );
            results.deals = filteredDeals.slice(0, 10); // Limit to 10 results
          }
        } catch (error) {
          console.error('Error searching deals:', error);
        }
      }

      // Search personas if requested
      if (requestedTypes.includes('personas')) {
        try {
          // First, check if query matches a commerce audience segment for dynamic persona generation
          const { commerceAudienceService } = require('../services/commerceAudienceService');
          const allSegments = commerceAudienceService.getAudienceSegments();
          const matchingSegment = allSegments.find((s: any) => 
            s.name.toLowerCase() === query.toLowerCase() ||
            query.toLowerCase().includes(s.name.toLowerCase())
          );
          
          if (matchingSegment) {
            console.log(`🎯 Generating dynamic persona for commerce segment: ${matchingSegment.name}`);
            try {
              const { audienceInsightsService } = require('../services/audienceInsightsService');
              const report = await audienceInsightsService.generateReport(matchingSegment.name);
              
              // Create persona card from report
              const dynamicPersona = {
                id: matchingSegment.name,
                personaName: report.personaName,
                emoji: report.personaEmoji,
                category: report.category,
                description: report.strategicInsights.targetPersona,
                coreInsight: report.strategicInsights.targetPersona.split('.')[0] + '.',
                demographics: {
                  age: report.keyMetrics.topAgeBracket,
                  income: `$${report.keyMetrics.medianHHI.toLocaleString()}`,
                  location: report.geographicHotspots.slice(0, 3).map((h: any) => `${h.city}, ${h.state}`).join('; '),
                  interests: report.behavioralOverlap.slice(0, 3).map((o: any) => o.segment)
                },
                dealCount: 0, // Will be populated by frontend
                isDynamic: true // Flag to indicate this is a dynamically generated persona
              };
              
              results.personas = [dynamicPersona];
              console.log(`✅ Generated dynamic persona: ${dynamicPersona.personaName}`);
            } catch (error) {
              console.error('Error generating dynamic persona:', error);
              // Fall through to static personas
            }
          }
          
          // If no dynamic persona generated, fall back to static personas
          if (results.personas.length === 0) {
            const personas = await this.personaService.getAllPersonas();
            if (personas && personas.length > 0) {
              const filteredPersonas = personas.filter((persona: any) => 
                (persona.personaName && persona.personaName.toLowerCase().includes(query.toLowerCase())) ||
                (persona.coreInsight && persona.coreInsight.toLowerCase().includes(query.toLowerCase())) ||
                (persona.category && persona.category.toLowerCase().includes(query.toLowerCase()))
              );
              results.personas = filteredPersonas.slice(0, 10);
            }
          }
        } catch (error) {
          console.error('Error searching personas:', error);
        }
      }

      // Generate AI-powered insights if requested
      if (requestedTypes.includes('audience-insights')) {
        try {
          if (this.geminiService) {
            const insightsResult = await this.geminiService.generateAudienceInsights(query);
            results.audienceInsights = insightsResult.audienceInsights || [];
          }
        } catch (error) {
          console.error('Error generating audience insights:', error);
        }
      }

      // Generate market sizing if requested
      if (requestedTypes.includes('market-sizing')) {
        try {
          if (this.geminiService) {
            const sizingResult = await this.geminiService.generateMarketSizing(query);
            results.marketSizing = sizingResult.marketSizing || [];
          }
        } catch (error) {
          console.error('Error generating market sizing:', error);
        }
      }

      // Generate geographic insights if requested
      if (requestedTypes.includes('geographic')) {
        try {
          if (this.geminiService) {
            const geoResult = await this.geminiService.generateGeographicInsights(query);
            results.geoCards = geoResult.geoCards || [];
          }
        } catch (error) {
          console.error('Error generating geographic insights:', error);
        }
      }

      console.log(`✅ Unified search results:`, {
        deals: results.deals.length,
        personas: results.personas.length,
        audienceInsights: results.audienceInsights.length,
        marketSizing: results.marketSizing.length,
        geoCards: results.geoCards.length
      });

      res.json(results);

    } catch (error) {
      console.error('Error in unified search:', error);
      res.status(500).json({
        error: 'Failed to perform unified search',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate market sizing data using AI
   */
  async generateMarketSizing(req: Request, res: Response): Promise<void> {
    try {
      const { query, conversationHistory } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Query is required and must be a string'
        });
        return;
      }

      if (!this.geminiService) {
        res.status(503).json({
          error: 'Service unavailable',
          message: 'AI service is not available'
        });
        return;
      }

      const result = await this.geminiService.generateMarketSizing(query, conversationHistory);
      
      res.json({
        marketSizing: result.marketSizing,
        aiResponse: result.aiResponse
      });

    } catch (error) {
      console.error('Error generating market sizing:', error);
      res.status(500).json({
        error: 'Failed to generate market sizing',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate Marketing SWOT analysis for a company
   */
  async generateMarketingSWOT(req: Request, res: Response): Promise<void> {
    try {
      const { companyName } = req.body;

      if (!companyName || typeof companyName !== 'string') {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Company name is required and must be a string'
        });
        return;
      }

      if (!this.geminiService) {
        res.status(503).json({
          error: 'Service unavailable',
          message: 'AI service is not available'
        });
        return;
      }

      const result = await this.geminiService.generateMarketingSWOT(companyName.trim());
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json({
          error: 'Failed to generate Marketing SWOT',
          message: result.error || 'Marketing SWOT analysis failed'
        });
      }

    } catch (error) {
      console.error('Error generating Marketing SWOT:', error);
      res.status(500).json({
        error: 'Failed to generate Marketing SWOT',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate Company Profile analysis for a stock symbol
   */
  async generateCompanyProfile(req: Request, res: Response): Promise<void> {
    try {
      const { stockSymbol } = req.body;

      if (!stockSymbol || typeof stockSymbol !== 'string') {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Stock symbol is required and must be a string'
        });
        return;
      }

      if (!this.geminiService) {
        res.status(503).json({
          error: 'Service unavailable',
          message: 'AI service is not available'
        });
        return;
      }

      const result = await this.geminiService.generateCompanyProfile(stockSymbol.toUpperCase().trim());
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json({
          error: 'Failed to generate Company Profile',
          message: result.error || 'Company profile analysis failed'
        });
      }

    } catch (error) {
      console.error('Error generating Company Profile:', error);
      res.status(500).json({
        error: 'Failed to generate Company Profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Helper function to get homepage URL for a news source
   */
  private getSourceHomepageUrl(source: string): string {
    const sourceLower = source.toLowerCase();
    
    if (sourceLower.includes('adweek')) return 'https://www.adweek.com';
    if (sourceLower.includes('adage')) return 'https://adage.com';
    if (sourceLower.includes('digiday')) return 'https://digiday.com';
    if (sourceLower.includes('drum')) return 'https://www.thedrum.com';
    if (sourceLower.includes('adexchanger')) return 'https://www.adexchanger.com';
    if (sourceLower.includes('marketecture')) return 'https://marketecture.com';
    if (sourceLower.includes('marketing land')) return 'https://marketingland.com';
    if (sourceLower.includes('substack')) return 'https://substack.com';
    
    // Default fallback
    return '#';
  }

  /**
   * Generate Marketing News headlines and summaries
   */
  async generateMarketingNews(req: Request, res: Response): Promise<void> {
    try {
      console.log('📰 Marketing News request received');
      const { query } = req.body || {};
      console.log('📰 User query for news context:', query);

      if (!this.geminiService) {
        res.status(503).json({
          error: 'Service unavailable',
          message: 'AI service is not available'
        });
        return;
      }

      const result = await this.geminiService.generateMarketingNews(query);
      
      // Always provide data, even if the result is not successful
      let transformedData;
      
      if (result.success && result.data && result.data.newsItems && result.data.newsItems.length > 0) {
        // Transform the successful data to match the frontend MarketingNews interface
        transformedData = {
          marketingNews: result.data.newsItems.map((item: any) => {
            const source = item.source || 'Industry Source';
            const originalUrl = item.url || '#';
            // If URL is '#', use the source's homepage instead
            const url = originalUrl === '#' ? this.getSourceHomepageUrl(source) : originalUrl;
            
            return {
              id: item.id || `news-${Date.now()}-${Math.random()}`,
              headline: item.headline || 'Marketing News Item',
              source: source,
              synopsis: item.synopsis || 'Latest marketing industry updates.',
              companies: item.companies || [],
              keyInsights: item.keyInsights || [],
              url: url,
              publishDate: item.publishDate || new Date().toISOString().split('T')[0],
              relevanceScore: item.relevanceScore || 0.8
            };
          }),
          aiResponse: result.data.aiResponse || 'Here are the latest marketing and advertising headlines.'
        };
        
        console.log(`✅ Generated ${transformedData.marketingNews.length} marketing news items`);
      } else {
        // Provide fallback data if Gemini fails
        const fallbackDate = new Date().toISOString().split('T')[0];
        transformedData = {
          marketingNews: [
            {
              id: `fallback-1-${Date.now()}`,
              headline: "Marketing Technology Continues to Evolve",
              source: "AdWeek",
              synopsis: "Latest developments in marketing technology and AI-driven advertising solutions are reshaping how brands connect with consumers.",
              companies: ["Google", "Facebook", "Salesforce"],
              keyInsights: ["AI automation is transforming ad targeting", "Personalization at scale becoming standard", "ROI measurement tools advancing rapidly"],
              url: this.getSourceHomepageUrl("AdWeek"),
              publishDate: fallbackDate,
              relevanceScore: 0.9
            },
            {
              id: `fallback-2-${Date.now()}`,
              headline: "Privacy Regulations Impact Digital Advertising",
              source: "Digiday",
              synopsis: "New privacy regulations are forcing marketers to rethink their data collection and targeting strategies.",
              companies: ["Apple", "Google", "Meta"],
              keyInsights: ["First-party data becoming essential", "Contextual targeting gaining importance", "Transparency requirements increasing"],
              url: this.getSourceHomepageUrl("Digiday"),
              publishDate: fallbackDate,
              relevanceScore: 0.8
            },
            {
              id: `fallback-3-${Date.now()}`,
              headline: "Social Media Platforms Update Advertising Tools",
              source: "Marketing Land",
              synopsis: "Major social media platforms are rolling out new advertising features and measurement capabilities for brands.",
              companies: ["TikTok", "Instagram", "LinkedIn"],
              keyInsights: ["Short-form video content driving engagement", "AI-powered ad creation tools expanding", "Cross-platform attribution improving"],
              url: this.getSourceHomepageUrl("Marketing Land"),
              publishDate: fallbackDate,
              relevanceScore: 0.7
            }
          ],
          aiResponse: result.error ? `Generated fallback marketing news due to: ${result.error}` : 'Here are the latest marketing and advertising headlines.'
        };
        
        console.log(`⚠️ Using fallback marketing news due to: ${result.error || 'Unknown error'}`);
      }
      
      res.json(transformedData);

    } catch (error) {
      console.error('Error generating Marketing News:', error);
      
      // Provide fallback data even on complete failure
      const fallbackDate = new Date().toISOString().split('T')[0];
      const fallbackData = {
        marketingNews: [
          {
            id: `error-fallback-1-${Date.now()}`,
            headline: "Marketing Industry Updates",
            source: "Industry News",
            synopsis: "Latest marketing and advertising industry developments and trends.",
            companies: ["Various Tech Companies"],
            keyInsights: ["Industry trends evolving", "New technologies emerging"],
            url: "#",
            publishDate: fallbackDate,
            relevanceScore: 0.7
          },
          {
            id: `error-fallback-2-${Date.now()}`,
            headline: "Digital Marketing Trends",
            source: "Marketing Weekly",
            synopsis: "Current trends in digital marketing, including AI, automation, and measurement solutions.",
            companies: ["Marketing Platforms", "Analytics Tools"],
            keyInsights: ["AI adoption accelerating", "Measurement becoming more sophisticated"],
            url: "#",
            publishDate: fallbackDate,
            relevanceScore: 0.8
          }
        ],
        aiResponse: 'Here are the latest marketing and advertising headlines. Please note that real-time news may be temporarily unavailable.'
      };
      
      console.log('⚠️ Providing fallback marketing news due to error');
      res.json(fallbackData);
    }
  }

  /**
   * Generate competitive intelligence analysis
   */
  async generateCompetitiveIntelligence(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query is required and must be a string' });
        return;
      }
      if (!this.geminiService) {
        res.status(503).json({ error: 'AI service not available' });
        return;
      }
      const result = await this.geminiService.generateCompetitiveIntelligence(query);
      res.json(result);
    } catch (error) {
      console.error('Error generating competitive intelligence:', error);
      res.status(500).json({ error: 'Failed to generate competitive intelligence' });
    }
  }

  /**
   * Generate content strategy recommendations
   */
  async generateContentStrategy(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query is required and must be a string' });
        return;
      }
      if (!this.geminiService) {
        res.status(503).json({ error: 'AI service not available' });
        return;
      }
      const result = await this.geminiService.generateContentStrategy(query);
      res.json(result);
    } catch (error) {
      console.error('Error generating content strategy:', error);
      res.status(500).json({ error: 'Failed to generate content strategy' });
    }
  }

  /**
   * Generate brand strategy frameworks
   */
  async generateBrandStrategy(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query is required and must be a string' });
        return;
      }
      if (!this.geminiService) {
        res.status(503).json({ error: 'AI service not available' });
        return;
      }
      const result = await this.geminiService.generateBrandStrategy(query);
      res.json(result);
    } catch (error) {
      console.error('Error generating brand strategy:', error);
      res.status(500).json({ error: 'Failed to generate brand strategy' });
    }
  }

  /**
   * Filter deals based on search criteria
   */
  private filterDeals(deals: Deal[], filters: DealFilters): Deal[] {
    return deals.filter(deal => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          deal.dealName.toLowerCase().includes(searchLower) ||
          deal.description.toLowerCase().includes(searchLower) ||
          deal.targeting.toLowerCase().includes(searchLower) ||
          deal.environment.toLowerCase().includes(searchLower) ||
          deal.mediaType.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Targeting filter
      if (filters.targeting && deal.targeting !== filters.targeting) {
        return false;
      }

      // Environment filter
      if (filters.environment && deal.environment !== filters.environment) {
        return false;
      }

      // Media Type filter
      if (filters.mediaType && deal.mediaType !== filters.mediaType) {
        return false;
      }

      // Date range filter
      if (filters.dateRange?.start) {
        const startDate = new Date(filters.dateRange.start);
        const dealFlightDate = new Date(deal.flightDate);
        if (dealFlightDate < startDate) return false;
      }

      if (filters.dateRange?.end) {
        const endDate = new Date(filters.dateRange.end);
        const dealFlightDate = new Date(deal.flightDate);
        if (dealFlightDate > endDate) return false;
      }

      return true;
    });
  }

  /**
   * Generate geographic insights using AI
   */
  async generateGeographicInsights(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;
      
      if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
      }

      if (!this.geminiService) {
        res.status(500).json({ error: 'AI service not available' });
        return;
      }

      console.log(`🔍 Generating geographic insights for: "${query}"`);
      
      const result = await this.geminiService.generateGeographicInsights(query);
      
      res.json(result);
      
    } catch (error) {
      console.error('Error generating geographic insights:', error);
      res.status(500).json({ error: 'Failed to generate geographic insights' });
    }
  }

  /**
   * Load census data from CSV file
   */
  async loadCensusData(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 Loading census data...');
      const result = await this.censusDataService.loadCensusData();
      
      res.json({
        message: result.success ? 'Census data loaded successfully' : 'Failed to load census data',
        ...result
      });
      
    } catch (error) {
      console.error('Error loading census data:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to load census data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Query census data with filters
   */
  async queryCensusData(req: Request, res: Response): Promise<void> {
    try {
      const filters: CensusQueryFilters = req.body;
      console.log('🔍 Querying census data with filters:', filters);
      
      const insights = await this.censusDataService.queryCensusData(filters);
      
      res.json({
        success: true,
        data: insights
      });
      
    } catch (error) {
      console.error('Error querying census data:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to query census data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get census data for specific zip codes
   */
  async getZipCodeData(req: Request, res: Response): Promise<void> {
    try {
      const { zipCodes } = req.body;
      
      if (!Array.isArray(zipCodes) || zipCodes.length === 0) {
        res.status(400).json({ 
          success: false,
          error: 'zipCodes must be a non-empty array'
        });
        return;
      }
      
      console.log('📍 Getting census data for zip codes:', zipCodes);
      const data = await this.censusDataService.getZipCodeData(zipCodes);
      
      res.json({
        success: true,
        data,
        count: data.length
      });
      
    } catch (error) {
      console.error('Error getting zip code data:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get zip code data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Search zip codes by location
   */
  async searchZipCodesByLocation(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        res.status(400).json({ 
          success: false,
          error: 'query must be a non-empty string'
        });
        return;
      }
      
      console.log('🔍 Searching zip codes by location:', query);
      const results = await this.censusDataService.searchZipCodesByLocation(query);
      
      res.json({
        success: true,
        data: results,
        count: results.length,
        query
      });
      
    } catch (error) {
      console.error('Error searching zip codes:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to search zip codes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get census data status
   */
  async getCensusDataStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = this.censusDataService.getDataStatus();
      
      res.json({
        success: true,
        data: status
      });
      
    } catch (error) {
      console.error('Error getting census data status:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get census data status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Load commerce audience data from CSV
   */
  async loadCommerceAudienceData(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 Loading commerce audience data...');
      const result = await commerceAudienceService.loadCommerceData();
      
      res.json({
        message: result.message,
        success: result.success,
        ...result.stats
      });
      
    } catch (error) {
      console.error('Error loading commerce audience data:', error);
      res.status(500).json({
        error: 'Failed to load commerce audience data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get commerce audience segments
   */
  async getCommerceAudienceSegments(req: Request, res: Response): Promise<void> {
    try {
      const segments = commerceAudienceService.getAudienceSegments();
      
      res.json({
        success: true,
        segments,
        total: segments.length
      });
      
    } catch (error) {
      console.error('Error getting audience segments:', error);
      res.status(500).json({
        error: 'Failed to get audience segments',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Search ZIP codes by audience segment
   */
  async searchZipCodesByAudience(req: Request, res: Response): Promise<void> {
    try {
      const { audienceName, limit = 50 } = req.body;
      
      if (!audienceName) {
        res.status(400).json({ error: 'Audience name is required' });
        return;
      }

      console.log(`🔍 Searching ZIP codes for audience: ${audienceName}`);
      
      const zipCodes = commerceAudienceService.searchZipCodesByAudience(audienceName, limit);
      
      res.json({
        success: true,
        audienceName,
        zipCodes,
        count: zipCodes.length,
        total: zipCodes.reduce((sum, zip) => sum + zip.weight, 0)
      });
      
    } catch (error) {
      console.error('Error searching ZIP codes by audience:', error);
      res.status(500).json({
        error: 'Failed to search ZIP codes by audience',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get audience data for specific ZIP codes
   */
  async getAudienceDataForZipCodes(req: Request, res: Response): Promise<void> {
    try {
      const { zipCodes } = req.body;
      
      if (!zipCodes || !Array.isArray(zipCodes)) {
        res.status(400).json({ error: 'ZIP codes array is required' });
        return;
      }

      console.log(`🔍 Getting audience data for ${zipCodes.length} ZIP codes`);
      
      const audienceData = commerceAudienceService.getAudienceDataForZipCodes(zipCodes);
      
      res.json({
        success: true,
        zipCodes: zipCodes,
        audienceData,
        count: audienceData.length
      });
      
    } catch (error) {
      console.error('Error getting audience data for ZIP codes:', error);
      res.status(500).json({
        error: 'Failed to get audience data for ZIP codes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get commerce audience service status
   */
  async getCommerceAudienceStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = commerceAudienceService.getStatus();
      
      res.json({
        success: true,
        ...status
      });
      
    } catch (error) {
      console.error('Error getting commerce audience status:', error);
      res.status(500).json({
        error: 'Failed to get commerce audience status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate Audience Geo-Deep-Dive report
   */
  async generateAudienceGeoDeepDive(req: Request, res: Response): Promise<void> {
    try {
      const { audienceSegment, geoScope } = req.body;
      
      if (!audienceSegment) {
        res.status(400).json({ error: 'Audience segment is required' });
        return;
      }

      console.log(`🎯 Generating Audience Geo-Deep-Dive for: ${audienceSegment}${geoScope ? ` in ${geoScope}` : ''}`);
      
      const report = await audienceGeoAnalysisService.generateAudienceGeoDeepDive(
        audienceSegment, 
        geoScope
      );
      
      res.json({
        success: true,
        report
      });
      
    } catch (error) {
      console.error('Error generating audience geo deep dive:', error);
      res.status(500).json({
        error: 'Failed to generate audience geo analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get available audience segments for geo analysis
   */
  async getAvailableAudienceSegments(req: Request, res: Response): Promise<void> {
    try {
      const segments = audienceGeoAnalysisService.getAvailableAudienceSegments();
      
      res.json({
        success: true,
        segments,
        count: segments.length
      });
      
    } catch (error) {
      console.error('Error getting available audience segments:', error);
      res.status(500).json({
        error: 'Failed to get available audience segments',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate persona card for a segment (lightweight version of full report)
   */
  async generatePersonaCard(req: Request, res: Response): Promise<void> {
    try {
      const { segment, category } = req.body;
      
      if (!segment) {
        res.status(400).json({ 
          success: false,
          error: 'Audience segment is required' 
        });
        return;
      }

      console.log(`👤 Generating Persona Card for: ${segment}${category ? ` (${category})` : ''}`);
      
      // Generate full report (uses cache if available)
      const report = await audienceInsightsService.generateReport(segment, category, false);
      
      // Extract just the persona data
      const personaCard = {
        id: segment,
        name: report.personaName,
        emoji: report.personaEmoji,
        segment: report.segment,
        category: report.category,
        description: report.strategicInsights.targetPersona,
        demographics: {
          age: report.keyMetrics.topAgeBracket,
          income: `$${report.keyMetrics.medianHHI.toLocaleString()}`,
          location: report.geographicHotspots.slice(0, 3).map(h => `${h.city}, ${h.state}`).join('; '),
          interests: report.behavioralOverlap.slice(0, 3).map(o => o.segment)
        },
        insights: report.strategicInsights.targetPersona,
        keyMetrics: report.keyMetrics,
        topMarkets: report.geographicHotspots.slice(0, 3),
        crossPurchases: report.behavioralOverlap.slice(0, 3),
        messagingRecommendations: report.strategicInsights.messagingRecommendations,
        channelRecommendations: report.strategicInsights.channelRecommendations
      };
      
      res.json({
        success: true,
        persona: personaCard
      });
      
    } catch (error) {
      console.error('Error generating persona card:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate persona card',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate comprehensive audience insights report (new tool)
   */
  async generateAudienceInsightsReport(req: Request, res: Response): Promise<void> {
    try {
      const { segment, category, includeCommercialZips } = req.body;
      
      if (!segment) {
        res.status(400).json({ 
          success: false,
          error: 'Audience segment is required' 
        });
        return;
      }

      console.log(`🎯 Generating Audience Insights Report for: ${segment}${category ? ` (${category})` : ''}`);
      console.log(`   Include Commercial ZIPs: ${includeCommercialZips ? 'YES' : 'NO (default: residential only)'}`);
      
      const report = await audienceInsightsService.generateReport(segment, category, includeCommercialZips || false);
      
      // Get recommended deals using simple keyword matching
      let allDeals: Deal[] = [];
      try {
        allDeals = await this.appsScriptService.getAllDeals();
      } catch (error) {
        console.error('❌ Apps Script service unavailable for audience insights:', error instanceof Error ? error.message : 'Unknown error');
        // Don't fallback to sample deals - return empty recommended deals
        allDeals = [];
      }
      const recommendedDeals = await audienceInsightsService.getRecommendedDeals(segment, category, allDeals);
      
      res.json({
        success: true,
        report,
        recommendedDeals
      });
      
    } catch (error) {
      console.error('Error generating audience insights:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate audience insights',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get audience geo analysis service status
   */
  async getAudienceGeoAnalysisStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = audienceGeoAnalysisService.getStatus();
      
      res.json({
        success: true,
        ...status
      });
      
    } catch (error) {
      console.error('Error getting audience geo analysis status:', error);
      res.status(500).json({
        error: 'Failed to get audience geo analysis status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate PDF export for audience geo analysis
   */
  async exportAudienceGeoAnalysisPDF(req: Request, res: Response): Promise<void> {
    try {
      const { report } = req.body;
      
      if (!report) {
        res.status(400).json({ error: 'Report data is required' });
        return;
      }

      // For now, return the report data with a flag indicating it should be converted to PDF
      // In a full implementation, you would use a PDF generation library like Puppeteer or jsPDF
      
      res.json({
        success: true,
        message: 'PDF export ready for implementation',
        report: {
          ...report,
          exportFormat: 'PDF',
          exportTimestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Error exporting audience geo analysis PDF:', error);
      res.status(500).json({
        error: 'Failed to export PDF',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get sample deals for fallback when Apps Script is unavailable
   */
  private getSampleDeals(): Deal[] {
    const now = new Date().toISOString();
    
    return [
      {
        id: 'sample-001',
        dealName: 'CommerceData_Electronics_Premium',
        dealId: 'ECOM-ELEC-001',
        description: 'Target high-value electronics shoppers with proven purchase intent',
        targeting: 'Electronics shoppers, Premium devices',
        environment: 'Production',
        mediaType: 'Multi-format',
        flightDate: '2024-01-15',
        bidGuidance: '$3.50 - $4.50 CPM',
        createdBy: 'System',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'sample-002',
        dealName: 'CommerceData_Apparel_Fashion',
        dealId: 'ECOM-FASH-002',
        description: 'Reach fashion-forward shoppers actively browsing clothing and accessories',
        targeting: 'Fashion shoppers, Apparel buyers',
        environment: 'Production',
        mediaType: 'Display',
        flightDate: '2024-02-01',
        bidGuidance: '$2.80 - $3.20 CPM',
        createdBy: 'System',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'sample-003',
        dealName: 'CommerceData_Home_Garden',
        dealId: 'ECOM-HOME-003',
        description: 'Connect with home improvement enthusiasts and garden shoppers',
        targeting: 'Home & Garden buyers',
        environment: 'Production',
        mediaType: 'Native',
        flightDate: '2024-01-20',
        bidGuidance: '$2.50 - $3.00 CPM',
        createdBy: 'System',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'sample-004',
        dealName: 'CommerceData_Health_Beauty',
        dealId: 'ECOM-HB-004',
        description: 'Target health and beauty shoppers with high purchase frequency',
        targeting: 'Health & Beauty shoppers',
        environment: 'Production',
        mediaType: 'Video',
        flightDate: '2024-02-10',
        bidGuidance: '$3.00 - $3.50 CPM',
        createdBy: 'System',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'sample-005',
        dealName: 'CommerceData_Baby_Toddler',
        dealId: 'ECOM-BABY-005',
        description: 'Reach new parents and caregivers shopping for baby products',
        targeting: 'Baby & Toddler shoppers, New parents',
        environment: 'Production',
        mediaType: 'Multi-format',
        flightDate: '2024-01-25',
        bidGuidance: '$3.80 - $4.20 CPM',
        createdBy: 'System',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'sample-006',
        dealName: 'CommerceData_Pet_Supplies',
        dealId: 'ECOM-PET-006',
        description: 'Target pet owners actively purchasing pet food and supplies',
        targeting: 'Pet owners, Animal care shoppers',
        environment: 'Production',
        mediaType: 'Display',
        flightDate: '2024-02-05',
        bidGuidance: '$2.90 - $3.40 CPM',
        createdBy: 'System',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'sample-007',
        dealName: 'CommerceData_Sporting_Goods',
        dealId: 'ECOM-SPORT-007',
        description: 'Connect with active lifestyle and fitness enthusiasts',
        targeting: 'Sporting goods shoppers, Fitness buyers',
        environment: 'Production',
        mediaType: 'CTV',
        flightDate: '2024-01-30',
        bidGuidance: '$3.20 - $3.70 CPM',
        createdBy: 'System',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'sample-008',
        dealName: 'CommerceData_Food_Beverage',
        dealId: 'ECOM-FOOD-008',
        description: 'Target food and beverage shoppers with high repeat purchase rates',
        targeting: 'Food shoppers, Beverage buyers',
        environment: 'Production',
        mediaType: 'Native',
        flightDate: '2024-02-15',
        bidGuidance: '$2.60 - $3.10 CPM',
        createdBy: 'System',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'sample-009',
        dealName: 'CommerceData_Furniture',
        dealId: 'ECOM-FURN-009',
        description: 'Reach high-value furniture shoppers with strong purchase intent',
        targeting: 'Furniture buyers, Home furnishing shoppers',
        environment: 'Production',
        mediaType: 'Video',
        flightDate: '2024-01-18',
        bidGuidance: '$4.00 - $4.50 CPM',
        createdBy: 'System',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'sample-010',
        dealName: 'CommerceData_Toys_Games',
        dealId: 'ECOM-TOY-010',
        description: 'Target parents and gift-givers shopping for toys and games',
        targeting: 'Toy shoppers, Parents, Gift buyers',
        environment: 'Production',
        mediaType: 'Multi-format',
        flightDate: '2024-02-20',
        bidGuidance: '$3.30 - $3.80 CPM',
        createdBy: 'System',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'sample-011',
        dealName: 'Athletics_Purchase_Intender',
        dealId: 'ATHLETICS-001',
        description: 'Target sports fans actively shopping for athletic gear and equipment',
        targeting: 'Sports fans, Athletics enthusiasts, Team supporters',
        environment: 'Production',
        mediaType: 'CTV',
        flightDate: '2024-02-25',
        bidGuidance: '$3.50 - $4.00 CPM',
        createdBy: 'System',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'sample-012',
        dealName: 'Exercise_Fitness_Purchase_Intender',
        dealId: 'FITNESS-001',
        description: 'Reach fitness enthusiasts shopping for exercise equipment and activewear',
        targeting: 'Fitness enthusiasts, Exercise equipment buyers, Workout gear shoppers',
        environment: 'Production',
        mediaType: 'Video',
        flightDate: '2024-03-01',
        bidGuidance: '$3.20 - $3.80 CPM',
        createdBy: 'System',
        createdAt: now,
        updatedAt: now
      }
    ];
  }

}
