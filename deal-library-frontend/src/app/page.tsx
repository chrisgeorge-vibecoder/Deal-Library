'use client';

import { useState, useEffect } from 'react';
import { Deal, DealFilters, Persona, AudienceInsights, GeoCard, MarketingSWOT, CompanyProfile, MarketingNews } from '@/types/deal';
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
  const [aiMarketingNews, setAiMarketingNews] = useState<MarketingNews[]>([]);
  const [aiCompetitiveIntelligence, setAiCompetitiveIntelligence] = useState<any[]>([]);
  const [aiContentStrategy, setAiContentStrategy] = useState<any[]>([]);
  const [aiBrandStrategy, setAiBrandStrategy] = useState<any[]>([]);
  const [aiCoaching, setAiCoaching] = useState<any>(null);
  
  // Note: Cart and modal state are now managed in AppLayout.tsx to work across all pages

  // Check for prompt URL parameter and auto-submit
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const promptParam = urlParams.get('prompt');
    
    if (promptParam) {
      console.log('🎯 Auto-submitting prompt from URL:', promptParam);
      setChatInputValue(promptParam);
      // Wait longer for the component to fully mount and for user to see the prompt
      const timeoutId = setTimeout(() => {
        handleSearch(promptParam);
        // Clear the input value after search starts
        setChatInputValue('');
        // Clean up URL after search completes
        window.history.replaceState({}, '', '/');
      }, 1500); // Increased from 500ms to 1500ms to show prompt longer
      
      // Cleanup timeout on unmount to prevent state updates after component unmounts
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, []);

  // Load deals on component mount
  useEffect(() => {
    let isMounted = true; // Flag to track if component is still mounted
    
    const loadDeals = async () => {
      try {
        if (isMounted) setLoading(true);
        if (isMounted) setError(null); // Clear any previous errors
        const response = await fetch('http://localhost:3001/api/deals');
        
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
        if (isMounted) {
          setDeals(dealsData.deals || []);
          console.log('✅ Successfully loaded deals:', dealsData.deals?.length || 0);
        }
        // Don't automatically show deals - only show when explicitly requested through search
      } catch (err) {
        if (isMounted) {
          // Check if it's a connection error (backend not running)
          if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
            // Silently use mock data instead of showing error when backend is down
            setDeals(mockDeals);
            setError(null); // Don't show error for backend unavailability
            console.log('⚠️ Backend unavailable, using mock deals data');
          } else {
            // Show error for other types of failures
            console.error('Error loading deals:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load deals. Please try again later.';
            setError(errorMessage);
            setDeals(mockDeals);
          }
        }
        // Don't automatically show deals - only show when explicitly requested through search
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDeals();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  // Note: Event listeners for cart and custom deal form are now in AppLayout.tsx

  // Helper function to generate context-aware fallback news
  const getFallbackNews = (query: string): MarketingNews[] => {
    const queryLower = query.toLowerCase();
    const isCommerceQuery = queryLower.includes('commerce') || queryLower.includes('retail');
    
    if (isCommerceQuery) {
      return [
        {
          id: `fallback-commerce-1-${Date.now()}`,
          headline: "Retail Media Networks See Explosive Growth as Brands Shift Ad Spend",
          source: "AdWeek",
          synopsis: "Major retailers are expanding their retail media networks, creating new opportunities for brands to reach consumers at the point of purchase.",
          companies: ["Amazon", "Walmart", "Target"],
          keyInsights: ["Retail media is becoming a major advertising channel", "First-party data from retailers provides targeting advantages", "Measurement standards need standardization"],
          url: "#",
          publishDate: new Date().toISOString().split('T')[0],
          relevanceScore: 0.9
        },
        {
          id: `fallback-commerce-2-${Date.now()}`,
          headline: "Social Commerce Platforms Integrate Advanced Targeting for Brand Partnerships",
          source: "Modern Retail",
          synopsis: "Platforms are combining commerce and media capabilities to offer brands more sophisticated targeting and attribution in social shopping experiences.",
          companies: ["TikTok", "Instagram", "Pinterest"],
          keyInsights: ["Social commerce requires integrated media strategy", "Influencer partnerships driving commerce growth", "Platform attribution models evolving"],
          url: "#",
          publishDate: new Date().toISOString().split('T')[0],
          relevanceScore: 0.8
        }
      ];
    }
    
    // Default marketing news fallback
    return [
      {
        id: `fallback-1-${Date.now()}`,
        headline: "Marketing Technology Trends Continue to Evolve",
        source: "Industry Analysis",
        synopsis: "Latest developments in marketing technology and AI-driven solutions are transforming how brands reach consumers in 2024.",
        companies: ["Google", "Salesforce", "HubSpot"],
        keyInsights: ["AI automation transforming ad targeting", "Personalization becoming standard", "ROI measurement tools advancing"],
        url: "#",
        publishDate: new Date().toISOString().split('T')[0],
        relevanceScore: 0.9
      }
    ];
  };

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
      setAiMarketingNews([]);
      setAiCompetitiveIntelligence([]);
      setAiContentStrategy([]);
      setAiBrandStrategy([]);
      setAiCoaching(undefined);

      // Determine search type based on keywords
      const queryLower = query.toLowerCase();
      
      // Handle multiple card types with unified search
      if (cardTypes && cardTypes.length > 1) {
        console.log('🔍 Multiple card types selected, using unified search:', cardTypes);
        try {
          const response = await fetch('http://localhost:3001/api/unified-search', {
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
            if (cardTypes.includes('marketing-news')) {
              setAiMarketingNews(data.marketingNews || []);
            }
            if (cardTypes.includes('competitive-intelligence')) {
              setAiCompetitiveIntelligence(data.competitiveIntelligence || []);
            }
            if (cardTypes.includes('content-strategy')) {
              setAiContentStrategy(data.contentStrategy || []);
            }
            if (cardTypes.includes('brand-strategy')) {
              setAiBrandStrategy(data.brandStrategy || []);
            }
            
            setAiResponse(`Found comprehensive results across ${cardTypes.length} categories: ${cardTypes.join(', ')}`);
            return;
          } else {
            console.error('Unified search failed, falling back to individual searches');
          }
        } catch (error) {
          console.error('Unified search request failed:', error);
          // Check if it's a network error (backend not running)
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.log('⚠️ Backend appears to be offline during unified search');
            setAiResponse('The search service is temporarily unavailable. Please try again later or check if the backend server is running.');
            return;
          }
          // Fall through to individual searches for other errors
        }
      }

      // Handle single card type selection with explicit routing
      if (cardTypes && cardTypes.length === 1) {
        console.log('🔍 Single card type selected, using targeted search:', cardTypes[0]);
        const selectedType = cardTypes[0];
        
        if (selectedType === 'market-sizing') {
          try {
            const response = await fetch('http://localhost:3001/api/market-sizing', {
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
            const response = await fetch('http://localhost:3001/api/deals/search', {
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
            const response = await fetch('http://localhost:3001/api/unified-search', {
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
            const response = await fetch('http://localhost:3001/api/audience-insights', {
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
            const response = await fetch('http://localhost:3001/api/geographic-insights', {
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
            
            const response = await fetch('http://localhost:3001/api/marketing-swot', {
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
            
            const response = await fetch('http://localhost:3001/api/company-profile', {
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
      
      // Marketing News search - check this FIRST to avoid conflicts with market sizing
      const newsKeywords = ['news', 'headlines', 'latest', 'marketing news', 'advertising news', 'industry news', 'today\'s marketing', 'today\'s advertising', 'commerce media headlines', 'share headlines', 'commerce headlines'];
      const isMarketingNewsSearch = (!cardTypes || cardTypes.length === 0) && (
        newsKeywords.some(keyword => queryLower.includes(keyword)) || 
        (queryLower.includes('share') && queryLower.includes('headlines'))
      );

      console.log('🔍 Marketing News check:', {
        query: query,
        queryLower: queryLower,
        cardTypes: cardTypes,
        cardTypesLength: cardTypes?.length,
        hasCardTypes: !!cardTypes,
        isMarketingNewsSearch: isMarketingNewsSearch,
        matchedKeywords: newsKeywords.filter(keyword => queryLower.includes(keyword)),
        hasShareHeadlines: queryLower.includes('share') && queryLower.includes('headlines')
      });

      if (isMarketingNewsSearch) {
        console.log('📰 Marketing news search detected, making API call...');
        try {
          const response = await fetch('http://localhost:3001/api/marketing-news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query }),
          });

          console.log('📰 Marketing news API response status:', response.status, response.ok);
          
          try {
            // Try to parse response even if HTTP status is not ok, as backend provides fallback data
            const data = await response.json();
            console.log('📰 Marketing news API response data:', { 
              hasMarketingNews: !!(data.marketingNews && data.marketingNews.length > 0), 
              newsCount: data.marketingNews?.length || 0,
              hasAiResponse: !!data.aiResponse 
            });
            
            if (data.marketingNews && data.marketingNews.length > 0) {
              setAiMarketingNews(data.marketingNews);
              setAiResponse(data.aiResponse || 'Here are the latest marketing and advertising headlines.');
              console.log('📰 Successfully set marketing news data');
              return;
            } else {
              console.log('📰 No marketing news data found in response');
              setAiResponse('Marketing news headlines are temporarily unavailable. Please try again later.');
              return;
            }
          } catch (parseError) {
            console.error('Failed to parse marketing news response:', parseError);
            setAiResponse('Marketing news headlines are temporarily unavailable. Please try again later.');
            return;
          }
        } catch (error) {
          console.error('Marketing news request failed:', error);
          
          // Check if it's a network error (backend not running)
          if (error instanceof TypeError && error.message && error.message.includes('Failed to fetch')) {
            console.log('⚠️ Backend appears to be offline, providing static fallback for chat');
            // Provide static fallback when backend is completely unavailable
            const fallbackNews = getFallbackNews(query);
            
            setAiMarketingNews(fallbackNews);
            setAiResponse('Here are the latest marketing and advertising headlines. Note: Real-time news may be temporarily unavailable.');
            return;
          } else {
            setAiResponse('Marketing news headlines are temporarily unavailable. Please try again later.');
            return;
          }
        }
      }

      // If marketing news was detected but we got here without returning, set fallback
      if (isMarketingNewsSearch) {
        console.log('📰 Marketing news fallback - no response set, providing default');
        const fallbackNews = getFallbackNews(query);
        setAiMarketingNews(fallbackNews);
        setAiResponse('Here are the latest marketing and advertising headlines.');
        return;
      }

      // Check for market sizing queries - after news check to avoid conflicts
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
          const response = await fetch('http://localhost:3001/api/market-sizing', {
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
        const response = await fetch('http://localhost:3001/api/deals/search', {
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
          const response = await fetch('http://localhost:3001/api/unified-search', {
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
          const response = await fetch('http://localhost:3001/api/audience-insights', {
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
          const response = await fetch('http://localhost:3001/api/geographic-insights', {
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

      if (selectedType === 'competitive-intelligence') {
        try {
          const response = await fetch('http://localhost:3001/api/competitive-intelligence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          });

          const result = await response.json();
          
          if (response.ok && result.success) {
            setAiCompetitiveIntelligence([result.data]);
            setAiResponse(`Competitive intelligence analysis for ${query}`);
            return;
          } else {
            setAiResponse('Competitive intelligence analysis is temporarily unavailable. Please try again later.');
            return;
          }
        } catch (error) {
          console.error('Competitive intelligence request failed:', error);
          setAiResponse('Competitive intelligence analysis is temporarily unavailable. Please try again later.');
          return;
        }
      }

      if (selectedType === 'content-strategy') {
        try {
          const response = await fetch('http://localhost:3001/api/content-strategy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          });

          const result = await response.json();
          
          if (response.ok && result.success) {
            setAiContentStrategy([result.data]);
            setAiResponse(`Content strategy recommendations for ${query}`);
            return;
          } else {
            setAiResponse('Content strategy analysis is temporarily unavailable. Please try again later.');
            return;
          }
        } catch (error) {
          console.error('Content strategy request failed:', error);
          setAiResponse('Content strategy analysis is temporarily unavailable. Please try again later.');
          return;
        }
      }

      if (selectedType === 'brand-strategy') {
        try {
          const response = await fetch('http://localhost:3001/api/brand-strategy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          });

          const result = await response.json();
          
          if (response.ok && result.success) {
            setAiBrandStrategy([result.data]);
            setAiResponse(`Brand strategy analysis for ${query}`);
            return;
          } else {
            setAiResponse('Brand strategy analysis is temporarily unavailable. Please try again later.');
            return;
          }
        } catch (error) {
          console.error('Brand strategy request failed:', error);
          setAiResponse('Brand strategy analysis is temporarily unavailable. Please try again later.');
          return;
        }
      }

      // Default: general AI search with timeout
      console.log('🔍 USING GENERAL SEARCH PATH for:', query);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
      
      try {
        const response = await fetch('http://localhost:3001/api/deals/search', {
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
      
      // Handle specific error types
      let errorMessage = 'Search failed. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to the search service. Please make sure the backend server is running on port 3002.';
        } else if (err.message.includes('timed out')) {
          errorMessage = err.message;
        } else {
          errorMessage = err.message;
        }
      }
      
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
              aiMarketingNews={aiMarketingNews}
              aiCompetitiveIntelligence={aiCompetitiveIntelligence}
              aiContentStrategy={aiContentStrategy}
              aiBrandStrategy={aiBrandStrategy}
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