import { useState, useEffect, useCallback } from 'react';
import { Deal, Persona, AudienceInsights, GeoCard } from '@/types/deal';
import { MarketSizing } from './MarketSizingCard';
import { Search, Filter, Users, Target, Lightbulb, TrendingUp, MapPin, BarChart3, ShoppingCart, Trash2 } from 'lucide-react';
import DealCard from './DealCard';
import DealDetailModal from './DealDetailModal';
import PersonaDetailModal from './PersonaDetailModal';
import { AudienceInsightsDetailModal } from './AudienceInsightsDetailModal';
import { MarketSizingDetailModal } from './MarketSizingDetailModal';
import GeoDetailModal from './GeoDetailModal';

interface AudienceExplorerProps {
  onDealClick: (deal: Deal) => void;
  onAddToCart: (deal: Deal) => void;
  onRemoveFromCart: (dealId: string) => void;
  isInCart: (dealId: string) => boolean;
  onSaveCard?: (card: { type: 'deal' | 'persona' | 'audience-insights' | 'market-sizing' | 'geo-cards', data: any }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
  onSwitchToChat?: (query: string) => void;
}

type CardType = 'all' | 'deals' | 'personas' | 'audience-insights' | 'market-sizing' | 'geo-cards';

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
  onDealClick, 
  onAddToCart, 
  onRemoveFromCart, 
  isInCart,
  onSaveCard,
  onUnsaveCard,
  isSaved,
  onSwitchToChat
}: AudienceExplorerProps) {
  // Debug: Log the props to see what's being passed
  console.log('AudienceExplorer props:', {
    onSaveCard: !!onSaveCard,
    onUnsaveCard: !!onUnsaveCard,
    isSaved: !!isSaved
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [audienceFilter, setAudienceFilter] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMediaFormats, setSelectedMediaFormats] = useState<string[]>([]);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  
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
  
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedAudienceInsights, setSelectedAudienceInsights] = useState<AudienceInsights | null>(null);
  const [selectedMarketSizing, setSelectedMarketSizing] = useState<MarketSizing | null>(null);
  const [selectedGeoCard, setSelectedGeoCard] = useState<GeoCard | null>(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isAudienceInsightsModalOpen, setIsAudienceInsightsModalOpen] = useState(false);
  const [isMarketSizingModalOpen, setIsMarketSizingModalOpen] = useState(false);
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);

  const categories: Category[] = [
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
      id: 'deals',
      name: 'Deal Opportunities',
      description: 'Browse available advertising deals and partnerships',
      icon: ShoppingCart,
      subcategories: [
        { id: 'all-deals', name: 'All Deals', description: 'View all available deals', cardType: 'deals' },
        { id: 'family-deals', name: 'Family & Parenting', description: 'Family-focused advertising opportunities', cardType: 'deals' },
        { id: 'fashion-deals', name: 'Fashion & Beauty', description: 'Style and beauty advertising deals', cardType: 'deals' },
        { id: 'food-deals', name: 'Food & Beverage', description: 'Culinary and beverage advertising opportunities', cardType: 'deals' },
        { id: 'entertainment-deals', name: 'Entertainment & Gaming', description: 'Entertainment and gaming advertising deals', cardType: 'deals' },
        { id: 'sports-deals', name: 'Sports & Fitness', description: 'Athletic and fitness advertising opportunities', cardType: 'deals' },
        { id: 'pet-deals', name: 'Pet Care', description: 'Pet and animal care advertising deals', cardType: 'deals' },
        { id: 'professional-deals', name: 'Business & Finance', description: 'Professional and financial advertising opportunities', cardType: 'deals' },
        { id: 'lifestyle-deals', name: 'Lifestyle & Wellness', description: 'Health, fitness, and lifestyle advertising deals', cardType: 'deals' },
        { id: 'tech-deals', name: 'Technology & Digital', description: 'Tech and digital advertising opportunities', cardType: 'deals' },
        { id: 'automotive-deals', name: 'Automotive', description: 'Auto and transportation advertising deals', cardType: 'deals' },
        { id: 'home-deals', name: 'Home & Garden', description: 'Home improvement and garden advertising opportunities', cardType: 'deals' }
      ]
    },
    {
      id: 'audiences',
      name: 'Audience Insights',
      description: 'Explore audience data and behavioral insights',
      icon: Lightbulb,
      subcategories: [
        { id: 'audience-insights', name: 'Audience Analytics', description: 'Deep audience behavior insights', cardType: 'audience-insights' },
        { id: 'demographics', name: 'Demographics', description: 'Age, gender, income insights', cardType: 'audience-insights' },
        { id: 'interests', name: 'Interests & Behaviors', description: 'Consumer interests and online behavior', cardType: 'audience-insights' }
      ]
    },
    {
      id: 'market-data',
      name: 'Market Intelligence',
      description: 'Market sizing and industry analysis',
      icon: BarChart3,
      subcategories: [
        { id: 'all-sizing', name: 'All Market Data', description: 'View all market sizing data', cardType: 'market-sizing' },
        { id: 'market-trends', name: 'Market Trends', description: 'Industry trend analysis', cardType: 'market-sizing' },
        { id: 'growth-opportunities', name: 'Growth Opportunities', description: 'Emerging market opportunities', cardType: 'market-sizing' },
        { id: 'market-analysis', name: 'Market Analysis', description: 'General market sizing and analysis', cardType: 'market-sizing' }
      ]
    },
    {
      id: 'geographic',
      name: 'Geo Insights',
      description: 'Location-based audience and market data',
      icon: MapPin,
      subcategories: [
        { id: 'all-geo', name: 'All Geographic Data', description: 'View all geographic insights', cardType: 'geo-cards' },
        { id: 'regional-analysis', name: 'Regional Analysis', description: 'Regional market performance', cardType: 'geo-cards' },
        { id: 'local-insights', name: 'Local Insights', description: 'City and local market data', cardType: 'geo-cards' },
        { id: 'international', name: 'International Markets', description: 'Global market opportunities', cardType: 'geo-cards' }
      ]
    }
  ];

  const loadDataBySubcategory = useCallback(async () => {
    if (!selectedSubcategory) return;
    
    setLoading(true);
    setError(null);
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
          const personasResponse = await fetch('http://localhost:3002/api/personas');
          if (personasResponse.ok) {
            const personasData = await personasResponse.json();
            
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
            }
            
            // Further filter by audience filter if provided
            if (audienceFilter.trim()) {
              const filterLower = audienceFilter.toLowerCase();
              filteredPersonas = filteredPersonas.filter((persona: Persona) => 
                persona.name.toLowerCase().includes(filterLower) ||
                persona.coreInsight?.toLowerCase().includes(filterLower) ||
                persona.category?.toLowerCase().includes(filterLower)
              );
            }
            
            filteredPersonas.forEach((persona: Persona) => {
              results.push({ type: 'personas', data: persona });
            });
          }
          break;
          
        case 'audience-insights':
          const insightsResponse = await fetch('http://localhost:3002/api/audience-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: audienceFilter.trim() || subcategory.name }),
          });
          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json();
            if (insightsData.audienceInsights && insightsData.audienceInsights.length > 0) {
              insightsData.audienceInsights.forEach((insight: AudienceInsights) => {
                results.push({ type: 'audience-insights', data: insight });
              });
            }
          }
          break;
          
        case 'market-sizing':
          const sizingResponse = await fetch('http://localhost:3002/api/market-sizing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: audienceFilter.trim() || subcategory.name }),
          });
          if (sizingResponse.ok) {
            const sizingData = await sizingResponse.json();
            if (sizingData.marketSizing && sizingData.marketSizing.length > 0) {
              sizingData.marketSizing.forEach((sizing: MarketSizing) => {
                results.push({ type: 'market-sizing', data: sizing });
              });
            }
          }
          break;
          
        case 'geo-cards':
          // Generate AI-powered geographic insights
          const geoResponse = await fetch('http://localhost:3002/api/geographic-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: audienceFilter.trim() || subcategory.name }),
          });
          
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            if (geoData.geoCards && geoData.geoCards.length > 0) {
              geoData.geoCards.forEach((geo: GeoCard) => {
                results.push({ type: 'geo-cards', data: geo });
              });
            }
          } else {
            console.error('Failed to fetch geographic insights:', geoResponse.statusText);
            setError('Failed to load geographic insights. Please try again.');
          }
          break;
      }
      
      console.log(`✅ Loaded ${results.length} results for ${subcategory.name}:`, results);
      setSearchResults(results);
      
    } catch (error) {
      console.error('Error loading data by subcategory:', error);
      setError('Failed to load data. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSubcategory, allDeals, selectedMediaFormats, audienceFilter]);

  // Auto-load data when subcategory changes for personas, clear results for others
  useEffect(() => {
    if (selectedSubcategory) {
      const subcategory = categories
        .flatMap(cat => cat.subcategories || [])
        .find(sub => sub.id === selectedSubcategory);
      
      // Auto-load data when a subcategory is selected
      if (subcategory && (subcategory.cardType === 'personas' || subcategory.cardType === 'deals')) {
        loadDataBySubcategory();
      } else {
        // Clear results for other card types
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  }, [selectedSubcategory, loadDataBySubcategory]);

  // Reload data when media formats change for deals
  useEffect(() => {
    if (selectedCategory === 'deals' && selectedSubcategory) {
      loadDataBySubcategory();
    }
  }, [selectedMediaFormats]);

  // Reload data when audience filter changes for deals
  useEffect(() => {
    if (selectedCategory === 'deals' && selectedSubcategory) {
      loadDataBySubcategory();
    }
  }, [audienceFilter]);

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
      case 'deals':
        setSelectedDeal(result.data);
        setIsDealModalOpen(true);
        onDealClick(result.data);
        break;
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
    setSelectedSubcategory(null);
    setAudienceFilter('');
    setSearchResults([]);
    setError(null);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setAudienceFilter('');
    setError(null);
  };

  const handleSearch = () => {
    // For deals, filtering happens automatically via useEffect
    // For other categories, trigger manual search
    if (selectedSubcategory && selectedCategory !== 'deals') {
      loadDataBySubcategory();
    }
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
                {result.data.dealName || result.data.name || result.data.marketName || result.data.title}
              </h3>
              <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                {getCardTypeLabel(result.type)}
              </span>
            </div>
            <p className="text-sm text-neutral-600 line-clamp-2">
              {result.data.description || result.data.coreInsight || result.data.summary}
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
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-white">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-neutral-800">Intelligence Cards</h1>
            <p className="text-sm text-neutral-600">Discover insights across all card types</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
            <Search className="w-4 h-4" />
            {searchResults.length} Results
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="p-6 border-b border-neutral-200 bg-white">
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

          {/* Subcategories */}
          {selectedCategory && (
            <div>
              <h3 className="text-md font-semibold text-neutral-800 mb-3">Select a Subcategory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories
                  .find(cat => cat.id === selectedCategory)
                  ?.subcategories?.map((subcategory) => {
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
          )}

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
                        ? "Search audience insights (e.g., 'pet owners', 'millennials')..."
                        : selectedCategory === 'market-data'
                        ? "Search market sizing (e.g., 'automotive', 'healthcare')..."
                        : selectedCategory === 'geographic'
                        ? "Search geographic insights (e.g., 'US', 'Europe')..."
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
      <div className="flex-1 overflow-y-auto p-6">
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
        ) : selectedSubcategory ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No data available</h3>
            <p className="text-neutral-600">
              No results found for this subcategory. The data might be loading or unavailable.
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Select a category to explore</h3>
            <p className="text-neutral-600">
              Choose a category above to browse deals, audience insights, market data, and geographic information
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {isDealModalOpen && selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          isOpen={isDealModalOpen}
          onClose={() => {
            setIsDealModalOpen(false);
            setSelectedDeal(null);
          }}
          onAddToCart={onAddToCart}
          onRemoveFromCart={onRemoveFromCart}
          isInCart={isInCart}
          onSaveCard={onSaveCard}
          onUnsaveCard={onUnsaveCard}
          isSaved={isSaved}
        />
      )}

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
    </div>
  );
}
