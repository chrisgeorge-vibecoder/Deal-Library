'use client';

import React from 'react';
import { MarketProfile } from '@/types/deal';
import { X, TrendingUp, TrendingDown, Star } from 'lucide-react';

interface MarketComparisonProps {
  profiles: MarketProfile[];
  onRemoveMarket: (marketName: string) => void;
  primaryMarket?: MarketProfile | null;
}

export default function MarketComparison({ profiles, onRemoveMarket, primaryMarket }: MarketComparisonProps) {
  // Combine primary market with additional profiles
  const allProfiles = primaryMarket 
    ? [primaryMarket, ...profiles.filter(p => p.name !== primaryMarket.name)]
    : profiles;

  if (allProfiles.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <p className="text-lg font-medium">No market selected</p>
        <p className="text-sm mt-2">Select a market from the list above to view its profile, then add up to 2 more markets for comparison</p>
      </div>
    );
  }

  // If only the primary market exists with no additional markets
  if (allProfiles.length === 1 && primaryMarket) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <p className="text-lg font-medium">Add markets to compare with {primaryMarket.name}</p>
        <p className="text-sm mt-2">Click the Compare button on any market in the Top Markets list or Similar Markets section to add it for comparison (up to 2)</p>
      </div>
    );
  }

  // Format value based on attribute format
  const formatValue = (value: number | undefined, format: string): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A';
    }
    
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  // Get tier color
  const getTierColor = (tier?: string): string => {
    switch (tier?.toLowerCase()) {
      case 'gold': return 'text-yellow-600';
      case 'silver': return 'text-gray-500';
      case 'bronze': return 'text-orange-700';
      default: return 'text-gray-400';
    }
  };

  // Get all unique categories from all profiles
  const allCategories = new Set<string>();
  allProfiles.forEach(profile => {
    profile.attributes.forEach(attr => allCategories.add(attr.category));
  });
  const categories = Array.from(allCategories);

  // Get attributes by category from a profile
  const getAttributesByCategory = (profile: MarketProfile, category: string) => {
    return profile.attributes.filter(attr => attr.category === category);
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${allProfiles.length}, 1fr)` }}>
        {allProfiles.map((profile, index) => {
          const isPrimary = primaryMarket && profile.name === primaryMarket.name;
          return (
            <div 
              key={profile.name} 
              className={`rounded-lg p-6 relative border ${
                isPrimary 
                  ? 'bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 border-brand-gold/50' 
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
              }`}
            >
              {/* Primary Badge or Remove Button */}
              {isPrimary ? (
                <span className="absolute top-3 right-3 px-2 py-1 bg-brand-gold text-white text-xs font-semibold rounded">
                  Primary
                </span>
              ) : (
                <button
                  onClick={() => onRemoveMarket(profile.name)}
                  className="absolute top-3 right-3 p-1 rounded-full bg-white hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                  title="Remove from comparison"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Market Name and Location */}
              <div className="mb-4 pr-16">
                <h3 className="text-xl font-bold text-brand-charcoal mb-1">{profile.name}</h3>
                <p className="text-sm text-neutral-600">
                  {profile.geoLevel.charAt(0).toUpperCase() + profile.geoLevel.slice(1)}
                </p>
                <p className="text-sm text-neutral-600 mt-1">
                  Population: {profile.population.toLocaleString()}
                </p>
              </div>

              {/* Opportunity Score */}
              {(profile.strategicSnapshot.topStrengths[0] as any)?.opportunityScore && (
                <div className={`flex items-center gap-2 mt-3 pt-3 border-t ${isPrimary ? 'border-brand-gold/30' : 'border-blue-200'}`}>
                  <Star className={`w-5 h-5 ${getTierColor((profile.strategicSnapshot.topStrengths[0] as any)?.tier)}`} fill="currentColor" />
                  <div>
                    <div className="text-sm font-semibold text-neutral-700">
                      Score: {(profile.strategicSnapshot.topStrengths[0] as any)?.opportunityScore ? (profile.strategicSnapshot.topStrengths[0] as any).opportunityScore.toFixed(0) : 'N/A'}
                    </div>
                    <div className="text-xs text-neutral-600">
                      {(profile.strategicSnapshot.topStrengths[0] as any)?.tier || 'N/A'} Tier
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Table by Category */}
      {categories.map((category) => {
        // Get all attributes for this category across all profiles
        const categoryAttributes = allProfiles[0].attributes.filter(attr => attr.category === category);
        
        if (categoryAttributes.length === 0) return null;

        return (
          <div key={category} className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200">
              <h4 className="font-semibold text-brand-charcoal">{category}</h4>
            </div>
            
            <div className="divide-y divide-neutral-200">
              {categoryAttributes.map((attr) => {
                // Find this attribute in each profile
                const values = allProfiles.map(profile => {
                  const matchingAttr = profile.attributes.find(a => a.name === attr.name);
                  return matchingAttr || null;
                });

                return (
                  <div key={attr.name} className="grid gap-4 p-4" style={{ gridTemplateColumns: `200px repeat(${allProfiles.length}, 1fr)` }}>
                    {/* Attribute Name */}
                    <div className="font-medium text-neutral-700 flex items-center">
                      {attr.name}
                    </div>

                    {/* Values for Each Profile */}
                    {values.map((value, idx) => {
                      if (!value) {
                        return <div key={idx} className="text-neutral-400 text-sm">N/A</div>;
                      }

                      const diff = (value as any).differenceFromNational;
                      const isPositive = diff > 0;
                      
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div>
                            <div className="font-semibold text-neutral-900">
                              {formatValue(value.value, value.format)}
                            </div>
                            <div className={`text-xs flex items-center gap-1 ${
                              isPositive ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-neutral-500'
                            }`}>
                              {diff !== 0 && diff !== undefined && !isNaN(diff) && (
                                <>
                                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {Math.abs(diff).toFixed(1)}% vs national
                                </>
                              )}
                              {diff === 0 && '= national avg'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Strategic Snapshots Comparison */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200">
          <h4 className="font-semibold text-brand-charcoal">Strategic Insights</h4>
        </div>
        
        <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${allProfiles.length}, 1fr)` }}>
          {allProfiles.map((profile) => (
            <div key={profile.name} className="space-y-4">
              {/* Market Archetype */}
              {profile.strategicSnapshot.archetype && (
                <div>
                  <h5 className="text-sm font-semibold text-neutral-700 mb-1">Market Type</h5>
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    {profile.strategicSnapshot.archetype}
                  </span>
                </div>
              )}

              {/* Over-Index */}
              <div>
                <h5 className="text-sm font-semibold text-green-700 mb-2">Over-Index</h5>
                <ul className="space-y-1">
                  {profile.strategicSnapshot.topStrengths.slice(0, 3).map((strength, idx) => (
                    <li key={idx} className="text-xs text-neutral-700 flex items-start gap-1">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{strength.attribute}: {(strength as any).differenceFromNational !== undefined && !isNaN((strength as any).differenceFromNational) ? `${(strength as any).differenceFromNational > 0 ? '+' : ''}${(strength as any).differenceFromNational.toFixed(1)}%` : 'N/A'}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Under-Index */}
              <div>
                <h5 className="text-sm font-semibold text-orange-700 mb-2">Under-Index</h5>
                <ul className="space-y-1">
                  {profile.strategicSnapshot.bottomConcerns.slice(0, 3).map((concern, idx) => (
                    <li key={idx} className="text-xs text-neutral-700 flex items-start gap-1">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <span>{concern.attribute}: {(concern as any).differenceFromNational !== undefined && !isNaN((concern as any).differenceFromNational) ? `${(concern as any).differenceFromNational > 0 ? '+' : ''}${(concern as any).differenceFromNational.toFixed(1)}%` : 'N/A'}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Best For */}
              {profile.strategicSnapshot.bestFor && profile.strategicSnapshot.bestFor.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-blue-700 mb-2">Best For</h5>
                  <div className="flex flex-wrap gap-1">
                    {profile.strategicSnapshot.bestFor.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

