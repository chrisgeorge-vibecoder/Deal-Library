import { useState, useEffect, useCallback, useRef } from 'react';
import { Deal, Persona, AudienceInsights, GeoCard, MarketingSWOT, CompanyProfile, MarketingNews, CompetitiveIntelligence, ContentStrategy, BrandStrategy } from '@/types/deal';
import { MarketSizing } from './MarketSizingCard';
import { Search, Filter, Users, Target, Lightbulb, TrendingUp, MapPin, BarChart3, ShoppingCart, Trash2, Sparkles, Building2, Newspaper, FileText, Award } from 'lucide-react';
import PersonaDetailModal from './PersonaDetailModal';
import { AudienceInsightsDetailModal } from './AudienceInsightsDetailModal';
import { MarketSizingDetailModal } from './MarketSizingDetailModal';
import GeoDetailModal from './GeoDetailModal';
import MarketingSWOTCard from './MarketingSWOTCard';
import CompanyProfileCard from './CompanyProfileCard';
import MarketingNewsCard from './MarketingNewsCard';
import { MarketingSWOTDetailModal } from './MarketingSWOTDetailModal';
import { CompanyProfileDetailModal } from './CompanyProfileDetailModal';
import { MarketingNewsDetailModal } from './MarketingNewsDetailModal';
import { CompetitiveIntelligenceDetailModal } from './CompetitiveIntelligenceDetailModal';
import { ContentStrategyDetailModal } from './ContentStrategyDetailModal';
import { BrandStrategyDetailModal } from './BrandStrategyDetailModal';

interface AudienceExplorerProps {
  onSaveCard?: (card: { type: 'persona' | 'audience-insights' | 'market-sizing' | 'geo-cards' | 'marketing-swot' | 'company-profile' | 'marketing-news' | 'competitive-intelligence' | 'content-strategy' | 'brand-strategy', data: any }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
  onSwitchToChat?: (query: string) => void;
}

type CardType = 'all' | 'deals' | 'personas' | 'audience-insights' | 'market-sizing' | 'geo-cards' | 'marketing-swot' | 'company-profile' | 'marketing-news' | 'competitive-intelligence' | 'content-strategy' | 'brand-strategy';

interface SearchResult {
  type: CardType;
  data: any;
  relevanceScore?: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: any;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  description: string;
  cardType: CardType;
}

export default function AudienceExplorer({ 
  onSaveCard,
  onUnsaveCard,
  isSaved,
  onSwitchToChat
}: AudienceExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [audienceFilter, setAudienceFilter] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMediaFormats, setSelectedMediaFormats] = useState<string[]>([]);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  
  // Ref to track previous subcategory to avoid duplicate logging
  const prevSubcategoryRef = useRef<string | null>(null);
  
  // Media format options for deal filtering
  const mediaFormats = [
    { id: 'multi-format', name: 'Multi-format', description: 'Cross-platform opportunities' },
    { id: 'ctv', name: 'CTV', description: 'Connected TV' },
    { id: 'mobile-app', name: 'Mobile App', description: 'Mobile applications' },
    { id: 'web', name: 'Web', description: 'Web-based advertising' },
    { id: 'display', name: 'Display', description: 'Display banners' },
    { id: 'video', name: 'Video', description: 'Video advertising' },
    { id: 'native', name: 'Native', description: 'Native content' }
  ];
  
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedAudienceInsights, setSelectedAudienceInsights] = useState<AudienceInsights | null>(null);
  const [selectedMarketSizing, setSelectedMarketSizing] = useState<MarketSizing | null>(null);
  const [selectedGeoCard, setSelectedGeoCard] = useState<GeoCard | null>(null);
  const [selectedMarketingSWOT, setSelectedMarketingSWOT] = useState<MarketingSWOT | null>(null);
  const [selectedCompanyProfile, setSelectedCompanyProfile] = useState<CompanyProfile | null>(null);
  const [selectedMarketingNews, setSelectedMarketingNews] = useState<MarketingNews | null>(null);
  const [selectedCompetitiveIntel, setSelectedCompetitiveIntel] = useState<CompetitiveIntelligence | null>(null);
  const [selectedContentStrategy, setSelectedContentStrategy] = useState<ContentStrategy | null>(null);
  const [selectedBrandStrategy, setSelectedBrandStrategy] = useState<BrandStrategy | null>(null);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isAudienceInsightsModalOpen, setIsAudienceInsightsModalOpen] = useState(false);
  const [isMarketSizingModalOpen, setIsMarketSizingModalOpen] = useState(false);
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);
  const [isMarketingSWOTModalOpen, setIsMarketingSWOTModalOpen] = useState(false);
  const [isCompanyProfileModalOpen, setIsCompanyProfileModalOpen] = useState(false);
  const [isMarketingNewsModalOpen, setIsMarketingNewsModalOpen] = useState(false);
  const [isCompetitiveIntelModalOpen, setIsCompetitiveIntelModalOpen] = useState(false);
  const [isContentStrategyModalOpen, setIsContentStrategyModalOpen] = useState(false);
  const [isBrandStrategyModalOpen, setIsBrandStrategyModalOpen] = useState(false);

  const categories: Category[] = [
    {
      id: 'audiences',
      name: 'Audience Insights',
      description: 'Explore audience data and behavioral insights',
      icon: Lightbulb,
      subcategories: [
        { id: 'audience-insights', name: 'Audience Insights', description: 'Generate AI-powered audience behavior insights and analytics', cardType: 'audience-insights' }
      ]
    },
    {
      id: 'personas',
      name: 'Audience Personas',
      description: 'Explore detailed audience personas and their characteristics',
      icon: Users,
      subcategories: [
        { id: 'all-personas', name: 'All Personas', description: 'View all available personas', cardType: 'personas' },
        { id: 'family-personas', name: 'Family & Home', description: 'Family-focused audience personas', cardType: 'personas' },
        { id: 'fashion-personas', name: 'Fashion & Style', description: 'Style-conscious and fashion-focused personas', cardType: 'personas' },
        { id: 'food-personas', name: 'Food & Beverage', description: 'Culinary and beverage-focused personas', cardType: 'personas' },
        { id: 'entertainment-personas', name: 'Entertainment & Gaming', description: 'Entertainment and gaming-focused personas', cardType: 'personas' },
        { id: 'sports-personas', name: 'Sports & Athletics', description: 'Athletic and sports-focused personas', cardType: 'personas' },
        { id: 'pet-personas', name: 'Pet Care', description: 'Pet owners and animal care personas', cardType: 'personas' },
        { id: 'professional-personas', name: 'Professional', description: 'Career and business-focused personas', cardType: 'personas' },
        { id: 'lifestyle-personas', name: 'Lifestyle & Wellness', description: 'Health, fitness, and lifestyle personas', cardType: 'personas' },
        { id: 'tech-personas', name: 'Technology & Digital', description: 'Tech-savvy and digital-first personas', cardType: 'personas' }
      ]
    },
    {
      id: 'brand-strategy',
      name: 'Brand Strategy',
      description: 'Brand positioning and messaging frameworks',
      icon: Award,
      subcategories: [
        { id: 'brand-positioning', name: 'Brand Positioning', description: 'Create brand positioning and messaging frameworks', cardType: 'brand-strategy' }
      ]
    },
    {
      id: 'company-profile',
      name: 'Company Profiles',
      description: 'Public company financial analysis and business insights',
      icon: Building2,
      subcategories: [
        { id: 'company-profile', name: 'Company Analysis', description: 'Enter a stock symbol to generate comprehensive company profile analysis', cardType: 'company-profile' }
      ]
    },
    {
      id: 'competitive-intelligence',
      name: 'Competitive Intelligence',
      description: 'Competitor analysis and positioning strategies',
      icon: Target,
      subcategories: [
        { id: 'competitive-intel', name: 'Competitive Analysis', description: 'Analyze competitors and identify differentiation opportunities', cardType: 'competitive-intelligence' }
      ]
    },
    {
      id: 'content-strategy',
      name: 'Content Strategy',
      description: 'Content planning and topic recommendations',
      icon: FileText,
      subcategories: [
        { id: 'content-planning', name: 'Content Planning', description: 'Generate content strategies and editorial calendars', cardType: 'content-strategy' }
      ]
    },
    {
      id: 'geographic',
      name: 'Geo Insights',
      description: 'Location-based audience and market data',
      icon: MapPin,
      subcategories: [
        { id: 'regional-analysis', name: 'Regional Analysis', description: 'Analyze broad regional markets (e.g., "California", "Northeast")', cardType: 'geo-cards' },
        { id: 'local-insights', name: 'Local Insights', description: 'City and local market data (e.g., "New York City", "Austin")', cardType: 'geo-cards' },
        { id: 'international', name: 'International Markets', description: 'Global market opportunities (e.g., "Europe", "Asia-Pacific")', cardType: 'geo-cards' }
      ]
    },
    {
      id: 'market-data',
      name: 'Market Intelligence',
      description: 'Market sizing and industry analysis',
      icon: BarChart3,
      subcategories: [
        { id: 'market-trends', name: 'Market Trends', description: 'Industry trend analysis and growth patterns', cardType: 'market-sizing' },
        { id: 'growth-opportunities', name: 'Growth Opportunities', description: 'Emerging markets and expansion opportunities', cardType: 'market-sizing' },
        { id: 'market-analysis', name: 'Market Analysis', description: 'General market sizing and competitive analysis', cardType: 'market-sizing' }
      ]
    },
    {
      id: 'marketing-news',
      name: 'Marketing News',
      description: 'Latest marketing and advertising industry headlines',
      icon: Newspaper,
      subcategories: [
        { id: 'latest-news', name: 'Latest News', description: 'Today\'s top marketing headlines', cardType: 'marketing-news' }
      ]
    },
    {
      id: 'marketing-swot',
      name: 'Marketing SWOT',
      description: 'Marketing SWOT analysis for companies and campaigns',
      icon: TrendingUp,
      subcategories: [
        { id: 'marketing-swot', name: 'Marketing SWOT Analysis', description: 'Enter a company name to generate comprehensive marketing SWOT analysis', cardType: 'marketing-swot' }
      ]
    }
  ];

  // Helper function to generate appropriate query based on subcategory
  const getQueryForSubcategory = (subcategory: Subcategory, userInput: string): string => {
    if (userInput.trim()) {
      // When user provides input, enhance it with subcategory context
      const userQuery = userInput.trim();
      switch (subcategory.cardType) {
        case 'market-sizing':
          switch (subcategory.id) {
            case 'growth-opportunities':
              return `${userQuery} market growth opportunities and expansion analysis`;
            case 'market-trends':
              return `${userQuery} industry trends and market analysis`;
            case 'market-analysis':
              return `${userQuery} market sizing and competitive landscape`;
            default:
              return userQuery;
          }
        case 'geo-cards':
          switch (subcategory.id) {
            case 'regional-analysis':
              return `${userQuery} regional market analysis and demographics`;
            case 'local-insights':
              return `${userQuery} local market data and demographics`;
            case 'international':
              return `${userQuery} international market opportunities`;
            default:
              return userQuery;
          }
        default:
          return userQuery;
      }
    }
    
    // Generate context-aware queries based on subcategory when no user input
    switch (subcategory.cardType) {
      case 'geo-cards':
        switch (subcategory.id) {
          case 'regional-analysis':
            return 'United States regional market analysis and demographic insights';
          case 'local-insights':
            return 'major US cities local market data and demographics';
          case 'international':
            return 'global international market opportunities and demographics';
          default:
            return subcategory.name;
        }
      case 'market-sizing':
        switch (subcategory.id) {
          case 'market-trends':
            return 'technology industry trends and growth analysis';
          case 'growth-opportunities':
            return 'emerging technology market opportunities and expansion analysis';
          case 'market-analysis':
            return 'technology market sizing and competitive analysis';
          default:
            return subcategory.name;
        }
      default:
        return subcategory.name;
    }
  };

  const loadDataBySubcategory = useCallback(async () => {
    if (!selectedSubcategory) return;
    
    setLoading(true);
    setError(null);
    let errorHandledByCase = false; // Flag to track if error was handled within a case
    try {
      // Find the selected subcategory
      const subcategory = categories
        .flatMap(cat => cat.subcategories || [])
        .find(sub => sub.id === selectedSubcategory);
      
      if (!subcategory) return;
      
      const results: SearchResult[] = [];
      
      // Load data based on card type
      switch (subcategory.cardType) {
        case 'deals':
          // Load all deals if not already loaded
          let dealsToFilter = allDeals;
          if (allDeals.length === 0) {
            const dealsResponse = await fetch('http://localhost:3002/api/deals');
            if (dealsResponse.ok) {
              const dealsData = await dealsResponse.json();
              if (dealsData.deals && dealsData.deals.length > 0) {
                dealsToFilter = dealsData.deals;
                setAllDeals(dealsData.deals);
              }
            }
          }
          
          // Apply filtering to loaded deals
          const filteredDeals = filterDeals(dealsToFilter, subcategory);
          results.push(...filteredDeals.map((deal: Deal) => ({
            type: 'deals' as CardType,
            data: deal,
            relevanceScore: 1
          })));
          break;
          
        case 'personas':
          try {
            const personasResponse = await fetch('http://localhost:3002/api/personas');
            if (personasResponse.ok) {
              const personasData = await personasResponse.json();
              console.log(`🎭 Loaded ${personasData.length} personas from API`);
              
              // Filter personas based on subcategory
              let filteredPersonas = personasData;
              if (subcategory.id !== 'all-personas') {
                filteredPersonas = personasData.filter((persona: Persona) => {
                  const category = persona.category?.toLowerCase() || '';
                  const name = persona.name?.toLowerCase() || '';
                  const coreInsight = persona.coreInsight?.toLowerCase() || '';
                  
                  switch (subcategory.id) {
                    case 'family-personas':
                      return category.includes('family') || category.includes('home') || 
                             name.includes('family') || name.includes('parent') || name.includes('home') ||
                             coreInsight.includes('family') || coreInsight.includes('home');
                    case 'fashion-personas':
                      return category.includes('fashion') || category.includes('style') || category.includes('beauty') ||
                             name.includes('fashion') || name.includes('style') || name.includes('beauty') || name.includes('dress') ||
                             coreInsight.includes('fashion') || coreInsight.includes('style') || coreInsight.includes('beauty');
                    case 'food-personas':
                      return category.includes('food') || category.includes('beverage') || category.includes('culinary') ||
                             name.includes('food') || name.includes('beverage') || name.includes('culinary') || name.includes('flavor') ||
                             coreInsight.includes('food') || coreInsight.includes('beverage') || coreInsight.includes('culinary');
                    case 'entertainment-personas':
                      return category.includes('entertainment') || category.includes('gaming') || category.includes('media') ||
                             name.includes('entertainment') || name.includes('gaming') || name.includes('media') || name.includes('console') ||
                             coreInsight.includes('entertainment') || coreInsight.includes('gaming') || coreInsight.includes('media');
                    case 'sports-personas':
                      return category.includes('sports') || category.includes('fitness') || category.includes('athletics') ||
                             name.includes('sports') || name.includes('fitness') || name.includes('athletics') || name.includes('performance') ||
                             coreInsight.includes('sports') || coreInsight.includes('fitness') || coreInsight.includes('athletics');
                    case 'pet-personas':
                      return category.includes('pet') || category.includes('animal') ||
                             name.includes('pet') || name.includes('animal') || name.includes('cat') || name.includes('dog') ||
                             coreInsight.includes('pet') || coreInsight.includes('animal') || coreInsight.includes('companion');
                    case 'professional-personas':
                      return category.includes('professional') || category.includes('business') ||
                             name.includes('professional') || name.includes('executive') || name.includes('business') ||
                             coreInsight.includes('professional') || coreInsight.includes('business') || coreInsight.includes('career');
                    case 'lifestyle-personas':
                      return category.includes('wellness') || category.includes('lifestyle') || category.includes('fitness') ||
                             name.includes('wellness') || name.includes('fitness') || name.includes('health') || name.includes('lifestyle') ||
                             coreInsight.includes('wellness') || coreInsight.includes('fitness') || coreInsight.includes('health');
                    case 'tech-personas':
                      return category.includes('tech') || category.includes('digital') || category.includes('technology') ||
                             name.includes('tech') || name.includes('digital') || name.includes('technology') ||
                             coreInsight.includes('tech') || coreInsight.includes('digital') || coreInsight.includes('technology');
                    default:
                      return true;
                  }
                });
                console.log(`🎭 Filtered to ${filteredPersonas.length} personas for subcategory: ${subcategory.id}`);
              }
              
              // Further filter by audience filter if provided
              if (audienceFilter.trim()) {
                const filterLower = audienceFilter.toLowerCase();
                filteredPersonas = filteredPersonas.filter((persona: Persona) => 
                  persona.name.toLowerCase().includes(filterLower) ||
                  persona.coreInsight?.toLowerCase().includes(filterLower) ||
                  persona.category?.toLowerCase().includes(filterLower)
                );
                console.log(`🎭 Filtered to ${filteredPersonas.length} personas after audience filter`);
              }
              
              filteredPersonas.forEach((persona: Persona) => {
                results.push({ type: 'personas', data: persona });
              });
            } else {
              console.error(`❌ Failed to load personas: ${personasResponse.status} ${personasResponse.statusText}`);
            }
          } catch (error) {
            console.error('❌ Error loading personas:', error);
          }
          break;
          
        case 'audience-insights':
          try {
            // Create an AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            const query = getQueryForSubcategory(subcategory, audienceFilter);
            const insightsResponse = await fetch('http://localhost:3002/api/audience-insights', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query }),
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            if (insightsResponse.ok) {
              const insightsData = await insightsResponse.json();
              console.log(`🎯 Loaded audience insights data:`, insightsData);
              if (insightsData.audienceInsights && insightsData.audienceInsights.length > 0) {
                insightsData.audienceInsights.forEach((insight: AudienceInsights) => {
                  results.push({ type: 'audience-insights', data: insight });
                });
                console.log(`✅ Added ${insightsData.audienceInsights.length} audience insights`);
              } else {
                console.log('⚠️ No audience insights found in response');
              }
            } else {
              console.error(`❌ Failed to fetch audience insights: ${insightsResponse.status} ${insightsResponse.statusText}`);
              try {
                const errorData = await insightsResponse.json();
                console.error('Error details:', errorData);
                // Show specific error message to user
                if (insightsResponse.status === 503) {
                  setError('AI service is temporarily unavailable. Please check if Gemini API is configured correctly.');
                } else {
                  setError(`Failed to load audience insights: ${errorData.message || 'Please try again.'}`);
                }
              } catch (e) {
                console.error('Could not parse error response');
                setError('Failed to load audience insights. Please try again.');
              }
            }
          } catch (error) {
            console.error('❌ Error loading audience insights:', error);
            if (error instanceof Error) {
              if (error.name === 'AbortError') {
                setError('Request timed out. The AI service may be slow to respond. Please try again.');
              } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
                setError('Backend server is not available. Please ensure the backend is running on port 3002.');
              } else {
                setError('Failed to connect to AI service. Please check your connection and try again.');
              }
            } else {
              setError('Failed to connect to AI service. Please check your connection and try again.');
            }
          }
          break;
          
        case 'market-sizing':
          try {
            // Create an AbortController for timeout - market sizing can take longer
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for market sizing
            
            const query = getQueryForSubcategory(subcategory, audienceFilter);
            console.log(`📊 Market sizing query: "${query}"`);
            
            const sizingResponse = await fetch('http://localhost:3002/api/market-sizing', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query }),
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            if (sizingResponse.ok) {
              const sizingData = await sizingResponse.json();
              console.log(`📊 Loaded market sizing data:`, sizingData);
              if (sizingData.marketSizing && sizingData.marketSizing.length > 0) {
                sizingData.marketSizing.forEach((sizing: MarketSizing) => {
                  results.push({ type: 'market-sizing', data: sizing });
                });
                console.log(`✅ Added ${sizingData.marketSizing.length} market sizing cards`);
              } else {
                console.log('⚠️ No market sizing data found in response');
              }
            } else {
              console.error(`❌ Failed to fetch market sizing: ${sizingResponse.status} ${sizingResponse.statusText}`);
              try {
                const errorData = await sizingResponse.json();
                console.error('Error details:', errorData);
                // Show specific error message to user
                if (sizingResponse.status === 503) {
                  setError('AI service is temporarily unavailable. Please check if Gemini API is configured correctly.');
                } else {
                  setError(`Failed to load market sizing: ${errorData.message || 'Please try again.'}`);
                }
              } catch (e) {
                console.error('Could not parse error response');
                setError('Failed to load market sizing. Please try again.');
              }
            }
          } catch (error) {
            console.error('❌ Error loading market sizing:', error);
            if (error instanceof Error) {
              if (error.name === 'AbortError') {
                setError('Request timed out after 45 seconds. Market sizing analysis can be complex - please try again with a more specific query or try later.');
              } else if (error.message.includes('Failed to fetch')) {
                setError('Cannot connect to the backend server. Please make sure the server is running on port 3002.');
              } else {
                setError('Failed to connect to AI service. Please check your connection and try again.');
              }
            } else {
              setError('Failed to connect to AI service. Please check your connection and try again.');
            }
          }
          break;
          
        case 'geo-cards':
          try {
            // Generate AI-powered geographic insights
            const query = getQueryForSubcategory(subcategory, audienceFilter);
            const geoResponse = await fetch('http://localhost:3002/api/geographic-insights', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query }),
            });
            
            if (geoResponse.ok) {
              const geoData = await geoResponse.json();
              console.log(`🗺️ Loaded geographic insights data:`, geoData);
              if (geoData.geoCards && geoData.geoCards.length > 0) {
                geoData.geoCards.forEach((geo: GeoCard) => {
                  results.push({ type: 'geo-cards', data: geo });
                });
                console.log(`✅ Added ${geoData.geoCards.length} geographic insight cards`);
              } else {
                console.log('⚠️ No geographic cards found in response');
              }
            } else {
              console.error(`❌ Failed to fetch geographic insights: ${geoResponse.status} ${geoResponse.statusText}`);
              try {
                const errorData = await geoResponse.json();
                console.error('Error details:', errorData);
                setError(`Failed to load geographic insights: ${errorData.message || 'Please try again.'}`);
              } catch (e) {
                console.error('Could not parse error response');
                setError('Failed to load geographic insights. Please try again.');
              }
            }
          } catch (error) {
            console.error('❌ Error loading geographic insights:', error);
            setError('Failed to load geographic insights. Please try again.');
          }
          break;
          
        case 'marketing-swot':
          // For Marketing SWOT, we need a company name - use the search filter or show helpful message
          if (!audienceFilter.trim()) {
            setError('Please enter a company name in the search box to generate a Marketing SWOT analysis.');
            setLoading(false);
            return;
          }
          try {
            const companyName = audienceFilter.trim();
            const swotResponse = await fetch('http://localhost:3002/api/marketing-swot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companyName }),
            });
            
            if (swotResponse.ok) {
              const swotData = await swotResponse.json();
              console.log(`🎯 Loaded Marketing SWOT data for ${companyName}:`, swotData);
              if (swotData.success && swotData.data) {
                // The API returns a single SWOT result, not an array
                const swotResult: MarketingSWOT = {
                  id: `swot-${Date.now()}`,
                  companyName: swotData.data.companyName,
                  swot: swotData.data.swot,
                  summary: swotData.data.summary,
                  recommendedActions: swotData.data.recommendedActions,
                  sampleData: false
                };
                results.push({ type: 'marketing-swot', data: swotResult });
                console.log(`✅ Added Marketing SWOT card for ${companyName}`);
              } else {
                console.log('⚠️ Marketing SWOT API returned unsuccessful response');
              }
            } else {
              console.error(`❌ Failed to fetch marketing SWOT: ${swotResponse.status} ${swotResponse.statusText}`);
              try {
                const errorData = await swotResponse.json();
                console.error('Error details:', errorData);
                setError(`Failed to load Marketing SWOT analysis: ${errorData.message || 'Please try again.'}`);
              } catch (e) {
                console.error('Could not parse error response');
                setError('Failed to load Marketing SWOT analysis. Please try again.');
              }
            }
          } catch (error) {
            console.error('❌ Error loading Marketing SWOT:', error);
            setError('Failed to load Marketing SWOT analysis. Please try again.');
          }
          break;
          
        case 'company-profile':
          // For Company Profile, we need a stock symbol - use the search filter or show helpful message
          if (!audienceFilter.trim()) {
            setError('Please enter a stock symbol in the search box to generate a Company Profile analysis.');
            setLoading(false);
            return;
          }
          try {
            const stockSymbol = audienceFilter.trim();
            const profileResponse = await fetch('http://localhost:3002/api/company-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stockSymbol }),
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              console.log(`📊 Loaded Company Profile data for ${stockSymbol}:`, profileData);
              if (profileData.success && profileData.data) {
                // The API returns a single company profile result, not an array
                const profileResult: CompanyProfile = {
                  id: `profile-${Date.now()}`,
                  stockSymbol: profileData.data.stockSymbol || stockSymbol,
                  companyInfo: profileData.data.companyInfo,
                  recentPerformance: profileData.data.recentPerformance,
                  competitiveAnalysis: profileData.data.competitiveAnalysis,
                  growthOpportunities: profileData.data.growthOpportunities,
                  investmentOutlook: profileData.data.investmentOutlook,
                  sampleData: false
                };
                results.push({ type: 'company-profile', data: profileResult });
                console.log(`✅ Added Company Profile card for ${stockSymbol}`);
              } else {
                console.log('⚠️ Company Profile API returned unsuccessful response');
              }
            } else {
              console.error(`❌ Failed to fetch company profile: ${profileResponse.status} ${profileResponse.statusText}`);
              try {
                const errorData = await profileResponse.json();
                console.error('Error details:', errorData);
                setError(`Failed to load Company Profile: ${errorData.message || 'Please try again.'}`);
              } catch (e) {
                console.error('Could not parse error response');
                setError('Failed to load Company Profile. Please try again.');
              }
            }
          } catch (error) {
            console.error('❌ Error loading Company Profile:', error);
            setError('Failed to load Company Profile. Please try again.');
          }
          break;
          
        case 'marketing-news':
          try {
            console.log('📰 Attempting to fetch marketing news...');
            const newsResponse = await fetch('http://localhost:3002/api/marketing-news', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({}),
            });
            
            console.log(`📰 Marketing news response status: ${newsResponse.status}`);
            
            let newsData;
            try {
              newsData = await newsResponse.json();
              console.log(`📰 Loaded marketing news data:`, newsData);
            } catch (parseError) {
              console.error('❌ Failed to parse marketing news response:', parseError);
              // Provide fallback marketing news if backend is up but response is malformed
              newsData = {
                marketingNews: [
                  {
                    id: `parse-error-${Date.now()}`,
                    headline: "Marketing Industry Update",
                    source: "System Notice",
                    synopsis: "Marketing news service is temporarily experiencing issues. Please try again later for the latest headlines.",
                    url: "#",
                    publishDate: new Date().toISOString().split('T')[0],
                    relevanceScore: 0.5
                  }
                ],
                aiResponse: "Marketing news service is temporarily experiencing issues."
              };
            }
            
            if (newsData && newsData.marketingNews && newsData.marketingNews.length > 0) {
              newsData.marketingNews.forEach((news: MarketingNews) => {
                results.push({ type: 'marketing-news', data: news });
              });
              console.log(`✅ Added ${newsData.marketingNews.length} marketing news cards`);
              // Clear any previous errors since we have data
              setError(null);
              errorHandledByCase = true;
            } else {
              console.log('⚠️ No marketing news found in response');
              setError('No marketing news available at this time. Please try again later.');
              errorHandledByCase = true;
            }
            
          } catch (error) {
            console.error('❌ Network or server error loading marketing news:', error);
            
            // Check if it's a network error (backend not running)
            if (error instanceof TypeError && error.message.includes('fetch')) {
              console.log('⚠️ Backend appears to be offline, providing static fallback');
              // Provide static fallback when backend is completely unavailable
              const fallbackNews: MarketingNews[] = [
                {
                  id: `offline-1-${Date.now()}`,
                  headline: "Marketing Technology Trends Continue to Evolve",
                  source: "Industry Analysis",
                  synopsis: "Latest developments in marketing technology and AI-driven solutions are transforming how brands reach consumers in 2024.",
                  url: "#",
                  publishDate: new Date().toISOString().split('T')[0],
                  relevanceScore: 0.9
                },
                {
                  id: `offline-2-${Date.now()}`,
                  headline: "Privacy Regulations Shape Digital Advertising Landscape",
                  source: "Marketing Weekly",
                  synopsis: "New privacy regulations continue to impact digital advertising strategies and measurement capabilities across platforms.",
                  url: "#",
                  publishDate: new Date().toISOString().split('T')[0],
                  relevanceScore: 0.8
                }
              ];
              
              fallbackNews.forEach((news: MarketingNews) => {
                results.push({ type: 'marketing-news', data: news });
              });
              
              console.log(`✅ Added ${fallbackNews.length} offline fallback marketing news cards`);
              setError(null); // Clear error since we have fallback data
              errorHandledByCase = true;
            } else {
              setError('Marketing news service is temporarily unavailable. Please try again later.');
              errorHandledByCase = true;
            }
          }
          break;

        case 'competitive-intelligence':
          if (!audienceFilter.trim()) {
            setError('Please enter a company name or industry for competitive intelligence analysis.');
            setLoading(false);
            return;
          }
          try {
            const query = audienceFilter.trim();
            const response = await fetch('http://localhost:3002/api/competitive-intelligence', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query }),
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                results.push({ type: 'competitive-intelligence', data: data.data });
                console.log(`✅ Added competitive intelligence for: ${query}`);
              } else {
                setError('Failed to generate competitive intelligence. Please try again.');
              }
            } else {
              const errorData = await response.json();
              setError(`Failed to load competitive intelligence: ${errorData.error || 'Please try again.'}`);
            }
          } catch (error) {
            console.error('Error loading competitive intelligence:', error);
            setError('Failed to load competitive intelligence. Please try again.');
          }
          break;

        case 'content-strategy':
          if (!audienceFilter.trim()) {
            setError('Please enter an industry or topic for content strategy recommendations.');
            setLoading(false);
            return;
          }
          try {
            const query = audienceFilter.trim();
            const response = await fetch('http://localhost:3002/api/content-strategy', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query }),
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                results.push({ type: 'content-strategy', data: data.data });
                console.log(`✅ Added content strategy for: ${query}`);
              } else {
                setError('Failed to generate content strategy. Please try again.');
              }
            } else {
              const errorData = await response.json();
              setError(`Failed to load content strategy: ${errorData.error || 'Please try again.'}`);
            }
          } catch (error) {
            console.error('Error loading content strategy:', error);
            setError('Failed to load content strategy. Please try again.');
          }
          break;

        case 'brand-strategy':
          if (!audienceFilter.trim()) {
            setError('Please enter a brand name or category for brand strategy analysis.');
            setLoading(false);
            return;
          }
          try {
            const query = audienceFilter.trim();
            const response = await fetch('http://localhost:3002/api/brand-strategy', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query }),
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                results.push({ type: 'brand-strategy', data: data.data });
                console.log(`✅ Added brand strategy for: ${query}`);
              } else {
                setError('Failed to generate brand strategy. Please try again.');
              }
            } else {
              const errorData = await response.json();
              setError(`Failed to load brand strategy: ${errorData.error || 'Please try again.'}`);
            }
          } catch (error) {
            console.error('Error loading brand strategy:', error);
            setError('Failed to load brand strategy. Please try again.');
          }
          break;
      }
      
      // Only log in development mode and when there are results to reduce console spam
      if (process.env.NODE_ENV === 'development' && results.length > 0) {
        console.log(`✅ Loaded ${results.length} results for ${subcategory.name}:`, results);
      }
      setSearchResults(results);
      
    } catch (error) {
      console.error('Error loading data by subcategory:', error);
      // Only set error if it wasn't already handled by the specific case
      if (!errorHandledByCase) {
        setError('Failed to load data. Please try again.');
        setSearchResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedSubcategory, allDeals, selectedMediaFormats, audienceFilter]);

  // Auto-load data when subcategory changes - only for static data categories
  useEffect(() => {
    // Only log and act if the subcategory actually changed
    if (prevSubcategoryRef.current !== selectedSubcategory) {
      prevSubcategoryRef.current = selectedSubcategory;
      
      if (selectedSubcategory) {
        const subcategory = categories
          .flatMap(cat => cat.subcategories || [])
          .find(sub => sub.id === selectedSubcategory);
        
        if (subcategory) {
          // Only auto-load data for static categories that don't require API calls or user input
          if (subcategory.cardType === 'personas' || subcategory.cardType === 'deals' || subcategory.cardType === 'marketing-news') {
            loadDataBySubcategory();
          } else {
            // Clear results for all AI-powered categories - require explicit user search
            setSearchResults([]);
            setError(null); // Clear any previous errors
          }
        }
      } else {
        setSearchResults([]);
      }
    }
    // Remove loadDataBySubcategory from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubcategory]);

  // Reload data when media formats change for deals
  useEffect(() => {
    if (selectedCategory === 'deals' && selectedSubcategory) {
      loadDataBySubcategory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMediaFormats, selectedCategory, selectedSubcategory]);

  // Reload data when audience filter changes for deals
  useEffect(() => {
    if (selectedCategory === 'deals' && selectedSubcategory) {
      loadDataBySubcategory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceFilter, selectedCategory, selectedSubcategory]);

  const filterDeals = (deals: Deal[], subcategory: any): Deal[] => {
    if (!subcategory || deals.length === 0) return deals;
    
    let filteredDeals = deals;
    
    // Filter by content category subcategory
    if (subcategory.id !== 'all-deals') {
      filteredDeals = deals.filter((deal: Deal) => {
        const dealName = deal.dealName?.toLowerCase() || '';
        const description = deal.description?.toLowerCase() || '';
        const targeting = deal.targeting?.toLowerCase() || '';
        
        switch (subcategory.id) {
          case 'family-deals':
            return dealName.includes('family') || dealName.includes('parent') || dealName.includes('baby') || 
                   dealName.includes('child') || dealName.includes('home') ||
                   description.includes('family') || description.includes('parent') || 
                   description.includes('baby') || description.includes('child') ||
                   targeting.includes('family') || targeting.includes('parent');
          case 'fashion-deals':
            return dealName.includes('fashion') || dealName.includes('style') || dealName.includes('beauty') ||
                   dealName.includes('clothing') || dealName.includes('apparel') ||
                   description.includes('fashion') || description.includes('style') ||
                   description.includes('beauty') || description.includes('clothing') ||
                   targeting.includes('fashion') || targeting.includes('style');
          case 'food-deals':
            return dealName.includes('food') || dealName.includes('beverage') || dealName.includes('culinary') ||
                   dealName.includes('restaurant') || dealName.includes('dining') ||
                   description.includes('food') || description.includes('beverage') ||
                   description.includes('culinary') || description.includes('restaurant') ||
                   targeting.includes('food') || targeting.includes('beverage');
          case 'entertainment-deals':
            return dealName.includes('entertainment') || dealName.includes('gaming') || dealName.includes('movie') ||
                   dealName.includes('music') || dealName.includes('streaming') ||
                   description.includes('entertainment') || description.includes('gaming') ||
                   description.includes('movie') || description.includes('music') ||
                   targeting.includes('entertainment') || targeting.includes('gaming');
          case 'sports-deals':
            return dealName.includes('sports') || dealName.includes('fitness') || dealName.includes('athletic') ||
                   dealName.includes('gym') || dealName.includes('workout') ||
                   description.includes('sports') || description.includes('fitness') ||
                   description.includes('athletic') || description.includes('gym') ||
                   targeting.includes('sports') || targeting.includes('fitness');
          case 'pet-deals':
            return dealName.includes('pet') || dealName.includes('animal') || dealName.includes('dog') ||
                   dealName.includes('cat') || dealName.includes('veterinary') ||
                   description.includes('pet') || description.includes('animal') ||
                   description.includes('dog') || description.includes('cat') ||
                   targeting.includes('pet') || targeting.includes('animal');
          case 'professional-deals':
            return dealName.includes('business') || dealName.includes('finance') || dealName.includes('professional') ||
                   dealName.includes('office') || dealName.includes('career') ||
                   description.includes('business') || description.includes('finance') ||
                   description.includes('professional') || description.includes('office') ||
                   targeting.includes('business') || targeting.includes('finance');
          case 'lifestyle-deals':
            return dealName.includes('wellness') || dealName.includes('health') || dealName.includes('lifestyle') ||
                   dealName.includes('fitness') || dealName.includes('beauty') ||
                   description.includes('wellness') || description.includes('health') ||
                   description.includes('lifestyle') || description.includes('fitness') ||
                   targeting.includes('wellness') || targeting.includes('health');
          case 'tech-deals':
            return dealName.includes('tech') || dealName.includes('digital') || dealName.includes('technology') ||
                   dealName.includes('software') || dealName.includes('app') ||
                   description.includes('tech') || description.includes('digital') ||
                   description.includes('technology') || description.includes('software') ||
                   targeting.includes('tech') || targeting.includes('digital');
          case 'automotive-deals':
            return dealName.includes('auto') || dealName.includes('car') || dealName.includes('automotive') ||
                   dealName.includes('vehicle') || dealName.includes('truck') ||
                   description.includes('auto') || description.includes('car') ||
                   description.includes('automotive') || description.includes('vehicle') ||
                   targeting.includes('auto') || targeting.includes('car');
          case 'home-deals':
            return dealName.includes('home') || dealName.includes('garden') || dealName.includes('furniture') ||
                   dealName.includes('decor') || dealName.includes('improvement') ||
                   description.includes('home') || description.includes('garden') ||
                   description.includes('furniture') || description.includes('decor') ||
                   targeting.includes('home') || targeting.includes('garden');
          default:
            return true;
        }
      });
    }
    
    // Apply media format filters if any are selected
    if (selectedMediaFormats.length > 0) {
      filteredDeals = filteredDeals.filter((deal: Deal) => {
        const mediaType = deal.mediaType?.toLowerCase() || '';
        const environment = deal.environment?.toLowerCase() || '';
        const dealName = deal.dealName?.toLowerCase() || '';
        
        return selectedMediaFormats.some(format => {
          switch (format) {
            case 'multi-format':
              return dealName.includes('multi') || dealName.includes('cross-platform') ||
                     mediaType.includes('multi') || mediaType.includes('cross-platform');
            case 'ctv':
              return dealName.includes('ctv') || dealName.includes('(ctv)') ||
                     mediaType.includes('ctv') || mediaType.includes('connected tv') || 
                     environment.includes('ctv') || environment.includes('tv');
            case 'mobile-app':
              return dealName.includes('mobile app') || dealName.includes('(mobile app') ||
                     mediaType.includes('mobile') || environment.includes('mobile') ||
                     environment.includes('phone/tablet') || environment.includes('app');
            case 'web':
              return dealName.includes('web') || dealName.includes('(web)') ||
                     mediaType.includes('web') || environment.includes('web') ||
                     mediaType.includes('desktop') || environment.includes('desktop');
            case 'display':
              return dealName.includes('display') || dealName.includes('(display') ||
                     mediaType.includes('display') || mediaType.includes('banner');
            case 'video':
              return dealName.includes('video') || dealName.includes('(video') ||
                     mediaType.includes('video') || mediaType.includes('pre-roll') ||
                     mediaType.includes('mid-roll') || mediaType.includes('post-roll');
            case 'native':
              return dealName.includes('native') || dealName.includes('(native') ||
                     mediaType.includes('native') || mediaType.includes('sponsored');
            default:
              return false;
          }
        });
      });
    }
    
    // Apply keyword search filter if provided
    if (audienceFilter.trim()) {
      const filterLower = audienceFilter.toLowerCase().trim();
      filteredDeals = filteredDeals.filter((deal: Deal) => {
        const dealName = deal.dealName?.toLowerCase() || '';
        const description = deal.description?.toLowerCase() || '';
        const targeting = deal.targeting?.toLowerCase() || '';
        
        return dealName.includes(filterLower) || 
               description.includes(filterLower) || 
               targeting.includes(filterLower);
      });
    }
    
    return filteredDeals;
  };

  const handleCardClick = (result: SearchResult) => {
    switch (result.type) {
      case 'personas':
        setSelectedPersona(result.data);
        setIsPersonaModalOpen(true);
        break;
      case 'audience-insights':
        setSelectedAudienceInsights(result.data);
        setIsAudienceInsightsModalOpen(true);
        break;
      case 'market-sizing':
        setSelectedMarketSizing(result.data);
        setIsMarketSizingModalOpen(true);
        break;
      case 'geo-cards':
        setSelectedGeoCard(result.data);
        setIsGeoModalOpen(true);
        break;
      case 'marketing-swot':
        setSelectedMarketingSWOT(result.data);
        setIsMarketingSWOTModalOpen(true);
        break;
      case 'company-profile':
        setSelectedCompanyProfile(result.data);
        setIsCompanyProfileModalOpen(true);
        break;
      case 'marketing-news':
        setSelectedMarketingNews(result.data);
        setIsMarketingNewsModalOpen(true);
        break;
      case 'competitive-intelligence':
        setSelectedCompetitiveIntel(result.data);
        setIsCompetitiveIntelModalOpen(true);
        break;
      case 'content-strategy':
        // Validate the content strategy data before opening modal
        if (result.data && 
            result.data.industryOrTopic &&
            result.data.trendingTopics &&
            Array.isArray(result.data.trendingTopics) &&
            result.data.contentRecommendations &&
            result.data.seoOpportunities &&
            result.data.editorialCalendar &&
            Array.isArray(result.data.editorialCalendar)) {
          setSelectedContentStrategy(result.data);
          setIsContentStrategyModalOpen(true);
        } else {
          console.error('Invalid content strategy data:', result.data);
          setError('Content strategy data is incomplete or corrupted. Please try again.');
        }
        break;
      case 'brand-strategy':
        // Validate the brand strategy data before opening modal
        if (result.data && 
            result.data.brandOrCategory &&
            result.data.positioning &&
            result.data.messagingFramework &&
            result.data.brandVoice &&
            result.data.strategicRecommendations &&
            Array.isArray(result.data.strategicRecommendations)) {
          setSelectedBrandStrategy(result.data);
          setIsBrandStrategyModalOpen(true);
        } else {
          console.error('Invalid brand strategy data:', result.data);
          setError('Brand strategy data is incomplete or corrupted. Please try again.');
        }
        break;
    }
  };

  const getCardIcon = (type: CardType) => {
    const category = categories.find(cat => 
      cat.subcategories?.some(sub => sub.cardType === type)
    );
    return category ? category.icon : Search;
  };

  const getCardTypeLabel = (type: CardType) => {
    const category = categories.find(cat => 
      cat.subcategories?.some(sub => sub.cardType === type)
    );
    return category ? category.name : 'Unknown';
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setAudienceFilter('');
    setSearchResults([]);
    setError(null);
    
    // Categories that should skip subcategory selection and go straight to search
    const skipSubcategorySelection = [
      'audiences',
      'brand-strategy',
      'company-profile',
      'competitive-intelligence',
      'content-strategy',
      'marketing-news',
      'marketing-swot'
    ];
    
    // If this category should skip subcategories, auto-select the first (and only) subcategory
    if (skipSubcategorySelection.includes(categoryId)) {
      const category = categories.find(cat => cat.id === categoryId);
      if (category?.subcategories && category.subcategories.length > 0) {
        setSelectedSubcategory(category.subcategories[0].id);
      } else {
        setSelectedSubcategory(null);
      }
    } else {
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setAudienceFilter('');
    setError(null);
  };

  const handleSearch = () => {
    if (!selectedSubcategory) return;
    
    const subcategory = categories
      .flatMap(cat => cat.subcategories || [])
      .find(sub => sub.id === selectedSubcategory);
    
    if (!subcategory) return;
    
    // Manual search triggered - logging removed to reduce console spam
    
    // Always trigger data loading when search button is clicked
    loadDataBySubcategory();
  };

  const handleMediaFormatChange = (formatId: string, checked: boolean) => {
    if (checked) {
      setSelectedMediaFormats(prev => [...prev, formatId]);
    } else {
      setSelectedMediaFormats(prev => prev.filter(id => id !== formatId));
    }
  };

  const renderCard = (result: SearchResult, index: number) => {
    const Icon = getCardIcon(result.type);
    
    return (
      <div
        key={`${result.type}-${result.data.id}-${index}`}
        onClick={() => handleCardClick(result)}
        className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-sovrn-lg hover:border-brand-gold transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center gap-3 mb-4">
          {result.type === 'personas' && result.data.emoji ? (
            <span className="text-3xl">{result.data.emoji}</span>
          ) : (
            <div className="p-2 bg-brand-gold/10 rounded-lg">
              <Icon className="w-5 h-5 text-brand-gold" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-neutral-900 group-hover:text-brand-gold transition-colors">
                {result.data.dealName || result.data.name || result.data.marketName || result.data.title || result.data.companyName || result.data.stockSymbol || result.data.headline || result.data.competitorOrIndustry || result.data.industryOrTopic || result.data.brandOrCategory}
              </h3>
              <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                {getCardTypeLabel(result.type)}
              </span>
            </div>
            <p className="text-sm text-neutral-600 line-clamp-2">
              {result.data.description || result.data.coreInsight || result.data.summary || result.data.synopsis}
            </p>
          </div>
        </div>
        
        {result.type === 'deals' && (
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>{result.data.environment}</span>
            <span>{result.data.mediaType}</span>
          </div>
        )}
        
        {result.type === 'personas' && (
          <div className="flex items-center gap-2 text-xs text-brand-gold">
            <TrendingUp className="w-3 h-3" />
            <span>Strategic insights included</span>
          </div>
        )}
        
        {result.type === 'audience-insights' && (
          <div className="flex items-center gap-2 text-xs text-brand-gold">
            <Lightbulb className="w-3 h-3" />
            <span>AI-generated insights</span>
          </div>
        )}
        
        {result.type === 'market-sizing' && (
          <div className="flex items-center gap-2 text-xs text-brand-gold">
            <BarChart3 className="w-3 h-3" />
            <span>Market analysis</span>
          </div>
        )}
        
        {result.type === 'geo-cards' && (
          <div className="flex items-center gap-2 text-xs text-brand-gold">
            <MapPin className="w-3 h-3" />
            <span>Geographic insights</span>
          </div>
        )}
        
        {result.type === 'marketing-swot' && (
          <div className="flex items-center gap-2 text-xs text-brand-gold">
            <TrendingUp className="w-3 h-3" />
            <span>Marketing SWOT analysis</span>
          </div>
        )}
        
        {result.type === 'company-profile' && (
          <div className="flex items-center gap-2 text-xs text-brand-gold">
            <Building2 className="w-3 h-3" />
            <span>Company profile</span>
          </div>
        )}
        
        {result.type === 'marketing-news' && (
          <div className="flex items-center gap-2 text-xs text-brand-gold">
            <Newspaper className="w-3 h-3" />
            <span>Marketing news</span>
          </div>
        )}
      </div>
    );
  };

  // Helper function to render the no results state
  const renderNoResultsState = () => {
    if (!selectedSubcategory) {
      return (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Select a category to explore</h3>
          <p className="text-neutral-600">
            Choose a category above to browse deals, audience insights, market data, and geographic information
          </p>
        </div>
      );
    }

    // Check if this is an AI-powered category that requires user input
    const subcategory = categories
      .flatMap(cat => cat.subcategories || [])
      .find(sub => sub.id === selectedSubcategory);
    
    const isAIPowered = subcategory && [
      'audience-insights', 
      'market-sizing', 
      'geo-cards', 
      'marketing-swot', 
      'company-profile',
      'marketing-news'
    ].includes(subcategory.cardType);
    
    if (isAIPowered) {
      return (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Ready to Search</h3>
          <p className="text-neutral-600 mb-4">
            Enter your search query above and click the <strong>Search</strong> button to generate AI-powered insights.
          </p>
          {subcategory && (
            <div className="text-sm text-neutral-500">
              {subcategory.cardType === 'marketing-swot' && "Try searching for a company name (e.g., 'Apple', 'Nike')"}
              {subcategory.cardType === 'company-profile' && "Try searching for a stock symbol (e.g., 'AAPL', 'NKE')"}
              {subcategory.cardType === 'audience-insights' && "Try searching for an audience (e.g., 'sports fans', 'millennials')"}
              {subcategory.cardType === 'market-sizing' && "Try searching for a market (e.g., 'automotive', 'healthcare')"}
              {subcategory.cardType === 'geo-cards' && "Try searching for a location (e.g., 'California', 'United States')"}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No data available</h3>
          <p className="text-neutral-600">
            No results found for this subcategory. The data might be loading or unavailable.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="pt-6 pb-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-brand-orange" />
                Strategy Cards
              </h1>
              <p className="text-neutral-600 mt-2">
                Discover insights across all card types
              </p>
            </div>
            {searchResults.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                  <Search className="w-4 h-4" />
                  {searchResults.length} Results
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="space-y-6">
          {/* Main Categories */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">Choose a Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                
                return (
                  <div
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-brand-gold bg-brand-gold/5 shadow-md' 
                        : 'border-neutral-200 hover:border-brand-gold/50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-brand-gold/20' : 'bg-neutral-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isSelected ? 'text-brand-gold' : 'text-neutral-600'
                        }`} />
                      </div>
                      <h3 className={`font-semibold ${
                        isSelected ? 'text-brand-gold' : 'text-neutral-800'
                      }`}>
                        {category.name}
                      </h3>
                    </div>
                    <p className="text-sm text-neutral-600">
                      {category.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subcategories - Only show for categories that have multiple subcategories */}
          {selectedCategory && (() => {
            // Categories that should skip subcategory selection
            const skipSubcategorySelection = [
              'audiences',
              'brand-strategy',
              'company-profile',
              'competitive-intelligence',
              'content-strategy',
              'marketing-news',
              'marketing-swot'
            ];
            
            // Don't show subcategory section for these categories
            if (skipSubcategorySelection.includes(selectedCategory)) {
              return null;
            }
            
            const selectedCat = categories.find(cat => cat.id === selectedCategory);
            if (!selectedCat?.subcategories || selectedCat.subcategories.length === 0) {
              return null;
            }
            
            return (
              <div>
                <h3 className="text-md font-semibold text-neutral-800 mb-3">Select a Subcategory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedCat.subcategories.map((subcategory) => {
                    const isSelected = selectedSubcategory === subcategory.id;
                    
                    return (
                      <button
                        key={subcategory.id}
                        onClick={() => handleSubcategorySelect(subcategory.id)}
                        className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                            : 'border-neutral-200 hover:border-brand-gold/50 hover:bg-neutral-50'
                        }`}
                      >
                        <h4 className="font-medium mb-1">{subcategory.name}</h4>
                        <p className="text-sm text-neutral-600">{subcategory.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Search Section */}
          {selectedSubcategory && (
            <div>
              <h3 className="text-md font-semibold text-neutral-800 mb-3">Search Within Category</h3>
              <div className="flex gap-3 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={
                      selectedCategory === 'personas' 
                        ? "Search personas by name, category, or characteristics (e.g., 'family', 'professional')..."
                        : selectedCategory === 'deals'
                        ? "Search deals by name, description, or targeting (e.g., 'sports', 'entertainment')..."
                        : selectedCategory === 'audiences'
                        ? "Enter audience type for insights (e.g., 'pet owners', 'millennials', 'sports fans')..."
                        : selectedCategory === 'market-data'
                        ? "Enter market or industry for analysis (e.g., 'automotive', 'healthcare', 'AI technology')..."
                        : selectedCategory === 'geographic'
                        ? "Enter location for geographic analysis (e.g., 'California', 'New York City', 'Europe')..."
                        : selectedCategory === 'marketing-swot'
                        ? "Enter company name for SWOT analysis (e.g., 'Apple', 'Nike', 'Tesla')..."
                        : selectedCategory === 'company-profile'
                        ? "Enter stock symbol for company profile (e.g., 'AAPL', 'NKE', 'TSLA')..."
                        : selectedCategory === 'marketing-news'
                        ? "Get latest marketing news headlines..."
                        : selectedCategory === 'competitive-intelligence'
                        ? "Enter company name or industry for competitive analysis (e.g., 'Tesla', 'electric vehicles')..."
                        : selectedCategory === 'content-strategy'
                        ? "Enter industry or topic for content strategy (e.g., 'fintech', 'sustainability')..."
                        : selectedCategory === 'brand-strategy'
                        ? "Enter brand name or category for brand strategy (e.g., 'Apple', 'luxury brands')..."
                        : "Search within selected category..."
                    }
                    value={audienceFilter}
                    onChange={(e) => setAudienceFilter(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Search
                    </>
                  )}
                </button>
                {audienceFilter && (
                  <button
                    onClick={() => {
                      setAudienceFilter('');
                      setSearchResults([]);
                    }}
                    className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Media Format Filters - Only show for deals */}
          {selectedCategory === 'deals' && selectedSubcategory && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-neutral-700 mb-3">Filter by Media Format</h4>
              <div className="flex flex-wrap gap-3">
                {mediaFormats.map((format) => (
                  <label
                    key={format.id}
                    className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMediaFormats.includes(format.id)}
                      onChange={(e) => handleMediaFormatChange(format.id, e.target.checked)}
                      className="w-4 h-4 text-brand-gold border-neutral-300 rounded focus:ring-brand-gold focus:ring-2"
                    />
                    <span className="text-sm font-medium text-neutral-700">{format.name}</span>
                  </label>
                ))}
              </div>
              {selectedMediaFormats.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-neutral-500">
                    {selectedMediaFormats.length} format{selectedMediaFormats.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setSelectedMediaFormats([])}
                    className="text-xs text-brand-gold hover:text-brand-gold/80 underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadDataBySubcategory();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="dot-flashing mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading data...</p>
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((result, index) => renderCard(result, index))}
          </div>
        ) : renderNoResultsState()}
        </div>
      </div>

      {/* Modals */}

      {isPersonaModalOpen && selectedPersona && (
        <PersonaDetailModal
          persona={selectedPersona}
          isOpen={isPersonaModalOpen}
          onClose={() => {
            setIsPersonaModalOpen(false);
            setSelectedPersona(null);
          }}
          onViewDeals={(persona) => {
            // Close modal and switch to chat interface
            setIsPersonaModalOpen(false);
            setSelectedPersona(null);
            if (onSwitchToChat) {
              onSwitchToChat(`request deals for ${persona.name} persona`);
            }
          }}
          onSaveCard={onSaveCard}
          onUnsaveCard={onUnsaveCard}
          isSaved={isSaved}
        />
      )}

      {isAudienceInsightsModalOpen && selectedAudienceInsights && (
        <AudienceInsightsDetailModal
          insights={selectedAudienceInsights}
          isOpen={isAudienceInsightsModalOpen}
          onClose={() => {
            setIsAudienceInsightsModalOpen(false);
            setSelectedAudienceInsights(null);
          }}
          onViewDeals={(insights) => {
            // Close modal and switch to chat interface
            setIsAudienceInsightsModalOpen(false);
            setSelectedAudienceInsights(null);
            if (onSwitchToChat) {
              onSwitchToChat(`request deals for ${insights.audienceName} audience`);
            }
          }}
          onSaveCard={onSaveCard}
          onUnsaveCard={onUnsaveCard}
          isSaved={isSaved}
        />
      )}

      {isMarketSizingModalOpen && selectedMarketSizing && (
        <MarketSizingDetailModal
          sizing={selectedMarketSizing}
          isOpen={isMarketSizingModalOpen}
          onClose={() => {
            setIsMarketSizingModalOpen(false);
            setSelectedMarketSizing(null);
          }}
          onViewDeals={(sizing) => {
            // Close modal and switch to chat interface
            setIsMarketSizingModalOpen(false);
            setSelectedMarketSizing(null);
            if (onSwitchToChat) {
              onSwitchToChat(`request deals for ${sizing.marketName} market`);
            }
          }}
          onSaveCard={onSaveCard}
          onUnsaveCard={onUnsaveCard}
          isSaved={isSaved}
        />
      )}

      {isGeoModalOpen && selectedGeoCard && (
        <GeoDetailModal
          geo={selectedGeoCard}
          isOpen={isGeoModalOpen}
          onClose={() => {
            setIsGeoModalOpen(false);
            setSelectedGeoCard(null);
          }}
          onViewDeals={(geo) => {
            // Close modal and switch to chat interface
            setIsGeoModalOpen(false);
            setSelectedGeoCard(null);
            if (onSwitchToChat) {
              onSwitchToChat(`request deals for ${geo.audienceName} geographic targeting`);
            }
          }}
          onSaveCard={onSaveCard}
          onUnsaveCard={onUnsaveCard}
          isSaved={isSaved}
        />
      )}

      {isMarketingSWOTModalOpen && selectedMarketingSWOT && (
        <MarketingSWOTDetailModal
          swot={selectedMarketingSWOT}
          isOpen={isMarketingSWOTModalOpen}
          onClose={() => {
            setIsMarketingSWOTModalOpen(false);
            setSelectedMarketingSWOT(null);
          }}
          onSaveCard={onSaveCard}
          onUnsaveCard={onUnsaveCard}
          isSaved={isSaved}
        />
      )}

      {isCompanyProfileModalOpen && selectedCompanyProfile && (
        <CompanyProfileDetailModal
          profile={selectedCompanyProfile}
          isOpen={isCompanyProfileModalOpen}
          onClose={() => {
            setIsCompanyProfileModalOpen(false);
            setSelectedCompanyProfile(null);
          }}
          onSaveCard={onSaveCard}
          onUnsaveCard={onUnsaveCard}
          isSaved={isSaved}
        />
      )}

      {isMarketingNewsModalOpen && selectedMarketingNews && (
        <MarketingNewsDetailModal
          news={selectedMarketingNews}
          isOpen={isMarketingNewsModalOpen}
          onClose={() => {
            setIsMarketingNewsModalOpen(false);
            setSelectedMarketingNews(null);
          }}
          onSaveCard={onSaveCard}
          onUnsaveCard={onUnsaveCard}
          isSaved={isSaved}
        />
      )}

      {isCompetitiveIntelModalOpen && selectedCompetitiveIntel && (
        <CompetitiveIntelligenceDetailModal
          competitiveIntel={selectedCompetitiveIntel}
          isOpen={isCompetitiveIntelModalOpen}
          onClose={() => {
            setIsCompetitiveIntelModalOpen(false);
            setSelectedCompetitiveIntel(null);
          }}
          onSaveCard={onSaveCard}
          onUnsaveCard={onUnsaveCard}
          isSaved={isSaved}
        />
      )}

      {isContentStrategyModalOpen && selectedContentStrategy && (
        <ContentStrategyDetailModal
          contentStrategy={selectedContentStrategy}
          isOpen={isContentStrategyModalOpen}
          onClose={() => {
            setIsContentStrategyModalOpen(false);
            setSelectedContentStrategy(null);
          }}
          onSaveCard={onSaveCard}
          onUnsaveCard={onUnsaveCard}
          isSaved={isSaved}
        />
      )}

      {isBrandStrategyModalOpen && selectedBrandStrategy && (
        <BrandStrategyDetailModal
          brandStrategy={selectedBrandStrategy}
          isOpen={isBrandStrategyModalOpen}
          onClose={() => {
            setIsBrandStrategyModalOpen(false);
            setSelectedBrandStrategy(null);
          }}
          onSaveCard={onSaveCard}
          onUnsaveCard={onUnsaveCard}
          isSaved={isSaved}
        />
      )}
    </div>
  );
}
