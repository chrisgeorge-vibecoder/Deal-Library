'use client';

import { useState, useEffect, useCallback } from 'react';
import { TopMarket, GeographicLevel } from '@/types/deal';
import { MapPin, Star, GitCompare, Gem, Search, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface TopMarketsListProps {
  markets: TopMarket[];
  geoLevel: GeographicLevel;
  onGeoLevelChange: (level: GeographicLevel) => void;
  onMarketClick: (market: TopMarket) => void;
  onAddToComparison?: (market: TopMarket) => void;
  loading: boolean;
  includeCommercialZips?: boolean;
  comparisonMarketNames?: string[];
}

export default function TopMarketsList({
  markets,
  geoLevel,
  onGeoLevelChange,
  onMarketClick,
  onAddToComparison,
  loading,
  includeCommercialZips = false,
  comparisonMarketNames = []
}: TopMarketsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<TopMarket[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const geoLevels: { value: GeographicLevel; label: string }[] = [
    { value: 'region', label: 'Region' },
    { value: 'state', label: 'State' },
    { value: 'cbsa', label: 'Metro Area (CBSA)' },
    { value: 'county', label: 'County' },
    { value: 'city', label: 'City' },
    { value: 'zip', label: 'ZIP Code' }
  ];

  const getTierColor = (tier?: string): string => {
    switch (tier) {
      case 'Gold': return 'text-yellow-500';
      case 'Silver': return 'text-gray-400';
      case 'Bronze': return 'text-amber-600';
      default: return 'text-neutral-400';
    }
  };

  // Debounced search function
  const searchAllMarkets = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearchMode(false);
      return;
    }

    setIsSearching(true);
    setIsSearchMode(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/market-insights/search-markets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          geoLevel,
          limit: 50,
          includeCommercialZips
        })
      });

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.markets);
      }
    } catch (err) {
      console.error('Error searching markets:', err);
    } finally {
      setIsSearching(false);
    }
  }, [geoLevel, includeCommercialZips]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchAllMarkets(searchTerm);
      } else {
        setSearchResults([]);
        setIsSearchMode(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchAllMarkets]);

  // Reset search when geo level changes
  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchAllMarkets(searchTerm);
    }
  }, [geoLevel]);

  // Determine which markets to display
  const displayMarkets = isSearchMode ? searchResults : markets;

  return (
    <div className="flex flex-col h-full">
      {/* Geographic Level Tabs */}
      <div className="border-b border-neutral-200 mb-4">
        <div className="flex flex-wrap gap-1">
          {geoLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => onGeoLevelChange(level.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                geoLevel === level.value
                  ? 'border-b-2 border-brand-gold text-brand-charcoal'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter - Searches ALL markets */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search all markets (type 2+ chars)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-colors"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-gold animate-spin" />
          )}
        </div>
        {isSearchMode && (
          <p className="text-xs text-brand-gold mt-1">
            🔍 Searching all {geoLevel === 'cbsa' ? 'metro areas' : geoLevel + 's'} — {searchResults.length} results
          </p>
        )}
      </div>

      {/* Markets List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
          </div>
        ) : displayMarkets.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">
              {searchTerm ? 'No markets match your search' : 'Select a metric to view top markets'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {displayMarkets.map((market) => (
              <div
                key={`${market.name}-${market.rank}`}
                className="flex items-center gap-2"
              >
                <button
                  onClick={() => onMarketClick(market)}
                  className="flex-1 text-left px-3 py-2 bg-white border border-neutral-200 rounded-lg hover:border-brand-gold hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <span className="flex items-center justify-center w-6 h-6 bg-brand-gold/10 text-brand-charcoal font-semibold rounded text-xs flex-shrink-0">
                      {market.rank}
                    </span>
                    
                    {/* Market Name */}
                    <h3 className="font-semibold text-neutral-900 text-sm truncate flex-shrink min-w-0">
                      {market.name}
                    </h3>
                    
                    {/* Metric Value */}
                    <span className="text-sm text-neutral-700 flex-shrink-0">
                      {market.formattedValue}
                    </span>
                    
                    {/* Population */}
                    <span className="text-xs text-neutral-500 flex-shrink-0">
                      {(market.population / 1000000) >= 1 
                        ? `${(market.population / 1000000).toFixed(1)}M` 
                        : (market.population / 1000) >= 1 
                          ? `${Math.round(market.population / 1000)}K`
                          : market.population.toLocaleString()
                      }
                    </span>
                    
                    {/* Opportunity Score & Tier */}
                    {market.opportunityScore !== undefined && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className={`w-3.5 h-3.5 ${getTierColor(market.tier)}`} fill="currentColor" />
                        <span className="text-xs font-medium text-neutral-700">{market.opportunityScore}</span>
                      </div>
                    )}
                    
                    {/* Compact badges */}
                    <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                      {market.hiddenGem && (
                        <Gem className="w-3.5 h-3.5 text-purple-600" />
                      )}
                    </div>
                  </div>
                </button>
                
                {onAddToComparison && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToComparison(market);
                    }}
                    className={`px-2 py-2 border-2 border-blue-500 rounded-lg transition-all duration-200 flex-shrink-0 ${
                      comparisonMarketNames.includes(market.name)
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-blue-600 hover:bg-blue-500 hover:text-white'
                    }`}
                    title={comparisonMarketNames.includes(market.name) ? "In comparison" : "Add to comparison"}
                  >
                    <GitCompare className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

