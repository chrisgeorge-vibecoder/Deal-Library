import { GoogleGenerativeAI } from '@google/generative-ai';
import { Deal } from '../types/deal';
import { RAGService } from './ragService';

export interface CoachingInsights {
  strategyRationale?: string;
  hiddenOpportunities?: string[];
  riskWarnings?: string[];
  testingFramework?: {
    minimumBudget?: string;
    testDuration?: string;
    successMetrics?: string[];
    optimizationSignals?: string[];
  };
  quickWins?: string[];
  scalingPath?: string[];
  competitiveIntelligence?: string;
}

export interface GeminiSearchResult {
  deals: Deal[];
  aiResponse: string;
  searchMethod: 'gemini' | 'fallback' | 'gemini-direct' | 'timeout-fallback' | 'error-fallback';
  confidence: number;
  coaching?: CoachingInsights;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private responseCache: Map<string, { result: GeminiSearchResult, timestamp: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
  private ragService: RAGService | null = null;
  private ragEnabled: boolean = false;

  constructor(supabase?: any) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1, // Lower temperature for more consistent results
        topP: 0.8, // Focus on most likely tokens
        maxOutputTokens: 8192, // Increased for complex Audience Insights responses
      }
    });
    this.responseCache = new Map();

    // Initialize RAG service if Supabase is available
    if (supabase) {
      try {
        this.ragService = new RAGService(supabase);
        this.ragEnabled = true;
        console.log('✅ RAG enabled for Gemini Service');
      } catch (error) {
        console.warn('⚠️  RAG disabled:', error);
      }
    }
  }

  /**
   * Clean up expired cache entries to prevent memory leaks
   */
  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.responseCache.delete(key);
      }
    }
  }

  /**
   * Smart pre-filtering to reduce prompt size and improve performance
   * Filters deals based on keyword matching before sending to Gemini
   */
  private preFilterDeals(query: string, deals: Deal[], forceDeals?: boolean): Deal[] {
    const queryLower = query.toLowerCase();
    
    // If forceDeals is true, include more deals to ensure we don't miss anything
    const maxDeals = forceDeals ? 100 : 50;
    
    // Extract key terms from query
    const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 2);
    
    // Score each deal based on keyword matching
    const scoredDeals = deals.map(deal => {
      let score = 0;
      const dealName = deal.dealName?.toLowerCase() || '';
      const description = deal.description?.toLowerCase() || '';
      const targeting = deal.targeting?.toLowerCase() || '';
      const mediaType = deal.mediaType?.toLowerCase() || '';
      const environment = deal.environment?.toLowerCase() || '';
      
      const allText = `${dealName} ${description} ${targeting} ${mediaType} ${environment}`;
      
      // Exact phrase matching (highest score)
      if (allText.includes(queryLower)) {
        score += 100;
      }
      
      // Individual term matching
      queryTerms.forEach(term => {
        if (dealName.includes(term)) score += 20;
        if (description.includes(term)) score += 15;
        if (targeting.includes(term)) score += 15;
        if (mediaType.includes(term)) score += 10;
        if (environment.includes(term)) score += 10;
      });
      
      // Special handling for common patterns
      if (queryLower.includes('sports') || queryLower.includes('athletics') || queryLower.includes('fitness')) {
        if (allText.includes('sport') || allText.includes('athletic') || allText.includes('fitness') || 
            allText.includes('exercise') || allText.includes('gym') || allText.includes('workout')) {
          score += 30;
        }
      }
      
      if (queryLower.includes('pet') || queryLower.includes('dog') || queryLower.includes('cat')) {
        if (allText.includes('pet') || allText.includes('animal') || allText.includes('dog') || allText.includes('cat')) {
          score += 30;
        }
      }
      
      if (queryLower.includes('tech') || queryLower.includes('electronics') || queryLower.includes('computer')) {
        if (allText.includes('tech') || allText.includes('electronic') || allText.includes('computer') || 
            allText.includes('software') || allText.includes('app')) {
          score += 30;
        }
      }
      
      if (queryLower.includes('food') || queryLower.includes('culinary') || queryLower.includes('restaurant')) {
        if (allText.includes('food') || allText.includes('culinary') || allText.includes('restaurant') || 
            allText.includes('dining') || allText.includes('beverage')) {
          score += 30;
        }
      }
      
      // Parenting/Family queries
      const hasParentingQuery = queryLower.includes('parent') || queryLower.includes('baby') || queryLower.includes('family') || 
          queryLower.includes('child') || queryLower.includes('toddler') || queryLower.includes('mom') || 
          queryLower.includes('dad') || queryLower.includes('kids');
      const hasParentingDeal = allText.includes('parent') || allText.includes('baby') || allText.includes('family') || 
            allText.includes('child') || allText.includes('toddler') || allText.includes('mom') || 
            allText.includes('dad') || allText.includes('kids') || allText.includes('nursery') ||
            allText.includes('infant') || allText.includes('newborn');
      
      if (hasParentingQuery && hasParentingDeal) {
        score += 30;
        console.log(`🎯 Parenting boost for: ${deal.dealName} (score: ${score})`);
      }
      
      return { deal, score };
    });
    
    // Sort by score and return top deals
    return scoredDeals
      .filter(item => item.score > 0) // Only include deals with some relevance
      .sort((a, b) => b.score - a.score)
      .slice(0, maxDeals)
      .map(item => item.deal);
  }

  /**
   * Direct analysis: Have Gemini analyze and score all deals for a query
   */
  async analyzeAllDeals(query: string, deals: Deal[], conversationHistory?: Array<{role: string, content: string}>, forceDeals?: boolean): Promise<GeminiSearchResult> {
    console.log(`🤖 Gemini analyzing ${deals.length} deals for query: "${query}"`);
    
    // Clean up expired cache entries periodically
    this.cleanCache();
    
    // Check cache first for identical queries (without conversation history for better cache hit rate)
    const cacheKey = `${query.toLowerCase()}_${forceDeals || false}`;
    const cached = this.responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      console.log(`⚡ Cache hit! Returning cached result for query: "${query}"`);
      return cached.result;
    }
    
    // Smart pre-filtering to reduce prompt size and improve performance
    const filteredDeals = this.preFilterDeals(query, deals, forceDeals);
    console.log(`🎯 Pre-filtered to ${filteredDeals.length} relevant deals (${Math.round((filteredDeals.length/deals.length)*100)}% of total)`);
    
    // Create optimized prompt with fewer deals
    const dealsSummary = filteredDeals.map((deal, index) => 
      `${index + 1}. ${deal.dealName} (ID: ${deal.dealId})
       - Description: ${deal.description}
       - Targeting: ${deal.targeting}
       - Media Type: ${deal.mediaType}
       - Environment: ${deal.environment}
       - Bid Guidance: ${deal.bidGuidance}`
    ).join('\n\n');

    // Build conversation context
    const conversationContext = conversationHistory && conversationHistory.length > 0 
      ? `\n\nPrevious conversation context:\n${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    const prompt = `You are a deal analyst. 

Query: "${query}"${conversationContext}

Available deals:
${dealsSummary}

DETECTION: Analyze the query "${query}" to determine if it's requesting deals or asking general questions.

${forceDeals ? 'FORCE DEALS MODE: The user has explicitly requested deals, so you MUST return relevant deals regardless of the query content.' : ''}

DEAL REQUEST PATTERNS: The query must contain one of these exact phrases OR relevant keywords to be considered a deal request:
- "request deal" or "request deals"
- "deals for" 
- "show me deals"
- "find deals"
- "get deals"
- "need deals"
- "looking for deals"
- "find relevant deals"
- "relevant deals for"
- Sports/Fitness keywords: "sport", "athletic", "fitness", "exercise", "gym", "workout", "mlb", "baseball", "nfl", "football", "nba", "basketball", "golf", "tennis", "soccer", "fan", "fans", "athlete", "athletes", "team", "teams", "league", "game", "games"
- Pet/Animal keywords: "pet", "pets", "animal", "animals", "dog", "dogs", "cat", "cats", "pet home", "pet supplies", "pet owner", "pet owners"
- Luxury/Fashion keywords: "luxury", "fashion", "accessories", "clothing", "apparel", "premium", "designer", "high-end", "luxury goods", "personal luxury", "fashion accessories"
- Persona keywords: "persona", "personas", "integrated pet home manager", "pet home manager"

${forceDeals ? 'Since FORCE DEALS MODE is active, return 4 relevant deals for this query.' : 'If the query contains one of these patterns OR relevant keywords, return 4 relevant deals.\nIf the query is asking general questions about marketing, strategy, insights, etc., return no deals.'}

MATCHING GUIDANCE:
- For pet-related personas (like "Integrated Pet Home Manager"), prioritize deals with "pet", "animal", "dog", "cat" in the name or description
- For sports personas, prioritize deals with "sport", "athletic", "fitness" keywords
- For family personas, prioritize deals with "family", "parent", "children" keywords
- For luxury/fashion queries, prioritize deals with "fashion", "clothing", "accessories", "luxury", "premium", "designer" keywords
- Always match the persona's core interest area to relevant deal categories

CRITICAL: If the query mentions "Integrated Pet Home Manager" or any pet-related persona, you MUST return pet-related deals. Do NOT return entertainment deals for pet personas.

EXAMPLE MATCHING:
- "Integrated Pet Home Manager" → Pet Supplies Purchase Intender, Animals & Pet Supplies, Cat Supplies
- "Sports Fan" → Sports, Athletic, Fitness deals
- "Family Manager" → Family, Parenting, Children deals
- "Luxury Goods Market" → Fashion, Clothing, Accessories, Premium deals

RESPOND WITH ONLY THIS JSON:

For DEAL REQUESTS:
{
  "topDeals": [
    {
      "id": "actual_deal_id",
      "dealName": "actual_deal_name", 
      "description": "actual_description",
      "environment": "actual_environment",
      "mediaType": "actual_media_type",
      "bidGuidance": actual_bid_guidance,
      "relevanceScore": 0.95,
      "matchReason": "Specific reason why this deal matches the query",
      "personaInsights": {
        "personaName": "actual_persona_name",
        "coreInsight": "actual_core_insight",
        "creativeHooks": ["actual_hook1", "actual_hook2"],
        "mediaTargeting": ["actual_targeting1", "actual_targeting2"],
        "psychographicProfile": "Audience mindset and motivations",
        "purchaseDrivers": ["What motivates purchases for this persona"]
      },
      "performanceProjections": {
        "expectedCTR": "2.1-3.2%",
        "estimatedCPM": "$15-25",
        "targetingPrecision": "High/Medium/Low"
      },
      "campaignOptimizationTips": [
        "Specific optimization recommendations for this deal"
      ]
    }
  ],
  "aiResponse": "Comprehensive explanation of why these deals are perfect, including strategic context and implementation guidance",
  "campaignStrategy": {
    "recommendedApproach": "Overall strategy for using these deals",
    "keySuccessFactors": ["Critical factors for campaign success"],
    "budgetAllocation": "Recommended spend distribution across deals",
    "testingPriority": "Which deals to test first"
  },
  "isGeneralQuestion": false
}

For GENERAL QUESTIONS:
{
  "topDeals": [],
  "aiResponse": "Your detailed, expert-level conversational answer",
  "isGeneralQuestion": true
}

CRITICAL: Return ONLY valid JSON. No other text.

EXAMPLE FOR DEAL REQUEST:
{
  "topDeals": [
    {
      "id": "SVN_438021746",
      "dealName": "Tech (CTV)",
      "description": "Target tech content on CTV",
      "environment": "CTV",
      "mediaType": "Video",
      "bidGuidance": 15.5,
      "personaInsights": {
        "personaName": "Tech Professional",
        "coreInsight": "High engagement with tech content",
        "creativeHooks": ["Innovation", "Efficiency"],
        "mediaTargeting": ["IAB19", "Tech Content"]
      }
    }
  ],
  "aiResponse": "These deals target tech professionals effectively",
  "isGeneralQuestion": false
}

MANDATORY: Only return deals if the query is actually requesting deals. For general questions, return an empty topDeals array.`;

    try {
      // Add timeout to prevent hanging (reduced to 15 seconds for better UX)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API timeout after 15 seconds')), 15000);
      });
      
      const apiPromise = this.model.generateContent(prompt);
      
      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log('📦 Raw response object:', JSON.stringify(response.response, null, 2).substring(0, 500));
      const responseText = response.response.text();
      
      console.log('🤖 Gemini response text length:', responseText?.length || 0);
      console.log('🤖 Gemini response:', responseText?.substring(0, 500) || '(empty)');
      
      // Use robust JSON parsing with multiple fallback strategies
      let parsed;
      try {
        parsed = this.extractAndParseJSON(responseText, query);
      } catch (error) {
        console.error('❌ All JSON parsing strategies failed:', error);
        
        // Final fallback: treat as general question and extract clean response
        if (responseText.includes('isGeneralQuestion') || responseText.includes('general question') || (!this.isDealRequest(query) && !query.toLowerCase().includes('persona'))) {
          const cleanResponse = this.extractCleanResponse(responseText);
          return {
            deals: [],
            aiResponse: cleanResponse,
            confidence: 0.8,
            searchMethod: 'gemini-direct',
            coaching: undefined
          };
        }
        throw new Error('Failed to parse Gemini response as JSON');
      }
      
      // Ensure aiResponse is a string, not a JSON string
      if (parsed.aiResponse && typeof parsed.aiResponse === 'string' && parsed.aiResponse.startsWith('{')) {
        try {
          const nestedJson = JSON.parse(parsed.aiResponse);
          parsed.aiResponse = nestedJson.aiResponse || parsed.aiResponse;
        } catch (e) {
          // If it's not valid JSON, keep the original string
        }
      }
      
      if (parsed.topDeals && Array.isArray(parsed.topDeals)) {
        // Check if this is a general question (no deals needed)
        if (parsed.isGeneralQuestion === true) {
          const result: GeminiSearchResult = {
            deals: [], // No deals for general questions
            aiResponse: parsed.aiResponse || 'I\'m here to help with your question.',
            confidence: 0.9,
            searchMethod: 'gemini-direct',
            coaching: parsed.coaching || undefined
          };
          
          // Cache the result for future identical queries
          this.responseCache.set(cacheKey, { result, timestamp: Date.now() });
          console.log(`💾 Cached result for query: "${query}"`);
          
          return result;
        }
        
        // Map the deal IDs to actual deal objects for deal recommendations
        const mappedDeals = parsed.topDeals.map((item: any) => {
          // Try to find the deal by both id and dealId fields
          const deal = deals.find(d => d.dealId === item.id || d.id === item.id || d.dealId === item.dealId);
          if (deal) {
            return {
              ...deal,
              relevanceScore: item.relevanceScore || 0.5,
              reason: item.reason || 'Recommended by AI analysis'
            };
          }
          return null;
        }).filter(Boolean);
        
        const result: GeminiSearchResult = {
          deals: mappedDeals,
          aiResponse: parsed.aiResponse || 'I found some relevant deals for your query.',
          confidence: 0.9, // High confidence for direct analysis
          searchMethod: 'gemini-direct',
          coaching: parsed.coaching || undefined
        };
        
        // Only cache if we have a valid response (non-empty aiResponse or deals)
        if (result.aiResponse && result.aiResponse.trim().length > 0 && result.aiResponse !== "I'm here to help with your question.") {
          this.responseCache.set(cacheKey, { result, timestamp: Date.now() });
          console.log(`💾 Cached result for query: "${query}"`);
        } else {
          console.log(`⚠️  Skipping cache - invalid response for query: "${query}"`);
        }
        
        return result;
      } else {
        throw new Error('Invalid response format from Gemini');
      }
      
    } catch (error) {
      console.error('❌ Failed to parse Gemini direct analysis response:', error);
      
      // Check if this is a timeout error
      if (error instanceof Error && error.message.includes('timeout')) {
        console.error('⏰ Gemini API timed out after 15 seconds');
        return {
          deals: [],
          aiResponse: "I'm having trouble processing your request right now. The AI service is taking longer than expected. Please try again with a more specific query.",
          confidence: 0.1,
          searchMethod: 'timeout-fallback',
          coaching: undefined
        };
      }
      
      // Fallback: return first 4 deals or empty response for general questions
      const isGeneralQuery = !this.isDealRequest(query) && !query.toLowerCase().includes('persona');
      
      if (isGeneralQuery) {
        return {
          deals: [],
          aiResponse: "I encountered an issue processing your request. Please try rephrasing your question or try again later.",
          confidence: 0.2,
          searchMethod: 'error-fallback',
          coaching: undefined
        };
      }
      
      const fallbackDeals = deals.slice(0, 4).map(deal => ({
        ...deal,
        relevanceScore: 0.5
      }));
      
      return {
        deals: fallbackDeals,
        aiResponse: "I found some deals that might be relevant to your query, though I had some trouble processing the request.",
        confidence: 0.3,
        searchMethod: 'fallback',
        coaching: undefined
      };
    }
  }

  /**
   * Simple and reliable JSON extraction and parsing
   */
  private isDealRequest(query: string): boolean {
    const queryLower = query.toLowerCase();
    const dealPatterns = [
      'request deal',
      'request deals', 
      'deals for',
      'show me deals',
      'find deals',
      'get deals',
      'need deals',
      'looking for deals'
    ];
    
    const sportsKeywords = [
      'sport', 'athletic', 'fitness', 'exercise', 'gym', 'workout',
      'mlb', 'baseball', 'nfl', 'football', 'nba', 'basketball', 
      'golf', 'tennis', 'soccer', 'fan', 'fans', 'athlete', 
      'athletes', 'team', 'teams', 'league', 'game', 'games'
    ];
    
    return dealPatterns.some(pattern => queryLower.includes(pattern)) ||
           sportsKeywords.some(keyword => queryLower.includes(keyword));
  }

  private extractAndParseJSON(responseText: string, query: string): any {
    // Try to find JSON in code blocks first
    const codeBlockMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch (error) {
        console.error('❌ Code block JSON parsing failed:', error);
      }
    }
    
    // Look for JSON object in the response
    const objectMatch = responseText.match(/\{[\s\S]*\}/);
    if (objectMatch && objectMatch[0]) {
      let jsonText = objectMatch[0];
      
      // Clean the JSON text more carefully to preserve markdown formatting
      jsonText = jsonText
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove only problematic control characters, keep \t \n \r
        .replace(/\\"/g, '"') // Fix escaped quotes
        .replace(/\\n/g, '\n') // Preserve newlines for markdown formatting
        .trim();
      
      try {
        const parsed = JSON.parse(jsonText);
        console.log('✅ JSON parsing successful');
        return parsed;
      } catch (error) {
        console.error('❌ JSON parsing failed:', error instanceof Error ? error.message : 'Unknown error');
        console.error('❌ JSON text length:', jsonText.length);
        console.error('❌ JSON text preview:', jsonText.substring(0, 500) + '...');
        console.error('❌ Character at error position:', jsonText.charAt(468));
        
        // Try to extract deals and response from malformed JSON
        console.log('🔄 Attempting to extract data from malformed JSON...');
        
        // Extract topDeals array if it exists - use a more robust approach
        let extractedDeals = [];
        try {
          // First try to find the topDeals array with proper bracket matching
          const topDealsStart = responseText.indexOf('"topDeals":');
          if (topDealsStart !== -1) {
            const arrayStart = responseText.indexOf('[', topDealsStart);
            if (arrayStart !== -1) {
              let bracketCount = 0;
              let arrayEnd = arrayStart;
              
              // Find the matching closing bracket
              for (let i = arrayStart; i < responseText.length; i++) {
                if (responseText[i] === '[') bracketCount++;
                if (responseText[i] === ']') bracketCount--;
                if (bracketCount === 0) {
                  arrayEnd = i;
                  break;
                }
              }
              
              if (bracketCount === 0) {
                const dealsText = responseText.substring(arrayStart, arrayEnd + 1);
                extractedDeals = JSON.parse(dealsText);
                console.log('✅ Successfully extracted deals:', extractedDeals.length);
              }
            }
          }
        } catch (dealsError) {
          console.log('❌ Failed to parse deals array, using empty array');
          extractedDeals = [];
        }
        
        // Extract aiResponse if it exists
        const aiResponseMatch = responseText.match(/"aiResponse":\s*"([^"]*(?:\\.[^"]*)*)"/);
        let extractedResponse = '';
        if (aiResponseMatch && aiResponseMatch[1]) {
          extractedResponse = aiResponseMatch[1]
            .replace(/\\n/g, '\n') // Convert escaped newlines to actual newlines
            .replace(/\\"/g, '"') // Fix escaped quotes
            .replace(/\\t/g, '\t') // Convert escaped tabs
            .trim();
        } else {
          // Fallback: clean up the response text by removing any JSON artifacts
          extractedResponse = responseText
            .replace(/```json[\s\S]*?```/g, '') // Remove JSON code blocks
            .replace(/^\s*\{[\s\S]*?\}\s*$/m, '') // Remove any remaining JSON objects
            .trim();
        }
        
        return {
          topDeals: extractedDeals,
          aiResponse: extractedResponse,
          isGeneralQuestion: !this.isDealRequest(query) && !query.toLowerCase().includes('persona')
        };
      }
    }
    
    // If no JSON found, return fallback for general questions
    if (!this.isDealRequest(query) && !query.toLowerCase().includes('persona')) {
      // Extract the AI response from the original response text
      // Look for the aiResponse field in the malformed JSON
      const aiResponseMatch = responseText.match(/"aiResponse":\s*"([^"]*(?:\\.[^"]*)*)"/);
      if (aiResponseMatch && aiResponseMatch[1]) {
        // Clean up the extracted response
        let cleanResponse = aiResponseMatch[1]
          .replace(/\\n/g, '\n') // Convert escaped newlines to actual newlines
          .replace(/\\"/g, '"') // Fix escaped quotes
          .replace(/\\t/g, '\t') // Convert escaped tabs
          .trim();
        
        return {
          topDeals: [],
          aiResponse: cleanResponse,
          isGeneralQuestion: true
        };
      }
      
      // Fallback: clean up the response text by removing any JSON artifacts
      let cleanResponse = responseText
        .replace(/```json[\s\S]*?```/g, '') // Remove JSON code blocks
        .replace(/^\s*\{[\s\S]*?\}\s*$/m, '') // Remove any remaining JSON objects
        .trim();
      
      return {
        topDeals: [],
        aiResponse: cleanResponse,
        isGeneralQuestion: true
      };
    }
    
    throw new Error('No JSON found in response');
  }

  /**
   * Extract clean response text when JSON parsing fails
   */
  private extractCleanResponse(responseText: string): string {
    // Try to extract aiResponse from nested JSON structure
    const aiResponseMatch = responseText.match(/"aiResponse":\s*"([^"]*(?:\\.[^"]*)*)"/);
    if (aiResponseMatch && aiResponseMatch[1]) {
      return aiResponseMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r');
    }
    
    // Fallback: clean up the response text by removing JSON artifacts
    return responseText
      .replace(/```json[\s\S]*?```/g, '') // Remove JSON code blocks
      .replace(/\{[^}]*"topDeals"[^}]*\}/g, '') // Remove JSON objects
      .replace(/\{[^}]*"aiResponse"[^}]*\}/g, '') // Remove JSON objects
      .replace(/\{[^}]*"isGeneralQuestion"[^}]*\}/g, '') // Remove JSON objects
      .trim();
  }

  /**
   * Analyze user query and find relevant deals using Gemini AI
   */
  async analyzeQuery(query: string, deals: Deal[], conversationHistory?: Array<{role: string, content: string}>): Promise<GeminiSearchResult> {
    try {
      console.log(`🤖 Gemini analyzing query: "${query}"`);
      
      // Retrieve relevant research context if RAG is enabled
      let ragContext: { augmentedPrompt: string; citations: any[] } | null = null;
      if (this.ragEnabled && this.ragService) {
        try {
          console.log('📚 Retrieving research context for query...');
          const context = await this.ragService.retrieveContext(query);
          if (context.chunks.length > 0) {
            ragContext = {
              augmentedPrompt: context.augmentedPrompt,
              citations: context.citations
            };
            console.log(`📚 Found ${context.chunks.length} relevant research chunks from ${context.citations.length} studies`);
          }
        } catch (ragError) {
          console.warn('⚠️  RAG retrieval failed, continuing without research context:', ragError);
        }
      }
      
      // Create a structured prompt for Gemini with conversation context and RAG
      const prompt = this.createAnalysisPrompt(query, deals, conversationHistory, ragContext);
      
      // Add timeout to prevent hanging (30s for complex prompts with deal analysis and coaching)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API timeout after 30 seconds')), 30000);
      });
      
      const apiPromise = this.model.generateContent(prompt);
      
      const result = await Promise.race([apiPromise, timeoutPromise]);
      const response = await result.response;
      const text = response.text();
      
      console.log(`🤖 Gemini response: ${text.substring(0, 200)}...`);
      
      // Parse Gemini's response
      const analysis = this.parseGeminiResponse(text, deals, query);
      
      // Add citations to response if available
      if (ragContext && ragContext.citations.length > 0) {
        const citationsText = this.ragService!.formatCitations(ragContext.citations);
        analysis.aiResponse += citationsText;
        
        // Track citation usage
        const studyIds = ragContext.citations.map(c => c.studyId);
        const chunkIds = ragContext.citations.flatMap(c => c.pages);
        await this.ragService!.trackCitation(studyIds, query, chunkIds);
      }
      
      return {
        deals: analysis.deals,
        aiResponse: analysis.aiResponse,
        searchMethod: 'gemini',
        confidence: analysis.confidence,
        coaching: analysis.coaching
      };
      
    } catch (error) {
      console.error('❌ Gemini analysis failed:', error);
      
      // Check if this is a timeout error
      if (error instanceof Error && error.message.includes('timeout')) {
        console.error('⏰ Gemini API timed out after 15 seconds');
        return {
          deals: [],
          aiResponse: "I'm having trouble processing your request right now. The AI service is taking longer than expected. Please try again with a more specific query.",
          confidence: 0.1,
          searchMethod: 'timeout-fallback',
          coaching: undefined
        };
      }
      
      // Return fallback response instead of throwing
      return {
        deals: [],
        aiResponse: "I encountered an issue processing your request. Please try again or rephrase your question.",
        confidence: 0.1,
        searchMethod: 'error-fallback',
        coaching: undefined
      };
    }
  }

  /**
   * Create a structured prompt for Gemini to analyze deals
   */
  private createAnalysisPrompt(query: string, deals: Deal[], conversationHistory?: Array<{role: string, content: string}>, ragContext?: { augmentedPrompt: string; citations: any[] } | null): string {
    // Prioritize relevant deals based on query
    let prioritizedDeals = deals;
    
    // If query mentions commerce, shopping, or electronics, prioritize Commerce deals
    const queryLower = query.toLowerCase();
    if (queryLower.includes('commerce') || queryLower.includes('shopping') || queryLower.includes('electronics') || 
        queryLower.includes('samsung') || queryLower.includes('tv') || queryLower.includes('manufacturer')) {
      
      console.log(`🎯 Prioritizing Commerce deals for query: "${query}"`);
      
      // Filter for Commerce deals - be more inclusive
      prioritizedDeals = deals.filter(deal => {
        const dealName = deal.dealName?.toLowerCase() || '';
        const description = deal.description?.toLowerCase() || '';
        
        return dealName.includes('commercedata') || 
               dealName.includes('commerce') ||
               dealName.includes('electronics') ||
               dealName.includes('computers') ||
               dealName.includes('video game') ||
               dealName.includes('software') ||
               description.includes('shoppers') ||
               description.includes('in-market') ||
               description.includes('electronics') ||
               description.includes('computers') ||
               description.includes('software');
      });
      
      console.log(`📊 Found ${prioritizedDeals.length} Commerce deals out of ${deals.length} total deals`);
      
      // Sort Commerce deals to put Electronics deals first
      prioritizedDeals.sort((a, b) => {
        const aName = a.dealName?.toLowerCase() || '';
        const bName = b.dealName?.toLowerCase() || '';
        
        // Electronics deals first
        if (aName.includes('electronics') && !bName.includes('electronics')) return -1;
        if (!aName.includes('electronics') && bName.includes('electronics')) return 1;
        
        // Computers deals second
        if (aName.includes('computers') && !bName.includes('computers')) return -1;
        if (!aName.includes('computers') && bName.includes('computers')) return 1;
        
        // Video game deals third
        if (aName.includes('video') && !bName.includes('video')) return -1;
        if (!aName.includes('video') && bName.includes('video')) return 1;
        
        return 0;
      });
      
      console.log('🔍 First 5 prioritized Commerce deals:');
      prioritizedDeals.slice(0, 5).forEach((deal, index) => {
        console.log(`  ${index + 1}. ${deal.dealName}`);
      });
      
      // If no commerce deals found, fall back to all deals
      if (prioritizedDeals.length === 0) {
        console.log('⚠️ No Commerce deals found, falling back to all deals');
        prioritizedDeals = deals;
      }
    }
    
    // If query mentions pets, dogs, animals, prioritize Pet deals
    const petKeywords = ['pet', 'dog', 'animal', 'cat', 'puppy', 'kitten', 'dog parents', 'pet parents', 'conscious dog'];
    const hasPetKeywords = petKeywords.some(keyword => queryLower.includes(keyword));
    
    console.log(`🐕 Pet keyword detection for query: "${query}"`);
    console.log(`🐕 Query lower: "${queryLower}"`);
    
    // If query mentions sports, athletics, fitness, prioritize Sports deals
    const sportsKeywords = ['sport', 'athletic', 'fitness', 'exercise', 'gym', 'workout', 'mlb', 'baseball', 'nfl', 'football', 'nba', 'basketball', 'golf', 'tennis', 'soccer', 'fan', 'fans', 'athlete', 'athletes', 'team', 'teams', 'league', 'game', 'games', 'stadium', 'arena'];
    const hasSportsKeywords = sportsKeywords.some(keyword => queryLower.includes(keyword));
    
    console.log(`⚽ Sports keyword detection for query: "${query}"`);
    console.log(`⚽ Has sports keywords: ${hasSportsKeywords}`);
    console.log(`🐕 Pet keywords found:`, petKeywords.filter(keyword => queryLower.includes(keyword)));
    console.log(`🐕 Has pet keywords: ${hasPetKeywords}`);
    
    if (hasSportsKeywords && !hasPetKeywords) {
      console.log(`⚽ Prioritizing Sports deals for query: "${query}"`);
      
      // Filter for Sports deals - be more inclusive
      prioritizedDeals = deals.filter(deal => {
        const dealName = deal.dealName?.toLowerCase() || '';
        const description = deal.description?.toLowerCase() || '';
        
        return dealName.includes('athletic') || 
               dealName.includes('exercise') ||
               dealName.includes('fitness') ||
               dealName.includes('boating') ||
               dealName.includes('fishing') ||
               dealName.includes('yoga') ||
               dealName.includes('pilates') ||
               description.includes('sports') ||
               description.includes('athletic') ||
               description.includes('fitness') ||
               description.includes('exercise') ||
               description.includes('gym') ||
               description.includes('workout') ||
               description.includes('outdoor');
      });
      
      console.log(`⚽ Found ${prioritizedDeals.length} Sports deals out of ${deals.length} total deals`);
      
      // Sort Sports deals to put Athletics deals first, then Exercise & Fitness
      prioritizedDeals.sort((a, b) => {
        const aName = a.dealName?.toLowerCase() || '';
        const bName = b.dealName?.toLowerCase() || '';
        
        // Athletics deals first
        if (aName.includes('athletic') && !bName.includes('athletic')) return -1;
        if (!aName.includes('athletic') && bName.includes('athletic')) return 1;
        
        // Exercise & Fitness deals second
        if (aName.includes('exercise') && !bName.includes('exercise')) return -1;
        if (!aName.includes('exercise') && bName.includes('exercise')) return 1;
        
        // Yoga & Pilates deals third
        if (aName.includes('yoga') && !bName.includes('yoga')) return -1;
        if (!aName.includes('yoga') && bName.includes('yoga')) return 1;
        
        return 0;
      });
      
      console.log('⚽ First 5 prioritized Sports deals:');
      prioritizedDeals.slice(0, 5).forEach((deal, index) => {
        console.log(`  ${index + 1}. ${deal.dealName}`);
      });
      
      // If no sports deals found, fall back to all deals
      if (prioritizedDeals.length === 0) {
        console.log('⚠️ No Sports deals found, falling back to all deals');
        prioritizedDeals = deals;
      }
    } else if (hasPetKeywords) {
      console.log(`🐕 Prioritizing Pet deals for query: "${query}"`);
      
      // Filter for Pet deals
      prioritizedDeals = deals.filter(deal => {
        const dealName = deal.dealName?.toLowerCase() || '';
        const description = deal.description?.toLowerCase() || '';
        
        return dealName.includes('pet') || 
               dealName.includes('animal') ||
               dealName.includes('dog') ||
               dealName.includes('cat') ||
               description.includes('pet') ||
               description.includes('animal') ||
               description.includes('dog') ||
               description.includes('cat');
      });
      
      console.log(`🐕 Found ${prioritizedDeals.length} Pet deals out of ${deals.length} total deals`);
      
      // If no pet deals found, fall back to all deals
      if (prioritizedDeals.length === 0) {
        console.log('⚠️ No Pet deals found, falling back to all deals');
        prioritizedDeals = deals;
      }
    }
    
    // Limit to first 50 deals to avoid token limits
    const limitedDeals = prioritizedDeals.slice(0, 50);
    
    const dealsSummary = limitedDeals.map((deal, index) => {
      let dealInfo = `${index + 1}. ${deal.dealName} (ID: ${deal.dealId})
       - Description: ${deal.description}
       - Targeting: ${deal.targeting}
       - Media Type: ${deal.mediaType}
       - Environment: ${deal.environment}
       - Bid Guidance: ${deal.bidGuidance}`;
      
      // Add persona insights if available
      if (deal.personaInsights) {
        dealInfo += `
       - PERSONA: ${deal.personaInsights.emoji} ${deal.personaInsights.personaName}
       - CORE INSIGHT: ${deal.personaInsights.coreInsight}
       - CREATIVE HOOK: ${deal.personaInsights.actionableStrategy.creativeHook}
       - MEDIA STRATEGY: ${deal.personaInsights.actionableStrategy.mediaTargeting}`;
      }
      
      return dealInfo;
    }).join('\n\n');

    // Debug: Log first few deal names to see what's being sent to Gemini
    console.log('🔍 First 5 deal names being sent to Gemini:');
    limitedDeals.slice(0, 5).forEach((deal, index) => {
      console.log(`  ${index + 1}. ${deal.dealName}`);
    });

    // Build conversation context if available
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = '\nCONVERSATION HISTORY:\n';
      conversationHistory.forEach((msg, index) => {
        conversationContext += `${msg.role}: ${msg.content}\n`;
      });
      conversationContext += '\n';
    }

    return `You are Sovrn's AI advertising assistant. You help users discover relevant advertising deals AND answer general questions about advertising, audience reach, market data, and strategy.

${conversationContext}USER QUERY: "${query}"

AVAILABLE DEALS:
${dealsSummary}

CRITICAL: If the user query contains "Show me deals for" or "deals for" followed by a persona name, this is ALWAYS a DEAL REQUEST, not a general question. You must return specific deals that match that persona. Look for deals with "PERSONA: [Persona Name]" in the deal data and return those deals.

IMPORTANT: If any deals above contain "PERSONA:" information, you MUST include this strategic persona data in your response. This is mandatory for providing maximum value to users.

YOUR CAPABILITIES:
1. **Answer General Questions**: Provide helpful answers to questions about advertising, market data, audience insights, media planning, etc.
2. **Recommend Relevant Deals**: When the user is looking for advertising inventory, analyze and recommend the most relevant deals.
3. **Provide Strategic Guidance**: Offer insights on targeting, media mix, campaign optimization, etc.
4. **Persona-Based Insights**: When deals have persona insights (marked with "PERSONA:" in deal data), you MUST include this strategic information in your response to help users understand their audience psychology and get creative guidance.
5. **Conversational Follow-ups**: Engage naturally with "thank you", "why did you recommend", clarifying questions, etc.

DEAL RECOMMENDATION PRIORITIES (when user is looking for inventory):
 - Exact/intended audience terms (e.g., sports fans, gamers, grocery shoppers)
 - Environment/channel constraints (e.g., CTV/OTT/Connected TV vs Phone/Tablet/Desktop)
 - Media type constraints (e.g., Video vs Display vs Audio)
 - Treat CTV, Connected TV, OTT, Streaming TV as equivalent
 - Avoid recommending broad "Entertainment" if a more specific intent exists (e.g., Sports)
 - Prefer deals whose Targeting or Description explicitly contain the intent terms

COMMERCE DEALS MATCHING:
 - **Commerce deals** (deals with "CommerceData_" in the name) are specifically for targeting shoppers and in-market audiences
 - **Electronics queries** should match Commerce deals like "CommerceData_Electronics_*", "CommerceData_Computers_*", "CommerceData_VideoGameConsoles_*"

SPORTS DEALS MATCHING:
 - **Sports queries** (sports, athletics, fitness, exercise, MLB, baseball, NFL, football, NBA, basketball, golf, tennis, fans, athletes, teams) should match Athletics, Exercise & Fitness, Yoga & Pilates, and Boating & Fishing deals
 - **Athletics deals** are specifically for sports gear and apparel purchase intenders
 - **Exercise & Fitness deals** are for fitness equipment and home gym gear
 - **Yoga & Pilates deals** are for yoga mats, blocks, and pilates accessories
 - **Shopping queries** should match any Commerce deals that target shoppers or in-market audiences
 - **Technology queries** should match Commerce deals for electronics, computers, software, etc.
 - When user asks for "electronics shoppers" or "commerce deals for electronics", prioritize Commerce deals that contain "Electronics", "Computers", "Software", or "VideoGame" in the deal name

PET DEALS MATCHING:
 - **Pet queries** (dog owners, pet parents, animal lovers) should match deals with "Pet", "Animal", "Dog", or "Cat" in the deal name
 - **Pet Supplies Purchase Intender** deals are specifically for targeting pet owners shopping for pet supplies
 - **Animals & Pet Supplies Purchase Intender** deals target consumers actively shopping for pet food, accessories, and care products
 - When user asks for "dog owners" or "pet parents", prioritize deals that contain "Pet", "Animal", "Dog", or "Cat" in the deal name

PARENT/BABY DEALS MATCHING:
 - **Parent queries** (new parents, baby, toddler, infant, parenting, moms, fathers) should ALWAYS match deals with "Baby", "Toddler", "New Parent", or "Family" in the deal name
 - **Baby & Toddler Purchase Intender** deals are specifically for targeting parents shopping for baby and toddler products
 - **New Parents Purchase Intender** deals target consumers actively shopping for parenting and baby care products
 - When user asks for "new parents", "baby", "toddler", or mentions parenting needs, prioritize deals that contain "Baby", "Toddler", "New Parent", or "Family" in the deal name
 - NEVER return Finance, Political, or unrelated deals when user clearly mentions parents, babies, toddlers, or parenting

LUXURY & FASHION DEALS MATCHING:
 - **Luxury queries** (luxury goods, fashion, accessories, premium, high-end, designer) should match deals with "Fashion", "Clothing", "Accessories", "Luxury", "Premium", "Designer" in the deal name or description
 - **Fashion & Accessories queries** should prioritize deals targeting fashion shoppers, clothing purchase intenders, and accessory buyers
 - **Personal luxury goods** queries should match deals for affluent shoppers, high-income demographics, and premium lifestyle segments
 - When user asks for "luxury goods" or "fashion accessories", look for deals containing fashion, clothing, accessories, luxury, premium, or designer keywords

CRITICAL: For electronics/shopping queries, look for deals with "CommerceData_" in the name. These deals ARE relevant for electronics shoppers. Examples: "CommerceData_Electronics_*", "CommerceData_Computers_*", "CommerceData_VideoGameConsoles_*" are all relevant for electronics queries.

MANDATORY: If you see ANY deal with "Electronics" in the name (like "CommerceData_Electronics_AllFormatsandDevices"), it IS relevant for electronics queries. Do NOT return empty relevantDeals array.

QUERY TYPE DETECTION:
 - **General Question** (e.g., "How many households in the US?", "What is programmatic advertising?"): Answer directly, return empty relevantDeals array
 - **Deal Request** (e.g., "I want to reach sports fans", "MLB fans", "sports fans", "athletics", "fitness", "exercise"): Recommend relevant deals with explanation
 - **Sports/Fitness Queries** (any mention of sports, athletics, fitness, exercise, MLB, baseball, NFL, football, NBA, basketball, golf, tennis, fans, athletes, teams): ALWAYS treat as deal requests and recommend relevant sports deals
 - **Luxury/Fashion Queries** (luxury goods, fashion, accessories, premium, designer, clothing, apparel): ALWAYS treat as deal requests and recommend relevant fashion/luxury deals
 - **Conversational** (e.g., "Thank you", "That's helpful"): Respond conversationally, return empty relevantDeals array
 - **Follow-up Question** (e.g., "Why did you recommend Golf?"): Use conversation history to provide context, optionally include relevant deals for reference

RESPONSE FORMAT (strict JSON only, no markdown, no code fences):
{
  "relevantDeals": [
    {
      "dealId": "deal-001",
      "relevanceScore": 0.95,
      "reason": "Perfect match for targeting"
    }
  ],
  "aiResponse": "I found deals that match your criteria. If any deals have persona insights, include them like: '💊 The Wellness-Obsessed New Parent - This audience has zero tolerance for risk and seeks authoritative validation. Use creative hooks like 'The Non-Negotiable Standard. Confidence in Care, Backed by Science, Trusted by Experts.' Target pediatric health authority websites and medical institution content.'",
  "confidence": 0.9,
  "coaching": {
    "strategyRationale": "Data-driven explanation of why this approach works",
    "hiddenOpportunities": ["Unexpected insights from audience overlap data"],
    "riskWarnings": ["Potential challenges to watch for"],
    "testingFramework": {
      "minimumBudget": "$2,000-$5,000",
      "testDuration": "2-3 weeks minimum",
      "successMetrics": ["CTR >2.1%", "CPM <$18", "Conversion rate >1.2%"],
      "optimizationSignals": ["Watch for CTR trends", "Monitor CPM efficiency"]
    },
    "quickWins": ["Fastest way to test this audience"],
    "scalingPath": ["How to grow from test to full campaign"],
    "competitiveIntelligence": "Market positioning insights based on audience data"
  }
}

IMPORTANT: Keep reason fields short and simple. Avoid complex explanations that break JSON parsing.

INSTRUCTIONS:
1. **Detect Query Type**: Determine if the query is asking for deals, asking a general question, or just conversational
2. **For General Questions**: Provide a comprehensive, helpful answer in aiResponse. Set relevantDeals to [] and confidence based on your certainty
3. **For Deal Requests**: Analyze available deals, recommend the most relevant ones (max 6), and explain why in aiResponse
4. **For Conversational Responses**: Respond naturally and helpfully. Set relevantDeals to [] unless deals would add value to the response
5. **Use Conversation History**: Reference previous context when available to provide continuity
6. **Be Helpful**: You have access to general knowledge - use it! Answer questions about advertising, audiences, market data, best practices, etc.
7. **CRITICAL - Use Persona Insights**: When deals have persona insights (marked with "PERSONA:" in the deal data), you MUST include this information in your response:
   - ALWAYS mention the persona name and emoji (e.g., "🍽️ The Efficient Family Prep Master")
   - ALWAYS explain the core insight about the audience psychology
   - ALWAYS include the creative hook suggestions from the persona data
   - ALWAYS provide the media targeting recommendations from the persona data
   - This persona information is crucial for helping users understand their audience better
8. **MANDATORY PERSONA USAGE**: If you see "PERSONA:" in any deal data, you MUST reference it in your response. This is not optional - it's a core requirement for providing strategic value to users.
9. **MANDATORY ENHANCED AI COACHING**: For ALL deal requests and strategic queries, you MUST ALWAYS provide comprehensive coaching insights in the coaching field:
   - **strategyRationale**: Explain WHY this approach works based on audience data, overlaps, and market intelligence
   - **hiddenOpportunities**: Identify unexpected insights from cross-purchase patterns and demographic analysis
   - **riskWarnings**: Highlight potential challenges, saturation concerns, or audience shifts to watch for
   - **testingFramework**: Provide specific budget, timeline, and success metrics for validation
   - **quickWins**: Suggest fastest path to initial success with this audience
   - **scalingPath**: Outline progression from test to full campaign based on performance data
   - **competitiveIntelligence**: Provide comprehensive competitive analysis including: (1) Market maturity and competition level for this vertical, (2) Key competitive gaps and opportunities based on audience demographics vs industry norms, (3) Pricing and positioning intelligence for similar campaigns, (4) Channel saturation analysis showing where competitors are over/under-indexed, (5) Optimal timing windows when competition is lower, (6) Differentiation strategies based on audience uniqueness
10. **Use Markdown Formatting in aiResponse**: Format your responses using markdown for better readability:
    - Use **bold** for emphasis
    - Use bullet points (- or *) for lists
    - Use numbered lists (1., 2., 3.) for steps
    - Use ## for section headers when appropriate
    - Use backticks for code/technical terms (e.g. \`CPM\`, \`CTV\`)
    - This makes responses more readable and professional
11. **Output Format**: The JSON itself must be valid (no markdown in the JSON structure), but the aiResponse field should contain markdown-formatted text

EXAMPLES:
- "How many households are in the US?" → Answer the question, relevantDeals: []
- "I want to reach sports fans on CTV" → Recommend deals, explain why
- "MLB fans" → Recommend Sports deals (Sports CTV, Sports Mobile App, Athletics Purchase Intender, etc.)
- "sports fans" → Recommend Sports deals and explain targeting strategy
- "athletics" → Recommend Athletics Purchase Intender deals
- "fitness" → Recommend Exercise & Fitness Purchase Intender deals
- "I want to reach baby health shoppers" → Recommend deals with persona insights like "💊 The Wellness-Obsessed New Parent - This audience has zero tolerance for risk and seeks authoritative validation. Use creative hooks like 'The Non-Negotiable Standard. Confidence in Care, Backed by Science, Trusted by Experts.' Target pediatric health authority websites and medical institution content."
- "Thank you!" → Respond conversationally, relevantDeals: []
- "Why did you suggest Golf_CTV?" → Explain using conversation history, optionally show the deal

${ragContext?.augmentedPrompt || ''}

CRITICAL COACHING REQUIREMENT: When you return ANY deals in the relevantDeals array, the coaching field is MANDATORY and must be fully populated with all 7 fields:
- strategyRationale (string)
- hiddenOpportunities (array of strings)
- riskWarnings (array of strings) 
- testingFramework (object with minimumBudget, testDuration, successMetrics)
- quickWins (array of strings)
- scalingPath (array of strings)
- competitiveIntelligence (string)

REQUIRED JSON STRUCTURE: Your response MUST include this exact structure when deals are found:
{
  "relevantDeals": [...],
  "aiResponse": "...",
  "confidence": 0.8,
  "coaching": {
    "strategyRationale": "...",
    "hiddenOpportunities": ["..."],
    "riskWarnings": ["..."],
    "testingFramework": {
      "minimumBudget": "...",
      "testDuration": "...",
      "successMetrics": ["..."]
    },
    "quickWins": ["..."],
    "scalingPath": ["..."],
    "competitiveIntelligence": "..."
  }
}

If relevantDeals array has ANY items, coaching MUST be present and complete. Never skip or omit the coaching field when deals are recommended.

Respond with valid JSON only.`;
  }

  /**
   * Generate contextual coaching based on query content and available deals
   */
  private generateContextualCoaching(query: string, deals: any[]): CoachingInsights {
    const lowerQuery = query.toLowerCase();
    
    // Centralized coaching configurations for different verticals
    const coachingConfigs = this.getCoachingConfigurations();
    
    // Check each configuration for keyword matches
    for (const config of coachingConfigs) {
      const hasMatch = config.keywords.some(keyword => lowerQuery.includes(keyword));
      if (hasMatch) {
        return config.coaching;
      }
    }
    
    // Default fallback coaching
    return {
      strategyRationale: "These deals have been selected based on your specified audience targeting and strategic requirements. Each deal offers specific demographic and behavioral targeting capabilities that align with your campaign goals.",
      hiddenOpportunities: [
        "Consider cross-audience targeting opportunities revealed through overlap analysis",
        "Leverage seasonal and trend data for optimal campaign timing"
      ],
      riskWarnings: [
        "Monitor audience saturation in high-performing segments",
        "Watch for competitive pressure in key demographic groups"
      ],
      testingFramework: {
        minimumBudget: "$5,000",
        testDuration: "2-4 weeks",
        successMetrics: ["CTR", "conversion rate", "cost per acquisition"]
      },
      quickWins: [
        "Start with highest confidence deals first",
        "Implement A/B testing across different creative formats"
      ],
      scalingPath: [
        "Scale winning creative formats and audiences",
        "Expand to similar demographic segments",
        "Optimize based on performance data"
      ],
      competitiveIntelligence: "Market positioning analysis shows key opportunities in specified audience segments with competitive advantages in targeting precision and reach efficiency."
    };
  }

  /**
   * Centralized coaching configurations for different verticals/industries
   */
  private getCoachingConfigurations(): Array<{keywords: string[], coaching: CoachingInsights}> {
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
          competitiveIntelligence: "Sports inventory is premium and competitive. Early booking and creative alignment with game themes can provide competitive advantages over generic advertisers."
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
          competitiveIntelligence: "Parenting audiences are highly sought after by brands. Authentic, safety-focused messaging and trusted platform placement provide competitive differentiation."
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
          competitiveIntelligence: "Business and finance audiences are premium but competitive. Thought leadership content, data-driven messaging, and trusted platform placement provide advantages over generic business advertising approaches."
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
          testingFramework: {
            minimumBudget: "$3,000",
            testDuration: "3-4 weeks",
            successMetrics: ["CTR", "conversion rate", "cost per acquisition", "brand sentiment"]
          },
          quickWins: [
            "Focus on safety and health messaging that resonates with pet parents",
            "Test during peak pet adoption seasons and holidays",
            "Leverage user-generated content showing happy pets"
          ],
          scalingPath: [
            "Expand to adjacent pet categories based on cross-purchase data",
            "Partner with pet influencers and communities for authentic reach",
            "Optimize for seasonal patterns and local pet adoption events"
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
          testingFramework: {
            minimumBudget: "$10,000",
            testDuration: "4-6 weeks",
            successMetrics: ["Brand lift", "engagement rate", "cost per quality lead", "customer lifetime value"]
          },
          quickWins: [
            "Focus on storytelling and brand narrative over direct response",
            "Test during peak luxury shopping periods (holiday, back-to-school)",
            "Leverage premium content and influencer partnerships"
          ],
          scalingPath: [
            "Expand to international luxury markets based on performance",
            "Develop long-term brand building campaigns with premium messaging",
            "Integrate with luxury retail and hospitality partnerships"
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
          testingFramework: {
            minimumBudget: "$4,000",
            testDuration: "3-4 weeks",
            successMetrics: ["CTR", "conversion rate", "cost per acquisition", "brand sentiment"]
          },
          quickWins: [
            "Focus on durability and performance messaging that resonates with outdoor enthusiasts",
            "Test during peak seasonal periods (spring camping prep, fall gear sales)",
            "Leverage authentic outdoor photography and user-generated content"
          ],
          scalingPath: [
            "Expand to related outdoor categories (fishing, boating, hunting) based on cross-purchase data",
            "Partner with outdoor influencers and communities for authentic reach",
            "Optimize for seasonal patterns and weather-dependent purchase timing"
          ],
          competitiveIntelligence: "Outdoor recreation shows consistent growth with premium quality positioning opportunities. Most competitors focus on price, creating opportunity for durability and performance messaging at higher margins. Peak competition during Q4 holiday season, but Q1-Q2 shows 30% lower rates for spring campaign testing."
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
          testingFramework: {
            minimumBudget: "$5,000",
            testDuration: "2-3 weeks",
            successMetrics: ["CTR", "conversion rate", "cost per acquisition", "brand sentiment"]
          },
          quickWins: [
            "Focus on specific technical benefits and performance metrics that matter to tech users",
            "Test during major product launch periods and holiday tech buying seasons",
            "Leverage authentic tech reviews and comparison content"
          ],
          scalingPath: [
            "Expand to related tech categories (gaming, accessories, software) based on cross-purchase data",
            "Partner with tech influencers and review platforms for authentic reach",
            "Optimize for product launch timing and seasonal tech buying patterns"
          ],
          competitiveIntelligence: "Technology market shows high competition with premium positioning for quality and innovation. Most competitors focus on features, creating opportunity for performance and reliability messaging. Peak competition during Q4 holiday season and major product launches."
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
          testingFramework: {
            minimumBudget: "$3,000",
            testDuration: "4-6 weeks",
            successMetrics: ["CTR", "conversion rate", "cost per acquisition", "regulatory compliance"]
          },
          quickWins: [
            "Focus on safety, efficacy, and professional validation messaging",
            "Test during peak health seasons (New Year resolutions, flu season)",
            "Leverage medical professional endorsements and clinical studies"
          ],
          scalingPath: [
            "Expand to related health categories (fitness, nutrition, medical devices) based on cross-purchase data",
            "Partner with healthcare professionals and wellness influencers for authentic reach",
            "Optimize for seasonal health patterns and regulatory compliance"
          ],
          competitiveIntelligence: "Healthcare market shows strong growth with strict regulatory oversight creating barriers to entry. Most competitors focus on generic health benefits, creating opportunity for clinical validation and professional endorsement messaging at premium margins."
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
          testingFramework: {
            minimumBudget: "$8,000",
            testDuration: "4-6 weeks",
            successMetrics: ["CTR", "lead quality", "cost per acquisition", "showroom traffic"]
          },
          quickWins: [
            "Focus on safety ratings, reliability data, and value proposition messaging",
            "Test during peak automotive buying seasons (spring, fall model releases)",
            "Leverage detailed comparison charts and professional reviews"
          ],
          scalingPath: [
            "Expand to related automotive categories (insurance, maintenance, accessories) based on cross-purchase data",
            "Partner with automotive reviewers and dealership networks for authentic reach",
            "Optimize for seasonal buying patterns and model year releases"
          ],
          competitiveIntelligence: "Automotive market shows high competition with regional variations in pricing and availability. Most competitors focus on price, creating opportunity for safety and reliability positioning at higher margins. Peak competition during Q4 year-end sales."
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
          testingFramework: {
            minimumBudget: "$6,000",
            testDuration: "3-4 weeks",
            successMetrics: ["CTR", "conversion rate", "cost per booking", "customer satisfaction"]
          },
          quickWins: [
            "Focus on unique experiences, convenience, and value proposition messaging",
            "Test during peak booking seasons (summer vacations, holiday planning)",
            "Leverage authentic travel photography and user-generated content"
          ],
          scalingPath: [
            "Expand to related travel categories (activities, dining, transportation) based on cross-purchase data",
            "Partner with travel influencers and destination marketing organizations for authentic reach",
            "Optimize for seasonal booking patterns and travel trends"
          ],
          competitiveIntelligence: "Travel market shows strong recovery with premium positioning for unique experiences. Most competitors focus on price, creating opportunity for experience and convenience messaging at higher margins. Peak competition during major holiday seasons."
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
          testingFramework: {
            minimumBudget: "$4,000",
            testDuration: "2-3 weeks",
            successMetrics: ["CTR", "engagement rate", "cost per acquisition", "community sentiment"]
          },
          quickWins: [
            "Focus on gameplay experience and community features that resonate with gamers",
            "Test during major game releases and seasonal sales events (Black Friday, Steam Sales)",
            "Leverage authentic gameplay footage and user-generated content"
          ],
          scalingPath: [
            "Expand to related gaming categories (hardware, accessories, streaming services) based on cross-purchase data",
            "Partner with gaming influencers and esports organizations for authentic reach",
            "Optimize for game release timing and seasonal gaming events"
          ],
          competitiveIntelligence: "Gaming market shows explosive growth with premium positioning for exclusive content. Most competitors focus on price, creating opportunity for exclusive access and community features messaging at higher margins. Peak competition during major game releases and holiday seasons."
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
          testingFramework: {
            minimumBudget: "$5,000",
            testDuration: "3-4 weeks",
            successMetrics: ["CTR", "conversion rate", "cost per acquisition", "average order value"]
          },
          quickWins: [
            "Focus on quality, durability, and aesthetic appeal messaging that resonates with homeowners",
            "Test during peak home improvement seasons (spring, fall) and holiday preparation periods",
            "Leverage before/after photography and design inspiration content"
          ],
          scalingPath: [
            "Expand to related home categories (maintenance, organization, seasonal decor) based on cross-purchase data",
            "Partner with home design influencers and improvement experts for authentic reach",
            "Optimize for seasonal home improvement patterns and hosting seasons"
          ],
          competitiveIntelligence: "Home market shows consistent demand with premium positioning for quality and design. Most competitors focus on price, creating opportunity for quality and aesthetic messaging at higher margins. Peak competition during spring and fall home improvement seasons."
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
          testingFramework: {
            minimumBudget: "$3,000",
            testDuration: "2-3 weeks",
            successMetrics: ["CTR", "engagement rate", "cost per acquisition", "social sharing"]
          },
          quickWins: [
            "Focus on taste, quality, and authentic experience messaging that resonates with food enthusiasts",
            "Test during peak dining seasons (holidays, summer, comfort food periods)",
            "Leverage authentic food photography and user-generated dining content"
          ],
          scalingPath: [
            "Expand to related food categories (cooking, specialty foods, beverages) based on cross-purchase data",
            "Partner with food influencers and culinary professionals for authentic reach",
            "Optimize for seasonal dining patterns and food trend cycles"
          ],
          competitiveIntelligence: "Food market shows strong social engagement with premium positioning for authentic experiences. Most competitors focus on price, creating opportunity for quality and experience messaging at higher margins. Peak competition during major dining seasons and holidays."
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
          testingFramework: {
            minimumBudget: "$4,000",
            testDuration: "3-4 weeks",
            successMetrics: ["CTR", "engagement rate", "cost per acquisition", "brand sentiment"]
          },
          quickWins: [
            "Focus on efficacy, ingredients, and social proof messaging that resonates with beauty enthusiasts",
            "Test during peak beauty seasons (holidays, special occasions, self-care trends)",
            "Leverage authentic beauty photography and user-generated content"
          ],
          scalingPath: [
            "Expand to related beauty categories (tools, accessories, treatments) based on cross-purchase data",
            "Partner with beauty influencers and aestheticians for authentic reach",
            "Optimize for seasonal beauty patterns and trend cycles"
          ],
          competitiveIntelligence: "Beauty market shows strong growth with premium positioning for quality and efficacy. Most competitors focus on price, creating opportunity for ingredient quality and professional endorsement messaging at higher margins. Peak competition during holiday and special occasion seasons."
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
          testingFramework: {
            minimumBudget: "$3,000",
            testDuration: "4-6 weeks",
            successMetrics: ["CTR", "enrollment rate", "cost per acquisition", "student satisfaction"]
          },
          quickWins: [
            "Focus on practical skills, career outcomes, and quality content messaging",
            "Test during peak enrollment periods (New Year resolutions, academic year starts)",
            "Leverage student testimonials and professional success stories"
          ],
          scalingPath: [
            "Expand to related education categories (certifications, advanced courses, career services) based on cross-purchase data",
            "Partner with educational institutions and professional organizations for authentic reach",
            "Optimize for academic calendar cycles and career development seasons"
          ],
          competitiveIntelligence: "Education market shows strong demand with premium positioning for quality and outcomes. Most competitors focus on price, creating opportunity for quality and career advancement messaging at higher margins. Peak competition during New Year and academic year starts."
        }
      }
    ];
  }

  /**
   * Parse Gemini's response and extract relevant deals
   */
  private parseGeminiResponse(response: string, allDeals: Deal[], query?: string): {
    deals: Deal[];
    aiResponse: string;
    confidence: number;
    coaching?: CoachingInsights;
  } {
    try {
      // Normalize response: strip code fences/backticks and trim
      let cleaned = response.trim()
        .replace(/^```(?:json)?/i, '')
        .replace(/```$/i, '')
        .trim();

      // Try to extract the first JSON object if extra text exists
      const jsonMatch = cleaned.match(/\{[\s\S]*?\}(?=\s*$|\s*[^,}\s])/);
      const jsonText = jsonMatch ? jsonMatch[0] : cleaned;

      // Additional cleaning for common JSON issues
      let finalJson = jsonText
        .replace(/,\s*}/g, '}')  // Remove trailing commas before closing braces
        .replace(/,\s*]/g, ']')  // Remove trailing commas before closing brackets
        .replace(/\n/g, ' ')     // Replace newlines with spaces
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .replace(/reason":\s*"([^"]*?)"/g, (match, reason) => {
          // Clean up reason field by removing problematic characters that break JSON
          const cleanReason = reason
            .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
            .replace(/\s+/g, ' ')         // Normalize whitespace
            .trim();
          return `"reason": "${cleanReason}"`;
        })
        .trim();

      let parsed: any;
      try {
        parsed = JSON.parse(finalJson);
      } catch (firstError) {
        // If first attempt fails, try more aggressive cleaning
        console.log('First JSON parse failed, trying aggressive cleaning...');
        const aggressiveClean = finalJson
          .replace(/reason":\s*"[^"]*"/g, (match) => {
            // Extract the reason content and clean it
            const reasonMatch = match.match(/reason":\s*"([^"]*)"/);
            if (reasonMatch && reasonMatch[1]) {
              const reason = reasonMatch[1]
                .replace(/[^\w\s.,!?-]/g, '') // Remove special characters
                .replace(/\s+/g, ' ')         // Normalize whitespace
                .trim();
              return `"reason": "${reason}"`;
            }
            return match;
          })
          .replace(/[^\x20-\x7E]/g, '') // Remove non-ASCII characters
          .replace(/\s+/g, ' ')         // Normalize whitespace
          .trim();
        
        try {
          parsed = JSON.parse(aggressiveClean);
        } catch (secondError) {
          console.log('Aggressive cleaning also failed, trying to extract just the deals...');
          // Try to extract just the relevantDeals array and create a minimal response
          try {
            const dealsMatch = finalJson.match(/"relevantDeals":\s*\[(.*?)\]/);
            if (dealsMatch) {
              // Create a minimal valid JSON response
              const minimalJson = `{
                "relevantDeals": [${dealsMatch[1]}],
                "aiResponse": "I found some relevant deals for your query.",
                "confidence": 0.8
              }`;
              parsed = JSON.parse(minimalJson);
            } else {
              throw new Error('Could not extract deals');
            }
          } catch (thirdError) {
            console.log('All parsing attempts failed, using fallback...');
            // Return fallback response with proper deal structure
            const fallbackDeals = allDeals.slice(0, 3).map(deal => ({
              ...deal,
              relevanceScore: 0.5
            }));
            return {
              deals: fallbackDeals,
              aiResponse: "I found some deals that might be relevant to your query.",
              confidence: 0.3,
              coaching: undefined
            };
          }
        }
      }

      // Two accepted shapes:
      // A) { relevantDeals: [{ dealId, relevanceScore, reason }], aiResponse, confidence }
      // B) { deals: [Deal], aiResponse, confidence }

      let mappedDeals: any[] = [];

      if (Array.isArray(parsed.relevantDeals)) {
        mappedDeals = parsed.relevantDeals
          .map((item: any) => {
            const candidateId = item.dealId || item.id;
            if (!candidateId) return null;
            const match = allDeals.find(d => d.dealId === candidateId || d.id === candidateId);
            return match ? { ...match, relevanceScore: item.relevanceScore ?? 0 } : null;
          })
          .filter(Boolean)
          .sort((a: any, b: any) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
      } else if (Array.isArray(parsed.deals)) {
        // Validate and map to existing deals by id/dealId to avoid hallucinated objects
        mappedDeals = parsed.deals
          .map((item: any) => {
            const candidateId = item.id || item.dealId;
            if (!candidateId) return null;
            const match = allDeals.find(d => d.id === candidateId || d.dealId === candidateId);
            return match ? match : null;
          })
          .filter(Boolean);
      }

      // Enforce max 6
      mappedDeals = mappedDeals.slice(0, 6);

      // Debug logging to track coaching data
      console.log('🔍 Parsed response keys:', Object.keys(parsed));
      console.log('🔍 Coaching field:', parsed.coaching);
      
      let coachingData = parsed.coaching;
      
      // Fallback: Generate basic coaching if missing
      if (mappedDeals.length > 0 && !coachingData) {
        console.log('⚠️ WARNING: Deals found but no coaching data in Gemini response!');
        console.log('📝 Full parsed response:', JSON.stringify(parsed, null, 2));
        
        // Generate contextual fallback coaching data based on query
        coachingData = this.generateContextualCoaching(query || "", mappedDeals);
        
        console.log('🔧 Generated fallback coaching data');
      }

      return {
        deals: mappedDeals,
        aiResponse: typeof parsed.aiResponse === 'string' && parsed.aiResponse.trim().length > 0
          ? parsed.aiResponse
          : "I found some relevant deals for your query.",
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
        coaching: coachingData || undefined
      };

    } catch (error) {
      console.error('❌ Failed to parse Gemini response:', error);
      console.error('Raw response:', response);
      
      // Fallback: return first few deals with basic matching
      return {
        deals: allDeals.slice(0, 3),
        aiResponse: "I found some deals that might be relevant to your query.",
        confidence: 0.3,
        coaching: undefined
      };
    }
  }

  /**
   * Generate a conversational response for the chat interface
   */
  async generateChatResponse(query: string, matchedDeals: Deal[]): Promise<string> {
    try {
      const prompt = `Generate a helpful, conversational response for a user who searched for: "${query}"

The user found ${matchedDeals.length} relevant deals:
${matchedDeals.map(deal => `- ${deal.dealName}: ${deal.description}`).join('\n')}

Provide a friendly, informative response (2-3 sentences) that:
1. Acknowledges their search
2. Highlights the best matches
3. Offers to help refine the search if needed

Keep it conversational and helpful.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('❌ Failed to generate chat response:', error);
      return `I found ${matchedDeals.length} deals that match your search for "${query}". These options should give you some great choices for your campaign!`;
    }
  }

  /**
   * Generate audience insights using Gemini as a world-class account planner
   */
  async generateAudienceInsights(query: string, conversationHistory?: Array<{role: string, content: string}>): Promise<{
    audienceInsights: any[];
    aiResponse: string;
  }> {
    console.log(`🎯 Gemini generating audience insights for: "${query}"`);
    
    // Retrieve relevant research context if RAG is enabled
    let ragContext: { augmentedPrompt: string; citations: any[] } | null = null;
    
    if (this.ragEnabled && this.ragService) {
      try {
        console.log('📚 Retrieving research context for audience insights query...');
        
        // Add timeout protection for RAG retrieval
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('RAG retrieval timeout')), 5000); // 5 second timeout
        });
        
        const ragPromise = this.ragService.retrieveContext(query);
        const context = await Promise.race([ragPromise, timeoutPromise]);
        
        if (context.chunks.length > 0) {
          ragContext = {
            augmentedPrompt: context.augmentedPrompt,
            citations: context.citations
          };
          console.log(`📚 Found ${context.chunks.length} relevant research chunks from ${context.citations.length} studies`);
        }
      } catch (ragError) {
        console.warn('⚠️  RAG retrieval failed for audience insights, continuing without research context:', ragError);
      }
    }
    
    // Build conversation context
    const conversationContext = conversationHistory && conversationHistory.length > 0 
      ? `\n\nPrevious conversation context:\n${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    const prompt = `You are a world-class account planner at a top advertising agency. You are prolific at generating deep, strategic audience insights that drive breakthrough creative and media strategies.

Query: "${query}"${conversationContext}

${ragContext?.augmentedPrompt || ''}

Your task is to generate comprehensive audience insights for the audience mentioned in the query. Act as an expert account planner who has spent years studying consumer behavior, demographics, and market trends.

IMPORTANT: If the query mentions any type of audience (sports fans, demographics, specific groups, etc.), you MUST generate detailed insights. Do not ask for clarification - analyze what you can about the audience mentioned.

For sports-related queries (MLB, NFL, NBA, etc.), focus on:
- Fan demographics and psychographics
- Viewing and attendance behaviors
- Purchasing patterns and brand preferences
- Media consumption habits
- Geographic distribution
- Income and education levels

RESPOND WITH ONLY THIS JSON:

{
  "audienceInsights": [
    {
      "id": "unique_id",
      "audienceName": "Audience Name",
      "demographics": {
        "ageRange": "25-44",
        "incomeRange": "$75k+",
        "genderSplit": "65% Male, 35% Female",
        "topLocations": ["California", "Texas", "Florida", "New York"]
      },
      "behavior": {
        "deviceUsage": {
          "mobile": 45,
          "desktop": 30,
          "tablet": 25
        },
        "peakHours": ["7-9 PM EST", "Weekend afternoons"],
        "purchaseFrequency": "Monthly",
        "avgOrderValue": "$89"
      },
      "insights": {
        "keyCharacteristics": [
          "High engagement with live sports content",
          "Tech-savvy early adopters",
          "Premium brand preferences"
        ],
        "interests": ["Sports", "Technology", "Entertainment"],
        "painPoints": ["Ad fatigue", "Content discovery"]
      },
      "creativeGuidance": {
        "messagingTone": "Authoritative yet approachable",
        "visualStyle": "Clean, modern, premium",
        "keyMessages": ["Innovation", "Performance", "Excellence"],
        "avoidMessaging": ["Generic", "Overly technical jargon"]
      },
      "mediaStrategy": {
        "preferredChannels": ["CTV", "Mobile Apps", "Social Media"],
        "optimalTiming": ["Evening hours", "Weekend mornings"],
        "creativeFormats": ["Video", "Interactive Display"],
        "targetingApproach": "Behavioral + Demographic + Interest"
      },
      "sources": [
        { "title": "Source or benchmark", "url": "https://example.com", "note": "What this supports" },
        { "title": "Industry study or dataset", "url": "https://example.com" }
      ]
    }
  ],
  "aiResponse": "Comprehensive strategic analysis of the audience with actionable insights for creative and media planning."
}

CRITICAL INSTRUCTIONS:
1. Generate 1-2 detailed audience insights cards based on the query
2. Use real-world data and insights that a top account planner would know
3. Include specific demographics, behaviors, and strategic guidance
4. Focus on actionable insights for advertising and media planning
5. Be specific about creative messaging, visual style, and media strategy
6. Include pain points and motivations that drive purchasing decisions
7. Use industry-standard terminology and frameworks
8. Make insights relevant to the specific audience mentioned in the query
9. Include 2-4 credible sources (industry studies, reputable datasets, trade publications). Provide title, URL when available, and an optional note.

EXAMPLES OF AUDIENCES TO ANALYZE:
- Tech professionals
- New parents
- Pet owners
- Sports fans
- Gamers
- Luxury consumers
- Small business owners
- Health enthusiasts
- Travelers
- Food enthusiasts

Return ONLY valid JSON. No other text.`;

    try {
      const response = await this.model.generateContent(prompt);
      const responseText = response.response.text();
      
      console.log('🎯 Gemini audience insights response:', responseText);
      
      // Parse the JSON response with more robust error handling
      let parsed;
      try {
        // Try to extract JSON from code blocks first
        const codeBlockMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          parsed = JSON.parse(codeBlockMatch[1]);
        } else {
          // Look for JSON object in the response
          const objectMatch = responseText.match(/\{[\s\S]*\}/);
          if (objectMatch && objectMatch[0]) {
            parsed = JSON.parse(objectMatch[0]);
          } else {
            // If no JSON found, try to generate insights from the text response
            console.log('⚠️ No JSON found, generating insights from text response');
            return this.generateInsightsFromText(responseText, query);
          }
        }
      } catch (error) {
        console.error('❌ Failed to parse audience insights JSON:', error);
        console.log('🔍 Raw response:', responseText);
        // Try to generate insights from the text response
        return this.generateInsightsFromText(responseText, query);
      }
      
      let finalResponse = parsed.aiResponse || "Here are the audience insights you requested.";
      
      // Add citations to response if available
      if (ragContext && ragContext.citations.length > 0) {
        const citationsText = this.ragService!.formatCitations(ragContext.citations);
        finalResponse += citationsText;
        
        // Track citation usage
        try {
          const studyIds = ragContext.citations.map(c => c.studyId);
          const chunkIds = ragContext.citations.flatMap(c => c.pages);
          await this.ragService!.trackCitation(studyIds, query, chunkIds);
        } catch (trackError) {
          console.warn('⚠️ Failed to track citation usage:', trackError);
        }
      }
      
      return {
        audienceInsights: parsed.audienceInsights || [],
        aiResponse: finalResponse
      };
      
    } catch (error) {
      console.error('❌ Failed to generate audience insights:', error);
      return {
        audienceInsights: [],
        aiResponse: "I encountered an error while generating audience insights. Please try again."
      };
    }
  }

  private generateInsightsFromText(responseText: string, query: string): {
    audienceInsights: any[];
    aiResponse: string;
  } {
    console.log('🔄 Generating insights from text response for query:', query);
    
    // Create a basic audience insight from the text response
    const audienceInsight = {
      id: `insight-${Date.now()}`,
      audienceName: this.extractAudienceName(query),
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
          "Social media active during games"
        ],
        interests: ["Sports", "Entertainment", "Social Media"],
        painPoints: ["Ad fatigue", "Content discovery"]
      },
      creativeGuidance: {
        messagingTone: "Authentic and passionate",
        visualStyle: "Dynamic, energetic, team colors",
        keyMessages: ["Team pride", "Community", "Excellence"],
        avoidMessaging: ["Generic", "Non-sports related"]
      },
      mediaStrategy: {
        preferredChannels: ["CTV", "Mobile Apps", "Social Media"],
        optimalTiming: ["Game days", "Season starts"],
        creativeFormats: ["Video", "Interactive Display"],
        targetingApproach: "Interest + Geographic + Behavioral"
      },
      sources: [
        { "title": "Sports Marketing Research", "url": "https://example.com", "note": "Industry benchmarks" }
      ]
    };

    return {
      audienceInsights: [audienceInsight],
      aiResponse: responseText || `Here are insights about ${this.extractAudienceName(query)} based on your query.`
    };
  }

  private extractAudienceName(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Extract audience name from common patterns
    if (lowerQuery.includes('mlb fans')) return 'MLB Baseball Fans';
    if (lowerQuery.includes('nfl fans')) return 'NFL Football Fans';
    if (lowerQuery.includes('nba fans')) return 'NBA Basketball Fans';
    if (lowerQuery.includes('sports fans')) return 'Sports Fans';
    if (lowerQuery.includes('baseball fans')) return 'Baseball Fans';
    if (lowerQuery.includes('football fans')) return 'Football Fans';
    if (lowerQuery.includes('basketball fans')) return 'Basketball Fans';
    
    // Generic extraction
    const words = query.split(' ');
    const audienceWords = words.slice(-2).join(' '); // Last 2 words
    return audienceWords.charAt(0).toUpperCase() + audienceWords.slice(1);
  }

  /**
   * Generate market sizing data using Gemini AI
   */
  async generateMarketSizing(query: string, conversationHistory?: Array<{role: string, content: string}>): Promise<{marketSizing: any[], aiResponse: string}> {
    console.log(`📊 Generating market sizing for query: "${query}"`);

    // Retrieve relevant research context if RAG is enabled
    let ragContext: { augmentedPrompt: string; citations: any[] } | null = null;

    if (this.ragEnabled && this.ragService) {
      try {
        console.log('📚 Retrieving research context for market sizing query...');
        
        // Add timeout protection for RAG retrieval
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('RAG retrieval timeout')), 5000); // 5 second timeout
        });
        
        const ragPromise = this.ragService.retrieveContext(query);
        const context = await Promise.race([ragPromise, timeoutPromise]);
        
        if (context.chunks.length > 0) {
          ragContext = {
            augmentedPrompt: context.augmentedPrompt,
            citations: context.citations
          };
          console.log(`📚 Found ${context.chunks.length} relevant research chunks from ${context.citations.length} studies`);
        }
      } catch (ragError) {
        console.warn('⚠️  RAG retrieval failed for market sizing, continuing without research context:', ragError);
      }
    }
    
    // Build conversation context
    const conversationContext = conversationHistory && conversationHistory.length > 0 
      ? `\n\nPrevious conversation context:\n${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n`
      : '';

    const prompt = `You are a world-class market research analyst at a top consulting firm who is prolific at generating market sizing insights.

Query: "${query}"${conversationContext}

${ragContext?.augmentedPrompt || ''}

Generate 1-2 comprehensive market sizing cards with real-world data and actionable insights. Focus on market size, demographics, growth trends, and opportunities.

IMPORTANT: The user is asking about "${query}". Interpret this broadly:
- If they ask about "trends", analyze the MARKET for that industry/topic
- If they ask "what are...", provide market sizing for that industry
- If they ask about specific topics (e.g., "sports"), size the entire market or key segments
- Be flexible and interpret general questions as market sizing requests

CRITICAL INSTRUCTIONS:
- ALWAYS generate 1-2 detailed cards, even for general questions
- Include total market size, addressable market, demographics
- Add growth trends, seasonality, and key opportunities
- Use realistic numbers and percentages based on real market research
- Make insights actionable for business planning
- Focus on the specific market/industry mentioned in the query
- DO NOT generate competitive intelligence about specific companies
- Focus on market sizing and industry trends, not competitor analysis
- If the query is broad (like "trends in sports"), break it into 1-2 key market segments

Return your response as JSON in this exact format:
{
  "marketSizing": [
    {
      "id": "unique-id",
      "marketName": "Descriptive market name",
      "totalMarketSize": "$123.6B",
      "growthRate": "+15%",
      "addressableMarket": "37% of total",
      "addressableValue": "$45.2B",
      "demographics": {
        "population": "70% of households",
        "targetAge": "25-55",
        "penetration": "67% online shoppers",
        "geographicConcentration": "Top 3 states account for 45% of market",
        "incomeDistribution": "Median HHI $75k, 40% above $100k"
      },
      "growthTrends": {
        "growthRate": "+18% YoY",
        "seasonality": "Holiday spikes, summer peak",
        "keyOpportunities": [
          "Senior market segment",
          "First-time buyers",
          "Premium product adoption"
        ],
        "forecastPeriod": "3-year outlook",
        "emergingTrends": ["E-commerce acceleration", "Mobile-first adoption"]
      },
      "marketInsights": {
        "keyDrivers": [
          "Digital transformation",
          "Changing consumer preferences",
          "Economic factors"
        ],
        "barriers": [
          "High competition",
          "Price sensitivity",
          "Market saturation"
        ],
        "opportunities": [
          "Emerging segments",
          "Technology integration",
          "Geographic expansion"
        ],
        "competitiveDensity": "High/Medium/Low",
        "marketMaturity": "Emerging/Growing/Mature/Declining"
      },
      "advertisingImplications": {
        "recommendedChannels": ["CTV", "Mobile", "Social"],
        "optimalSpend": "$2-5M for meaningful market share",
        "targetingStrategy": "Behavioral + demographic targeting recommended",
        "seasonalityRecommendations": "Peak spend during Q4, test new campaigns in Q1"
      },
      "sources": [
        { "title": "Source or benchmark", "url": "https://example.com", "note": "What this supports" },
        { "title": "Industry study or dataset", "url": "https://example.com" }
      ]
    }
  ],
  "aiResponse": "Your conversational response about the market sizing with strategic implications for advertising and media planning",
  "strategicRecommendations": {
    "investmentPriority": "High/Medium/Low",
    "entryStrategy": "Recommended approach for entering this market",
    "successMetrics": ["Key indicators to track"],
    "riskAssessment": "Potential challenges and mitigation strategies"
  }
}`;

    try {
      const response = await this.model.generateContent(prompt);
      const responseText = response.response.text();
      
      console.log('📊 Gemini market sizing response:', responseText);
      
      // Parse the JSON response
      let parsed;
      try {
        // Try to extract JSON from code blocks first
        const codeBlockMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          parsed = JSON.parse(codeBlockMatch[1]);
        } else {
          // Look for JSON object in the response
          const objectMatch = responseText.match(/\{[\s\S]*\}/);
          if (objectMatch && objectMatch[0]) {
            parsed = JSON.parse(objectMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        }
      } catch (error) {
        console.error('❌ Failed to parse market sizing JSON:', error);
        console.log('📄 Raw Gemini response (first 500 chars):', responseText.substring(0, 500));
        
        // If Gemini gave us a text response, use it as the AI response
        if (responseText && responseText.trim().length > 0) {
          return {
            marketSizing: [],
            aiResponse: responseText.trim()
          };
        }
        
        // Return fallback response only if we got nothing
        return {
          marketSizing: [],
          aiResponse: "I can provide market sizing data for the market you mentioned. Please be more specific about which market you'd like me to analyze."
        };
      }

      let finalResponse = parsed.aiResponse || "Here are the market sizing insights you requested.";

      // Add citations to response if available
      if (ragContext && ragContext.citations.length > 0) {
        const citationsText = this.ragService!.formatCitations(ragContext.citations);
        finalResponse += citationsText;

        // Track citation usage
        try {
          const studyIds = ragContext.citations.map(c => c.studyId);
          const chunkIds = ragContext.citations.flatMap(c => c.pages);
          await this.ragService!.trackCitation(studyIds, query, chunkIds);
        } catch (trackError) {
          console.warn('⚠️ Failed to track citation usage:', trackError);
        }
      }
      
      return {
        marketSizing: parsed.marketSizing || [],
        aiResponse: finalResponse
      };
      
    } catch (error) {
      console.error('❌ Failed to generate market sizing:', error);
      return {
        marketSizing: [],
        aiResponse: "I encountered an error while generating market sizing data. Please try again."
      };
    }
  }

  /**
   * Check if Gemini service is properly configured
   */
  async generateGeographicInsights(query: string, conversationHistory?: Array<{role: string, content: string}>): Promise<{
    geoCards: any[];
    aiResponse: string;
  }> {
    
    const conversationContext = conversationHistory && conversationHistory.length > 0 
      ? `\n\nConversation context: ${JSON.stringify(conversationHistory.slice(-3))}` 
      : '';

    const prompt = `You are a world-class market research analyst specializing in geographic audience insights and location-based advertising strategies. You excel at analyzing regional market trends, demographic distributions, and geographic targeting opportunities.

Query: "${query}"${conversationContext}

Your task is to generate comprehensive geographic insights for the location or market mentioned in the query. Act as an expert analyst who has deep knowledge of regional demographics, economic trends, and advertising market dynamics.

RESPOND WITH ONLY THIS JSON:

{
  "geoCards": [
    {
      "id": "unique_id",
      "audienceName": "Geographic Market Name",
      "topMarkets": [
        { "region": "Primary Region", "percentage": "XX%" },
        { "region": "Secondary Region", "percentage": "XX%" },
        { "region": "Tertiary Region", "percentage": "XX%" }
      ],
      "insights": [
        "Key geographic insight about audience behavior",
        "Regional demographic characteristic",
        "Market opportunity or trend in this geography"
      ],
      "totalAddressable": "XXXM",
      "sampleData": false,
      "demographics": {
        "population": "Total population in this geographic area",
        "medianAge": "XX",
        "medianIncome": "$XX,XXX",
        "urbanRuralSplit": "XX% Urban, XX% Rural"
      },
      "marketCharacteristics": {
        "economicProfile": "Economic characteristics of this region",
        "techAdoption": "Technology adoption rates and patterns",
        "mediaConsumption": "How this region consumes media differently",
        "purchaseBehavior": "Regional purchasing patterns and preferences"
      },
      "advertisingOpportunities": {
        "optimalChannels": ["CTV", "Mobile Apps", "Social Media"],
        "peakEngagement": ["Evening hours", "Weekend mornings"],
        "creativeConsiderations": ["Local cultural references", "Regional preferences"],
        "budgetRecommendations": "CPM and budget guidance for this geography"
      },
      "competitiveLandscape": {
        "marketSaturation": "High/Medium/Low",
        "keyCompetitors": ["Competitor 1", "Competitor 2"],
        "whiteSpaceOpportunities": ["Untapped segment", "Emerging trend"]
      },
      "sources": [
        { "title": "Census Bureau Regional Data", "url": "https://www.census.gov/", "note": "Official demographic and economic data" },
        { "title": "Regional Market Study", "url": "https://example.com", "note": "Industry-specific geographic analysis" }
      ]
    }
  ],
  "aiResponse": "Comprehensive geographic analysis with actionable insights for location-based advertising and market expansion strategies."
}

CRITICAL INSTRUCTIONS:
1. Generate 1-2 detailed geographic insight cards based on the query
2. Use real-world geographic and demographic data that a market analyst would know
3. Include specific regional characteristics, economic profiles, and market opportunities
4. Focus on actionable insights for advertising, media planning, and market expansion
5. Be specific about regional differences in behavior, preferences, and opportunities
6. Include competitive landscape and market saturation insights
7. Provide concrete advertising recommendations for each geography
8. Use industry-standard geographic and market research terminology
9. Make insights relevant to the specific location or market mentioned in the query
10. Include 2-4 credible sources (government data, market research, trade publications)

EXAMPLES OF GEOGRAPHIC QUERIES TO ANALYZE:
- United States
- California
- New York City
- Texas
- Europe
- United Kingdom
- Germany
- Urban markets
- Rural areas
- Coastal cities
- Tech hubs
- College towns
- Sports fans in California
- Tech professionals in Seattle
- Luxury consumers in New York

Return ONLY valid JSON. No other text.`;

    try {
      const response = await this.model.generateContent(prompt);
      const responseText = response.response.text();
      
      // Clean the response text to extract JSON
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const result = JSON.parse(cleanedResponse);
      
      console.log(`✅ Generated ${result.geoCards?.length || 0} geographic insights for query: "${query}"`);
      
      return {
        geoCards: result.geoCards || [],
        aiResponse: result.aiResponse || 'Geographic insights generated successfully.'
      };
      
    } catch (error) {
      console.error('❌ Error generating geographic insights:', error);
      
      // Return fallback data if AI generation fails
      return {
        geoCards: [{
          id: `geo-fallback-${Date.now()}`,
          audienceName: `Geographic Analysis: ${query}`,
          topMarkets: [
            { region: 'Primary Market', percentage: '60%' },
            { region: 'Secondary Market', percentage: '40%' }
          ],
          insights: [
            'Geographic analysis temporarily unavailable',
            'Please try again or contact support',
            'AI service experiencing issues'
          ],
          totalAddressable: 'N/A',
          sampleData: true
        }],
        aiResponse: 'Geographic insights generation is temporarily unavailable. Please try again later.'
      };
    }
  }

  /**
   * Generate Marketing SWOT analysis for a company
   */
  async generateMarketingSWOT(companyName: string): Promise<any> {
    console.log(`🔍 Generating Marketing SWOT for: ${companyName}`);
    
    const prompt = `You are a senior marketing strategist with 15+ years of experience analyzing brands across industries. 

TASK: Generate a comprehensive Marketing SWOT analysis for "${companyName}". Focus specifically on marketing strengths, weaknesses, opportunities, and threats.

RESEARCH APPROACH:
1. Analyze the company's current marketing presence, campaigns, and brand positioning
2. Evaluate their digital marketing effectiveness, social media presence, and content strategy
3. Assess their competitive positioning and marketing differentiation
4. Identify market trends and opportunities relevant to their industry
5. Consider their target audience reach, engagement, and brand perception

FORMAT REQUIREMENTS:
- Provide exactly 3 items for each SWOT category
- Each item should be 1-2 sentences, specific and actionable
- Focus on marketing, advertising, and brand-related factors
- Ground insights in current market dynamics and competitive landscape

Return ONLY valid JSON in this exact format:
{
  "companyName": "${companyName}",
  "swot": {
    "strengths": [
      {"title": "Specific marketing strength", "description": "Detailed explanation of this strength and its impact"},
      {"title": "Another marketing strength", "description": "Detailed explanation"},
      {"title": "Third marketing strength", "description": "Detailed explanation"}
    ],
    "weaknesses": [
      {"title": "Specific marketing weakness", "description": "Detailed explanation of this weakness and its implications"},
      {"title": "Another marketing weakness", "description": "Detailed explanation"},
      {"title": "Third marketing weakness", "description": "Detailed explanation"}
    ],
    "opportunities": [
      {"title": "Specific market opportunity", "description": "Detailed explanation of opportunity and recommended action"},
      {"title": "Another opportunity", "description": "Detailed explanation"},
      {"title": "Third opportunity", "description": "Detailed explanation"}
    ],
    "threats": [
      {"title": "Specific marketing threat", "description": "Detailed explanation of threat and mitigation strategy"},
      {"title": "Another threat", "description": "Detailed explanation"},
      {"title": "Third threat", "description": "Detailed explanation"}
    ]
  },
  "summary": "2-3 sentence strategic overview synthesizing key SWOT insights",
  "recommendedActions": [
    "Priority action item based on SWOT analysis",
    "Second priority action",
    "Third priority action"
  ]
}`;

    try {
      const response = await this.model.generateContent(prompt);
      const responseText = response.response.text();
      
      // Clean the response text to extract JSON
      let cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to extract JSON if wrapped in other text
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      const result = JSON.parse(cleanedResponse);
      
      console.log(`✅ Generated Marketing SWOT for: ${companyName}`);
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      console.error('❌ Error generating Marketing SWOT:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: {
          companyName,
          swot: {
            strengths: [{ title: "Analysis Unavailable", description: "Unable to generate SWOT analysis at this time" }],
            weaknesses: [{ title: "Service Issue", description: "Please try again later" }],
            opportunities: [{ title: "Retry Required", description: "Technical difficulties encountered" }],
            threats: [{ title: "Temporary Issue", description: "AI service experiencing problems" }]
          },
          summary: "Marketing SWOT analysis is temporarily unavailable. Please try again later.",
          recommendedActions: ["Retry the analysis", "Contact support if issues persist"]
        }
      };
    }
  }

  /**
   * Generate Public Company Profile analysis
   */
  async generateCompanyProfile(stockSymbol: string): Promise<any> {
    console.log(`📊 Generating Company Profile for: ${stockSymbol}`);
    
    const prompt = `You are a financial analyst with expertise in equity research and earnings analysis.

TASK: Generate a comprehensive company profile analysis for the stock symbol "${stockSymbol}". Focus on recent performance, competitive position, and growth opportunities.

ANALYSIS REQUIREMENTS:
1. Analyze the most recent earnings report and key financial metrics
2. Evaluate competitive positioning within their industry
3. Identify growth opportunities and market trends
4. Assess management effectiveness and strategic initiatives
5. Consider industry headwinds and tailwinds

RESEARCH FOCUS:
- Latest quarterly/yearly earnings performance vs expectations
- Revenue growth trends and key business drivers
- Competitive advantages and market position
- Management guidance and future outlook
- Industry dynamics and market opportunities

Return ONLY valid JSON in this exact format:
{
  "stockSymbol": "${stockSymbol}",
  "companyInfo": {
    "name": "Company full name",
    "sector": "Industry sector",
    "marketCap": "Market capitalization",
    "recentPrice": "Current/latest stock price"
  },
  "recentPerformance": {
    "earningsSummary": "Brief summary of latest earnings results",
    "keyMetrics": [
      {"metric": "Revenue Growth", "value": "YOY percentage change", "trend": "positive/negative/neutral"},
      {"metric": "Net Income", "value": "Amount and change", "trend": "positive/negative/neutral"},
      {"metric": "EPS", "value": "Earnings per share vs estimates", "trend": "positive/negative/neutral"}
    ],
    "executiveSummary": "2-3 sentence summary of recent performance"
  },
  "competitiveAnalysis": {
    "mainCompetitors": [
      {"name": "Competitor name", "strength": "Their key competitive advantage"},
      {"name": "Another competitor", "strength": "Their strength"},
      {"name": "Third competitor", "strength": "Their advantage"}
    ],
    "competitivePosition": "Assessment of company's competitive position and differentiation",
    "marketShare": "Estimated market share and trends"
  },
  "growthOpportunities": [
    {"opportunity": "Specific growth opportunity", "potential": "Estimated impact/potential"},
    {"opportunity": "Another opportunity", "potential": "Impact assessment"},
    {"opportunity": "Third opportunity", "potential": "Growth potential"}
  ],
  "investmentOutlook": {
    "strengths": ["Key business strength", "Another strength", "Third strength"],
    "risks": ["Primary risk factor", "Secondary risk", "Third risk"],
    "recommendation": "Buy/Hold/Sell with brief rationale"
  }
}`;

    try {
      const response = await this.model.generateContent(prompt);
      const responseText = response.response.text();
      
      // Clean the response text to extract JSON
      let cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to extract JSON if wrapped in other text
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      const result = JSON.parse(cleanedResponse);
      
      console.log(`✅ Generated Company Profile for: ${stockSymbol}`);
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      console.error('❌ Error generating Company Profile:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: {
          stockSymbol,
          companyInfo: {
            name: "Company data unavailable",
            sector: "Analysis pending",
            marketCap: "N/A",
            recentPrice: "N/A"
          },
          recentPerformance: {
            earningsSummary: "Unable to retrieve earnings data at this time",
            keyMetrics: [
              { metric: "Data Unavailable", value: "Please try again", trend: "neutral" }
            ],
            executiveSummary: "Company profile analysis is temporarily unavailable. Please retry."
          },
          competitiveAnalysis: {
            mainCompetitors: [{ name: "Analysis pending", strength: "Data unavailable" }],
            competitivePosition: "Analysis unavailable - please retry",
            marketShare: "Data pending"
          },
          growthOpportunities: [{ opportunity: "Retry analysis", potential: "Please try again later" }],
          investmentOutlook: {
            strengths: ["Analysis unavailable"],
            risks: ["Technical difficulties"],
            recommendation: "Data unavailable"
          }
        }
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.model.generateContent("Hello, are you working?");
      return result.response.text().length > 0;
    } catch (error) {
      console.error('❌ Gemini health check failed:', error);
      return false;
    }
  }
}
