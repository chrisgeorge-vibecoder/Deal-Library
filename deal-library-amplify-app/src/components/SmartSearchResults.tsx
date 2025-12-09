'use client';

import { AudienceSegment, CategorizedSearchResults, EnrichedAudienceCard } from '@/types/audience';
import { ShoppingCart, Trash2, MapPin, TrendingUp } from 'lucide-react';
import { formatScale } from '@/utils/formatters';

interface SmartSearchResultsProps {
  results: CategorizedSearchResults;
  onAudienceClick: (segment: AudienceSegment) => void;
  onAddToCart: (segment: AudienceSegment) => void;
  onRemoveFromCart: (segmentId: string) => void;
  isInCart: (segmentId: string) => boolean;
}

export default function SmartSearchResults({
  results,
  onAudienceClick,
  onAddToCart,
  onRemoveFromCart,
  isInCart
}: SmartSearchResultsProps) {

  const renderEnrichedCard = (enrichedCard: EnrichedAudienceCard) => {
    const { segment, strategicHook, commerceInsights, geographicInsights } = enrichedCard;
    const inCart = isInCart(segment.sovrnSegmentId);

    return (
      <div
        key={segment.sovrnSegmentId}
        className="card p-5 hover:shadow-sovrn-lg transition-all duration-200 group cursor-pointer"
        onClick={() => onAudienceClick(segment)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
            {segment.segmentName}
          </h4>
          {segment.activelyGenerated && (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Active
            </span>
          )}
        </div>

        {/* Strategic Hook */}
        {strategicHook && (
          <div className="mb-3 p-3 bg-brand-gold/10 rounded-lg border border-brand-gold/20">
            <p className="text-sm text-brand-charcoal font-medium">
              {strategicHook}
            </p>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-neutral-600 mb-3 leading-relaxed">
          {segment.segmentDescription}
        </p>

        {/* Full Path */}
        <div className="text-xs text-neutral-500 mb-3">
          {segment.fullPath}
        </div>

        {/* Commerce Insights */}
        {commerceInsights && commerceInsights.length > 0 && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-900 mb-1">Purchase Intent</p>
                <p className="text-xs text-blue-700">
                  {commerceInsights[0].insight}
                </p>
                {commerceInsights[0].crossPurchases && commerceInsights[0].crossPurchases.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-blue-600">
                      Also shops: {commerceInsights[0].crossPurchases.slice(0, 2).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Geographic Insights */}
        {geographicInsights && geographicInsights.length > 0 && (
          <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-purple-900 mb-1">Top Markets</p>
                <div className="space-y-1">
                  {geographicInsights.slice(0, 3).map((geo, idx) => (
                    <div key={idx} className="text-xs text-purple-700">
                      {geo.cbsaName} <span className="text-purple-500">({geo.overIndex}% over-index)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
            ${segment.cpm.toFixed(2)} CPM
          </span>
          <span className="inline-flex items-center px-2 py-1 bg-secondary-100 text-secondary-800 text-xs font-medium rounded-full">
            {(segment.mediaPercentCost * 100).toFixed(0)}% Media Cost
          </span>
          {segment.scale7DayUS && (
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {formatScale(segment.scale7DayUS)} reach
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <div className="pt-4 border-t border-neutral-200">
          {inCart ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromCart(segment.sovrnSegmentId);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Remove from Cart
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(segment);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-gold/10 text-brand-charcoal hover:bg-brand-gold/20 rounded-lg transition-colors text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8">
      {/* Query Display */}
      <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-lg p-4">
        <p className="text-sm text-brand-charcoal">
          <span className="font-medium">Smart search results for:</span> "{results.query}"
        </p>
        <p className="text-xs text-neutral-600 mt-1">
          Found {results.totalFound} relevant audience segments
        </p>
      </div>

      {/* Best Fit Section */}
      {results.bestFit && results.bestFit.length > 0 && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full">
                ✓
              </span>
              Best Fit
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              Top recommended audiences that closely match your campaign goals
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.bestFit.map(enrichedCard => renderEnrichedCard(enrichedCard))}
          </div>
        </div>
      )}

      {/* High Value Section */}
      {results.highValue && results.highValue.length > 0 && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full">
                ★
              </span>
              High Value
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              Strong alternatives with good targeting potential
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.highValue.map(enrichedCard => renderEnrichedCard(enrichedCard))}
          </div>
        </div>
      )}

      {/* Related Section */}
      {results.related && results.related.length > 0 && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-500 text-white text-xs font-bold rounded-full">
                ~
              </span>
              Related Segments
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              Additional audiences you might want to consider
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.related.map(enrichedCard => renderEnrichedCard(enrichedCard))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!results.bestFit || results.bestFit.length === 0) &&
       (!results.highValue || results.highValue.length === 0) &&
       (!results.related || results.related.length === 0) && (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-2">No matching audiences found</p>
          <p className="text-sm text-neutral-400">Try adjusting your search query</p>
        </div>
      )}
    </div>
  );
}










