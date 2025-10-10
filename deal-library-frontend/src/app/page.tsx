'use client';

import { useState, useEffect } from 'react';
import { Deal, DealFilters, Persona, AudienceInsights, GeoCard } from '@/types/deal';
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
  
  // Category match
  if ((deal.category || '').toLowerCase().includes(queryLower)) {
    score += 25;
    reasons.push('Category match');
  }
  
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

export default function HomePage({ 
  sidebarOpen = true
}: Partial<HomePageProps>) {
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
        const response = await fetch('http://localhost:3002/api/deals');
        if (!response.ok) {
          throw new Error(`Failed to load deals: ${response.statusText}`);
        }
        const dealsData = await response.json();
        setDeals(dealsData.deals || []);
        setFilteredDeals((dealsData.deals || []).slice(0, 6)); // Show first 6 deals initially
      } catch (err) {
        console.error('Error loading deals:', err);
        setError('Failed to load deals. Please try again later.');
        // Fallback to mock data
        setDeals(mockDeals);
        setFilteredDeals(mockDeals.slice(0, 6));
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

      // Determine search type based on keywords
      const queryLower = query.toLowerCase();
      
      // Explicit deal requests
      const explicitDealKeywords = [
        'request deals', 'find deals', 'show me deals', 'get deals', 'deal request',
        'provide relevant deals', 'reach new parents', 'reach parents', 'target new parents', 'target parents',
        'media director', 'media strategy', 'building a', 'pet related', 'pet strategy'
      ];
      
      const isExplicitDealRequest = explicitDealKeywords.some(keyword => 
        queryLower.includes(keyword)
      );

      if (isExplicitDealRequest || cardTypes?.includes('deals')) {
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
        const relevantDeals = getRelevantDeals(searchResults.deals || [], query, 6);
        setFilteredDeals(relevantDeals);
        setAiResponse(searchResults.aiResponse || `Found ${relevantDeals.length} relevant deals for your query.`);
        return;
      }

      // Persona search - use unified search for dynamic persona generation
      const personaKeywords = ['persona', 'personas', 'buyer', 'buyers', 'customer profile'];
      const isPersonaSearch = personaKeywords.some(keyword => queryLower.includes(keyword)) || 
                             cardTypes?.includes('personas');

      if (isPersonaSearch) {
        console.log('🎭 Persona search detected, using unified search...');
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
          }
        }
      }

      // Audience insights search
      const audienceInsightsKeywords = ['audience insights', 'audience analysis', 'demographics', 'psychographics', 'behavioral'];
      const isAudienceInsightsSearch = audienceInsightsKeywords.some(keyword => queryLower.includes(keyword)) || 
                                      cardTypes?.includes('audience-insights');

      if (isAudienceInsightsSearch) {
        const response = await fetch('http://localhost:3002/api/audience-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, conversationHistory: conversationHistory || [] }),
        });

        if (response.ok) {
          const data = await response.json();
          setAiAudienceInsights(data.audienceInsights || []);
          setAiResponse(data.aiResponse || 'Here are the audience insights for your query.');
          return;
        }
      }

      // Market sizing search
      const marketSizingKeywords = ['market sizing', 'market size', 'total addressable market', 'tam', 'market opportunity', 'market trends', 'market analysis', 'industry trends', 'market growth'];
      const isMarketSizingSearch = marketSizingKeywords.some(keyword => queryLower.includes(keyword)) || 
                                  cardTypes?.includes('market-sizing');

      if (isMarketSizingSearch) {
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
      }

      // Geographic insights search
      const geoKeywords = ['geographic', 'location', 'zip code', 'city', 'state', 'region', 'geo'];
      const isGeoSearch = geoKeywords.some(keyword => queryLower.includes(keyword)) || 
                         cardTypes?.includes('geo-cards');

      if (isGeoSearch) {
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
        }
      }

      // Default: general AI search with timeout
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
        const relevantDeals = getRelevantDeals(searchResults.deals || [], query, 6);
        setFilteredDeals(relevantDeals);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Search timed out. Please try a more specific query or try again.');
        }
        throw fetchError;
      }

    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
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