import { X, Target, ShoppingBag, Info, ShoppingCart, Trash2 } from 'lucide-react';
import { AudienceSegment } from '@/types/audience';

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
  if (!isOpen || !segment) return null;

  const isCommerceAudience = segment.segmentType === 'Commerce Audience';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
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
                  <h2 className="text-2xl font-bold text-neutral-900">
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
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-4 text-center">
                <div className="text-sm text-neutral-600 mb-1">CPM</div>
                <div className="text-2xl font-bold text-neutral-900">
                  ${segment.cpm.toFixed(2)}
                </div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-sm text-neutral-600 mb-1">Media Cost</div>
                <div className="text-2xl font-bold text-neutral-900">
                  {(segment.mediaPercentCost * 100).toFixed(0)}%
                </div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-sm text-neutral-600 mb-1">Status</div>
                <div className={`text-lg font-bold ${
                  segment.activelyGenerated ? 'text-green-600' : 'text-neutral-400'
                }`}>
                  {segment.activelyGenerated ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

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
              <div className="grid grid-cols-2 gap-4">
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
