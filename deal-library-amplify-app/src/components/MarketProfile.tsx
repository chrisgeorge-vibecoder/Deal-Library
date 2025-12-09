'use client';

import { useState } from 'react';
import { MarketProfile as MarketProfileType } from '@/types/deal';
import StrategicSnapshotCard from './StrategicSnapshotCard';
import CampaignBriefModal from './CampaignBriefModal';
import { MapPin, Users, Bookmark, BookmarkCheck, Sparkles } from 'lucide-react';

interface MarketProfileProps {
  profile: MarketProfileType | null;
  loading: boolean;
  onSave?: (profile: MarketProfileType) => void;
  onUnsave?: (profileId: string) => void;
  isSaved?: boolean;
  onGenerateCampaignBrief?: () => void;
  generatingBrief?: boolean;
  campaignBrief?: any;
  onCloseCampaignBrief?: () => void;
}

export default function MarketProfile({ 
  profile, 
  loading, 
  onSave, 
  onUnsave, 
  isSaved,
  onGenerateCampaignBrief,
  generatingBrief,
  campaignBrief,
  onCloseCampaignBrief
}: MarketProfileProps) {
  const handleSaveToggle = () => {
    if (!profile) return;
    
    if (isSaved && onUnsave) {
      const profileId = `market-profile-${profile.geoLevel}-${profile.name}`;
      onUnsave(profileId);
    } else if (onSave) {
      onSave(profile);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-neutral-700 mb-2">
          Select a Market
        </h3>
        <p className="text-neutral-600">
          Click on any market from the left panel to view its detailed profile
        </p>
      </div>
    );
  }

  // Debug: Log the similar markets data
  if (profile.similarMarkets && profile.similarMarkets.length > 0) {
    console.log('📊 Market Profile Similar Markets Data:');
    console.log('   Profile:', profile.name);
    console.log('   Similar Markets:', profile.similarMarkets);
    profile.similarMarkets.forEach((sm, idx) => {
      console.log(`   ${idx + 1}. ${sm.name}: ${sm.similarityScore} (type: ${typeof sm.similarityScore})`);
    });
  }

  // Group attributes by category
  const attributesByCategory = profile.attributes.reduce((acc, attr) => {
    if (!acc[attr.category]) {
      acc[attr.category] = [];
    }
    acc[attr.category].push(attr);
    return acc;
  }, {} as Record<string, typeof profile.attributes>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-2xl font-bold text-brand-charcoal">
            {profile.name}
          </h2>
          <div className="flex items-center gap-2">
            {onGenerateCampaignBrief && (
              <button
                onClick={onGenerateCampaignBrief}
                disabled={generatingBrief}
                className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {generatingBrief ? 'Generating...' : 'Generate Campaign Brief'}
              </button>
            )}
            {onSave && (
              <button
                onClick={handleSaveToggle}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title={isSaved ? 'Remove from saved cards' : 'Save to cards'}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-5 h-5 text-blue-600" />
                ) : (
                  <Bookmark className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                )}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-neutral-600">
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {profile.geoLevel.toUpperCase()}
          </span>
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Population: {profile.population.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Strategic Snapshot */}
      <StrategicSnapshotCard
        topStrengths={profile.strategicSnapshot.topStrengths}
        bottomConcerns={profile.strategicSnapshot.bottomConcerns}
        summary={profile.strategicSnapshot.summary}
        archetype={profile.strategicSnapshot.archetype}
        bestFor={profile.strategicSnapshot.bestFor}
        geographicHierarchy={profile.geographicHierarchy}
      />

      {/* Market Attributes by Category */}
      <div className="space-y-6">
        {Object.entries(attributesByCategory).map(([category, attributes]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-brand-charcoal mb-3 border-b border-neutral-200 pb-2">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attributes.map((attr, index) => {
                const isPositive = attr.percentDifference > 0;
                const isSignificant = Math.abs(attr.percentDifference) > 10;
                const isPopulation = attr.name === 'Total Population';

                return (
                  <div
                    key={index}
                    className={`bg-white border rounded-lg p-4 ${
                      isSignificant && !isPopulation
                        ? isPositive
                          ? 'border-green-200 bg-green-50/50'
                          : 'border-red-200 bg-red-50/50'
                        : 'border-neutral-200'
                    }`}
                  >
                    <div className="text-sm font-medium text-neutral-700 mb-1">
                      {attr.name}
                    </div>
                    <div className="text-2xl font-bold text-brand-charcoal mb-2">
                      {attr.formattedValue}
                    </div>
                    {!isPopulation && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-600">
                          National Avg: {typeof attr.nationalAverage === 'number' 
                            ? attr.format === 'percentage' 
                              ? `${attr.nationalAverage.toFixed(1)}%`
                              : attr.format === 'currency'
                              ? `$${Math.round(attr.nationalAverage).toLocaleString()}`
                              : attr.nationalAverage.toFixed(1)
                            : 'N/A'}
                        </span>
                        <span
                          className={`font-semibold ${
                            isPositive
                              ? 'text-green-700'
                              : attr.percentDifference < 0
                              ? 'text-red-700'
                              : 'text-neutral-600'
                          }`}
                        >
                          {attr.percentDifference > 0 ? '+' : ''}
                          {attr.percentDifference.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {isPopulation && typeof attr.nationalAverage === 'number' && attr.nationalAverage > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-600">
                          % of U.S. Population
                        </span>
                        <span className="font-semibold text-blue-700">
                          {((attr.value / attr.nationalAverage) * 100).toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Similar Markets */}
      {profile.similarMarkets && profile.similarMarkets.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-brand-charcoal mb-4 border-b border-neutral-200 pb-2">
            Similar Markets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.similarMarkets.map((similar, index) => {
              // Debug logging for similarity scores
              console.log(`🔍 Similar Market ${index + 1}:`, similar.name);
              console.log(`   similarityScore value:`, similar.similarityScore);
              console.log(`   Type:`, typeof similar.similarityScore);
              console.log(`   Displayed as:`, `${similar.similarityScore}% match`);
              
              return (
                <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-brand-charcoal text-sm">{similar.name}</h4>
                    <span className="inline-block px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded">
                      {similar.similarityScore}% match
                    </span>
                  </div>
                <div className="text-xs text-neutral-600 mb-3">
                  Population: {similar.population.toLocaleString()}
                </div>
                <div className="space-y-2">
                  {similar.keyAttributes.map((attr, attrIdx) => (
                    <div key={attrIdx} className="flex justify-between items-center text-xs">
                      <span className="text-neutral-700 font-medium">{attr.name}:</span>
                      <span className="text-brand-charcoal font-semibold">{attr.formattedValue}</span>
                    </div>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-neutral-600 italic">
            💡 These markets share similar demographic and economic characteristics based on cosine similarity analysis.
          </div>
        </div>
      )}

      {/* Campaign Brief Modal */}
      {campaignBrief && onCloseCampaignBrief && (
        <CampaignBriefModal
          brief={campaignBrief}
          marketName={profile.name}
          marketGeoLevel={profile.geoLevel}
          onClose={onCloseCampaignBrief}
          onSave={onSave as any}
          onUnsave={onUnsave}
          isSaved={isSaved}
        />
      )}
    </div>
  );
}

