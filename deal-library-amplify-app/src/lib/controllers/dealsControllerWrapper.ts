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
      const { commerceAudienceService } = await import('../services/commerceAudienceService');
      const segments = await commerceAudienceService.getSegments?.() || [];
      return { success: true, segments };
    } catch (error) {
      console.error('Error getting commerce segments:', error);
      return { success: false, segments: [], error: String(error) };
    }
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
