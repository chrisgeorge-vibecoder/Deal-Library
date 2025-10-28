'use client';

import { useState } from 'react';
import { TopMarket, GeographicLevel } from '@/types/deal';
import { MapPin, Star, GitCompare, Gem } from 'lucide-react';

interface TopMarketsListProps {
  markets: TopMarket[];
  geoLevel: GeographicLevel;
  onGeoLevelChange: (level: GeographicLevel) => void;
  onMarketClick: (market: TopMarket) => void;
  onAddToComparison?: (market: TopMarket) => void;
  loading: boolean;
}

export default function TopMarketsList({
  markets,
  geoLevel,
  onGeoLevelChange,
  onMarketClick,
  onAddToComparison,
  loading
}: TopMarketsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredMarkets = markets.filter(market =>
    market.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Search Filter */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search markets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-colors"
        />
      </div>

      {/* Markets List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">
              {searchTerm ? 'No markets match your search' : 'Select a metric to view top markets'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredMarkets.map((market) => (
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
                        <Gem className="w-3.5 h-3.5 text-purple-600" title="Hidden Gem" />
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
                    className="px-2 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-200 flex-shrink-0"
                    title="Add to comparison"
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

