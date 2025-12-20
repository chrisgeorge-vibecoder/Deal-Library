import { X, Target, ShoppingBag, Info, ShoppingCart, Trash2, TrendingUp, Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import { AudienceSegment } from '@/types/audience';
import { useState, useEffect } from 'react';

interface MarketIntelligencePack {
  segmentId: string;
  segmentName: string;
  fullPath: string;
  category: string;
  generatedAt: string;
  detailedInsight: string;
  exampleAdvertisers: Array<{
    name: string;
    type: "brand" | "category";
    rationale: string;
  }>;
  currentTrends: Array<{
    trend: string;
    relevance: string;
    timeframe: "2025" | "2026";
  }>;
  strategicHook: {
    headline: string;
    emotionalDriver: string;
    callToAction: string;
  };
}

interface AudienceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment: AudienceSegment | null;
  onAddToCart: (segment: AudienceSegment) => void;
  onRemoveFromCart: (segmentId: string) => void;
  isInCart: (segmentId: string) => boolean;
}

export default function AudienceDetailModal({
  isOpen,
  onClose,
  segment,
  onAddToCart,
  onRemoveFromCart,
  isInCart
}: AudienceDetailModalProps) {
  const [enrichedData, setEnrichedData] = useState<MarketIntelligencePack | null>(null);
  const [loadingEnriched, setLoadingEnriched] = useState(false);
  const [enrichedError, setEnrichedError] = useState<string | null>(null);

  // Load enriched data when segment changes
  useEffect(() => {
    if (!isOpen || !segment) {
      setEnrichedData(null);
      setEnrichedError(null);
      return;
    }

    const loadEnrichedData = async () => {
      setLoadingEnriched(true);
      setEnrichedError(null);
      
      try {
        const response = await fetch(`/api/audiences/enriched?segmentId=${segment.sovrnSegmentId}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setEnrichedData(result.data);
          } else {
            setEnrichedError('Enriched data not available for this segment');
          }
        } else if (response.status === 404) {
          setEnrichedError('Enriched data not available for this segment');
        } else {
          setEnrichedError('Failed to load enriched data');
        }
      } catch (error) {
        console.error('Error loading enriched data:', error);
        setEnrichedError('Failed to load enriched data');
      } finally {
        setLoadingEnriched(false);
      }
    };

    loadEnrichedData();
  }, [isOpen, segment]);

  if (!isOpen || !segment) return null;

  const isCommerceAudience = segment.segmentType === 'Commerce Audience';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white w-full h-full sm:h-auto sm:rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className={`sticky top-0 z-10 bg-white border-b px-6 py-4 ${
            isCommerceAudience 
              ? 'border-l-4 border-brand-gold bg-gradient-to-r from-brand-gold/5 to-transparent' 
              : ''
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {isCommerceAudience ? (
                    <ShoppingBag className="w-6 h-6 text-brand-gold" />
                  ) : (
                    <Target className="w-6 h-6 text-brand-orange" />
                  )}
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900">
                    {segment.segmentName}
                  </h2>
                </div>
                <p className="text-sm text-neutral-600 font-medium">
                  {segment.fullPath}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div className="card p-6">
              <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-brand-orange" />
                Description
              </h3>
              <p className="text-neutral-700 leading-relaxed">
                {segment.segmentDescription}
              </p>
            </div>

            {/* Segment Details */}
            <div className="card p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Segment Details</h3>
              <div className="grid grid-cols-2 gap-0 sm:p-4">
                <div>
                  <div className="text-sm text-neutral-600 mb-1">Segment ID</div>
                  <div className="font-mono text-sm text-neutral-900">{segment.sovrnSegmentId}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600 mb-1">Segment Type</div>
                  <div className="text-sm text-neutral-900">
                    <span className={`px-2 py-1 rounded ${
                      isCommerceAudience 
                        ? 'bg-brand-gold/20 text-brand-gold' 
                        : 'bg-brand-orange/20 text-brand-orange'
                    }`}>
                      {segment.segmentType}
                    </span>
                  </div>
                </div>
                {segment.sovrnParentSegmentId && segment.sovrnParentSegmentId !== '0' && (
                  <div>
                    <div className="text-sm text-neutral-600 mb-1">Parent Segment ID</div>
                    <div className="font-mono text-sm text-neutral-900">{segment.sovrnParentSegmentId}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-neutral-600 mb-1">Tier Number</div>
                  <div className="text-sm text-neutral-900">{segment.tierNumber}</div>
                </div>
              </div>
            </div>

            {/* Category Hierarchy */}
            <div className="card p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Category Hierarchy</h3>
              <div className="space-y-2">
                {segment.tier1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600 w-16">Tier 1:</span>
                    <span className="text-sm text-neutral-900 font-medium">{segment.tier1}</span>
                  </div>
                )}
                {segment.tier2 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600 w-16">Tier 2:</span>
                    <span className="text-sm text-neutral-900 font-medium">{segment.tier2}</span>
                  </div>
                )}
                {segment.tier3 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600 w-16">Tier 3:</span>
                    <span className="text-sm text-neutral-900 font-medium">{segment.tier3}</span>
                  </div>
                )}
                {segment.tier4 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600 w-16">Tier 4:</span>
                    <span className="text-sm text-neutral-900 font-medium">{segment.tier4}</span>
                  </div>
                )}
                {segment.tier5 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600 w-16">Tier 5:</span>
                    <span className="text-sm text-neutral-900 font-medium">{segment.tier5}</span>
                  </div>
                )}
                {segment.tier6 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600 w-16">Tier 6:</span>
                    <span className="text-sm text-neutral-900 font-medium">{segment.tier6}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Full Path */}
            <div className="card p-6 bg-neutral-50">
              <h3 className="font-semibold text-neutral-900 mb-2">Full Path</h3>
              <p className="text-sm text-neutral-700 font-mono break-all">
                {segment.fullPath}
              </p>
            </div>

            {/* Market Intelligence Pack */}
            {loadingEnriched && (
              <div className="card p-6">
                <div className="flex items-center gap-3 text-neutral-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading market intelligence...</span>
                </div>
              </div>
            )}

            {enrichedData && !loadingEnriched && (
              <div className="space-y-6">
                {/* Detailed Insight */}
                <div className="card p-6 bg-gradient-to-br from-brand-gold/5 to-transparent border-l-4 border-brand-gold">
                  <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-brand-gold" />
                    Market Intelligence Insight
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    {enrichedData.detailedInsight}
                  </p>
                </div>

                {/* Example Advertisers */}
                {enrichedData.exampleAdvertisers && enrichedData.exampleAdvertisers.length > 0 && (
                  <div className="card p-6">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-brand-orange" />
                      Example Advertisers
                    </h3>
                    <div className="space-y-4">
                      {enrichedData.exampleAdvertisers.map((advertiser, index) => (
                        <div key={index} className="border-l-4 border-neutral-200 pl-4 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-neutral-900">{advertiser.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              advertiser.type === 'brand' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {advertiser.type}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600">{advertiser.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Trends */}
                {enrichedData.currentTrends && enrichedData.currentTrends.length > 0 && (
                  <div className="card p-6">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-brand-orange" />
                      Current Trends (2025-2026)
                    </h3>
                    <div className="space-y-4">
                      {enrichedData.currentTrends.map((trend, index) => (
                        <div key={index} className="border-l-4 border-brand-orange pl-4 py-2">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold px-2 py-1 bg-brand-orange/10 text-brand-orange rounded">
                              {trend.timeframe}
                            </span>
                          </div>
                          <p className="font-medium text-neutral-900 mb-2">{trend.trend}</p>
                          <p className="text-sm text-neutral-600">{trend.relevance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategic Hook */}
                {enrichedData.strategicHook && (
                  <div className="card p-6 bg-gradient-to-br from-brand-gold/10 to-transparent border-l-4 border-brand-gold">
                    <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-brand-gold" />
                      Strategic Messaging Hook
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-neutral-600 mb-1">Headline</div>
                        <p className="font-semibold text-neutral-900 text-lg">{enrichedData.strategicHook.headline}</p>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-600 mb-1">Emotional Driver</div>
                        <p className="text-neutral-700">{enrichedData.strategicHook.emotionalDriver}</p>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-600 mb-1">Call to Action</div>
                        <p className="text-neutral-700 font-medium">{enrichedData.strategicHook.callToAction}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {enrichedError && !loadingEnriched && (
              <div className="card p-4 bg-neutral-50 border border-neutral-200">
                <p className="text-sm text-neutral-500 italic">{enrichedError}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-end gap-3">
            {isInCart(segment.sovrnSegmentId) ? (
              <button
                onClick={() => onRemoveFromCart(segment.sovrnSegmentId)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove from Cart
              </button>
            ) : (
              <button
                onClick={() => onAddToCart(segment)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-gold/10 text-brand-charcoal hover:bg-brand-gold/20 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
