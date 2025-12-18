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
        
        if (segmentNames.length > 0) {
          console.log(`✅ Fast query returned ${segmentNames.length} segments`);
          return { success: true, segments: segmentNames };
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

  // Search deals with AI directly
  async searchDealsAIDirect(body: any): Promise<any> {
    try {
      const deals = await this.getAllDeals();
      const query = body.query?.toLowerCase() || '';
      
      // Check if this is a persona-based deal request
      const isPersonaDealRequest = (query.includes('deals for') || query.includes('request deals')) && 
                                   query.includes('persona');
      
      if (isPersonaDealRequest) {
        console.log(`🎯 Detected persona-based deal request in searchDealsAIDirect: "${query}"`);
        
        // Import personaService
        const { personaService } = await import('../services/personaService');
        const allPersonas = personaService.getAllPersonas();
        let matchedPersona: any = null;
        
        // Find persona that matches the query
        for (const persona of allPersonas) {
          const personaNameLower = (persona.personaName || '').toLowerCase();
          if (query.includes(personaNameLower)) {
            matchedPersona = persona;
            console.log(`✅ Matched persona: ${persona.personaName} (${persona.segmentId})`);
            break;
          }
        }
        
        if (matchedPersona) {
          // Find deals that match this persona
          const matchingDeals = deals.filter((deal: any) => {
            const personaInsights = personaService.matchDealToPersona(deal.dealName);
            return personaInsights && personaInsights.segmentId === matchedPersona.segmentId;
          });
          
          if (matchingDeals.length > 0) {
            console.log(`🎯 Found ${matchingDeals.length} deals for persona: ${matchedPersona.personaName}`);
            return { 
              success: true, 
              deals: matchingDeals.slice(0, body.limit || 20),
              total: matchingDeals.length,
              aiResponse: `Found ${matchingDeals.length} deals for ${matchedPersona.emoji} ${matchedPersona.personaName}. These deals are specifically matched to this persona's interests and behaviors.`
            };
          } else {
            // Fallback: find deals by category
            console.log(`⚠️ No exact persona matches, trying category-based search for: ${matchedPersona.category}`);
            const categoryKeywords = (matchedPersona.category || '').toLowerCase().split(/[\s&]+/);
            
            const categoryDeals = deals.filter((deal: any) => {
              const dealName = (deal.dealName || '').toLowerCase();
              const dealDesc = (deal.description || '').toLowerCase();
              return categoryKeywords.some((kw: string) => kw.length > 2 && (dealName.includes(kw) || dealDesc.includes(kw)));
            });
            
            if (categoryDeals.length > 0) {
              console.log(`📂 Found ${categoryDeals.length} deals by category keywords`);
              return {
                success: true,
                deals: categoryDeals.slice(0, body.limit || 20),
                total: categoryDeals.length,
                aiResponse: `Found ${categoryDeals.length} deals related to ${matchedPersona.emoji} ${matchedPersona.personaName}'s category: ${matchedPersona.category}.`
              };
            }
          }
        }
      }
      
      // Standard keyword filtering for non-persona requests
      const filtered = query ? deals.filter((deal: any) => 
        deal.dealName?.toLowerCase().includes(query) ||
        deal.description?.toLowerCase().includes(query) ||
        deal.targeting?.toLowerCase().includes(query)
      ) : deals;
      
      return { 
        success: true, 
        deals: filtered.slice(0, body.limit || 20),
        total: filtered.length
      };
    } catch (error) {
      console.error('Error searching deals:', error);
      return { success: false, deals: [], error: String(error) };
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
