'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MarketInsightsMetric,
  TopMarket,
  MarketProfile as MarketProfileType,
  GeographicLevel,
  SavedCard
} from '@/types/deal';
import { useSaveCard } from '@/components/AppLayout';
import MetricSelector from '@/components/MetricSelector';
import TopMarketsList from '@/components/TopMarketsList';
import MarketProfile from '@/components/MarketProfile';
import MarketInsightsMap from '@/components/MarketInsightsMap';
import MarketComparison from '@/components/MarketComparison';
import MarketFiltersPanel, { MarketFilters } from '@/components/MarketFiltersPanel';
import { TrendingUp, List, Map, GitCompare, Download, Share2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

function MarketInsightsContent() {
  const searchParams = useSearchParams();
  const { onSaveCard, onUnsaveCard, isSaved } = useSaveCard();

  // State management
  const [metrics, setMetrics] = useState<MarketInsightsMetric[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [geoLevel, setGeoLevel] = useState<GeographicLevel>('state');
  const [topMarkets, setTopMarkets] = useState<TopMarket[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<TopMarket[]>([]);
  const [activeFilters, setActiveFilters] = useState<MarketFilters>({ includeCommercialZips: false });
  const [selectedMarketProfile, setSelectedMarketProfile] = useState<MarketProfileType | null>(null);
  const [comparisonProfiles, setComparisonProfiles] = useState<MarketProfileType[]>([]);
  const [includeCommercialZips, setIncludeCommercialZips] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [campaignBrief, setCampaignBrief] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Shopping products - two distinct lists
  const [mostPopularProducts, setMostPopularProducts] = useState<Array<{
    segment: string;
    category: string;
    overIndex?: number;
  }>>([]);
  const [overIndexingProducts, setOverIndexingProducts] = useState<Array<{
    segment: string;
    category: string;
    overIndex?: number;
  }>>([]);
  const [commerceCategoryFilter, setCommerceCategoryFilter] = useState<string>('All Categories');
  const [loadingCommerceData, setLoadingCommerceData] = useState(false);

  // Map segment names to Google Product Taxonomy Level 1 categories
  // Reference: https://www.google.com/basepages/producttype/taxonomy.en-US.txt
  const getLevel1Category = (segmentName: string): string => {
    const name = segmentName.toLowerCase();
    
    // Helper to check for whole word matches
    const hasWord = (word: string) => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(name);
    };

    // Vehicles & Parts
    if (name.includes('vehicle') || name.includes('automotive') || name.includes('radar detector') ||
        hasWord('car') || name.includes('motor') || name.includes('tire') || name.includes('auto part') ||
        name.includes('watercraft') || name.includes('aircraft')) {
      return 'Vehicles & Parts';
    }
    
    // Cameras & Optics (separate from Electronics per Google taxonomy)
    if (name.includes('camera') || name.includes('optic') || name.includes('binocular') ||
        name.includes('telescope') || name.includes('microscope') || name.includes('tripod') ||
        name.includes('photography') || name.includes('lens')) {
      return 'Cameras & Optics';
    }
    
    // Electronics
    if (name.includes('circuit') || name.includes('computer') || name.includes('electronic') ||
        name.includes('audio') || name.includes('video') || name.includes('phone') ||
        name.includes('tablet') || name.includes('gps') || name.includes('smart') ||
        name.includes('gaming') || name.includes('communication') || name.includes('speaker') ||
        name.includes('television') || name.includes('laptop') || name.includes('network') ||
        name.includes('printer') || name.includes('microphone') || name.includes('dvd') ||
        name.includes('console') || name.includes('storage device') || name.includes('component') ||
        name.includes('arcade') || name.includes('radar')) {
      return 'Electronics';
    }
    
    // Software (separate from Electronics per Google taxonomy)
    if (name.includes('software') || name.includes('operating system') || name.includes('antivirus') ||
        name.includes('video game software')) {
      return 'Software';
    }
    
    // Furniture (separate from Home & Garden per Google taxonomy)
    if (name.includes('furniture') || name.includes('mattress') || name.includes('futon') ||
        name.includes('cabinet') || name.includes('shelving') || name.includes('bench') ||
        name.includes('ottoman') || hasWord('desk') || hasWord('sofa') || hasWord('chair') ||
        hasWord('bed') || hasWord('table') && !name.includes('tablet')) {
      return 'Furniture';
    }
    
    // Home & Garden
    if (name.includes('appliance') || name.includes('kitchen') || name.includes('bedding') ||
        name.includes('garden') || name.includes('lawn') || name.includes('home decor') ||
        name.includes('lighting') || name.includes('cleaning') || name.includes('decor') ||
        name.includes('fencing') || name.includes('stove') || name.includes('fireplace') ||
        name.includes('pool & spa') || name.includes('plumbing') || name.includes('cookware') ||
        name.includes('linens') || name.includes('plant') || name.includes('household supply') ||
        name.includes('household supplies') || name.includes('bathroom accessor') ||
        name.includes('laundry') || name.includes('smoking accessor') || name.includes('umbrella') ||
        name.includes('parasol') || name.includes('emergency prep') || name.includes('flood') ||
        name.includes('fire safety')) {
      return 'Home & Garden';
    }
    
    // Food, Beverages & Tobacco (full name per Google taxonomy)
    if (name.includes('food') || name.includes('beverage') || name.includes('grocery') ||
        name.includes('snack') || name.includes('drink') || name.includes('coffee') ||
        hasWord('tea') || name.includes('alcohol') || name.includes('pasta') ||
        name.includes('soup') || name.includes('dairy') || name.includes('bread') ||
        name.includes('juice') || name.includes('seasoning') || name.includes('spice') ||
        name.includes('condiment') || name.includes('sauce') || name.includes('cooking') ||
        name.includes('baking') || name.includes('frozen dessert') || name.includes('water') ||
        name.includes('milk') || name.includes('dip') || name.includes('spread') ||
        name.includes('tobacco') || name.includes('cigarette') || name.includes('cigar')) {
      return 'Food, Beverages & Tobacco';
    }
    
    // Apparel & Accessories
    if (name.includes('apparel') || name.includes('clothing') || name.includes('shoes') ||
        name.includes('jewelry') || hasWord('watch') || name.includes('handbag') ||
        name.includes('fashion') || name.includes('shirt') || name.includes('skirt') || 
        name.includes('shorts') || name.includes('costume') || name.includes('outerwear') ||
        name.includes('activewear') || name.includes('sunglasses') || name.includes('wallet') ||
        (name.includes('dress') && !name.includes('address') && !name.includes('hairdress'))) {
      return 'Apparel & Accessories';
    }
    
    // Luggage & Bags (separate from Apparel per Google taxonomy)
    if (name.includes('luggage') || name.includes('suitcase') || name.includes('briefcase') ||
        name.includes('backpack') || name.includes('duffel') || name.includes('garment bag') ||
        name.includes('diaper bag') || name.includes('messenger bag') || name.includes('tote')) {
      return 'Luggage & Bags';
    }
    
    // Health & Beauty
    if (name.includes('health') || name.includes('beauty') || name.includes('personal care') ||
        name.includes('cosmetic') || name.includes('skincare') || name.includes('vitamin') ||
        name.includes('medical') || name.includes('vision care') || name.includes('oral care') ||
        name.includes('foot care') || name.includes('sleeping aid') || name.includes('condom') ||
        name.includes('feminine') || name.includes('sanitary') || name.includes('shaving') ||
        name.includes('grooming') || name.includes('hair care') || name.includes('hairdress')) {
      return 'Health & Beauty';
    }
    
    // Baby & Toddler (Google taxonomy name, not "Baby & Kids")
    if (name.includes('baby') || name.includes('toddler') || name.includes('nursery') ||
        name.includes('diaper') || name.includes('swaddl') || name.includes('nursing') ||
        name.includes('pacifier') || name.includes('stroller') || name.includes('crib')) {
      return 'Baby & Toddler';
    }
    
    // Toys & Games (separate from Baby & Toddler per Google taxonomy)
    if (name.includes('toy') || name.includes('puzzle') || hasWord('game') ||
        name.includes('indoor game') || name.includes('outdoor play') || name.includes('doll') ||
        name.includes('action figure') || name.includes('building block') || name.includes('lego')) {
      return 'Toys & Games';
    }
    
    // Sporting Goods
    if (name.includes('sport') || name.includes('outdoor recreation') || name.includes('camping') ||
        name.includes('exercise') || name.includes('athletic') || name.includes('bike') ||
        name.includes('golf') || name.includes('cycling') || name.includes('yoga') ||
        name.includes('pilates') || name.includes('hiking') || name.includes('fishing') ||
        name.includes('hunting') || name.includes('boating') || name.includes('swimming') ||
        name.includes('fitness')) {
      return 'Sporting Goods';
    }
    
    // Animals & Pet Supplies (Google taxonomy name)
    if (hasWord('pet') || hasWord('dog') || hasWord('cat') || hasWord('animal') ||
        name.includes('live animal') || name.includes('aquarium') || name.includes('bird supply') ||
        name.includes('fish supply') || name.includes('reptile')) {
      return 'Animals & Pet Supplies';
    }
    
    // Business & Industrial
    if (name.includes('business') || name.includes('industrial') || name.includes('construction') ||
        name.includes('manufacturing') || name.includes('agriculture') || name.includes('forestry') ||
        name.includes('science') || name.includes('laboratory') || name.includes('signage') ||
        name.includes('advertising') || name.includes('marketing') || name.includes('retail') ||
        name.includes('hotel') || name.includes('hospitality') || name.includes('finance') ||
        name.includes('insurance') || name.includes('building material') || name.includes('dentistry') ||
        name.includes('piercing') || name.includes('tattoo')) {
      return 'Business & Industrial';
    }
    
    // Hardware
    if (name.includes('tool') || name.includes('hardware') || name.includes('lock') ||
        hasWord('key') || name.includes('plumbing') || name.includes('electrical') ||
        name.includes('heating') || name.includes('ventilation') || name.includes('hvac')) {
      return 'Hardware';
    }
    
    // Office Supplies
    if (name.includes('office') || name.includes('stationery') || name.includes('desk accessor') ||
        name.includes('filing') || name.includes('presentation')) {
      return 'Office Supplies';
    }
    
    // Arts & Entertainment
    if (hasWord('art') || name.includes('craft') || name.includes('music') ||
        name.includes('entertainment') || name.includes('hobby') || name.includes('event ticket') ||
        name.includes('gift giving') || name.includes('party') || name.includes('film') ||
        name.includes('creative') || name.includes('collectible') || name.includes('musical instrument')) {
      return 'Arts & Entertainment';
    }
    
    // Media (separate from Arts & Entertainment per Google taxonomy)
    if (name.includes('book') || name.includes('magazine') || name.includes('newspaper') ||
        name.includes('dvd') || name.includes('cd') || name.includes('vinyl') ||
        name.includes('sheet music') || name.includes('audiobook')) {
      return 'Media';
    }
    
    // Religious & Ceremonial
    if (name.includes('religious') || name.includes('ceremonial') || name.includes('memorial') ||
        name.includes('wedding ceremony') || name.includes('prayer')) {
      return 'Religious & Ceremonial';
    }
    
    return 'General Merchandise';
  };

  // Fetch shopping products when a market profile is selected
  const fetchShoppingProducts = async (profile: MarketProfileType, categoryFilter?: string) => {
    try {
      setLoadingCommerceData(true);
      
      const effectiveFilter = categoryFilter || commerceCategoryFilter;
      console.log(`🛒 Fetching commerce data with category filter: "${effectiveFilter}"`);
      
      // Fetch market-specific commerce data using the new endpoint
      const response = await fetch(`${API_BASE_URL}/api/market-insights/market-commerce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geoLevel: profile.geoLevel,
          marketName: profile.name,
          includeCommercialZips,
          categoryFilter: effectiveFilter
        })
      });
      
      // Check if response has content before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Commerce data API returned non-JSON response:', contentType);
        throw new Error('Invalid response format from commerce data API. Please try again.');
      }

      // Get response text first to check if it's empty
      const responseText = await response.text();
      if (!responseText || responseText.trim().length === 0) {
        console.error('❌ Commerce data API returned empty response');
        if (response.status === 504) {
          throw new Error('The commerce data query is taking too long. This may indicate a database performance issue. Please try again in a moment or contact support if the issue persists.');
        } else {
          throw new Error('Commerce data API returned empty response. Please try again.');
        }
      }
      
      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        console.error(`❌ Commerce data API error (${response.status}):`, errorMessage);
        throw new Error(errorMessage);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse commerce data JSON:', parseError);
        console.error('Response text:', responseText.substring(0, 500));
        throw new Error('Failed to parse commerce data response. Please try again.');
      }

      if (data.success) {
        // Top Shopping Categories - from market-specific data
        const topCategories = (data.topByPopularity || [])
          .slice(0, 5)
          .map((seg: any) => ({
            segment: seg.name,
            category: seg.level1Category || getLevel1Category(seg.name)
          }));
        setMostPopularProducts(topCategories);

        // Highest Over-Indexing - actual over-index vs national average
        const byOverIndex = (data.topByOverIndex || [])
          .slice(0, 5)
          .map((seg: any) => ({
            segment: seg.name,
            category: seg.level1Category || getLevel1Category(seg.name),
            overIndex: seg.overIndex
          }));
        setOverIndexingProducts(byOverIndex);

        const filterLabel = data.categoryFilter !== 'All Categories' ? ` [${data.categoryFilter}]` : '';
        console.log(`✅ Loaded ${data.totalSegments} commerce segments for ${profile.name} (${data.zipCodeCount} ZIPs)${filterLabel}`);
        
        // Debug: Log the categories of returned segments
        console.log('📊 Top categories returned:', topCategories.map((p: any) => p.category));
        console.log('📊 Over-indexing categories returned:', byOverIndex.map((p: any) => p.category));
      } else {
        console.warn('⚠️ No commerce data for market:', data.error || data.message);
        setMostPopularProducts([]);
        setOverIndexingProducts([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error fetching shopping products:', errorMessage);
      // Log full error for debugging
      if (err instanceof Error && err.stack) {
        console.error('Error stack:', err.stack);
      }
      // Don't show error to user, just leave products empty
      // The Market Profile will still show, just without commerce data
      setMostPopularProducts([]);
      setOverIndexingProducts([]);
    } finally {
      setLoadingCommerceData(false);
    }
  };

  // Handler to navigate to Audience Insights for a shopping product
  const handleViewShoppingProduct = (segment: string) => {
    // Navigate to Audience Insights page with the segment pre-selected
    window.location.href = `/audience-insights?segment=${encodeURIComponent(segment)}`;
  };

  // Handler for commerce category filter change
  const handleCommerceCategoryFilterChange = (category: string) => {
    console.log(`🔄 Category filter changed to: "${category}"`);
    setCommerceCategoryFilter(category);
    // Refetch commerce data with new filter if a market is selected
    if (selectedMarketProfile) {
      console.log(`🔄 Refetching commerce data for ${selectedMarketProfile.name} with filter: "${category}"`);
      fetchShoppingProducts(selectedMarketProfile, category);
    } else {
      console.log(`⚠️ No market profile selected, filter will apply on next market selection`);
    }
  };

  // Load available metrics on mount
  useEffect(() => {
    fetchMetrics();
  }, []);

  // Handle URL parameters for loading saved market profiles
  useEffect(() => {
    const geoLevelParam = searchParams.get('geoLevel');
    const marketParam = searchParams.get('market');
    
    if (geoLevelParam && marketParam) {
      // Load the market profile from URL parameters
      loadMarketFromURL(geoLevelParam as GeographicLevel, marketParam);
    }
  }, [searchParams]);

  // Handle audience segment parameters from Audiences page
  useEffect(() => {
    const audienceSegment = searchParams.get('audienceSegment');
    const audiencePath = searchParams.get('audiencePath');
    
    if (audienceSegment) {
      // Show a success message indicating audience context is loaded
      setSuccessMessage(`Campaign context loaded for audience: ${audienceSegment}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [searchParams]);

  // Fetch top markets when metric, geo level, or commercial ZIP filter changes
  useEffect(() => {
    if (selectedMetric) {
      fetchTopMarkets();
    }
  }, [selectedMetric, geoLevel, includeCommercialZips]);

  // Apply filters to markets
  useEffect(() => {
    applyFilters();
  }, [topMarkets, activeFilters]);

  const applyFilters = () => {
    let filtered = [...topMarkets];
    const hasFilters = Object.keys(activeFilters).some(k => 
      activeFilters[k as keyof typeof activeFilters] !== undefined && 
      activeFilters[k as keyof typeof activeFilters] !== false
    );
    
    // Debug: Log first few markets to see what data we have
    if (topMarkets.length > 0 && hasFilters) {
      console.log('🔍 Filter Debug - Sample market data:', {
        name: topMarkets[0].name,
        medianHouseholdIncome: topMarkets[0].medianHouseholdIncome,
        collegeEducated: topMarkets[0].collegeEducated,
        homeownershipRate: topMarkets[0].homeownershipRate,
        medianAge: topMarkets[0].medianAge,
        population: topMarkets[0].population
      });
      console.log('🔍 Active filters:', activeFilters);
    }

    // Population filters
    if (activeFilters.populationMin !== undefined) {
      filtered = filtered.filter(m => m.population >= activeFilters.populationMin!);
    }
    if (activeFilters.populationMax !== undefined) {
      filtered = filtered.filter(m => m.population <= activeFilters.populationMax!);
    }
    
    // Income filters
    if (activeFilters.incomeMin !== undefined) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(m => (m.medianHouseholdIncome || 0) >= activeFilters.incomeMin!);
      console.log(`🔍 Income filter (min ${activeFilters.incomeMin}): ${beforeCount} → ${filtered.length} markets`);
    }
    if (activeFilters.incomeMax !== undefined) {
      filtered = filtered.filter(m => (m.medianHouseholdIncome || 0) <= activeFilters.incomeMax!);
    }
    
    // College educated filter
    if (activeFilters.collegeEducatedMin !== undefined) {
      filtered = filtered.filter(m => (m.collegeEducated || 0) >= activeFilters.collegeEducatedMin!);
    }
    
    // Homeownership filter
    if (activeFilters.homeOwnershipMin !== undefined) {
      filtered = filtered.filter(m => (m.homeownershipRate || 0) >= activeFilters.homeOwnershipMin!);
    }
    
    // Age filters
    if (activeFilters.ageMedianMin !== undefined) {
      filtered = filtered.filter(m => (m.medianAge || 0) >= activeFilters.ageMedianMin!);
    }
    if (activeFilters.ageMedianMax !== undefined) {
      filtered = filtered.filter(m => (m.medianAge || 0) <= activeFilters.ageMedianMax!);
    }

    console.log(`🔍 Final filtered results: ${filtered.length} of ${topMarkets.length} markets`);
    setFilteredMarkets(filtered);
    
    // Show feedback message if filters are active
    if (hasFilters && topMarkets.length > 0) {
      if (filtered.length === 0) {
        setError(`No markets match your filter criteria. Try adjusting your filters or changing the geographic level.`);
        setTimeout(() => setError(null), 5000);
      } else if (filtered.length < topMarkets.length) {
        setSuccessMessage(`Filters applied: ${filtered.length} of ${topMarkets.length} markets match.`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  const handleFiltersChange = (filters: MarketFilters) => {
    setActiveFilters(filters);
    
    // Extract includeCommercialZips from filters
    if (filters.includeCommercialZips !== undefined) {
      setIncludeCommercialZips(filters.includeCommercialZips);
    }
  };

  const fetchMetrics = async () => {
    try {
      setLoadingMetrics(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/market-insights/metrics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setMetrics(data.metrics);
        // Auto-select first metric
        if (data.metrics.length > 0) {
          setSelectedMetric(data.metrics[0].id);
        }
      } else {
        setError('Failed to load metrics');
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Failed to connect to the server');
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchTopMarkets = async () => {
    try {
      setLoadingMarkets(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/market-insights/top-markets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metricId: selectedMetric,
          geoLevel,
          limit: 50,
          includeCommercialZips
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setTopMarkets(data.markets);
      } else {
        setError(data.error || 'Failed to load top markets');
        setTopMarkets([]);
      }
    } catch (err) {
      console.error('Error fetching top markets:', err);
      setError('Failed to fetch market data');
      setTopMarkets([]);
    } finally {
      setLoadingMarkets(false);
    }
  };

  // Load market profile from URL parameters
  const loadMarketFromURL = async (level: GeographicLevel, marketName: string) => {
    try {
      setLoadingProfile(true);
      setError(null);
      setGeoLevel(level);
      setMostPopularProducts([]); // Clear previous products
      setOverIndexingProducts([]);

      const response = await fetch(`${API_BASE_URL}/api/market-insights/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          geoLevel: level,
          marketName: decodeURIComponent(marketName),
          includeCommercialZips
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSelectedMarketProfile(data.profile);
        // Fetch relevant shopping products for this market
        fetchShoppingProducts(data.profile);
      } else {
        setError(data.error || 'Failed to load market profile');
      }
    } catch (err) {
      console.error('Error loading market from URL:', err);
      setError('Failed to load market profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Save/Unsave handlers
  const handleSaveMarketProfile = (profile: MarketProfileType) => {
    onSaveCard({ type: 'market-profile', data: profile });
    setSuccessMessage(`${profile.name} saved to cards!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleUnsaveMarketProfile = (profileId: string) => {
    onUnsaveCard(profileId);
    setSuccessMessage('Card removed from saved!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const isMarketProfileSaved = (profile: MarketProfileType | null): boolean => {
    if (!profile) return false;
    const profileId = `market-profile-${profile.geoLevel}-${profile.name}`;
    return isSaved(profileId);
  };

  const handleMarketClick = async (market: TopMarket) => {
    try {
      setLoadingProfile(true);
      setError(null);
      setMostPopularProducts([]); // Clear previous products
      setOverIndexingProducts([]);

      const response = await fetch(`${API_BASE_URL}/api/market-insights/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          geoLevel: market.geoLevel,
          marketName: market.name,
          includeCommercialZips
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSelectedMarketProfile(data.profile);
        // Fetch relevant shopping products for this market
        fetchShoppingProducts(data.profile);
      } else {
        setError(data.error || 'Failed to load market profile');
      }
    } catch (err) {
      console.error('Error fetching market profile:', err);
      setError('Failed to fetch market profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleGenerateCampaignBrief = async (category?: string) => {
    if (!selectedMarketProfile) return;

    try {
      setGeneratingBrief(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/campaign-content/generate-brief`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          geoLevel: selectedMarketProfile.geoLevel,
          marketName: selectedMarketProfile.name,
          includeCommercialZips,
          productCategory: category // Pass the selected category for filtering
        })
      });

      const data = await response.json();

      if (data.success) {
        setCampaignBrief(data.brief);
        const categoryMsg = category ? ` for ${category}` : '';
        setSuccessMessage(`Campaign brief generated successfully${categoryMsg}!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || 'Failed to generate campaign brief');
      }
    } catch (err) {
      console.error('Error generating campaign brief:', err);
      setError('Failed to generate campaign brief. Please try again.');
    } finally {
      setGeneratingBrief(false);
    }
  };

  const handleCloseCampaignBrief = () => {
    setCampaignBrief(null);
  };

  const handleAddToComparison = async (market: TopMarket) => {
    // Check if this is the primary market (selected market profile)
    if (selectedMarketProfile && market.name === selectedMarketProfile.name) {
      setError('This market is already selected as the primary market for comparison');
      setSuccessMessage(null);
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Check if already in comparison
    if (comparisonProfiles.some(p => p.name === market.name)) {
      setError('This market is already in the comparison');
      setSuccessMessage(null);
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Limit to 2 additional markets (primary + 2 = 3 total)
    if (comparisonProfiles.length >= 2) {
      setError('Maximum 2 additional markets can be compared. Remove one to add another.');
      setSuccessMessage(null);
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch(`${API_BASE_URL}/api/market-insights/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          geoLevel: market.geoLevel,
          marketName: market.name,
          includeCommercialZips
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setComparisonProfiles([...comparisonProfiles, data.profile]);
        setSuccessMessage(`${market.name} added to comparison! (${comparisonProfiles.length + 1}/2 additional markets)`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || 'Failed to load market for comparison');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      console.error('Error adding market to comparison:', err);
      setError('Failed to add market to comparison');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleRemoveFromComparison = (marketName: string) => {
    setComparisonProfiles(comparisonProfiles.filter(p => p.name !== marketName));
  };

  const handleExportCSV = () => {
    if (filteredMarkets.length === 0) {
      setError('No markets to export');
      return;
    }

    const selectedMetricObj = metrics.find(m => m.id === selectedMetric);
    const metricName = selectedMetricObj?.name || 'Metric';

    // Create CSV content with derived metrics
    const headers = [
      'Rank',
      'Market Name',
      'Geographic Level',
      metricName,
      'Population',
      'Opportunity Score',
      'Tier',
      'Consumer Wealth Index',
      'Community Cohesion Score',
      'Life Stage Segment'
    ];
    const rows = filteredMarkets.map(market => [
      market.rank,
      market.name,
      market.geoLevel,
      market.value,
      market.population,
      market.opportunityScore || 'N/A',
      market.tier || 'N/A',
      market.consumerWealthIndex || 'N/A',
      market.communityCohesionScore || 'N/A',
      market.lifeStageSegment || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `top-markets-${geoLevel}-${selectedMetric}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadZipCodes = async () => {
    if (!selectedMetric) {
      setError('Please select a metric first');
      return;
    }

    try {
      setSuccessMessage('Preparing zip codes download...');
      
      const response = await fetch(`${API_BASE_URL}/api/market-insights/top-zip-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metricId: selectedMetric,
          limit: 5000,
          includeCommercialZips
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch zip codes');
      }

      const data = await response.json();
      
      if (!data.success || !data.zipCodes) {
        throw new Error('Invalid response from server');
      }

      // Get metric name for filename
      const metric = metrics.find(m => m.id === selectedMetric);
      const metricName = metric ? metric.name : selectedMetric;

      // Create CSV content
      const headers = ['Zip Code', 'City', 'State', 'County', 'Population', metricName];
      const rows = data.zipCodes.map((zip: any) => [
        zip.zipCode,
        zip.city || '',
        zip.state || '',
        zip.county || '',
        zip.population,
        zip.formattedValue
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row: (string | number)[]) => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `top-5000-zip-codes-${selectedMetric}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMessage(`Downloaded top ${data.count} zip codes for campaign targeting!`);
    } catch (err) {
      console.error('Error downloading zip codes:', err);
      setError('Failed to download zip codes. Please try again.');
    }
  };

  if (loadingMetrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-gold mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading Market Insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-brand-gold" />
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-charcoal">U.S. Market Insights</h1>
          </div>
          <p className="text-sm sm:text-base text-neutral-600">
            Actionable market intelligence based on U.S. Census data.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-4 text-red-500 hover:text-red-700 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Success Message Display */}
        {successMessage && (
          <div className="mb-6">
            <div className="bg-green-50 border-2 border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{successMessage}</span>
              </div>
              <button 
                onClick={() => setSuccessMessage(null)}
                className="ml-4 text-green-500 hover:text-green-700 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Metric Selector and Filters */}
        <div className="mb-6 space-y-4">
          <MetricSelector
            metrics={metrics}
            selectedMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
          />

          {/* Advanced Filters Panel */}
          <MarketFiltersPanel
            onFiltersChange={handleFiltersChange}
            activeFilters={activeFilters}
            onApplyFilters={async () => {
              // Trigger a refetch to get fresh data with filter fields
              if (selectedMetric) {
                await fetchTopMarkets();
              }
              // Note: Success message will be shown via the applyFilters effect
              // when filteredMarkets updates after the new data arrives
            }}
            isLoading={loadingMarkets}
          />
        </div>

        {/* Top Section: Top Market Identification */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-brand-charcoal">
                Top Market Identification
              </h2>
              {/* Show filter results indicator */}
              {filteredMarkets.length !== topMarkets.length && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium rounded">
                  {filteredMarkets.length} of {topMarkets.length} markets
                </span>
              )}
            </div>
            
            {/* Actions: Comparison Counter, View Mode Toggle & Export */}
            <div className="flex flex-wrap gap-2 items-center">
              {(selectedMarketProfile || comparisonProfiles.length > 0) && (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 border-2 border-blue-500 text-blue-700 rounded-lg font-medium text-xs sm:text-sm">
                  <GitCompare className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{(selectedMarketProfile ? 1 : 0) + comparisonProfiles.length} in comparison</span>
                  <span className="sm:hidden">{(selectedMarketProfile ? 1 : 0) + comparisonProfiles.length}</span>
                </div>
              )}
              <button
                onClick={handleExportCSV}
                disabled={filteredMarkets.length === 0}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 min-h-[44px] rounded-lg font-medium text-sm transition-all bg-neutral-100 text-neutral-600 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
                title="Export top markets to CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Markets</span>
                <span className="sm:hidden">Export</span>
              </button>
              <button
                onClick={handleDownloadZipCodes}
                disabled={!selectedMetric}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 min-h-[44px] rounded-lg font-medium text-sm transition-all bg-brand-gold text-white hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
                title="Download top 5,000 ZIP codes for campaign targeting"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Top 5K ZIPs</span>
                <span className="sm:hidden">ZIPs</span>
              </button>
              <div className="flex gap-2 border border-neutral-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 min-h-[44px] rounded font-medium text-sm transition-all touch-manipulation active:scale-95 ${
                    viewMode === 'list'
                      ? 'bg-brand-gold text-white shadow-md'
                      : 'bg-transparent text-neutral-600 hover:bg-neutral-100'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 min-h-[44px] rounded font-medium text-sm transition-all touch-manipulation active:scale-95 ${
                    viewMode === 'map'
                      ? 'bg-brand-gold text-white shadow-md'
                      : 'bg-transparent text-neutral-600 hover:bg-neutral-100'
                  }`}
                  aria-label="Map view"
                >
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Conditional Rendering: List or Map */}
          {viewMode === 'list' ? (
            <div className="max-h-[400px] overflow-y-auto">
              <TopMarketsList
                markets={filteredMarkets}
                geoLevel={geoLevel}
                onGeoLevelChange={setGeoLevel}
                onMarketClick={handleMarketClick}
                onAddToComparison={handleAddToComparison}
                loading={loadingMarkets}
                includeCommercialZips={includeCommercialZips}
                comparisonMarketNames={[
                  ...(selectedMarketProfile ? [selectedMarketProfile.name] : []),
                  ...comparisonProfiles.map(p => p.name)
                ]}
              />
            </div>
          ) : (
            <MarketInsightsMap
              markets={filteredMarkets}
              metricName={metrics.find(m => m.id === selectedMetric)?.name || 'Selected Metric'}
              metricFormat={metrics.find(m => m.id === selectedMetric)?.format || 'number'}
              onMarketClick={handleMarketClick}
            />
          )}
        </div>

        {/* Middle Section: Market Profile Deep Dive */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-brand-charcoal">
              Market Profile Deep Dive
            </h2>
          </div>
          <MarketProfile
            profile={selectedMarketProfile}
            loading={loadingProfile}
            onSave={handleSaveMarketProfile}
            onUnsave={handleUnsaveMarketProfile}
            isSaved={isMarketProfileSaved(selectedMarketProfile)}
            onGenerateCampaignBrief={handleGenerateCampaignBrief}
            generatingBrief={generatingBrief}
            campaignBrief={campaignBrief}
            onCloseCampaignBrief={handleCloseCampaignBrief}
            mostPopularProducts={mostPopularProducts}
            overIndexingProducts={overIndexingProducts}
            onViewShoppingProduct={handleViewShoppingProduct}
            commerceCategoryFilter={commerceCategoryFilter}
            onCommerceCategoryFilterChange={handleCommerceCategoryFilterChange}
            loadingCommerceData={loadingCommerceData}
            onAddToComparison={(market) => handleAddToComparison({
              ...market,
              geoLevel: market.geoLevel as GeographicLevel,
              rank: 0,
              value: 0,
              formattedValue: ''
            })}
            comparisonMarketNames={[
              ...(selectedMarketProfile ? [selectedMarketProfile.name] : []),
              ...comparisonProfiles.map(p => p.name)
            ]}
          />
        </div>

        {/* Bottom Section: Side-by-Side Market Comparison */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <GitCompare className="w-5 h-5 sm:w-6 sm:h-6 text-brand-gold" />
              <h2 className="text-lg sm:text-xl font-bold text-brand-charcoal">
                <span className="hidden sm:inline">Side-by-Side Market Comparison</span>
                <span className="sm:hidden">Market Comparison</span>
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-neutral-600">
              {selectedMarketProfile ? '1 primary' : '0'} + {comparisonProfiles.length}/2 additional
            </div>
          </div>
          
          {selectedMarketProfile && comparisonProfiles.length < 2 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              💡 <strong>Tip:</strong> Click the Compare button on any market to add it for comparison with {selectedMarketProfile.name} (up to 2 additional)
            </div>
          )}

          <MarketComparison
            profiles={comparisonProfiles}
            onRemoveMarket={handleRemoveFromComparison}
            primaryMarket={selectedMarketProfile}
          />
        </div>
      </div>
    </div>
  );
}

export default function MarketInsightsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading market insights...</p>
        </div>
      </div>
    }>
      <MarketInsightsContent />
    </Suspense>
  );
}

