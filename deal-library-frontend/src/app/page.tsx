'use client';

import { useState, useEffect } from 'react';
import { Deal, DealFilters, Persona, AudienceInsights, GeoCard, MarketingSWOT, CompanyProfile } from '@/types/deal';
import { useSaveCard, useCart } from '@/components/AppLayout';
import { MarketSizing } from '@/components/MarketSizingCard';
import { mockDeals } from '@/data/mockDeals';
import { sampleAudienceInsights, sampleMarketSizing, sampleGeoCards } from '@/data/sampleCards';
import ChatInterface from '@/components/ChatInterface';
import FilterPanel from '@/components/FilterPanel';
import DealGrid from '@/components/DealGrid';
import CustomDealForm from '@/components/CustomDealForm';
import DealDetailModal from '@/components/DealDetailModal';
import SavedCards from '@/components/SavedCards';
import { TrendingUp, Users, DollarSign, Clock, ShoppingCart, Globe } from 'lucide-react';

// Advanced search and relevance scoring system
interface DealScore {
  deal: Deal;
  score: number;
  reasons: string[];
}

function calculateDealRelevanceScore(deal: Deal, query: string): DealScore {
  const queryLower = query.toLowerCase();
  const dealNameLower = (deal.dealName || '').toLowerCase();
  const descriptionLower = (deal.description || '').toLowerCase();
  
  let score = 0;
  const reasons: string[] = [];
  
  // Exact name match (highest priority)
  if (dealNameLower.includes(queryLower)) {
    score += 100;
    reasons.push('Exact deal name match');
  }
  
  // Partial name match
  const nameWords = queryLower.split(' ');
  const dealNameWords = dealNameLower.split(' ');
  const matchingWords = nameWords.filter(word => 
    dealNameWords.some(dealWord => dealWord.includes(word) || word.includes(dealWord))
  );
  
  if (matchingWords.length > 0) {
    score += matchingWords.length * 20;
    reasons.push(`${matchingWords.length} word(s) match in deal name`);
  }
  
  // Description match
  if (descriptionLower.includes(queryLower)) {
    score += 30;
    reasons.push('Description contains search terms');
  }
  
  // Category field no longer exists on Deal; skip
  
  // Media type match
  if ((deal.mediaType || '').toLowerCase().includes(queryLower)) {
    score += 20;
    reasons.push('Media type match');
  }
  
  return { deal, score, reasons };
}

function getRelevantDeals(deals: Deal[], query: string, limit: number = 6): Deal[] {
  if (!query.trim()) return deals.slice(0, limit);
  
  const scoredDeals = deals
    .map(deal => calculateDealRelevanceScore(deal, query))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return scoredDeals.map(result => result.deal);
}

interface HomePageProps {
  sidebarOpen?: boolean;
  onSaveCard?: (card: { type: 'deal' | 'persona' | 'audience-insights' | 'market-sizing' | 'geo-cards', data: any }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export default function HomePage() {
  const sidebarOpen = true;
  // Get save/unsave functions from context instead of props
  const { onSaveCard, onUnsaveCard, isSaved } = useSaveCard();
  const { onAddToCart, onRemoveFromCart, isInCart } = useCart();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [filters, setFilters] = useState<DealFilters>({
    search: '',
    targeting: '',
    environment: '',
    mediaType: '',
    dateRange: { start: '', end: '' },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatInputValue, setChatInputValue] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiPersonas, setAiPersonas] = useState<any[]>([]);
  const [aiAudienceInsights, setAiAudienceInsights] = useState<any[]>([]);
  const [aiMarketSizing, setAiMarketSizing] = useState<any[]>([]);
  const [aiGeoCards, setAiGeoCards] = useState<any[]>([]);
  const [aiMarketingSWOT, setAiMarketingSWOT] = useState<MarketingSWOT[]>([]);
  const [aiCompanyProfiles, setAiCompanyProfiles] = useState<CompanyProfile[]>([]);
  const [aiCoaching, setAiCoaching] = useState<any>(null);
  
  // Note: Cart and modal state are now managed in AppLayout.tsx to work across all pages

  // Check for prompt URL parameter and auto-submit
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const promptParam = urlParams.get('prompt');
    
    if (promptParam) {
      console.log('🎯 Auto-submitting prompt from URL:', promptParam);
      setChatInputValue(promptParam);
      // Wait a moment for the component to fully mount
      setTimeout(() => {
        handleSearch(promptParam);
        // Clean up URL
        window.history.replaceState({}, '', '/');
      }, 500);
    }
  }, []);

  // Load deals on component mount
  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        const response = await fetch('http://localhost:3002/api/deals');
        
        if (!response.ok) {
          // Try to get the actual error message from the backend
          let errorMessage = `Failed to load deals: ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // If we can't parse the error response, use the default message
          }
          throw new Error(errorMessage);
        }
        
        const dealsData = await response.json();
        setDeals(dealsData.deals || []);
        console.log('✅ Successfully loaded deals:', dealsData.deals?.length || 0);
        // Don't automatically show deals - only show when explicitly requested through search
      } catch (err) {
        console.error('Error loading deals:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load deals. Please try again later.';
        setError(errorMessage);
        // Fallback to mock data for development
        setDeals(mockDeals);
        console.log('⚠️ Using mock deals data due to connection issue');
        // Don't automatically show deals - only show when explicitly requested through search
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, []);

  // Note: Event listeners for cart and custom deal form are now in AppLayout.tsx

  // Handle search
  const handleSearch = async (query: string, conversationHistory?: Array<{role: string, content: string}>, cardTypes?: string[]) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      // Don't clear aiResponse here - let it be replaced when new response arrives
      // Clear ALL previous card data to prevent stale results
      setFilteredDeals([]);
      setAiPersonas([]);
      setAiAudienceInsights([]);
      setAiMarketSizing([]);
      setAiGeoCards([]);
      setAiCoaching(undefined);

      // Determine search type based on keywords
      const queryLower = query.toLowerCase();
      
      // Handle multiple card types with unified search
      if (cardTypes && cardTypes.length > 1) {
        console.log('🔍 Multiple card types selected, using unified search:', cardTypes);
        try {
          const response = await fetch('http://localhost:3002/api/unified-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, cardTypes }), // Pass the selected card types
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // Set results based on selected card types
            if (cardTypes.includes('deals')) {
              const relevantDeals = getRelevantDeals(data.deals || [], query, 6);
              setFilteredDeals(relevantDeals);
            }
            if (cardTypes.includes('personas')) {
              setAiPersonas(data.personas || []);
            }
            if (cardTypes.includes('audience-insights')) {
              setAiAudienceInsights(data.audienceInsights || []);
            }
            if (cardTypes.includes('market-sizing')) {
              setAiMarketSizing(data.marketSizing || []);
            }
            if (cardTypes.includes('geographic')) {
              setAiGeoCards(data.geoCards || []);
            }
            
            setAiResponse(`Found comprehensive results across ${cardTypes.length} categories: ${cardTypes.join(', ')}`);
            return;
          } else {
            console.error('Unified search failed, falling back to individual searches');
          }
        } catch (error) {
          console.error('Unified search request failed:', error);
          // Fall through to individual searches
        }
      }

      // Handle single card type selection with explicit routing
      if (cardTypes && cardTypes.length === 1) {
        console.log('🔍 Single card type selected, using targeted search:', cardTypes[0]);
        const selectedType = cardTypes[0];
        
        if (selectedType === 'market-sizing') {
          try {
            const response = await fetch('http://localhost:3002/api/market-sizing', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query, conversationHistory: conversationHistory || [] }),
            });
            
            if (response.ok) {
              const data = await response.json();
              setAiMarketSizing(data.marketSizing || []);
              setAiResponse(data.aiResponse || 'Here is the market sizing analysis for your query.');
              return;
            }
          } catch (error) {
            console.error('Market sizing request failed:', error);
            setAiResponse('Market sizing analysis is temporarily unavailable. Please try again later.');
            return;
          }
        }
        
        if (selectedType === 'deals') {
          console.log('🔍 USING DEALS SEARCH PATH for:', query);
          try {
            const response = await fetch('http://localhost:3002/api/deals/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                query, 
                conversationHistory: conversationHistory || [],
                forceDeals: true
              }),
            });

            if (response.ok) {
              const searchResults = await response.json();
              console.log('🔍 FRONTEND DEBUG - API Response:', {
                hasDeals: !!(searchResults.deals && searchResults.deals.length > 0),
                dealsCount: searchResults.deals?.length || 0,
                hasCoaching: 'coaching' in searchResults,
                coaching: searchResults.coaching
              });
              const relevantDeals = getRelevantDeals(searchResults.deals || [], query, 6);
              setFilteredDeals(relevantDeals);
              setAiResponse(searchResults.aiResponse || `Found ${relevantDeals.length} relevant deals for your query.`);
              console.log('🔍 FRONTEND DEBUG - Setting coaching:', searchResults.coaching);
              console.log('🔍 FRONTEND DEBUG - Deals Search Coaching check:', {
                hasCoaching: !!searchResults.coaching,
                type: typeof searchResults.coaching,
                isObject: searchResults.coaching && typeof searchResults.coaching === 'object',
                keys: searchResults.coaching ? Object.keys(searchResults.coaching) : 'no keys',
                keyLength: searchResults.coaching ? Object.keys(searchResults.coaching).length : 0
              });
              // Set coaching if it exists and has content
              console.log('🔍 FRONTEND DEBUG - Deals path: About to set coaching. Raw coaching data:', JSON.stringify(searchResults.coaching, null, 2));
              if (searchResults.coaching && typeof searchResults.coaching === 'object' && searchResults.coaching !== null) {
                console.log('🔍 FRONTEND DEBUG - Deals path: Processing valid coaching data - CALLING setAiCoaching with:', searchResults.coaching);
                setAiCoaching(searchResults.coaching);
                console.log('🔍 FRONTEND DEBUG - Deals path: setAiCoaching called successfully');
              } else {
                console.log('🔍 FRONTEND DEBUG - Deals path: No valid coaching data, setting to undefined');
                console.log('🔍 FRONTEND DEBUG - Deals path: Condition failed:', {
                  hasCoaching: !!searchResults.coaching,
                  type: typeof searchResults.coaching,
                  isNull: searchResults.coaching === null
                });
                setAiCoaching(undefined);
              }
              return;
            }
          } catch (error) {
            console.error('Deals search request failed:', error);
            setAiResponse('Deals search is temporarily unavailable. Please try again later.');
            return;
          }
        }
        
        if (selectedType === 'personas') {
          try {
            const response = await fetch('http://localhost:3002/api/unified-search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query, cardType: 'personas' }),
            });
            
            if (response.ok) {
              const data = await response.json();
              const personas = data.personas || [];
              
              if (personas.length > 0) {
                setAiPersonas(personas);
                setAiResponse(personas[0].isDynamic 
                  ? `Generated dynamic persona for ${personas[0].category} audience based on real commerce data and demographic insights.`
                  : `Found ${personas.length} relevant personas for your query.`
                );
              } else {
                setAiResponse('No personas found for your query. Please try different search terms.');
              }
              return;
            }
          } catch (error) {
            console.error('Personas search request failed:', error);
            setAiResponse('Personas search is temporarily unavailable. Please try again later.');
            return;
          }
        }
        
        if (selectedType === 'audience-insights') {
          try {
            const response = await fetch('http://localhost:3002/api/audience-insights', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query, conversationHistory: conversationHistory || [] }),
            });
            
            if (response.ok) {
              const data = await response.json();
              setAiAudienceInsights(data.audienceInsights || []);
              setAiResponse(data.aiResponse || 'Here are the audience insights for your query.');
              // Don't set any deals when only audience-insights is selected
              setFilteredDeals([]);
              return;
            } else {
              console.error('Audience insights API returned error:', response.status, response.statusText);
              setAiResponse('Audience insights are temporarily unavailable. Please try again later.');
              return;
            }
          } catch (error) {
            console.error('Audience insights request failed:', error);
            setAiResponse('Audience insights are temporarily unavailable. Please try again later.');
            return;
          }
        }
        
        if (selectedType === 'geographic') {
          try {
            const response = await fetch('http://localhost:3002/api/geographic-insights', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                query, 
                conversationHistory: conversationHistory || [],
                cardTypes: ['geographic']
              }),
            });

            if (response.ok) {
              const data = await response.json();
              setAiGeoCards(data.geoCards || []);
              setAiResponse(data.aiResponse || 'Here are the geographic insights for your query.');
              return;
            }
          } catch (error) {
            console.error('Geographic insights request failed:', error);
            setAiResponse('Geographic insights are temporarily unavailable. Please try again later.');
            return;
          }
        }
        
        if (selectedType === 'marketing-swot') {
          try {
            // Extract company name from query or use the full query
            const companyName = query.replace(/swot|analysis|marketing/i, '').trim();
            
            const response = await fetch('http://localhost:3002/api/marketing-swot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companyName: companyName || query }),
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
              const swotData: MarketingSWOT = {
                id: `swot-${Date.now()}`,
                companyName: result.data.companyName,
                swot: result.data.swot,
                summary: result.data.summary,
                recommendedActions: result.data.recommendedActions,
                sampleData: false
              };
              setAiMarketingSWOT([swotData]);
              setAiResponse(`Marketing SWOT analysis generated for ${result.data.companyName}.`);
              return;
            } else {
              console.error('Marketing SWOT API error:', result);
              setAiResponse(result.message || 'Marketing SWOT analysis is temporarily unavailable. Please try again later.');
              return;
            }
          } catch (error) {
            console.error('Marketing SWOT request failed:', error);
            setAiResponse('Marketing SWOT analysis is temporarily unavailable. Please try again later.');
            return;
          }
        }
        
        if (selectedType === 'company-profile') {
          try {
            // Extract stock symbol from query or use the full query
            const stockSymbol = query.replace(/company|profile|stock|ticker/i, '').trim().toUpperCase();
            
            const response = await fetch('http://localhost:3002/api/company-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stockSymbol: stockSymbol || query }),
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
              const profileData: CompanyProfile = {
                id: `profile-${Date.now()}`,
                stockSymbol: result.data.stockSymbol,
                companyInfo: result.data.companyInfo,
                recentPerformance: result.data.recentPerformance,
                competitiveAnalysis: result.data.competitiveAnalysis,
                growthOpportunities: result.data.growthOpportunities,
                investmentOutlook: result.data.investmentOutlook,
                sampleData: false
              };
              setAiCompanyProfiles([profileData]);
              setAiResponse(`Company profile generated for ${result.data.stockSymbol} (${result.data.companyInfo.name}).`);
              return;
            } else {
              console.error('Company Profile API error:', result);
              setAiResponse(result.message || 'Company profile analysis is temporarily unavailable. Please try again later.');
              return;
            }
          } catch (error) {
            console.error('Company profile request failed:', error);
            setAiResponse('Company profile analysis is temporarily unavailable. Please try again later.');
            return;
          }
        }
      }
      
      // Check for market sizing queries FIRST (before deal requests) - only when no card types selected
      const marketSizingKeywords = [
        'market sizing', 'market size', 'what\'s the market size', 'what is the market size',
        'total addressable market', 'tam', 'market opportunity', 
        'market trends', 'market analysis', 'industry trends', 'market growth',
        'percentage', 'what percentage', 'how much', 'how big', 'market share', 
        'ad spend', 'programmatic spend', 'digital ad spend', 'advertising spend', 
        'industry statistics', 'market data', 'size of the market'
      ];
      
      // Only use keyword detection when no card types are explicitly selected
      const isMarketSizingSearch = (!cardTypes || cardTypes.length === 0) && marketSizingKeywords.some(keyword => queryLower.includes(keyword));

      console.log('🔍 Market sizing check:', {
        query: query,
        queryLower: queryLower,
        isMarketSizingSearch: isMarketSizingSearch,
        matchedKeywords: marketSizingKeywords.filter(keyword => queryLower.includes(keyword))
      });

      if (isMarketSizingSearch) {
        console.log('📈 Market sizing search detected, making API call...');
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        try {
          const response = await fetch('http://localhost:3002/api/market-sizing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, conversationHistory: conversationHistory || [] }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            setAiMarketSizing(data.marketSizing || []);
            setAiResponse(data.aiResponse || 'Here is the market sizing analysis for your query.');
            return;
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('Market sizing request failed:', error);
          setAiResponse('Market sizing analysis is temporarily unavailable. Please try again later.');
          return;
        }
      }

      // Explicit deal requests (now comes AFTER market sizing check)
      const explicitDealKeywords = [
        'request deals', 'find deals', 'show me deals', 'get deals', 'deal request',
        'provide relevant deals', 'relevant deals for', 'find relevant deals',
        'reach new parents', 'reach parents', 'target new parents', 'target parents',
        'media director', 'media strategy', 'building a', 'pet related', 'pet strategy',
        'sports fans', 'reach sports fans', 'target sports fans', 'sports', 'athletics', 'fitness',
        'luxury goods', 'fashion', 'accessories', 'targeting', 'reach'
      ];
      
      // Only use keyword detection when no card types are explicitly selected
      const isExplicitDealRequest = (!cardTypes || cardTypes.length === 0) && explicitDealKeywords.some(keyword => 
        queryLower.includes(keyword)
      );

      if (isExplicitDealRequest) {
        // Search for deals
        const response = await fetch('http://localhost:3002/api/deals/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query, 
            conversationHistory: conversationHistory || [],
            forceDeals: true // Backend expects forceDeals parameter
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to search deals: ${response.statusText}`);
        }

        const searchResults = await response.json();
        console.log('🔍 FRONTEND DEBUG - Explicit Deal Request API Response:', {
          hasDeals: !!(searchResults.deals && searchResults.deals.length > 0),
          dealsCount: searchResults.deals?.length || 0,
          hasCoaching: 'coaching' in searchResults,
          coaching: searchResults.coaching,
          responseKeys: Object.keys(searchResults)
        });
        const relevantDeals = getRelevantDeals(searchResults.deals || [], query, 6);
        setFilteredDeals(relevantDeals);
        setAiResponse(searchResults.aiResponse || `Found ${relevantDeals.length} relevant deals for your query.`);
        console.log('🔍 FRONTEND DEBUG - Explicit Deal Request Setting coaching:', searchResults.coaching);
        // Set coaching if it exists and has content
        if (searchResults.coaching && typeof searchResults.coaching === 'object' && searchResults.coaching !== null) {
          console.log('🔍 FRONTEND DEBUG - Explicit Deal Request Processing valid coaching data:', searchResults.coaching);
          setAiCoaching(searchResults.coaching);
        } else {
          console.log('🔍 FRONTEND DEBUG - Explicit Deal Request No valid coaching data, setting to undefined');
          setAiCoaching(undefined);
        }
        return;
      }

      // Persona search - use unified search for dynamic persona generation
      const personaKeywords = ['persona', 'personas', 'buyer', 'buyers', 'customer profile'];
      const isPersonaSearch = (!cardTypes || cardTypes.length === 0) && personaKeywords.some(keyword => queryLower.includes(keyword));

      if (isPersonaSearch) {
        console.log('🎭 Persona search detected, using unified search...');
        try {
          const response = await fetch('http://localhost:3002/api/unified-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, cardType: 'personas' }),
          });
          
          if (response.ok) {
            const data = await response.json();
            const personas = data.personas || [];
            console.log(`🎭 Unified search returned ${personas.length} personas`);
            
            if (personas.length > 0) {
              setAiPersonas(personas);
              setAiResponse(personas[0].isDynamic 
                ? `Generated dynamic persona for ${personas[0].category} audience based on real commerce data and demographic insights.`
                : `Found ${personas.length} relevant personas for your query.`
              );
              return;
            } else {
              setAiResponse('No personas found for your query. Please try different search terms.');
              return;
            }
          } else {
            setAiResponse('Persona search is temporarily unavailable. Please try again later.');
            return;
          }
        } catch (error) {
          console.error('Persona search request failed:', error);
          setAiResponse('Persona search is temporarily unavailable. Please try again later.');
          return;
        }
      }


      // Audience insights search - for audience-specific queries
      const audienceInsightsKeywords = [
        'audience insights', 'audience analysis', 'demographics', 'psychographics', 'behavioral',
        'audience characteristics', 'target audience', 'consumer behavior'
      ];
      const isAudienceInsightsSearch = (!cardTypes || cardTypes.length === 0) && audienceInsightsKeywords.some(keyword => queryLower.includes(keyword));

      if (isAudienceInsightsSearch) {
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        try {
          const response = await fetch('http://localhost:3002/api/audience-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, conversationHistory: conversationHistory || [] }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            setAiAudienceInsights(data.audienceInsights || []);
            setAiResponse(data.aiResponse || 'Here are the audience insights for your query.');
            return;
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('Audience insights request failed:', error);
          setAiResponse('Audience insights are temporarily unavailable. Please try again later.');
          return;
        }
      }


      // Geographic insights search
      const geoKeywords = ['geographic', 'location', 'zip code', 'city', 'state', 'region', 'geo'];
      const isGeoSearch = (!cardTypes || cardTypes.length === 0) && geoKeywords.some(keyword => queryLower.includes(keyword));

      if (isGeoSearch) {
        try {
          const response = await fetch('http://localhost:3002/api/geographic-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              query, 
              conversationHistory: conversationHistory || [],
              cardTypes: cardTypes || ['geo-cards']
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setAiGeoCards(data.geoCards || []);
            setAiResponse(data.aiResponse || 'Here are the geographic insights for your query.');
            return;
          } else {
            setAiResponse('Geographic insights are temporarily unavailable. Please try again later.');
            return;
          }
        } catch (error) {
          console.error('Geographic insights request failed:', error);
          setAiResponse('Geographic insights are temporarily unavailable. Please try again later.');
          return;
        }
      }

      // Default: general AI search with timeout
      console.log('🔍 USING GENERAL SEARCH PATH for:', query);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
      
      try {
        const response = await fetch('http://localhost:3002/api/deals/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query, 
            conversationHistory: conversationHistory || [],
            cardTypes: cardTypes || []
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to search: ${response.statusText}`);
        }

        const searchResults = await response.json();
        console.log('🔍 FRONTEND DEBUG - General Search API Response:', {
          hasDeals: !!(searchResults.deals && searchResults.deals.length > 0),
          dealsCount: searchResults.deals?.length || 0,
          hasCoaching: 'coaching' in searchResults,
          coaching: searchResults.coaching,
          responseKeys: Object.keys(searchResults)
        });
        const relevantDeals = getRelevantDeals(searchResults.deals || [], query, 6);
        setFilteredDeals(relevantDeals);
        setAiResponse(searchResults.aiResponse || `Found ${relevantDeals.length} relevant deals for your query.`);
        console.log('🔍 FRONTEND DEBUG - General Search Setting coaching:', searchResults.coaching);
        console.log('🔍 FRONTEND DEBUG - General Search Coaching check:', {
          hasCoaching: !!searchResults.coaching,
          type: typeof searchResults.coaching,
          isObject: searchResults.coaching && typeof searchResults.coaching === 'object',
          keys: searchResults.coaching ? Object.keys(searchResults.coaching) : 'no keys',
          keyLength: searchResults.coaching ? Object.keys(searchResults.coaching).length : 0
        });
        // Set coaching if it exists and has content
        console.log('🔍 FRONTEND DEBUG - About to set coaching. Raw coaching data:', JSON.stringify(searchResults.coaching, null, 2));
        if (searchResults.coaching && typeof searchResults.coaching === 'object' && searchResults.coaching !== null) {
          console.log('🔍 FRONTEND DEBUG - General Search Processing valid coaching data - CALLING setAiCoaching with:', searchResults.coaching);
          setAiCoaching(searchResults.coaching);
          console.log('🔍 FRONTEND DEBUG - setAiCoaching called successfully');
        } else {
          console.log('🔍 FRONTEND DEBUG - General Search No valid coaching data, setting to undefined');
          console.log('🔍 FRONTEND DEBUG - Condition failed:', {
            hasCoaching: !!searchResults.coaching,
            type: typeof searchResults.coaching,
            isNull: searchResults.coaching === null
          });
          setAiCoaching(undefined);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Search timed out. Please try a more specific query or try again.');
        }
        throw fetchError;
      }

    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Search failed. Please try again.';
      setError(errorMessage);
      // Always set an AI response to reset the typing state
      setAiResponse(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDealClick = (deal: Deal) => {
    console.log('📋 HomePage: Deal clicked, dispatching event to AppLayout');
    const event = new CustomEvent('openDealModal', { detail: { deal } });
    window.dispatchEvent(event);
  };

  return (
    <>
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full pb-32">
        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full w-full max-w-full overflow-hidden">
          <ChatInterface
              onSearch={handleSearch}
              deals={filteredDeals}
              loading={loading}
              onDealClick={handleDealClick}
              onFilterToggle={() => {}}
              inputValue={chatInputValue}
              onInputValueChange={setChatInputValue}
              resetChat={false}
              sidebarOpen={sidebarOpen}
              onSaveCard={onSaveCard}
              onUnsaveCard={onUnsaveCard}
              isSaved={isSaved}
              aiResponse={aiResponse}
              aiPersonas={aiPersonas}
              aiAudienceInsights={aiAudienceInsights}
              aiMarketSizing={aiMarketSizing}
              aiGeoCards={aiGeoCards}
              aiMarketingSWOT={aiMarketingSWOT}
              aiCompanyProfiles={aiCompanyProfiles}
              aiCoaching={aiCoaching}
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
              isInCart={isInCart}
            />
        </div>

        {/* Note: Modals are now managed in AppLayout.tsx */}

      </div>
    </>
  );
}