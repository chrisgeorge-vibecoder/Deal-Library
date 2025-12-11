'use client';

import { useState } from 'react';
import { MarketProfile as MarketProfileType } from '@/types/deal';
import StrategicSnapshotCard from './StrategicSnapshotCard';
import CampaignBriefModal from './CampaignBriefModal';
import { MapPin, Users, Bookmark, BookmarkCheck, Sparkles, ShoppingBag, TrendingUp, Star, GitCompare } from 'lucide-react';

// Google Product Taxonomy Level 1 Categories
// Reference: https://www.google.com/basepages/producttype/taxonomy.en-US.txt
const LEVEL1_CATEGORIES = [
  'All Categories',
  'Animals & Pet Supplies',
  'Apparel & Accessories',
  'Arts & Entertainment',
  'Baby & Toddler',
  'Business & Industrial',
  'Cameras & Optics',
  'Electronics',
  'Food, Beverages & Tobacco',
  'Furniture',
  'Hardware',
  'Health & Beauty',
  'Home & Garden',
  'Luggage & Bags',
  'Media',
  'Office Supplies',
  'Religious & Ceremonial',
  'Software',
  'Sporting Goods',
  'Toys & Games',
  'Vehicles & Parts',
  'General Merchandise'
];

// Alias for backwards compatibility with Campaign Brief
const PRODUCT_CATEGORIES = LEVEL1_CATEGORIES;

interface ShoppingProduct {
  segment: string;
  category: string;
  overIndex?: number;
}

interface SimilarMarket {
  name: string;
  population: number;
  similarityScore: number;
  keyAttributes: Array<{ name: string; formattedValue: string }>;
}

interface MarketProfileProps {
  profile: MarketProfileType | null;
  loading: boolean;
  onSave?: (profile: MarketProfileType) => void;
  onUnsave?: (profileId: string) => void;
  isSaved?: boolean;
  onGenerateCampaignBrief?: (category?: string) => void;
  generatingBrief?: boolean;
  campaignBrief?: any;
  onCloseCampaignBrief?: () => void;
  mostPopularProducts?: ShoppingProduct[];
  overIndexingProducts?: ShoppingProduct[];
  onViewShoppingProduct?: (segment: string) => void;
  commerceCategoryFilter?: string;
  onCommerceCategoryFilterChange?: (category: string) => void;
  loadingCommerceData?: boolean;
  onAddToComparison?: (market: { name: string; geoLevel: string; population: number }) => void;
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
  onCloseCampaignBrief,
  mostPopularProducts,
  overIndexingProducts,
  onViewShoppingProduct,
  commerceCategoryFilter = 'All Categories',
  onCommerceCategoryFilterChange,
  loadingCommerceData = false,
  onAddToComparison
}: MarketProfileProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  
  const handleSaveToggle = () => {
    if (!profile) return;
    
    if (isSaved && onUnsave) {
      const profileId = `market-profile-${profile.geoLevel}-${profile.name}`;
      onUnsave(profileId);
    } else if (onSave) {
      onSave(profile);
    }
  };

  // Handle Campaign Brief generation with category
  const handleGenerateBrief = () => {
    if (onGenerateCampaignBrief) {
      const category = selectedCategory === 'All Categories' ? undefined : selectedCategory;
      onGenerateCampaignBrief(category);
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

      {/* Campaign Brief Generator - Category Dropdown next to Generate Button */}
      {onGenerateCampaignBrief && (
        <div className="bg-gradient-to-r from-brand-gold/10 to-brand-gold/5 border border-brand-gold/30 rounded-lg p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-gold" />
              <span className="text-sm font-medium text-neutral-700">Campaign Brief</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Category Filter - directly next to Generate button */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-sm border border-brand-gold/30 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                disabled={generatingBrief}
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <button
                onClick={handleGenerateBrief}
                disabled={generatingBrief}
                className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                {generatingBrief ? 'Generating...' : 'Generate Campaign Brief'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Snapshot */}
      <StrategicSnapshotCard
        topStrengths={profile.strategicSnapshot.topStrengths}
        bottomConcerns={profile.strategicSnapshot.bottomConcerns}
        summary={profile.strategicSnapshot.summary}
        archetype={profile.strategicSnapshot.archetype}
        bestFor={profile.strategicSnapshot.bestFor}
        geographicHierarchy={profile.geographicHierarchy}
      />

      {/* Shopping Products - Two Distinct Lists */}
      {profile && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 border-b border-neutral-200 pb-2">
            <h3 className="text-lg font-semibold text-brand-charcoal flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-gold" />
              Commerce Audience Segments
            </h3>
            
            {/* Category Filter Dropdown */}
            {onCommerceCategoryFilterChange && (
              <div className="flex items-center gap-2">
                <label htmlFor="commerce-category-filter" className="text-sm text-neutral-600">
                  Filter by:
                </label>
                <select
                  id="commerce-category-filter"
                  value={commerceCategoryFilter}
                  onChange={(e) => onCommerceCategoryFilterChange(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                  disabled={loadingCommerceData}
                >
                  {LEVEL1_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {loadingCommerceData && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-gold"></div>
                )}
              </div>
            )}
          </div>
          
          {/* Show loading state */}
          {loadingCommerceData ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
            </div>
          ) : (mostPopularProducts && mostPopularProducts.length > 0) || (overIndexingProducts && overIndexingProducts.length > 0) ? (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Shopping Categories */}
            {mostPopularProducts && mostPopularProducts.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Top Shopping Categories
                </h4>
                <div className="space-y-2">
                  {mostPopularProducts.slice(0, 5).map((product, index) => (
                    <div 
                      key={index} 
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onViewShoppingProduct && onViewShoppingProduct(product.segment)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <h5 className="font-medium text-neutral-900 text-sm truncate">{product.segment}</h5>
                            <p className="text-xs text-neutral-500">{product.category}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Over-Indexing Products */}
            {overIndexingProducts && overIndexingProducts.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Highest Over-Indexing
                </h4>
                <div className="space-y-2">
                  {overIndexingProducts.slice(0, 5).map((product, index) => (
                    <div 
                      key={index} 
                      className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onViewShoppingProduct && onViewShoppingProduct(product.segment)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="flex items-center justify-center w-6 h-6 bg-amber-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <h5 className="font-medium text-neutral-900 text-sm truncate">{product.segment}</h5>
                            <p className="text-xs text-neutral-500">{product.category}</p>
                          </div>
                        </div>
                        {product.overIndex && (
                          <span className="ml-2 px-2 py-1 bg-amber-600 text-white text-xs font-medium rounded">
                            {product.overIndex.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <p className="mt-3 text-xs text-neutral-500 italic">
            🛍️ Click any segment to view detailed audience insights
          </p>
          </>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p className="text-sm">
                {commerceCategoryFilter !== 'All Categories' 
                  ? `No commerce segments found for "${commerceCategoryFilter}" in this market.`
                  : 'No commerce audience data available for this market.'}
              </p>
              {commerceCategoryFilter !== 'All Categories' && onCommerceCategoryFilterChange && (
                <button
                  onClick={() => onCommerceCategoryFilterChange('All Categories')}
                  className="mt-2 text-sm text-brand-gold hover:underline"
                >
                  View all categories
                </button>
              )}
            </div>
          )}
        </div>
      )}

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
            {profile.similarMarkets.map((similar: SimilarMarket, index: number) => (
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
                  {similar.keyAttributes.map((attr: { name: string; formattedValue: string }, attrIdx: number) => (
                    <div key={attrIdx} className="flex justify-between items-center text-xs">
                      <span className="text-neutral-700 font-medium">{attr.name}:</span>
                      <span className="text-brand-charcoal font-semibold">{attr.formattedValue}</span>
                    </div>
                  ))}
                </div>
                {/* Compare Button */}
                {onAddToComparison && (
                  <button
                    onClick={() => onAddToComparison({
                      name: similar.name,
                      geoLevel: profile.geoLevel,
                      population: similar.population
                    })}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-200 text-xs font-medium"
                    title="Add to comparison"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    Compare
                  </button>
                )}
              </div>
            ))}
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
