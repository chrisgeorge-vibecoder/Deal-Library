/**
 * Deals Controller Wrapper for Next.js API Routes
 * 
 * This wrapper provides *Direct methods that bypass Express req/res handling
 * and return data directly for use with Next.js API routes.
 * 
 * FIXED: Now properly connects to GeminiService for AI-powered features
 */

import { DealsController } from './dealsController';
import { GeminiService } from '../services/geminiService';

// Singleton GeminiService instance
let geminiServiceInstance: GeminiService | null = null;

function getGeminiService(): GeminiService {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService();
  }
  return geminiServiceInstance;
}

// Create a wrapped version of DealsController with Direct methods
export class DealsControllerWrapper extends DealsController {
  
  // Get census data status directly
  async getCensusDataStatusDirect(): Promise<any> {
    try {
      const { CensusDataService } = await import('../services/censusDataService');
      const censusService = CensusDataService.getInstance();
      const status = censusService.getDataStatus();
      return {
        loaded: status.loaded,
        recordCount: status.totalZipCodes,
        status: 'ok'
      };
    } catch (error) {
      console.error('Error getting census status:', error);
      return { loaded: false, recordCount: 0, status: 'error', error: String(error) };
    }
  }

  // Get commerce audience segments directly
  async getCommerceAudienceSegmentsDirect(): Promise<any> {
    try {
      console.log('🔄 ===== getCommerceAudienceSegmentsDirect() called =====');
      const { commerceAudienceService } = await import('../services/commerceAudienceService');
      
      // Try the optimized direct Supabase query first (fast - no full data load)
      try {
        console.log('🚀 Trying optimized direct Supabase query for segment names...');
        const segmentNames = await commerceAudienceService.getSegmentNamesFromSupabase();
        
        // If we got a reasonable number of segments (more than 10), use them
        // Otherwise, fall back to full data load to ensure we have all segments
        if (segmentNames.length > 10) {
          console.log(`✅ Fast query returned ${segmentNames.length} segments (using fast path)`);
          return { success: true, segments: segmentNames };
        } else if (segmentNames.length > 0) {
          console.warn(`⚠️ Fast query returned only ${segmentNames.length} segments (expected more), falling back to full data load`);
          console.log(`   Segments found: ${segmentNames.join(', ')}`);
        } else {
          console.warn('⚠️ Fast query returned 0 segments, falling back to full data load');
        }
      } catch (fastQueryError) {
        console.warn('⚠️ Fast query failed, falling back to full data load:', 
          fastQueryError instanceof Error ? fastQueryError.message : fastQueryError);
      }
      
      // Fallback: Load all data (slower, but works if fast query fails)
      console.log('🔄 Falling back to full data load...');
      let status = commerceAudienceService.getStatus();
      console.log('📊 Commerce data status:', { 
        isLoaded: status.isLoaded, 
        totalRecords: status.totalRecords,
        audienceSegments: status.audienceSegments?.length || 0
      });
      
      if (!status.isLoaded || status.totalRecords === 0) {
        console.log('🔄 Commerce data not loaded, loading now...');
        const loadResult = await commerceAudienceService.loadCommerceData();
        console.log('📦 Load result:', { 
          success: loadResult.success, 
          message: loadResult.message,
          stats: loadResult.stats ? {
            totalRecords: loadResult.stats.totalRecords,
            audienceSegmentCount: loadResult.stats.audienceSegmentCount || loadResult.stats.audienceSegments?.length
          } : null
        });
        
        if (!loadResult.success) {
          const errorMsg = `Commerce data failed to load: ${loadResult.message}`;
          console.error(`❌ ${errorMsg}`);
          throw new Error(errorMsg);
        }
        
        // Check status again after loading
        status = commerceAudienceService.getStatus();
        console.log('📊 Commerce data status after load:', { 
          isLoaded: status.isLoaded, 
          totalRecords: status.totalRecords,
          audienceSegments: status.audienceSegments?.length || 0
        });
        
        if (!status.isLoaded || status.totalRecords === 0) {
          const errorMsg = 'Commerce data failed to load. Check logs above for detailed error information.';
          console.error(`❌ ${errorMsg}`);
          throw new Error(errorMsg);
        }
      }
      
      // Get segments using the correct method name
      const segments = commerceAudienceService.getAudienceSegments();
      console.log(`📋 Found ${segments.length} segments from commerce service`);
      
      if (segments.length === 0) {
        const errorMsg = 'No segments found after loading data. This indicates a data processing issue.';
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      // Return in the expected format: array of segment names (strings)
      const segmentNames = segments.map(seg => seg.name).filter(name => name && name.trim() !== '');
      console.log(`✅ Returning ${segmentNames.length} segment names`);
      
      if (segmentNames.length === 0) {
        const errorMsg = 'All segment names were empty after processing.';
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      console.log(`✅ Successfully returning ${segmentNames.length} segments`);
      console.log(`   Sample segments: ${segmentNames.slice(0, 10).join(', ')}...`);
      return { success: true, segments: segmentNames };
    } catch (error) {
      console.error('❌ ===== ERROR in getCommerceAudienceSegmentsDirect() =====');
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Return error details instead of sample data
      return { 
        success: false, 
        segments: [], 
        error: error instanceof Error ? error.message : String(error),
        errorDetails: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      };
    }
  }

  // Get sample segments as fallback
  private getSampleSegments(): any {
    const sampleSegments = [
      'Animals & Pet Supplies', 'Cat Supplies', 'Dog Supplies', 'Pet Supplies',
      'Activewear', 'Clothing', 'Shoes', 'Outerwear', 'Sunglasses',
      'Home Appliances', 'Small Kitchen Appliances', 'Vacuums',
      'TVs', 'Cameras & Photography', 'Audio Equipment',
      'Luggage & Bags', 'Camping & Hiking', 'Cycling', 'Fitness Equipment',
      'Baby Care', 'Baby & Toddler Toys', 'Nursing & Feeding',
      'Office Supplies', 'Office Instruments', 'Desk Accessories',
      'Food', 'Beverages', 'Bakery', 'Grocery', 'Sweets & Treats',
      'Home Decor', 'Furniture', 'Bedding', 'Bathroom Accessories',
      'Toys & Games', 'Board Games', 'Puzzles', 'Action Figures',
      'Vitamins & Supplements', 'Personal Care', 'Oral Care',
      'Hardware', 'Building Materials', 'Plumbing Fixtures & Equipment',
      'Apparel', 'Arts & Crafts', 'Bags & Luggage', 'Cameras & Optics',
      'Electronics', 'Health & Beauty', 'Home & Garden', 'Media',
      'Sporting Goods', 'Toys', 'Vehicles & Parts',
      'Health & Beauty', 'Cosmetics', 'Personal Care', 'Oral Care',
      'Furniture', 'Office Furniture', 'Home & Garden',
      'Business & Industrial', 'Office Supplies', 'General Office Supplies'
    ];
    
    console.log(`📋 Returning ${sampleSegments.length} sample segments as fallback`);
    return { success: true, segments: sampleSegments };
  }

  // Get commerce audience status directly
  async getCommerceAudienceStatusDirect(): Promise<any> {
    try {
      const { commerceAudienceService } = await import('../services/commerceAudienceService');
      const status = commerceAudienceService.getStatus();
      return {
        loaded: status.isLoaded,
        status: 'ok'
      };
    } catch (error) {
      console.error('Error getting commerce status:', error);
      return { loaded: false, status: 'error', error: String(error) };
    }
  }

  // Submit custom deal request directly
  async submitCustomDealRequestDirect(body: any): Promise<any> {
    try {
      // For now, return a success response - implement actual logic as needed
      return { success: true, message: 'Custom deal request received', data: body };
    } catch (error) {
      console.error('Error submitting custom deal request:', error);
      return { success: false, error: String(error) };
    }
  }

  // Search deals with AI directly - FIXED: Now uses Gemini like the full searchDealsAI method
  async searchDealsAIDirect(body: any): Promise<any> {
    try {
      const { query, conversationHistory, forceDeals } = body;
      
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return { 
          success: false,
          error: 'Search query is required',
          message: 'Please provide a valid search query'
        };
      }

      // Apply typo correction (simplified version)
      const correctedQuery = query.trim();
      
      console.log(`🔍 Hybrid AI Search request (Direct): "${query}"`);

      // Get all deals first
      let allDeals: any[] = [];
      
      try {
        allDeals = await this.getAllDeals();
      } catch (error) {
        console.warn('⚠️  Apps Script service unavailable for search:', error instanceof Error ? error.message : 'Unknown error');
        allDeals = [];
      }
      
      if (allDeals.length === 0) {
        return {
          success: true,
          deals: [],
          aiResponse: "No deals are currently available from the Apps Script data source.",
          searchMethod: 'apps-script',
          confidence: 0,
          query: correctedQuery
        };
      }

      // For serverless environments, limit deals sent to Gemini to avoid timeouts
      // Pre-filter deals using keyword matching to reduce the set
      const MAX_DEALS_FOR_GEMINI = 50; // Limit to top 50 deals for Gemini analysis
      let dealsForGemini = allDeals;
      
      if (allDeals.length > MAX_DEALS_FOR_GEMINI) {
        console.log(`📊 Pre-filtering ${allDeals.length} deals to ${MAX_DEALS_FOR_GEMINI} for Gemini analysis...`);
        const queryLower = correctedQuery.toLowerCase();
        const genericWords = new Set(['show', 'me', 'deals', 'for', 'the', 'and', 'with', 'find', 'get', 'looking', 'want', 'need']);
        const importantKeywords = queryLower
          .split(/\s+/)
          .filter(word => word.length > 2 && !genericWords.has(word));
        
        // Score and filter deals
        const scoredDeals = allDeals.map((deal: any) => {
          const dealText = `${deal.dealName} ${deal.description} ${deal.targeting}`.toLowerCase();
          let score = 0;
          
          for (const keyword of importantKeywords) {
            if (deal.dealName?.toLowerCase().includes(keyword)) score += 10;
            if (deal.description?.toLowerCase().includes(keyword)) score += 3;
            if (deal.targeting?.toLowerCase().includes(keyword)) score += 2;
          }
          
          return { deal, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_DEALS_FOR_GEMINI)
        .map(item => item.deal);
        
        dealsForGemini = scoredDeals;
        console.log(`✅ Pre-filtered to ${dealsForGemini.length} most relevant deals for Gemini`);
      }
      
      // Use Gemini to analyze and score deals (limited set for performance)
      const gemini = getGeminiService();
      
      try {
        console.log(`🤖 Using Gemini to analyze ${dealsForGemini.length} deals (Direct)...`);
        
        // Add a shorter timeout wrapper for serverless environments (18 seconds)
        // This must be less than the API route timeout (25 seconds) to allow time for response processing
        const geminiTimeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Gemini analysis timeout')), 18000);
        });
        
        const geminiPromise = gemini.analyzeAllDeals(correctedQuery, dealsForGemini, conversationHistory || [], forceDeals);
        
        const geminiResult = await Promise.race([geminiPromise, geminiTimeoutPromise]);
        
        // Check if this is a timeout response
        if (geminiResult.searchMethod === 'timeout-fallback') {
          console.log('⏰ Gemini timed out, using fallback search');
          // Simple fallback search
          const queryLower = correctedQuery.toLowerCase();
          const filtered = allDeals.filter((deal: any) => 
            deal.dealName?.toLowerCase().includes(queryLower) ||
            deal.description?.toLowerCase().includes(queryLower) ||
            deal.targeting?.toLowerCase().includes(queryLower)
          ).slice(0, 6);
          
          return {
            success: true,
            deals: filtered,
            aiResponse: `I found ${filtered.length} deals for your query.`,
            searchMethod: 'fallback-timeout',
            confidence: 0.6,
            query: correctedQuery,
            coaching: geminiResult.coaching
          };
        }
        
        // Check if this is a general question (market sizing, audience insights, etc.)
        // Even with forceDeals, if query is clearly not about deals, return AI response
        const queryLower = correctedQuery.toLowerCase();
        const nonDealKeywords = [
          'market size', 'market sizing', 'what is the market', 'how big is the market',
          'audience insight', 'demographic', 'persona', 'geographic', 'location analysis'
        ];
        const isNonDealQuery = nonDealKeywords.some(keyword => queryLower.includes(keyword));
        
        if (geminiResult.deals.length === 0 && geminiResult.aiResponse && 
            (!forceDeals || isNonDealQuery) && geminiResult.searchMethod !== 'error-fallback') {
          console.log('💬 General question detected, returning AI response without deals');
          return {
            success: true,
            deals: [],
            aiResponse: geminiResult.aiResponse,
            searchMethod: 'gemini-direct',
            confidence: geminiResult.confidence,
            query: correctedQuery,
            isGeneralQuestion: true,
            coaching: geminiResult.coaching
          };
        }
        
        // If forceDeals is true but no deals were returned, try to find some relevant deals
        // But only if the query is actually about deals
        if (forceDeals && geminiResult.deals.length === 0 && !isNonDealQuery) {
          console.log('🔧 Force deals mode: Finding relevant deals despite empty Gemini result');
          
          const genericWords = new Set(['show', 'me', 'deals', 'for', 'the', 'and', 'with', 'find', 'get', 'looking', 'want', 'need']);
          const importantKeywords = correctedQuery.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2 && !genericWords.has(word));
          
          const scoredDeals = allDeals.map((deal: any) => {
            const dealText = `${deal.dealName} ${deal.description} ${deal.targeting}`.toLowerCase();
            let score = 0;
            
            for (const keyword of importantKeywords) {
              if (deal.dealName?.toLowerCase().includes(keyword)) score += 10;
              if (deal.description?.toLowerCase().includes(keyword)) score += 3;
              if (deal.targeting?.toLowerCase().includes(keyword)) score += 2;
            }
            
            return { deal, score };
          })
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .map(item => item.deal);
          
          if (scoredDeals.length > 0) {
            return {
              success: true,
              deals: scoredDeals,
              aiResponse: geminiResult.aiResponse || `Here are ${scoredDeals.length} relevant deals for your query.`,
              searchMethod: 'gemini-direct-forced',
              confidence: 0.6,
              query: correctedQuery,
              isGeneralQuestion: false,
              coaching: geminiResult.coaching
            };
          }
        }
        
        console.log(`✅ Gemini found ${geminiResult.deals.length} relevant deals with confidence ${geminiResult.confidence}`);
        
        return {
          success: true,
          deals: geminiResult.deals,
          aiResponse: geminiResult.aiResponse,
          searchMethod: 'gemini-direct',
          confidence: geminiResult.confidence,
          query: correctedQuery,
          coaching: geminiResult.coaching
        };
        
      } catch (geminiError: any) {
        console.error('❌ Gemini search failed, falling back to rule-based search:', geminiError);
        
        // Check if it's a timeout error
        if (geminiError.message?.includes('timeout') || geminiError.name === 'AbortError') {
          console.log('⏰ Gemini timed out, using fast keyword fallback');
        }
        
        // Fallback to keyword-based search (already pre-filtered if we had >50 deals)
        const queryLower = correctedQuery.toLowerCase();
        const genericWords = new Set(['show', 'me', 'deals', 'for', 'the', 'and', 'with', 'find', 'get', 'looking', 'want', 'need']);
        const importantKeywords = queryLower
          .split(/\s+/)
          .filter(word => word.length > 2 && !genericWords.has(word));
        
        // Use the pre-filtered set if available, otherwise use all deals
        const dealsToSearch = dealsForGemini.length < allDeals.length ? dealsForGemini : allDeals;
        
        const scoredDeals = dealsToSearch.map((deal: any) => {
          const dealText = `${deal.dealName} ${deal.description} ${deal.targeting}`.toLowerCase();
          let score = 0;
          
          for (const keyword of importantKeywords) {
            if (deal.dealName?.toLowerCase().includes(keyword)) score += 10;
            if (deal.description?.toLowerCase().includes(keyword)) score += 3;
            if (deal.targeting?.toLowerCase().includes(keyword)) score += 2;
          }
          
          return { deal, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(item => item.deal);
        
        // If no scored matches, do simple substring matching
        const filtered = scoredDeals.length > 0 ? scoredDeals : dealsToSearch.filter((deal: any) => 
          deal.dealName?.toLowerCase().includes(queryLower) ||
          deal.description?.toLowerCase().includes(queryLower) ||
          deal.targeting?.toLowerCase().includes(queryLower)
        ).slice(0, 6);
        
        return {
          success: true,
          deals: filtered,
          aiResponse: filtered.length > 0 
            ? `I found ${filtered.length} relevant deals for your query.`
            : `I couldn't find specific deals matching "${correctedQuery}". Try searching for a category like "parents", "pets", or "fitness".`,
          searchMethod: 'fallback',
          confidence: 0.5,
          query: correctedQuery
        };
      }
      
    } catch (error) {
      console.error('❌ AI Search error (Direct):', error);
      return { 
        success: false, 
        deals: [], 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Unified search directly
  async unifiedSearchDirect(body: any): Promise<any> {
    try {
      const deals = await this.getAllDeals();
      const query = body.query?.toLowerCase() || '';
      
      // Simple filtering
      const filteredDeals = query ? deals.filter((deal: any) =>
        deal.dealName?.toLowerCase().includes(query) ||
        deal.description?.toLowerCase().includes(query)
      ).slice(0, 10) : deals.slice(0, 10);
      
      return {
        success: true,
        deals: filteredDeals,
        personas: [],
        audienceInsights: [],
        marketSizing: [],
        geoCards: []
      };
    } catch (error) {
      console.error('Error in unified search:', error);
      return { success: false, error: String(error) };
    }
  }

  // Get deal by ID directly
  async getDealByIdDirect(id: string): Promise<any> {
    try {
      const deals = await this.getAllDeals();
      return deals.find((deal: any) => deal.id === id || deal.dealId === id) || null;
    } catch (error) {
      console.error('Error getting deal by ID:', error);
      return null;
    }
  }

  // Update deal directly
  async updateDealDirect(id: string, data: any): Promise<any> {
    // Placeholder - implement actual update logic
    return { success: true, id, data };
  }

  // Create deal from body
  async createDealFromBody(body: any): Promise<any> {
    // Placeholder - implement actual create logic
    return { success: true, data: body };
  }

  // Generate audience insights directly - FIXED: Now uses GeminiService
  async generateAudienceInsightsDirect(body: any): Promise<any> {
    try {
      console.log('🎯 generateAudienceInsightsDirect called with:', body);
      const gemini = getGeminiService();
      const query = body.query || body.audience || 'general audience';
      
      const result = await gemini.generateAudienceInsights(query, body.conversationHistory);
      
      console.log('✅ Audience insights generated:', result.audienceInsights?.length || 0, 'insights');
      
      return {
        success: true,
        audienceInsights: result.audienceInsights || [],
        aiResponse: result.aiResponse || ''
      };
    } catch (error) {
      console.error('❌ Error generating audience insights:', error);
      return { 
        success: false, 
        audienceInsights: [],
        error: String(error) 
      };
    }
  }

  // Generate audience insights report directly
  async generateAudienceInsightsReportDirect(body: any): Promise<any> {
    try {
      return {
        success: true,
        report: {
          segment: body.segment || 'Unknown',
          summary: 'Report generated'
        }
      };
    } catch (error) {
      console.error('Error generating audience insights report:', error);
      return { success: false, error: String(error) };
    }
  }

  // Generate market sizing directly - FIXED: Now uses GeminiService
  async generateMarketSizingDirect(body: any): Promise<any> {
    try {
      console.log('📊 generateMarketSizingDirect called with:', body);
      const gemini = getGeminiService();
      const query = body.query || body.market || 'technology market';
      
      const result = await gemini.generateMarketSizing(query, body.conversationHistory);
      
      console.log('✅ Market sizing generated:', result.marketSizing?.length || 0, 'results');
      
      return {
        success: true,
        marketSizing: result.marketSizing || [],
        aiResponse: result.aiResponse || ''
      };
    } catch (error) {
      console.error('❌ Error generating market sizing:', error);
      return { 
        success: false, 
        marketSizing: [],
        error: String(error) 
      };
    }
  }

  // Generate geographic insights directly - FIXED: Now uses GeminiService
  async generateGeographicInsightsDirect(body: any): Promise<any> {
    try {
      console.log('🗺️ generateGeographicInsightsDirect called with:', body);
      const gemini = getGeminiService();
      const query = body.query || body.location || 'United States';
      
      const result = await gemini.generateGeographicInsights(query, body.conversationHistory);
      
      console.log('✅ Geographic insights generated:', result.geoCards?.length || 0, 'cards');
      
      return {
        success: true,
        geoCards: result.geoCards || [],
        aiResponse: result.aiResponse || ''
      };
    } catch (error) {
      console.error('❌ Error generating geographic insights:', error);
      return { 
        success: false, 
        geoCards: [],
        error: String(error) 
      };
    }
  }

  // Generate marketing SWOT directly - FIXED: Now uses GeminiService
  async generateMarketingSWOTDirect(body: any): Promise<any> {
    try {
      console.log('📈 generateMarketingSWOTDirect called with:', body);
      const gemini = getGeminiService();
      const companyName = body.companyName || body.company || body.query || 'Unknown Company';
      
      const result = await gemini.generateMarketingSWOT(companyName);
      
      console.log('✅ Marketing SWOT generated for:', companyName);
      
      return result;
    } catch (error) {
      console.error('❌ Error generating marketing SWOT:', error);
      return { 
        success: false, 
        error: String(error) 
      };
    }
  }

  // Generate company profile directly - FIXED: Now uses GeminiService
  async generateCompanyProfileDirect(body: any): Promise<any> {
    try {
      console.log('🏢 generateCompanyProfileDirect called with:', body);
      const gemini = getGeminiService();
      const stockSymbol = body.stockSymbol || body.symbol || body.query || 'AAPL';
      
      const result = await gemini.generateCompanyProfile(stockSymbol);
      
      console.log('✅ Company profile generated for:', stockSymbol);
      
      return result;
    } catch (error) {
      console.error('❌ Error generating company profile:', error);
      return { 
        success: false, 
        error: String(error) 
      };
    }
  }

  // Generate marketing news directly - FIXED: Now uses GeminiService
  async generateMarketingNewsDirect(body: any): Promise<any> {
    try {
      console.log('📰 generateMarketingNewsDirect called');
      const gemini = getGeminiService();
      
      const result = await gemini.generateMarketingNews(body.query);
      
      console.log('✅ Marketing news generated:', result.marketingNews?.length || 0, 'articles');
      
      return {
        success: true,
        marketingNews: result.marketingNews || [],
        aiResponse: result.aiResponse || ''
      };
    } catch (error) {
      console.error('❌ Error generating marketing news:', error);
      return { 
        success: false, 
        marketingNews: [],
        error: String(error) 
      };
    }
  }

  // Generate competitive intelligence directly - FIXED: Now uses GeminiService
  async generateCompetitiveIntelligenceDirect(body: any): Promise<any> {
    try {
      console.log('⚔️ generateCompetitiveIntelligenceDirect called with:', body);
      const gemini = getGeminiService();
      const query = body.query || body.company || 'technology industry';
      
      const result = await gemini.generateCompetitiveIntelligence(query);
      
      console.log('✅ Competitive intelligence generated for:', query);
      
      return result;
    } catch (error) {
      console.error('❌ Error generating competitive intelligence:', error);
      return { 
        success: false, 
        error: String(error) 
      };
    }
  }

  // Generate content strategy directly - FIXED: Now uses GeminiService
  async generateContentStrategyDirect(body: any): Promise<any> {
    try {
      console.log('📝 generateContentStrategyDirect called with:', body);
      const gemini = getGeminiService();
      const query = body.query || body.topic || 'digital marketing';
      
      const result = await gemini.generateContentStrategy(query);
      
      console.log('✅ Content strategy generated for:', query);
      
      return result;
    } catch (error) {
      console.error('❌ Error generating content strategy:', error);
      return { 
        success: false, 
        error: String(error) 
      };
    }
  }

  // Generate brand strategy directly - FIXED: Now uses GeminiService
  async generateBrandStrategyDirect(body: any): Promise<any> {
    try {
      console.log('🏆 generateBrandStrategyDirect called with:', body);
      const gemini = getGeminiService();
      const query = body.query || body.brand || 'brand strategy';
      
      const result = await gemini.generateBrandStrategy(query);
      
      console.log('✅ Brand strategy generated for:', query);
      
      return result;
    } catch (error) {
      console.error('❌ Error generating brand strategy:', error);
      return { 
        success: false, 
        error: String(error) 
      };
    }
  }

  // Generate persona card directly
  async generatePersonaCardDirect(body: any): Promise<any> {
    return {
      success: true,
      persona: {
        name: body.audience || 'Unknown Persona',
        description: 'Generated persona'
      }
    };
  }

  // Generate agent mode recommendation directly
  async generateAgentModeRecommendationDirect(body: any): Promise<any> {
    return {
      success: true,
      recommendation: {
        summary: 'Agent recommendation generated',
        deals: [],
        insights: []
      }
    };
  }

  // Parse brief directly
  async parseBriefDirect(body: any): Promise<any> {
    return {
      success: true,
      parsed: {
        objective: body.objective || '',
        audience: body.audience || '',
        budget: body.budget || ''
      }
    };
  }
}

// Export singleton instance
let controllerInstance: DealsControllerWrapper | null = null;

export function getDealsController(): DealsControllerWrapper {
  if (!controllerInstance) {
    controllerInstance = new DealsControllerWrapper();
  }
  return controllerInstance;
}
