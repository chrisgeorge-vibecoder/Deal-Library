'use client';

import { useState, useEffect } from 'react';
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function MarketInsightsPage() {
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

    if (activeFilters.populationMin !== undefined) {
      filtered = filtered.filter(m => m.population >= activeFilters.populationMin!);
    }
    if (activeFilters.populationMax !== undefined) {
      filtered = filtered.filter(m => m.population <= activeFilters.populationMax!);
    }
    // Note: Income, college educated, etc. filters would require fetching full profiles
    // For now, we'll filter on what's available in TopMarket

    setFilteredMarkets(filtered);
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

      const data = await response.json();

      if (data.success) {
        setSelectedMarketProfile(data.profile);
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

      const data = await response.json();

      if (data.success) {
        setSelectedMarketProfile(data.profile);
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

  const handleGenerateCampaignBrief = async () => {
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
          includeCommercialZips
        })
      });

      const data = await response.json();

      if (data.success) {
        setCampaignBrief(data.brief);
        setSuccessMessage('Campaign brief generated successfully!');
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
    // Check if already in comparison
    if (comparisonProfiles.some(p => p.name === market.name)) {
      setError('This market is already in the comparison');
      setSuccessMessage(null);
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Limit to 3 markets
    if (comparisonProfiles.length >= 3) {
      setError('Maximum 3 markets can be compared at once. Remove one to add another.');
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

      const data = await response.json();

      if (data.success) {
        setComparisonProfiles([...comparisonProfiles, data.profile]);
        setSuccessMessage(`${market.name} added to comparison! (${comparisonProfiles.length + 1}/3)`);
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
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
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
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-brand-gold" />
            <h1 className="text-3xl font-bold text-brand-charcoal">U.S. Market Insights</h1>
          </div>
          <p className="text-neutral-600">
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
          />
        </div>

        {/* Top Section: Top Market Identification */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-charcoal">
              Top Market Identification
            </h2>
            
            {/* Actions: Comparison Counter, View Mode Toggle & Export */}
            <div className="flex gap-2 items-center">
              {comparisonProfiles.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-2 border-blue-500 text-blue-700 rounded-lg font-medium">
                  <GitCompare className="w-4 h-4" />
                  <span className="text-sm">{comparisonProfiles.length} in comparison</span>
                </div>
              )}
              <button
                onClick={handleExportCSV}
                disabled={filteredMarkets.length === 0}
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all bg-neutral-100 text-neutral-600 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export top markets to CSV"
              >
                <Download className="w-4 h-4" />
                Export Markets
              </button>
              <button
                onClick={handleDownloadZipCodes}
                disabled={!selectedMetric}
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all bg-brand-gold text-white hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download top 5,000 ZIP codes for campaign targeting"
              >
                <Download className="w-4 h-4" />
                Top 5K ZIPs
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-brand-gold text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <List className="w-4 h-4" />
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'map'
                    ? 'bg-brand-gold text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <Map className="w-4 h-4" />
                Map View
              </button>
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
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-charcoal">
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
          />
        </div>

        {/* Bottom Section: Side-by-Side Market Comparison */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <GitCompare className="w-6 h-6 text-brand-gold" />
              <h2 className="text-xl font-bold text-brand-charcoal">
                Side-by-Side Market Comparison
              </h2>
            </div>
            <div className="text-sm text-neutral-600">
              {comparisonProfiles.length} / 3 markets selected
            </div>
          </div>
          
          {comparisonProfiles.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              💡 <strong>Tip:</strong> Click on any market in the Top Markets list to add it for comparison (max 3)
            </div>
          )}

          <MarketComparison
            profiles={comparisonProfiles}
            onRemoveMarket={handleRemoveFromComparison}
          />
        </div>
      </div>
    </div>
  );
}

