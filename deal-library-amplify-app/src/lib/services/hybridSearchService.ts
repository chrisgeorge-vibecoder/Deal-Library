import { EmbeddingService, EmbeddingResult } from './embeddingService';
import { GeminiService } from './geminiService';
import { Deal } from '../types/deal';

export interface HybridSearchResult {
  deals: Deal[];
  aiResponse: string;
  searchMethod: 'hybrid' | 'vector' | 'gemini' | 'fallback';
  confidence: number;
  query: string;
}

export class HybridSearchService {
  private embeddingService: EmbeddingService;
  private geminiService: GeminiService | null = null;

  constructor(embeddingService: EmbeddingService, geminiService?: GeminiService) {
    this.embeddingService = embeddingService;
    this.geminiService = geminiService || null;
  }

  public async search(
    query: string, 
    allDeals: Deal[], 
    conversationHistory?: Array<{role: string, content: string, dealNames?: string[]}>
  ): Promise<HybridSearchResult> {
    console.log(`🔍 Hybrid search for: "${query}"`);

    try {
      // Step 1: Vector similarity search
      const vectorResults = await this.embeddingService.searchSimilar(query, 20);
      console.log(`📊 Vector search found ${vectorResults.length} similar deals`);
      
      // Debug: Log similarity scores
      vectorResults.slice(0, 5).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.deal.dealName} - similarity: ${result.similarity.toFixed(3)}`);
      });

      // Step 2: Filter results by similarity threshold
      const relevantDeals = vectorResults
        .filter(result => result.similarity > 0.1) // Only include deals with >10% similarity (lowered threshold)
        .slice(0, 10) // Limit to top 10 most similar
        .map(result => result.deal);

      console.log(`✅ Filtered to ${relevantDeals.length} relevant deals`);

      // Step 3: Use Gemini to enhance results and provide conversational response
      let aiResponse = '';
      let finalDeals = relevantDeals;
      let confidence = 0.5;

      if (this.geminiService && relevantDeals.length > 0) {
        try {
          console.log('🤖 Using Gemini to enhance vector search results...');
          
          // Create a focused prompt for the most relevant deals
          const dealSummaries = relevantDeals.slice(0, 5).map((deal, index) => 
            `${index + 1}. ${deal.dealName} (ID: ${deal.dealId})
             - Description: ${deal.description}
             - Targeting: ${deal.targeting}
             - Media Type: ${deal.mediaType}
             - Environment: ${deal.environment}`
          ).join('\n\n');

          const geminiPrompt = `Based on the following deals that were found using semantic similarity search for the query "${query}", provide a conversational response explaining why these deals are relevant and recommend the best ones:

${dealSummaries}

Please provide:
1. A conversational explanation of why these deals match the query
2. Recommendations for the top 3 most relevant deals
3. Brief reasoning for each recommendation

Keep the response conversational and helpful.`;

          const geminiResult = await this.geminiService.analyzeQuery(query, relevantDeals, conversationHistory);
          aiResponse = geminiResult.aiResponse;
          confidence = Math.max(0.7, geminiResult.confidence);
          
          console.log(`✅ Gemini enhanced response with confidence ${confidence}`);
          
        } catch (geminiError) {
          console.error('❌ Gemini enhancement failed, using vector results only:', geminiError);
          aiResponse = `I found ${relevantDeals.length} deals that are semantically similar to your query "${query}". These deals were matched based on their content similarity to your search terms.`;
          confidence = 0.6;
        }
      } else {
        // Fallback: Use vector results without Gemini enhancement
        aiResponse = relevantDeals.length > 0 
          ? `I found ${relevantDeals.length} deals that are semantically similar to your query "${query}". These deals were matched based on their content similarity to your search terms.`
          : `I couldn't find any deals that are semantically similar to your query "${query}". Try using different keywords or broader terms.`;
        confidence = relevantDeals.length > 0 ? 0.6 : 0.3;
      }

      return {
        deals: finalDeals,
        aiResponse,
        searchMethod: this.geminiService ? 'hybrid' : 'vector',
        confidence,
        query
      };

    } catch (error) {
      console.error('❌ Hybrid search failed:', error);
      
      // Fallback to basic keyword search
      const fallbackDeals = this.fallbackKeywordSearch(query, allDeals);
      
      return {
        deals: fallbackDeals,
        aiResponse: `I found ${fallbackDeals.length} deals using basic keyword matching for "${query}". For better results, try using more specific terms.`,
        searchMethod: 'fallback',
        confidence: 0.3,
        query
      };
    }
  }

  private fallbackKeywordSearch(query: string, deals: Deal[]): Deal[] {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/).filter(word => word.length > 2);
    
    return deals.filter(deal => {
      const dealText = [
        deal.dealName,
        deal.description,
        deal.targeting,
        deal.environment,
        deal.mediaType
      ].join(' ').toLowerCase();
      
      return keywords.some(keyword => dealText.includes(keyword));
    }).slice(0, 10);
  }

  public async initializeIndex(deals: Deal[]): Promise<void> {
    console.log('🔄 Initializing hybrid search with vector embeddings...');
    await this.embeddingService.buildIndex(deals);
    console.log('✅ Hybrid search initialized');
  }

  public isReady(): boolean {
    return this.embeddingService.isReady();
  }
}
